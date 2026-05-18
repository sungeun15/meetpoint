import "server-only";

import {
    getLastReadOwnMessage,
    listMessagesBetweenUsers,
    markMessagesAsReadForConversation,
    type MessageItem,
    type ReadMessageCursor,
} from "@/lib/repositories/messages";

export type ConversationMessagesResult = {
    messages: MessageItem[];
    lastMessageCreatedAt: string | null;
    lastReadOwnMessage: ReadMessageCursor | null;
};

export async function fetchConversationMessages(input: {
    currentUserId: string;
    friendId: string;
    after: string | null;
    afterId: string | null;
    before: string | null;
    beforeId: string | null;
    limit: number;
}): Promise<ConversationMessagesResult> {
    // 조회 직전에 받은 미읽음 메시지를 먼저 읽음 처리한다.
    await markMessagesAsReadForConversation({
        currentUserId: input.currentUserId,
        friendId: input.friendId,
    });

    // 목록과 마지막 읽음 커서를 병렬로 모아 응답한다.
    const [messages, lastReadOwnMessage] = await Promise.all([
        listMessagesBetweenUsers({
            currentUserId: input.currentUserId,
            friendId: input.friendId,
            after: input.after,
            afterId: input.afterId,
            before: input.before,
            beforeId: input.beforeId,
            limit: input.limit,
        }),
        getLastReadOwnMessage({
            currentUserId: input.currentUserId,
            friendId: input.friendId,
        }),
    ]);

    return {
        messages,
        lastMessageCreatedAt: messages.at(-1)?.createdAt ?? null,
        lastReadOwnMessage,
    };
}
