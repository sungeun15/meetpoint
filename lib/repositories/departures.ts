import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/server";

type DepartureLocationRow = {
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
    lat: number;
    lng: number;
    locationKind: "recent" | "preset";
    lastUsedAt: string;
    createdAt: string;
    updatedAt: string;
};

function mapDepartureLocationRow(row: DepartureLocationRow): SavedDepartureLocation {
    return {
        id: row.id,
        label: row.label,
        lat: row.lat,
        lng: row.lng,
        locationKind: row.location_kind,
        lastUsedAt: row.last_used_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

// 저장된 출발 위치 목록은 preset 우선, 이후 lastUsedAt 역순 규칙에 맞춰 정렬한다.
export async function listSavedDepartureLocations(userId: string, limit: number) {
    const { data, error } = await getSupabaseAdminClient()
        .from("departure_locations")
        .select("id, label, lat, lng, location_kind, last_used_at, created_at, updated_at")
        .eq("user_id", userId)
        .order("location_kind", { ascending: true })
        .order("last_used_at", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit)
        .returns<DepartureLocationRow[]>();

    if (error) {
        throw error;
    }

    return data
        .sort((left, right) => {
            if (left.location_kind === right.location_kind) {
                return 0;
            }

            return left.location_kind === "preset" ? -1 : 1;
        })
        .map(mapDepartureLocationRow);
}

// 새 저장 위치는 생성 즉시 최근 사용 시각을 갖도록 DB 기본값을 그대로 사용한다.
export async function createDepartureLocation(input: {
    userId: string;
    label: string;
    lat: number;
    lng: number;
    locationKind: "recent" | "preset";
}) {
    const { data, error } = await getSupabaseAdminClient()
        .from("departure_locations")
        .insert({
            user_id: input.userId,
            label: input.label,
            lat: input.lat,
            lng: input.lng,
            location_kind: input.locationKind,
        })
        .select("id, label, lat, lng, location_kind, last_used_at, created_at, updated_at")
        .single<DepartureLocationRow>();

    if (error) {
        throw error;
    }

    return mapDepartureLocationRow(data);
}

// 저장 위치 수정은 현재 사용자 소유 row 의 좌표와 최근 주소 라벨을 함께 갱신한다.
export async function updateDepartureLocation(input: {
    userId: string;
    departureLocationId: string;
    label: string;
    lat: number;
    lng: number;
}) {
    const { data, error } = await getSupabaseAdminClient()
        .from("departure_locations")
        .update({
            label: input.label,
            lat: input.lat,
            lng: input.lng,
            updated_at: new Date().toISOString(),
        })
        .eq("user_id", input.userId)
        .eq("id", input.departureLocationId)
        .select("id, label, lat, lng, location_kind, last_used_at, created_at, updated_at")
        .maybeSingle<DepartureLocationRow>();

    if (error) {
        throw error;
    }

    return data ? mapDepartureLocationRow(data) : null;
}

// 최근 사용 갱신은 현재 사용자 소유 row 만 갱신하고 없으면 null 을 반환한다.
export async function touchDepartureLocationLastUsedAt(input: {
    userId: string;
    departureLocationId: string;
}) {
    const { data, error } = await getSupabaseAdminClient()
        .from("departure_locations")
        .update({
            last_used_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq("user_id", input.userId)
        .eq("id", input.departureLocationId)
        .select("id, label, lat, lng, location_kind, last_used_at, created_at, updated_at")
        .maybeSingle<DepartureLocationRow>();

    if (error) {
        throw error;
    }

    return data ? mapDepartureLocationRow(data) : null;
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