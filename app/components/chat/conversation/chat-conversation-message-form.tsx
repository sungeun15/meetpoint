import type { FormEvent } from "react";

import { friendsDisplayFont, friendsHeadingFont } from "../../friends/fonts";
import { ChatActionButton } from "../chat-ui";

type ChatConversationMessageFormProps = {
    draftMessage: string;
    onDraftMessageChange: (nextValue: string) => void;
    onSendMessage: (event: FormEvent<HTMLFormElement>) => void;
};

// 모바일에서는 세로 배치, md 이상에서는 입력창과 전송 버튼을 한 줄로 정렬합니다.
const MESSAGE_FORM_CLASS_NAME = "flex flex-col gap-2 rounded-[16px] border-t border-[#ebe8fb] bg-[#faf9ff] px-1.5 pt-3.5 pb-1.5 md:flex-row md:items-center md:gap-3 md:rounded-[18px] md:px-0 md:pt-3 md:pb-0 md:bg-transparent";
const MESSAGE_INPUT_CLASS_NAME = `${friendsDisplayFont.className} h-[68px] flex-1 rounded-[11px] border-2 border-[#d8dbe6] bg-white px-3.5 py-3 text-[14px] text-[#111827] placeholder:text-[13px] placeholder:text-[#a3acbf] outline-none transition focus:border-[#8b7cf6] focus:shadow-[0_0_0_4px_rgba(108,92,231,0.08)] sm:h-[54px] sm:rounded-[12px] sm:px-4 sm:py-0 sm:text-[17px] sm:placeholder:text-[15px] lg:text-[20px]`;
const MESSAGE_SEND_BUTTON_CLASS_NAME = `${friendsHeadingFont.className} min-h-10 w-full rounded-[11px] px-3.5 py-1 text-[13px] font-bold sm:min-h-[54px] sm:rounded-[12px] sm:px-5 sm:py-1.5 sm:text-[18px] md:w-[112px] lg:w-[120px]`;

export function ChatConversationMessageForm({
    draftMessage,
    onDraftMessageChange,
    onSendMessage,
}: ChatConversationMessageFormProps) {
    return (
        <form className={MESSAGE_FORM_CLASS_NAME} onSubmit={onSendMessage}>
            <input
                type="text"
                value={draftMessage}
                onChange={(event) => onDraftMessageChange(event.target.value)}
                placeholder="메세지를 입력하세요."
                className={MESSAGE_INPUT_CLASS_NAME}
            />

            <ChatActionButton
                type="submit"
                className={MESSAGE_SEND_BUTTON_CLASS_NAME}
            >
                전송
            </ChatActionButton>
        </form>
    );
}