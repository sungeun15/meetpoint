import type { Dispatch, SetStateAction } from "react";
import { useEffect, useMemo, useState } from "react";

import type { ApiResponse } from "@/lib/contracts/api";
import { resolveAddressCoordinates } from "@/lib/kakao/geocoder";

import type { FriendItem } from "../../friends/types";
import {
    MAX_RECOMMENDATION_COUNT,
    buildMapMarkers,
    buildRecommendationSummary,
    calculateMidpoint,
} from "../data";
import {
    buildPinnedDepartureAppliedFeedback,
    buildRecommendationRequirementMessage,
    buildRecommendationSuccessFeedback,
    buildSavedDepartureCreatedFeedback,
    buildSavedDepartureSelectedFeedback,
} from "./chat-recommendation-feedback";
import {
    buildPreviewRecommendationSummary,
    departurePartyOrder,
    buildSelectedDepartureLabels,
    buildSelectedSavedDepartures,
} from "./chat-recommendation-flow-helpers";
import { resolveDepartureLocation } from "./chat-recommendation-departure-resolver";
import {
    buildDepartureSummaryText,
    buildMidpointSummaryText,
    formatDrivingEstimate,
    formatDepartureSummaryLabel,
    formatRecommendationDistance,
    getMeetingModeLabel,
} from "./summary/chat-recommendation-summary";
import type {
    DepartureInputMethod,
    DepartureParty,
    MeetingMode,
    RecommendationSnapshot,
    RecommendationCategory,
    ResolvedLocation,
    SavedDeparture,
} from "../types";

type UseRecommendationFlowStateArgs = {
    activeFriendId: string; // 현재 대화 중인 친구 id이며 추천 snapshot을 친구별로 구분하는 키입니다.
    mySharedLocation: (ResolvedLocation & { sharedAt: string }) | null; // 현재 선택 친구에게 실제로 공유된 내 위치입니다.
    selectedFriend: FriendItem | null; // 위치/닉네임/마커 라벨 계산에 사용할 현재 선택 친구 정보입니다.
    setFeedbackMessage: Dispatch<SetStateAction<string | null>>; // 추천 진행 상태와 안내 문구를 상위 UI에 전달합니다.
};

type SavedDepartureApiItem = {
    id: string;
    label: string;
    lat: number;
    lng: number;
    locationKind: "recent" | "preset";
    lastUsedAt: string;
    createdAt: string;
    updatedAt: string;
};

type SavedDepartureListResponse = {
    departures: SavedDepartureApiItem[];
};

type SavedDepartureCreateResponse = {
    departure: SavedDepartureApiItem;
};

type SavedDepartureUpdateResponse = {
    departure: SavedDepartureApiItem;
};

type SavedDepartureUseResponse = {
    departure: SavedDepartureApiItem;
};

type SavedDepartureDeleteResponse = {
    deletedIds: string[];
};

const SAVED_DEPARTURE_OWNER_STORAGE_KEY = "meetpoint:departure-owner-map:v1";

type RecommendationApiPlace = {
    name: string;
    category: string;
    lat: number;
    lng: number;
    distanceA: number;
    distanceB: number;
    averageDistance: number;
    distanceGap: number;
    categoryPenalty: number;
    vitalityPenalty: number;
    score: number;
};

type RecommendationApiResponse = {
    midpoint: {
        lat: number;
        lng: number;
    };
    summary: {
        mode: MeetingMode;
        category: RecommendationCategory;
        radiusUsed: number;
    };
    places: RecommendationApiPlace[];
};

function formatRecommendationScoreLabel(score: number) {
    return `추천 점수 ${score}점`;
}

function metersToKilometers(distanceMeters: number) {
    return distanceMeters / 1000;
}

function buildRecommendationSnapshotFromApi(args: {
    response: RecommendationApiResponse;
    meetingMode: MeetingMode;
    selectedCategory: RecommendationCategory;
    friendName: string;
    myOrigin: ResolvedLocation;
    friendOrigin: ResolvedLocation;
    selectedDepartureLabels: Record<DepartureParty, string | null> | null;
}): RecommendationSnapshot {
    const midpoint = {
        latitude: args.response.midpoint.lat,
        longitude: args.response.midpoint.lng,
    };
    const cards = args.response.places.map((place, index) => ({
        id: `${args.friendName}-${place.name}-${index + 1}`,
        rank: index + 1,
        name: place.name,
        category: place.category,
        address: `위도 ${place.lat.toFixed(4)} · 경도 ${place.lng.toFixed(4)}`,
        myDistance: formatRecommendationDistance(metersToKilometers(place.distanceA)),
        friendDistance: formatRecommendationDistance(metersToKilometers(place.distanceB)),
        myDrivingEstimate: formatDrivingEstimate(metersToKilometers(place.distanceA)),
        friendDrivingEstimate: formatDrivingEstimate(metersToKilometers(place.distanceB)),
        latitude: place.lat,
        longitude: place.lng,
        scoreLabel: formatRecommendationScoreLabel(place.score),
    }));
    const summary = buildRecommendationSummary({
        modeLabel: getMeetingModeLabel(args.meetingMode),
        category: args.selectedCategory,
        departureLabel: args.meetingMode === "now"
            ? buildDepartureSummaryText(
                "현재 공유 위치 기준",
                formatDepartureSummaryLabel(args.myOrigin.address, "현재 위치"),
                args.friendName,
                formatDepartureSummaryLabel(args.friendOrigin.address, `${args.friendName} 위치`),
            )
            : buildDepartureSummaryText(
                "출발 위치 기준",
                formatDepartureSummaryLabel(args.selectedDepartureLabels?.me ?? args.myOrigin.address, "선택 필요"),
                args.friendName,
                formatDepartureSummaryLabel(args.selectedDepartureLabels?.friend ?? args.friendOrigin.address, `${args.friendName} 위치`),
            ),
        midpointLabel: `${buildMidpointSummaryText(args.response.midpoint.lat, args.response.midpoint.lng)}\n반경: ${args.response.summary.radiusUsed}m`,
    });
    const markers = buildMapMarkers({
        friendName: args.friendName,
        myLocation: args.meetingMode === "now" ? args.myOrigin : { ...args.myOrigin, sharedAt: null },
        friendLocation: args.meetingMode === "now" ? args.friendOrigin : { ...args.friendOrigin, sharedAt: null },
        midpoint,
        recommendationCards: cards,
    });

    return {
        summary,
        cards,
        markers,
    };
}

function formatSavedDepartureTimeLabel(isoDateTime: string) {
    const date = new Date(isoDateTime);

    if (Number.isNaN(date.getTime())) {
        return "시간 정보 없음";
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

function mapSavedDepartureApiItem(item: SavedDepartureApiItem): SavedDeparture {
    return {
        id: item.id,
        label: item.label,
        address: item.label,
        description: formatSavedDepartureTimeLabel(item.lastUsedAt),
        lastUsedAt: item.lastUsedAt,
        locationKind: item.locationKind,
        latitude: item.lat,
        longitude: item.lng,
    };
}

// 추천 조건 입력부터 snapshot 생성까지 recommendation 패널 전체 상태를 관리하는 훅입니다.
export function useRecommendationFlowState({
    activeFriendId,
    mySharedLocation,
    selectedFriend,
    setFeedbackMessage,
}: UseRecommendationFlowStateArgs) {
    const [recommendationSnapshots, setRecommendationSnapshots] = useState<Record<string, RecommendationSnapshot>>({});
    const [savedDepartures, setSavedDepartures] = useState<SavedDeparture[]>([]);
    const [savedDepartureOwners, setSavedDepartureOwners] = useState<Record<string, DepartureParty | null>>(() => {
        if (typeof window === "undefined") {
            return {};
        }

        try {
            const rawValue = window.localStorage.getItem(SAVED_DEPARTURE_OWNER_STORAGE_KEY);

            if (!rawValue) {
                return {};
            }

            const parsedValue = JSON.parse(rawValue) as Record<string, unknown>;

            return Object.entries(parsedValue).reduce<Record<string, DepartureParty>>((accumulator, [departureId, owner]) => {
                if (owner === "me" || owner === "friend") {
                    accumulator[departureId] = owner;
                }

                return accumulator;
            }, {});
        } catch {
            window.localStorage.removeItem(SAVED_DEPARTURE_OWNER_STORAGE_KEY);
            return {};
        }
    });
    const [meetingMode, setMeetingMode] = useState<MeetingMode>("now");
    const [selectedCategory, setSelectedCategory] = useState<RecommendationCategory>("cafe");
    const [departureInputMethod, setDepartureInputMethod] = useState<DepartureInputMethod>("search");
    const [departureSearchQueries, setDepartureSearchQueries] = useState<Record<DepartureParty, string>>({
        me: "",
        friend: "강남역",
    });
    const [selectedSavedDepartureIds, setSelectedSavedDepartureIds] = useState<Record<DepartureParty, string>>({ me: "", friend: "" });
    const [pinnedDepartureLabels, setPinnedDepartureLabels] = useState<Record<DepartureParty, string>>({
        me: "",
        friend: "",
    });
    const [pinnedDepartureLocations, setPinnedDepartureLocations] = useState<Record<DepartureParty, ResolvedLocation | null>>({
        me: null,
        friend: null,
    });

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        window.localStorage.setItem(SAVED_DEPARTURE_OWNER_STORAGE_KEY, JSON.stringify(savedDepartureOwners));
    }, [savedDepartureOwners]);

    useEffect(() => {
        let isMounted = true;

        async function loadSavedDepartures() {
            try {
                const response = await fetch("/api/location/departures?limit=20", {
                    method: "GET",
                    cache: "no-store",
                });
                const payload = (await response.json()) as ApiResponse<SavedDepartureListResponse>;

                if (!isMounted) {
                    return;
                }

                if (response.status === 401) {
                    window.location.href = "/login";
                    return;
                }

                if (!response.ok || !payload.ok) {
                    setFeedbackMessage(payload.ok ? "저장 위치 목록을 불러오지 못했습니다." : payload.error.message);
                    return;
                }

                setSavedDepartures(payload.data.departures.map(mapSavedDepartureApiItem));
            } catch {
                if (isMounted) {
                    setFeedbackMessage("네트워크 오류로 저장 위치 목록을 불러오지 못했습니다.");
                }
            }
        }

        void loadSavedDepartures();

        return () => {
            isMounted = false;
        };
    }, [setFeedbackMessage]);

    const savedDeparturesByParty = useMemo(
        () => departurePartyOrder.reduce<Record<DepartureParty, SavedDeparture[]>>((accumulator, party) => {
            accumulator[party] = savedDepartures.filter((departure) => {
                const owner = savedDepartureOwners[departure.id];

                return owner == null || owner === party;
            });
            return accumulator;
        }, { me: [], friend: [] }),
        [savedDepartureOwners, savedDepartures],
    );

    const effectiveSelectedSavedDepartureIds = useMemo(
        () => departurePartyOrder.reduce<Record<DepartureParty, string>>((accumulator, party) => {
            const departuresForParty = savedDeparturesByParty[party];
            const hasCurrentSelection = departuresForParty.some((departure) => departure.id === selectedSavedDepartureIds[party]);

            accumulator[party] = hasCurrentSelection
                ? selectedSavedDepartureIds[party]
                : departuresForParty[0]?.id ?? "";

            return accumulator;
        }, { me: "", friend: "" }),
        [savedDeparturesByParty, selectedSavedDepartureIds],
    );

    // 친구별로 캐시해 둔 추천 결과가 있으면 즉시 꺼내 쓰고, 없으면 미리보기 상태로 동작합니다.
    const activeRecommendationSnapshot = recommendationSnapshots[activeFriendId] ?? null;
    const friendName = selectedFriend?.nickname ?? "친구";
    // 친구 위치 snapshot을 recommendation 모듈에서 공통으로 쓰는 위치 형태로 정규화합니다.
    const friendLocation = useMemo(
        () => selectedFriend?.locationSnapshot
            ? {
                label: `${friendName} 현재 위치`,
                address: selectedFriend.locationSnapshot.address,
                latitude: selectedFriend.locationSnapshot.latitude,
                longitude: selectedFriend.locationSnapshot.longitude,
                sharedAt: selectedFriend.locationSnapshot.sharedAt ?? null,
            }
            : null,
        [friendName, selectedFriend],
    );
    // 현재 공유 위치 기반 중심점은 추천 전 미리보기 지도와 요약 카드에도 재사용됩니다.
    const liveMidpoint = calculateMidpoint(
        [mySharedLocation, friendLocation]
            .filter((location): location is NonNullable<typeof location> => Boolean(location))
            .map((location) => ({
                latitude: location.latitude,
                longitude: location.longitude,
            })),
    );
    const hasRecommendations = Boolean(activeRecommendationSnapshot);
    const visibleSavedDepartures = savedDeparturesByParty;
    const hasMyLocationStatusData = Boolean(mySharedLocation);
    const hasFriendLocationStatusData = Boolean(friendLocation);

    const selectedSavedDepartures = buildSelectedSavedDepartures(savedDepartures, effectiveSelectedSavedDepartureIds);

    // 입력 방식에 따라 최종 추천에 사용할 출발지 라벨을 계산합니다.
    const selectedDepartureLabels = buildSelectedDepartureLabels({
        meetingMode,
        departureInputMethod,
        departureSearchQueries,
        pinnedDepartureLabels,
        previewSelectedSavedDepartures: selectedSavedDepartures,
    });

    const recommendationCards = activeRecommendationSnapshot?.cards ?? [];
    const currentMyDepartureSummaryLabel = formatDepartureSummaryLabel(mySharedLocation?.address, "현재 위치");
    const currentFriendDepartureSummaryLabel = formatDepartureSummaryLabel(friendLocation?.address, `${friendName} 위치`);
    const selectedMeDepartureSummaryLabel = formatDepartureSummaryLabel(selectedDepartureLabels?.me, "선택 필요");
    const selectedFriendDepartureSummaryLabel = formatDepartureSummaryLabel(selectedDepartureLabels?.friend, "선택 필요");

    // 실제 추천 결과가 없어도 현재 입력 상태를 반영한 요약 카드를 먼저 보여 주기 위한 미리보기입니다.
    const previewRecommendationSummary = useMemo(
        () => buildPreviewRecommendationSummary({
            meetingMode,
            selectedCategory,
            mySharedLocation,
            friendLocation,
            friendName,
            currentMyDepartureSummaryLabel,
            currentFriendDepartureSummaryLabel,
            selectedMeDepartureSummaryLabel,
            selectedFriendDepartureSummaryLabel,
            liveMidpoint,
        }),
        [
            currentFriendDepartureSummaryLabel,
            currentMyDepartureSummaryLabel,
            friendLocation,
            friendName,
            liveMidpoint,
            meetingMode,
            mySharedLocation,
            selectedCategory,
            selectedFriendDepartureSummaryLabel,
            selectedMeDepartureSummaryLabel,
        ],
    );
    // 추천 결과가 있으면 snapshot 요약을, 없으면 입력 기반 미리보기를 사용합니다.
    const recommendationSummary = activeRecommendationSnapshot?.summary ?? previewRecommendationSummary;

    // 현재 모드 기준으로 추천 버튼을 눌러도 되는 최소 조건을 판단합니다.
    const canRecommend = meetingMode === "now"
        ? Boolean(mySharedLocation && friendLocation)
        : Boolean(selectedDepartureLabels?.me && selectedDepartureLabels?.friend);
    // 추천 전에는 사람 위치와 중심점만, 추천 후에는 장소 마커까지 포함한 배열을 사용합니다.
    const mapMarkers = activeRecommendationSnapshot?.markers ?? buildMapMarkers({
        friendName,
        myLocation: mySharedLocation,
        friendLocation,
        midpoint: liveMidpoint,
    });

    // 모임 방식이 바뀌면 추천 가능 조건과 피드백 문구를 함께 갱신합니다.
    function handleMeetingModeChange(nextMode: MeetingMode) {
        setMeetingMode(nextMode);

        if (nextMode === "now" && (!hasMyLocationStatusData || !hasFriendLocationStatusData)) {
            setFeedbackMessage("내 위치를 공유하면 친구 위치와 함께 중심점을 계산할 수 있어요.");
            return;
        }

        setFeedbackMessage(null);
    }

    // 추천 카테고리 변경 시 기존 안내 문구를 초기화합니다.
    function handleCategoryChange(nextCategory: RecommendationCategory) {
        setSelectedCategory(nextCategory);
        setFeedbackMessage(null);
    }

    // 출발 위치 입력 방식을 바꾸면 해당 방식에 맞는 미리보기 상태를 다시 정리합니다.
    function handleDepartureInputMethodChange(nextMethod: DepartureInputMethod) {
        setDepartureInputMethod(nextMethod);
        setFeedbackMessage(null);

        if (nextMethod === "search") {
            setDepartureSearchQueries({ me: "", friend: "" });
        }

    }

    // 검색 입력값은 참여자별 record 구조로 유지합니다.
    function handleDepartureSearchQueryChange(party: DepartureParty, nextQuery: string) {
        setDepartureSearchQueries((currentQueries) => ({
            ...currentQueries,
            [party]: nextQuery,
        }));
        setFeedbackMessage(null);
    }

    // 지도 핀으로 확정한 주소를 출발 위치 라벨로 저장하고 핀 모드로 전환합니다.
    function handlePinnedDepartureSelect(party: DepartureParty, pinnedLocation: ResolvedLocation) {
        setDepartureInputMethod("pin");
        setPinnedDepartureLabels((currentLabels) => ({
            ...currentLabels,
            [party]: pinnedLocation.address,
        }));
        setPinnedDepartureLocations((currentLocations) => ({
            ...currentLocations,
            [party]: pinnedLocation,
        }));
        setFeedbackMessage(buildPinnedDepartureAppliedFeedback(party, friendName));
    }

    // 저장된 출발 위치를 선택한 뒤 관련 미리보기와 피드백을 동기화합니다.
    async function handleSavedDepartureSelect(party: DepartureParty, departureId: string) {
        setDepartureInputMethod("saved");

        try {
            const response = await fetch("/api/location/departures/use", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    departureLocationId: departureId,
                }),
            });
            const payload = (await response.json()) as ApiResponse<SavedDepartureUseResponse>;

            if (response.status === 401) {
                window.location.href = "/login";
                return;
            }

            if (!response.ok || !payload.ok) {
                setFeedbackMessage(payload.ok ? "저장 위치 사용 처리 중 오류가 발생했습니다." : payload.error.message);
                return;
            }

            const nextDeparture = mapSavedDepartureApiItem(payload.data.departure);
            setSavedDepartures((currentSavedDepartures) => [
                nextDeparture,
                ...currentSavedDepartures.filter((departure) => departure.id !== nextDeparture.id),
            ]);
            setSelectedSavedDepartureIds((currentIds) => ({
                ...currentIds,
                [party]: departureId,
            }));
            setFeedbackMessage(buildSavedDepartureSelectedFeedback(party, friendName));
        } catch {
            setFeedbackMessage("네트워크 오류로 저장 위치를 선택하지 못했습니다.");
        }
    }

    async function handleDeleteSavedDeparture(party: DepartureParty, departureId: string) {
        try {
            const response = await fetch("/api/location/departures", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    departureLocationIds: [departureId],
                }),
            });
            const payload = (await response.json()) as ApiResponse<SavedDepartureDeleteResponse>;

            if (response.status === 401) {
                window.location.href = "/login";
                return;
            }

            if (!response.ok || !payload.ok) {
                setFeedbackMessage(payload.ok ? "저장 위치 삭제 중 오류가 발생했습니다." : payload.error.message);
                return;
            }

            if (!payload.data.deletedIds.length) {
                setFeedbackMessage("삭제할 저장 위치를 찾지 못했어요.");
                return;
            }

            const deletedIds = new Set(payload.data.deletedIds);

            setSavedDepartures((currentSavedDepartures) => currentSavedDepartures.filter((departure) => !deletedIds.has(departure.id)));
            setSavedDepartureOwners((currentOwners) => Object.fromEntries(
                Object.entries(currentOwners).filter(([savedDepartureId]) => !deletedIds.has(savedDepartureId)),
            ));
            setSelectedSavedDepartureIds((currentIds) => departurePartyOrder.reduce<Record<DepartureParty, string>>((accumulator, currentParty) => {
                accumulator[currentParty] = deletedIds.has(currentIds[currentParty]) ? "" : currentIds[currentParty];
                return accumulator;
            }, { me: "", friend: "" }));
            setFeedbackMessage(`${party === "me" ? "내" : `${friendName}의`} 저장 위치를 삭제했어요.`);
        } catch {
            setFeedbackMessage("네트워크 오류로 저장 위치를 삭제하지 못했습니다.");
        }
    }

    async function handleDeleteAllSavedDepartures(party: DepartureParty) {
        const departureLocationIds = visibleSavedDepartures[party].map((departure) => departure.id);

        if (!departureLocationIds.length) {
            setFeedbackMessage("삭제할 저장 위치가 없어요.");
            return;
        }

        try {
            const response = await fetch("/api/location/departures", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    departureLocationIds,
                }),
            });
            const payload = (await response.json()) as ApiResponse<SavedDepartureDeleteResponse>;

            if (response.status === 401) {
                window.location.href = "/login";
                return;
            }

            if (!response.ok || !payload.ok) {
                setFeedbackMessage(payload.ok ? "저장 위치 전체 삭제 중 오류가 발생했습니다." : payload.error.message);
                return;
            }

            if (!payload.data.deletedIds.length) {
                setFeedbackMessage("삭제할 저장 위치를 찾지 못했어요.");
                return;
            }

            const deletedIds = new Set(payload.data.deletedIds);

            setSavedDepartures((currentSavedDepartures) => currentSavedDepartures.filter((departure) => !deletedIds.has(departure.id)));
            setSavedDepartureOwners((currentOwners) => Object.fromEntries(
                Object.entries(currentOwners).filter(([savedDepartureId]) => !deletedIds.has(savedDepartureId)),
            ));
            setSelectedSavedDepartureIds((currentIds) => departurePartyOrder.reduce<Record<DepartureParty, string>>((accumulator, currentParty) => {
                accumulator[currentParty] = deletedIds.has(currentIds[currentParty]) ? "" : currentIds[currentParty];
                return accumulator;
            }, { me: "", friend: "" }));
            setFeedbackMessage(`${party === "me" ? "내" : `${friendName}의`} 저장 위치를 모두 삭제했어요.`);
        } catch {
            setFeedbackMessage("네트워크 오류로 저장 위치를 삭제하지 못했습니다.");
        }
    }

    async function handleUpdateSavedDeparture(
        party: DepartureParty,
        departureId: string,
        title: string,
        resolvedLocation: ResolvedLocation,
    ) {
        const normalizedTitle = title.trim();

        if (!normalizedTitle) {
            setFeedbackMessage("수정할 저장 위치 제목을 확인하지 못했어요.");
            return false;
        }

        try {
            const response = await fetch("/api/location/departures", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    departureLocationId: departureId,
                    label: normalizedTitle,
                    lat: resolvedLocation.latitude,
                    lng: resolvedLocation.longitude,
                }),
            });
            const payload = (await response.json()) as ApiResponse<SavedDepartureUpdateResponse>;

            if (response.status === 401) {
                window.location.href = "/login";
                return false;
            }

            if (!response.ok || !payload.ok) {
                setFeedbackMessage(payload.ok ? "저장 위치 수정 중 오류가 발생했습니다." : payload.error.message);
                return false;
            }

            const nextSavedDeparture = mapSavedDepartureApiItem(payload.data.departure);
            setSavedDepartures((currentSavedDepartures) => currentSavedDepartures.map((departure) => (
                departure.id === departureId ? nextSavedDeparture : departure
            )));
            setSelectedSavedDepartureIds((currentIds) => ({
                ...currentIds,
                [party]: departureId,
            }));
            setDepartureInputMethod("saved");
            setFeedbackMessage(`${party === "me" ? "내" : `${friendName}의`} 저장 위치를 수정했어요.`);
            return true;
        } catch {
            setFeedbackMessage("네트워크 오류로 저장 위치를 수정하지 못했습니다.");
            return false;
        }
    }

    // 현재 입력값을 저장 위치 preset으로 추가하고 바로 선택 상태에 반영합니다.
    async function handleCreateSavedDeparture(
        party: DepartureParty,
        title: string,
        previewValue: string,
        sourceLabel: string,
        resolvedLocation?: ResolvedLocation | null,
        locationKind: "recent" | "preset" = "preset",
    ) {
        const normalizedTitle = title.trim();
        const normalizedPreviewValue = previewValue.trim();

        if (!normalizedTitle) {
            setFeedbackMessage("저장할 제목을 입력해 주세요.");
            return false;
        }

        if (!normalizedPreviewValue) {
            setFeedbackMessage("저장할 위치 정보가 없어요.");
            return false;
        }

        try {
            const nextResolvedLocation = resolvedLocation ?? await resolveAddressCoordinates([normalizedPreviewValue]);
            const response = await fetch("/api/location/departures", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    label: normalizedTitle,
                    lat: nextResolvedLocation.latitude,
                    lng: nextResolvedLocation.longitude,
                    locationKind,
                }),
            });
            const payload = (await response.json()) as ApiResponse<SavedDepartureCreateResponse>;

            if (response.status === 401) {
                window.location.href = "/login";
                return false;
            }

            if (!response.ok || !payload.ok) {
                setFeedbackMessage(payload.ok ? "저장 위치 저장 중 오류가 발생했습니다." : payload.error.message);
                return false;
            }

            const nextSavedDeparture = mapSavedDepartureApiItem(payload.data.departure);
            setSavedDepartureOwners((currentOwners) => ({
                ...currentOwners,
                [nextSavedDeparture.id]: party,
            }));
            setSavedDepartures((currentSavedDepartures) => [nextSavedDeparture, ...currentSavedDepartures.filter((departure) => departure.id !== nextSavedDeparture.id)]);
            setSelectedSavedDepartureIds((currentIds) => ({
                ...currentIds,
                [party]: nextSavedDeparture.id,
            }));
            setDepartureInputMethod("saved");
            setFeedbackMessage(buildSavedDepartureCreatedFeedback(party, friendName, normalizedTitle));
            return true;
        } catch (error) {
            setFeedbackMessage(error instanceof Error ? error.message : "저장 위치를 저장하지 못했어요.");
            return false;
        }
    }

    // 현재 입력 상태를 검증한 뒤 추천 snapshot을 계산하고 친구별 캐시에 저장합니다.
    async function handleRecommend() {
        const recommendationRequirementMessage = buildRecommendationRequirementMessage({
            meetingMode,
            friendName,
            hasMyLocation: Boolean(mySharedLocation),
            hasFriendLocation: Boolean(friendLocation),
            hasMyDeparture: Boolean(selectedDepartureLabels?.me),
            hasFriendDeparture: Boolean(selectedDepartureLabels?.friend),
        });

        if (recommendationRequirementMessage) {
            setFeedbackMessage(recommendationRequirementMessage);
            return;
        }

        if (!activeFriendId) {
            setFeedbackMessage("추천할 친구를 먼저 선택해 주세요.");
            return;
        }

        setFeedbackMessage("추천 기준 위치와 중심점을 계산하고 있어요.");

        try {
            const [myOrigin, friendOrigin] = meetingMode === "now"
                ? [mySharedLocation, friendLocation] as const
                : await Promise.all([
                    resolveDepartureLocation({
                        party: "me",
                        departureInputMethod,
                        selectedSavedDepartures,
                        pinnedDepartureLabels,
                        pinnedDepartureLocations,
                        departureSearchQueries,
                        friendName,
                    }),
                    resolveDepartureLocation({
                        party: "friend",
                        departureInputMethod,
                        selectedSavedDepartures,
                        pinnedDepartureLabels,
                        pinnedDepartureLocations,
                        departureSearchQueries,
                        friendName,
                    }),
                ]);

            if (!myOrigin || !friendOrigin) {
                throw new Error("추천 계산에 필요한 좌표를 아직 준비하지 못했어요.");
            }

            const requestBody = meetingMode === "now"
                ? {
                    friendId: activeFriendId,
                    mode: meetingMode,
                    category: selectedCategory,
                }
                : {
                    friendId: activeFriendId,
                    mode: meetingMode,
                    category: selectedCategory,
                    departure: {
                        label: selectedDepartureLabels?.me ?? myOrigin.address,
                        source: departureInputMethod,
                        lat: myOrigin.latitude,
                        lng: myOrigin.longitude,
                    },
                    friendDeparture: {
                        label: selectedDepartureLabels?.friend ?? friendOrigin.address,
                        source: departureInputMethod,
                        lat: friendOrigin.latitude,
                        lng: friendOrigin.longitude,
                    },
                };
            const response = await fetch("/api/recommendations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });
            const payload = (await response.json()) as ApiResponse<RecommendationApiResponse>;

            if (response.status === 401) {
                window.location.href = "/login";
                return;
            }

            if (!response.ok || !payload.ok) {
                setFeedbackMessage(payload.ok ? "추천 결과를 불러오지 못했어요." : payload.error.message);
                return;
            }

            const nextRecommendationSnapshot = buildRecommendationSnapshotFromApi({
                response: payload.data,
                meetingMode,
                selectedCategory,
                friendName,
                myOrigin,
                friendOrigin,
                selectedDepartureLabels,
            });

            setRecommendationSnapshots((currentSnapshots) => ({
                ...currentSnapshots,
                [activeFriendId]: {
                    summary: nextRecommendationSnapshot.summary,
                    cards: nextRecommendationSnapshot.cards,
                    markers: nextRecommendationSnapshot.markers,
                },
            }));
            setFeedbackMessage(buildRecommendationSuccessFeedback(friendName, meetingMode, payload.data.places.length || MAX_RECOMMENDATION_COUNT));
        } catch (error) {
            setFeedbackMessage(error instanceof Error ? error.message : "추천 결과를 계산하지 못했어요.");
        }
    }

    return {
        meetingMode,
        selectedCategory,
        departureInputMethod,
        departureSearchQueries,
        visibleSavedDepartures,
        selectedSavedDepartureIds: effectiveSelectedSavedDepartureIds,
        selectedDepartureLabels,
        recommendationSummary,
        canRecommend,
        hasMyLocationStatusData,
        hasFriendLocationStatusData,
        hasRecommendations,
        recommendationCards,
        mapMarkers,
        handleMeetingModeChange,
        handleCategoryChange,
        handleDepartureInputMethodChange,
        handleDepartureSearchQueryChange,
        handlePinnedDepartureSelect,
        handleSavedDepartureSelect,
        handleDeleteSavedDeparture,
        handleDeleteAllSavedDepartures,
        handleUpdateSavedDeparture,
        handleCreateSavedDeparture,
        handleRecommend,
    };
}