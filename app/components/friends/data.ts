import type { FriendItem } from "./types";

export const friendsGradientBackground =
    "linear-gradient(198.712deg, rgb(102, 117, 247) 0%, rgb(87, 0, 123) 100%)";

export const initialFriends: FriendItem[] = [
    {
        id: "young-geol",
        nickname: "영걸",
        status: "지금 학교에 있어",
        locationHint: "학교 근처에서 위치를 공유했어요.",
    },
    {
        id: "young-jun",
        nickname: "영준",
        status: "강남역 근처야",
        locationHint: "강남역 부근에서 만날 준비 중이에요.",
    },
    {
        id: "ji-min",
        nickname: "지민",
        status: "곧 출발할게",
        locationHint: "지금 출발해서 중간 지점을 찾고 있어요.",
    },
    {
        id: "min-seo",
        nickname: "민서",
        status: "카페 앞에 도착했어",
        locationHint: "카페 앞에서 친구들을 기다리고 있어요.",
    },
];

export function getFriendInitial(nickname: string) {
    return nickname.slice(0, 1);
}