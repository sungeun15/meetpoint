"use client";

import { useRef, useState } from "react";

import type { KakaoMapInstance, KakaoMarkerInstance } from "@/lib/kakao/map-loader";
import { loadKakaoMapSdk } from "@/lib/kakao/map-loader";
import { friendsBodyFont, friendsHeadingFont } from "../friends/fonts";
import { ModalShell } from "../shared/modal-shell";
import { createPersonMarkerImage } from "./recommendation/map/kakao-marker-icons";
import type { DepartureParty, ResolvedLocation } from "./types";

type PendingPinSelection = {
    address: string;
    latitude: number;
    longitude: number;
};

type PinSearchResult = {
    id: string;
    address: string;
    latitude: number;
    longitude: number;
};

type PinMapObjects = {
    sdk: Awaited<ReturnType<typeof loadKakaoMapSdk>>;
    map: KakaoMapInstance;
    marker: KakaoMarkerInstance;
    geocoder: {
        addressSearch: (
            addr: string,
            callback: (result: Array<{ address_name: string; x: string; y: string }>, status: string) => void,
            options?: {
                page?: number;
                size?: number;
                analyze_type?: string;
            },
        ) => void;
        coord2Address: (
            x: number,
            y: number,
            callback: (
                result: Array<{
                    address?: { address_name: string };
                    road_address?: { address_name: string };
                }>,
                status: string,
            ) => void,
        ) => void;
    };
};

type ChatPinPickerLayerProps = {
    party: DepartureParty;
    partyLabel: string;
    title?: string;
    description?: string;
    confirmLabel?: string;
    selectionPrompt?: string;
    emptySelectionMessage?: string;
    initialLocation?: ResolvedLocation | null;
    editableTitle?: {
        initialValue: string;
        label: string;
        placeholder: string;
    };
    onClose: () => void;
    onConfirm: (location: ResolvedLocation, nextTitle?: string) => void;
};

export function ChatPinPickerLayer({
    party,
    partyLabel,
    title,
    description,
    confirmLabel = "확인",
    selectionPrompt,
    emptySelectionMessage,
    initialLocation = null,
    editableTitle,
    onClose,
    onConfirm,
}: ChatPinPickerLayerProps) {
    const visibleSearchResultLimit = 8;
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapObjectsRef = useRef<PinMapObjects | null>(null);
    const [mapErrorMessage, setMapErrorMessage] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<PinSearchResult[]>([]);
    const [searchFeedbackMessage, setSearchFeedbackMessage] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [pendingSelection, setPendingSelection] = useState<PendingPinSelection | null>(null);
    const [draftTitle, setDraftTitle] = useState(editableTitle?.initialValue ?? "");

    function applyPendingSelection(address: string, latitude: number, longitude: number) {
        const mapObjects = mapObjectsRef.current;

        if (!mapObjects) {
            return;
        }

        const nextPosition = new mapObjects.sdk.maps.LatLng(latitude, longitude);
        mapObjects.map.setCenter(nextPosition);
        mapObjects.map.setLevel(3);
        mapObjects.marker.setPosition(nextPosition);
        mapObjects.marker.setMap(mapObjects.map);

        setMapErrorMessage(null);
        setPendingSelection({
            address,
            latitude,
            longitude,
        });
    }

    function handleSearchResultSelect(result: PinSearchResult) {
        applyPendingSelection(result.address, result.latitude, result.longitude);
        setSearchFeedbackMessage("검색 결과를 선택했어요. 아래에서 위치를 확인해 주세요.");
    }

    function handleSearchSubmit() {
        const normalizedQuery = searchQuery.trim();
        const mapObjects = mapObjectsRef.current;

        if (!normalizedQuery) {
            setSearchResults([]);
            setSearchFeedbackMessage("주소를 입력한 뒤 검색해 주세요.");
            return;
        }

        if (!mapObjects) {
            setSearchFeedbackMessage("지도를 아직 준비 중이에요. 잠시 후 다시 시도해 주세요.");
            return;
        }

        setIsSearching(true);
        setSearchFeedbackMessage(null);

        mapObjects.geocoder.addressSearch(
            normalizedQuery,
            (result, status) => {
                setIsSearching(false);

                if (status !== mapObjects.sdk.maps.services.Status.OK || result.length === 0) {
                    setSearchResults([]);
                    setSearchFeedbackMessage("검색 결과가 없어요. 다른 주소나 건물명으로 다시 검색해 주세요.");
                    return;
                }

                setSearchResults(
                    result.slice(0, visibleSearchResultLimit).map((item, index) => ({
                        id: `${item.address_name}-${index}`,
                        address: item.address_name,
                        latitude: Number(item.y),
                        longitude: Number(item.x),
                    })),
                );
                setSearchFeedbackMessage(`검색 결과 ${Math.min(result.length, visibleSearchResultLimit)}개를 찾았어요.`);
            },
            {
                analyze_type: mapObjects.sdk.maps.services.AnalyzeType.SIMILAR,
                size: visibleSearchResultLimit,
            },
        );
    }

    useEffect(() => {
        const container = mapContainerRef.current;

        if (!container) {
            return;
        }

        let isDisposed = false;

        async function setupMap() {
            try {
                const kakao = await loadKakaoMapSdk();

                if (isDisposed || !mapContainerRef.current) {
                    return;
                }

                const center = new kakao.maps.LatLng(37.5665, 126.978);
                const map = new kakao.maps.Map(mapContainerRef.current, {
                    center,
                    level: 4,
                });
                const zoomControl = new kakao.maps.ZoomControl();
                map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
                const marker = new kakao.maps.Marker({
                    map,
                    position: center,
                    image: createPersonMarkerImage(kakao, party),
                });
                marker.setMap(null);

                const geocoder = new kakao.maps.services.Geocoder();
                mapObjectsRef.current = {
                    sdk: kakao,
                    map,
                    marker,
                    geocoder,
                };

                kakao.maps.event.addListener(map, "click", (mouseEvent) => {
                    const clickedPosition = mouseEvent.latLng;
                    const latitude = clickedPosition.getLat();
                    const longitude = clickedPosition.getLng();

                    geocoder.coord2Address(longitude, latitude, (result, status) => {
                        if (isDisposed) {
                            return;
                        }

                        if (status !== kakao.maps.services.Status.OK || !result[0]) {
                            setMapErrorMessage("해당 위치의 주소를 불러오지 못했어요. 다른 지점을 선택해 주세요.");
                            setPendingSelection(null);
                            return;
                        }

                        const resolvedAddress = result[0].road_address?.address_name ?? result[0].address?.address_name;

                        if (!resolvedAddress) {
                            setMapErrorMessage("해당 위치의 주소를 확인하지 못했어요. 다른 지점을 선택해 주세요.");
                            setPendingSelection(null);
                            return;
                        }

                        applyPendingSelection(resolvedAddress, latitude, longitude);
                        setSearchFeedbackMessage("지도에서 위치를 선택했어요. 아래에서 확인해 주세요.");
                    });
                });

                if (initialLocation) {
                    const initialPosition = new kakao.maps.LatLng(initialLocation.latitude, initialLocation.longitude);
                    map.setCenter(initialPosition);
                    map.setLevel(3);
                    marker.setPosition(initialPosition);
                    marker.setMap(map);

                    geocoder.coord2Address(initialLocation.longitude, initialLocation.latitude, (result, status) => {
                        if (isDisposed) {
                            return;
                        }

                        const resolvedAddress = status === kakao.maps.services.Status.OK && result[0]
                            ? result[0].road_address?.address_name ?? result[0].address?.address_name ?? initialLocation.address
                            : initialLocation.address;

                        applyPendingSelection(resolvedAddress, initialLocation.latitude, initialLocation.longitude);
                        setSearchQuery(resolvedAddress);
                        setSearchFeedbackMessage("현재 저장된 위치를 불러왔어요. 주소를 검색하거나 지도를 눌러 다시 지정해 주세요.");
                    });
                }
            } catch (error) {
                if (!isDisposed) {
                    setMapErrorMessage(error instanceof Error ? error.message : "지도를 불러오지 못했어요.");
                }
            }
        }

        void setupMap();

        return () => {
            isDisposed = true;
            mapObjectsRef.current = null;
        };
    }, [initialLocation, party]);

    return (
        <ModalShell
            title={title ?? `${partyLabel} 핀 찍기`}
            description={description ?? "카카오맵에서 위치를 누르거나 주소를 검색해서 고를 수 있어요."}
            onClose={onClose}
            overlayClassName="z-81 bg-[#0f1020]/60"
            panelClassName="max-w-215 rounded-[26px] shadow-[0px_24px_70px_rgba(15,16,32,0.32)]"
            contentClassName="p-0"
        >
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_300px]">
                <div className="border-b border-[#ece9ff] bg-[#f8f6ff] p-3 lg:border-b-0 lg:border-r lg:p-4">
                    <div
                        ref={mapContainerRef}
                        className="h-[62vh] min-h-95 w-full overflow-hidden rounded-[20px] border border-[#e8e2ff] bg-[#ece8ff] sm:max-h-190"
                    />
                </div>

                <div className="flex flex-col gap-4 px-4 py-4 sm:px-5 sm:py-5">
                    <div className="rounded-[18px] border border-[#ece9ff] bg-white px-4 py-4">
                        <p className={`${friendsHeadingFont.className} text-[15px] text-[#111827] sm:text-[16px]`}>
                            주소 검색
                        </p>
                        <form
                            className="mt-3 flex flex-col gap-2"
                            onSubmit={(event) => {
                                event.preventDefault();
                                handleSearchSubmit();
                            }}
                        >
                            <input
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="예: 강남역 10번 출구, 판교역로 166"
                                className={`${friendsBodyFont.className} h-11 rounded-xl border border-[#ddd7ff] bg-[#faf8ff] px-4 text-[14px] text-[#111827] outline-none transition focus:border-[#6c5ce7]`}
                            />
                            <button
                                type="submit"
                                disabled={isSearching}
                                className={`${friendsHeadingFont.className} min-h-11 rounded-xl border border-[#ddd7ff] bg-white px-4 py-2 text-[14px] font-bold text-[#5b43d6] transition-colors hover:bg-[#f8f6ff] disabled:cursor-not-allowed disabled:opacity-60`}
                            >
                                {isSearching ? "주소 검색 중" : "주소 검색"}
                            </button>
                        </form>

                        {searchFeedbackMessage ? (
                            <p className={`${friendsBodyFont.className} mt-3 text-[12px] leading-[1.6] text-[#5f6782] sm:text-[13px]`}>
                                {searchFeedbackMessage}
                            </p>
                        ) : null}

                        {searchResults.length > 0 ? (
                            <div className="mt-3 max-h-83 overflow-y-auto pr-1">
                                <div className="grid gap-2">
                                    {searchResults.map((result) => (
                                        <button
                                            key={result.id}
                                            type="button"
                                            onClick={() => handleSearchResultSelect(result)}
                                            className="rounded-xl border border-[#ece9ff] bg-[#faf8ff] px-4 py-3 text-left transition-colors hover:bg-white"
                                        >
                                            <p className={`${friendsHeadingFont.className} text-[14px] text-[#111827] sm:text-[15px]`}>
                                                {result.address}
                                            </p>
                                            <p className={`${friendsBodyFont.className} mt-1 text-[11px] leading-[1.55] text-[#7a7399] sm:text-[12px]`}>
                                                위도 {result.latitude.toFixed(6)} · 경도 {result.longitude.toFixed(6)}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="rounded-[18px] border border-[#ece9ff] bg-white px-4 py-4">
                        <p className={`${friendsHeadingFont.className} text-[15px] text-[#111827] sm:text-[16px]`}>
                            선택한 위치 확인
                        </p>

                        {editableTitle ? (
                            <label className="mt-3 block">
                                <span className={`${friendsBodyFont.className} text-[12px] text-[#6b7280] sm:text-[13px]`}>
                                    {editableTitle.label}
                                </span>
                                <input
                                    value={draftTitle}
                                    onChange={(event) => setDraftTitle(event.target.value)}
                                    placeholder={editableTitle.placeholder}
                                    className={`${friendsBodyFont.className} mt-2 h-11 w-full rounded-xl border border-[#ddd7ff] bg-[#faf8ff] px-4 text-[14px] text-[#111827] outline-none transition focus:border-[#6c5ce7]`}
                                />
                            </label>
                        ) : null}

                        {mapErrorMessage ? (
                            <p className={`${friendsBodyFont.className} mt-3 text-[12px] leading-[1.6] text-[#d14343] sm:text-[13px]`}>
                                {mapErrorMessage}
                            </p>
                        ) : null}

                        {pendingSelection ? (
                            <>
                                <p className={`${friendsBodyFont.className} mt-3 text-[12px] text-[#6b7280] sm:text-[13px]`}>
                                    {selectionPrompt ?? `이 위치를 ${partyLabel} 출발 위치로 지정할까요?`}
                                </p>
                                <p className={`${friendsHeadingFont.className} mt-2 break-keep text-[15px] leading-[1.55] text-[#111827] sm:text-[16px]`}>
                                    {pendingSelection.address}
                                </p>
                                <p className={`${friendsBodyFont.className} mt-2 text-[11px] leading-[1.6] text-[#7a7399] sm:text-[12px]`}>
                                    위도 {pendingSelection.latitude.toFixed(6)} · 경도 {pendingSelection.longitude.toFixed(6)}
                                </p>
                                <div className="mt-4 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPendingSelection(null)}
                                        className={`${friendsBodyFont.className} min-h-11 flex-1 rounded-xl border border-[#ddd7ff] px-4 py-2 text-[13px] text-[#6b7280] transition-colors hover:bg-[#f8f6ff] sm:text-[14px]`}
                                    >
                                        다시 고르기
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onConfirm({
                                            label: pendingSelection.address,
                                            address: pendingSelection.address,
                                            latitude: pendingSelection.latitude,
                                            longitude: pendingSelection.longitude,
                                        }, editableTitle ? draftTitle : undefined)}
                                        disabled={Boolean(editableTitle && !draftTitle.trim())}
                                        className={`${friendsHeadingFont.className} min-h-11 flex-1 rounded-xl bg-[#6c5ce7] px-4 py-2 text-[14px] font-bold text-white transition-colors hover:bg-[#5b4ad2]`}
                                    >
                                        {confirmLabel}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p className={`${friendsBodyFont.className} mt-3 text-[12px] leading-[1.6] text-[#6b7280] sm:text-[13px]`}>
                                {emptySelectionMessage ?? "아직 고른 위치가 없어요. 지도에서 원하는 지점을 눌러 주세요."}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </ModalShell>
    );
}