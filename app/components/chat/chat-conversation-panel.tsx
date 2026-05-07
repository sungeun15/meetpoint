import type { FormEvent } from "react";

import { friendsGradientBackground } from "../friends/data";
import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../friends/fonts";
import type { FriendItem } from "../friends/types";
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
            <div className={`flex max-w-[92%] items-end gap-2.5 sm:max-w-[88%] sm:gap-3 lg:max-w-[min(84%,620px)] ${isMine ? "justify-end" : "justify-start"}`}>
                {!isMine ? (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d9d9d9] sm:h-10 sm:w-10 lg:h-11 lg:w-11" />
                ) : null}

                <div className={`space-y-1.5 sm:space-y-2 ${isMine ? "items-end" : "items-start"}`}>
                    {!isMine ? (
                        <p className={`${friendsDisplayFont.className} px-1 text-[14px] text-black sm:text-[16px] lg:text-[18px]`}>
                            {friendName}
                        </p>
                    ) : null}
                    <div
                        className={`${friendsHeadingFont.className} break-keep rounded-[16px] px-3.5 py-2.5 text-[16px] leading-[1.35] shadow-[0px_4px_10px_rgba(15,23,42,0.04)] sm:rounded-[18px] sm:px-4 sm:py-3 sm:text-[18px] lg:text-[20px] ${isMine
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
    return (
        <section className="overflow-hidden rounded-[22px] bg-white shadow-[0px_18px_44px_rgba(52,41,104,0.14)] sm:rounded-[24px] lg:rounded-[26px]">
            <div className="border-b border-[#ebe8fb] px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
                <p className={`${friendsDisplayFont.className} text-center text-[15px] text-[#4b5563] sm:text-[17px]`}>
                    ---오늘---
                </p>
            </div>

            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
                <div className="flex min-h-[280px] flex-col gap-3 sm:min-h-[320px] sm:gap-4 lg:min-h-[380px]">
                    {messages.length > 0 ? (
                        messages.map((message) => (
                            <ChatMessageItem
                                key={message.id}
                                message={message}
                                friendName={selectedFriend.nickname}
                            />
                        ))
                    ) : (
                        <div className="flex flex-1 items-center justify-center rounded-[18px] border border-dashed border-[#d1d5db] bg-[#fcfbff] px-5 py-10 text-center sm:py-12">
                            <div className="space-y-2">
                                <p className={`${friendsHeadingFont.className} break-keep text-[18px] text-[#111827] sm:text-[22px] lg:text-[24px]`}>
                                    아직 주고받은 메시지가 없습니다.
                                </p>
                                <p className={`${friendsDisplayFont.className} break-keep text-[14px] text-[#6b7280] sm:text-[16px] lg:text-[17px]`}>
                                    첫 메시지를 보내 대화를 시작해 보세요.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <form className="flex flex-col gap-3 border-t border-[#ebe8fb] pt-4 md:flex-row md:items-center" onSubmit={onSendMessage}>
                    <input
                        type="text"
                        value={draftMessage}
                        onChange={(event) => onDraftMessageChange(event.target.value)}
                        placeholder="메세지를 입력하세요."
                        className={`${friendsDisplayFont.className} h-12 flex-1 rounded-[12px] border-2 border-[#d1d5db] bg-white px-4 text-[15px] text-[#111827] outline-none transition focus:border-[#8b7cf6] focus:shadow-[0_0_0_4px_rgba(108,92,231,0.08)] sm:h-[54px] sm:text-[17px] lg:text-[20px]`}
                    />

                    <button
                        type="submit"
                        className={`${friendsHeadingFont.className} inline-flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-[12px] border-[3px] border-white px-6 py-2.5 text-[17px] font-bold text-white shadow-[0px_10px_24px_rgba(108,92,231,0.18)] transition-opacity hover:opacity-95 sm:min-h-[54px] sm:text-[18px] md:w-[136px]`}
                        style={{ backgroundImage: friendsGradientBackground }}
                    >
                        전송
                    </button>
                </form>

                {feedbackMessage ? (
                    <p className={`${friendsBodyFont.className} break-keep text-[12px] leading-[1.6] text-[#6c5ce7] sm:text-[13px] lg:text-[14px]`}>
                        {feedbackMessage}
                    </p>
                ) : null}
            </div>
        </section>
    );
}