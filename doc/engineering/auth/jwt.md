# MeetPoint MVP JWT 인증 설명

## 1\. 문서 목적

이 문서는 MeetPoint MVP에서 JWT 인증이 어떻게 동작하는지 쉽게 이해할 수 있도록 정리한 문서이다.

현재 프로젝트는 Next.js 16 App Router를 사용하고, 인증은 JWT와 httpOnly 쿠키 방식으로 처리한다.

이 문서에서는 아래 내용까지만 다룬다.

1.  회원가입
2.  로그인
3.  로그아웃
4.  보호 페이지 접근
5.  보호 API 접근

---

## 2\. 한 번에 이해하기

MeetPoint에서는 사용자가 로그인에 성공하면 서버가 JWT를 만들고, 그것을 meetpoint_auth 쿠키에 담아 내려 준다.

그 다음부터는 브라우저가 페이지를 열거나 API를 호출할 때 이 쿠키를 자동으로 함께 보낸다. 서버는 그 값을 확인해서 지금 요청한 사용자가 누구인지 판단한다.

아주 짧게 말하면 아래 한 문장으로 이해하면 된다.

"로그인에 성공하면 서버가 확인표를 쿠키로 내려 주고, 이후 보호 요청마다 그 값을 검사해서 로그인 여부를 확인한다."

---

## 3\. JWT를 쉽게 설명하면

JWT는 서버가 발급하는 로그인 확인표라고 생각하면 쉽다.

이 확인표 안에는 보통 아래 정보가 들어 있다.

1.  어떤 사용자인지
2.  닉네임이 무엇인지
3.  언제 만들어졌는지
4.  언제까지 쓸 수 있는지

중요한 점은 JWT가 비밀번호를 숨겨 두는 용도가 아니라는 것이다. 이 값이 정말 서버가 만든 값인지 확인하는 데 쓰인다.

그래서 JWT 안에는 비밀번호 같은 민감한 값은 넣지 않는다.

---

## 4\. 왜 JWT와 쿠키를 같이 쓰는가

### 4.1 이유

1.  MVP에서 구현 흐름이 비교적 단순하다.
2.  Next.js Route Handler에서 로그인과 인증 체크를 직접 다루기 쉽다.
3.  브라우저가 토큰 문자열을 직접 저장하거나 읽지 않아도 된다.
4.  httpOnly 쿠키를 쓰면 브라우저 자바스크립트에서 토큰을 직접 건드리기 어렵다.

### 4.2 우리 프로젝트에서 좋은 점

1.  시작 페이지인 app/page.tsx 에서 로그인 여부를 나누기 쉽다.
2.  보호 페이지인 app/main/page.tsx 에서 서버 기준으로 바로 이동 처리를 할 수 있다.
3.  app/api/friends, app/api/messages, app/api/location 같은 API에 같은 인증 규칙을 붙이기 쉽다.

---

## 5\. 현재 프로젝트에서 JWT가 들어가는 위치

MeetPoint MVP에서 JWT와 직접 관련 있는 위치는 아래와 같다.

1.  app/api/auth/signup/route.ts
2.  app/api/auth/login/route.ts
3.  app/api/auth/logout/route.ts
4.  app/page.tsx
5.  app/main/page.tsx
6.  lib/auth/session.ts

각 파일이 하는 일을 짧게 정리하면 다음과 같다.

1.  signup: 회원가입 후 JWT를 만든다.
2.  login: 로그인 성공 후 JWT를 만든다.
3.  logout: JWT 쿠키를 지운다.
4.  page.tsx: 이미 로그인 상태면 메인 화면으로 보낸다.
5.  main/page.tsx: JWT가 없으면 로그인 화면으로 보낸다.
6.  session.ts: JWT 만들기, 검사하기, 쿠키 설정을 공통 처리한다.

---

## 6\. 인증 흐름 설명

### 6.1 로그인 흐름

사용자가 로그인 버튼을 눌렀을 때 순서는 아래와 같다.

```
브라우저
  -> /api/auth/login 요청
  -> 서버가 nickname/password 확인
  -> JWT 생성
  -> meetpoint_auth 쿠키 발급
  -> 브라우저는 이후 요청마다 쿠키 자동 전송
```

### 6.2 회원가입 흐름

회원가입도 거의 비슷하지만, 중간에 사용자 저장 단계가 한 번 들어간다.

```
브라우저
  -> /api/auth/signup 요청
  -> 서버가 닉네임 중복 검사
  -> password_hash 저장
  -> JWT 생성
  -> meetpoint_auth 쿠키 발급
  -> 메인 화면으로 이동
```

### 6.3 로그아웃 흐름

로그아웃은 가장 단순한 흐름이다.

```
브라우저
  -> /api/auth/logout 요청
  -> 서버가 meetpoint_auth 쿠키 삭제
  -> 200 응답 반환
  -> 로그인 화면으로 이동
```

### 6.4 보호 페이지 흐름

로그인한 사람만 들어갈 수 있는 페이지는 아래처럼 처리한다.

```
브라우저
  -> /main 접근
  -> 서버가 쿠키 확인
  -> JWT 유효: 페이지 렌더링
  -> JWT 없음 또는 만료: / 로 redirect
```

---

## 7\. 쿠키와 토큰 규칙

### 7.1 쿠키 이름

*   meetpoint_auth

### 7.2 JWT 안에 들어가는 값

1.  userId
2.  nickname
3.  iat
4.  exp

### 7.3 쿠키 설정

1.  httpOnly: 브라우저 자바스크립트에서 읽지 못하게 막는다.
2.  sameSite=lax: 다른 사이트에서 함부로 요청을 보내는 위험을 조금 줄여 준다.
3.  path=/: 사이트 전체 경로에서 이 쿠키를 쓴다.
4.  secure=true: 운영 환경에서는 HTTPS일 때만 보낸다.
5.  maxAge=60 * 60 * 24 * 7: 7일 동안 유지한다.

### 7.4 서버 비밀 키

*   JWT_SECRET 을 서버 환경 변수로 사용한다.

---

## 8\. 핵심 코드 예시

아래 코드는 현재 프로젝트 구조에 맞춘 설명용 예시이다.

실제 구현에서는 입력 검증, DB 연결, 비밀번호 해시 비교를 별도 유틸로 분리하면 된다.

### 8.1 lib/auth/session.ts 예시

이 파일은 JWT를 만들고 검사하고 쿠키를 넣거나 지우는 공통 유틸이다.

```
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "meetpoint_auth";
const JWT_EXPIRES_IN = "7d";

type AuthPayload = {
  userId: string;
  nickname: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  return secret;
}

export function createAuthToken(payload: AuthPayload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as AuthPayload & {
    iat: number;
    exp: number;
  };
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUserFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    return verifyAuthToken(token);
  } catch {
    await clearAuthCookie();
    return null;
  }
}
```

설명 포인트:

1.  Next.js 16에서는 cookies() 를 비동기로 다룬다.
2.  토큰 만들기와 쿠키 저장을 나누면 login, signup 에서 같이 쓰기 쉽다.
3.  잘못된 토큰은 바로 null 처리하고 쿠키도 함께 정리한다.

### 8.2 app/api/auth/login/route.ts 예시

이 코드는 로그인에 성공했을 때 JWT를 만드는 흐름을 보여 준다.

```
import { createAuthToken, setAuthCookie } from "@/lib/auth/session";

type LoginBody = {
  nickname: string;
  password: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as LoginBody;
  const nickname = body.nickname?.trim();
  const password = body.password?.trim();

  if (!nickname || !password) {
    return Response.json(
      {
        ok: false,
        error: {
          code: "INVALID_INPUT",
          message: "닉네임과 비밀번호를 확인해 주세요.",
        },
      },
      { status: 400 }
    );
  }

  const user = {
    id: "sample-user-id",
    nickname,
    passwordHash: "hashed-password",
  };

  const isPasswordValid = password === "pass1234";

  if (!user || !isPasswordValid) {
    return Response.json(
      {
        ok: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "닉네임 또는 비밀번호가 올바르지 않습니다.",
        },
      },
      { status: 401 }
    );
  }

  const token = createAuthToken({
    userId: user.id,
    nickname: user.nickname,
  });

  await setAuthCookie(token);

  return Response.json({
    ok: true,
    data: {
      user: {
        id: user.id,
        nickname: user.nickname,
        lat: null,
        lng: null,
        locationUpdatedAt: null,
      },
    },
  });
}
```

설명 포인트:

1.  로그인에 성공하면 서버가 바로 토큰을 만든다.
2.  브라우저는 토큰 문자열을 직접 저장하지 않는다.
3.  응답 데이터와 함께 쿠키도 같이 내려간다.

### 8.3 app/api/auth/logout/route.ts 예시

MVP에서는 로그아웃을 단순하게 처리하는 편이 이해하기 쉽고 구현도 편하다.

```
import { clearAuthCookie } from "@/lib/auth/session";

export async function POST() {
  await clearAuthCookie();

  return Response.json({
    ok: true,
    data: {
      cleared: true,
    },
  });
}
```

설명 포인트:

1.  로그아웃은 JWT가 없어도 성공으로 처리한다.
2.  그래서 프론트엔드도 복잡하게 예외를 나눌 필요가 없다.

### 8.4 app/main/page.tsx 예시

보호 페이지는 서버가 먼저 쿠키를 확인하고, 로그인 상태가 아니면 redirect 한다.

```
import { redirect } from "next/navigation";
import { getCurrentUserFromCookie } from "@/lib/auth/session";

export default async function MainPage() {
  const currentUser = await getCurrentUserFromCookie();

  if (!currentUser) {
    redirect("/");
  }

  return (
    <main>
      <h1>MeetPoint Main</h1>
      <p>{currentUser.nickname} 님 환영합니다.</p>
    </main>
  );
}
```

설명 포인트:

1.  인증 체크를 브라우저보다 서버에서 먼저 한다.
2.  그래서 보호 페이지 동작이 더 분명해진다.

---

## 9\. 헷갈리기 쉬운 부분

### 9.1 JWT는 비밀번호가 아니다

JWT는 로그인했다는 사실을 보여 주는 값이지, 비밀번호를 담아 두는 곳이 아니다.

### 9.2 쿠키에 저장된다고 해서 프론트가 직접 읽는 것은 아니다

httpOnly 쿠키는 브라우저 자바스크립트에서 읽을 수 없다.

대신 브라우저가 요청을 보낼 때 자동으로 함께 보내 준다.

### 9.3 쿠키가 있다고 바로 로그인 상태는 아니다

쿠키가 있어 보여도 만료되었거나 위조된 값이면 로그인 상태가 아니다.

### 9.4 왜 localStorage 대신 쿠키를 쓰는가

MVP에서는 토큰을 자바스크립트에서 직접 만지지 않는 쪽이 더 안전하고 이해도 쉽다.

---

## 10\. 꼭 짚고 가야 할 보안 포인트

1.  비밀번호는 password_hash 형태로만 저장한다.
2.  JWT 안에는 비밀번호, 전화번호 같은 민감한 값을 넣지 않는다.
3.  JWT_SECRET 은 서버 환경 변수로만 관리한다.
4.  운영 환경에서는 secure=true 로 HTTPS에서만 쿠키를 보낸다.
5.  만료되었거나 위조된 토큰은 바로 사용할 수 없게 처리한다.

---

## 11\. 참고 사이트

공식 참고 링크는 아래와 같다.

1.  Next.js Route Handlers
    *   https://nextjs.org/docs/app/api-reference/file-conventions/route
2.  Next.js cookies
    *   https://nextjs.org/docs/app/api-reference/functions/cookies
3.  JWT 소개 문서
    *   https://jwt.io/introduction
4.  MDN Set-Cookie 설명
    *   https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie

---

## 12\. 한 줄 정리

MeetPoint MVP의 JWT 인증은 "서버가 로그인 성공 후 확인표를 쿠키로 내려 주고, 이후 보호 요청마다 그 값을 검사하는 구조"라고 이해하면 쉽다.
