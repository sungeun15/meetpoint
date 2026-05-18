import type { FriendItem } from "../friends/types";
import type { ChatMessage, ResolvedLocation } from "./types";

export type SharedLocationState = ResolvedLocation & {
    sharedAt: string;
};

const demoSharedLocationFallbacks: Record<string, ResolvedLocation> = {
    "young-geol": {
        label: "내 현재 위치",
        address: "서울 광진구 군자동 세종대학교 정문",
        latitude: 37.55195,
        longitude: 127.07351,
    },
    "young-jun": {
        label: "내 현재 위치",
        address: "서울 강남구 선릉로 514 선릉역 4번 출구",
        latitude: 37.50454,
        longitude: 127.04894,
    },
    "ji-min": {
        label: "내 현재 위치",
        address: "서울 성동구 살곶이길 200 서울숲역 인근",
        latitude: 37.54452,
        longitude: 127.04484,
    },
    "min-seo": {
        label: "내 현재 위치",
        address: "서울 성동구 왕십리로 83 한양대학교 서울캠퍼스",
        latitude: 37.55747,
        longitude: 127.0454,
    },
};

export function formatCurrentTime() {
    return new Intl.DateTimeFormat("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).format(new Date());
}

export function buildOutgoingChatMessage(friendId: string, text: string): ChatMessage {
    const createdAt = new Date().toISOString();

    return {
        id: `${friendId}-${Date.now()}`,
        friendId,
        sender: "me",
        text,
        time: formatCurrentTime(),
        readAt: null,
        createdAt,
    };
}

export function resolveDemoSharedLocationFallback(friendId: string): ResolvedLocation {
    return demoSharedLocationFallbacks[friendId] ?? {
        label: "내 현재 위치",
        address: "서울 중구 세종대로 110 서울시청",
        latitude: 37.5663,
        longitude: 126.97795,
    };
}

export function buildMyLocationStatus(mySharedLocation: SharedLocationState | null) {
    return mySharedLocation
        ? `${mySharedLocation.address} 기준으로 ${mySharedLocation.sharedAt}에 위치를 공유했어요.`
        : "아직 내 위치를 공유하지 않았어요. 위치 공유 후 중심점과 추천 지도를 계산할 수 있어요.";
}

export function buildFriendLocationStatus(selectedFriend: FriendItem | null) {
    if (!selectedFriend) {
        return "친구 위치 정보가 없어요.";
    }

    if (selectedFriend.locationSnapshot) {
        return `${selectedFriend.nickname} 님은 ${selectedFriend.locationSnapshot.address} 부근에 있어요.`;
    }

    return `${selectedFriend.nickname} 님의 위치 스냅샷은 아직 없어요.`;
}