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
import { useChatRecommendationRouteState } from "./use-chat-recommendation-route-state";

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
        selectedPlaceId,
        selectedTransportMode,
    } = selectionValue;
    const {
        handleRecommendationCardSelect,
        handleMapMarkerSelect,
        handlePlaceChipSelect,
        handleTransportModeSelect,
    } = selectionActions;
    const {
        routeStatus,
        routeErrorMessage,
        routeSegments,
    } = useChatRecommendationRouteState({
        mapMarkers: props.mapMarkers,
        selectedPlaceId,
        selectedTransportMode,
    });

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
        selectedPlaceId,
        selectedTransportMode,
        routeStatus,
        routeErrorMessage,
        routeSegments,
        onMarkerSelect: handleMapMarkerSelect,
        onPlaceChipSelect: handlePlaceChipSelect,
        onTransportModeSelect: handleTransportModeSelect,
    });

    return buildChatRecommendationPanelsCompositionResult({
        departureSettingsSectionProps,
        recommendationResultsSectionProps,
        recommendationMapSectionProps,
    });
}