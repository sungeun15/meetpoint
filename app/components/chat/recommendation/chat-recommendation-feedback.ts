import type { DepartureParty, MeetingMode } from "../types";

// 참여자 구분값을 사용자 노출용 소유자 문구로 변환합니다.
function getPartyOwnerLabel(party: DepartureParty, friendName: string) {
    return party === "me" ? "내" : `${friendName} 님`;
}

// 출발지 선택이 비어 있을 때 입력 방식에 맞는 오류 문구를 만듭니다.
export function buildDepartureSelectionErrorMessage(
    party: DepartureParty,
    friendName: string,
    selectionType: "saved" | "pin" | "search",
) {
    const ownerLabel = getPartyOwnerLabel(party, friendName);

    if (selectionType === "saved") {
        return `${ownerLabel} 저장 위치를 먼저 선택해 주세요.`;
    }

    if (selectionType === "pin") {
        return `${ownerLabel} 핀 위치를 먼저 선택해 주세요.`;
    }

    return `${ownerLabel} 출발 위치 주소를 먼저 입력해 주세요.`;
}

// 핀으로 고른 위치를 출발지에 반영했을 때의 확인 문구입니다.
export function buildPinnedDepartureAppliedFeedback(party: DepartureParty, friendName: string) {
    return `${getPartyOwnerLabel(party, friendName)} 핀 위치를 출발 위치에 반영했어요.`;
}

// 저장 위치를 선택했을 때의 확인 문구입니다.
export function buildSavedDepartureSelectedFeedback(party: DepartureParty, friendName: string) {
    return `${getPartyOwnerLabel(party, friendName)} 저장 위치를 추천 기준으로 선택했어요.`;
}

// 현재 입력 위치를 새 저장 위치로 추가했을 때의 확인 문구입니다.
export function buildSavedDepartureCreatedFeedback(party: DepartureParty, friendName: string, title: string) {
    return `${getPartyOwnerLabel(party, friendName)} 위치를 "${title}" 이름으로 저장했어요.`;
}

// 추천 실행 전에 부족한 조건이 있는지 모드별로 검사해 사용자 안내 문구를 반환합니다.
export function buildRecommendationRequirementMessage(args: {
    meetingMode: MeetingMode;
    friendName: string;
    hasMyLocation: boolean;
    hasFriendLocation: boolean;
    hasMyDeparture: boolean;
    hasFriendDeparture: boolean;
}) {
    if (args.meetingMode === "now" && !args.hasMyLocation) {
        return "지금 만나기에서는 위치 공유 후 추천을 시작해 주세요.";
    }

    if (args.meetingMode === "now" && !args.hasFriendLocation) {
        return `${args.friendName} 님의 위치 정보가 아직 없어요.`;
    }

    if (args.meetingMode === "later" && !args.hasMyDeparture && !args.hasFriendDeparture) {
        return "나중에 만나기에서는 내 출발 위치와 친구 출발 위치를 모두 정해 주세요.";
    }

    if (args.meetingMode === "later" && !args.hasMyDeparture) {
        return "나중에 만나기에서는 내 출발 위치를 먼저 정해 주세요.";
    }

    if (args.meetingMode === "later" && !args.hasFriendDeparture) {
        return `나중에 만나기에서는 ${args.friendName} 님 출발 위치를 먼저 정해 주세요.`;
    }

    return null;
}

// 추천 계산이 끝난 뒤 요약 피드백 문구를 구성합니다.
export function buildRecommendationSuccessFeedback(friendName: string, meetingMode: MeetingMode, maxRecommendationCount: number) {
    return `${friendName} 님 기준 ${meetingMode === "now" ? "실시간 위치" : "출발 위치"} 추천 결과 최대 ${maxRecommendationCount}개를 계산했어요.`;
}