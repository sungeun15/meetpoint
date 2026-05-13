import { apiError, apiOk } from "@/lib/contracts/api";
import { getSupabaseSchemaHealth } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function getCronSecret() {
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
        return null;
    }

    return cronSecret;
}

export async function GET(request: Request) {
    const cronSecret = getCronSecret();

    if (!cronSecret) {
        return apiError(
            "CRON_SECRET_NOT_CONFIGURED",
            "CRON_SECRET 이 설정되지 않아 헬스체크를 실행할 수 없습니다.",
            503,
        );
    }

    if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
        return apiError("FORBIDDEN", "허용되지 않은 크론 요청입니다.", 403);
    }

    const health = await getSupabaseSchemaHealth();

    if (!health.ok) {
        const failedTables = health.tables
            .filter((table) => !table.reachable)
            .map((table) => table.table)
            .join(", ");

        return apiError(
            "SUPABASE_HEALTH_CHECK_FAILED",
            `Supabase 헬스체크에 실패했습니다: ${failedTables}`,
            503,
        );
    }

    return apiOk({
        checkedAt: new Date().toISOString(),
        tables: health.tables,
    });
}