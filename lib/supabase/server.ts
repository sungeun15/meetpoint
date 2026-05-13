import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// 현재 MVP에서 반드시 살아 있어야 하는 핵심 테이블만 헬스체크 대상으로 본다.
const REQUIRED_TABLES = [
    "users",
    "friends",
    "messages",
    "departure_locations",
] as const;

type RequiredTableName = (typeof REQUIRED_TABLES)[number];

// 헬스체크 응답에서는 각 테이블 접근 가능 여부와 실패 이유만 다룬다.
export type SupabaseTableHealth = {
    table: RequiredTableName;
    reachable: boolean;
    error: string | null;
};

let cachedClient: SupabaseClient | null = null;

// URL이 없으면 서버 유틸이 잘못 설정된 것이므로 즉시 실패시킨다.
function requireSupabaseUrl() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
        throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
    }

    return supabaseUrl;
}

// service role 키는 서버 전용 관리자 접근의 필수값이다.
function requireServiceRoleKey() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
    }

    return serviceRoleKey;
}

// 서버 전체에서 하나의 admin client를 재사용해 불필요한 재생성을 줄인다.
export function getSupabaseAdminClient() {
    if (cachedClient) {
        return cachedClient;
    }

    cachedClient = createClient(requireSupabaseUrl(), requireServiceRoleKey(), {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    return cachedClient;
}

// 헬스체크는 row count를 세지 않고 1건 조회 가능 여부만 확인해 비용을 낮춘다.
async function inspectTable(table: RequiredTableName): Promise<SupabaseTableHealth> {
    const { error } = await getSupabaseAdminClient()
        .from(table)
        .select("id")
        .limit(1);

    if (error) {
        return {
            table,
            reachable: false,
            error: error.message,
        };
    }

    return {
        table,
        reachable: true,
        error: null,
    };
}

// 모든 핵심 테이블을 병렬로 확인해 헬스 엔드포인트가 한 번에 상태를 판단할 수 있게 한다.
export async function getSupabaseSchemaHealth() {
    const tables = await Promise.all(REQUIRED_TABLES.map(inspectTable));

    return {
        ok: tables.every((table) => table.reachable),
        tables,
    };
}