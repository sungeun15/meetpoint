import { useState } from "react";

import { ChatDepartureSettingsPanel } from "../chat-departure-settings-panel";
import { ChatRecommendationMapPanel } from "./map/chat-recommendation-map-panel";
import { ChatRecommendationResultsPanel } from "./results/chat-recommendation-results-panel";
import type {
    DepartureParty,
    DepartureInputMethod,
    MapMarker,
    MeetingMode,
    RecommendationCard,
    RecommendationCategory,
    RecommendationSummary,
    SavedDeparture,
} from "../types";

type ChatRecommendationPanelsProps = {
    meetingMode: MeetingMode; // 현재 추천 모드입니다.
    selectedCategory: RecommendationCategory; // 추천 카테고리 선택 상태입니다.
    departureInputMethod: DepartureInputMethod; // 출발 위치 입력 방식입니다.
    departureSearchQueries: Record<DepartureParty, string>; // 검색 입력창 값입니다.
    visibleSavedDepartures: SavedDeparture[]; // 저장 위치 목록 또는 빈 미리보기 결과입니다.
    isSavedDepartureEmptyPreview: boolean; // 저장 위치가 비어 있는 상태를 미리보기 중인지 나타냅니다.
    selectedSavedDepartureIds: Record<DepartureParty, string>; // 참여자별 선택된 저장 위치 id입니다.
    selectedDepartureLabels: Record<DepartureParty, string | null> | null; // 현재 추천에 사용될 출발지 라벨 요약입니다.
    selectedFriendName: string; // 출발지 설정 패널에 노출할 친구 이름입니다.
    recommendationSummary: RecommendationSummary; // 결과 카드와 지도 패널 상단에 공통으로 쓸 요약 데이터입니다.
    canRecommend: boolean; // 추천 버튼 활성화 여부를 판단하는 상태입니다.
    onMeetingModeChange: (nextMode: MeetingMode) => void; // 모임 방식 변경 콜백입니다.
    onCategoryChange: (nextCategory: RecommendationCategory) => void; // 카테고리 변경 콜백입니다.
    onDepartureInputMethodChange: (nextMethod: DepartureInputMethod) => void; // 출발지 입력 방식 변경 콜백입니다.
    onDepartureSearchQueryChange: (party: DepartureParty, nextQuery: string) => void; // 참여자별 검색어 변경 콜백입니다.
    onOpenSaveLocationLayer: (party: DepartureParty, previewValue: string, sourceLabel: string) => void; // 저장 위치 생성 레이어를 여는 콜백입니다.
    onPinnedDepartureSelect: (party: DepartureParty, pinnedAddress: string) => void; // 핀 위치 선택 콜백입니다.
    onSavedDepartureSelect: (party: DepartureParty, departureId: string) => void; // 저장 위치 선택 콜백입니다.
    onSavedDepartureEmptyPreviewToggle: () => void; // 저장 위치 비우기 미리보기 토글 콜백입니다.
    onRecommend: () => void; // 추천 실행 콜백입니다.
    hasRecommendations: boolean; // 실제 추천 결과가 존재하는지 나타냅니다.
    recommendationCards: RecommendationCard[]; // 추천 카드 목록입니다.
    mapMarkers: MapMarker[]; // 지도에 표시할 마커 목록입니다.
};

// 추천 조건 패널, 결과 카드 패널, 지도 패널을 한 레이아웃에서 묶고 선택 상태를 동기화합니다.
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
    mapMarkers,
}: ChatRecommendationPanelsProps) {
    const [activeSelectionId, setActiveSelectionId] = useState<string | null>(null);
    const [focusedRecommendationId, setFocusedRecommendationId] = useState<string | null>(null);
    // 현재 활성 선택 id가 유효하지 않으면 첫 추천 카드를 기본 선택으로 사용합니다.
    const activeRecommendationId = activeSelectionId && recommendationCards.some((card) => card.id === activeSelectionId)
        ? activeSelectionId
        : recommendationCards[0]?.id ?? null;
    // 지도 강조 마커도 별도로 관리하되 목록과 동일한 기본 fallback을 갖습니다.
    const mapFocusedRecommendationId = focusedRecommendationId && recommendationCards.some((card) => card.id === focusedRecommendationId)
        ? focusedRecommendationId
        : recommendationCards[0]?.id ?? null;

    // 결과 카드 선택은 리스트 활성 상태와 지도 포커스를 함께 바꿉니다.
    function handleRecommendationCardSelect(recommendationId: string) {
        setActiveSelectionId(recommendationId);
        setFocusedRecommendationId(recommendationId);
    }

    // 지도 마커 클릭은 현재 선택 카드만 바꾸고 지도 포커스는 유지합니다.
    function handleMapMarkerSelect(recommendationId: string) {
        setActiveSelectionId(recommendationId);
    }

    // 장소 칩 클릭은 카드 선택과 지도 포커스를 동시에 갱신합니다.
    function handlePlaceChipSelect(recommendationId: string) {
        setActiveSelectionId(recommendationId);
        setFocusedRecommendationId(recommendationId);
    }

    return (
        <div className="grid gap-2 sm:gap-3 lg:grid-cols-[minmax(0,1.14fr)_minmax(0,0.86fr)] lg:items-start lg:gap-4 xl:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
            <div className="lg:col-span-2">
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
            </div>

            <div className="min-w-0 xl:sticky xl:top-4 xl:self-start">
                <ChatRecommendationResultsPanel
                    meetingMode={meetingMode}
                    recommendationSummary={recommendationSummary}
                    hasRecommendations={hasRecommendations}
                    recommendationCards={recommendationCards}
                    selectedRecommendationId={activeRecommendationId}
                    onRecommendationCardSelect={handleRecommendationCardSelect}
                />
            </div>

            <div className="min-w-0">
                <ChatRecommendationMapPanel
                    recommendationSummary={recommendationSummary}
                    hasRecommendations={hasRecommendations}
                    mapMarkers={mapMarkers}
                    activeMarkerId={activeRecommendationId}
                    focusedMarkerId={mapFocusedRecommendationId}
                    onMarkerSelect={handleMapMarkerSelect}
                    onPlaceChipSelect={handlePlaceChipSelect}
                />
            </div>
        </div>
    );
}
