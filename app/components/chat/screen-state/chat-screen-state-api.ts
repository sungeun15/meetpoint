import type { ApiResponse } from "@/lib/contracts/api";

export type ApiRequestResult<T> =
    | { status: "ok"; data: T }
    | { status: "unauthorized" }
    | { status: "error"; message: string };

// 채팅 화면 내부의 fetch 결과를 동일한 status 형태로 정규화합니다.
export async function requestApi<T>(input: RequestInfo | URL, fallbackMessage: string, init?: RequestInit): Promise<ApiRequestResult<T>> {
    const response = await fetch(input, init);
    const payload = (await response.json()) as ApiResponse<T>;

    if (response.status === 401) {
        return { status: "unauthorized" };
    }

    if (!response.ok || !payload.ok) {
        return {
            status: "error",
            message: payload.ok ? fallbackMessage : payload.error.message,
        };
    }

    return {
        status: "ok",
        data: payload.data,
    };
}