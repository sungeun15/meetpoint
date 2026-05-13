import { useState, type FormEvent } from "react";

import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../friends/fonts";
import type { FriendItem } from "../friends/types";
import { ChatActionButton, ChatSectionCard } from "./chat-ui";
import type { ChatMessage } from "./types";

type ChatConversationPanelProps = {
    selectedFriend: FriendItem;
    messages: ChatMessage[];
    draftMessage: string;
    onDraftMessageChange: (nextValue: string) => void;
    onSendMessage: (event: FormEvent<HTMLFormElement>) => void;
    feedbackMessage: string | null;
};

type ChatMessageItemProps = {
    message: ChatMessage;
    friendName: string;
};

function ChatMessageItem({ message, friendName }: ChatMessageItemProps) {
    const isMine = message.sender === "me";

    return (
        <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
            <div className={`flex max-w-[94%] items-end gap-2 sm:max-w-[88%] sm:gap-3 lg:max-w-[min(84%,620px)] ${isMine ? "justify-end" : "justify-start"}`}>
                {!isMine ? (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d9d9d9] sm:h-10 sm:w-10 lg:h-11 lg:w-11" />
                ) : null}

                <div className={`space-y-1.5 sm:space-y-2 ${isMine ? "items-end" : "items-start"}`}>
                    {!isMine ? (
                        <p className={`${friendsDisplayFont.className} px-1 text-[13px] text-black sm:text-[16px] lg:text-[18px]`}>
                            {friendName}
                        </p>
                    ) : null}
                    <div
                        className={`${friendsHeadingFont.className} break-keep rounded-[16px] px-3 py-2.5 text-[15px] leading-[1.35] shadow-[0px_4px_10px_rgba(15,23,42,0.04)] sm:rounded-[18px] sm:px-4 sm:py-3 sm:text-[18px] lg:text-[20px] ${isMine
                            ? "bg-[#6c5ce7] text-white"
                            : "bg-[#e5e7eb] text-[#111827]"
                            }`}
                    >
                        {message.text}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ChatConversationPanel({
    selectedFriend,
    messages,
    draftMessage,
    onDraftMessageChange,
    onSendMessage,
    feedbackMessage,
}: ChatConversationPanelProps) {
    const [isMobileConversationCollapsed, setIsMobileConversationCollapsed] = useState(true);
    const latestMessage = messages[messages.length - 1] ?? null;

    return (
        <ChatSectionCard className="overflow-hidden">
            <div className="border-b border-[#ebe8fb] px-3.5 py-2.5 sm:px-6 sm:py-4 lg:px-8">
                <div className="flex items-center justify-between gap-2">
                    <p className={`${friendsDisplayFont.className} text-center text-[14px] text-[#4b5563] sm:flex-1 sm:text-[17px]`}>
                        ---오늘---
                    </p>
                    <button
                        type="button"
                        onClick={() => setIsMobileConversationCollapsed((currentValue) => !currentValue)}
                        className="rounded-full border border-[#ddd8ff] bg-white/82 px-2.5 py-1 text-[11px] font-semibold text-[#5f47d2] sm:hidden"
                    >
                        {isMobileConversationCollapsed ? "대화 펼치기" : "대화 접기"}
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-3.5 px-3.5 py-3.5 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
                {isMobileConversationCollapsed ? (
                    <div className="rounded-[18px] border border-dashed border-[#d8d2fb] bg-[#faf8ff] px-3 py-2.5 sm:hidden">
                        {latestMessage ? (
                            <div className="space-y-1">
                                <p className={`${friendsBodyFont.className} text-[10px] text-[#7a7399]`}>
                                    최근 대화 미리보기
                                </p>
                                <p className={`${friendsDisplayFont.className} truncate text-[12px] text-[#111827]`}>
                                    {latestMessage.sender === "me" ? "나" : selectedFriend.nickname}: {latestMessage.text}
                                </p>
                            </div>
                        ) : (
                            <p className={`${friendsDisplayFont.className} text-[12px] text-[#6b7280]`}>
                                아직 대화가 없어 입력창에서 바로 시작할 수 있어요.
                            </p>
                        )}
                    </div>
                ) : null}

                <div className={`${isMobileConversationCollapsed ? "hidden sm:flex" : "flex"} min-h-[240px] flex-col gap-3 sm:min-h-[300px] sm:gap-4 lg:min-h-[340px] xl:min-h-[380px]`}>
                    {messages.length > 0 ? (
                        messages.map((message) => (
                            <ChatMessageItem
                                key={message.id}
                                message={message}
                                friendName={selectedFriend.nickname}
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

                <form className="flex flex-col gap-2 border-t border-[#ebe8fb] pt-3 md:flex-row md:items-center" onSubmit={onSendMessage}>
                    <input
                        type="text"
                        value={draftMessage}
                        onChange={(event) => onDraftMessageChange(event.target.value)}
                        placeholder="메세지를 입력하세요."
                        className={`${friendsDisplayFont.className} h-10 flex-1 rounded-[12px] border-2 border-[#d1d5db] bg-white px-3 text-[13px] text-[#111827] outline-none transition focus:border-[#8b7cf6] focus:shadow-[0_0_0_4px_rgba(108,92,231,0.08)] sm:h-[54px] sm:px-4 sm:text-[17px] lg:text-[20px]`}
                    />

                    <ChatActionButton
                        type="submit"
                        className={`${friendsHeadingFont.className} min-h-10 w-full rounded-[12px] px-4 py-1.5 text-[14px] font-bold sm:min-h-[54px] sm:px-5 sm:text-[18px] md:w-[128px]`}
                    >
                        전송
                    </ChatActionButton>
                </form>

                {feedbackMessage ? (
                    <p className={`${friendsBodyFont.className} break-keep text-[11px] leading-[1.6] text-[#6c5ce7] sm:text-[13px] lg:text-[14px]`}>
                        {feedbackMessage}
                    </p>
                ) : null}
            </div>
        </ChatSectionCard>
    );
}