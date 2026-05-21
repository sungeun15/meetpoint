import type {
    DepartureParty,
    ResolvedLocation,
    SavedDeparture,
} from "../../types";

type SavedDepartureIds = Record<DepartureParty, string>;

type BuildSelectedSavedDepartureIdsWithPersistedFallbackArgs = {
    activeFriendId: string;
    preferredDepartureFriendId: string;
    savedDepartures: SavedDeparture[];
    selectedSavedDepartureIds: SavedDepartureIds;
};

export function replaceSavedDepartureWithSelection(currentSavedDepartures: SavedDeparture[], nextSavedDeparture: SavedDeparture) {
    // 같은 owner/friend 범위에서는 방금 선택한 저장 위치만 selected 상태로 남깁니다.
    return [
        {
            ...nextSavedDeparture,
            isSelected: nextSavedDeparture.isSelected ?? false,
        },
        ...currentSavedDepartures
            .filter((departure) => departure.id !== nextSavedDeparture.id)
            .map((departure) => {
                const isSameSelectionScope = departure.ownerParty === nextSavedDeparture.ownerParty
                    && departure.friendId === nextSavedDeparture.friendId;

                if (isSameSelectionScope && nextSavedDeparture.isSelected) {
                    return {
                        ...departure,
                        isSelected: false,
                    };
                }

                return departure;
            }),
    ];
}

export function buildSelectedSavedDepartureIdsWithPersistedFallback({
    activeFriendId,
    preferredDepartureFriendId,
    savedDepartures,
    selectedSavedDepartureIds,
}: BuildSelectedSavedDepartureIdsWithPersistedFallbackArgs): SavedDepartureIds {
    // 화면 state가 비어 있으면 DB에서 내려온 isSelected 값을 현재 선택값처럼 복원합니다.
    const persistedSelectedSavedDepartureIds = {
        me: savedDepartures.find(
            (departure) => departure.ownerParty === "me" && departure.isSelected,
        )?.id ?? "",
        friend: savedDepartures.find((departure) => {
            if (departure.ownerParty !== "friend" || !departure.isSelected) {
                return false;
            }

            if (preferredDepartureFriendId === "all") {
                return true;
            }

            const targetFriendId = preferredDepartureFriendId || activeFriendId;

            return departure.friendId === targetFriendId;
        })?.id ?? "",
    };

    return {
        me: selectedSavedDepartureIds.me || persistedSelectedSavedDepartureIds.me,
        friend: selectedSavedDepartureIds.friend || persistedSelectedSavedDepartureIds.friend,
    };
}

export function buildSelectedFriendDepartureLocation(selectedFriendDeparture: SavedDeparture | null): ResolvedLocation | null {
    // 헤더 버튼은 추천 패널의 전체 상태 대신 지도 표시용 좌표/주소만 쓰도록 납작하게 변환합니다.
    if (!selectedFriendDeparture) {
        return null;
    }

    return {
        label: selectedFriendDeparture.label,
        address: selectedFriendDeparture.address,
        latitude: selectedFriendDeparture.latitude,
        longitude: selectedFriendDeparture.longitude,
    };
}