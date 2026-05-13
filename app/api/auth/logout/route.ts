import { clearAuthCookie } from "@/lib/auth/session";
import { apiOk } from "@/lib/contracts/api";

export const dynamic = "force-dynamic";

export async function POST() {
    await clearAuthCookie();

    return apiOk({ cleared: true });
}