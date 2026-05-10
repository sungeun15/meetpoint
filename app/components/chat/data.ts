import type { FriendItem } from "../friends/types";
import type { ChatMessage, MeetingMode, RecommendationCard, RecommendationCategory, RecommendationSummary } from "./types";

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

const categoryLabelMap: Record<RecommendationCategory, string> = {
    cafe: "카페",
    meal: "식사",
    fun: "놀거리",
};

const recommendationTemplates: Record<RecommendationCategory, Array<Omit<RecommendationCard, "id" | "rank" | "summary"> & { summaryTemplate: string }>> = {
    cafe: [
        {
            name: "강남 중앙 카페",
            category: "카페",
            myDistance: "0.8km",
            friendDistance: "0.9km",
            summaryTemplate: "{nickname} 님과 내 이동 거리가 가장 균형적인 카페예요.",
        },
        {
            name: "중앙역 브런치랩",
            category: "브런치",
            myDistance: "1.1km",
            friendDistance: "1.0km",
            summaryTemplate: "대화를 이어가기 좋은 조용한 실내 공간이라 카페 모임에 잘 맞아요.",
        },
        {
            name: "미드포인트 로스터리",
            category: "카페",
            myDistance: "1.3km",
            friendDistance: "1.2km",
            summaryTemplate: "중심점과 가까워 빠르게 합류하기 좋은 후보예요.",
        },
    ],
    meal: [
        {
            name: "하프웨이 키친",
            category: "식사",
            myDistance: "0.9km",
            friendDistance: "1.0km",
            summaryTemplate: "식사 약속 기준으로 이동 부담과 접근성을 함께 고려한 1순위예요.",
        },
        {
            name: "밸런스 다이닝",
            category: "식사",
            myDistance: "1.2km",
            friendDistance: "1.1km",
            summaryTemplate: "{nickname} 님과 내가 비슷한 시간 안에 도착하기 좋은 위치예요.",
        },
        {
            name: "센터포인트 푸드홀",
            category: "복합식당",
            myDistance: "1.4km",
            friendDistance: "1.3km",
            summaryTemplate: "메뉴 선택 폭이 넓어 식사 목적 모임에 무난하게 맞출 수 있어요.",
        },
    ],
    fun: [
        {
            name: "플레이스테이션 라운지",
            category: "놀거리",
            myDistance: "0.7km",
            friendDistance: "0.9km",
            summaryTemplate: "이동 거리와 체류 재미를 함께 고려했을 때 가장 안정적인 후보예요.",
        },
        {
            name: "리버사이드 아케이드",
            category: "놀거리",
            myDistance: "1.0km",
            friendDistance: "1.1km",
            summaryTemplate: "{nickname} 님과 만나서 바로 활동을 시작하기 좋은 장소예요.",
        },
        {
            name: "미드타운 보드게임홀",
            category: "실내놀거리",
            myDistance: "1.3km",
            friendDistance: "1.2km",
            summaryTemplate: "비 오는 날에도 무리 없이 이동할 수 있는 실내 후보예요.",
        },
    ],
};

export function buildRecommendationCards(friend: FriendItem | null, category: RecommendationCategory): RecommendationCard[] {
    const nickname = friend?.nickname ?? "친구";

    return recommendationTemplates[category].map((template, index) => ({
        id: `${nickname}-${category}-rec-${index + 1}`,
        rank: index + 1,
        name: template.name,
        category: template.category,
        myDistance: template.myDistance,
        friendDistance: template.friendDistance,
        summary: template.summaryTemplate.replace("{nickname}", nickname),
    }));
}

export function buildRecommendationSummary(
    friend: FriendItem | null,
    mode: MeetingMode,
    category: RecommendationCategory,
    departureLabels: { me: string | null; friend: string | null } | null,
): RecommendationSummary {
    const nickname = friend?.nickname ?? "친구";

    return {
        modeLabel: mode === "now" ? "지금 만나기" : "나중에 만나기",
        categoryLabel: categoryLabelMap[category],
        departureLabel: mode === "now"
            ? "현재 공유 위치 기준"
            : `나: ${departureLabels?.me ?? "선택 필요"} · ${nickname}: ${departureLabels?.friend ?? "선택 필요"}`,
        midpointLabel: `${nickname} 님과 내 이동 부담을 함께 반영한 중심 지점 기준`,
        scoringLabel: "평균 이동거리, 거리 편차, 카테고리 적합도, 지역 활성도를 함께 고려",
    };
}