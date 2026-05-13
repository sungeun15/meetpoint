import { buildMapControlsPresenter } from "./chat-recommendation-map-controls-presenter";
import { useMapControlsController } from "./use-map-controls-controller";

export type OverlayMode = "TRAFFIC" | "BICYCLE" | "TERRAIN";

type KakaoMapControlPanelProps = {
    overlayModes: Record<OverlayMode, boolean>; // 현재 어떤 지도 오버레이가 켜져 있는지 나타냅니다.
    isDraggable: boolean; // 지도를 드래그로 이동할 수 있는지 나타냅니다.
    isZoomable: boolean; // 휠 줌이 가능한지 나타냅니다.
    onOverlayToggle: (overlayMode: OverlayMode) => void; // 오버레이 버튼 클릭 시 on/off를 전환합니다.
    onInteractionToggle: (interaction: "drag" | "zoom") => void; // 드래그/줌 상호작용을 토글합니다.
};

type KakaoMapFitBoundsButtonProps = {
    onFitBounds: () => void; // 현재 마커 전체가 보이도록 지도 범위를 다시 맞춥니다.
};

// 오버레이와 상호작용 제어 버튼을 묶은 지도 컨트롤 패널입니다.
export function KakaoMapControlPanel({
    overlayModes,
    isDraggable,
    isZoomable,
    onOverlayToggle,
    onInteractionToggle,
}: KakaoMapControlPanelProps) {
    // 모바일에서는 패널을 접었다 펼칠 수 있게 별도 상태를 둡니다.
    const {
        isMobilePanelExpanded,
        toggleMobilePanelExpanded,
        buildOverlayToggleHandler,
        buildInteractionToggleHandler,
    } = useMapControlsController({
        onOverlayToggle,
        onInteractionToggle,
    });
    const presenter = buildMapControlsPresenter({
        overlayModes,
        isDraggable,
        isZoomable,
        isMobilePanelExpanded,
    });

    return (
        <div className="rounded-[20px] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(244,240,255,0.92)_100%)] p-2 shadow-[0px_18px_36px_rgba(43,35,115,0.14)] backdrop-blur-md sm:p-3">
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c6ae6]">Overlay & Interaction</p>
                    {/* 모바일에서는 버튼 묶음을 접어서 세로 길이를 줄이고 필요할 때만 펼칩니다. */}
                    <button
                        type="button"
                        onClick={toggleMobilePanelExpanded}
                        className="mt-1 flex w-full items-center justify-between rounded-[14px] border border-[#ddd8ff] bg-white/82 px-3 py-2 text-left sm:hidden"
                    >
                        <span className="text-[12px] font-semibold text-[#201a53]">
                            {presenter.mobileToggleLabel}
                        </span>
                        <span className="text-[16px] leading-none text-[#5f47d2]">
                            {isMobilePanelExpanded ? "▴" : "▾"}
                        </span>
                    </button>
                    <p className="mt-1 hidden text-[13px] font-semibold text-[#201a53] md:block">지도 겹침 정보와 탐색 방식을 빠르게 바꿀 수 있어요.</p>
                </div>
                {/* 데스크톱에서는 컨트롤 기능을 요약한 칩을 우측 상단에 함께 노출합니다. */}
                <div className="hidden flex-wrap gap-1.5 md:flex">
                    {presenter.chips.map((chip) => (
                        <span
                            key={chip.id}
                            className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-[#5f6782] shadow-[0px_8px_18px_rgba(43,35,115,0.08)]"
                        >
                            {chip.label}
                        </span>
                    ))}
                </div>
            </div>

            {/* 모바일 접힘 상태에서는 이 버튼 묶음을 숨기고, sm 이상에서는 항상 펼쳐 둡니다. */}
            <div className={`${isMobilePanelExpanded ? "grid" : "hidden"} mt-1.5 gap-1.5 sm:mt-2.5 sm:grid sm:gap-2 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]`}>
                <div className="rounded-[18px] border border-white/70 bg-white/88 p-1.5 shadow-[0px_12px_28px_rgba(43,35,115,0.08)] sm:rounded-2xl sm:p-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c6ae6]">Overlay</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {presenter.overlayButtons.map((overlayButton) => (
                            <button
                                key={overlayButton.id}
                                type="button"
                                onClick={buildOverlayToggleHandler(overlayButton.id)}
                                className={`rounded-xl px-2 py-1.5 text-[10px] font-semibold transition sm:px-2.5 sm:text-[11px] ${overlayButton.className}`}
                            >
                                {overlayButton.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="rounded-[18px] border border-white/70 bg-white/88 p-1.5 shadow-[0px_12px_28px_rgba(43,35,115,0.08)] sm:rounded-2xl sm:p-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c6ae6]">Interaction</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {presenter.interactionButtons.map((interactionButton) => (
                            <button
                                key={interactionButton.id}
                                type="button"
                                onClick={buildInteractionToggleHandler(interactionButton.id)}
                                className={`rounded-xl px-2 py-1.5 text-[10px] font-semibold transition sm:px-2.5 sm:text-[11px] ${interactionButton.className}`}
                            >
                                {interactionButton.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// 현재 마커 전체가 보이도록 지도 범위를 재설정하는 버튼입니다.
export function KakaoMapFitBoundsButton({ onFitBounds }: KakaoMapFitBoundsButtonProps) {
    return (
        <button
            type="button"
            onClick={onFitBounds}
            aria-label="전체 보기"
            title="전체 보기"
            // 지도 우측 상단 고정 액션 버튼으로 배치해 추천 마커 전체를 언제든 다시 볼 수 있게 합니다.
            className="absolute right-[7.45rem] top-1.5 z-20 inline-flex h-8 w-8 items-center justify-center rounded-[1rem] border border-white/70 bg-white/92 text-[16px] font-semibold text-[#201a53] shadow-[0px_12px_24px_rgba(43,35,115,0.16)] backdrop-blur-md transition hover:bg-[#f7f4ff] hover:text-[#4338ca] sm:right-[7.5rem] sm:h-9 sm:w-9 sm:text-[18px]"
        >
            ⛶
        </button>
    );
}