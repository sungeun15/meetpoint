import "server-only";

import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

// PRD 기준 인증 쿠키 이름과 만료 시간을 공통 상수로 고정한다.
export const AUTH_COOKIE_NAME = "meetpoint_auth";
export const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const AUTH_JWT_ALGORITHM = "HS256";
const AUTH_JWT_EXPIRES_IN = "7d";

// JWT에서 꺼낸 현재 로그인 사용자 정보 구조다.
export type AuthSession = {
    userId: string;
    nickname: string;
    iat: number;
    exp: number;
};

// 세션이 없는 이유가 단순 미로그인인지, 깨진 쿠키 정리가 필요한 상황인지 함께 전달한다.
export type CurrentSessionLookup = {
    session: AuthSession | null;
    shouldClearCookie: boolean;
};

type AuthTokenInput = {
    userId: string;
    nickname: string;
};

// JWT 생성과 검증에서 같은 비밀값을 재사용하도록 환경 변수 접근을 한곳에 모은다.
function getJwtSecret() {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not set");
    }

    return new TextEncoder().encode(secret);
}

// 로그인 또는 회원가입 성공 시 userId/nickname 기준 JWT를 발급한다.
export async function createAuthToken(payload: AuthTokenInput) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: AUTH_JWT_ALGORITHM, typ: "JWT" })
        .setIssuedAt()
        .setExpirationTime(AUTH_JWT_EXPIRES_IN)
        .sign(getJwtSecret());
}

// 토큰 서명과 payload 형태를 함께 검증해 보호 API가 신뢰할 수 있는 세션만 통과시킨다.
export async function verifyAuthToken(token: string): Promise<AuthSession> {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
        algorithms: [AUTH_JWT_ALGORITHM],
    });

    if (
        typeof payload.userId !== "string" ||
        typeof payload.nickname !== "string" ||
        typeof payload.iat !== "number" ||
        typeof payload.exp !== "number"
    ) {
        throw new Error("Invalid auth token payload");
    }

    return {
        userId: payload.userId,
        nickname: payload.nickname,
        iat: payload.iat,
        exp: payload.exp,
    };
}

// 세션 객체만 필요한 호출부에서는 상세 사유 없이 현재 사용자만 간단히 읽을 수 있다.
export async function getCurrentSession() {
    const { session } = await lookupCurrentSession();

    return session;
}

// 보호 API에서는 세션 유무와 함께 쿠키 정리 필요 여부까지 같이 판단한다.
export async function lookupCurrentSession(): Promise<CurrentSessionLookup> {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    // 쿠키 자체가 없으면 단순 미로그인 상태다.
    if (!token) {
        return {
            session: null,
            shouldClearCookie: false,
        };
    }

    try {
        return {
            session: await verifyAuthToken(token),
            shouldClearCookie: false,
        };
    } catch {
        // 토큰이 있지만 검증에 실패하면 잘못된 쿠키를 비워야 하므로 플래그를 올린다.
        return {
            session: null,
            shouldClearCookie: true,
        };
    }
}

// 로그인 성공 후 서버가 브라우저에 httpOnly 인증 쿠키를 심는 공통 진입점이다.
export async function setAuthCookie(token: string) {
    const cookieStore = await cookies();

    cookieStore.set(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
    });
}

// 로그아웃이나 잘못된 토큰 정리 시 같은 옵션으로 인증 쿠키를 제거한다.
export async function clearAuthCookie() {
    const cookieStore = await cookies();

    cookieStore.set(AUTH_COOKIE_NAME, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
        expires: new Date(0),
    });
}