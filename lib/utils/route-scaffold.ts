import type { NextRequest } from "next/server";

import { clearAuthCookie, lookupCurrentSession } from "@/lib/auth/session";
import { apiNotImplemented, apiUnauthorized } from "@/lib/contracts/api";

// 비보호 API 스캐폴드는 실제 로직 전까지 공통 501 응답만 돌려준다.
export function createPublicPlaceholder(scope: string) {
    return async function placeholderHandler(_request: NextRequest) {
        return apiNotImplemented(scope);
    };
}

// 보호 API 스캐폴드는 세션 검증과 잘못된 쿠키 정리까지 공통으로 처리한다.
export function createProtectedPlaceholder(scope: string) {
    return async function protectedPlaceholderHandler(_request: NextRequest) {
        const { session, shouldClearCookie } = await lookupCurrentSession();

        if (!session) {
            // 깨진 JWT 쿠키가 남아 있으면 다음 요청부터는 깨끗한 미로그인 상태가 되도록 비운다.
            if (shouldClearCookie) {
                await clearAuthCookie();
            }

            return apiUnauthorized();
        }

        return apiNotImplemented(scope);
    };
}