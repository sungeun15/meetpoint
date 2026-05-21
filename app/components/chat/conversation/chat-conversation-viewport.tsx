import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../../friends/fonts";
import { FriendInitialAvatar } from "../../shared/friend-initial-avatar";
import type { ChatMessage } from "../types";
import { buildConversationRows } from "./chat-conversation-rows";

// 대화 viewport 전체를 그리기 위해 필요한 상위 입력값입니다.
type ChatConversationViewportProps = {
    // 현재 대화 상대 이름입니다.
    friendName: string;
    // 화면에 렌더링할 대화 메시지 목록입니다.
    messages: ChatMessage[];
    // 최신 메시지 본문을 처음 불러오는 중인지 나타냅니다.
    isLoadingMessages: boolean;
    // 스크롤 상단에서 과거 메시지를 추가로 불러오는 중인지 나타냅니다.
    isLoadingOlderMessages: boolean;
};

// 개별 말풍선 한 줄을 그릴 때 필요한 표시 규칙과 메시지 데이터입니다.
type ChatMessageItemProps = {
    // 실제 말풍선에 표시할 메시지 원본 데이터입니다.
    message: ChatMessage;
    // 친구가 보낸 메시지일 때 함께 보여줄 발신자 이름입니다.
    friendName: string;
    // 이 메시지 위에 친구 이름 라벨을 노출할지 결정합니다.
    showName: boolean;
    // 이 메시지 옆에 시각을 노출할지 결정합니다.
    showTime: boolean;
    // 내가 보낸 메시지에 읽지 않음 표시를 붙일지 결정합니다.
    showUnreadIndicator: boolean;
    // 같은 발신자의 연속 메시지 묶음에서 시작 지점인지 나타냅니다.
    isGroupStart: boolean;
    // 같은 발신자의 연속 메시지 묶음에서 끝 지점인지 나타냅니다.
    isGroupEnd: boolean;
};

const FRIEND_MESSAGE_NAME_CLASS_NAME = `${friendsBodyFont.className} px-1 text-[11px] text-[#4b5563] sm:text-[13px] lg:text-[15px]`;
const MESSAGE_BUBBLE_BASE_CLASS_NAME = `${friendsDisplayFont.className} break-keep rounded-[14px] px-2 py-2 text-[13px] leading-[1.45] tracking-[0.01em] shadow-[0px_4px_10px_rgba(15,23,42,0.04)] sm:rounded-[16px] sm:px-3 sm:py-2.5 sm:text-[15px] lg:text-[17px]`;
const MESSAGE_META_STACK_CLASS_NAME = "flex shrink-0 flex-col items-end gap-0.5 self-end sm:gap-1";
const MESSAGE_UNREAD_CLASS_NAME = `${friendsHeadingFont.className} shrink-0 text-[10px] leading-none text-[#f59e0b] sm:text-[11px]`;
const MESSAGE_TIME_CLASS_NAME = `${friendsBodyFont.className} shrink-0 translate-y-0.5 text-[9px] leading-none text-[#a5acbb] sm:text-[10px] lg:text-[11px]`;

function ChatMessageItem({ message, friendName, showName, showTime, showUnreadIndicator, isGroupStart, isGroupEnd }: ChatMessageItemProps) {
    const isMine = message.sender === "me";
    // 같은 발신자의 연속 메시지는 위아래 모서리를 살짝 열어 하나의 묶음처럼 보이게 합니다.
    const bubbleShapeClassName = isMine
        ? `${!isGroupStart ? "rounded-tr-[8px]" : ""} ${!isGroupEnd ? "rounded-br-[8px]" : ""}`
        : `${!isGroupStart ? "rounded-tl-[8px]" : ""} ${!isGroupEnd ? "rounded-bl-[8px]" : ""}`;

    return (
        <div className={`flex ${isMine ? "justify-end" : "justify-start"} ${isGroupStart ? "mt-3.5 sm:mt-4" : ""}`}>
            <div className={`flex max-w-[94%] items-end gap-2 sm:max-w-[88%] sm:gap-3 lg:max-w-[min(84%,620px)] ${isMine ? "justify-end" : "justify-start"}`}>
                {!isMine
                    ? showName
                        ? (
                            <FriendInitialAvatar
                                nickname={friendName}
                                className="h-7 w-7 text-[11px] sm:h-9 sm:w-9 sm:text-[14px] lg:h-10 lg:w-10 lg:text-[16px]"
                            />
                        )
                        : <div className="h-7 w-7 shrink-0 sm:h-9 sm:w-9 lg:h-10 lg:w-10" />
                    : null}

                <div className={`space-y-1.5 sm:space-y-2 ${isMine ? "items-end" : "items-start"}`}>
                    {!isMine && showName ? (
                        <p className={FRIEND_MESSAGE_NAME_CLASS_NAME}>
                            {friendName}
                        </p>
                    ) : null}
                    <div className={`flex items-end gap-1 sm:gap-1 ${isMine ? "justify-end" : "justify-start"}`}>
                        {isMine && (showUnreadIndicator || showTime) ? (
                            <div className={MESSAGE_META_STACK_CLASS_NAME}>
                                {showUnreadIndicator ? (
                                    <p className={MESSAGE_UNREAD_CLASS_NAME}>
                                        1
                                    </p>
                                ) : null}
                                {showTime ? (
                                    <p className={MESSAGE_TIME_CLASS_NAME}>
                                        {message.time}
                                    </p>
                                ) : null}
                            </div>
                        ) : null}
                        <div
                            className={`${MESSAGE_BUBBLE_BASE_CLASS_NAME} ${bubbleShapeClassName} ${isMine
                                ? "bg-[#8378eb] text-[#fbfaff]"
                                : "bg-[#f0ecf8] text-[#273142]"
                                }`}
                        >
                            {message.text}
                        </div>
                        {!isMine && showTime ? (
                            <p className={MESSAGE_TIME_CLASS_NAME}>
                                {message.time}
                            </p>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ChatConversationViewport({ friendName, messages, isLoadingMessages, isLoadingOlderMessages }: ChatConversationViewportProps) {
    const conversationRows = buildConversationRows(messages);

    return (
        <div className="flex min-h-full flex-col gap-2 sm:gap-3">
            {isLoadingOlderMessages ? (
                <div className="sticky top-0 z-10 flex justify-center">
                    <div className="rounded-full border border-[#ddd8ff] bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-[#5f47d2] shadow-[0px_8px_18px_rgba(108,92,231,0.08)] backdrop-blur sm:text-[12px]">
                        이전 메시지를 불러오는 중...
                    </div>
                </div>
            ) : null}

            {/* 상단 추가 로딩 배너는 유지한 채, 본문은 로딩 > 실제 대화 > 빈 상태 순서로 렌더링합니다. */}
            {isLoadingMessages ? (
                <div className="space-y-3 sm:space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={`chat-message-skeleton-${index}`}
                            className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
                        >
                            <div className="max-w-[88%] rounded-[18px] bg-[#f3efff] px-4 py-3">
                                <div className="h-4 w-40 animate-pulse rounded-full bg-[#e1d8ff] sm:w-56" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : messages.length > 0 ? (
                conversationRows.map((row) => row.type === "date-divider" ? (
                    <div key={row.key} className="-mx-1 flex justify-center py-1.5">
                        <div className="inline-flex items-center rounded-full border border-[#ddd8ff] bg-white/92 px-3 py-1 shadow-[0px_8px_18px_rgba(108,92,231,0.08)] backdrop-blur sm:px-3.5">
                            <p className={`${friendsBodyFont.className} shrink-0 text-[11px] font-semibold text-[#7a7399] sm:text-[12px]`}>
                                {row.label}
                            </p>
                        </div>
                    </div>
                ) : (
                    <ChatMessageItem
                        key={row.key}
                        message={row.message}
                        friendName={friendName}
                        showName={row.showName}
                        showTime={row.showTime}
                        showUnreadIndicator={row.showUnreadIndicator}
                        isGroupStart={row.isGroupStart}
                        isGroupEnd={row.isGroupEnd}
                    />
                ))
            ) : (
                <div className="flex flex-1 items-center justify-center rounded-[18px] border border-dashed border-[#d1d5db] bg-[#fcfbff] px-4 py-8 text-center sm:px-5 sm:py-12">
                    <div className="space-y-2">
                        <p className={`${friendsHeadingFont.className} break-keep text-[16px] text-[#111827] sm:text-[22px] lg:text-[24px]`}>
                            아직 주고받은 메시지가 없습니다.
                        </p>
                        <p className={`${friendsDisplayFont.className} break-keep text-[13px] text-[#6b7280] sm:text-[16px] lg:text-[17px]`}>
                            첫 메시지를 보내 대화를 시작해 보세요.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}