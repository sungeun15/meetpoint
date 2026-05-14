import "server-only";

import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

// 해시 포맷과 파라미터를 고정해 생성/검증 로직이 항상 같은 규칙을 따르게 한다.
const PASSWORD_HASH_PREFIX = "scrypt";
const SALT_SIZE = 16;
const KEY_LENGTH = 64;

// 비밀번호는 salt를 섞어 scrypt 해시로 저장하고, 저장 형식도 함께 prefix에 기록한다.
export async function hashPassword(password: string) {
    const salt = randomBytes(SALT_SIZE).toString("hex");
    const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;

    return `${PASSWORD_HASH_PREFIX}:${salt}:${derivedKey.toString("hex")}`;
}

// 로그인 시 저장된 포맷을 다시 분해해 같은 방식으로 해시를 만들고 안전 비교를 수행한다.
export async function verifyPassword(password: string, passwordHash: string) {
    const [prefix, salt, storedHash] = passwordHash.split(":");

    if (!prefix || !salt || !storedHash || prefix !== PASSWORD_HASH_PREFIX) {
        return false;
    }

    const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
    const storedBuffer = Buffer.from(storedHash, "hex");

    if (storedBuffer.length !== derivedKey.length) {
        return false;
    }

    return timingSafeEqual(storedBuffer, derivedKey);
}