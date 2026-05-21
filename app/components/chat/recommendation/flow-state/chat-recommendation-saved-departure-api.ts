import type { DepartureParty, SavedDeparture } from "../../types";

export type SavedDepartureApiItem = {
    id: string; // 저장 출발지 row id 입니다.
    label: string; // 목록에서 보여줄 저장 출발지 이름입니다.
    address: string; // 저장 당시 확정된 주소 문자열입니다.
    lat: number; // 저장 출발지 위도입니다.
    lng: number; // 저장 출발지 경도입니다.
    ownerParty: DepartureParty; // 이 출발지가 내 것인지 친구 것인지 나타냅니다.
    friendId: string | null; // 친구 소유 출발지일 때 연결된 친구 id 입니다.
    friendNickname: string | null; // 목록 표시용 친구 닉네임입니다.
    locationKind: "recent" | "preset"; // 최근 선택인지 고정 저장인지 구분합니다.
    isSelected: boolean; // 현재 그룹에서 선택된 저장 위치인지 나타냅니다.
    lastUsedAt: string; // 마지막 사용 시각입니다.
    createdAt: string; // 생성 시각입니다.
    updatedAt: string; // 마지막 수정 시각입니다.
};

export type SavedDepartureListResponse = {
    departures: SavedDepartureApiItem[]; // 목록 조회 응답입니다.
};

export type SavedDepartureCreateResponse = {
    departure: SavedDepartureApiItem; // 생성 직후 반환되는 단건입니다.
};

export type SavedDepartureUpdateResponse = {
    departure: SavedDepartureApiItem; // 수정 후 최신 값입니다.
};

export type SavedDepartureUseResponse = {
    departure: SavedDepartureApiItem; // 사용 시각 갱신 후 반환되는 단건입니다.
};

export type SavedDepartureDeleteResponse = {
    deletedIds: string[]; // 삭제 완료된 id 목록입니다.
};

function formatSavedDepartureTimeLabel(isoDateTime: string) {
    const date = new Date(isoDateTime);

    if (Number.isNaN(date.getTime())) {
        return "시간 정보 없음";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours24 = date.getHours();
    const meridiem = hours24 >= 12 ? "오후" : "오전";
    const hours12 = hours24 % 12 || 12;
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}.${month}.${day} ${meridiem} ${hours12}.${minutes}`;
}

export function mapSavedDepartureApiItem(item: SavedDepartureApiItem): SavedDeparture {
    // API 필드명(lat/lng)을 화면 모델(latitude/longitude)과 description 형식으로 정규화합니다.
    return {
        id: item.id,
        label: item.label,
        address: item.address,
        description: formatSavedDepartureTimeLabel(item.lastUsedAt),
        lastUsedAt: item.lastUsedAt,
        ownerParty: item.ownerParty,
        friendId: item.friendId,
        friendNickname: item.friendNickname,
        locationKind: item.locationKind,
        isSelected: item.isSelected,
        latitude: item.lat,
        longitude: item.lng,
    };
}