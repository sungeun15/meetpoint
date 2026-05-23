import { useState, type Dispatch, type SetStateAction } from "react";

import type { RecommendationCard, RecommendationTransportMode } from "../types";

export type UseChatRecommendationSelectionStateArgs = {
    recommendationCards: RecommendationCard[];
};

export type RecommendationSelectionStateValue = {
    activeRecommendationId: string | null;
    mapFocusedRecommendationId: string | null;
    selectedPlaceId: string | null;
    selectedTransportMode: RecommendationTransportMode;
};

export type RecommendationSelectionStateActions = {
    handleRecommendationCardSelect: (recommendationId: string) => void;
    handleMapMarkerSelect: (recommendationId: string) => void;
    handlePlaceChipSelect: (recommendationId: string) => void;
    handleTransportModeSelect: (nextMode: RecommendationTransportMode) => void;
};

export type UseChatRecommendationSelectionStateResult = RecommendationSelectionStateValue
    & RecommendationSelectionStateActions;

export type BuildRecommendationSelectionStateValueArgs = {
    activeSelectionId: string | null;
    focusedRecommendationId: string | null;
    selectedPlaceId: string | null;
    selectedTransportMode: RecommendationTransportMode;
    recommendationCards: RecommendationCard[];
};

export type BuildRecommendationSelectionStateActionsArgs = {
    setActiveSelectionId: Dispatch<SetStateAction<string | null>>;
    setFocusedRecommendationId: Dispatch<SetStateAction<string | null>>;
    setSelectedPlaceId: Dispatch<SetStateAction<string | null>>;
    setSelectedTransportMode: Dispatch<SetStateAction<RecommendationTransportMode>>;
};

function buildRecommendationSelectionStateValue({
    activeSelectionId,
    focusedRecommendationId,
    selectedPlaceId,
    selectedTransportMode,
    recommendationCards,
}: BuildRecommendationSelectionStateValueArgs): RecommendationSelectionStateValue {
    const activeRecommendationId = activeSelectionId && recommendationCards.some((card) => card.id === activeSelectionId)
        ? activeSelectionId
        : recommendationCards[0]?.id ?? null;
    const mapFocusedRecommendationId = focusedRecommendationId && recommendationCards.some((card) => card.id === focusedRecommendationId)
        ? focusedRecommendationId
        : null;
    const normalizedSelectedPlaceId = selectedPlaceId && recommendationCards.some((card) => card.id === selectedPlaceId)
        ? selectedPlaceId
        : null;

    return {
        activeRecommendationId,
        mapFocusedRecommendationId,
        selectedPlaceId: normalizedSelectedPlaceId,
        selectedTransportMode,
    };
}

function buildRecommendationSelectionStateActions({
    setActiveSelectionId,
    setFocusedRecommendationId,
    setSelectedPlaceId,
    setSelectedTransportMode,
}: BuildRecommendationSelectionStateActionsArgs): RecommendationSelectionStateActions {
    function handleRecommendationCardSelect(recommendationId: string) {
        setActiveSelectionId(recommendationId);
        setFocusedRecommendationId(recommendationId);
        setSelectedPlaceId(recommendationId);
    }

    function handleMapMarkerSelect(recommendationId: string) {
        setActiveSelectionId(recommendationId);
        setFocusedRecommendationId(recommendationId);
        setSelectedPlaceId(recommendationId);
    }

    function handlePlaceChipSelect(recommendationId: string) {
        setActiveSelectionId(recommendationId);
        setFocusedRecommendationId(recommendationId);
        setSelectedPlaceId(recommendationId);
    }

    function handleTransportModeSelect(nextMode: RecommendationTransportMode) {
        setSelectedTransportMode(nextMode);
    }

    return {
        handleRecommendationCardSelect,
        handleMapMarkerSelect,
        handlePlaceChipSelect,
        handleTransportModeSelect,
    };
}

export function useChatRecommendationSelectionState({
    recommendationCards,
}: UseChatRecommendationSelectionStateArgs): UseChatRecommendationSelectionStateResult {
    const [activeSelectionId, setActiveSelectionId] = useState<string | null>(null);
    const [focusedRecommendationId, setFocusedRecommendationId] = useState<string | null>(null);
    const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
    const [selectedTransportMode, setSelectedTransportMode] = useState<RecommendationTransportMode>("car");
    const selectionValue = buildRecommendationSelectionStateValue({
        activeSelectionId,
        focusedRecommendationId,
        selectedPlaceId,
        selectedTransportMode,
        recommendationCards,
    });
    const selectionActions = buildRecommendationSelectionStateActions({
        setActiveSelectionId,
        setFocusedRecommendationId,
        setSelectedPlaceId,
        setSelectedTransportMode,
    });

    return {
        ...selectionValue,
        ...selectionActions,
    };
}