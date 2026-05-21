import type {
    DepartureInputMethod,
    DepartureParty,
    MeetingMode,
    RecommendationCategory,
    SavedDeparture,
} from "../types";

export const modeOptions: Array<{ id: MeetingMode; label: string; description: string }> = [
    { id: "now", label: "지금 만나기", description: "현재 공유 위치 기준으로 바로 추천을 받아요." },
    { id: "later", label: "나중에 만나기", description: "약속 출발 위치를 정한 뒤 추천을 받아요." },
];

export const departureMethodOptions: Array<{ id: DepartureInputMethod; label: string }> = [
    { id: "search", label: "주소 검색" },
    { id: "pin", label: "지도 핀 지정" },
    { id: "saved", label: "저장 위치" },
];

export const categoryOptions: Array<{ id: RecommendationCategory; label: string; description: string }> = [
    { id: "cafe", label: "카페", description: "대화 중심 약속" },
    { id: "meal", label: "식사", description: "식사 약속" },
    { id: "fun", label: "놀거리", description: "활동 중심 약속" },
];

export const departurePartyMeta: Array<{ id: DepartureParty; label: string }> = [
    { id: "me", label: "내 출발 위치" },
    { id: "friend", label: "친구 출발 위치" },
];

export const SAVED_DEPARTURE_PAGE_SIZE = 10;

type BuildDepartureSettingsViewModelArgs = {
    // 현재 선택된 만남 모드입니다.
    meetingMode: MeetingMode;
    // 현재 선택된 추천 카테고리입니다.
    selectedCategory: RecommendationCategory;
    // 현재 적용 중인 출발지 입력 방식입니다.
    departureInputMethod: DepartureInputMethod;
    // 저장 출발지 모드에서 선택된 친구 ID입니다.
    selectedDepartureFriendId: string;
    // 저장 출발지 친구 선택 옵션입니다.
    departureFriendOptions: Array<{ id: string; nickname: string }>;
    // 현재 채팅 상대 이름입니다.
    selectedFriendName: string;
};

function stripSavedDepartureLegacyTag(description: string) {
    return description.replace(/^(프리셋|최근 사용)\s*·\s*/u, "").trim();
}

export function formatSavedDepartureDisplayTime(departure: SavedDeparture) {
    if (!departure.lastUsedAt) {
        return stripSavedDepartureLegacyTag(departure.description);
    }

    const date = new Date(departure.lastUsedAt);

    if (Number.isNaN(date.getTime())) {
        return stripSavedDepartureLegacyTag(departure.description);
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours24 = date.getHours();
    const meridiem = hours24 >= 12 ? "오후" : "오전";
    const hours12 = hours24 % 12 || 12;
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}.${month}.${day} ${meridiem} ${hours12}.${minutes}`;
}

export function buildDepartureSettingsViewModel({
    meetingMode,
    selectedCategory,
    departureInputMethod,
    selectedDepartureFriendId,
    departureFriendOptions,
    selectedFriendName,
}: BuildDepartureSettingsViewModelArgs) {
    const isAllDepartureFriendsSelected = selectedDepartureFriendId === "all";
    const selectedDepartureFriendLabel = isAllDepartureFriendsSelected
        ? "친구 전체"
        : departureFriendOptions.find((friend) => friend.id === selectedDepartureFriendId)?.nickname ?? selectedFriendName;
    const currentChatFriendLabel = selectedFriendName;
    const departurePartyLabels = {
        me: "내",
        friend: currentChatFriendLabel,
    } satisfies Record<DepartureParty, string>;
    const selectedModeOption = modeOptions.find((option) => option.id === meetingMode) ?? modeOptions[0];
    const selectedCategoryOption = categoryOptions.find((option) => option.id === selectedCategory) ?? categoryOptions[0];
    const selectedDepartureMethodOption = departureMethodOptions.find((option) => option.id === departureInputMethod) ?? departureMethodOptions[0];
    const mobileSettingsSummary = meetingMode === "later"
        ? `${selectedModeOption.label} · ${selectedDepartureMethodOption.label} · ${selectedCategoryOption.label}`
        : `${selectedModeOption.label} · ${selectedCategoryOption.label}`;

    return {
        selectedDepartureFriendLabel,
        currentChatFriendLabel,
        departurePartyLabels,
        mobileSettingsSummary,
    };
}

export function buildDeparturePartyTitle(
    party: DepartureParty,
    partyLabel: string,
    departureInputMethod: DepartureInputMethod,
    selectedDepartureFriendLabel: string,
    currentChatFriendLabel: string,
) {
    if (party === "me") {
        return partyLabel;
    }

    return `${departureInputMethod === "saved" ? selectedDepartureFriendLabel : currentChatFriendLabel} 출발 위치`;
}