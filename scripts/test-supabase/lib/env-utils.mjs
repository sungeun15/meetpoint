import fs from "node:fs";
import path from "node:path";
import process from "node:process";

// 현재 작업 디렉터리 기준으로 .env 파일 경로를 계산한다.
export function resolveEnvPath(cwd = process.cwd()) {
    return path.resolve(cwd, ".env");
}

// 로컬 .env 파일을 읽어 현재 프로세스 환경 변수로 주입한다.
export function loadEnvFile(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`.env file not found at ${filePath}`);
    }

    const content = fs.readFileSync(filePath, "utf8");

    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();

        if (!line || line.startsWith("#")) {
            continue;
        }

        const separatorIndex = line.indexOf("=");

        if (separatorIndex === -1) {
            continue;
        }

        const key = line.slice(0, separatorIndex).trim();
        let value = line.slice(separatorIndex + 1).trim();

        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }

        if (!(key in process.env)) {
            process.env[key] = value;
        }
    }
}

// 필수 환경 변수가 없으면 즉시 실패시켜 원인을 빠르게 드러낸다.
export function requireEnv(name) {
    const value = process.env[name];

    if (!value) {
        throw new Error(`${name} is not set`);
    }

    return value;
}