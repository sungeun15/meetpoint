import { apiError, apiOk } from "@/lib/contracts/api";
import { listFriendsForUser, upsertFriendRelationPair } from "@/lib/repositories/friends";
import { findUserByNicknameNormalized } from "@/lib/repositories/users";
import { createProtectedRoute } from "@/lib/utils/route-scaffold";
import {
    InputValidationError,
    normalizeNickname,
    validateNickname,
} from "@/lib/utils/validation";

export const dynamic = "force-dynamic";

// 친구 목록은 현재 로그인 사용자의 관계만 조회해 friend 요약 배열로 반환한다.
export const GET = createProtectedRoute(async (_request, { currentUserId }) => {
    try {
        const friends = await listFriendsForUser(currentUserId);

        return apiOk({
            friends: friends.map((item) => ({
                id: item.friend.id,
                relationId: item.relationId,
                nickname: item.friend.nickname,
                lat: item.friend.lat,
                lng: item.friend.lng,
                locationUpdatedAt: item.friend.locationUpdatedAt,
            })),
        });
    } catch {
        return apiError("INTERNAL_ERROR", "친구 목록 조회 중 오류가 발생했습니다.", 500);
    }
});

// 친구 추가는 본문 userId 를 신뢰하지 않고 JWT 에서 주입된 currentUserId 만 사용한다.
export const POST = createProtectedRoute(async (request, { currentUserId, currentUserNickname }) => {
    try {
        const body = await request.json();
        const { nicknameNormalized } = validateNickname(body.friendNickname);

        if (nicknameNormalized === normalizeNickname(currentUserNickname)) {
            throw new InputValidationError("자기 자신은 친구로 추가할 수 없습니다.");
        }

        const friendUser = await findUserByNicknameNormalized(nicknameNormalized);

        if (!friendUser) {
            return apiError("FRIEND_NOT_FOUND", "해당 닉네임의 사용자를 찾을 수 없습니다.", 404);
        }

        const relationId = await upsertFriendRelationPair({
            userId: currentUserId,
            friendUserId: friendUser.id,
        });

        return apiOk({
            relationId,
            friend: {
                id: friendUser.id,
                nickname: friendUser.nickname,
                lat: friendUser.lat,
                lng: friendUser.lng,
                locationUpdatedAt: friendUser.locationUpdatedAt,
            },
        });
    } catch (error) {
        if (error instanceof InputValidationError) {
            return apiError("INVALID_INPUT", error.message, 400);
        }

        if (error instanceof SyntaxError) {
            return apiError("INVALID_INPUT", "요청 본문 형식이 올바르지 않습니다.", 400);
        }

        return apiError("INTERNAL_ERROR", "친구 추가 처리 중 오류가 발생했습니다.", 500);
    }
});