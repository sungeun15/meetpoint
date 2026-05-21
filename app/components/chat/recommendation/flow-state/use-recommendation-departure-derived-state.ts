import { useMemo } from "react";

import type { FriendItem } from "../../../friends/types";
import {
    buildSelectedDepartureLabels,
    buildSelectedSavedDepartures,
    departurePartyOrder,
} from "../chat-recommendation-flow-helpers";
import type {
    DepartureInputMethod,
    DepartureParty,
    MeetingMode,
    ResolvedLocation,
    SavedDeparture,
} from "../../types";

type UseRecommendationDepartureDerivedStateArgs = {
    activeFriendId: string; // 현재 대화 중인 친구 id 입니다.
    availableFriends: FriendItem[]; // 출발지 대상 친구 선택 목록 원본입니다.
    preferredDepartureFriendId: string; // 사용자가 마지막으로 고른 친구 필터 값입니다.
    selectedFriend: FriendItem | null; // 현재 대화 중인 친구 정보입니다.
    savedDepartures: SavedDeparture[]; // 서버에서 불러온 저장 출발지 전체 목록입니다.
    selectedSavedDepartureIds: Record<DepartureParty, string>; // 참여자별 현재 선택 id 입니다.
    meetingMode: MeetingMode; // now/later 추천 모드입니다.
    departureInputMethod: DepartureInputMethod; // 검색/핀/저장 위치 중 입력 방식입니다.
    departureSearchQueries: Record<DepartureParty, string>; // 검색 입력 원본입니다.
    pinnedDepartureLabels: Record<DepartureParty, string>; // 핀으로 확정한 주소 라벨입니다.
};

type DepartureFriendOption = {
    id: string; // 드롭다운에 표시할 친구 id 입니다.
    nickname: string; // 드롭다운에 표시할 친구 이름입니다.
};

type UseRecommendationDepartureDerivedStateResult = {
    departureFriendOptions: DepartureFriendOption[]; // 친구 선택 드롭다운 옵션 목록입니다.
    selectedDepartureFriendId: string; // 현재 유효한 친구 필터 id 입니다.
    selectedDepartureFriendName: string; // 저장 위치 저장/표시에 사용할 친구 이름입니다.
    visibleSavedDepartures: Record<DepartureParty, SavedDeparture[]>; // 현재 필터링된 저장 출발지 목록입니다.
    effectiveSelectedSavedDepartureIds: Record<DepartureParty, string>; // 현재 목록 기준으로 보정된 선택 id 입니다.
    selectedSavedDepartures: Record<DepartureParty, SavedDeparture | null>; // 선택 id 를 실제 저장 출발지 객체로 푼 값입니다.
    selectedDepartureLabels: Record<DepartureParty, string | null> | null; // 현재 입력 방식 기준 최종 출발지 라벨입니다.
    friendLocation: (ResolvedLocation & { sharedAt: string | null }) | null; // 추천 모듈 공용 형태로 정규화한 친구 위치입니다.
};

export function useRecommendationDepartureDerivedState({
    activeFriendId,
    availableFriends,
    preferredDepartureFriendId,
    selectedFriend,
    savedDepartures,
    selectedSavedDepartureIds,
    meetingMode,
    departureInputMethod,
    departureSearchQueries,
    pinnedDepartureLabels,
}: UseRecommendationDepartureDerivedStateArgs): UseRecommendationDepartureDerivedStateResult {
    const departureFriendOptions = useMemo(
        () => [{ id: "all", nickname: "전체" }, ...availableFriends
            .map((friend) => ({ id: friend.id, nickname: friend.nickname }))]
            .sort((left, right) => {
                if (left.id === "all") {
                    return -1;
                }

                if (right.id === "all") {
                    return 1;
                }

                if (left.id === activeFriendId && right.id !== activeFriendId) {
                    return -1;
                }

                if (right.id === activeFriendId && left.id !== activeFriendId) {
                    return 1;
                }

                return left.nickname.localeCompare(right.nickname, "ko-KR");
            }),
        [activeFriendId, availableFriends],
    );
    const selectedDepartureFriendId = useMemo(() => {
        if (preferredDepartureFriendId === "all") {
            return "all";
        }

        if (preferredDepartureFriendId && availableFriends.some((friend) => friend.id === preferredDepartureFriendId)) {
            return preferredDepartureFriendId;
        }

        if (activeFriendId && availableFriends.some((friend) => friend.id === activeFriendId)) {
            return activeFriendId;
        }

        return availableFriends[0]?.id ?? "all";
    }, [activeFriendId, availableFriends, preferredDepartureFriendId]);
    const selectedDepartureFriendName = selectedDepartureFriendId === "all"
        ? "친구 전체"
        : departureFriendOptions.find((friend) => friend.id === selectedDepartureFriendId)?.nickname
        ?? selectedFriend?.nickname
        ?? "친구";

    // 친구 필터 값에 따라 friend 저장 출발지 목록을 동적으로 좁혀 현재 화면 목록을 만듭니다.
    const visibleSavedDepartures = useMemo(
        () => departurePartyOrder.reduce<Record<DepartureParty, SavedDeparture[]>>((accumulator, party) => {
            accumulator[party] = savedDepartures.filter((departure) => {
                if (party === "me") {
                    return departure.ownerParty === "me";
                }

                if (selectedDepartureFriendId === "all") {
                    return departure.ownerParty === "friend";
                }

                return departure.ownerParty === "friend" && departure.friendId === selectedDepartureFriendId;
            });
            return accumulator;
        }, { me: [], friend: [] }),
        [savedDepartures, selectedDepartureFriendId],
    );

    // 현재 선택 id 가 필터 결과에서 사라졌으면 첫 번째 유효 항목으로 자동 보정합니다.
    const effectiveSelectedSavedDepartureIds = useMemo(
        () => departurePartyOrder.reduce<Record<DepartureParty, string>>((accumulator, party) => {
            const departuresForParty = visibleSavedDepartures[party];
            const hasCurrentSelection = departuresForParty.some((departure) => departure.id === selectedSavedDepartureIds[party]);

            accumulator[party] = hasCurrentSelection
                ? selectedSavedDepartureIds[party]
                : departuresForParty[0]?.id ?? "";

            return accumulator;
        }, { me: "", friend: "" }),
        [selectedSavedDepartureIds, visibleSavedDepartures],
    );
    const selectedSavedDepartures = buildSelectedSavedDepartures({
        savedDepartures,
        selectedSavedDepartureIds: effectiveSelectedSavedDepartureIds,
    });
    const selectedDepartureLabels = buildSelectedDepartureLabels({
        meetingMode,
        departureInputMethod,
        departureSearchQueries,
        pinnedDepartureLabels,
        previewSelectedSavedDepartures: selectedSavedDepartures,
    });
    const friendName = selectedFriend?.nickname ?? "친구";
    const friendLocation = useMemo(
        () => selectedFriend?.locationSnapshot
            ? {
                label: `${friendName} 현재 위치`,
                address: selectedFriend.locationSnapshot.address,
                latitude: selectedFriend.locationSnapshot.latitude,
                longitude: selectedFriend.locationSnapshot.longitude,
                sharedAt: selectedFriend.locationSnapshot.sharedAt ?? null,
            }
            : null,
        [friendName, selectedFriend],
    );

    return {
        departureFriendOptions,
        selectedDepartureFriendId,
        selectedDepartureFriendName,
        visibleSavedDepartures,
        effectiveSelectedSavedDepartureIds,
        selectedSavedDepartures,
        selectedDepartureLabels,
        friendLocation,
    };
}