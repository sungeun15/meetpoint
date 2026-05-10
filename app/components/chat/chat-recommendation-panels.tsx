import { ChatDepartureSettingsPanel } from "./chat-departure-settings-panel";
import { ChatRecommendationMapPanel } from "./chat-recommendation-map-panel";
import { ChatRecommendationResultsPanel } from "./chat-recommendation-results-panel";
import type {
    DepartureParty,
    DepartureInputMethod,
    MeetingMode,
    RecommendationCard,
    RecommendationCategory,
    RecommendationSummary,
    SavedDeparture,
} from "./types";

type ChatRecommendationPanelsProps = {
    meetingMode: MeetingMode;
    selectedCategory: RecommendationCategory;
    departureInputMethod: DepartureInputMethod;
    departureSearchQueries: Record<DepartureParty, string>;
    visibleSavedDepartures: SavedDeparture[];
    isSavedDepartureEmptyPreview: boolean;
    selectedSavedDepartureIds: Record<DepartureParty, string>;
    selectedDepartureLabels: Record<DepartureParty, string | null> | null;
    selectedFriendName: string;
    recommendationSummary: RecommendationSummary;
    canRecommend: boolean;
    onMeetingModeChange: (nextMode: MeetingMode) => void;
    onCategoryChange: (nextCategory: RecommendationCategory) => void;
    onDepartureInputMethodChange: (nextMethod: DepartureInputMethod) => void;
    onDepartureSearchQueryChange: (party: DepartureParty, nextQuery: string) => void;
    onOpenSaveLocationLayer: (party: DepartureParty, previewValue: string, sourceLabel: string) => void;
    onPinnedDepartureSelect: (party: DepartureParty, pinnedAddress: string) => void;
    onSavedDepartureSelect: (party: DepartureParty, departureId: string) => void;
    onSavedDepartureEmptyPreviewToggle: () => void;
    onRecommend: () => void;
    hasRecommendations: boolean;
    recommendationCards: RecommendationCard[];
};

export function ChatRecommendationPanels({
    meetingMode,
    selectedCategory,
    departureInputMethod,
    departureSearchQueries,
    visibleSavedDepartures,
    isSavedDepartureEmptyPreview,
    selectedSavedDepartureIds,
    selectedDepartureLabels,
    selectedFriendName,
    recommendationSummary,
    canRecommend,
    onMeetingModeChange,
    onCategoryChange,
    onDepartureInputMethodChange,
    onDepartureSearchQueryChange,
    onOpenSaveLocationLayer,
    onPinnedDepartureSelect,
    onSavedDepartureSelect,
    onSavedDepartureEmptyPreviewToggle,
    onRecommend,
    hasRecommendations,
    recommendationCards,
}: ChatRecommendationPanelsProps) {
    const mapMarkerLabels = recommendationCards.slice(0, 3).map((recommendationCard) => recommendationCard.name);

    return (
        <div className="grid gap-4 sm:gap-5 xl:gap-6">
            <ChatDepartureSettingsPanel
                meetingMode={meetingMode}
                selectedCategory={selectedCategory}
                departureInputMethod={departureInputMethod}
                departureSearchQueries={departureSearchQueries}
                visibleSavedDepartures={visibleSavedDepartures}
                isSavedDepartureEmptyPreview={isSavedDepartureEmptyPreview}
                selectedSavedDepartureIds={selectedSavedDepartureIds}
                selectedDepartureLabels={selectedDepartureLabels}
                selectedFriendName={selectedFriendName}
                canRecommend={canRecommend}
                onMeetingModeChange={onMeetingModeChange}
                onCategoryChange={onCategoryChange}
                onDepartureInputMethodChange={onDepartureInputMethodChange}
                onDepartureSearchQueryChange={onDepartureSearchQueryChange}
                onOpenSaveLocationLayer={onOpenSaveLocationLayer}
                onPinnedDepartureSelect={onPinnedDepartureSelect}
                onSavedDepartureSelect={onSavedDepartureSelect}
                onSavedDepartureEmptyPreviewToggle={onSavedDepartureEmptyPreviewToggle}
                onRecommend={onRecommend}
            />

            <ChatRecommendationResultsPanel
                meetingMode={meetingMode}
                recommendationSummary={recommendationSummary}
                hasRecommendations={hasRecommendations}
                recommendationCards={recommendationCards}
            />

            <ChatRecommendationMapPanel
                recommendationSummary={recommendationSummary}
                hasRecommendations={hasRecommendations}
                mapMarkerLabels={mapMarkerLabels}
            />
        </div>
    );
}
