import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/server";

type MessageRow = {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    read_at: string | null;
    created_at: string;
};

export type MessageItem = {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    readAt: string | null;
    createdAt: string;
};

export type ReadMessageCursor = {
    id: string;
    createdAt: string;
    readAt: string;
};

function mapMessageRow(row: MessageRow): MessageItem {
    return {
        id: row.id,
        senderId: row.sender_id,
        receiverId: row.receiver_id,
        content: row.content,
        readAt: row.read_at,
        createdAt: row.created_at,
    };
}

function compareMessageCursor(left: Pick<MessageRow, "created_at" | "id">, right: Pick<MessageRow, "created_at" | "id">) {
    const createdAtCompare = left.created_at.localeCompare(right.created_at);

    if (createdAtCompare !== 0) {
        return createdAtCompare;
    }

    return left.id.localeCompare(right.id);
}

// 저장 직후 생성된 행을 그대로 반환한다.
export async function createMessage(input: {
    senderId: string;
    receiverId: string;
    content: string;
}) {
    const { data, error } = await getSupabaseAdminClient()
        .from("messages")
        .insert({
            sender_id: input.senderId,
            receiver_id: input.receiverId,
            content: input.content,
        })
        .select("id, sender_id, receiver_id, content, read_at, created_at")
        .single<MessageRow>();

    if (error) {
        throw error;
    }

    return mapMessageRow(data);
}

// 현재 사용자가 받은 미읽음 메시지만 일괄 읽음 처리한다.
export async function markMessagesAsReadForConversation(input: { currentUserId: string; friendId: string }) {
    const { error } = await getSupabaseAdminClient()
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("receiver_id", input.currentUserId)
        .eq("sender_id", input.friendId)
        .is("read_at", null);

    if (error) {
        throw error;
    }
}

export async function deleteMessagesBetweenUsers(input: { currentUserId: string; friendId: string }) {
    const { error } = await getSupabaseAdminClient()
        .from("messages")
        .delete()
        .or(
            `and(sender_id.eq.${input.currentUserId},receiver_id.eq.${input.friendId}),and(sender_id.eq.${input.friendId},receiver_id.eq.${input.currentUserId})`,
        );

    if (error) {
        throw error;
    }
}

// 발신 기준으로 가장 최근에 읽힌 내 메시지 한 건만 커서로 가져온다.
export async function getLastReadOwnMessage(input: { currentUserId: string; friendId: string }) {
    const { data, error } = await getSupabaseAdminClient()
        .from("messages")
        .select("id, created_at, read_at")
        .eq("sender_id", input.currentUserId)
        .eq("receiver_id", input.friendId)
        .not("read_at", "is", null)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(1)
        .returns<Array<{ id: string; created_at: string; read_at: string | null }>>();

    if (error) {
        throw error;
    }

    const row = data[0];

    if (!row || !row.read_at) {
        return null;
    }

    return {
        id: row.id,
        createdAt: row.created_at,
        readAt: row.read_at,
    } satisfies ReadMessageCursor;
}

// 모든 조회 결과는 asc 정렬로 맞춰서 화면 병합 로직을 단순화한다.
export async function listMessagesBetweenUsers(input: {
    currentUserId: string;
    friendId: string;
    after: string | null;
    afterId: string | null;
    before: string | null;
    beforeId: string | null;
    limit: number;
}) {
    const baseQuery = getSupabaseAdminClient()
        .from("messages")
        .select("id, sender_id, receiver_id, content, read_at, created_at")
        .or(
            `and(sender_id.eq.${input.currentUserId},receiver_id.eq.${input.friendId}),and(sender_id.eq.${input.friendId},receiver_id.eq.${input.currentUserId})`,
        );

    if (input.after) {
        const { data, error } = await baseQuery
            .gte("created_at", input.after)
            .order("created_at", { ascending: true })
            .order("id", { ascending: true })
            .limit(input.limit * 2)
            .returns<MessageRow[]>();

        if (error) {
            throw error;
        }

        // after 경계보다 뒤의 메시지만 남기고 앞에서부터 limit 만큼 사용한다.
        return data
            .filter((row) => compareMessageCursor(row, { created_at: input.after!, id: input.afterId! }) > 0)
            .slice(0, input.limit)
            .map(mapMessageRow);
    }

    if (input.before) {
        const { data, error } = await baseQuery
            .lte("created_at", input.before)
            .order("created_at", { ascending: false })
            .order("id", { ascending: false })
            .limit(input.limit * 2)
            .returns<MessageRow[]>();

        if (error) {
            throw error;
        }

        // before 조회는 역순으로 모은 뒤 다시 뒤집어 같은 asc 계약을 유지한다.
        return data
            .filter((row) => compareMessageCursor(row, { created_at: input.before!, id: input.beforeId! }) < 0)
            .slice(0, input.limit)
            .reverse()
            .map(mapMessageRow);
    }

    // 초기 진입은 최신 limit 건을 가져온 뒤 오래된 순서로 되돌려 준다.
    const { data, error } = await baseQuery
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(input.limit)
        .returns<MessageRow[]>();

    if (error) {
        throw error;
    }

    return data.reverse().map(mapMessageRow);
}