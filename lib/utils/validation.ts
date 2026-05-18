// 공통 입력 검증 실패를 하나의 에러 타입으로 묶어 Route Handler에서 400으로 쉽게 정리한다.
export class InputValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InputValidationError";
    }
}

// 닉네임은 한글, 영문, 숫자, 공백만 허용한다.
const NICKNAME_PATTERN = /^[A-Za-z0-9가-힣 ]+$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LOCATION_KIND_VALUES = ["recent", "preset"] as const;
const RECOMMENDATION_MODE_VALUES = ["now", "later"] as const;
const RECOMMENDATION_CATEGORY_VALUES = ["cafe", "meal", "fun"] as const;
const DEPARTURE_SOURCE_VALUES = ["search", "pin", "saved"] as const;
const FRIEND_REQUEST_ACTION_VALUES = ["accept", "reject"] as const;

// 닉네임 비교용 정규화는 trim, 연속 공백 축소, 영문 소문자 변환 규칙을 따른다.
export function normalizeNickname(value: string) {
    if (typeof value !== "string") {
        throw new InputValidationError("닉네임은 문자열이어야 합니다.");
    }

    const normalized = value.trim().replace(/\s+/g, " ").toLowerCase();

    if (!normalized) {
        throw new InputValidationError("닉네임을 입력해 주세요.");
    }

    return normalized;
}

// 회원가입/로그인 입력용 닉네임은 표시값과 비교용 정규화값을 함께 반환한다.
export function validateNickname(value: string) {
    if (typeof value !== "string") {
        throw new InputValidationError("닉네임은 문자열이어야 합니다.");
    }

    const trimmed = value.trim().replace(/\s+/g, " ");
    const normalized = normalizeNickname(trimmed);

    if (normalized.length < 2 || normalized.length > 12) {
        throw new InputValidationError("닉네임은 2자 이상 12자 이하만 허용합니다.");
    }

    if (!NICKNAME_PATTERN.test(trimmed)) {
        throw new InputValidationError("닉네임은 한글, 영문, 숫자, 공백만 사용할 수 있습니다.");
    }

    return {
        nickname: trimmed,
        nicknameNormalized: normalized,
    };
}

// 비밀번호는 MVP 규칙에 맞춰 길이와 공백 포함 여부만 우선 검증한다.
export function validatePassword(value: string) {
    if (typeof value !== "string") {
        throw new InputValidationError("비밀번호는 문자열이어야 합니다.");
    }

    if (value.length < 4 || value.length > 20) {
        throw new InputValidationError("비밀번호는 4자 이상 20자 이하만 허용합니다.");
    }

    if (/\s/.test(value)) {
        throw new InputValidationError("비밀번호에는 공백을 포함할 수 없습니다.");
    }

    return value;
}

// UUID 입력은 보호 API에서 경로/쿼리/본문 공통 식별자 검증에 재사용한다.
export function validateUuid(value: unknown, fieldName: string) {
    if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
        throw new InputValidationError(`${fieldName}는 UUID 형식이어야 합니다.`);
    }

    return value;
}

export function validateOptionalUuid(value: string | null, fieldName: string) {
    if (value === null || value === "") {
        return null;
    }

    return validateUuid(value, fieldName);
}

// 메시지 본문은 공백만 있는 입력을 차단하고 DB 저장용 trim 값을 반환한다.
export function validateMessageContent(value: string) {
    if (typeof value !== "string") {
        throw new InputValidationError("content는 문자열이어야 합니다.");
    }

    const trimmed = value.trim();

    if (!trimmed) {
        throw new InputValidationError("메시지 내용을 입력해 주세요.");
    }

    if (trimmed.length > 500) {
        throw new InputValidationError("메시지는 500자 이하만 허용합니다.");
    }

    return trimmed;
}

// polling 조회 limit 는 기본 50, 최대 100 규칙을 공통으로 맞춘다.
export function validateLimit(value: string | null, defaultValue = 50, maxValue = 100) {
    if (value === null || value === "") {
        return defaultValue;
    }

    const parsed = Number.parseInt(value, 10);

    if (!Number.isInteger(parsed) || parsed < 1 || parsed > maxValue) {
        throw new InputValidationError(`limit는 1 이상 ${maxValue} 이하 정수여야 합니다.`);
    }

    return parsed;
}

// after/before 같은 선택 커서는 형식이 잘못돼도 조회를 막지 않도록 null 로 정리한다.
export function validateOptionalIsoDatetime(value: string | null) {
    if (value === null || value === "") {
        return null;
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime()) || parsed.toISOString() !== value) {
        return null;
    }

    return value;
}

// 위도/경도는 숫자 여부와 허용 범위를 함께 검증해 모든 위치 API에서 재사용한다.
export function validateCoordinates(lat: unknown, lng: unknown) {
    if (typeof lat !== "number" || Number.isNaN(lat) || lat < -90 || lat > 90) {
        throw new InputValidationError("lat는 -90 이상 90 이하 숫자여야 합니다.");
    }

    if (typeof lng !== "number" || Number.isNaN(lng) || lng < -180 || lng > 180) {
        throw new InputValidationError("lng는 -180 이상 180 이하 숫자여야 합니다.");
    }

    return { lat, lng };
}

// 저장 출발 위치 라벨은 공백 정리 후 비어 있지 않아야 하며 DB 길이 제한과 맞춘다.
export function validateDepartureLabel(value: unknown) {
    if (typeof value !== "string") {
        throw new InputValidationError("label은 문자열이어야 합니다.");
    }

    const label = value.trim().replace(/\s+/g, " ");

    if (!label) {
        throw new InputValidationError("label을 입력해 주세요.");
    }

    if (label.length > 100) {
        throw new InputValidationError("label은 100자 이하만 허용합니다.");
    }

    return label;
}

// locationKind 는 recent/preset 두 값만 허용한다.
export function validateLocationKind(value: unknown) {
    if (typeof value !== "string" || !LOCATION_KIND_VALUES.includes(value as (typeof LOCATION_KIND_VALUES)[number])) {
        throw new InputValidationError("locationKind는 recent 또는 preset 이어야 합니다.");
    }

    return value as (typeof LOCATION_KIND_VALUES)[number];
}

// 출발 위치 검색 query 는 2자 이상 문자열만 허용한다.
export function validateLocationSearchQuery(value: unknown) {
    if (typeof value !== "string") {
        throw new InputValidationError("query는 문자열이어야 합니다.");
    }

    const query = value.trim().replace(/\s+/g, " ");

    if (query.length < 2) {
        throw new InputValidationError("query는 2자 이상이어야 합니다.");
    }

    return query;
}

// 추천 모드는 now/later 두 값만 허용한다.
export function validateRecommendationMode(value: unknown) {
    if (
        typeof value !== "string"
        || !RECOMMENDATION_MODE_VALUES.includes(value as (typeof RECOMMENDATION_MODE_VALUES)[number])
    ) {
        throw new InputValidationError("mode는 now 또는 later 이어야 합니다.");
    }

    return value as (typeof RECOMMENDATION_MODE_VALUES)[number];
}

// 추천 카테고리는 cafe/meal/fun 세 값만 허용한다.
export function validateRecommendationCategory(value: unknown) {
    if (
        typeof value !== "string"
        || !RECOMMENDATION_CATEGORY_VALUES.includes(value as (typeof RECOMMENDATION_CATEGORY_VALUES)[number])
    ) {
        throw new InputValidationError("category는 cafe, meal, fun 중 하나여야 합니다.");
    }

    return value as (typeof RECOMMENDATION_CATEGORY_VALUES)[number];
}

// later 모드 출발 위치는 label/좌표를 검증하고 source 는 있을 때만 검사한다.
export function validateDeparturePoint(value: unknown, fieldName: string) {
    if (typeof value !== "object" || value === null) {
        throw new InputValidationError(`${fieldName}는 객체여야 합니다.`);
    }

    const departure = value as {
        label?: unknown;
        lat?: unknown;
        lng?: unknown;
        source?: unknown;
    };

    const label = validateDepartureLabel(departure.label);
    const { lat, lng } = validateCoordinates(departure.lat, departure.lng);

    if (departure.source === undefined) {
        throw new InputValidationError(`${fieldName}.source는 필수입니다.`);
    }

    if (
        typeof departure.source !== "string"
        || !DEPARTURE_SOURCE_VALUES.includes(departure.source as (typeof DEPARTURE_SOURCE_VALUES)[number])
    ) {
        throw new InputValidationError(`${fieldName}.source는 search, pin, saved 중 하나여야 합니다.`);
    }

    return {
        label,
        lat,
        lng,
        source: departure.source as (typeof DEPARTURE_SOURCE_VALUES)[number],
    };
}

// 친구 요청 응답 액션은 accept/reject 두 값만 허용한다.
export function validateFriendRequestAction(value: unknown) {
    if (
        typeof value !== "string"
        || !FRIEND_REQUEST_ACTION_VALUES.includes(value as (typeof FRIEND_REQUEST_ACTION_VALUES)[number])
    ) {
        throw new InputValidationError("action은 accept 또는 reject 이어야 합니다.");
    }

    return value as (typeof FRIEND_REQUEST_ACTION_VALUES)[number];
}