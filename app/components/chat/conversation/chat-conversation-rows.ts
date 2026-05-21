import type { ChatMessage } from "../types";

type ConversationRow =
    | {
        // 날짜 구분선 행인지 나타냅니다.
        type: "date-divider";
        // React 리스트 렌더링에 사용할 고유 키입니다.
        key: string;
        // 화면에 표시할 날짜 구분선 문구입니다.
        label: string;
    }
    | {
        // 실제 메시지 행인지 나타냅니다.
        type: "message";
        // React 리스트 렌더링에 사용할 고유 키입니다.
        key: string;
        // 말풍선 렌더링에 사용할 원본 메시지 데이터입니다.
        message: ChatMessage;
        // 이 메시지 위에 발신자 이름을 표시할지 결정합니다.
        showName: boolean;
        // 이 메시지 옆에 시간을 표시할지 결정합니다.
        showTime: boolean;
        // 읽지 않음 표시를 노출할지 결정합니다.
        showUnreadIndicator: boolean;
        // 연속된 메시지 묶음의 시작 지점인지 나타냅니다.
        isGroupStart: boolean;
        // 연속된 메시지 묶음의 끝 지점인지 나타냅니다.
        isGroupEnd: boolean;
    };

// 같은 날짜의 메시지는 하나의 날짜 구분선 아래에 묶고, 오늘/어제는 라벨을 덧붙여 보여줍니다.
function formatConversationDateLabel(createdAt: string) {
    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
        return "날짜 확인 필요";
    }

    const formattedDate = new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(date);

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const targetStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const differenceInDays = Math.round((todayStart.getTime() - targetStart.getTime()) / 86400000);

    if (differenceInDays === 0) {
        return `${formattedDate} (오늘)`;
    }

    if (differenceInDays === 1) {
        return `${formattedDate} (어제)`;
    }

    return formattedDate;
}

export function buildConversationRows(messages: ChatMessage[]): ConversationRow[] {
    const rows: ConversationRow[] = [];
    let lastRenderedDateKey: string | null = null;

    for (let index = 0; index < messages.length; index += 1) {
        const message = messages[index];
        const previousMessage = index > 0 ? messages[index - 1] : null;
        const nextMessage = messages[index + 1] ?? null;
        const dateKey = message.createdAt.slice(0, 10);
        const previousMessageDateKey = previousMessage?.createdAt.slice(0, 10) ?? null;
        const nextMessageDateKey = nextMessage?.createdAt.slice(0, 10) ?? null;
        const currentMinuteKey = message.createdAt.slice(0, 16);
        const nextMinuteKey = nextMessage?.createdAt.slice(0, 16) ?? null;
        // 발신자, 날짜, 분 단위 시각 변화에 따라 이름/시간/말풍선 묶음 경계를 계산합니다.
        const showName = !previousMessage || previousMessage.sender !== message.sender || previousMessageDateKey !== dateKey;
        const showUnreadIndicator = message.sender === "me"
            && !message.readAt
            && (!nextMessage || nextMessage.sender !== "me" || Boolean(nextMessage.readAt));
        const showTime = showUnreadIndicator
            || !nextMessage
            || nextMessage.sender !== message.sender
            || nextMinuteKey !== currentMinuteKey;
        const isGroupStart = previousMessage !== null && (previousMessage.sender !== message.sender || previousMessageDateKey !== dateKey);
        const isGroupEnd = !nextMessage || nextMessage.sender !== message.sender || nextMessageDateKey !== dateKey;

        if (dateKey !== lastRenderedDateKey) {
            rows.push({
                type: "date-divider",
                key: `date-divider-${dateKey}`,
                label: formatConversationDateLabel(message.createdAt),
            });
            lastRenderedDateKey = dateKey;
        }

        rows.push({
            type: "message",
            key: message.id,
            message,
            showName,
            showTime,
            showUnreadIndicator,
            isGroupStart,
            isGroupEnd,
        });
    }

    return rows;
}