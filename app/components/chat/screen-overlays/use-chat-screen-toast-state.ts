import { useCallback, useState } from "react";

export type ChatScreenToastState = {
    id: number; // 같은 메시지라도 다시 표시되도록 고유하게 만드는 timestamp id 입니다.
    message: string; // 토스트에 보여 줄 본문입니다.
};

export function useChatScreenToastState() {
    const [chatScreenToast, setChatScreenToast] = useState<ChatScreenToastState | null>(null);

    const handleShowToast = useCallback((message: string) => {
        setChatScreenToast({
            id: Date.now(),
            message,
        });
    }, []);

    return {
        chatScreenToast,
        setChatScreenToast,
        handleShowToast,
    };
}