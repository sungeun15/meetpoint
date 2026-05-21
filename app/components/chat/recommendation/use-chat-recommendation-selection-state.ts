import { useState, type Dispatch, type SetStateAction } from "react";

import type { RecommendationCard } from "../types";

export type UseChatRecommendationSelectionStateArgs = {
    recommendationCards: RecommendationCard[];
};

export type RecommendationSelectionStateValue = {
    activeRecommendationId: string | null;
    mapFocusedRecommendationId: string | null;
};

export type RecommendationSelectionStateActions = {
    handleRecommendationCardSelect: (recommendationId: string) => void;
    handleMapMarkerSelect: (recommendationId: string) => void;
    handlePlaceChipSelect: (recommendationId: string) => void;
};

export type UseChatRecommendationSelectionStateResult = RecommendationSelectionStateValue
    & RecommendationSelectionStateActions;

export type BuildRecommendationSelectionStateValueArgs = {
    activeSelectionId: string | null;
    focusedRecommendationId: string | null;
    recommendationCards: RecommendationCard[];
};

export type BuildRecommendationSelectionStateActionsArgs = {
    setActiveSelectionId: Dispatch<SetStateAction<string | null>>;
    setFocusedRecommendationId: Dispatch<SetStateAction<string | null>>;
};

function buildRecommendationSelectionStateValue({
    activeSelectionId,
    focusedRecommendationId,
    recommendationCards,
}: BuildRecommendationSelectionStateValueArgs): RecommendationSelectionStateValue {
    const activeRecommendationId = activeSelectionId && recommendationCards.some((card) => card.id === activeSelectionId)
        ? activeSelectionId
        : recommendationCards[0]?.id ?? null;
    const mapFocusedRecommendationId = focusedRecommendationId && recommendationCards.some((card) => card.id === focusedRecommendationId)
        ? focusedRecommendationId
        : null;

    return {
        activeRecommendationId,
        mapFocusedRecommendationId,
    };
}

function buildRecommendationSelectionStateActions({
    setActiveSelectionId,
    setFocusedRecommendationId,
}: BuildRecommendationSelectionStateActionsArgs): RecommendationSelectionStateActions {
    function handleRecommendationCardSelect(recommendationId: string) {
        setActiveSelectionId(recommendationId);
        setFocusedRecommendationId(recommendationId);
    }

    function handleMapMarkerSelect(recommendationId: string) {
        setActiveSelectionId(recommendationId);
    }

    function handlePlaceChipSelect(recommendationId: string) {
        setActiveSelectionId(recommendationId);
        setFocusedRecommendationId(recommendationId);
    }

    return {
        handleRecommendationCardSelect,
        handleMapMarkerSelect,
        handlePlaceChipSelect,
    };
}

export function useChatRecommendationSelectionState({
    recommendationCards,
}: UseChatRecommendationSelectionStateArgs): UseChatRecommendationSelectionStateResult {
    const [activeSelectionId, setActiveSelectionId] = useState<string | null>(null);
    const [focusedRecommendationId, setFocusedRecommendationId] = useState<string | null>(null);
    const selectionValue = buildRecommendationSelectionStateValue({
        activeSelectionId,
        focusedRecommendationId,
        recommendationCards,
    });
    const selectionActions = buildRecommendationSelectionStateActions({
        setActiveSelectionId,
        setFocusedRecommendationId,
    });

    return {
        ...selectionValue,
        ...selectionActions,
    };
}