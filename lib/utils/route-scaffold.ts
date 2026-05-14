import type { NextRequest } from "next/server";

import {
    AuthRequiredError,
    requireCurrentSession,
    type AuthSession,
} from "@/lib/auth/session";
import { apiNotImplemented, apiUnauthorized } from "@/lib/contracts/api";

export type ProtectedRouteContext = {
    session: AuthSession;
    currentUserId: string;
    currentUserNickname: string;
};

type ProtectedRouteHandler = (
    request: NextRequest,
    context: ProtectedRouteContext,
) => Response | Promise<Response>;

// 비보호 API 스캐폴드는 실제 로직 전까지 공통 501 응답만 돌려준다.
export function createPublicPlaceholder(scope: string) {
    return async function placeholderHandler(_request: NextRequest) {
        return apiNotImplemented(scope);
    };
}

// 보호 API는 이 래퍼를 통해 인증 확인과 currentUserId 주입 규칙을 공통 처리한다.
export function createProtectedRoute(handler: ProtectedRouteHandler) {
    return async function protectedRouteHandler(request: NextRequest) {
        try {
            const session = await requireCurrentSession();

            return handler(request, {
                session,
                currentUserId: session.userId,
                currentUserNickname: session.nickname,
            });
        } catch (error) {
            if (error instanceof AuthRequiredError) {
                return apiUnauthorized();
            }

            throw error;
        }
    };
}

// 보호 API 스캐폴드는 실제 구현 전까지 인증만 통과시키고 공통 501 응답을 반환한다.
export function createProtectedPlaceholder(scope: string) {
    return createProtectedRoute(async (_request, _context) => {
        return apiNotImplemented(scope);
    });
}