import type { FriendSummary, PendingFriendRequestSummary } from "@/lib/contracts/friends";

import type { FriendItem, PendingFriendRequestItem } from "./types";

export function formatLocationUpdatedLabel(locationUpdatedAt: string | null) {
    if (!locationUpdatedAt) {
        return null;
    }

    const date = new Date(locationUpdatedAt);

    if (Number.isNaN(date.getTime())) {
        return "최근";
    }

    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(date);
}

export function mapFriendSummaryToItem(friend: FriendSummary): FriendItem {
    const updatedLabel = formatLocationUpdatedLabel(friend.locationUpdatedAt);
    const latitude = friend.lat;
    const longitude = friend.lng;
    const hasLocation = latitude !== null && longitude !== null;
    const locationStatusLabel = hasLocation
        ? (updatedLabel ? `최근 위치 공유: ${updatedLabel}` : "최근 위치 공유")
        : "아직 공유되지 않음";

    return {
        id: friend.id,
        nickname: friend.nickname,
        unreadCount: friend.unreadCount,
        lastMessagePreview: friend.lastMessagePreview,
        locationShareScope: friend.locationShareScope,
        locationStatusLabel,
        status: hasLocation
            ? (updatedLabel ? `${updatedLabel} 위치를 공유했어요` : "최근 위치를 공유했어요")
            : "아직 위치를 공유하지 않았어요",
        locationHint: hasLocation
            ? `현재 저장된 좌표는 ${latitude.toFixed(5)}, ${longitude.toFixed(5)} 입니다.`
            : "위치 공유를 시작하면 chat 화면에서 좌표와 상태를 확인할 수 있어요.",
        locationSnapshot: hasLocation
            ? {
                address: `좌표 ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
                latitude,
                longitude,
                sharedAt: updatedLabel,
            }
            : undefined,
    };
}

export function formatRequestTimeLabel(requestedAt: string) {
    const date = new Date(requestedAt);

    if (Number.isNaN(date.getTime())) {
        return "최근 보낸 요청";
    }

    return `${new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(date)} 요청`;
}

export function mapPendingFriendRequestToItem(
    request: PendingFriendRequestSummary,
    direction: PendingFriendRequestItem["direction"],
): PendingFriendRequestItem {
    // 요청 카드도 친구 카드와 같은 기본 표시 정보를 쓰고, 방향별 상태 문구만 덧붙인다.
    const baseFriend = mapFriendSummaryToItem(request);

    return {
        ...baseFriend,
        requestId: request.requestId,
        direction,
        requestedAtLabel: formatRequestTimeLabel(request.requestedAt),
        status: direction === "incoming" ? "상대가 친구 요청을 보냈어요." : "상대의 수락을 기다리는 중이에요.",
        locationStatusLabel: null,
        unreadCount: 0,
        lastMessagePreview: null,
    };
}
