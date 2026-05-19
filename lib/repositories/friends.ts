import "server-only";

import type { FriendRelationState } from "@/lib/contracts/friends";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { maskUserLocationForViewer, type UserSummary } from "@/lib/repositories/users";

type FriendRelationRow = {
    id: string;
    user_id: string;
    friend_id: string;
    status: "pending" | "accepted";
    created_at: string;
};

type FriendUserRow = {
    id: string;
    nickname: string;
    lat: number | null;
    lng: number | null;
    location_updated_at: string | null;
    location_share_scope: UserSummary["locationShareScope"];
    location_share_target_user_id: string | null;
};

type AcceptFriendRequestRpcRow = {
    request_id: string;
    requester_id: string;
};

export type FriendListItem = {
    relationId: string;
    friend: UserSummary;
    unreadCount: number;
    lastMessagePreview: string | null;
};

type LatestMessagePreviewRow = {
    sender_id: string;
    content: string;
    created_at: string;
    id: string;
};

export type PendingFriendRequestListItem = {
    requestId: string;
    user: UserSummary;
    requestedAt: string;
};

function mapFriendUserRow(row: FriendUserRow): UserSummary {
    return {
        id: row.id,
        nickname: row.nickname,
        lat: row.lat,
        lng: row.lng,
        locationUpdatedAt: row.location_updated_at,
        locationShareScope: row.location_share_scope,
        locationShareTargetUserId: row.location_share_target_user_id,
    };
}

async function listUsersByIds(userIds: string[], viewerUserId?: string) {
    if (!userIds.length) {
        return new Map<string, UserSummary>();
    }

    const uniqueUserIds = [...new Set(userIds)];
    const { data, error } = await getSupabaseAdminClient()
        .from("users")
        .select("id, nickname, lat, lng, location_updated_at, location_share_scope, location_share_target_user_id")
        .in("id", uniqueUserIds)
        .returns<FriendUserRow[]>();

    if (error) {
        throw error;
    }

    return new Map(data.map((row) => {
        const user = mapFriendUserRow(row);

        return [
            row.id,
            viewerUserId ? maskUserLocationForViewer(user, viewerUserId) : user,
        ] as const;
    }));
}

async function listUnreadMessageCountsByFriend(userId: string, friendIds: string[]) {
    if (!friendIds.length) {
        return new Map<string, number>();
    }

    const { data, error } = await getSupabaseAdminClient()
        .from("messages")
        .select("sender_id")
        .eq("receiver_id", userId)
        .is("read_at", null)
        .in("sender_id", friendIds)
        .returns<Array<{ sender_id: string }>>();

    if (error) {
        throw error;
    }

    const unreadCountByFriendId = new Map<string, number>();

    for (const row of data) {
        unreadCountByFriendId.set(row.sender_id, (unreadCountByFriendId.get(row.sender_id) ?? 0) + 1);
    }

    return unreadCountByFriendId;
}

function buildLastMessagePreview(content: string) {
    const normalizedContent = content.replace(/\s+/g, " ").trim();

    if (!normalizedContent) {
        return null;
    }

    return normalizedContent.length > 48
        ? `${normalizedContent.slice(0, 48)}...`
        : normalizedContent;
}

async function listLastMessagePreviewsByFriend(userId: string, friendIds: string[]) {
    if (!friendIds.length) {
        return new Map<string, string | null>();
    }

    // 친구별 개별 조회 대신 수신 메시지를 한 번에 모아온다.
    const { data, error } = await getSupabaseAdminClient()
        .from("messages")
        .select("id, sender_id, content, created_at")
        .eq("receiver_id", userId)
        .in("sender_id", friendIds)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .returns<LatestMessagePreviewRow[]>();

    if (error) {
        throw error;
    }

    const lastMessagePreviewByFriendId = new Map<string, string | null>();

    for (const friendId of friendIds) {
        lastMessagePreviewByFriendId.set(friendId, null);
    }

    for (const row of data) {
        // 최신순 결과라 sender_id 별 첫 행이 마지막 미리보기다.
        if (lastMessagePreviewByFriendId.get(row.sender_id) !== null) {
            continue;
        }

        lastMessagePreviewByFriendId.set(row.sender_id, buildLastMessagePreview(row.content));

        // 모든 친구를 채웠다면 남은 행은 볼 필요가 없다.
        if ([...lastMessagePreviewByFriendId.values()].every((preview) => preview !== null)) {
            break;
        }
    }

    return lastMessagePreviewByFriendId;
}

async function listRelationRowsBetweenUsers(userId: string, friendUserId: string) {
    const { data, error } = await getSupabaseAdminClient()
        .from("friends")
        .select("id, user_id, friend_id, status, created_at")
        .in("user_id", [userId, friendUserId])
        .in("friend_id", [userId, friendUserId])
        .returns<FriendRelationRow[]>();

    if (error) {
        throw error;
    }

    return data.filter(
        (relation) =>
            (relation.user_id === userId && relation.friend_id === friendUserId)
            || (relation.user_id === friendUserId && relation.friend_id === userId),
    );
}

// 수락된 친구 목록은 현재 사용자 기준 accepted row만 조회한다.
export async function listFriendsForUser(userId: string) {
    const { data: relations, error: relationsError } = await getSupabaseAdminClient()
        .from("friends")
        .select("id, user_id, friend_id, status, created_at")
        .eq("user_id", userId)
        .eq("status", "accepted")
        .order("created_at", { ascending: false })
        .returns<FriendRelationRow[]>();

    if (relationsError) {
        throw relationsError;
    }

    if (!relations.length) {
        return [] satisfies FriendListItem[];
    }

    const friendIds = relations.map((relation) => relation.friend_id);
    const [friendById, unreadCountByFriendId, lastMessagePreviewByFriendId] = await Promise.all([
        listUsersByIds(friendIds, userId),
        listUnreadMessageCountsByFriend(userId, friendIds),
        listLastMessagePreviewsByFriend(userId, friendIds),
    ]);

    return relations.flatMap((relation) => {
        const friend = friendById.get(relation.friend_id);

        if (!friend) {
            return [];
        }

        return [{
            relationId: relation.id,
            friend,
            unreadCount: unreadCountByFriendId.get(relation.friend_id) ?? 0,
            lastMessagePreview: lastMessagePreviewByFriendId.get(relation.friend_id) ?? null,
        }] satisfies FriendListItem[];
    });
}

// pending 요청은 받은 요청과 보낸 요청을 분리해서 내려준다.
export async function listPendingFriendRequestsForUser(userId: string) {
    const [incomingResult, outgoingResult] = await Promise.all([
        getSupabaseAdminClient()
            .from("friends")
            .select("id, user_id, friend_id, status, created_at")
            .eq("friend_id", userId)
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .returns<FriendRelationRow[]>(),
        getSupabaseAdminClient()
            .from("friends")
            .select("id, user_id, friend_id, status, created_at")
            .eq("user_id", userId)
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .returns<FriendRelationRow[]>(),
    ]);

    if (incomingResult.error) {
        throw incomingResult.error;
    }

    if (outgoingResult.error) {
        throw outgoingResult.error;
    }

    const userById = await listUsersByIds([
        ...incomingResult.data.map((relation) => relation.user_id),
        ...outgoingResult.data.map((relation) => relation.friend_id),
    ]);

    const incoming = incomingResult.data.flatMap((relation) => {
        const user = userById.get(relation.user_id);

        if (!user) {
            return [];
        }

        return [{
            requestId: relation.id,
            user,
            requestedAt: relation.created_at,
        }] satisfies PendingFriendRequestListItem[];
    });

    const outgoing = outgoingResult.data.flatMap((relation) => {
        const user = userById.get(relation.friend_id);

        if (!user) {
            return [];
        }

        return [{
            requestId: relation.id,
            user,
            requestedAt: relation.created_at,
        }] satisfies PendingFriendRequestListItem[];
    });

    return { incoming, outgoing };
}

export async function getFriendRelationState(input: { userId: string; friendUserId: string }) {
    const relations = await listRelationRowsBetweenUsers(input.userId, input.friendUserId);

    if (!relations.length) {
        return null;
    }

    const acceptedRelation = relations.find((relation) => relation.status === "accepted");

    if (acceptedRelation) {
        return {
            state: "accepted",
            requestId: acceptedRelation.id,
        } as const satisfies { state: FriendRelationState; requestId: string };
    }

    const outgoingPending = relations.find(
        (relation) =>
            relation.status === "pending"
            && relation.user_id === input.userId
            && relation.friend_id === input.friendUserId,
    );

    if (outgoingPending) {
        return {
            state: "outgoing_pending",
            requestId: outgoingPending.id,
        } as const satisfies { state: FriendRelationState; requestId: string };
    }

    const incomingPending = relations.find(
        (relation) =>
            relation.status === "pending"
            && relation.user_id === input.friendUserId
            && relation.friend_id === input.userId,
    );

    if (incomingPending) {
        return {
            state: "incoming_pending",
            requestId: incomingPending.id,
        } as const satisfies { state: FriendRelationState; requestId: string };
    }

    return null;
}

export async function createFriendRequest(input: { userId: string; friendUserId: string }) {
    const { data, error } = await getSupabaseAdminClient()
        .from("friends")
        .insert({
            user_id: input.userId,
            friend_id: input.friendUserId,
            status: "pending",
        })
        .select("id, user_id, friend_id, status, created_at")
        .returns<FriendRelationRow[]>();

    if (error) {
        throw error;
    }

    const createdRelation = data[0];

    if (!createdRelation) {
        throw new Error("생성된 친구 요청을 확인할 수 없습니다.");
    }

    return {
        requestId: createdRelation.id,
        requestedAt: createdRelation.created_at,
    };
}

export async function acceptFriendRequest(input: { requestId: string; currentUserId: string }) {
    // pending row 갱신과 역방향 accepted row 생성을 DB 함수 안에서 함께 처리해 중간 불일치를 막는다.
    const { data, error } = await getSupabaseAdminClient()
        .rpc("accept_friend_request_atomic", {
            input_request_id: input.requestId,
            input_current_user_id: input.currentUserId,
        });

    if (error) {
        throw error;
    }

    const acceptedRequest = Array.isArray(data)
        ? (data[0] as AcceptFriendRequestRpcRow | undefined)
        : undefined;

    if (!acceptedRequest) {
        return null;
    }

    return {
        requestId: acceptedRequest.request_id,
        requesterId: acceptedRequest.requester_id,
    };
}

export async function rejectFriendRequest(input: { requestId: string; currentUserId: string }) {
    const { data, error } = await getSupabaseAdminClient()
        .from("friends")
        .delete()
        .eq("id", input.requestId)
        .eq("friend_id", input.currentUserId)
        .eq("status", "pending")
        .select("id, user_id, friend_id, status, created_at")
        .returns<FriendRelationRow[]>();

    if (error) {
        throw error;
    }

    const rejectedRelation = data[0];

    if (!rejectedRelation) {
        return null;
    }

    return {
        requestId: rejectedRelation.id,
        requesterId: rejectedRelation.user_id,
    };
}

// 권한 검증은 현재 사용자 기준 accepted 단방향 관계 존재 여부만 확인하면 된다.
export async function hasFriendRelation(userId: string, friendUserId: string) {
    const { data, error } = await getSupabaseAdminClient()
        .from("friends")
        .select("id")
        .eq("user_id", userId)
        .eq("friend_id", friendUserId)
        .eq("status", "accepted")
        .limit(1)
        .maybeSingle<{ id: string }>();

    if (error) {
        throw error;
    }

    return Boolean(data);
}