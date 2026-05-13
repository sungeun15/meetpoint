import { useState } from "react";

type OverlayMode = "TRAFFIC" | "BICYCLE" | "TERRAIN";
type MapControlInteraction = "drag" | "zoom";

type UseMapControlsControllerArgs = {
    onOverlayToggle: (overlayMode: OverlayMode) => void; // 오버레이 토글을 실제 지도 객체에 반영하는 콜백입니다.
    onInteractionToggle: (interaction: MapControlInteraction) => void; // 드래그/줌 상호작용 토글 콜백입니다.
};

// 지도 컨트롤 패널의 모바일 확장 상태와 버튼 핸들러 생성을 담당합니다.
export function useMapControlsController({
    onOverlayToggle,
    onInteractionToggle,
}: UseMapControlsControllerArgs) {
    const [isMobilePanelExpanded, setIsMobilePanelExpanded] = useState(false);

    // 모바일 컨트롤 패널을 접었다 펼칩니다.
    function toggleMobilePanelExpanded() {
        setIsMobilePanelExpanded((currentValue) => !currentValue);
    }

    // 특정 오버레이 토글용 클릭 핸들러를 만듭니다.
    function buildOverlayToggleHandler(overlayMode: OverlayMode) {
        return function handleOverlayToggle() {
            onOverlayToggle(overlayMode);
        };
    }

    // 드래그/줌 상호작용 토글용 클릭 핸들러를 만듭니다.
    function buildInteractionToggleHandler(interaction: MapControlInteraction) {
        return function handleInteractionToggle() {
            onInteractionToggle(interaction);
        };
    }

    return {
        isMobilePanelExpanded,
        toggleMobilePanelExpanded,
        buildOverlayToggleHandler,
        buildInteractionToggleHandler,
    };
}