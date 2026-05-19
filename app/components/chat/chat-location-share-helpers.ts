import type { LocationShareScope } from "@/lib/contracts/friends";

import { formatLocationPreview } from "./data";
import type { ResolvedLocation } from "./types";

type LocationShareCopy = {
    checkingMessage: string;
    successLabel: string;
    manualShareMessage: string;
};

export function getLocationShareCopy(scope: LocationShareScope): LocationShareCopy {
    if (scope === "friend") {
        return {
            checkingMessage: "현재 친구에게 공유할 위치를 확인하고 있어요.",
            successLabel: "현재 친구에게 위치를",
            manualShareMessage: "직접 지정한 위치를 현재 친구에게 공유하고 있어요.",
        };
    }

    return {
        checkingMessage: "전체 친구에게 공유할 위치를 확인하고 있어요.",
        successLabel: "전체 친구에게 위치를",
        manualShareMessage: "직접 지정한 위치를 전체 친구에게 공유하고 있어요.",
    };
}

export function getMissingLocationShareTargetMessage(scope: LocationShareScope, activeFriendId: string | null) {
    if (scope === "friend" && !activeFriendId) {
        return "위치를 공유할 친구를 먼저 선택해 주세요.";
    }

    return null;
}

export function buildBrowserSharedLocation(latitude: number, longitude: number): ResolvedLocation {
    return {
        label: "내 현재 위치",
        address: `브라우저 현재 위치 · ${formatLocationPreview({ latitude, longitude })}`,
        latitude,
        longitude,
    };
}

export function buildStoredSharedLocation(latitude: number, longitude: number): ResolvedLocation {
    return {
        label: "내 현재 위치",
        address: `공유한 위치 · ${formatLocationPreview({ latitude, longitude })}`,
        latitude,
        longitude,
    };
}

export function buildManualSharedLocation(location: ResolvedLocation): ResolvedLocation {
    return {
        label: "내 지정 위치",
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
    };
}

export function getLocationShareGeolocationErrorMessage(errorCode: number) {
    return errorCode === 1
        ? "위치 권한이 없어 현재 위치를 공유하지 못했어요. 지도에서 직접 위치를 지정해 주세요."
        : "정확한 위치를 읽지 못했어요. 지도에서 직접 위치를 지정하거나 잠시 후 다시 시도해 주세요.";
}