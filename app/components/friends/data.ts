import type { FriendItem } from "./types";

export const friendsGradientBackground =
    "linear-gradient(198.712deg, rgb(102, 117, 247) 0%, rgb(87, 0, 123) 100%)";

export const initialFriends: FriendItem[] = [
    {
        id: "young-geol",
        nickname: "영걸",
        status: "지금 학교에 있어",
        locationHint: "건국대학교 서울캠퍼스 정문 근처에서 위치를 공유했어요.",
        locationSnapshot: {
            address: "서울 광진구 능동로 120 건국대학교 서울캠퍼스",
            latitude: 37.54011,
            longitude: 127.07949,
            sharedAt: "오전 10:10",
        },
    },
    {
        id: "young-jun",
        nickname: "영준",
        status: "강남역 근처야",
        locationHint: "강남역 10번 출구 부근에서 만날 준비 중이에요.",
        locationSnapshot: {
            address: "서울 강남구 강남대로 396 강남역 10번 출구",
            latitude: 37.49812,
            longitude: 127.02831,
            sharedAt: "오후 01:05",
        },
    },
    {
        id: "ji-min",
        nickname: "지민",
        status: "곧 출발할게",
        locationHint: "왕십리역 6번 출구에서 출발해서 중간 지점을 찾고 있어요.",
        locationSnapshot: {
            address: "서울 성동구 왕십리광장로 17 왕십리역 6번 출구",
            latitude: 37.56106,
            longitude: 127.03679,
            sharedAt: "오후 03:24",
        },
    },
    {
        id: "min-seo",
        nickname: "민서",
        status: "카페 앞에 도착했어",
        locationHint: "성수 카페거리 입구에서 친구들을 기다리고 있어요.",
        locationSnapshot: {
            address: "서울 성동구 연무장길 28 성수 카페거리",
            latitude: 37.54467,
            longitude: 127.0557,
            sharedAt: "오후 05:42",
        },
    },
];

export function getFriendInitial(nickname: string) {
    return nickname.slice(0, 1);
}