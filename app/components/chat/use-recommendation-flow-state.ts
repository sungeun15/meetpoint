import type { Dispatch, SetStateAction } from "react";
import { useMemo, useState } from "react";

import type { FriendItem } from "../friends/types";
import { buildRecommendationCards, buildRecommendationSummary } from "./data";
import type {
    DepartureInputMethod,
    DepartureParty,
    MeetingMode,
    RecommendationCategory,
    SavedDeparture,
} from "./types";

const initialSavedDepartures: SavedDeparture[] = [
    {
        id: "home",
        label: "우리집",
        description: "최근 사용 · 건대입구역 도보 8분",
        locationKind: "recent",
    },
    {
        id: "office",
        label: "사무실",
        description: "프리셋 · 선릉역 4번 출구",
        locationKind: "preset",
    },
    {
        id: "campus",
        label: "학교 정문",
        description: "프리셋 · 왕십리역 환승 기준",
        locationKind: "preset",
    },
];

const departurePartyOrder: DepartureParty[] = ["me", "friend"];

type UseRecommendationFlowStateArgs = {
    activeFriendId: string;
    lastSharedAt: string | null;
    selectedFriend: FriendItem | null;
    setFeedbackMessage: Dispatch<SetStateAction<string | null>>;
};

export function useRecommendationFlowState({
    activeFriendId,
    lastSharedAt,
    selectedFriend,
    setFeedbackMessage,
}: UseRecommendationFlowStateArgs) {
    const [recommendedFriendIds, setRecommendedFriendIds] = useState<string[]>([]);
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

    const hasRecommendations = recommendedFriendIds.includes(activeFriendId);
    const visibleSavedDepartures = isSavedDepartureEmptyPreview ? [] : savedDepartures;
    const hasMyLocationStatusData = Boolean(lastSharedAt);
    const hasFriendLocationStatusData = Boolean(selectedFriend?.locationHint?.trim());

    const selectedSavedDepartures = departurePartyOrder.reduce<Record<DepartureParty, SavedDeparture | null>>((accumulator, party) => {
        accumulator[party] = savedDepartures.find((departure) => departure.id === selectedSavedDepartureIds[party]) ?? null;
        return accumulator;
    }, { me: null, friend: null });

    const previewSelectedSavedDepartures = isSavedDepartureEmptyPreview
        ? { me: null, friend: null }
        : selectedSavedDepartures;

    const selectedDepartureLabels = meetingMode === "later"
        ? departurePartyOrder.reduce<Record<DepartureParty, string | null>>((accumulator, party) => {
            if (departureInputMethod === "search") {
                const selectedAddress = departureSearchQueries[party].trim();
                accumulator[party] = selectedAddress || null;
                return accumulator;
            }

            if (departureInputMethod === "pin") {
                accumulator[party] = pinnedDepartureLabels[party] || null;
                return accumulator;
            }

            accumulator[party] = previewSelectedSavedDepartures[party]?.label ?? null;
            return accumulator;
        }, { me: null, friend: null })
        : null;

    const recommendationCards = useMemo(
        () => buildRecommendationCards(selectedFriend, selectedCategory),
        [selectedCategory, selectedFriend],
    );

    const recommendationSummary = useMemo(
        () => buildRecommendationSummary(selectedFriend, meetingMode, selectedCategory, selectedDepartureLabels),
        [meetingMode, selectedCategory, selectedDepartureLabels, selectedFriend],
    );

    const canRecommend = meetingMode === "now"
        ? Boolean(lastSharedAt)
        : Boolean(selectedDepartureLabels?.me && selectedDepartureLabels?.friend);

    function handleMeetingModeChange(nextMode: MeetingMode) {
        setMeetingMode(nextMode);

        if (nextMode === "now" && (!hasMyLocationStatusData || !hasFriendLocationStatusData)) {
            setFeedbackMessage("위치를 공유해 주세요.");
            return;
        }

        setFeedbackMessage(null);
    }

    function handleCategoryChange(nextCategory: RecommendationCategory) {
        setSelectedCategory(nextCategory);
        setFeedbackMessage(null);
    }

    function handleDepartureInputMethodChange(nextMethod: DepartureInputMethod) {
        setDepartureInputMethod(nextMethod);
        setFeedbackMessage(null);

        if (nextMethod !== "saved") {
            setIsSavedDepartureEmptyPreview(false);
        }
    }

    function handleDepartureSearchQueryChange(party: DepartureParty, nextQuery: string) {
        setDepartureSearchQueries((currentQueries) => ({
            ...currentQueries,
            [party]: nextQuery,
        }));
        setFeedbackMessage(null);
    }

    function handlePinnedDepartureSelect(party: DepartureParty, pinnedAddress: string) {
        setDepartureInputMethod("pin");
        setPinnedDepartureLabels((currentLabels) => ({
            ...currentLabels,
            [party]: pinnedAddress,
        }));
        setFeedbackMessage(`${party === "me" ? "내" : `${selectedFriend?.nickname ?? "친구"} 님`} 핀 위치를 출발 위치에 반영했어요.`);
    }

    function handleSavedDepartureSelect(party: DepartureParty, departureId: string) {
        setDepartureInputMethod("saved");
        setIsSavedDepartureEmptyPreview(false);
        setSelectedSavedDepartureIds((currentIds) => ({
            ...currentIds,
            [party]: departureId,
        }));
        setFeedbackMessage(`${party === "me" ? "내" : `${selectedFriend?.nickname ?? "친구"} 님`} 저장 위치를 추천 기준으로 선택했어요.`);
    }

    function handleSavedDepartureEmptyPreviewToggle() {
        setIsSavedDepartureEmptyPreview((currentValue) => !currentValue);
        setFeedbackMessage(null);
    }

    function handleCreateSavedDeparture(
        party: DepartureParty,
        title: string,
        previewValue: string,
        sourceLabel: string,
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

        const nextDepartureId = `saved-${party}-${Date.now()}`;
        const nextSavedDeparture: SavedDeparture = {
            id: nextDepartureId,
            label: normalizedTitle,
            description: `${sourceLabel} · ${normalizedPreviewValue}`,
            locationKind: "preset",
        };

        setSavedDepartures((currentSavedDepartures) => [nextSavedDeparture, ...currentSavedDepartures]);
        setSelectedSavedDepartureIds((currentIds) => ({
            ...currentIds,
            [party]: nextDepartureId,
        }));
        setIsSavedDepartureEmptyPreview(false);
        setFeedbackMessage(`${party === "me" ? "내" : `${selectedFriend?.nickname ?? "친구"} 님`} 위치를 "${normalizedTitle}" 이름으로 저장했어요.`);
        return true;
    }

    function handleRecommend() {
        if (meetingMode === "now" && !lastSharedAt) {
            setFeedbackMessage("지금 만나기에서는 위치 공유 후 추천을 시작해 주세요.");
            return;
        }

        if (meetingMode === "later" && !selectedDepartureLabels?.me && !selectedDepartureLabels?.friend) {
            setFeedbackMessage("나중에 만나기에서는 내 출발 위치와 친구 출발 위치를 모두 정해 주세요.");
            return;
        }

        if (meetingMode === "later" && !selectedDepartureLabels?.me) {
            setFeedbackMessage("나중에 만나기에서는 내 출발 위치를 먼저 정해 주세요.");
            return;
        }

        if (meetingMode === "later" && !selectedDepartureLabels?.friend) {
            setFeedbackMessage(`나중에 만나기에서는 ${selectedFriend?.nickname ?? "친구"} 님 출발 위치를 먼저 정해 주세요.`);
            return;
        }

        setRecommendedFriendIds((currentFriendIds) => (
            currentFriendIds.includes(activeFriendId)
                ? currentFriendIds
                : [...currentFriendIds, activeFriendId]
        ));
        setFeedbackMessage(`${selectedFriend?.nickname ?? "친구"} 님 기준 ${recommendationSummary.modeLabel} 추천 결과를 준비했어요.`);
    }

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