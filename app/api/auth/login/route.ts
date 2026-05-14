import { apiError, apiOk } from "@/lib/contracts/api";
import { createAuthToken, setAuthCookie } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { findUserByNicknameNormalized } from "@/lib/repositories/users";
import { InputValidationError, validateNickname, validatePassword } from "@/lib/utils/validation";

export const dynamic = "force-dynamic";

// 로그인은 닉네임 정규화 조회와 비밀번호 해시 비교를 통과해야만 JWT 쿠키를 발급한다.
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nicknameNormalized } = validateNickname(body.nickname);
        const password = validatePassword(body.password);
        const user = await findUserByNicknameNormalized(nicknameNormalized);

        // 존재하지 않는 닉네임도 동일한 401로 처리해 계정 존재 여부를 노출하지 않는다.
        if (!user) {
            return apiError("UNAUTHORIZED", "닉네임 또는 비밀번호가 올바르지 않습니다.", 401);
        }

        const isPasswordValid = await verifyPassword(password, user.passwordHash);

        // 비밀번호 해시 비교가 실패하면 동일한 인증 실패 응답을 반환한다.
        if (!isPasswordValid) {
            return apiError("UNAUTHORIZED", "닉네임 또는 비밀번호가 올바르지 않습니다.", 401);
        }

        const token = await createAuthToken({
            userId: user.id,
            nickname: user.nickname,
        });

        // 인증 성공 후에는 이후 보호 API에서 사용할 JWT 쿠키를 설정한다.
        await setAuthCookie(token);

        return apiOk({
            user: {
                id: user.id,
                nickname: user.nickname,
                lat: user.lat,
                lng: user.lng,
                locationUpdatedAt: user.locationUpdatedAt,
            },
        });
    } catch (error) {
        // 로그인도 회원가입과 동일하게 입력 검증 오류를 400으로 정리한다.
        if (error instanceof InputValidationError) {
            return apiError("INVALID_INPUT", error.message, 400);
        }

        if (error instanceof SyntaxError) {
            return apiError("INVALID_INPUT", "요청 본문 형식이 올바르지 않습니다.", 400);
        }

        return apiError("INTERNAL_ERROR", "로그인 처리 중 오류가 발생했습니다.", 500);
    }
}