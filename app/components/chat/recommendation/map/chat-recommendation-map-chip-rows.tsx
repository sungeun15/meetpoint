import { useRef, useState } from "react";
import type { MouseEvent, PointerEvent, RefObject, WheelEvent } from "react";

import { friendsBodyFont } from "../../../friends/fonts";
import type { MapMarker } from "../../types";

const chipRowClassName = "flex w-full min-w-0 gap-1.5 overflow-x-auto overflow-y-hidden overscroll-x-contain pb-1.5 pr-1 touch-pan-x [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#cdbfff] [&::-webkit-scrollbar-track]:bg-transparent";
const dragThresholdPx = 6;
const horizontalScrollHintCopy = "휠 또는 드래그로 좌우 이동";

function isInteractiveChipTarget(target: EventTarget | null) {
    return target instanceof HTMLElement && Boolean(target.closest("button, a, input, textarea, select, [role='button']"));
}

// 세로 휠 입력을 가로 스크롤 이동으로 변환해 칩 행 탐색을 쉽게 만듭니다.
function handleChipRowWheel(event: WheelEvent<HTMLDivElement>) {
    const scrollContainer = event.currentTarget;
    const hasHorizontalOverflow = scrollContainer.scrollWidth > scrollContainer.clientWidth;
    const horizontalDelta = Math.abs(event.deltaX);
    const verticalDelta = Math.abs(event.deltaY);

    if (!hasHorizontalOverflow || verticalDelta <= horizontalDelta) {
        return;
    }

    event.preventDefault();
    scrollContainer.scrollLeft += event.deltaY;
}

// 마우스 드래그로 가로 스크롤할 수 있게 포인터 상태와 클릭 방지를 함께 관리합니다.
function useHorizontalDragScroll() {
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const dragStateRef = useRef({
        pointerId: -1,
        startClientX: 0,
        startScrollLeft: 0,
        hasDragged: false,
    });
    const [isDragging, setIsDragging] = useState(false);

    // 실제 overflow가 있을 때만 드래그 스크롤을 시작합니다.
    function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
        const scrollContainer = scrollContainerRef.current;

        if (!scrollContainer || scrollContainer.scrollWidth <= scrollContainer.clientWidth || isInteractiveChipTarget(event.target)) {
            return;
        }

        dragStateRef.current.pointerId = event.pointerId;
        dragStateRef.current.startClientX = event.clientX;
        dragStateRef.current.startScrollLeft = scrollContainer.scrollLeft;
        dragStateRef.current.hasDragged = false;
        setIsDragging(true);
        scrollContainer.setPointerCapture(event.pointerId);
    }

    // 임계값 이상 움직였을 때만 클릭이 아니라 드래그로 간주합니다.
    function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
        const scrollContainer = scrollContainerRef.current;

        if (!scrollContainer || dragStateRef.current.pointerId !== event.pointerId) {
            return;
        }

        const deltaX = event.clientX - dragStateRef.current.startClientX;

        if (Math.abs(deltaX) > dragThresholdPx) {
            dragStateRef.current.hasDragged = true;
        }

        if (!dragStateRef.current.hasDragged) {
            return;
        }

        event.preventDefault();
        scrollContainer.scrollLeft = dragStateRef.current.startScrollLeft - deltaX;
    }

    function finishDragging(pointerId: number) {
        const scrollContainer = scrollContainerRef.current;

        if (scrollContainer?.hasPointerCapture(pointerId)) {
            scrollContainer.releasePointerCapture(pointerId);
        }

        dragStateRef.current.pointerId = -1;
        setIsDragging(false);
    }

    function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
        if (dragStateRef.current.pointerId !== event.pointerId) {
            return;
        }

        finishDragging(event.pointerId);
    }

    function handlePointerCancel(event: PointerEvent<HTMLDivElement>) {
        if (dragStateRef.current.pointerId !== event.pointerId) {
            return;
        }

        finishDragging(event.pointerId);
    }

    // 드래그 직후 발생하는 클릭으로 버튼이 오작동하지 않게 막습니다.
    function handleClickCapture(event: MouseEvent<HTMLDivElement>) {
        if (!dragStateRef.current.hasDragged) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        dragStateRef.current.hasDragged = false;
    }

    return {
        scrollContainerRef,
        isDragging,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        handlePointerCancel,
        handleClickCapture,
    };
}

// 스크롤 가능한 행에 처음 진입했을 때만 짧은 사용 힌트를 한 번 노출합니다.
function useHorizontalScrollHint(scrollContainerRef: RefObject<HTMLDivElement | null>) {
    const hasShownHintRef = useRef(false);
    const [isHintVisible, setIsHintVisible] = useState(false);

    function maybeShowHint() {
        const scrollContainer = scrollContainerRef.current;

        if (!scrollContainer || hasShownHintRef.current || scrollContainer.scrollWidth <= scrollContainer.clientWidth) {
            return;
        }

        setIsHintVisible(true);
    }

    function dismissHint() {
        if (hasShownHintRef.current) {
            return;
        }

        hasShownHintRef.current = true;
        setIsHintVisible(false);
    }

    return {
        isHintVisible,
        maybeShowHint,
        dismissHint,
    };
}

type RecommendationMapParticipantChipRowProps = {
    participantMarkers: MapMarker[]; // 내 위치, 친구 위치, 중심점 등 비장소 마커 목록입니다.
};

// 참여자 관련 마커를 읽기 전용 칩 행으로 보여 줍니다.
export function RecommendationMapParticipantChipRow({
    participantMarkers,
}: RecommendationMapParticipantChipRowProps) {
    const {
        scrollContainerRef,
        isDragging,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        handlePointerCancel,
        handleClickCapture,
    } = useHorizontalDragScroll();
    const { isHintVisible, maybeShowHint, dismissHint } = useHorizontalScrollHint(scrollContainerRef);

    return (
        <div className="space-y-1">
            {isHintVisible ? (
                <p className={`${friendsBodyFont.className} text-[10px] text-[#7c6bcf] sm:text-[11px]`}>
                    {horizontalScrollHintCopy}
                </p>
            ) : null}
            <div
                ref={scrollContainerRef}
                className={`${chipRowClassName} ${isDragging ? "cursor-grabbing select-none" : "cursor-grab"}`}
                onWheel={handleChipRowWheel}
                onPointerEnter={maybeShowHint}
                onPointerLeave={dismissHint}
                onPointerDown={(event) => {
                    dismissHint();
                    handlePointerDown(event);
                }}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                onClickCapture={handleClickCapture}
            >
                {participantMarkers.map((marker) => (
                    <span
                        key={marker.id}
                        className={`${friendsBodyFont.className} shrink-0 whitespace-nowrap rounded-full bg-[#ede7ff] px-2.5 py-1 text-[10px] text-[#5f47d2] sm:px-3 sm:text-[11px]`}
                    >
                        {marker.label}
                    </span>
                ))}
            </div>
        </div>
    );
}

type RecommendationMapPlaceChipRowProps = {
    placeMarkers: MapMarker[]; // 추천 장소 칩으로 보여 줄 마커 목록입니다.
    activeMarkerId: string | null; // 현재 활성 상태인 장소 마커 id입니다.
    isPlaceChipHiddenOnMobile: (index: number, markerId: string, activeMarkerId: string | null) => boolean; // 모바일에서 숨길 칩인지 판단하는 함수입니다.
    onPlaceChipSelect: (markerId: string) => void; // 장소 칩을 클릭했을 때 상위로 선택 이벤트를 전달합니다.
};

// 추천 장소 마커를 가로 스크롤 가능한 인터랙션 칩 행으로 보여 줍니다.
export function RecommendationMapPlaceChipRow({
    placeMarkers,
    activeMarkerId,
    isPlaceChipHiddenOnMobile,
    onPlaceChipSelect,
}: RecommendationMapPlaceChipRowProps) {
    const {
        scrollContainerRef,
        isDragging,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        handlePointerCancel,
        handleClickCapture,
    } = useHorizontalDragScroll();
    const { isHintVisible, maybeShowHint, dismissHint } = useHorizontalScrollHint(scrollContainerRef);

    return (
        <div className="space-y-1">
            {isHintVisible ? (
                <p className={`${friendsBodyFont.className} text-[10px] text-[#7c6bcf] sm:text-[11px]`}>
                    {horizontalScrollHintCopy}
                </p>
            ) : null}
            <div
                ref={scrollContainerRef}
                className={`${chipRowClassName} ${isDragging ? "cursor-grabbing select-none" : "cursor-grab"}`}
                onWheel={handleChipRowWheel}
                onPointerEnter={maybeShowHint}
                onPointerLeave={dismissHint}
                onPointerDown={(event) => {
                    dismissHint();
                    handlePointerDown(event);
                }}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                onClickCapture={handleClickCapture}
            >
                {placeMarkers.map((marker, index) => {
                    const isHiddenOnMobile = isPlaceChipHiddenOnMobile(index, marker.id, activeMarkerId);

                    return (
                        <button
                            key={marker.id}
                            type="button"
                            onClick={() => onPlaceChipSelect(marker.id)}
                            className={`${friendsBodyFont.className} shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] shadow-[0px_8px_20px_rgba(52,41,104,0.08)] transition ${isHiddenOnMobile ? "hidden sm:inline-flex" : "inline-flex"} sm:px-3 sm:text-[11px] ${activeMarkerId === marker.id ? "bg-[#2b2373] text-white" : "bg-white text-[#2b2373] hover:bg-[#f3efff]"}`}
                        >
                            {marker.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}