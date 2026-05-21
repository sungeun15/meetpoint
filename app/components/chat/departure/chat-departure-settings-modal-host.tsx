import type { RefObject } from "react";

import { ChatPinPickerLayer } from "./chat-pin-picker-layer";
import {
    DeleteConfirmationModal,
    PostcodeSearchModal,
    SavedDepartureMapModal,
} from "./chat-departure-settings-modals";
import type {
    DeleteConfirmationState,
    PinPickerLayerState,
    PostcodeLayerState,
    SavedDepartureMapLayerState,
} from "./use-chat-departure-settings-overlays";
import type { DepartureParty, ResolvedLocation } from "../types";

type ChatDepartureSettingsModalHostProps = {
    // 주소 검색 레이어 상태입니다.
    postcodeLayerState: PostcodeLayerState | null;
    // 지도 핀 선택 레이어 상태입니다.
    pinPickerLayerState: PinPickerLayerState | null;
    // 삭제 확인 모달 상태입니다.
    deleteConfirmationState: DeleteConfirmationState | null;
    // 저장 출발지 지도 미리보기 레이어 상태입니다.
    savedDepartureMapLayerState: SavedDepartureMapLayerState | null;
    // 지도 미리보기 레이어에서 보여줄 오류 메시지입니다.
    savedDepartureMapErrorMessage: string | null;
    // 파티별 화면 표시 라벨입니다.
    departurePartyLabels: Record<DepartureParty, string>;
    // 현재 선택된 저장 출발지의 해석된 주소입니다.
    savedDepartureResolvedAddress: string | null;
    // 저장 출발지 지도 모달에서 표시할 시각 라벨입니다.
    savedDepartureMapTimeLabel: string | null;
    // 다음 주소 검색을 붙일 컨테이너 ref입니다.
    postcodeContainerRef: RefObject<HTMLDivElement | null>;
    // 저장 출발지 맵을 붙일 컨테이너 ref입니다.
    savedDepartureMapContainerRef: RefObject<HTMLDivElement | null>;
    // 주소 검색 레이어를 닫습니다.
    onClosePostcodeLayer: () => void;
    // 핀 선택 레이어를 닫습니다.
    onClosePinPickerLayer: () => void;
    // 삭제 확인 모달을 닫습니다.
    onCloseDeleteConfirmation: () => void;
    // 저장 출발지 지도 레이어를 닫습니다.
    onCloseSavedDepartureMapLayer: () => void;
    // 핀으로 고른 위치를 확정합니다.
    onConfirmPinnedAddress: (location: ResolvedLocation, nextTitle?: string) => void;
    // 삭제 확인 동작을 실행합니다.
    onConfirmDelete: () => void | Promise<void>;
};

export function ChatDepartureSettingsModalHost({
    postcodeLayerState,
    pinPickerLayerState,
    deleteConfirmationState,
    savedDepartureMapLayerState,
    savedDepartureMapErrorMessage,
    departurePartyLabels,
    savedDepartureResolvedAddress,
    savedDepartureMapTimeLabel,
    postcodeContainerRef,
    savedDepartureMapContainerRef,
    onClosePostcodeLayer,
    onClosePinPickerLayer,
    onCloseDeleteConfirmation,
    onCloseSavedDepartureMapLayer,
    onConfirmPinnedAddress,
    onConfirmDelete,
}: ChatDepartureSettingsModalHostProps) {
    return (
        <>
            {postcodeLayerState ? (
                <PostcodeSearchModal
                    partyLabel={postcodeLayerState.partyLabel}
                    onClose={onClosePostcodeLayer}
                    containerRef={postcodeContainerRef}
                />
            ) : null}

            {pinPickerLayerState ? (
                <ChatPinPickerLayer
                    party={pinPickerLayerState.party}
                    partyLabel={departurePartyLabels[pinPickerLayerState.party]}
                    title={pinPickerLayerState.kind === "departure"
                        ? `${departurePartyLabels[pinPickerLayerState.party]} 출발 위치 핀 지정`
                        : `${departurePartyLabels[pinPickerLayerState.party]} 저장 위치 수정`}
                    description={pinPickerLayerState.kind === "departure"
                        ? "카카오맵에서 위치를 누르거나 주소를 검색해서 고를 수 있어요."
                        : "주소를 검색하거나 지도에서 핀을 다시 지정해 저장 위치를 수정할 수 있어요."}
                    confirmLabel={pinPickerLayerState.kind === "departure" ? "확인" : "수정하기"}
                    selectionPrompt={pinPickerLayerState.kind === "departure"
                        ? `이 위치를 ${departurePartyLabels[pinPickerLayerState.party]} 출발 위치로 지정할까요?`
                        : `이 위치로 ${pinPickerLayerState.departure.label} 저장 위치를 수정할까요?`}
                    emptySelectionMessage={pinPickerLayerState.kind === "departure"
                        ? "아직 고른 위치가 없어요. 지도에서 원하는 지점을 눌러 주세요."
                        : "현재 저장 위치를 불러오는 중이거나 아직 새 위치를 고르지 않았어요."}
                    editableTitle={pinPickerLayerState.kind === "saved-departure-edit"
                        ? {
                            initialValue: pinPickerLayerState.departure.label,
                            label: "저장 위치 제목",
                            placeholder: "예: 집, 회사, 학교 정문",
                        }
                        : undefined}
                    initialLocation={pinPickerLayerState.kind === "saved-departure-edit"
                        ? {
                            label: pinPickerLayerState.departure.label,
                            address: pinPickerLayerState.departure.label,
                            latitude: pinPickerLayerState.departure.latitude,
                            longitude: pinPickerLayerState.departure.longitude,
                        }
                        : null}
                    onClose={onClosePinPickerLayer}
                    onConfirm={onConfirmPinnedAddress}
                />
            ) : null}

            {deleteConfirmationState ? (
                <DeleteConfirmationModal
                    kind={deleteConfirmationState.kind}
                    departureLabel={deleteConfirmationState.kind === "single" ? deleteConfirmationState.departureLabel : undefined}
                    ownerLabel={deleteConfirmationState.kind === "all" ? deleteConfirmationState.ownerLabel : undefined}
                    onClose={onCloseDeleteConfirmation}
                    onConfirm={onConfirmDelete}
                />
            ) : null}

            {savedDepartureMapLayerState ? (
                <SavedDepartureMapModal
                    title={savedDepartureMapLayerState.title}
                    departure={savedDepartureMapLayerState.departure}
                    resolvedAddress={savedDepartureResolvedAddress ?? savedDepartureMapLayerState.departure.address}
                    timeLabel={savedDepartureMapTimeLabel ?? ""}
                    errorMessage={savedDepartureMapErrorMessage}
                    onClose={onCloseSavedDepartureMapLayer}
                    containerRef={savedDepartureMapContainerRef}
                />
            ) : null}
        </>
    );
}