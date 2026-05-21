import { useState } from "react";

import type { LocationShareScope } from "@/lib/contracts/friends";

import type { FriendItem } from "../../friends/types";
import type { DepartureParty, ResolvedLocation } from "../types";

export type PendingLocationSave = {
    party: DepartureParty; // 어느 참여자의 위치를 저장하는지 나타냅니다.
    previewValue: string; // 저장 전에 보여 줄 위치 미리보기 문자열입니다.
    sourceLabel: string; // 위치가 어디서 왔는지 표시하는 라벨입니다.
    title: string; // 저장 레이어 헤더에 표시할 제목입니다.
    resolvedLocation: ResolvedLocation | null; // 이미 좌표까지 확정된 위치면 함께 보관합니다.
    locationKind: "recent" | "preset"; // 최근값 저장인지 고정 preset 저장인지 구분합니다.
    targetFriendId: string | null; // 친구 위치 저장일 때 연결할 친구 id 입니다.
    targetFriendName: string | null; // 친구 위치 저장일 때 표시할 친구 이름입니다.
};

export type PendingManualShare = {
    scope: LocationShareScope; // 수동 공유가 누구에게 적용되는지 나타냅니다.
};

export type ActiveLocationMap = {
    title: string; // 지도 모달 제목입니다.
    description: string; // 지도 모달 설명 문구입니다.
    location: ResolvedLocation; // 지도에서 강조할 실제 위치입니다.
};

type UseChatScreenLocationOverlaysArgs = {
    selectedFriend: FriendItem | null; // 친구 저장 위치 제목/대상 계산에 사용할 현재 친구입니다.
    onCreateSavedDeparture: (
        party: DepartureParty,
        title: string,
        previewValue: string,
        sourceLabel: string,
        resolvedLocation?: ResolvedLocation | null,
        locationKind?: "recent" | "preset",
        targetFriendId?: string,
        targetFriendName?: string,
    ) => Promise<boolean>;
    onShareResolvedLocation: (scope: LocationShareScope, location: ResolvedLocation) => Promise<boolean>;
    onShowToast: (message: string) => void; // 저장 성공 토스트를 띄우기 위한 콜백입니다.
};

function buildSavedLocationToastMessage(pendingLocationSave: PendingLocationSave, nextTitle: string) {
    const ownerLabel = pendingLocationSave.party === "me"
        ? "내 위치"
        : `${pendingLocationSave.targetFriendName ?? "친구"} 님 위치`;

    return `${ownerLabel}를 "${nextTitle.trim()}"으로 저장했어요.`;
}

export function useChatScreenLocationOverlays({
    selectedFriend,
    onCreateSavedDeparture,
    onShareResolvedLocation,
    onShowToast,
}: UseChatScreenLocationOverlaysArgs) {
    const [pendingLocationSave, setPendingLocationSave] = useState<PendingLocationSave | null>(null);
    const [pendingManualShare, setPendingManualShare] = useState<PendingManualShare | null>(null);
    const [activeLocationMap, setActiveLocationMap] = useState<ActiveLocationMap | null>(null);

    function handleOpenSaveLocationLayer(
        party: DepartureParty,
        previewValue: string,
        sourceLabel: string,
        resolvedLocation?: ResolvedLocation,
        locationKind: "recent" | "preset" = "preset",
        targetFriendId?: string,
        targetFriendName?: string,
    ) {
        const effectiveTargetFriendId = party === "friend"
            ? (targetFriendId ?? selectedFriend?.id ?? null)
            : null;
        const effectiveTargetFriendName = party === "friend"
            ? (targetFriendName ?? selectedFriend?.nickname ?? null)
            : null;

        setPendingLocationSave({
            party,
            previewValue,
            sourceLabel,
            title: party === "me"
                ? "내 위치 저장"
                : `${effectiveTargetFriendName ?? "친구"} 위치 저장`,
            resolvedLocation: resolvedLocation ?? null,
            locationKind,
            targetFriendId: effectiveTargetFriendId,
            targetFriendName: effectiveTargetFriendName,
        });
    }

    function handleCloseSaveLocationLayer() {
        setPendingLocationSave(null);
    }

    function handleOpenManualShareLayer(scope: LocationShareScope) {
        setPendingLocationSave(null);
        setPendingManualShare({ scope });
    }

    function handleCloseManualShareLayer() {
        setPendingManualShare(null);
    }

    function handleOpenLocationMap(title: string, description: string, location: ResolvedLocation | null) {
        if (!location) {
            return;
        }

        setActiveLocationMap({ title, description, location });
    }

    function handleCloseLocationMap() {
        setActiveLocationMap(null);
    }

    async function handleConfirmSaveLocation(nextTitle: string) {
        if (!pendingLocationSave) {
            return;
        }

        const didSave = await onCreateSavedDeparture(
            pendingLocationSave.party,
            nextTitle,
            pendingLocationSave.previewValue,
            pendingLocationSave.sourceLabel,
            pendingLocationSave.resolvedLocation,
            pendingLocationSave.locationKind,
            pendingLocationSave.targetFriendId ?? undefined,
            pendingLocationSave.targetFriendName ?? undefined,
        );

        if (didSave) {
            onShowToast(buildSavedLocationToastMessage(pendingLocationSave, nextTitle));
            setPendingLocationSave(null);
        }
    }

    async function handleConfirmManualShare(location: ResolvedLocation) {
        if (!pendingManualShare) {
            return;
        }

        const didShare = await onShareResolvedLocation(pendingManualShare.scope, location);

        if (didShare) {
            setPendingManualShare(null);
        }
    }

    return {
        pendingLocationSave,
        pendingManualShare,
        activeLocationMap,
        handleOpenSaveLocationLayer,
        handleCloseSaveLocationLayer,
        handleOpenManualShareLayer,
        handleCloseManualShareLayer,
        handleOpenLocationMap,
        handleCloseLocationMap,
        handleConfirmSaveLocation,
        handleConfirmManualShare,
    };
}