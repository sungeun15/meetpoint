"use client";

import type { FriendItem } from "../friends/types";
import { useChatScreenLocationOverlays } from "./screen-overlays/use-chat-screen-location-overlays";
import { useChatScreenToastState } from "./screen-overlays/use-chat-screen-toast-state";
import type { DepartureParty, ResolvedLocation } from "./types";
import type { LocationShareScope } from "@/lib/contracts/friends";

type UseChatScreenOverlaysArgs = {
    selectedFriend: FriendItem | null;
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
}

export function useChatScreenOverlays({
    selectedFriend,
    onCreateSavedDeparture,
    onShareResolvedLocation,
}: UseChatScreenOverlaysArgs) {
    const {
        chatScreenToast,
        setChatScreenToast,
        handleShowToast,
    } = useChatScreenToastState();
    const {
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
    } = useChatScreenLocationOverlays({
        selectedFriend,
        onCreateSavedDeparture,
        onShareResolvedLocation,
        onShowToast: handleShowToast,
    });

    return {
        pendingLocationSave,
        pendingManualShare,
        activeLocationMap,
        chatScreenToast,
        setChatScreenToast,
        handleShowToast,
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