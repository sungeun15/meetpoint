import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/server";

type MessageRow = {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
};

export type MessageItem = {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
};

function mapMessageRow(row: MessageRow): MessageItem {
    return {
        id: row.id,
        senderId: row.sender_id,
        receiverId: row.receiver_id,
        content: row.content,
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

// 메시지 저장은 단건 insert 후 저장된 행을 그대로 API 응답 타입으로 돌려준다.
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
        .select("id, sender_id, receiver_id, content, created_at")
        .single<MessageRow>();

    if (error) {
        throw error;
    }

    return mapMessageRow(data);
}

// after 가 없으면 최신 limit 건을 먼저 가져온 뒤 다시 뒤집어 asc 정렬 계약을 맞춘다.
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
        .select("id, sender_id, receiver_id, content, created_at")
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

        return data
            .filter((row) => compareMessageCursor(row, { created_at: input.before!, id: input.beforeId! }) < 0)
            .slice(0, input.limit)
            .reverse()
            .map(mapMessageRow);
    }

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