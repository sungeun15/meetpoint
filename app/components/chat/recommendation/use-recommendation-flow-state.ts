import type { Dispatch, SetStateAction } from "react";
import { useEffect, useMemo, useState } from "react";

import { resolveAddressCoordinates } from "@/lib/kakao/geocoder";

import type { FriendItem } from "../../friends/types";
import {
    MAX_RECOMMENDATION_COUNT,
    buildMapMarkers,
    calculateMidpoint,
} from "../data";
import {
    buildRecommendationSuccessFeedback,
} from "./chat-recommendation-feedback";
import {
    buildPreviewRecommendationSummary,
    departurePartyOrder,
} from "./chat-recommendation-flow-helpers";
import { runRecommendationFlow } from "./flow-state/chat-recommendation-runner";
import {
    buildSelectedFriendDepartureLocation,
    buildSelectedSavedDepartureIdsWithPersistedFallback,
    replaceSavedDepartureWithSelection,
} from "./flow-state/chat-recommendation-saved-departure-selection";
import { useRecommendationDepartureDerivedState } from "./flow-state/use-recommendation-departure-derived-state";
import {
    createSavedDepartureRequest,
    deleteSavedDepartures,
    fetchSavedDepartures,
    markSavedDepartureAsUsed,
    updateSavedDepartureRequest,
} from "./flow-state/chat-recommendation-saved-departure-request";
import {
    mapSavedDepartureApiItem,
} from "./flow-state/chat-recommendation-saved-departure-api";
import {
    formatDepartureSummaryLabel,
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
    activeFriendId: string; // 현재 대화 중인 친구 id이며 추천 snapshot을 친구별로 구분하는 키.
    mySharedLocation: (ResolvedLocation & { sharedAt: string }) | null; // 현재 선택 친구에게 실제로 공유된 내 위치.
    selectedFriend: FriendItem | null; // 위치/닉네임/마커 라벨 계산에 사용할 현재 선택 친구 정보.
    availableFriends: FriendItem[];
    setFeedbackMessage: Dispatch<SetStateAction<string | null>>; // 추천 진행 상태와 안내 문구를 상위 UI에 전달합니다.
};

// 추천 조건 입력부터 snapshot 생성까지 recommendation 패널 전체 상태를 관리하는 훅.
export function useRecommendationFlowState({
    activeFriendId,
    mySharedLocation,
    selectedFriend,
    availableFriends,
    setFeedbackMessage,
}: UseRecommendationFlowStateArgs) {
    const [recommendationSnapshots, setRecommendationSnapshots] = useState<Record<string, RecommendationSnapshot>>({});
    const [savedDepartures, setSavedDepartures] = useState<SavedDeparture[]>([]);
    const [meetingMode, setMeetingMode] = useState<MeetingMode>("now");
    const [selectedCategory, setSelectedCategory] = useState<RecommendationCategory>("cafe");
    const [departureInputMethod, setDepartureInputMethod] = useState<DepartureInputMethod>("search");
    const [departureSearchQueries, setDepartureSearchQueries] = useState<Record<DepartureParty, string>>({
        me: "",
        friend: "",
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
    const [preferredDepartureFriendId, setPreferredDepartureFriendId] = useState(activeFriendId);

    useEffect(() => {
        let isMounted = true;

        async function loadSavedDepartures() {
            try {
                const result = await fetchSavedDepartures(20);

                if (!isMounted) {
                    return;
                }

                if (result.status === "unauthorized") {
                    window.location.href = "/login";
                    return;
                }

                if (result.status === "error") {
                    setFeedbackMessage(result.message);
                    return;
                }

                setSavedDepartures(result.data.departures.map(mapSavedDepartureApiItem));
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

    // 친구별로 캐시해 둔 추천 결과가 있으면 즉시 꺼내 쓰고, 없으면 미리보기 상태로 동작합니다.
    const activeRecommendationSnapshot = recommendationSnapshots[activeFriendId] ?? null;
    const friendName = selectedFriend?.nickname ?? "친구";
    const selectedSavedDepartureIdsWithPersistedFallback = useMemo(() => buildSelectedSavedDepartureIdsWithPersistedFallback({
        activeFriendId,
        preferredDepartureFriendId,
        savedDepartures,
        selectedSavedDepartureIds,
    }), [activeFriendId, preferredDepartureFriendId, savedDepartures, selectedSavedDepartureIds]);
    const {
        departureFriendOptions,
        selectedDepartureFriendId,
        selectedDepartureFriendName,
        visibleSavedDepartures,
        effectiveSelectedSavedDepartureIds,
        selectedSavedDepartures,
        selectedDepartureLabels,
        friendLocation,
    } = useRecommendationDepartureDerivedState({
        activeFriendId,
        availableFriends,
        preferredDepartureFriendId,
        selectedFriend,
        savedDepartures,
        selectedSavedDepartureIds: selectedSavedDepartureIdsWithPersistedFallback,
        meetingMode,
        departureInputMethod,
        departureSearchQueries,
        pinnedDepartureLabels,
    });
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
    const hasMyLocationStatusData = Boolean(mySharedLocation);
    const hasFriendLocationStatusData = Boolean(friendLocation);
    const selectedFriendDepartureLocation = buildSelectedFriendDepartureLocation(selectedSavedDepartures.friend);

    const recommendationCards = activeRecommendationSnapshot?.cards ?? [];
    const currentMyDepartureSummaryLabel = formatDepartureSummaryLabel(mySharedLocation?.address, "현재 위치");
    const currentFriendDepartureSummaryLabel = formatDepartureSummaryLabel(friendLocation?.address, `${friendName} 위치`);
    const selectedMeDepartureSummaryLabel = formatDepartureSummaryLabel(selectedDepartureLabels?.me, "선택 필요");
    const selectedFriendDepartureSummaryLabel = formatDepartureSummaryLabel(selectedDepartureLabels?.friend, "선택 필요");

    // 실제 추천 결과가 없어도 현재 입력 상태를 반영한 요약 카드를 먼저 보여 주기 위한 미리보기.
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

    function handleDepartureFriendChange(nextFriendId: string) {
        setPreferredDepartureFriendId(nextFriendId);
        setSelectedSavedDepartureIds((currentIds) => ({
            ...currentIds,
            friend: "",
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
        setFeedbackMessage(null);
    }

    // 저장된 출발 위치를 선택한 뒤 관련 미리보기와 피드백을 동기화합니다.
    async function handleSavedDepartureSelect(party: DepartureParty, departureId: string) {
        setDepartureInputMethod("saved");

        try {
            const result = await markSavedDepartureAsUsed(departureId);

            if (result.status === "unauthorized") {
                window.location.href = "/login";
                return false;
            }

            if (result.status === "error") {
                setFeedbackMessage(result.message);
                return false;
            }

            const nextDepartureFromApi = mapSavedDepartureApiItem(result.data.departure);
            setSavedDepartures((currentSavedDepartures) => {
                return replaceSavedDepartureWithSelection(currentSavedDepartures, nextDepartureFromApi);
            });
            setSelectedSavedDepartureIds((currentIds) => ({
                ...currentIds,
                [party]: departureId,
            }));
            setFeedbackMessage(null);
            return true;
        } catch {
            setFeedbackMessage("네트워크 오류로 저장 위치를 선택하지 못했습니다.");
            return false;
        }
    }

    async function handleDeleteSavedDeparture(party: DepartureParty, departureId: string) {
        try {
            const result = await deleteSavedDepartures([departureId]);

            if (result.status === "unauthorized") {
                window.location.href = "/login";
                return false;
            }

            if (result.status === "error") {
                setFeedbackMessage(result.message);
                return false;
            }

            if (!result.data.deletedIds.length) {
                setFeedbackMessage("삭제할 저장 위치를 찾지 못했어요.");
                return false;
            }

            const deletedIds = new Set(result.data.deletedIds);

            setSavedDepartures((currentSavedDepartures) => currentSavedDepartures.filter((departure) => !deletedIds.has(departure.id)));
            setSelectedSavedDepartureIds((currentIds) => departurePartyOrder.reduce<Record<DepartureParty, string>>((accumulator, currentParty) => {
                accumulator[currentParty] = deletedIds.has(currentIds[currentParty]) ? "" : currentIds[currentParty];
                return accumulator;
            }, { me: "", friend: "" }));
            setFeedbackMessage(null);
            return true;
        } catch {
            setFeedbackMessage("네트워크 오류로 저장 위치를 삭제하지 못했습니다.");
            return false;
        }
    }

    async function handleDeleteAllSavedDepartures(party: DepartureParty) {
        const departureLocationIds = visibleSavedDepartures[party].map((departure) => departure.id);

        if (!departureLocationIds.length) {
            setFeedbackMessage("삭제할 저장 위치가 없어요.");
            return false;
        }

        try {
            const result = await deleteSavedDepartures(departureLocationIds);

            if (result.status === "unauthorized") {
                window.location.href = "/login";
                return false;
            }

            if (result.status === "error") {
                setFeedbackMessage(result.message);
                return false;
            }

            if (!result.data.deletedIds.length) {
                setFeedbackMessage("삭제할 저장 위치를 찾지 못했어요.");
                return false;
            }

            const deletedIds = new Set(result.data.deletedIds);

            setSavedDepartures((currentSavedDepartures) => currentSavedDepartures.filter((departure) => !deletedIds.has(departure.id)));
            setSelectedSavedDepartureIds((currentIds) => departurePartyOrder.reduce<Record<DepartureParty, string>>((accumulator, currentParty) => {
                accumulator[currentParty] = deletedIds.has(currentIds[currentParty]) ? "" : currentIds[currentParty];
                return accumulator;
            }, { me: "", friend: "" }));
            setFeedbackMessage(null);
            return true;
        } catch {
            setFeedbackMessage("네트워크 오류로 저장 위치를 삭제하지 못했습니다.");
            return false;
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
            const result = await updateSavedDepartureRequest({
                departureId,
                label: normalizedTitle,
                resolvedLocation,
            });

            if (result.status === "unauthorized") {
                window.location.href = "/login";
                return false;
            }

            if (result.status === "error") {
                setFeedbackMessage(result.message);
                return false;
            }

            const nextSavedDeparture = mapSavedDepartureApiItem(result.data.departure);
            setSavedDepartures((currentSavedDepartures) => replaceSavedDepartureWithSelection(currentSavedDepartures, nextSavedDeparture));
            setSelectedSavedDepartureIds((currentIds) => ({
                ...currentIds,
                [party]: departureId,
            }));
            setDepartureInputMethod("saved");
            setFeedbackMessage(null);
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
        targetFriendId?: string,
        targetFriendName?: string,
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

        const friendIdForSave = party === "friend"
            ? (targetFriendId ?? selectedDepartureFriendId)
            : null;
        const friendNicknameForSave = party === "friend"
            ? (targetFriendName ?? selectedDepartureFriendName)
            : null;

        if (party === "friend" && (!friendIdForSave || !friendNicknameForSave)) {
            setFeedbackMessage("친구 출발 위치는 대상 친구를 선택한 뒤 저장해 주세요.");
            return false;
        }

        if (party === "friend" && friendIdForSave === "all") {
            setFeedbackMessage("친구 전체 보기에서는 저장할 친구를 먼저 선택해 주세요.");
            return false;
        }

        try {
            const nextResolvedLocation = resolvedLocation ?? await resolveAddressCoordinates([normalizedPreviewValue]);
            const result = await createSavedDepartureRequest({
                label: normalizedTitle,
                ownerParty: party,
                resolvedLocation: nextResolvedLocation,
                friendId: friendIdForSave,
                friendNickname: friendNicknameForSave,
                locationKind,
            });

            if (result.status === "unauthorized") {
                window.location.href = "/login";
                return false;
            }

            if (result.status === "error") {
                setFeedbackMessage(result.message);
                return false;
            }

            const nextSavedDeparture = mapSavedDepartureApiItem(result.data.departure);
            setSavedDepartures((currentSavedDepartures) => replaceSavedDepartureWithSelection(currentSavedDepartures, nextSavedDeparture));
            setSelectedSavedDepartureIds((currentIds) => ({
                ...currentIds,
                [party]: nextSavedDeparture.id,
            }));
            setDepartureInputMethod("saved");
            setFeedbackMessage(null);
            return true;
        } catch (error) {
            setFeedbackMessage(error instanceof Error ? error.message : "저장 위치를 저장하지 못했어요.");
            return false;
        }
    }

    // 현재 입력 상태를 검증한 뒤 추천 snapshot을 계산하고 친구별 캐시에 저장합니다.
    async function handleRecommend() {
        setFeedbackMessage("추천 기준 위치와 중심점을 계산하고 있어요.");

        try {
            const recommendationResult = await runRecommendationFlow({
                activeFriendId,
                meetingMode,
                friendName,
                mySharedLocation,
                friendLocation,
                selectedCategory,
                departureInputMethod,
                selectedDepartureLabels,
                selectedSavedDepartures,
                pinnedDepartureLabels,
                pinnedDepartureLocations,
                departureSearchQueries,
            });

            if (recommendationResult.status === "blocked") {
                setFeedbackMessage(recommendationResult.message);
                return;
            }

            if (recommendationResult.status === "unauthorized") {
                window.location.href = "/login";
                return;
            }

            if (recommendationResult.status === "error") {
                setFeedbackMessage(recommendationResult.message);
                return;
            }

            setRecommendationSnapshots((currentSnapshots) => ({
                ...currentSnapshots,
                [activeFriendId]: {
                    summary: recommendationResult.snapshot.summary,
                    cards: recommendationResult.snapshot.cards,
                    markers: recommendationResult.snapshot.markers,
                },
            }));
            setFeedbackMessage(buildRecommendationSuccessFeedback(friendName, meetingMode, recommendationResult.placeCount || MAX_RECOMMENDATION_COUNT));
        } catch (error) {
            setFeedbackMessage(error instanceof Error ? error.message : "추천 결과를 계산하지 못했어요.");
        }
    }

    return {
        meetingMode, // 지금 만나기/나중에 만나기 중 현재 선택된 추천 모드.
        selectedCategory, // 현재 선택된 장소 카테고리.
        departureInputMethod, // 출발지를 검색/핀/저장 위치 중 어떤 방식으로 입력하는지 나타냅니다.
        departureSearchQueries, // 참여자별 주소 검색 입력값 원본.
        visibleSavedDepartures, // 현재 친구 필터까지 반영된 저장 출발지 목록.
        selectedSavedDepartureIds: effectiveSelectedSavedDepartureIds, // 현재 목록 기준으로 보정된 저장 출발지 선택 id .
        selectedSavedDepartures, // 참여자별로 현재 선택된 저장 출발지 원본 객체입니다.
        selectedFriendDepartureLocation, // 헤더에서 바로 쓸 친구 저장 출발 위치입니다.
        selectedDepartureFriendId, // 친구 출발지 저장 목록에 적용 중인 친구 필터 id .
        departureFriendOptions, // 친구 필터 드롭다운에 보여 줄 옵션 목록.
        selectedDepartureLabels, // 실제 추천 계산에 사용할 참여자별 출발지 라벨.
        recommendationSummary, // 추천 결과가 없을 때는 미리보기, 있으면 확정 결과 요약.
        canRecommend, // 현재 입력 상태로 추천 버튼을 눌러도 되는지 여부.
        hasMyLocationStatusData, // 내 위치 공유 데이터가 준비됐는지 나타냅니다.
        hasFriendLocationStatusData, // 친구 위치 데이터가 준비됐는지 나타냅니다.
        hasRecommendations, // 현재 친구 기준으로 저장된 추천 결과가 있는지 나타냅니다.
        recommendationCards, // 추천 결과 카드 목록.
        mapMarkers, // 지도에 그릴 사람/중심점/장소 marker 목록.
        handleMeetingModeChange, // 추천 모드를 바꾸는 handler .
        handleCategoryChange, // 추천 카테고리를 바꾸는 handler .
        handleDepartureInputMethodChange, // 출발지 입력 방식을 바꾸는 handler .
        handleDepartureSearchQueryChange, // 참여자별 검색 입력값을 바꾸는 handler .
        handleDepartureFriendChange, // 친구 출발지 목록 필터 대상을 바꾸는 handler .
        handlePinnedDepartureSelect, // 지도 핀으로 고른 출발지를 반영하는 handler .
        handleSavedDepartureSelect, // 저장 출발지를 선택하고 사용 시각을 갱신하는 handler .
        handleDeleteSavedDeparture, // 저장 출발지 한 건을 삭제하는 handler .
        handleDeleteAllSavedDepartures, // 현재 보이는 저장 출발지를 한 번에 삭제하는 handler .
        handleUpdateSavedDeparture, // 저장 출발지 한 건의 제목/주소를 수정하는 handler .
        handleCreateSavedDeparture, // 현재 입력값으로 저장 출발지를 새로 만드는 handler .
        handleRecommend, // 현재 입력 조건으로 추천 계산을 실행하는 handler .
    };
}