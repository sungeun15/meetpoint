import { useEffect, useRef, useState } from "react";

import { loadKakaoMapSdk } from "@/lib/kakao/map-loader";
import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../friends/fonts";
import { ModalShell } from "../shared/modal-shell";
import { ChatActionButton, ChatSectionCard } from "./chat-ui";
import type { ResolvedLocation } from "./types";

type ChatLocationStatusPanelProps = {
    myLocationStatus: string;
    friendLocationStatus: string;
    lastSharedAt: string | null;
    canSaveMyLocation: boolean;
    canSaveFriendLocation: boolean;
    myLocationPreviewValue: string;
    friendLocationPreviewValue: string;
    myResolvedLocation: ResolvedLocation | null;
    friendResolvedLocation: ResolvedLocation | null;
    onShareLocationToFriend: () => void;
    onShareLocationToAllFriends: () => void;
    onOpenSaveLocationLayer: (
        party: "me" | "friend",
        previewValue: string,
        sourceLabel: string,
        resolvedLocation?: ResolvedLocation,
        locationKind?: "recent" | "preset",
    ) => void;
};

type KakaoMapLayerState = {
    title: string;
    location: ResolvedLocation;
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
    onShareLocationToFriend,
    onShareLocationToAllFriends,
    onOpenSaveLocationLayer,
}: ChatLocationStatusPanelProps) {
    const [isMobileStatusCollapsed, setIsMobileStatusCollapsed] = useState(false);
    const kakaoMapContainerRef = useRef<HTMLDivElement | null>(null);
    const [kakaoMapLayerState, setKakaoMapLayerState] = useState<KakaoMapLayerState | null>(null);
    const [kakaoMapErrorMessage, setKakaoMapErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!kakaoMapLayerState || !kakaoMapContainerRef.current) {
            return;
        }

        let isDisposed = false;
        const container = kakaoMapContainerRef.current;
        container.innerHTML = "";
        setKakaoMapErrorMessage(null);

        loadKakaoMapSdk()
            .then((kakao) => {
                if (isDisposed || !kakaoMapContainerRef.current) {
                    return;
                }

                const position = new kakao.maps.LatLng(
                    kakaoMapLayerState.location.latitude,
                    kakaoMapLayerState.location.longitude,
                );
                const map = new kakao.maps.Map(kakaoMapContainerRef.current, {
                    center: position,
                    level: 3,
                    mapTypeId: kakao.maps.MapTypeId.ROADMAP,
                });
                const zoomControl = new kakao.maps.ZoomControl();
                map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

                new kakao.maps.Marker({
                    map,
                    position,
                });
            })
            .catch((error) => {
                if (!isDisposed) {
                    setKakaoMapErrorMessage(error instanceof Error ? error.message : "카카오맵을 불러오지 못했어요.");
                }
            });

        return () => {
            isDisposed = true;
            container.innerHTML = "";
        };
    }, [kakaoMapLayerState]);

    function handleOpenKakaoMapLayer(title: string, location: ResolvedLocation | null) {
        if (!location) {
            return;
        }

        setKakaoMapLayerState({ title, location });
    }

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
                        <div className="min-w-0 rounded-[18px] bg-[#f8f5ff] px-3 py-3 sm:px-3.5 sm:py-3.5">
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
                            <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                                <ChatActionButton
                                    variant="outline"
                                    onClick={() => onOpenSaveLocationLayer("me", myLocationPreviewValue, "현재 위치", myResolvedLocation ?? undefined, "recent")}
                                    disabled={!canSaveMyLocation}
                                    className={`${friendsHeadingFont.className} min-h-9 w-full rounded-xl px-3 py-1.5 text-[12px] font-bold sm:min-h-11 sm:px-3.5 sm:py-2 sm:text-[14px]`}
                                >
                                    내 위치 저장
                                </ChatActionButton>

                                {myResolvedLocation ? (
                                    <ChatActionButton
                                        variant="outline"
                                        onClick={() => handleOpenKakaoMapLayer("내 위치", myResolvedLocation)}
                                        className={`${friendsHeadingFont.className} min-h-9 w-full rounded-xl px-3 py-1.5 text-[12px] font-bold sm:min-h-11 sm:px-3.5 sm:py-2 sm:text-[14px]`}
                                    >
                                        맵 확인
                                    </ChatActionButton>
                                ) : null}
                            </div>
                        </div>
                        <div className="min-w-0 rounded-[18px] bg-[#f8f5ff] px-3 py-3 sm:px-3.5 sm:py-3.5">
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
                            <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                                <ChatActionButton
                                    variant="outline"
                                    onClick={() => onOpenSaveLocationLayer("friend", friendLocationPreviewValue, "친구 위치", friendResolvedLocation ?? undefined, "recent")}
                                    disabled={!canSaveFriendLocation}
                                    className={`${friendsHeadingFont.className} min-h-9 w-full rounded-xl px-3 py-1.5 text-[12px] font-bold sm:min-h-11 sm:px-3.5 sm:py-2 sm:text-[14px]`}
                                >
                                    친구 위치 저장
                                </ChatActionButton>

                                {friendResolvedLocation ? (
                                    <ChatActionButton
                                        variant="outline"
                                        onClick={() => handleOpenKakaoMapLayer("친구 위치", friendResolvedLocation)}
                                        className={`${friendsHeadingFont.className} min-h-9 w-full rounded-xl px-3 py-1.5 text-[12px] font-bold sm:min-h-11 sm:px-3.5 sm:py-2 sm:text-[14px]`}
                                    >
                                        맵 확인
                                    </ChatActionButton>
                                ) : null}
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

            {kakaoMapLayerState ? (
                <ModalShell
                    title={`${kakaoMapLayerState.title} 맵 확인`}
                    description="현재 위치를 팝업 레이어 안에서 바로 확인합니다."
                    onClose={() => setKakaoMapLayerState(null)}
                    panelClassName="mx-auto max-w-225"
                    contentClassName="px-0 py-0"
                    notice={(
                        <div className={`${friendsBodyFont.className} text-[12px] leading-5 text-[#5f6782]`}>
                            {kakaoMapLayerState.location.address}
                            <br />
                            위도 {kakaoMapLayerState.location.latitude.toFixed(5)} · 경도 {kakaoMapLayerState.location.longitude.toFixed(5)}
                        </div>
                    )}
                >
                    {kakaoMapErrorMessage ? (
                        <div className="flex h-[58vh] min-h-90 items-center justify-center bg-[#f8f6ff] px-4 text-center">
                            <p className={`${friendsBodyFont.className} text-[13px] text-[#6b7280]`}>
                                {kakaoMapErrorMessage}
                            </p>
                        </div>
                    ) : (
                        <div
                            ref={kakaoMapContainerRef}
                            className="h-[58vh] min-h-90 w-full border-0"
                        />
                    )}
                </ModalShell>
            ) : null}
        </ChatSectionCard>
    );
}
