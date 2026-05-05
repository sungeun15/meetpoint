import fs from "node:fs";
import path from "node:path";
import process from "node:process";

export function resolveEnvPath(cwd = process.cwd()) {
    return path.resolve(cwd, ".env");
}

function parseEnvFile(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`.env file not found at ${filePath}`);
    }

    const content = fs.readFileSync(filePath, "utf8");
    const values = new Map();

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

        values.set(key, value);
    }

    return values;
}

// 테스트는 현재 프로젝트의 .env 값을 우선 사용해 실제 설정을 검증한다.
export function requireProjectEnv(name, envPath = resolveEnvPath()) {
    const values = parseEnvFile(envPath);
    const fileValue = values.get(name);

    if (fileValue) {
        return fileValue;
    }

    const processValue = process.env[name];

    if (processValue) {
        return processValue;
    }

    throw new Error(`${name} is not set`);
}