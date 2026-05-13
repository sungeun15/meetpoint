import { NextResponse } from "next/server";

// API 성공 응답은 ok/data 형태로 통일한다.
export type ApiSuccess<T> = {
    ok: true;
    data: T;
};

// API 실패 응답은 code/message 쌍으로 내려 프론트에서 공통 처리하기 쉽게 맞춘다.
export type ApiFailure = {
    ok: false;
    error: {
        code: string;
        message: string;
    };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

// 정상 응답 생성 로직을 한 곳으로 모아 Route Handler마다 같은 JSON 형태를 유지한다.
export function apiOk<T>(data: T, init?: ResponseInit) {
    return NextResponse.json<ApiSuccess<T>>({ ok: true, data }, init);
}

// 에러 응답도 공통 헬퍼로 묶어 상태 코드와 본문 구조가 흩어지지 않게 한다.
export function apiError(code: string, message: string, status: number) {
    return NextResponse.json<ApiFailure>(
        {
            ok: false,
            error: {
                code,
                message,
            },
        },
        { status },
    );
}

// 인증이 필요한 API에서 세션이 없을 때 공통으로 사용하는 401 응답이다.
export function apiUnauthorized() {
    return apiError("UNAUTHORIZED", "로그인이 필요합니다.", 401);
}

// 아직 실제 DB 연동을 붙이지 않은 스캐폴드 API가 임시로 반환하는 응답이다.
export function apiNotImplemented(scope: string) {
    return apiError(
        "NOT_IMPLEMENTED",
        `${scope} API는 아직 DB 연동이 완료되지 않았습니다.`,
        501,
    );
}