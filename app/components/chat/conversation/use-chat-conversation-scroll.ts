import { useEffect, useRef, type UIEvent } from "react";

// 대화 viewport 스크롤 훅이 판단에 사용할 입력값입니다.
type UseChatConversationScrollArgs = {
    // 이전 메시지를 더 불러올 수 있는 상태인지 나타냅니다.
    canLoadOlderMessages: boolean;
    // 최신 메시지 목록을 처음 불러오는 중인지 나타냅니다.
    isLoadingMessages: boolean;
    // 상단 스크롤로 과거 메시지를 추가 로드하는 중인지 나타냅니다.
    isLoadingOlderMessages: boolean;
    // 모바일에서 대화 영역이 접혀 있는지 나타냅니다.
    isMobileConversationCollapsed: boolean;
    // 최신 메시지가 바뀌었는지 감지하기 위한 키입니다.
    latestMessageKey: string;
    // 대화 상대가 바뀌었는지 감지하기 위한 친구 식별자입니다.
    selectedFriendId: string;
    // 메시지 개수 변화에 맞춰 스크롤 복원을 다시 계산하기 위한 값입니다.
    messageCount: number;
    // 이전 메시지를 실제로 불러오는 상위 콜백입니다.
    onLoadOlderMessages: () => Promise<boolean>;
};

const MOBILE_OLDER_MESSAGES_AUTOLOAD_THRESHOLD_PX = 72;
const DESKTOP_OLDER_MESSAGES_AUTOLOAD_THRESHOLD_PX = 120;

function getOlderMessagesAutoloadThresholdPx() {
    if (typeof window === "undefined") {
        return DESKTOP_OLDER_MESSAGES_AUTOLOAD_THRESHOLD_PX;
    }

    return window.innerWidth < 640
        ? MOBILE_OLDER_MESSAGES_AUTOLOAD_THRESHOLD_PX
        : DESKTOP_OLDER_MESSAGES_AUTOLOAD_THRESHOLD_PX;
}

export function useChatConversationScroll({
    canLoadOlderMessages,
    isLoadingMessages,
    isLoadingOlderMessages,
    isMobileConversationCollapsed,
    latestMessageKey,
    selectedFriendId,
    messageCount,
    onLoadOlderMessages,
}: UseChatConversationScrollArgs) {
    const conversationViewportRef = useRef<HTMLDivElement | null>(null);
    const previousScrollHeightRef = useRef(0);
    const shouldRestoreScrollPositionRef = useRef(false);

    async function handleLoadOlderClick() {
        if (isLoadingOlderMessages) {
            return;
        }

        const viewportElement = conversationViewportRef.current;

        if (viewportElement) {
            previousScrollHeightRef.current = viewportElement.scrollHeight;
            shouldRestoreScrollPositionRef.current = true;
        }

        const didLoadOlderMessages = await onLoadOlderMessages();

        if (!didLoadOlderMessages) {
            shouldRestoreScrollPositionRef.current = false;
            previousScrollHeightRef.current = 0;
        }
    }

    function handleConversationScroll(event: UIEvent<HTMLDivElement>) {
        if (!canLoadOlderMessages || isLoadingOlderMessages || isLoadingMessages || shouldRestoreScrollPositionRef.current) {
            return;
        }

        if (event.currentTarget.scrollTop <= getOlderMessagesAutoloadThresholdPx()) {
            void handleLoadOlderClick();
        }
    }

    // 새 메시지가 오거나 대화 상대가 바뀌면 기본적으로 맨 아래로 이동합니다.
    useEffect(() => {
        const viewportElement = conversationViewportRef.current;

        if (!viewportElement || viewportElement.offsetParent === null) {
            return;
        }

        const animationFrameId = window.requestAnimationFrame(() => {
            viewportElement.scrollTop = viewportElement.scrollHeight;
        });

        return () => {
            window.cancelAnimationFrame(animationFrameId);
        };
    }, [isMobileConversationCollapsed, latestMessageKey, selectedFriendId]);

    // 과거 메시지를 위에 붙인 직후에는 기존에 보던 위치가 유지되도록 스크롤 차이만큼 보정합니다.
    useEffect(() => {
        if (!shouldRestoreScrollPositionRef.current) {
            return;
        }

        const viewportElement = conversationViewportRef.current;

        if (!viewportElement) {
            shouldRestoreScrollPositionRef.current = false;
            previousScrollHeightRef.current = 0;
            return;
        }

        const animationFrameId = window.requestAnimationFrame(() => {
            const scrollDelta = viewportElement.scrollHeight - previousScrollHeightRef.current;
            viewportElement.scrollTop += scrollDelta;
            shouldRestoreScrollPositionRef.current = false;
            previousScrollHeightRef.current = 0;
        });

        return () => {
            window.cancelAnimationFrame(animationFrameId);
        };
    }, [messageCount]);

    return {
        conversationViewportRef,
        handleConversationScroll,
    };
}