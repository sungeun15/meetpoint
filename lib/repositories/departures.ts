import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/server";

type DepartureLocationRow = {
    id: string;
    label: string;
    address: string | null;
    lat: number;
    lng: number;
    owner_party: "me" | "friend";
    friend_id: string | null;
    friend_nickname: string | null;
    location_kind: "recent" | "preset";
    last_used_at: string;
    created_at: string;
    updated_at: string;
};

type LegacyDepartureLocationRow = {
    id: string;
    label: string;
    lat: number;
    lng: number;
    location_kind: "recent" | "preset";
    last_used_at: string;
    created_at: string;
    updated_at: string;
};

export type SavedDepartureLocation = {
    id: string;
    label: string;
    address: string;
    lat: number;
    lng: number;
    ownerParty: "me" | "friend";
    friendId: string | null;
    friendNickname: string | null;
    locationKind: "recent" | "preset";
    lastUsedAt: string;
    createdAt: string;
    updatedAt: string;
};

function normalizeDepartureAddress(address: string | null | undefined) {
    return typeof address === "string" ? address.trim() : "";
}

function mapDepartureLocationRow(row: DepartureLocationRow): SavedDepartureLocation {
    return {
        id: row.id,
        label: row.label,
        address: normalizeDepartureAddress(row.address),
        lat: row.lat,
        lng: row.lng,
        ownerParty: row.owner_party,
        friendId: row.friend_id,
        friendNickname: row.friend_nickname,
        locationKind: row.location_kind,
        lastUsedAt: row.last_used_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function mapLegacyDepartureLocationRow(
    row: LegacyDepartureLocationRow,
    owner: Pick<SavedDepartureLocation, "ownerParty" | "friendId" | "friendNickname"> = {
        ownerParty: "me",
        friendId: null,
        friendNickname: null,
    },
): SavedDepartureLocation {
    return {
        id: row.id,
        label: row.label,
        address: "",
        lat: row.lat,
        lng: row.lng,
        ownerParty: owner.ownerParty,
        friendId: owner.friendId,
        friendNickname: owner.friendNickname,
        locationKind: row.location_kind,
        lastUsedAt: row.last_used_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function hasOwnerMetadataColumnError(error: unknown) {
    const errorMessage = typeof error === "object" && error && "message" in error
        ? String((error as { message?: unknown }).message ?? "")
        : "";

    return errorMessage.includes("owner_party")
        || errorMessage.includes("friend_id")
        || errorMessage.includes("friend_nickname")
        || (errorMessage.includes("address") && errorMessage.includes("departure_locations"));
}

function sortDepartureRowsByLocationKind<T extends { location_kind: "recent" | "preset" }>(rows: T[]) {
    return [...rows].sort((left, right) => {
        if (left.location_kind === right.location_kind) {
            return 0;
        }

        return left.location_kind === "preset" ? -1 : 1;
    });
}

async function runWithOwnerMetadataFallback<LatestData, LegacyData, Result>(args: {
    latestQuery: () => Promise<{ data: LatestData | null; error: unknown }>;
    legacyQuery: () => Promise<{ data: LegacyData | null; error: unknown }>;
    mapLatest: (data: LatestData | null) => Result;
    mapLegacy: (data: LegacyData | null) => Result;
}) {
    const latestResult = await args.latestQuery();

    if (latestResult.error && !hasOwnerMetadataColumnError(latestResult.error)) {
        throw latestResult.error;
    }

    if (!latestResult.error) {
        return args.mapLatest(latestResult.data);
    }

    const legacyResult = await args.legacyQuery();

    if (legacyResult.error) {
        throw legacyResult.error;
    }

    return args.mapLegacy(legacyResult.data);
}

function requireDepartureRow<T>(row: T | null, errorMessage: string) {
    if (!row) {
        throw new Error(errorMessage);
    }

    return row;
}

// 저장된 출발 위치 목록은 preset 우선, 이후 lastUsedAt 역순 규칙에 맞춰 정렬한다.
export async function listSavedDepartureLocations(userId: string, limit: number) {
    return runWithOwnerMetadataFallback({
        latestQuery: async () => await getSupabaseAdminClient()
            .from("departure_locations")
            .select("id, label, address, lat, lng, owner_party, friend_id, friend_nickname, location_kind, last_used_at, created_at, updated_at")
            .eq("user_id", userId)
            .order("location_kind", { ascending: true })
            .order("last_used_at", { ascending: false })
            .order("created_at", { ascending: false })
            .limit(limit)
            .returns<DepartureLocationRow[]>(),
        legacyQuery: async () => await getSupabaseAdminClient()
            .from("departure_locations")
            .select("id, label, lat, lng, location_kind, last_used_at, created_at, updated_at")
            .eq("user_id", userId)
            .order("location_kind", { ascending: true })
            .order("last_used_at", { ascending: false })
            .order("created_at", { ascending: false })
            .limit(limit)
            .returns<LegacyDepartureLocationRow[]>(),
        mapLatest: (rows) => sortDepartureRowsByLocationKind(rows ?? []).map(mapDepartureLocationRow),
        mapLegacy: (rows) => sortDepartureRowsByLocationKind(rows ?? []).map((row) => mapLegacyDepartureLocationRow(row)),
    });
}

// 새 저장 위치는 생성 즉시 최근 사용 시각을 갖도록 DB 기본값을 그대로 사용한다.
export async function createDepartureLocation(input: {
    userId: string;
    label: string;
    address: string;
    lat: number;
    lng: number;
    ownerParty: "me" | "friend";
    friendId: string | null;
    friendNickname: string | null;
    locationKind: "recent" | "preset";
}) {
    return runWithOwnerMetadataFallback({
        latestQuery: async () => await getSupabaseAdminClient()
            .from("departure_locations")
            .insert({
                user_id: input.userId,
                label: input.label,
                address: input.address,
                lat: input.lat,
                lng: input.lng,
                owner_party: input.ownerParty,
                friend_id: input.friendId,
                friend_nickname: input.friendNickname,
                location_kind: input.locationKind,
            })
            .select("id, label, address, lat, lng, owner_party, friend_id, friend_nickname, location_kind, last_used_at, created_at, updated_at")
            .single<DepartureLocationRow>(),
        legacyQuery: async () => await getSupabaseAdminClient()
            .from("departure_locations")
            .insert({
                user_id: input.userId,
                label: input.label,
                lat: input.lat,
                lng: input.lng,
                location_kind: input.locationKind,
            })
            .select("id, label, lat, lng, location_kind, last_used_at, created_at, updated_at")
            .single<LegacyDepartureLocationRow>(),
        mapLatest: (row) => mapDepartureLocationRow(requireDepartureRow(row, "새 저장 위치를 생성했지만 결과를 확인하지 못했습니다.")),
        mapLegacy: (row) => mapLegacyDepartureLocationRow(
            requireDepartureRow(row, "새 저장 위치를 생성했지만 결과를 확인하지 못했습니다."),
            {
                ownerParty: input.ownerParty,
                friendId: input.friendId,
                friendNickname: input.friendNickname,
            },
        ),
    });
}

// 저장 위치 수정은 현재 사용자 소유 row 의 좌표와 최근 주소 라벨을 함께 갱신한다.
export async function updateDepartureLocation(input: {
    userId: string;
    departureLocationId: string;
    label: string;
    address: string;
    lat: number;
    lng: number;
    ownerParty?: "me" | "friend";
    friendId?: string | null;
    friendNickname?: string | null;
}) {
    const updatePayload: {
        label: string;
        address: string;
        lat: number;
        lng: number;
        owner_party?: "me" | "friend";
        friend_id?: string | null;
        friend_nickname?: string | null;
        updated_at: string;
    } = {
        label: input.label,
        address: input.address,
        lat: input.lat,
        lng: input.lng,
        updated_at: new Date().toISOString(),
    };

    if (input.ownerParty !== undefined) {
        updatePayload.owner_party = input.ownerParty;
        updatePayload.friend_id = input.friendId ?? null;
        updatePayload.friend_nickname = input.friendNickname ?? null;
    }

    const legacyUpdatePayload = {
        label: input.label,
        lat: input.lat,
        lng: input.lng,
        updated_at: updatePayload.updated_at,
    };

    return runWithOwnerMetadataFallback({
        latestQuery: async () => await getSupabaseAdminClient()
            .from("departure_locations")
            .update(updatePayload)
            .eq("user_id", input.userId)
            .eq("id", input.departureLocationId)
            .select("id, label, address, lat, lng, owner_party, friend_id, friend_nickname, location_kind, last_used_at, created_at, updated_at")
            .maybeSingle<DepartureLocationRow>(),
        legacyQuery: async () => await getSupabaseAdminClient()
            .from("departure_locations")
            .update(legacyUpdatePayload)
            .eq("user_id", input.userId)
            .eq("id", input.departureLocationId)
            .select("id, label, lat, lng, location_kind, last_used_at, created_at, updated_at")
            .maybeSingle<LegacyDepartureLocationRow>(),
        mapLatest: (row) => row ? mapDepartureLocationRow(row) : null,
        mapLegacy: (row) => row ? mapLegacyDepartureLocationRow(row, {
            ownerParty: input.ownerParty ?? "me",
            friendId: input.friendId ?? null,
            friendNickname: input.friendNickname ?? null,
        }) : null,
    });
}

// 최근 사용 갱신은 현재 사용자 소유 row 만 갱신하고 없으면 null 을 반환한다.
export async function touchDepartureLocationLastUsedAt(input: {
    userId: string;
    departureLocationId: string;
}) {
    const nextTimestamp = new Date().toISOString();
    const touchUpdatePayload = {
        last_used_at: nextTimestamp,
        updated_at: nextTimestamp,
    };

    return runWithOwnerMetadataFallback({
        latestQuery: async () => await getSupabaseAdminClient()
            .from("departure_locations")
            .update(touchUpdatePayload)
            .eq("user_id", input.userId)
            .eq("id", input.departureLocationId)
            .select("id, label, address, lat, lng, owner_party, friend_id, friend_nickname, location_kind, last_used_at, created_at, updated_at")
            .maybeSingle<DepartureLocationRow>(),
        legacyQuery: async () => await getSupabaseAdminClient()
            .from("departure_locations")
            .update(touchUpdatePayload)
            .eq("user_id", input.userId)
            .eq("id", input.departureLocationId)
            .select("id, label, lat, lng, location_kind, last_used_at, created_at, updated_at")
            .maybeSingle<LegacyDepartureLocationRow>(),
        mapLatest: (row) => row ? mapDepartureLocationRow(row) : null,
        mapLegacy: (row) => row ? mapLegacyDepartureLocationRow(row) : null,
    });
}

// 저장 위치 삭제는 현재 사용자 소유 row 만 대상으로 하며 삭제된 id 목록을 반환한다.
export async function deleteDepartureLocations(input: {
    userId: string;
    departureLocationIds: string[];
}) {
    const { data, error } = await getSupabaseAdminClient()
        .from("departure_locations")
        .delete()
        .eq("user_id", input.userId)
        .in("id", input.departureLocationIds)
        .select("id")
        .returns<Array<{ id: string }>>();

    if (error) {
        throw error;
    }

    return (data ?? []).map((row) => row.id);
}