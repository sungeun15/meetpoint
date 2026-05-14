import { apiError, apiOk } from "@/lib/contracts/api";
import { hasFriendRelation } from "@/lib/repositories/friends";
import { createMessage, listMessagesBetweenUsers } from "@/lib/repositories/messages";
import { createProtectedRoute } from "@/lib/utils/route-scaffold";
import {
    InputValidationError,
    validateLimit,
    validateMessageContent,
    validateOptionalIsoDatetime,
    validateUuid,
} from "@/lib/utils/validation";

export const dynamic = "force-dynamic";

const MESSAGE_POLLING_INTERVAL_SECONDS = 5;

// 메시지 조회는 현재 사용자와 선택 친구 간 대화만 asc 정렬로 반환한다.
export const GET = createProtectedRoute(async (request, { currentUserId }) => {
    try {
        const { searchParams } = new URL(request.url);
        const friendId = validateUuid(searchParams.get("friendId"), "friendId");
        const after = validateOptionalIsoDatetime(searchParams.get("after"), "after");
        const limit = validateLimit(searchParams.get("limit"));

        const hasRelation = await hasFriendRelation(currentUserId, friendId);

        if (!hasRelation) {
            return apiError("FORBIDDEN_RELATION", "친구 관계가 없는 대상과는 메시지를 조회할 수 없습니다.", 403);
        }

        const messages = await listMessagesBetweenUsers({
            currentUserId,
            friendId,
            after,
            limit,
        });
        const lastMessageCreatedAt = messages.at(-1)?.createdAt ?? null;

        return apiOk({
            messages,
            lastMessageCreatedAt,
            pollingIntervalSec: MESSAGE_POLLING_INTERVAL_SECONDS,
        });
    } catch (error) {
        if (error instanceof InputValidationError) {
            return apiError("INVALID_INPUT", error.message, 400);
        }

        return apiError("INTERNAL_ERROR", "메시지 조회 중 오류가 발생했습니다.", 500);
    }
});

// 메시지 저장은 currentUserId 를 발신자로 고정하고 친구 관계가 있을 때만 허용한다.
export const POST = createProtectedRoute(async (request, { currentUserId }) => {
    try {
        const body = await request.json();
        const friendId = validateUuid(body.friendId, "friendId");
        const content = validateMessageContent(body.content);

        const hasRelation = await hasFriendRelation(currentUserId, friendId);

        if (!hasRelation) {
            return apiError("FORBIDDEN_RELATION", "친구 관계가 없는 대상과는 메시지를 저장할 수 없습니다.", 403);
        }

        const message = await createMessage({
            senderId: currentUserId,
            receiverId: friendId,
            content,
        });

        return apiOk({ message });
    } catch (error) {
        if (error instanceof InputValidationError) {
            return apiError("INVALID_INPUT", error.message, 400);
        }

        if (error instanceof SyntaxError) {
            return apiError("INVALID_INPUT", "요청 본문 형식이 올바르지 않습니다.", 400);
        }

        return apiError("INTERNAL_ERROR", "메시지 저장 중 오류가 발생했습니다.", 500);
    }
});