import { apiError, apiOk } from "@/lib/contracts/api";
import { createAuthToken, setAuthCookie } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { createUser, findUserByNicknameNormalized } from "@/lib/repositories/users";
import { InputValidationError, validateNickname, validatePassword } from "@/lib/utils/validation";

export const dynamic = "force-dynamic";

// 회원가입은 입력 검증 -> 닉네임 중복 확인 -> 사용자 생성 -> JWT 쿠키 발급 순서로 처리한다.
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nickname, nicknameNormalized } = validateNickname(body.nickname);
        const password = validatePassword(body.password);

        const existingUser = await findUserByNicknameNormalized(nicknameNormalized);

        // nickname_normalized 기준으로 이미 존재하면 바로 충돌 응답을 반환한다.
        if (existingUser) {
            return apiError("CONFLICT_NICKNAME", "이미 사용 중인 닉네임입니다.", 409);
        }

        const passwordHash = await hashPassword(password);
        const createdUser = await createUser({
            nickname,
            nicknameNormalized,
            passwordHash,
        });
        const token = await createAuthToken({
            userId: createdUser.id,
            nickname: createdUser.nickname,
        });

        // 회원가입 성공 시 즉시 로그인 상태가 되도록 인증 쿠키를 함께 설정한다.
        await setAuthCookie(token);

        return apiOk({
            user: {
                id: createdUser.id,
                nickname: createdUser.nickname,
                lat: createdUser.lat,
                lng: createdUser.lng,
                locationUpdatedAt: createdUser.locationUpdatedAt,
            },
        });
    } catch (error) {
        // 입력값 검증 실패는 공통 400 INVALID_INPUT으로 통일한다.
        if (error instanceof InputValidationError) {
            return apiError("INVALID_INPUT", error.message, 400);
        }

        if (error instanceof SyntaxError) {
            return apiError("INVALID_INPUT", "요청 본문 형식이 올바르지 않습니다.", 400);
        }

        // DB unique 제약 위반이 나더라도 API 계약상 닉네임 충돌로 응답한다.
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "23505"
        ) {
            return apiError("CONFLICT_NICKNAME", "이미 사용 중인 닉네임입니다.", 409);
        }

        return apiError("INTERNAL_ERROR", "회원가입 처리 중 오류가 발생했습니다.", 500);
    }
}