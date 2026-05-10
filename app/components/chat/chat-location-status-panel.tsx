import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../friends/fonts";
import { ChatActionButton, ChatSectionCard } from "./chat-ui";

type ChatLocationStatusPanelProps = {
    myLocationStatus: string;
    friendLocationStatus: string;
    canSaveMyLocation: boolean;
    canSaveFriendLocation: boolean;
    onShareLocation: () => void;
    onOpenSaveLocationLayer: (party: "me" | "friend", previewValue: string, sourceLabel: string) => void;
};

export function ChatLocationStatusPanel({
    myLocationStatus,
    friendLocationStatus,
    canSaveMyLocation,
    canSaveFriendLocation,
    onShareLocation,
    onOpenSaveLocationLayer,
}: ChatLocationStatusPanelProps) {
    return (
        <ChatSectionCard className="px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1 space-y-2.5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className={`${friendsHeadingFont.className} text-[20px] font-bold text-[#111827] sm:text-[22px] lg:text-[24px]`}>
                            위치 상태
                        </h3>
                        <p className={`${friendsBodyFont.className} text-[12px] text-[#6b7280] sm:text-[13px]`}>
                            현재 공유 상태를 빠르게 확인해요.
                        </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-[18px] bg-[#f8f5ff] px-4 py-3">
                            <div className="flex items-center gap-3">
                                <p className={`${friendsDisplayFont.className} shrink-0 text-[13px] text-[#111827] sm:text-[14px] lg:text-[15px]`}>
                                    내 위치 상태
                                </p>
                                <p
                                    title={myLocationStatus}
                                    className={`${friendsBodyFont.className} min-w-0 flex-1 truncate text-[12px] text-[#6b7280] sm:text-[13px] lg:text-[14px]`}
                                >
                                    {myLocationStatus}
                                </p>
                            </div>
                            <ChatActionButton
                                variant="outline"
                                onClick={() => onOpenSaveLocationLayer("me", myLocationStatus, "현재 위치 상태")}
                                disabled={!canSaveMyLocation}
                                className={`${friendsHeadingFont.className} mt-3 min-h-11 w-full rounded-xl px-4 py-2 text-[14px] font-bold`}
                            >
                                내 위치 저장
                            </ChatActionButton>
                        </div>
                        <div className="rounded-[18px] bg-[#f8f5ff] px-4 py-3">
                            <div className="flex items-center gap-3">
                                <p className={`${friendsDisplayFont.className} shrink-0 text-[13px] text-[#111827] sm:text-[14px] lg:text-[15px]`}>
                                    친구 위치 상태
                                </p>
                                <p
                                    title={friendLocationStatus}
                                    className={`${friendsBodyFont.className} min-w-0 flex-1 truncate text-[12px] text-[#6b7280] sm:text-[13px] lg:text-[14px]`}
                                >
                                    {friendLocationStatus}
                                </p>
                            </div>
                            <ChatActionButton
                                variant="outline"
                                onClick={() => onOpenSaveLocationLayer("friend", friendLocationStatus, "친구 위치 상태")}
                                disabled={!canSaveFriendLocation}
                                className={`${friendsHeadingFont.className} mt-3 min-h-11 w-full rounded-xl px-4 py-2 text-[14px] font-bold`}
                            >
                                친구 위치 저장
                            </ChatActionButton>
                        </div>
                    </div>
                </div>

                <ChatActionButton
                    onClick={onShareLocation}
                    className={`${friendsHeadingFont.className} min-h-[44px] w-full shrink-0 rounded-[12px] px-5 py-2 text-[15px] font-bold sm:w-auto sm:min-h-[46px] sm:text-[16px] lg:min-w-[148px]`}
                >
                    위치 공유하기
                </ChatActionButton>
            </div>
        </ChatSectionCard>
    );
}
