import { resolveAddressCoordinates } from "@/lib/kakao/geocoder";

import { buildDepartureSelectionErrorMessage } from "./chat-recommendation-feedback";
import type {
    DepartureInputMethod,
    DepartureParty,
    ResolvedLocation,
    SavedDeparture,
} from "../types";

type DepartureLabels = Record<DepartureParty, string>; // 참여자별 주소 라벨 문자열을 보관합니다.
type SelectedSavedDepartures = Record<DepartureParty, SavedDeparture | null>; // 저장 위치 모드에서 현재 선택된 저장 위치 객체입니다.

type ResolveDepartureLocationArgs = {
    party: DepartureParty; // 내 출발지인지 친구 출발지인지 나타냅니다.
    departureInputMethod: DepartureInputMethod; // 검색/핀/저장 위치 중 어떤 입력 방식을 쓰는지 나타냅니다.
    selectedSavedDepartures: SelectedSavedDepartures; // 저장 위치 입력 방식에서 사용할 선택 결과입니다.
    pinnedDepartureLabels: DepartureLabels; // 핀으로 지정한 출발 위치 라벨입니다.
    pinnedDepartureLocations?: Record<DepartureParty, ResolvedLocation | null>; // 핀 선택 시 이미 확보한 좌표를 재사용합니다.
    departureSearchQueries: DepartureLabels; // 검색창에 입력한 원본 주소 문자열입니다.
    friendName: string; // 오류 문구에서 친구를 자연스럽게 지칭할 때 사용합니다.
};

type BuildSavedDepartureArgs = {
    party: DepartureParty; // 저장 위치를 만드는 주체가 나인지 친구인지 나타냅니다.
    title: string; // 저장 위치 이름으로 사용할 제목입니다.
    previewValue: string; // 저장할 실제 주소 또는 미리보기 값입니다.
    sourceLabel: string; // 검색/핀 등 어떤 경로로 저장했는지 설명하는 라벨입니다.
};

type BuildSavedDepartureResult =
    | {
        ok: false;
        errorMessage: string; // 저장 위치 생성에 실패했을 때 사용자에게 보여 줄 오류 문구입니다.
    }
    | {
        ok: true;
        nextDepartureId: string; // 새로 만든 저장 위치 id입니다.
        nextSavedDeparture: SavedDeparture; // 목록에 추가할 저장 위치 객체입니다.
        normalizedTitle: string; // 공백 제거 후 실제 저장에 사용한 제목입니다.
    };

// 주소 문자열을 geocoder로 좌표화한 뒤 recommendation 모듈 공통 위치 형태로 변환합니다.
async function resolveAddressLocation(address: string): Promise<ResolvedLocation> {
    const resolvedAddress = await resolveAddressCoordinates([address]);

    return {
        ...resolvedAddress,
        label: resolvedAddress.address,
    };
}

// 입력 방식에 따라 실제 추천 계산에 사용할 출발 좌표를 해석합니다.
export async function resolveDepartureLocation({
    party,
    departureInputMethod,
    selectedSavedDepartures,
    pinnedDepartureLabels,
    pinnedDepartureLocations,
    departureSearchQueries,
    friendName,
}: ResolveDepartureLocationArgs): Promise<ResolvedLocation> {
    if (departureInputMethod === "saved") {
        const selectedSavedDeparture = selectedSavedDepartures[party];

        if (!selectedSavedDeparture) {
            throw new Error(buildDepartureSelectionErrorMessage(party, friendName, "saved"));
        }

        return {
            label: selectedSavedDeparture.label,
            address: selectedSavedDeparture.address,
            latitude: selectedSavedDeparture.latitude,
            longitude: selectedSavedDeparture.longitude,
        };
    }

    if (departureInputMethod === "pin") {
        const pinnedLocation = pinnedDepartureLocations?.[party];

        if (pinnedLocation) {
            return pinnedLocation;
        }

        const pinnedAddress = pinnedDepartureLabels[party].trim();

        if (!pinnedAddress) {
            throw new Error(buildDepartureSelectionErrorMessage(party, friendName, "pin"));
        }

        return resolveAddressLocation(pinnedAddress);
    }

    const searchedAddress = departureSearchQueries[party].trim();

    if (!searchedAddress) {
        throw new Error(buildDepartureSelectionErrorMessage(party, friendName, "search"));
    }

    return resolveAddressLocation(searchedAddress);
}

// 현재 입력값을 SavedDeparture 구조로 만들고 저장 가능 여부를 함께 반환합니다.
export function buildSavedDeparture({
    party,
    title,
    previewValue,
    sourceLabel,
}: BuildSavedDepartureArgs): BuildSavedDepartureResult {
    const normalizedTitle = title.trim();
    const normalizedPreviewValue = previewValue.trim();

    if (!normalizedTitle) {
        return {
            ok: false,
            errorMessage: "저장할 제목을 입력해 주세요.",
        };
    }

    if (!normalizedPreviewValue) {
        return {
            ok: false,
            errorMessage: "저장할 위치 정보가 없어요.",
        };
    }

    const nextDepartureId = `saved-${party}-${Date.now()}`;

    return {
        ok: true,
        nextDepartureId,
        nextSavedDeparture: {
            id: nextDepartureId,
            label: normalizedTitle,
            address: normalizedPreviewValue,
            description: `${sourceLabel} · ${normalizedPreviewValue}`,
            lastUsedAt: new Date().toISOString(),
            ownerParty: party,
            friendId: null,
            friendNickname: null,
            locationKind: "preset",
            latitude: 0,
            longitude: 0,
        },
        normalizedTitle,
    };
}