import type { Dispatch, SetStateAction } from "react";

import { SAVED_DEPARTURE_PAGE_SIZE } from "./chat-departure-settings-helpers";
import type { DeleteConfirmationState, PinPickerLayerState } from "./use-chat-departure-settings-overlays";
import type { DepartureParty, ResolvedLocation, SavedDeparture } from "../types";

type UseChatDepartureSettingsActionsArgs = {
    // 현재 열려 있는 핀 선택 레이어 상태입니다.
    pinPickerLayerState: PinPickerLayerState | null;
    // 현재 열려 있는 삭제 확인 상태입니다.
    deleteConfirmationState: DeleteConfirmationState | null;
    // 친구 관련 토스트 문구에 사용할 기본 친구 이름입니다.
    selectedFriendName: string;
    // 사용자에게 토스트 메시지를 보여줍니다.
    onShowToast: (message: string) => void;
    // 핀으로 고른 출발지를 확정합니다.
    onPinnedDepartureSelect: (party: DepartureParty, pinnedLocation: ResolvedLocation) => void;
    // 저장 출발지를 현재 출발지로 선택합니다.
    onSavedDepartureSelect: (party: DepartureParty, departureId: string) => Promise<boolean>;
    // 저장 출발지 하나를 삭제합니다.
    onDeleteSavedDeparture: (party: DepartureParty, departureId: string) => Promise<boolean>;
    // 현재 파티의 저장 출발지를 전체 삭제합니다.
    onDeleteAllSavedDepartures: (party: DepartureParty) => Promise<boolean>;
    // 저장 출발지 제목과 위치를 수정합니다.
    onUpdateSavedDeparture: (party: DepartureParty, departureId: string, title: string, resolvedLocation: ResolvedLocation) => Promise<boolean>;
    // 저장 출발지 친구 선택을 바꿉니다.
    onDepartureFriendChange: (nextFriendId: string) => void;
    // 핀 선택 레이어 상태를 갱신합니다.
    setPinPickerLayerState: Dispatch<SetStateAction<PinPickerLayerState | null>>;
    // 삭제 확인 상태를 갱신합니다.
    setDeleteConfirmationState: Dispatch<SetStateAction<DeleteConfirmationState | null>>;
    // 파티별 저장 출발지 노출 개수를 갱신합니다.
    setSavedDepartureVisibleCounts: Dispatch<SetStateAction<Record<DepartureParty, number>>>;
    // 파티별 저장 출발지 검색어를 갱신합니다.
    setSavedDepartureFilterQueries: Dispatch<SetStateAction<Record<DepartureParty, string>>>;
};

function getDepartureToastOwnerLabel(
    party: DepartureParty,
    fallbackFriendName: string,
    departure?: SavedDeparture,
) {
    return party === "me" ? "내" : `${departure?.friendNickname ?? fallbackFriendName} 님`;
}

function getSavedDepartureGroupOwnerLabel(ownerLabel: string) {
    return ownerLabel === "친구 전체" ? "친구" : ownerLabel;
}

export function buildDepartureSelectionToastMessage(
    party: DepartureParty,
    selectionLabel: string,
    selectionType: "saved" | "pin" | "search",
    fallbackFriendName: string,
    departure?: SavedDeparture,
) {
    const ownerLabel = getDepartureToastOwnerLabel(party, fallbackFriendName, departure);

    if (selectionType === "saved") {
        return `"${selectionLabel}"을 ${ownerLabel} 출발 위치로 선택했어요.`;
    }

    if (selectionType === "pin") {
        return `${ownerLabel} 출발 위치를 핀으로 선택했어요.`;
    }

    return `${ownerLabel} 출발 위치를 주소로 선택했어요.`;
}

function buildSavedDepartureSelectionToastMessage(
    party: DepartureParty,
    departure: SavedDeparture,
    fallbackFriendName: string,
) {
    return buildDepartureSelectionToastMessage(party, departure.label, "saved", fallbackFriendName, departure);
}

function buildSavedDepartureUpdateToastMessage(nextTitle: string) {
    return `"${nextTitle.trim()}" 저장 위치를 수정했어요.`;
}

function buildSavedDepartureDeleteToastMessage(departureLabel: string) {
    return `"${departureLabel}" 저장 위치를 삭제했어요.`;
}

function buildSavedDepartureDeleteAllToastMessage(ownerLabel: string) {
    return `${getSavedDepartureGroupOwnerLabel(ownerLabel)} 저장 위치를 모두 삭제했어요.`;
}

export function useChatDepartureSettingsActions({
    pinPickerLayerState,
    deleteConfirmationState,
    selectedFriendName,
    onShowToast,
    onPinnedDepartureSelect,
    onSavedDepartureSelect,
    onDeleteSavedDeparture,
    onDeleteAllSavedDepartures,
    onUpdateSavedDeparture,
    onDepartureFriendChange,
    setPinPickerLayerState,
    setDeleteConfirmationState,
    setSavedDepartureVisibleCounts,
    setSavedDepartureFilterQueries,
}: UseChatDepartureSettingsActionsArgs) {
    function handleConfirmPinnedAddress(location: ResolvedLocation, nextTitle?: string) {
        if (!pinPickerLayerState) {
            return;
        }

        if (pinPickerLayerState.kind === "departure") {
            onPinnedDepartureSelect(pinPickerLayerState.party, location);
            onShowToast(
                buildDepartureSelectionToastMessage(
                    pinPickerLayerState.party,
                    location.address,
                    "pin",
                    selectedFriendName,
                ),
            );
            setPinPickerLayerState(null);
            return;
        }

        void onUpdateSavedDeparture(
            pinPickerLayerState.party,
            pinPickerLayerState.departure.id,
            nextTitle ?? pinPickerLayerState.departure.label,
            location,
        ).then((didUpdate) => {
            if (didUpdate) {
                onShowToast(buildSavedDepartureUpdateToastMessage(nextTitle ?? pinPickerLayerState.departure.label));
                setPinPickerLayerState(null);
            }
        });
    }

    async function handleConfirmDelete() {
        if (!deleteConfirmationState) {
            return;
        }

        if (deleteConfirmationState.kind === "single") {
            const didDelete = await onDeleteSavedDeparture(deleteConfirmationState.party, deleteConfirmationState.departureId);

            if (didDelete) {
                onShowToast(buildSavedDepartureDeleteToastMessage(deleteConfirmationState.departureLabel));
            }
        } else {
            const didDeleteAll = await onDeleteAllSavedDepartures(deleteConfirmationState.party);

            if (didDeleteAll) {
                onShowToast(buildSavedDepartureDeleteAllToastMessage(deleteConfirmationState.ownerLabel));
            }
        }

        setDeleteConfirmationState(null);
    }

    function handleShowMoreSavedDepartures(party: DepartureParty) {
        setSavedDepartureVisibleCounts((currentCounts) => ({
            ...currentCounts,
            [party]: currentCounts[party] + SAVED_DEPARTURE_PAGE_SIZE,
        }));
    }

    function handleSavedDepartureFilterQueryChange(party: DepartureParty, nextQuery: string) {
        setSavedDepartureFilterQueries((currentQueries) => ({
            ...currentQueries,
            [party]: nextQuery,
        }));
        setSavedDepartureVisibleCounts((currentCounts) => ({
            ...currentCounts,
            [party]: SAVED_DEPARTURE_PAGE_SIZE,
        }));
    }

    function handleDepartureFriendSelect(nextFriendId: string) {
        onDepartureFriendChange(nextFriendId);
        setSavedDepartureFilterQueries((currentQueries) => ({
            ...currentQueries,
            friend: "",
        }));
        setSavedDepartureVisibleCounts((currentCounts) => ({
            ...currentCounts,
            friend: SAVED_DEPARTURE_PAGE_SIZE,
        }));
    }

    function handleSavedDepartureSelectionClick(party: DepartureParty, departure: SavedDeparture) {
        void onSavedDepartureSelect(party, departure.id).then((didSelect) => {
            if (!didSelect) {
                return;
            }

            onShowToast(buildSavedDepartureSelectionToastMessage(party, departure, selectedFriendName));
        });
    }

    return {
        handleConfirmPinnedAddress,
        handleConfirmDelete,
        handleShowMoreSavedDepartures,
        handleSavedDepartureFilterQueryChange,
        handleDepartureFriendSelect,
        handleSavedDepartureSelectionClick,
    };
}