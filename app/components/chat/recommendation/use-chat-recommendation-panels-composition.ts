import {
    buildChatRecommendationPanelsCompositionResult,
    buildChatRecommendationPanelsGroupedArgs,
    buildRecommendationDepartureSettingsSectionProps,
    buildChatDepartureSettingsPanelActions,
    buildChatDepartureSettingsPanelViewState,
    buildChatRecommendationMapPanelProps,
    buildChatRecommendationResultsPanelProps,
    type ChatRecommendationPanelsProps,
    type ChatRecommendationPanelsCompositionSections,
} from "./chat-recommendation-flow-helpers";
import {
    useChatRecommendationSelectionState,
    type RecommendationSelectionStateActions,
    type RecommendationSelectionStateValue,
} from "./use-chat-recommendation-selection-state";

export type UseChatRecommendationPanelsCompositionArgs = ChatRecommendationPanelsProps;

export type UseChatRecommendationPanelsCompositionResult = ChatRecommendationPanelsCompositionSections;

export function useChatRecommendationPanelsComposition(
    props: UseChatRecommendationPanelsCompositionArgs,
): UseChatRecommendationPanelsCompositionResult {
    // grouped args -> selection state -> section props -> final composition 순서로 조립합니다.
    const {
        departureCompositionArgs,
        resultsCompositionArgs,
        mapCompositionArgs,
    } = buildChatRecommendationPanelsGroupedArgs(props);

    const selectionState = useChatRecommendationSelectionState({
        recommendationCards: props.recommendationCards,
    });
    const selectionValue: RecommendationSelectionStateValue = selectionState;
    const selectionActions: RecommendationSelectionStateActions = selectionState;
    const {
        activeRecommendationId,
        mapFocusedRecommendationId,
    } = selectionValue;
    const {
        handleRecommendationCardSelect,
        handleMapMarkerSelect,
        handlePlaceChipSelect,
    } = selectionActions;

    const departureSettingsSectionProps = buildRecommendationDepartureSettingsSectionProps({
        panelKey: `${props.selectedFriendName}:${props.departureInputMethod}`,
        viewState: buildChatDepartureSettingsPanelViewState(departureCompositionArgs),
        actions: buildChatDepartureSettingsPanelActions(departureCompositionArgs),
    });
    const recommendationResultsSectionProps = buildChatRecommendationResultsPanelProps({
        ...resultsCompositionArgs,
        selectedRecommendationId: activeRecommendationId,
        onRecommendationCardSelect: handleRecommendationCardSelect,
    });
    const recommendationMapSectionProps = buildChatRecommendationMapPanelProps({
        ...mapCompositionArgs,
        activeMarkerId: activeRecommendationId,
        focusedMarkerId: mapFocusedRecommendationId,
        onMarkerSelect: handleMapMarkerSelect,
        onPlaceChipSelect: handlePlaceChipSelect,
    });

    return buildChatRecommendationPanelsCompositionResult({
        departureSettingsSectionProps,
        recommendationResultsSectionProps,
        recommendationMapSectionProps,
    });
}