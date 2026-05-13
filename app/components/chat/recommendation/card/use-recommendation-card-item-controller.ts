import type { KeyboardEvent } from "react";

type UseRecommendationCardItemControllerArgs = {
    recommendationId: string; // 현재 카드가 대표하는 추천 장소 id입니다.
    onSelect: (recommendationId: string) => void; // 선택 id를 상위 상태에 전달하는 콜백입니다.
};

// 카드 클릭과 키보드 선택을 동일한 select 흐름으로 묶는 훅입니다.
export function useRecommendationCardItemController({
    recommendationId,
    onSelect,
}: UseRecommendationCardItemControllerArgs) {
    // 마우스 클릭 시 현재 카드 id를 그대로 선택 이벤트로 전달합니다.
    function handleSelect() {
        onSelect(recommendationId);
    }

    // Enter 또는 Space 입력을 버튼 클릭과 같은 의미로 처리해 접근성을 맞춥니다.
    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleSelect();
        }
    }

    return {
        handleSelect,
        handleKeyDown,
    };
}