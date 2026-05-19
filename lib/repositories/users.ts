import "server-only";

import type { LocationShareScope } from "@/lib/location-share";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

// users 테이블 raw row 구조를 그대로 표현해 DB 컬럼명과 앱 타입을 분리한다.
type UserRow = {
    id: string;
    nickname: string;
    nickname_normalized: string;
    password_hash: string;
    lat: number | null;
    lng: number | null;
    location_updated_at: string | null;
    location_share_scope: LocationShareScope | null;
    location_share_target_user_id: string | null;
};

// 프론트 응답에 바로 사용할 사용자 요약 구조다.
export type UserSummary = {
    id: string;
    nickname: string;
    lat: number | null;
    lng: number | null;
    locationUpdatedAt: string | null;
    locationShareScope: LocationShareScope | null;
    locationShareTargetUserId: string | null;
};

// 로그인 검증에는 정규화 닉네임과 비밀번호 해시까지 필요하므로 별도 타입으로 확장한다.
export type AuthUserRecord = UserSummary & {
    nicknameNormalized: string;
    passwordHash: string;
};

// snake_case DB row를 앱 내부 camelCase 타입으로 변환한다.
function mapUserRow(row: UserRow): AuthUserRecord {
    return {
        id: row.id,
        nickname: row.nickname,
        nicknameNormalized: row.nickname_normalized,
        passwordHash: row.password_hash,
        lat: row.lat,
        lng: row.lng,
        locationUpdatedAt: row.location_updated_at,
        locationShareScope: row.location_share_scope,
        locationShareTargetUserId: row.location_share_target_user_id,
    };
}

export function isLocationVisibleToViewer(input: {
    owner: Pick<UserSummary, "lat" | "lng" | "locationShareScope" | "locationShareTargetUserId">;
    viewerUserId: string;
}) {
    const { owner, viewerUserId } = input;

    if (owner.lat === null || owner.lng === null) {
        return false;
    }

    if (owner.locationShareScope === "all_friends") {
        return true;
    }

    return owner.locationShareScope === "friend" && owner.locationShareTargetUserId === viewerUserId;
}

export function maskUserLocationForViewer(user: UserSummary, viewerUserId: string): UserSummary {
    if (isLocationVisibleToViewer({ owner: user, viewerUserId })) {
        return user;
    }

    return {
        ...user,
        lat: null,
        lng: null,
        locationUpdatedAt: null,
        locationShareScope: null,
        locationShareTargetUserId: null,
    };
}

// 회원가입 중복 검사와 로그인 조회에서 nickname_normalized 기준 단건 조회를 재사용한다.
export async function findUserByNicknameNormalized(nicknameNormalized: string) {
    const { data, error } = await getSupabaseAdminClient()
        .from("users")
        .select("id, nickname, nickname_normalized, password_hash, lat, lng, location_updated_at, location_share_scope, location_share_target_user_id")
        .eq("nickname_normalized", nicknameNormalized)
        .maybeSingle<UserRow>();

    if (error) {
        throw error;
    }

    return data ? mapUserRow(data) : null;
}

// 보호 API는 현재 사용자와 대상 친구를 id 기준으로 다시 조회해 최신 위치를 읽는다.
export async function findUserById(userId: string) {
    const { data, error } = await getSupabaseAdminClient()
        .from("users")
        .select("id, nickname, nickname_normalized, password_hash, lat, lng, location_updated_at, location_share_scope, location_share_target_user_id")
        .eq("id", userId)
        .maybeSingle<UserRow>();

    if (error) {
        throw error;
    }

    return data ? mapUserRow(data) : null;
}

// 회원가입 시 users 테이블에 새 계정을 만들고, 생성된 행을 바로 앱 타입으로 반환한다.
export async function createUser(input: {
    nickname: string;
    nicknameNormalized: string;
    passwordHash: string;
}) {
    const { data, error } = await getSupabaseAdminClient()
        .from("users")
        .insert({
            nickname: input.nickname,
            nickname_normalized: input.nicknameNormalized,
            password_hash: input.passwordHash,
        })
        .select("id, nickname, nickname_normalized, password_hash, lat, lng, location_updated_at, location_share_scope, location_share_target_user_id")
        .single<UserRow>();

    if (error) {
        throw error;
    }

    return mapUserRow(data);
}

// 현재 사용자 위치 저장은 마지막 공유 좌표와 공유 범위를 함께 갱신한다.
export async function updateUserLocation(input: {
    userId: string;
    lat: number;
    lng: number;
    locationShareScope: LocationShareScope;
    locationShareTargetUserId: string | null;
}) {
    const { data, error } = await getSupabaseAdminClient()
        .from("users")
        .update({
            lat: input.lat,
            lng: input.lng,
            location_updated_at: new Date().toISOString(),
            location_share_scope: input.locationShareScope,
            location_share_target_user_id: input.locationShareTargetUserId,
        })
        .eq("id", input.userId)
        .select("id, nickname, nickname_normalized, password_hash, lat, lng, location_updated_at, location_share_scope, location_share_target_user_id")
        .single<UserRow>();

    if (error) {
        throw error;
    }

    return mapUserRow(data);
}