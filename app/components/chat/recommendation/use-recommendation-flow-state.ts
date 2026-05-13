import type { Dispatch, SetStateAction } from "react";
import { useMemo, useState } from "react";

import type { FriendItem } from "../../friends/types";
import {
    MAX_RECOMMENDATION_COUNT,
    buildMapMarkers,
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
    buildRecommendationResult,
    buildSavedDeparture,
    buildPreviewRecommendationSummary,
    buildSelectedDepartureLabels,
    buildSelectedSavedDepartures,
    initialSavedDepartures,
} from "./chat-recommendation-flow-helpers";
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
    activeFriendId: string; // 현재 대화 중인 친구 id이며 추천 snapshot을 친구별로 구분하는 키입니다.
    mySharedLocation: (ResolvedLocation & { sharedAt: string }) | null; // 내 현재 공유 위치입니다.
    selectedFriend: FriendItem | null; // 위치/닉네임/마커 라벨 계산에 사용할 현재 선택 친구 정보입니다.
    setFeedbackMessage: Dispatch<SetStateAction<string | null>>; // 추천 진행 상태와 안내 문구를 상위 UI에 전달합니다.
};

// 추천 조건 입력부터 snapshot 생성까지 recommendation 패널 전체 상태를 관리하는 훅입니다.
export function useRecommendationFlowState({
    activeFriendId,
    mySharedLocation,
    selectedFriend,
    setFeedbackMessage,
}: UseRecommendationFlowStateArgs) {
    const [recommendationSnapshots, setRecommendationSnapshots] = useState<Record<string, RecommendationSnapshot>>({});
    const [savedDepartures, setSavedDepartures] = useState<SavedDeparture[]>(initialSavedDepartures);
    const [meetingMode, setMeetingMode] = useState<MeetingMode>("now");
    const [selectedCategory, setSelectedCategory] = useState<RecommendationCategory>("cafe");
    const [departureInputMethod, setDepartureInputMethod] = useState<DepartureInputMethod>("search");
    const [departureSearchQueries, setDepartureSearchQueries] = useState<Record<DepartureParty, string>>({
        me: "건대입구역 2번 출구",
        friend: "강남역 10번 출구",
    });
    const [selectedSavedDepartureIds, setSelectedSavedDepartureIds] = useState<Record<DepartureParty, string>>({
        me: initialSavedDepartures[0]?.id ?? "",
        friend: initialSavedDepartures[1]?.id ?? initialSavedDepartures[0]?.id ?? "",
    });
    const [pinnedDepartureLabels, setPinnedDepartureLabels] = useState<Record<DepartureParty, string>>({
        me: "",
        friend: "",
    });
    const [isSavedDepartureEmptyPreview, setIsSavedDepartureEmptyPreview] = useState(false);

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
    const visibleSavedDepartures = isSavedDepartureEmptyPreview ? [] : savedDepartures;
    const hasMyLocationStatusData = Boolean(mySharedLocation);
    const hasFriendLocationStatusData = Boolean(friendLocation);

    const selectedSavedDepartures = buildSelectedSavedDepartures(savedDepartures, selectedSavedDepartureIds);

    // 저장 위치 비우기 미리보기 중에는 실제 저장 목록을 선택하지 않은 상태처럼 보여 줍니다.
    const previewSelectedSavedDepartures = isSavedDepartureEmptyPreview
        ? { me: null, friend: null }
        : selectedSavedDepartures;

    // 입력 방식에 따라 최종 추천에 사용할 출발지 라벨을 계산합니다.
    const selectedDepartureLabels = buildSelectedDepartureLabels({
        meetingMode,
        departureInputMethod,
        departureSearchQueries,
        pinnedDepartureLabels,
        previewSelectedSavedDepartures,
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

        if (nextMethod !== "saved") {
            setIsSavedDepartureEmptyPreview(false);
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
    function handlePinnedDepartureSelect(party: DepartureParty, pinnedAddress: string) {
        setDepartureInputMethod("pin");
        setPinnedDepartureLabels((currentLabels) => ({
            ...currentLabels,
            [party]: pinnedAddress,
        }));
        setFeedbackMessage(buildPinnedDepartureAppliedFeedback(party, friendName));
    }

    // 저장된 출발 위치를 선택한 뒤 관련 미리보기와 피드백을 동기화합니다.
    function handleSavedDepartureSelect(party: DepartureParty, departureId: string) {
        setDepartureInputMethod("saved");
        setIsSavedDepartureEmptyPreview(false);
        setSelectedSavedDepartureIds((currentIds) => ({
            ...currentIds,
            [party]: departureId,
        }));
        setFeedbackMessage(buildSavedDepartureSelectedFeedback(party, friendName));
    }

    // 저장 위치 비우기 미리보기는 실제 데이터 삭제 없이 화면에서만 빈 상태를 시뮬레이션합니다.
    function handleSavedDepartureEmptyPreviewToggle() {
        setIsSavedDepartureEmptyPreview((currentValue) => !currentValue);
        setFeedbackMessage(null);
    }

    // 현재 입력값을 저장 위치 preset으로 추가하고 바로 선택 상태에 반영합니다.
    function handleCreateSavedDeparture(
        party: DepartureParty,
        title: string,
        previewValue: string,
        sourceLabel: string,
    ) {
        const nextSavedDepartureResult = buildSavedDeparture({
            party,
            title,
            previewValue,
            sourceLabel,
        });

        if (!nextSavedDepartureResult.ok) {
            setFeedbackMessage(nextSavedDepartureResult.errorMessage);
            return false;
        }

        setSavedDepartures((currentSavedDepartures) => [nextSavedDepartureResult.nextSavedDeparture, ...currentSavedDepartures]);
        setSelectedSavedDepartureIds((currentIds) => ({
            ...currentIds,
            [party]: nextSavedDepartureResult.nextDepartureId,
        }));
        setIsSavedDepartureEmptyPreview(false);
        setFeedbackMessage(buildSavedDepartureCreatedFeedback(party, friendName, nextSavedDepartureResult.normalizedTitle));
        return true;
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

        setFeedbackMessage("추천 기준 위치와 중심점을 계산하고 있어요.");

        try {
            const nextRecommendationSnapshot = await buildRecommendationResult({
                meetingMode,
                mySharedLocation,
                friendLocation,
                selectedFriend,
                selectedCategory,
                friendName,
                selectedDepartureLabels,
                departureInputMethod,
                selectedSavedDepartures,
                pinnedDepartureLabels,
                departureSearchQueries,
            });

            setRecommendationSnapshots((currentSnapshots) => ({
                ...currentSnapshots,
                [activeFriendId]: {
                    summary: nextRecommendationSnapshot.summary,
                    cards: nextRecommendationSnapshot.cards,
                    markers: nextRecommendationSnapshot.markers,
                },
            }));
            setFeedbackMessage(buildRecommendationSuccessFeedback(friendName, meetingMode, MAX_RECOMMENDATION_COUNT));
        } catch (error) {
            setFeedbackMessage(error instanceof Error ? error.message : "추천 결과를 계산하지 못했어요.");
        }
    }

    // 저장 위치 비우기 미리보기 종료 시 실제 목록을 다시 보이게 합니다.
    function resetSavedDeparturePreview() {
        setIsSavedDepartureEmptyPreview(false);
    }

    return {
        meetingMode,
        selectedCategory,
        departureInputMethod,
        departureSearchQueries,
        visibleSavedDepartures,
        isSavedDepartureEmptyPreview,
        selectedSavedDepartureIds,
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
        handleSavedDepartureEmptyPreviewToggle,
        handleCreateSavedDeparture,
        handleRecommend,
        resetSavedDeparturePreview,
    };
}