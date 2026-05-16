export { MAX_RECOMMENDATION_COUNT } from "@/lib/constants/recommendation";

import type { LocationPoint, RecommendationCategory } from "../types";

// 카테고리 enum 값을 사용자 노출용 한글 라벨로 바꿉니다.
export const categoryLabelMap: Record<RecommendationCategory, string> = {
    cafe: "카페",
    meal: "식사",
    fun: "놀거리",
};

export type RecommendationTemplate = {
    id: string; // 템플릿 장소를 구분하는 고유 id입니다.
    name: string; // 장소명입니다.
    category: string; // 카드/마커에 노출할 세부 카테고리 라벨입니다.
    latitude: number; // 장소 위도입니다.
    longitude: number; // 장소 경도입니다.
    address: string; // 장소 주소 문자열입니다.
};

// 추천 전 기본 지도가 사용할 서울 중심 좌표입니다.
export const defaultMapCenter: LocationPoint = {
    latitude: 37.5665,
    longitude: 126.978,
};

// 카테고리별 추천 후보 템플릿 목록입니다.
export const recommendationTemplates: Record<RecommendationCategory, RecommendationTemplate[]> = {
    cafe: [
        {
            id: "cafe-1",
            name: "강남 중앙 카페",
            category: "카페",
            latitude: 37.50545,
            longitude: 127.02784,
            address: "서울 강남구 테헤란로 123",
        },
        {
            id: "cafe-2",
            name: "중앙역 브런치랩",
            category: "브런치",
            latitude: 37.50261,
            longitude: 127.03256,
            address: "서울 강남구 강남대로 438",
        },
        {
            id: "cafe-3",
            name: "미드포인트 로스터리",
            category: "카페",
            latitude: 37.50088,
            longitude: 127.03548,
            address: "서울 강남구 봉은사로 112",
        },
        {
            id: "cafe-4",
            name: "하프웨이 테라스",
            category: "카페",
            latitude: 37.50312,
            longitude: 127.03692,
            address: "서울 강남구 봉은사로4길 31",
        },
        {
            id: "cafe-5",
            name: "리듬 앤 빈",
            category: "스페셜티카페",
            latitude: 37.50678,
            longitude: 127.02944,
            address: "서울 강남구 역삼로 134",
        },
        {
            id: "cafe-6",
            name: "도심 코너 카페",
            category: "카페",
            latitude: 37.50428,
            longitude: 127.02564,
            address: "서울 강남구 테헤란로10길 18",
        },
        {
            id: "cafe-7",
            name: "포인트 라운지",
            category: "카페",
            latitude: 37.49986,
            longitude: 127.03124,
            address: "서울 강남구 강남대로102길 21",
        },
        {
            id: "cafe-8",
            name: "가든 브루 스튜디오",
            category: "브런치",
            latitude: 37.50714,
            longitude: 127.03426,
            address: "서울 강남구 봉은사로6길 29",
        },
        {
            id: "cafe-9",
            name: "어반 모카 하우스",
            category: "카페",
            latitude: 37.50146,
            longitude: 127.02482,
            address: "서울 강남구 테헤란로6길 33",
        },
        {
            id: "cafe-10",
            name: "레인보우 빈스",
            category: "스페셜티카페",
            latitude: 37.50802,
            longitude: 127.02712,
            address: "서울 강남구 역삼로7길 12",
        },
    ],
    meal: [
        {
            id: "meal-1",
            name: "하프웨이 키친",
            category: "식사",
            latitude: 37.50338,
            longitude: 127.03016,
            address: "서울 강남구 테헤란로4길 6",
        },
        {
            id: "meal-2",
            name: "밸런스 다이닝",
            category: "식사",
            latitude: 37.50097,
            longitude: 127.02658,
            address: "서울 강남구 강남대로94길 20",
        },
        {
            id: "meal-3",
            name: "센터포인트 푸드홀",
            category: "복합식당",
            latitude: 37.50642,
            longitude: 127.02499,
            address: "서울 강남구 역삼로 110",
        },
        {
            id: "meal-4",
            name: "도심 미들테이블",
            category: "식사",
            latitude: 37.50183,
            longitude: 127.03311,
            address: "서울 강남구 테헤란로8길 22",
        },
        {
            id: "meal-5",
            name: "라이트 하우스 다이너",
            category: "양식",
            latitude: 37.50592,
            longitude: 127.03132,
            address: "서울 강남구 논현로95길 14",
        },
        {
            id: "meal-6",
            name: "미들 스트리트 키친",
            category: "식사",
            latitude: 37.49958,
            longitude: 127.03244,
            address: "서울 강남구 강남대로98길 19",
        },
        {
            id: "meal-7",
            name: "테이블 포인트",
            category: "한식",
            latitude: 37.50446,
            longitude: 127.02756,
            address: "서울 강남구 테헤란로12길 9",
        },
        {
            id: "meal-8",
            name: "시티 라인 비스트로",
            category: "양식",
            latitude: 37.50728,
            longitude: 127.02908,
            address: "서울 강남구 논현로87길 24",
        },
        {
            id: "meal-9",
            name: "하프웨이 델리",
            category: "식사",
            latitude: 37.50112,
            longitude: 127.03582,
            address: "서울 강남구 봉은사로10길 17",
        },
        {
            id: "meal-10",
            name: "미드 가든 식탁",
            category: "복합식당",
            latitude: 37.50302,
            longitude: 127.02436,
            address: "서울 강남구 역삼로3길 27",
        },
    ],
    fun: [
        {
            id: "fun-1",
            name: "플레이스테이션 라운지",
            category: "놀거리",
            latitude: 37.50176,
            longitude: 127.03183,
            address: "서울 강남구 강남대로 470",
        },
        {
            id: "fun-2",
            name: "리버사이드 아케이드",
            category: "놀거리",
            latitude: 37.50473,
            longitude: 127.03468,
            address: "서울 강남구 봉은사로2길 31",
        },
        {
            id: "fun-3",
            name: "미드타운 보드게임홀",
            category: "실내놀거리",
            latitude: 37.49942,
            longitude: 127.02978,
            address: "서울 강남구 테헤란로1길 28",
        },
        {
            id: "fun-4",
            name: "센터라인 볼링홀",
            category: "실내놀거리",
            latitude: 37.50364,
            longitude: 127.02696,
            address: "서울 강남구 강남대로96길 7",
        },
        {
            id: "fun-5",
            name: "리듬 게임스테이지",
            category: "놀거리",
            latitude: 37.50688,
            longitude: 127.03274,
            address: "서울 강남구 테헤란로14길 11",
        },
        {
            id: "fun-6",
            name: "미드포인트 VR룸",
            category: "실내놀거리",
            latitude: 37.50034,
            longitude: 127.02494,
            address: "서울 강남구 강남대로110길 13",
        },
        {
            id: "fun-7",
            name: "센트럴 코인노래랩",
            category: "놀거리",
            latitude: 37.50418,
            longitude: 127.03022,
            address: "서울 강남구 테헤란로13길 15",
        },
        {
            id: "fun-8",
            name: "어반 스포츠존",
            category: "실내놀거리",
            latitude: 37.50762,
            longitude: 127.02674,
            address: "서울 강남구 역삼로9길 30",
        },
        {
            id: "fun-9",
            name: "하프웨이 보드카페",
            category: "놀거리",
            latitude: 37.49894,
            longitude: 127.03358,
            address: "서울 강남구 강남대로94길 35",
        },
        {
            id: "fun-10",
            name: "플레이 그라운드 스테이션",
            category: "놀거리",
            latitude: 37.50232,
            longitude: 127.03506,
            address: "서울 강남구 봉은사로8길 26",
        },
    ],
};