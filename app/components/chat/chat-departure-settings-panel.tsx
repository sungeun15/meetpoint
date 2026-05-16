import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { loadDaumPostcodeApi } from "@/lib/daum/postcode-loader";
import { loadKakaoMapSdk } from "@/lib/kakao/map-loader";
import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../friends/fonts";
import { buildDepartureSettingsGuideCopy } from "./recommendation/chat-recommendation-copy";
import { ChatActionButton, ChatSectionCard } from "./chat-ui";
import { mergeClassNames } from "./class-names";
import { ModalShell } from "../shared/modal-shell";
import { ChatPinPickerLayer } from "./chat-pin-picker-layer";
import type {
    DepartureInputMethod,
    DepartureParty,
    MeetingMode,
    RecommendationCategory,
    ResolvedLocation,
    SavedDeparture,
} from "./types";

const modeOptions: Array<{ id: MeetingMode; label: string; description: string }> = [
    { id: "now", label: "지금 만나기", description: "현재 공유 위치 기준으로 바로 추천을 받아요." },
    { id: "later", label: "나중에 만나기", description: "약속 출발 위치를 정한 뒤 추천을 받아요." },
];

const departureMethodOptions: Array<{ id: DepartureInputMethod; label: string }> = [
    { id: "search", label: "주소 검색" },
    { id: "pin", label: "지도 핀 지정" },
    { id: "saved", label: "저장 위치" },
];

const categoryOptions: Array<{ id: RecommendationCategory; label: string; description: string }> = [
    { id: "cafe", label: "카페", description: "대화 중심 약속" },
    { id: "meal", label: "식사", description: "식사 약속" },
    { id: "fun", label: "놀거리", description: "활동 중심 약속" },
];

const departurePartyMeta: Array<{ id: DepartureParty; label: string }> = [
    { id: "me", label: "내 출발 위치" },
    { id: "friend", label: "친구 출발 위치" },
];

const SAVED_DEPARTURE_PAGE_SIZE = 10;

type ChatDepartureSettingsPanelProps = {
    meetingMode: MeetingMode;
    selectedCategory: RecommendationCategory;
    departureInputMethod: DepartureInputMethod;
    departureSearchQueries: Record<DepartureParty, string>;
    visibleSavedDepartures: Record<DepartureParty, SavedDeparture[]>;
    selectedSavedDepartureIds: Record<DepartureParty, string>;
    selectedDepartureLabels: Record<DepartureParty, string | null> | null;
    selectedFriendName: string;
    canRecommend: boolean;
    onMeetingModeChange: (nextMode: MeetingMode) => void;
    onCategoryChange: (nextCategory: RecommendationCategory) => void;
    onDepartureInputMethodChange: (nextMethod: DepartureInputMethod) => void;
    onDepartureSearchQueryChange: (party: DepartureParty, nextQuery: string) => void;
    onOpenSaveLocationLayer: (
        party: DepartureParty,
        previewValue: string,
        sourceLabel: string,
        resolvedLocation?: ResolvedLocation,
        locationKind?: "recent" | "preset",
    ) => void;
    onPinnedDepartureSelect: (party: DepartureParty, pinnedLocation: ResolvedLocation) => void;
    onSavedDepartureSelect: (party: DepartureParty, departureId: string) => void;
    onDeleteSavedDeparture: (party: DepartureParty, departureId: string) => void;
    onDeleteAllSavedDepartures: (party: DepartureParty) => void;
    onUpdateSavedDeparture: (party: DepartureParty, departureId: string, title: string, resolvedLocation: ResolvedLocation) => Promise<boolean>;
    onRecommend: () => void;
};

type PostcodeLayerState = {
    party: DepartureParty;
    partyLabel: string;
    initialQuery: string;
};

type DeleteConfirmationState =
    | {
        kind: "single";
        party: DepartureParty;
        departureId: string;
        departureLabel: string;
    }
    | {
        kind: "all";
        party: DepartureParty;
        ownerLabel: string;
    };

type SavedDepartureMapLayerState = {
    title: string;
    departure: SavedDeparture;
};

function stripSavedDepartureLegacyTag(description: string) {
    return description.replace(/^(프리셋|최근 사용)\s*·\s*/u, "").trim();
}

function formatSavedDepartureDisplayTime(departure: SavedDeparture) {
    if (!departure.lastUsedAt) {
        return stripSavedDepartureLegacyTag(departure.description);
    }

    const date = new Date(departure.lastUsedAt);

    if (Number.isNaN(date.getTime())) {
        return stripSavedDepartureLegacyTag(departure.description);
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours24 = date.getHours();
    const meridiem = hours24 >= 12 ? "오후" : "오전";
    const hours12 = hours24 % 12 || 12;
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}.${month}.${day} ${meridiem} ${hours12}.${minutes}`;
}

type SavedDepartureResolvedAddressState = Record<string, {
    latitude: number;
    longitude: number;
    address: string;
}>;

type PinPickerLayerState =
    | {
        kind: "departure";
        party: DepartureParty;
    }
    | {
        kind: "saved-departure-edit";
        party: DepartureParty;
        departure: SavedDeparture;
    };

export function ChatDepartureSettingsPanel({
    meetingMode,
    selectedCategory,
    departureInputMethod,
    departureSearchQueries,
    visibleSavedDepartures,
    selectedSavedDepartureIds,
    selectedDepartureLabels,
    selectedFriendName,
    canRecommend,
    onMeetingModeChange,
    onCategoryChange,
    onDepartureInputMethodChange,
    onDepartureSearchQueryChange,
    onOpenSaveLocationLayer,
    onPinnedDepartureSelect,
    onSavedDepartureSelect,
    onDeleteSavedDeparture,
    onDeleteAllSavedDepartures,
    onUpdateSavedDeparture,
    onRecommend,
}: ChatDepartureSettingsPanelProps) {
    const postcodeContainerRef = useRef<HTMLDivElement | null>(null);
    const savedDepartureMapContainerRef = useRef<HTMLDivElement | null>(null);
    const departureSearchQueryChangeRef = useRef(onDepartureSearchQueryChange);
    const [postcodeLayerState, setPostcodeLayerState] = useState<PostcodeLayerState | null>(null);
    const [pinPickerLayerState, setPinPickerLayerState] = useState<PinPickerLayerState | null>(null);
    const [isMobileSettingsCollapsed, setIsMobileSettingsCollapsed] = useState(true);
    const [postcodeFeedbackMessage, setPostcodeFeedbackMessage] = useState<string | null>(null);
    const [deleteConfirmationState, setDeleteConfirmationState] = useState<DeleteConfirmationState | null>(null);
    const [savedDepartureMapLayerState, setSavedDepartureMapLayerState] = useState<SavedDepartureMapLayerState | null>(null);
    const [savedDepartureMapErrorMessage, setSavedDepartureMapErrorMessage] = useState<string | null>(null);
    const [savedDepartureResolvedAddresses, setSavedDepartureResolvedAddresses] = useState<SavedDepartureResolvedAddressState>({});
    const [savedDepartureVisibleCounts, setSavedDepartureVisibleCounts] = useState<Record<DepartureParty, number>>({
        me: SAVED_DEPARTURE_PAGE_SIZE,
        friend: SAVED_DEPARTURE_PAGE_SIZE,
    });
    const [savedDepartureFilterQueries, setSavedDepartureFilterQueries] = useState<Record<DepartureParty, string>>({
        me: "",
        friend: "",
    });
    const departurePartyLabels = {
        me: "내",
        friend: selectedFriendName,
    } satisfies Record<DepartureParty, string>;
    const selectedModeOption = modeOptions.find((option) => option.id === meetingMode) ?? modeOptions[0];
    const selectedCategoryOption = categoryOptions.find((option) => option.id === selectedCategory) ?? categoryOptions[0];
    const selectedDepartureMethodOption = departureMethodOptions.find((option) => option.id === departureInputMethod) ?? departureMethodOptions[0];
    const mobileSettingsSummary = meetingMode === "later"
        ? `${selectedModeOption.label} · ${selectedDepartureMethodOption.label} · ${selectedCategoryOption.label}`
        : `${selectedModeOption.label} · ${selectedCategoryOption.label}`;

    useEffect(() => {
        departureSearchQueryChangeRef.current = onDepartureSearchQueryChange;
    }, [onDepartureSearchQueryChange]);

    useEffect(() => {
        if (!postcodeLayerState || !postcodeContainerRef.current) {
            return;
        }

        let isDisposed = false;
        const container = postcodeContainerRef.current;
        container.innerHTML = "";

        loadDaumPostcodeApi()
            .then((daum) => {
                if (isDisposed || !postcodeContainerRef.current) {
                    return;
                }

                new daum.Postcode({
                    animation: true,
                    hideEngBtn: true,
                    popupTitle: `${postcodeLayerState.partyLabel} 출발 위치 찾기`,
                    width: "100%",
                    height: "100%",
                    oncomplete: async (data) => {
                        try {
                            const selectedAddress = data.userSelectedType === "J"
                                ? data.jibunAddress || data.address || data.roadAddress
                                : data.roadAddress || data.address || data.jibunAddress;

                            if (!selectedAddress) {
                                throw new Error("주소를 확인하지 못했어요. 다시 선택해 주세요.");
                            }

                            if (isDisposed) {
                                return;
                            }

                            departureSearchQueryChangeRef.current(postcodeLayerState.party, selectedAddress);
                            setPostcodeFeedbackMessage(`${postcodeLayerState.partyLabel} 출발 위치 주소를 입력란에 반영했어요.`);
                            setPostcodeLayerState(null);
                        } catch (error) {
                            setPostcodeFeedbackMessage(error instanceof Error ? error.message : "주소를 반영하지 못했어요.");
                        }
                    },
                    onclose: () => {
                        if (!isDisposed) {
                            setPostcodeLayerState(null);
                        }
                    },
                }).embed(postcodeContainerRef.current, {
                    autoClose: true,
                    q: postcodeLayerState.initialQuery || undefined,
                });
            })
            .catch((error) => {
                if (!isDisposed) {
                    setPostcodeLayerState(null);
                    setPostcodeFeedbackMessage(error instanceof Error ? error.message : "다음 주소 검색기를 열지 못했어요.");
                }
            });

        return () => {
            isDisposed = true;
            container.innerHTML = "";
        };
    }, [postcodeLayerState]);

    useEffect(() => {
        if (!savedDepartureMapLayerState || !savedDepartureMapContainerRef.current) {
            return;
        }

        let isDisposed = false;
        const container = savedDepartureMapContainerRef.current;
        container.innerHTML = "";
        setSavedDepartureMapErrorMessage(null);

        loadKakaoMapSdk()
            .then((kakao) => {
                if (isDisposed || !savedDepartureMapContainerRef.current) {
                    return;
                }

                const position = new kakao.maps.LatLng(
                    savedDepartureMapLayerState.departure.latitude,
                    savedDepartureMapLayerState.departure.longitude,
                );
                const map = new kakao.maps.Map(savedDepartureMapContainerRef.current, {
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
                    setSavedDepartureMapErrorMessage(error instanceof Error ? error.message : "카카오맵을 불러오지 못했어요.");
                }
            });

        return () => {
            isDisposed = true;
            container.innerHTML = "";
        };
    }, [savedDepartureMapLayerState]);

    useEffect(() => {
        const departures = Object.values(visibleSavedDepartures).flat();
        const unresolvedDepartures = departures.filter((departure) => {
            const cachedAddress = savedDepartureResolvedAddresses[departure.id];

            return !cachedAddress
                || cachedAddress.latitude !== departure.latitude
                || cachedAddress.longitude !== departure.longitude;
        });

        if (!unresolvedDepartures.length) {
            return;
        }

        let isDisposed = false;

        loadKakaoMapSdk()
            .then((kakao) => {
                if (isDisposed) {
                    return;
                }

                const geocoder = new kakao.maps.services.Geocoder();

                unresolvedDepartures.forEach((departure) => {
                    geocoder.coord2Address(departure.longitude, departure.latitude, (result, status) => {
                        if (isDisposed) {
                            return;
                        }

                        const nextAddress = status === kakao.maps.services.Status.OK && result[0]
                            ? result[0].road_address?.address_name ?? result[0].address?.address_name ?? departure.address
                            : departure.address;

                        setSavedDepartureResolvedAddresses((currentAddresses) => {
                            const currentAddress = currentAddresses[departure.id];

                            if (
                                currentAddress
                                && currentAddress.latitude === departure.latitude
                                && currentAddress.longitude === departure.longitude
                                && currentAddress.address === nextAddress
                            ) {
                                return currentAddresses;
                            }

                            return {
                                ...currentAddresses,
                                [departure.id]: {
                                    latitude: departure.latitude,
                                    longitude: departure.longitude,
                                    address: nextAddress,
                                },
                            };
                        });
                    });
                });
            })
            .catch(() => {
                // 주소 조회 실패 시에는 기존 라벨을 표시하도록 조용히 폴백합니다.
            });

        return () => {
            isDisposed = true;
        };
    }, [savedDepartureResolvedAddresses, visibleSavedDepartures]);

    function handleOpenDaumAddressSearch(party: DepartureParty) {
        setPostcodeLayerState({
            party,
            partyLabel: departurePartyLabels[party],
            initialQuery: departureSearchQueries[party].trim(),
        });
        setPostcodeFeedbackMessage(null);
    }

    function handleOpenPinPicker(party: DepartureParty) {
        setPinPickerLayerState({
            kind: "departure",
            party,
        });
    }

    function handleConfirmPinnedAddress(location: ResolvedLocation, nextTitle?: string) {
        if (!pinPickerLayerState) {
            return;
        }

        if (pinPickerLayerState.kind === "departure") {
            onPinnedDepartureSelect(pinPickerLayerState.party, location);
            setPinPickerLayerState(null);
            return;
        }

        void onUpdateSavedDeparture(
            pinPickerLayerState.party,
            pinPickerLayerState.departure.id,
            nextTitle ?? pinPickerLayerState.departure.label,
            location,
        ).then((didUpdate) => {
            if (didUpdate) {
                setPinPickerLayerState(null);
            }
        });
    }

    function handleDeleteSavedDepartureClick(party: DepartureParty, departureId: string, departureLabel: string) {
        setDeleteConfirmationState({
            kind: "single",
            party,
            departureId,
            departureLabel,
        });
    }

    function handleDeleteAllSavedDeparturesClick(party: DepartureParty) {
        const ownerLabel = party === "me" ? "내" : `${selectedFriendName}`;

        setDeleteConfirmationState({
            kind: "all",
            party,
            ownerLabel,
        });
    }

    function handleConfirmDelete() {
        if (!deleteConfirmationState) {
            return;
        }

        if (deleteConfirmationState.kind === "single") {
            onDeleteSavedDeparture(deleteConfirmationState.party, deleteConfirmationState.departureId);
        } else {
            onDeleteAllSavedDepartures(deleteConfirmationState.party);
        }

        setDeleteConfirmationState(null);
    }

    function handleShowMoreSavedDepartures(party: DepartureParty) {
        setSavedDepartureVisibleCounts((currentCounts) => ({
            ...currentCounts,
            [party]: currentCounts[party] + SAVED_DEPARTURE_PAGE_SIZE,
        }));
    }

    function handleOpenSavedDepartureMapLayer(party: DepartureParty, departure: SavedDeparture) {
        setSavedDepartureMapLayerState({
            title: party === "me" ? "내 출발 위치" : `${selectedFriendName} 출발 위치`,
            departure,
        });
    }

    function handleOpenSavedDepartureEditLayer(party: DepartureParty, departure: SavedDeparture) {
        setPinPickerLayerState({
            kind: "saved-departure-edit",
            party,
            departure,
        });
    }

    function handleSavedDepartureFilterQueryChange(party: DepartureParty, nextQuery: string) {
        setSavedDepartureFilterQueries((currentQueries) => ({
            ...currentQueries,
            [party]: nextQuery,
        }));
        setSavedDepartureVisibleCounts((currentCounts) => ({
            ...currentCounts,
            [party]: SAVED_DEPARTURE_PAGE_SIZE,
        }));
    }

    return (
        <ChatSectionCard tone="accent" className="relative overflow-hidden px-3.5 py-4 sm:px-5 sm:py-5 lg:px-6 xl:px-7">
            <Image
                alt="Background pattern"
                src="/imports/Frame3/background-pattern.svg"
                width={420}
                height={220}
                loading="eager"
                className="absolute bottom-0 right-0 h-auto w-45 opacity-20 sm:w-60 lg:w-85"
            />

            <div className="relative z-10 space-y-3.5 sm:space-y-4">
                <div className="flex flex-col gap-3.5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="max-w-md space-y-2.5 sm:space-y-3">
                        <h3 className={`${friendsHeadingFont.className} text-[20px] font-bold text-[#111827] sm:text-[24px] lg:text-[28px]`}>
                            추천 조건 정하기
                        </h3>
                        <p className={`${friendsDisplayFont.className} hidden break-keep text-[12px] leading-[1.6] text-[#6b7280] sm:block sm:text-[14px] lg:text-[16px]`}>
                            {buildDepartureSettingsGuideCopy()}
                        </p>
                    </div>

                    <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-end xl:shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsMobileSettingsCollapsed((currentValue) => !currentValue)}
                            className="flex w-full items-center justify-between gap-3 rounded-[18px] border border-[#e2dcff] bg-[#f7f4ff] px-3.5 py-3 text-left lg:hidden"
                        >
                            <div className="min-w-0">
                                <p className={`${friendsHeadingFont.className} text-[15px] text-[#111827]`}>
                                    추천 조건
                                </p>
                                <p className={`${friendsBodyFont.className} mt-1 truncate text-[11px] text-[#6b7280]`}>
                                    {isMobileSettingsCollapsed ? mobileSettingsSummary : "세부 조건을 펼쳐서 수정 중이에요."}
                                </p>
                            </div>
                            <span className="shrink-0 text-[18px] leading-none text-[#6c5ce7]">
                                {isMobileSettingsCollapsed ? "▾" : "▴"}
                            </span>
                        </button>

                        <ChatActionButton
                            variant="accent"
                            onClick={onRecommend}
                            disabled={!canRecommend}
                            className={`${friendsHeadingFont.className} min-h-12 w-full rounded-2xl px-5 py-2.5 text-[16px] font-bold leading-none disabled:cursor-not-allowed disabled:opacity-55 md:min-h-14 md:w-auto md:px-7 md:py-3.5 md:text-[18px] xl:shrink-0`}
                        >
                            추천 받기
                        </ChatActionButton>
                    </div>
                </div>

                <div className={`${isMobileSettingsCollapsed ? "hidden" : "grid"} gap-3 lg:grid`}>
                    <div className="rounded-[18px] bg-white/72 px-3.5 py-3.5 shadow-[0px_12px_24px_rgba(52,41,104,0.08)] sm:px-4 sm:py-4">
                        <p className={`${friendsDisplayFont.className} text-[13px] text-[#111827] sm:text-[16px]`}>
                            만남 모드
                        </p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {modeOptions.map((option) => {
                                const isSelected = meetingMode === option.id;

                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => onMeetingModeChange(option.id)}
                                        className={mergeClassNames(
                                            "rounded-2xl border px-3.5 py-2.5 text-left transition-colors sm:px-4 sm:py-3",
                                            isSelected
                                                ? "border-[#6c5ce7] bg-[#f5f1ff] shadow-[0px_10px_22px_rgba(108,92,231,0.12)]"
                                                : "border-white/60 bg-white/80 hover:bg-white",
                                        )}
                                    >
                                        <p className={`${friendsHeadingFont.className} text-[15px] text-[#111827] sm:text-[17px]`}>
                                            {option.label}
                                        </p>
                                        <p className={`${friendsBodyFont.className} mt-1 text-[11px] leading-[1.55] text-[#6b7280] sm:text-[13px]`}>
                                            {option.description}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {meetingMode === "later" ? (
                        <div className="rounded-[18px] bg-white/72 px-3.5 py-3.5 shadow-[0px_12px_24px_rgba(52,41,104,0.08)] sm:px-4 sm:py-4">
                            <p className={`${friendsDisplayFont.className} text-[13px] text-[#111827] sm:text-[16px]`}>
                                출발 위치
                            </p>
                            <p className={`${friendsBodyFont.className} mt-1.5 break-keep text-[11px] leading-[1.6] text-[#6b7280] sm:mt-2 sm:text-[13px]`}>
                                나중에 만나기에서는 내 출발 위치와 친구 출발 위치를 각각 정해야 추천 기준이 완성돼요.
                            </p>

                            {departureInputMethod === "search" && postcodeFeedbackMessage ? (
                                <div className="mt-3 rounded-[14px] border border-[#d9d4ff] bg-white/70 px-3.5 py-2.5 sm:px-4 sm:py-3">
                                    <p className={`${friendsBodyFont.className} text-[11px] leading-[1.55] text-[#5b43d6] sm:text-[13px]`}>
                                        {postcodeFeedbackMessage}
                                    </p>
                                </div>
                            ) : null}

                            <div className="mt-3 flex flex-wrap gap-2">
                                {departureMethodOptions.map((option) => {
                                    const isSelected = departureInputMethod === option.id;

                                    return (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => onDepartureInputMethodChange(option.id)}
                                            className={mergeClassNames(
                                                `${friendsBodyFont.className} rounded-full border px-2.5 py-1.5 text-[11px] transition-colors sm:px-3 sm:text-[13px]`,
                                                isSelected
                                                    ? "border-[#6c5ce7] bg-[#f5f1ff] text-[#5b43d6]"
                                                    : "border-white/60 bg-white/80 text-[#6b7280] hover:bg-white",
                                            )}
                                        >
                                            {option.label}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-4 grid gap-3 lg:grid-cols-2">
                                {departurePartyMeta.map((party) => (
                                    <div
                                        key={party.id}
                                        className={mergeClassNames(
                                            "rounded-2xl border px-3.5 py-3.5 shadow-[0px_12px_28px_rgba(52,41,104,0.08)] sm:px-4 sm:py-4",
                                            party.id === "me"
                                                ? "border-[#cfe0ff] bg-[linear-gradient(180deg,rgba(237,245,255,0.96)_0%,rgba(219,234,254,0.88)_100%)]"
                                                : "border-[#ffd3dd] bg-[linear-gradient(180deg,rgba(255,241,244,0.96)_0%,rgba(255,228,234,0.9)_100%)]",
                                        )}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <p className={`${friendsHeadingFont.className} text-[14px] text-[#111827] sm:text-[16px]`}>
                                                {party.id === "me" ? party.label : `${selectedFriendName} 출발 위치`}
                                            </p>
                                            <span
                                                className={mergeClassNames(
                                                    `${friendsBodyFont.className} rounded-full px-2.5 py-1 text-[10px] sm:text-[11px]`,
                                                    party.id === "me"
                                                        ? "bg-[#dbeafe] text-[#1d4ed8]"
                                                        : "bg-[#ffe4ea] text-[#be185d]",
                                                )}
                                            >
                                                {selectedDepartureLabels?.[party.id] ?? "선택 필요"}
                                            </span>
                                        </div>

                                        {departureInputMethod === "search" ? (
                                            <label className="mt-4 block">
                                                <span className={`${friendsBodyFont.className} text-[11px] text-[#6b7280] sm:text-[13px]`}>
                                                    {departurePartyLabels[party.id]} 주소
                                                </span>
                                                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                                                    <input
                                                        value={departureSearchQueries[party.id]}
                                                        readOnly
                                                        placeholder={party.id === "me" ? "예: 건대입구역 2번 출구" : `예: ${selectedFriendName} 출발역 1번 출구`}
                                                        className={`${friendsBodyFont.className} h-11 flex-1 rounded-[14px] border border-white/65 bg-[#f9f8ff] px-3.5 text-[13px] text-[#111827] outline-none sm:h-12 sm:px-4 sm:text-[14px]`}
                                                    />
                                                    <ChatActionButton
                                                        variant="outline"
                                                        onClick={() => handleOpenDaumAddressSearch(party.id)}
                                                        disabled={postcodeLayerState !== null}
                                                        className={`${friendsHeadingFont.className} min-h-11 rounded-xl px-3.5 py-2 text-[13px] font-bold sm:min-h-12 sm:min-w-33 sm:px-4 sm:text-[14px]`}
                                                    >
                                                        {postcodeLayerState?.party === party.id ? "주소 검색 표시 중" : "다음 주소 검색"}
                                                    </ChatActionButton>
                                                </div>
                                                <ChatActionButton
                                                    variant="outline"
                                                    onClick={() => onOpenSaveLocationLayer(party.id, departureSearchQueries[party.id], "주소 검색 기준", undefined, "preset")}
                                                    disabled={!departureSearchQueries[party.id].trim()}
                                                    className={`${friendsHeadingFont.className} mt-2.5 min-h-10 w-full rounded-xl px-3.5 py-2 text-[13px] font-bold sm:mt-3 sm:min-h-11 sm:w-auto sm:px-4 sm:text-[14px]`}
                                                >
                                                    {party.id === "me" ? "내 위치 저장" : "친구 위치 저장"}
                                                </ChatActionButton>
                                            </label>
                                        ) : null}

                                        {departureInputMethod === "pin" ? (
                                            <div className="mt-4">
                                                <p className={`${friendsBodyFont.className} text-[11px] text-[#6b7280] sm:text-[13px]`}>
                                                    지도 핀 선택 상태
                                                </p>
                                                <p className={`${friendsDisplayFont.className} mt-1.5 text-[13px] text-[#111827] sm:mt-2 sm:text-[15px]`}>
                                                    {selectedDepartureLabels?.[party.id] ?? "아직 선택한 핀 위치가 없어요."}
                                                </p>
                                                <ChatActionButton
                                                    variant="outline"
                                                    onClick={() => handleOpenPinPicker(party.id)}
                                                    className={`${friendsHeadingFont.className} mt-3 min-h-10 w-full rounded-xl px-3.5 py-2 text-[14px] font-bold sm:mt-4 sm:min-h-11 sm:w-auto sm:px-4 sm:text-[15px]`}
                                                >
                                                    {departurePartyLabels[party.id]} 핀 찍기
                                                </ChatActionButton>
                                                <ChatActionButton
                                                    variant="outline"
                                                    onClick={() => onOpenSaveLocationLayer(party.id, selectedDepartureLabels?.[party.id] ?? "", "지도 핀 기준", undefined, "preset")}
                                                    disabled={!selectedDepartureLabels?.[party.id]}
                                                    className={`${friendsHeadingFont.className} mt-2 min-h-10 w-full rounded-xl px-3.5 py-2 text-[14px] font-bold sm:min-h-11 sm:w-auto sm:px-4 sm:text-[15px]`}
                                                >
                                                    {party.id === "me" ? "내 위치 저장" : "친구 위치 저장"}
                                                </ChatActionButton>
                                            </div>
                                        ) : null}

                                        {departureInputMethod === "saved" ? (
                                            <div className="mt-4 grid gap-2">
                                                {visibleSavedDepartures[party.id].length > 0 ? (() => {
                                                    const normalizedFilterQuery = savedDepartureFilterQueries[party.id].trim().toLowerCase();
                                                    const filteredSavedDepartures = normalizedFilterQuery
                                                        ? visibleSavedDepartures[party.id].filter((departure) => {
                                                            const searchTarget = `${departure.label} ${departure.address} ${departure.description}`.toLowerCase();
                                                            return searchTarget.includes(normalizedFilterQuery);
                                                        })
                                                        : visibleSavedDepartures[party.id];
                                                    const visibleCount = savedDepartureVisibleCounts[party.id];
                                                    const pagedSavedDepartures = filteredSavedDepartures.slice(0, visibleCount);
                                                    const hasMoreSavedDepartures = filteredSavedDepartures.length > visibleCount;
                                                    const displayedSavedDepartureCount = Math.min(visibleCount, filteredSavedDepartures.length);
                                                    const savedDepartureSummaryLabel = `${displayedSavedDepartureCount} /${filteredSavedDepartures.length}건`;

                                                    return (
                                                        <div className={mergeClassNames(
                                                            "grid h-96 gap-2",
                                                            hasMoreSavedDepartures
                                                                ? "grid-rows-[auto_minmax(0,1fr)_auto]"
                                                                : "grid-rows-[auto_minmax(0,1fr)]",
                                                        )}>
                                                            <div className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-3.5 py-2 sm:px-4">
                                                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                                                    <p className={`${friendsHeadingFont.className} shrink-0 rounded-full bg-[#2f2a4a] px-2.5 py-1 text-[11px] text-white sm:px-3 sm:text-[12px]`}>
                                                                        {savedDepartureSummaryLabel}
                                                                    </p>
                                                                    <label className="min-w-0 flex-1">
                                                                        <span className="sr-only">{departurePartyLabels[party.id]} 저장 위치 검색</span>
                                                                        <input
                                                                            value={savedDepartureFilterQueries[party.id]}
                                                                            onChange={(event) => handleSavedDepartureFilterQueryChange(party.id, event.target.value)}
                                                                            placeholder="검색"
                                                                            className={`${friendsBodyFont.className} h-9 w-full rounded-full border border-white/70 bg-[#f9f8ff] px-3 text-[12px] text-[#111827] outline-none sm:h-10 sm:px-3.5 sm:text-[13px]`}
                                                                        />
                                                                    </label>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteAllSavedDeparturesClick(party.id)}
                                                                    className={`${friendsHeadingFont.className} shrink-0 rounded-full border border-[#fecdd3] bg-[#fff1f2] px-3 py-1.5 text-[11px] text-[#be123c] transition-colors hover:bg-[#ffe4e6] sm:text-[12px]`}
                                                                >
                                                                    전체 삭제
                                                                </button>
                                                            </div>

                                                            <div className="flex min-h-0 flex-col gap-2 overflow-y-auto pr-1">
                                                                {pagedSavedDepartures.length > 0 ? pagedSavedDepartures.map((departure) => {
                                                                    const isSelected = selectedSavedDepartureIds[party.id] === departure.id;
                                                                    const savedDepartureAddressLabel = savedDepartureResolvedAddresses[departure.id]?.address ?? departure.address;
                                                                    const savedDepartureTimeLabel = formatSavedDepartureDisplayTime(departure);

                                                                    return (
                                                                        <div
                                                                            key={`${party.id}-${departure.id}`}
                                                                            className="flex h-15 items-stretch gap-1.5"
                                                                        >
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => onSavedDepartureSelect(party.id, departure.id)}
                                                                                className={mergeClassNames(
                                                                                    "min-w-0 flex-1 overflow-hidden rounded-2xl border px-3.5 py-2 text-left transition-colors sm:px-4",
                                                                                    isSelected
                                                                                        ? "border-[#6c5ce7] bg-[#f5f1ff]"
                                                                                        : "border-white/60 bg-white/82 hover:bg-white",
                                                                                )}
                                                                            >
                                                                                <div className="flex h-full min-w-0 flex-col justify-center">
                                                                                    <p className={`${friendsHeadingFont.className} truncate text-[14px] text-[#111827] sm:text-[16px]`}>
                                                                                        {departure.label}
                                                                                    </p>
                                                                                    <p className={`${friendsBodyFont.className} truncate text-[11px] leading-[1.45] text-[#6b7280] sm:text-[13px]`}>
                                                                                        {`${savedDepartureAddressLabel} · ${savedDepartureTimeLabel}`}
                                                                                    </p>
                                                                                </div>
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleOpenSavedDepartureMapLayer(party.id, departure)}
                                                                                aria-label={`${departure.label} 위치 확인`}
                                                                                title="위치 확인"
                                                                                className="flex h-12 w-12 shrink-0 self-center items-center justify-center rounded-xl border border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8] transition-colors hover:bg-[#dbeafe]"
                                                                            >
                                                                                <span className="sr-only">위치 확인</span>
                                                                                <svg
                                                                                    aria-hidden="true"
                                                                                    viewBox="0 0 24 24"
                                                                                    className="h-4 w-4"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    strokeWidth="1.8"
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                >
                                                                                    <path d="M3.75 6.75 9 4.5l6 2.25 5.25-2.25v12.75L15 19.5 9 17.25l-5.25 2.25V6.75Z" />
                                                                                    <path d="M9 4.5v12.75" />
                                                                                    <path d="M15 6.75V19.5" />
                                                                                </svg>
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleOpenSavedDepartureEditLayer(party.id, departure)}
                                                                                aria-label={`${departure.label} 수정`}
                                                                                title="수정"
                                                                                className="flex h-12 w-12 shrink-0 self-center items-center justify-center rounded-xl border border-[#fed7aa] bg-[#fff7ed] text-[#c2410c] transition-colors hover:bg-[#ffedd5]"
                                                                            >
                                                                                <span className="sr-only">수정</span>
                                                                                <svg
                                                                                    aria-hidden="true"
                                                                                    viewBox="0 0 24 24"
                                                                                    className="h-4 w-4"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    strokeWidth="1.8"
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                >
                                                                                    <path d="m4 20 4.4-1 9.87-9.87a1.5 1.5 0 0 0 0-2.12l-1.28-1.28a1.5 1.5 0 0 0-2.12 0L5 15.6 4 20Z" />
                                                                                    <path d="m13.5 7.5 3 3" />
                                                                                </svg>
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleDeleteSavedDepartureClick(party.id, departure.id, departure.label)}
                                                                                aria-label={`${departure.label} 삭제`}
                                                                                title="삭제"
                                                                                className="flex h-12 w-12 shrink-0 self-center items-center justify-center rounded-xl border border-[#fecdd3] bg-[#fff1f2] text-[#be123c] transition-colors hover:bg-[#ffe4e6]"
                                                                            >
                                                                                <span className="sr-only">삭제</span>
                                                                                <svg
                                                                                    aria-hidden="true"
                                                                                    viewBox="0 0 24 24"
                                                                                    className="h-4 w-4"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    strokeWidth="1.8"
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                >
                                                                                    <path d="M3 6h18" />
                                                                                    <path d="M8 6V4.8c0-.66.54-1.2 1.2-1.2h5.6c.66 0 1.2.54 1.2 1.2V6" />
                                                                                    <path d="M6.8 6l.75 12.2c.04.68.61 1.2 1.29 1.2h6.32c.68 0 1.25-.52 1.29-1.2L17.2 6" />
                                                                                    <path d="M10 10.2v5.6" />
                                                                                    <path d="M14 10.2v5.6" />
                                                                                </svg>
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                }) : (
                                                                    <div className="rounded-2xl border border-dashed border-[#d9d4ff] bg-[#faf8ff] px-3.5 py-3.5 sm:px-4 sm:py-4">
                                                                        <p className={`${friendsHeadingFont.className} text-[15px] text-[#111827] sm:text-[16px]`}>
                                                                            검색 결과가 없어요.
                                                                        </p>
                                                                        <p className={`${friendsBodyFont.className} mt-1.5 text-[11px] leading-[1.55] text-[#6b7280] sm:mt-2 sm:text-[13px]`}>
                                                                            다른 이름이나 주소 키워드로 다시 찾아보세요.
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {hasMoreSavedDepartures ? (
                                                                <div className="flex justify-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleShowMoreSavedDepartures(party.id)}
                                                                        className={`${friendsHeadingFont.className} rounded-full border border-[#d9d4ff] bg-white/82 px-4 py-2 text-[12px] text-[#5b43d6] transition-colors hover:bg-white sm:text-[13px]`}
                                                                    >
                                                                        더보기
                                                                    </button>
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    );
                                                })() : (
                                                    <div className="rounded-2xl border border-dashed border-[#d9d4ff] bg-[#faf8ff] px-3.5 py-3.5 sm:px-4 sm:py-4">
                                                        <p className={`${friendsHeadingFont.className} text-[15px] text-[#111827] sm:text-[16px]`}>
                                                            저장된 출발 위치가 없어요.
                                                        </p>
                                                        <p className={`${friendsBodyFont.className} mt-1.5 text-[11px] leading-[1.55] text-[#6b7280] sm:mt-2 sm:text-[13px]`}>
                                                            로그인 사용자가 아직 즐겨찾기나 최근 출발 위치를 저장하지 않은 상태 UI입니다.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    <div className="rounded-[18px] bg-white/72 px-3.5 py-3.5 shadow-[0px_12px_24px_rgba(52,41,104,0.08)] sm:px-4 sm:py-4">
                        <p className={`${friendsDisplayFont.className} text-[13px] text-[#111827] sm:text-[16px]`}>
                            카테고리
                        </p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                            {categoryOptions.map((option) => {
                                const isSelected = selectedCategory === option.id;

                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => onCategoryChange(option.id)}
                                        className={mergeClassNames(
                                            "rounded-2xl border px-3.5 py-2.5 text-left transition-colors sm:px-4 sm:py-3",
                                            isSelected
                                                ? "border-[#6c5ce7] bg-[#f5f1ff] shadow-[0px_10px_22px_rgba(108,92,231,0.12)]"
                                                : "border-white/60 bg-white/80 hover:bg-white",
                                        )}
                                    >
                                        <p className={`${friendsHeadingFont.className} text-[14px] text-[#111827] sm:text-[16px]`}>
                                            {option.label}
                                        </p>
                                        <p className={`${friendsBodyFont.className} mt-1 text-[11px] leading-[1.55] text-[#6b7280] sm:text-[13px]`}>
                                            {option.description}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {postcodeLayerState ? (
                <ModalShell
                    title={`${postcodeLayerState.partyLabel} 출발 위치 검색`}
                    description="선택한 주소를 해당 주소 칸에 바로 채워 넣어요."
                    onClose={() => setPostcodeLayerState(null)}
                    panelClassName="max-w-180"
                    contentClassName="px-3 py-3 sm:px-5 sm:py-5"
                    notice={(
                        <p className={`${friendsBodyFont.className} text-[12px] leading-[1.55] text-[#5f6782] sm:text-[13px]`}>
                            팝업 대신 화면 안 레이어를 쓰기 때문에 모바일과 웹뷰 환경에서도 더 안전하게 동작합니다.
                        </p>
                    )}
                >
                    <div
                        ref={postcodeContainerRef}
                        className="h-[70vh] min-h-105 w-full overflow-hidden rounded-[18px] border border-[#ece9ff] bg-white sm:max-h-180"
                    />
                </ModalShell>
            ) : null}

            {pinPickerLayerState ? (
                <ChatPinPickerLayer
                    party={pinPickerLayerState.party}
                    partyLabel={departurePartyLabels[pinPickerLayerState.party]}
                    title={pinPickerLayerState.kind === "departure"
                        ? `${departurePartyLabels[pinPickerLayerState.party]} 출발 위치 핀 지정`
                        : `${departurePartyLabels[pinPickerLayerState.party]} 저장 위치 수정`}
                    description={pinPickerLayerState.kind === "departure"
                        ? "카카오맵에서 위치를 누르거나 주소를 검색해서 고를 수 있어요."
                        : "주소를 검색하거나 지도에서 핀을 다시 지정해 저장 위치를 수정할 수 있어요."}
                    confirmLabel={pinPickerLayerState.kind === "departure" ? "확인" : "수정하기"}
                    selectionPrompt={pinPickerLayerState.kind === "departure"
                        ? `이 위치를 ${departurePartyLabels[pinPickerLayerState.party]} 출발 위치로 지정할까요?`
                        : `이 위치로 ${pinPickerLayerState.departure.label} 저장 위치를 수정할까요?`}
                    emptySelectionMessage={pinPickerLayerState.kind === "departure"
                        ? "아직 고른 위치가 없어요. 지도에서 원하는 지점을 눌러 주세요."
                        : "현재 저장 위치를 불러오는 중이거나 아직 새 위치를 고르지 않았어요."}
                    editableTitle={pinPickerLayerState.kind === "saved-departure-edit"
                        ? {
                            initialValue: pinPickerLayerState.departure.label,
                            label: "저장 위치 제목",
                            placeholder: "예: 집, 회사, 학교 정문",
                        }
                        : undefined}
                    initialLocation={pinPickerLayerState.kind === "saved-departure-edit"
                        ? {
                            label: pinPickerLayerState.departure.label,
                            address: pinPickerLayerState.departure.label,
                            latitude: pinPickerLayerState.departure.latitude,
                            longitude: pinPickerLayerState.departure.longitude,
                        }
                        : null}
                    onClose={() => setPinPickerLayerState(null)}
                    onConfirm={handleConfirmPinnedAddress}
                />
            ) : null}

            {deleteConfirmationState ? (
                <ModalShell
                    title={deleteConfirmationState.kind === "single" ? "저장 위치 삭제" : "저장 위치 전체 삭제"}
                    description={deleteConfirmationState.kind === "single"
                        ? `"${deleteConfirmationState.departureLabel}" 저장 위치를 삭제할까요?`
                        : `${deleteConfirmationState.ownerLabel} 저장 위치를 모두 삭제할까요?`}
                    onClose={() => setDeleteConfirmationState(null)}
                    panelClassName="max-w-xl"
                    contentClassName="px-4 py-4 sm:px-5 sm:py-5"
                >
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={() => setDeleteConfirmationState(null)}
                            className={`${friendsHeadingFont.className} inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#ddd7ff] px-4 py-2 text-[14px] text-[#5b43d6] transition-colors hover:bg-[#f5f1ff] sm:min-w-28`}
                        >
                            취소
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmDelete}
                            className={`${friendsHeadingFont.className} inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#fecdd3] bg-[#fff1f2] px-4 py-2 text-[14px] text-[#be123c] transition-colors hover:bg-[#ffe4e6] sm:min-w-28`}
                        >
                            삭제하기
                        </button>
                    </div>
                </ModalShell>
            ) : null}

            {savedDepartureMapLayerState ? (
                <ModalShell
                    title={`${savedDepartureMapLayerState.title} 맵 확인`}
                    description={`${savedDepartureMapLayerState.departure.label} 위치를 확인합니다.`}
                    onClose={() => setSavedDepartureMapLayerState(null)}
                    panelClassName="mx-auto max-w-225"
                    contentClassName="px-0 py-0"
                    notice={(
                        <div className={`${friendsBodyFont.className} text-[12px] leading-5 text-[#5f6782]`}>
                            {savedDepartureResolvedAddresses[savedDepartureMapLayerState.departure.id]?.address ?? savedDepartureMapLayerState.departure.address}
                            <br />
                            {formatSavedDepartureDisplayTime(savedDepartureMapLayerState.departure)}
                        </div>
                    )}
                >
                    {savedDepartureMapErrorMessage ? (
                        <div className="flex h-[58vh] min-h-90 items-center justify-center bg-[#f8f6ff] px-4 text-center">
                            <p className={`${friendsBodyFont.className} text-[13px] text-[#6b7280]`}>
                                {savedDepartureMapErrorMessage}
                            </p>
                        </div>
                    ) : (
                        <div
                            ref={savedDepartureMapContainerRef}
                            className="h-[58vh] min-h-90 w-full border-0"
                        />
                    )}
                </ModalShell>
            ) : null}
        </ChatSectionCard>
    );
}