import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { UserSummary } from "@/lib/repositories/users";

type FriendRelationRow = {
    id: string;
    user_id: string;
    friend_id: string;
    created_at: string;
};

type FriendUserRow = {
    id: string;
    nickname: string;
    lat: number | null;
    lng: number | null;
    location_updated_at: string | null;
};

export type FriendListItem = {
    relationId: string;
    friend: UserSummary;
};

function mapFriendUserRow(row: FriendUserRow): UserSummary {
    return {
        id: row.id,
        nickname: row.nickname,
        lat: row.lat,
        lng: row.lng,
        locationUpdatedAt: row.location_updated_at,
    };
}

// 친구 목록은 관계 row와 사용자 row를 분리 조회한 뒤 relationId 와 friend 요약으로 조합한다.
export async function listFriendsForUser(userId: string) {
    const { data: relations, error: relationsError } = await getSupabaseAdminClient()
        .from("friends")
        .select("id, user_id, friend_id, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .returns<FriendRelationRow[]>();

    if (relationsError) {
        throw relationsError;
    }

    if (!relations.length) {
        return [] satisfies FriendListItem[];
    }

    const friendIds = relations.map((relation) => relation.friend_id);
    const { data: friendUsers, error: friendUsersError } = await getSupabaseAdminClient()
        .from("users")
        .select("id, nickname, lat, lng, location_updated_at")
        .in("id", friendIds)
        .returns<FriendUserRow[]>();

    if (friendUsersError) {
        throw friendUsersError;
    }

    const friendById = new Map(friendUsers.map((friendUser) => [friendUser.id, mapFriendUserRow(friendUser)]));

    return relations.flatMap((relation) => {
        const friend = friendById.get(relation.friend_id);

        if (!friend) {
            return [];
        }

        return [
            {
                relationId: relation.id,
                friend,
            },
        ];
    });
}

// 친구 추가는 양방향 row 두 건을 한 번의 upsert 로 맞춰 PRD의 복구/중복 처리 규칙을 함께 만족시킨다.
export async function upsertFriendRelationPair(input: { userId: string; friendUserId: string }) {
    const { data, error } = await getSupabaseAdminClient()
        .from("friends")
        .upsert(
            [
                {
                    user_id: input.userId,
                    friend_id: input.friendUserId,
                },
                {
                    user_id: input.friendUserId,
                    friend_id: input.userId,
                },
            ],
            {
                onConflict: "user_id,friend_id",
            },
        )
        .select("id, user_id, friend_id, created_at")
        .returns<FriendRelationRow[]>();

    if (error) {
        throw error;
    }

    const currentUserRelation = data.find(
        (relation) => relation.user_id === input.userId && relation.friend_id === input.friendUserId,
    );

    if (!currentUserRelation) {
        throw new Error("현재 사용자 기준 친구 관계를 확인할 수 없습니다.");
    }

    return currentUserRelation.id;
}

// 권한 검증은 현재 사용자 기준 단방향 관계 존재 여부만 확인하면 된다.
export async function hasFriendRelation(userId: string, friendUserId: string) {
    const { data, error } = await getSupabaseAdminClient()
        .from("friends")
        .select("id")
        .eq("user_id", userId)
        .eq("friend_id", friendUserId)
        .limit(1)
        .maybeSingle<{ id: string }>();

    if (error) {
        throw error;
    }

    return Boolean(data);
}