import { apiError, apiOk } from "@/lib/contracts/api";
import type {
    FriendRequestActionResponse,
    FriendSearchResponse,
    FriendsListResponse,
} from "@/lib/contracts/friends";
import {
    acceptFriendRequest,
    createFriendRequest,
    getFriendRelationState,
    listFriendsForUser,
    listPendingFriendRequestsForUser,
    rejectFriendRequest,
} from "@/lib/repositories/friends";
import { findUserById, findUserByNicknameNormalized } from "@/lib/repositories/users";
import {
    serializeFriendListItem,
    serializeFriendRequestCreated,
    serializeFriendSummary,
    serializePendingFriendRequest,
} from "@/lib/serializers/friends";
import { createProtectedRoute } from "@/lib/utils/route-scaffold";
import {
    InputValidationError,
    normalizeNickname,
    validateFriendRequestAction,
    validateNickname,
    validateUuid,
} from "@/lib/utils/validation";

export const dynamic = "force-dynamic";

// 같은 GET 이지만 nickname 쿼리가 있으면 검색, 없으면 현재 사용자 기준 목록/요청 조회를 처리한다.
export const GET = createProtectedRoute(async (request, { currentUserId, currentUserNickname }) => {
    try {
        const requestUrl = new URL(request.url);
        const rawNickname = requestUrl.searchParams.get("nickname");

        if (rawNickname) {
            const { nicknameNormalized } = validateNickname(rawNickname);

            if (nicknameNormalized === normalizeNickname(currentUserNickname)) {
                throw new InputValidationError("자기 자신은 친구로 검색할 수 없습니다.");
            }

            const friendUser = await findUserByNicknameNormalized(nicknameNormalized);
            const relation = friendUser
                ? await getFriendRelationState({
                    userId: currentUserId,
                    friendUserId: friendUser.id,
                })
                : null;

            return apiOk({
                friend: friendUser ? serializeFriendSummary(friendUser) : null,
                relation,
            } satisfies FriendSearchResponse);
        }

        const [friends, pendingRequests] = await Promise.all([
            listFriendsForUser(currentUserId),
            listPendingFriendRequestsForUser(currentUserId),
        ]);

        return apiOk({
            friends: friends.map(serializeFriendListItem),
            incomingRequests: pendingRequests.incoming.map(serializePendingFriendRequest),
            outgoingRequests: pendingRequests.outgoing.map(serializePendingFriendRequest),
        } satisfies FriendsListResponse);
    } catch (error) {
        if (error instanceof InputValidationError) {
            return apiError("INVALID_INPUT", error.message, 400);
        }

        return apiError("INTERNAL_ERROR", "친구 목록 조회 중 오류가 발생했습니다.", 500);
    }
});

// 친구 추가는 pending 요청 생성만 허용한다.
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

        const relation = await getFriendRelationState({
            userId: currentUserId,
            friendUserId: friendUser.id,
        });

        if (relation?.state === "accepted") {
            return apiError("FRIEND_ALREADY_ACCEPTED", "이미 수락된 친구 관계입니다.", 409);
        }

        if (relation?.state === "outgoing_pending") {
            return apiError("FRIEND_REQUEST_ALREADY_SENT", "이미 친구 요청을 보냈습니다.", 409);
        }

        if (relation?.state === "incoming_pending") {
            return apiError("FRIEND_REQUEST_PENDING_FROM_TARGET", "상대가 먼저 친구 요청을 보냈습니다. 받은 요청에서 수락해 주세요.", 409);
        }

        const createdRequest = await createFriendRequest({
            userId: currentUserId,
            friendUserId: friendUser.id,
        });

        return apiOk(serializeFriendRequestCreated({
            requestId: createdRequest.requestId,
            requestedAt: createdRequest.requestedAt,
            friend: friendUser,
        }));
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

// 친구 요청 수락/거절은 받은 요청의 requestId 와 action 으로 처리한다.
export const PATCH = createProtectedRoute(async (request, { currentUserId }) => {
    try {
        const body = await request.json();
        const requestId = validateUuid(body.requestId, "requestId");
        const action = validateFriendRequestAction(body.action);

        if (action === "accept") {
            const acceptedRequest = await acceptFriendRequest({
                requestId,
                currentUserId,
            });

            if (!acceptedRequest) {
                return apiError("FRIEND_REQUEST_NOT_FOUND", "처리할 친구 요청을 찾지 못했습니다.", 404);
            }

            const friendUser = await findUserById(acceptedRequest.requesterId);

            if (!friendUser) {
                return apiError("INTERNAL_ERROR", "친구 요청 사용자를 확인하지 못했습니다.", 500);
            }

            return apiOk({
                requestId: acceptedRequest.requestId,
                action,
                friend: serializeFriendSummary(friendUser),
            } satisfies FriendRequestActionResponse);
        }

        const rejectedRequest = await rejectFriendRequest({
            requestId,
            currentUserId,
        });

        if (!rejectedRequest) {
            return apiError("FRIEND_REQUEST_NOT_FOUND", "처리할 친구 요청을 찾지 못했습니다.", 404);
        }

        return apiOk({
            requestId: rejectedRequest.requestId,
            action,
            requesterId: rejectedRequest.requesterId,
        } satisfies FriendRequestActionResponse);
    } catch (error) {
        if (error instanceof InputValidationError) {
            return apiError("INVALID_INPUT", error.message, 400);
        }

        if (error instanceof SyntaxError) {
            return apiError("INVALID_INPUT", "요청 본문 형식이 올바르지 않습니다.", 400);
        }

        return apiError("INTERNAL_ERROR", "친구 요청 처리 중 오류가 발생했습니다.", 500);
    }
});