import { useEffect, useState } from "react";

import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../../friends/fonts";
import { ChatActionButton, ChatSectionCard } from "../chat-ui";
import type { LocationMapMarkerVariant, ResolvedLocation } from "../types";

type ChatLocationStatusPanelProps = {
    // 내 위치 상태 요약 문구입니다.
    myLocationStatus: string;
    // 친구 위치 상태 요약 문구입니다.
    friendLocationStatus: string;
    // 마지막 공유 시각 라벨입니다.
    lastSharedAt: string | null;
    // 내 위치를 저장 레이어로 넘길 수 있는 상태인지 나타냅니다.
    canSaveMyLocation: boolean;
    // 친구 위치를 저장 레이어로 넘길 수 있는 상태인지 나타냅니다.
    canSaveFriendLocation: boolean;
    // 내 위치 저장 레이어에 미리 채울 문자열입니다.
    myLocationPreviewValue: string;
    // 친구 위치 저장 레이어에 미리 채울 문자열입니다.
    friendLocationPreviewValue: string;
    // 현재 해석된 내 위치 정보입니다.
    myResolvedLocation: ResolvedLocation | null;
    // 현재 해석된 친구 위치 정보입니다.
    friendResolvedLocation: ResolvedLocation | null;
    // 위치 맵 레이어를 엽니다.
    onOpenLocationMap: (
        title: string,
        description: string,
        location: ResolvedLocation | null,
        markerVariant?: LocationMapMarkerVariant,
    ) => void;
    // 현재 친구에게 위치 공유를 실행합니다.
    onShareLocationToFriend: () => void;
    // 친구 전체에게 위치 공유를 실행합니다.
    onShareLocationToAllFriends: () => void;
    // 위치 저장 레이어를 엽니다.
    onOpenSaveLocationLayer: (
        party: "me" | "friend",
        previewValue: string,
        sourceLabel: string,
        resolvedLocation?: ResolvedLocation,
        locationKind?: "recent" | "preset",
    ) => void;
};

export function ChatLocationStatusPanel({
    myLocationStatus,
    friendLocationStatus,
    lastSharedAt,
    canSaveMyLocation,
    canSaveFriendLocation,
    myLocationPreviewValue,
    friendLocationPreviewValue,
    myResolvedLocation,
    friendResolvedLocation,
    onOpenLocationMap,
    onShareLocationToFriend,
    onShareLocationToAllFriends,
    onOpenSaveLocationLayer,
}: ChatLocationStatusPanelProps) {
    const [isMobileStatusCollapsed, setIsMobileStatusCollapsed] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!feedbackMessage) return;

        const timeoutId = setTimeout(() => {
            setFeedbackMessage(null);
        }, 3000);

        return () => clearTimeout(timeoutId);
    }, [feedbackMessage]);

    return (
        <ChatSectionCard className="min-w-0 overflow-hidden px-3 py-3 sm:px-5 sm:py-4.5 lg:px-6">
            <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0 flex-1 space-y-1.5 sm:space-y-2">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-center justify-between gap-2 md:block">
                            <h3 className={`${friendsHeadingFont.className} text-[17px] font-bold text-[#111827] sm:text-[21px] lg:text-[24px]`}>
                                위치 상태
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsMobileStatusCollapsed((currentValue) => !currentValue)}
                                className="rounded-full border border-[#ddd8ff] bg-white/82 px-2.5 py-1 text-[11px] font-semibold text-[#5f47d2] sm:hidden"
                            >
                                {isMobileStatusCollapsed ? "펼치기" : "접기"}
                            </button>
                        </div>
                        <p className={`${friendsBodyFont.className} text-[11px] leading-[1.55] text-[#6b7280] md:max-w-[220px] md:text-right md:text-[13px]`}>
                            현재 공유 상태를 빠르게 확인해요.
                        </p>
                    </div>

                    <p className={`${friendsBodyFont.className} text-[10px] text-[#7a7399] md:hidden`}>
                        {lastSharedAt ? `마지막 공유 ${lastSharedAt}` : "아직 위치 공유 전"}
                    </p>

                    <div className={`${isMobileStatusCollapsed ? "hidden" : "grid"} min-w-0 gap-2.5 md:grid-cols-2`}>
                        <div className="flex min-w-0 flex-col rounded-[18px] bg-[#f8f5ff] px-3 py-3 sm:px-3.5 sm:py-3.5">
                            <div className="flex flex-col gap-1.5 md:flex-row md:items-start md:gap-2.5">
                                <p className={`${friendsDisplayFont.className} shrink-0 text-[11px] text-[#111827] sm:text-[14px] lg:text-[15px]`}>
                                    내 위치 상태
                                </p>
                                <p
                                    title={myLocationStatus}
                                    className={`${friendsBodyFont.className} min-w-0 flex-1 break-keep text-[10px] leading-[1.5] text-[#6b7280] md:text-[13px] lg:text-[14px]`}
                                >
                                    {myLocationStatus}
                                </p>
                            </div>
                            <p className={`${friendsBodyFont.className} mt-1.5 hidden text-[10px] text-[#7a7399] md:block md:text-[12px]`}>
                                마지막 공유 시각: {lastSharedAt ?? "아직 없음"}
                            </p>
                            <div className="mt-auto pt-2.5 grid gap-2 sm:grid-cols-2">
                                <ChatActionButton
                                    variant="outline"
                                    onClick={() => {
                                        if (!canSaveMyLocation) {
                                            setFeedbackMessage("내 위치를 먼저 공유해야 저장할 수 있어요.");
                                            return;
                                        }
                                        onOpenSaveLocationLayer("me", myLocationPreviewValue, "현재 위치", myResolvedLocation ?? undefined, "recent");
                                    }}
                                    className={`${friendsHeadingFont.className} min-h-9 w-full rounded-xl px-3 py-1.5 text-[12px] font-bold sm:min-h-11 sm:px-3.5 sm:py-2 sm:text-[14px]`}
                                >
                                    내 위치 저장
                                </ChatActionButton>

                                <ChatActionButton
                                    variant="outline"
                                    onClick={() => {
                                        if (!myResolvedLocation) {
                                            setFeedbackMessage("내 위치를 먼저 공유해야 지도에서 확인할 수 있어요.");
                                            return;
                                        }
                                        onOpenLocationMap(
                                            "내 위치",
                                            "현재 위치를 팝업 레이어 안에서 바로 확인합니다.",
                                            myResolvedLocation,
                                        );
                                    }}
                                    className={`${friendsHeadingFont.className} min-h-9 w-full rounded-xl px-3 py-1.5 text-[12px] font-bold sm:min-h-11 sm:px-3.5 sm:py-2 sm:text-[14px]`}
                                >
                                    맵 확인
                                </ChatActionButton>
                            </div>
                        </div>
                        <div className="flex min-w-0 flex-col rounded-[18px] bg-[#f8f5ff] px-3 py-3 sm:px-3.5 sm:py-3.5">
                            <div className="flex flex-col gap-1.5 md:flex-row md:items-start md:gap-2.5">
                                <p className={`${friendsDisplayFont.className} shrink-0 text-[11px] text-[#111827] sm:text-[14px] lg:text-[15px]`}>
                                    친구 위치 상태
                                </p>
                                <p
                                    title={friendLocationStatus}
                                    className={`${friendsBodyFont.className} min-w-0 flex-1 break-keep text-[10px] leading-[1.5] text-[#6b7280] md:text-[13px] lg:text-[14px]`}
                                >
                                    {friendLocationStatus}
                                </p>
                            </div>
                            <p className={`${friendsBodyFont.className} mt-1.5 hidden text-[10px] text-[#7a7399] md:block md:text-[12px]`}>
                                친구 좌표 기준 상태를 추천 지도와 함께 반영해요.
                            </p>
                            <div className="mt-auto pt-2.5 grid gap-2 sm:grid-cols-2">
                                <ChatActionButton
                                    variant="outline"
                                    onClick={() => {
                                        if (!canSaveFriendLocation) {
                                            setFeedbackMessage("친구가 아직 위치를 공유하지 않았어요.");
                                            return;
                                        }
                                        onOpenSaveLocationLayer("friend", friendLocationPreviewValue, "친구 위치", friendResolvedLocation ?? undefined, "recent");
                                    }}
                                    className={`${friendsHeadingFont.className} min-h-9 w-full rounded-xl px-3 py-1.5 text-[12px] font-bold sm:min-h-11 sm:px-3.5 sm:py-2 sm:text-[14px]`}
                                >
                                    친구 위치 저장
                                </ChatActionButton>

                                <ChatActionButton
                                    variant="outline"
                                    onClick={() => {
                                        if (!friendResolvedLocation) {
                                            setFeedbackMessage("친구가 아직 위치를 공유하지 않았어요.");
                                            return;
                                        }
                                        onOpenLocationMap(
                                            "친구 위치",
                                            "현재 위치를 팝업 레이어 안에서 바로 확인합니다.",
                                            friendResolvedLocation,
                                        );
                                    }}
                                    className={`${friendsHeadingFont.className} min-h-9 w-full rounded-xl px-3 py-1.5 text-[12px] font-bold sm:min-h-11 sm:px-3.5 sm:py-2 sm:text-[14px]`}
                                >
                                    맵 확인
                                </ChatActionButton>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid w-full shrink-0 gap-2 md:w-auto xl:min-w-48">
                    <ChatActionButton
                        onClick={onShareLocationToFriend}
                        className={`${friendsHeadingFont.className} min-h-10 w-full rounded-xl px-3.5 py-1.5 text-[13px] font-bold md:min-h-11.5 md:px-4 md:py-2 md:text-[15px]`}
                    >
                        현재 친구에게 공유
                    </ChatActionButton>
                    <ChatActionButton
                        variant="outline"
                        onClick={onShareLocationToAllFriends}
                        className={`${friendsHeadingFont.className} min-h-10 w-full rounded-xl px-3.5 py-1.5 text-[13px] font-bold md:min-h-11.5 md:px-4 md:py-2 md:text-[15px]`}
                    >
                        친구 전체에게 공유
                    </ChatActionButton>
                    <p className={`${friendsBodyFont.className} px-1 text-[11px] leading-[1.55] text-[#6b7280] md:max-w-52 md:text-[12px]`}>
                        자동으로 현재 위치를 찾지 못하면 지도에서 직접 위치를 지정하는 레이어가 바로 열려요.
                    </p>
                </div>
            </div>

            {feedbackMessage && (
                <div className="mt-3 rounded-[8px] bg-[#fef3f2] px-3 py-2 text-[12px] leading-[1.5] text-[#d32f2f]">
                    {feedbackMessage}
                </div>
            )}
        </ChatSectionCard>
    );
}