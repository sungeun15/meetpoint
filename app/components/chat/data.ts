import type { FriendItem } from "../friends/types";
import type { ChatMessage, RecommendationCard } from "./types";

export const initialChatMessages: ChatMessage[] = [
    {
        id: "young-geol-1",
        friendId: "young-geol",
        sender: "friend",
        text: "지금 어디야?",
        time: "오전 10:12",
    },
    {
        id: "young-geol-2",
        friendId: "young-geol",
        sender: "me",
        text: "지금 학교에 있어",
        time: "오전 10:14",
    },
    {
        id: "young-geol-3",
        friendId: "young-geol",
        sender: "friend",
        text: "난 강남역 근처야",
        time: "오전 10:17",
    },
    {
        id: "young-geol-4",
        friendId: "young-geol",
        sender: "me",
        text: "그럼 우리 중간쯤에서 만나자",
        time: "오전 10:18",
    },
    {
        id: "young-geol-5",
        friendId: "young-geol",
        sender: "friend",
        text: "좋아 지도에서 중간 지점 확인해보자",
        time: "오전 10:20",
    },
    {
        id: "young-jun-1",
        friendId: "young-jun",
        sender: "friend",
        text: "오늘 저녁에 시간 괜찮아?",
        time: "오후 01:08",
    },
    {
        id: "young-jun-2",
        friendId: "young-jun",
        sender: "me",
        text: "좋아. 위치 공유하면 중간 지점부터 보자.",
        time: "오후 01:10",
    },
    {
        id: "ji-min-1",
        friendId: "ji-min",
        sender: "friend",
        text: "곧 출발할게. 카페 쪽으로 갈 수 있어.",
        time: "오후 03:25",
    },
    {
        id: "min-seo-1",
        friendId: "min-seo",
        sender: "friend",
        text: "카페 앞에 도착했어. 지도에서 위치 볼래?",
        time: "오후 05:42",
    },
];

export function buildRecommendationCards(friend: FriendItem | null): RecommendationCard[] {
    const nickname = friend?.nickname ?? "친구";

    return [
        {
            id: `${nickname}-rec-1`,
            rank: 1,
            name: "강남 중앙 카페",
            category: "카페",
            myDistance: "0.8km",
            friendDistance: "0.9km",
            summary: `${nickname} 님과 내 이동 거리가 가장 균형적인 장소예요.`,
        },
        {
            id: `${nickname}-rec-2`,
            rank: 2,
            name: "중앙역 브런치랩",
            category: "브런치",
            myDistance: "1.1km",
            friendDistance: "1.0km",
            summary: `대화 이어가기 좋은 조용한 실내 공간으로 추천해요.`,
        },
        {
            id: `${nickname}-rec-3`,
            rank: 3,
            name: "미드포인트 스퀘어",
            category: "복합공간",
            myDistance: "1.3km",
            friendDistance: "1.2km",
            summary: `지도 기준 중심점과 가까워 약속 잡기에 무난해요.`,
        },
    ];
}