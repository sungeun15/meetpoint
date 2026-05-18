import type {
    FriendRequestCreateResponse,
    FriendSummary,
    PendingFriendRequestSummary,
} from "@/lib/contracts/friends";
import type { FriendListItem, PendingFriendRequestListItem } from "@/lib/repositories/friends";
import type { UserSummary } from "@/lib/repositories/users";

export function serializeFriendSummary(friend: UserSummary, relationId?: string): FriendSummary {
    return {
        id: friend.id,
        relationId,
        nickname: friend.nickname,
        lat: friend.lat,
        lng: friend.lng,
        locationUpdatedAt: friend.locationUpdatedAt,
        unreadCount: 0,
        lastMessagePreview: null,
    };
}

export function serializeFriendListItem(item: FriendListItem): FriendSummary {
    return {
        ...serializeFriendSummary(item.friend, item.relationId),
        unreadCount: item.unreadCount,
        lastMessagePreview: item.lastMessagePreview,
    };
}

export function serializePendingFriendRequest(item: PendingFriendRequestListItem): PendingFriendRequestSummary {
    return {
        ...serializeFriendSummary(item.user),
        requestId: item.requestId,
        requestedAt: item.requestedAt,
    };
}

export function serializeFriendRequestCreated(input: {
    requestId: string;
    requestedAt: string;
    friend: UserSummary;
}): FriendRequestCreateResponse {
    return {
        requestId: input.requestId,
        requestedAt: input.requestedAt,
        friend: serializeFriendSummary(input.friend),
    };
}
