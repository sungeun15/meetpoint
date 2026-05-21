import { friendsBodyFont, friendsDisplayFont } from "../../friends/fonts";
import type { ChatMessage } from "../types";

type ChatConversationCollapsedPreviewProps = {
    friendName: string;
    latestMessage: ChatMessage | null;
    isLoadingMessages: boolean;
};

export function ChatConversationCollapsedPreview({
    friendName,
    latestMessage,
    isLoadingMessages,
}: ChatConversationCollapsedPreviewProps) {
    return (
        <div className="rounded-[18px] border border-dashed border-[#d8d2fb] bg-[#faf8ff] px-3 py-2.5 sm:hidden">
            {isLoadingMessages ? (
                <p className={`${friendsDisplayFont.className} text-[12px] text-[#6b7280]`}>
                    메시지를 불러오는 중이에요.
                </p>
            ) : latestMessage ? (
                <div className="space-y-1">
                    <p className={`${friendsBodyFont.className} text-[10px] text-[#7a7399]`}>
                        최근 대화 미리보기
                    </p>
                    <p className={`${friendsDisplayFont.className} truncate text-[12px] text-[#111827]`}>
                        {latestMessage.sender === "me" ? "나" : friendName}: {latestMessage.text}
                    </p>
                </div>
            ) : (
                <p className={`${friendsDisplayFont.className} text-[12px] text-[#6b7280]`}>
                    아직 대화가 없어 입력창에서 바로 시작할 수 있어요.
                </p>
            )}
        </div>
    );
}