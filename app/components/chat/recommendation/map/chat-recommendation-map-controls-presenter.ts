import type { OverlayMode } from "./chat-recommendation-map-controls";

type BuildMapControlsPresenterArgs = {
    overlayModes: Record<OverlayMode, boolean>; // 현재 오버레이 활성 상태입니다.
    isDraggable: boolean; // 드래그 가능 여부입니다.
    isZoomable: boolean; // 휠 줌 가능 여부입니다.
    isMobilePanelExpanded: boolean; // 모바일 패널이 펼쳐진 상태인지 나타냅니다.
};

type MapControlChip = {
    id: string; // 칩 구분용 id입니다.
    label: string; // 칩에 표시할 요약 문구입니다.
};

type MapControlInteraction = "drag" | "zoom";

type OverlayControlButton = {
    id: OverlayMode; // 어떤 오버레이를 토글하는 버튼인지 나타냅니다.
    label: string; // 버튼에 노출할 라벨입니다.
    isActive: boolean; // 현재 활성 상태인지 나타냅니다.
    className: string; // 상태에 맞는 버튼 스타일 클래스입니다.
};

type InteractionControlButton = {
    id: MapControlInteraction; // 드래그/줌 중 어떤 상호작용 제어 버튼인지 나타냅니다.
    label: string; // 버튼 라벨입니다.
    isActive: boolean; // 현재 활성 상태인지 나타냅니다.
    className: string; // 상태별 버튼 스타일 클래스입니다.
};

const overlayOptionLabels: Record<OverlayMode, string> = {
    TRAFFIC: "교통",
    BICYCLE: "자전거",
    TERRAIN: "지형",
};

// 오버레이 활성 여부에 따라 버튼의 강조 톤을 계산합니다.
function buildOverlayButtonClassName(isActive: boolean) {
    return isActive
        ? "bg-[#201a53] text-white shadow-[0px_10px_20px_rgba(43,35,115,0.22)]"
        : "border border-[#d9d4ff] bg-[#faf8ff] text-[#2b2373] hover:bg-[#f3efff]";
}

// 드래그/줌 제어 버튼의 on/off 스타일을 계산합니다.
function buildInteractionButtonClassName(isActive: boolean) {
    return isActive
        ? "bg-[#eff6ff] text-[#1d4ed8]"
        : "border border-[#d9d4ff] bg-white text-[#2b2373]";
}

// 지도 컨트롤 패널에 필요한 라벨과 버튼 스타일 정보를 계산합니다.
export function buildMapControlsPresenter({
    overlayModes,
    isDraggable,
    isZoomable,
    isMobilePanelExpanded,
}: BuildMapControlsPresenterArgs) {
    const chips: MapControlChip[] = [
        { id: "overlay", label: "교통/자전거/지형 오버레이" },
        { id: "interaction", label: "드래그/휠 줌 제어" },
    ];

    // presenter 단계에서 버튼 라벨과 활성 스타일을 모두 계산해 컴포넌트는 렌더에만 집중하게 합니다.
    const overlayButtons: OverlayControlButton[] = (Object.keys(overlayOptionLabels) as OverlayMode[]).map((overlayMode) => ({
        id: overlayMode,
        label: overlayOptionLabels[overlayMode],
        isActive: overlayModes[overlayMode],
        className: buildOverlayButtonClassName(overlayModes[overlayMode]),
    }));

    const interactionButtons: InteractionControlButton[] = [
        {
            id: "drag",
            label: `드래그 ${isDraggable ? "ON" : "OFF"}`,
            isActive: isDraggable,
            className: buildInteractionButtonClassName(isDraggable),
        },
        {
            id: "zoom",
            label: `휠 줌 ${isZoomable ? "ON" : "OFF"}`,
            isActive: isZoomable,
            className: buildInteractionButtonClassName(isZoomable),
        },
    ];

    return {
        // 모바일 패널 토글 라벨도 presenter에서 함께 계산해 뷰 로직을 단순화합니다.
        mobileToggleLabel: isMobilePanelExpanded ? "지도 컨트롤 접기" : "지도 컨트롤 펼치기",
        chips,
        overlayButtons,
        interactionButtons,
    };
}