import { clearAuthCookie } from "@/lib/auth/session";
import { apiOk } from "@/lib/contracts/api";

export const dynamic = "force-dynamic";

// 로그아웃은 현재 쿠키 상태와 관계없이 인증 쿠키를 지우고 성공 응답을 반환한다.
export async function POST() {
    await clearAuthCookie();

    return apiOk({ cleared: true });
}