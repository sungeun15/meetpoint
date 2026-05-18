import process from "node:process";

import { createClient } from "@supabase/supabase-js";

import { loadEnvFile, requireEnv, resolveEnvPath } from "./test-supabase/lib/env-utils.mjs";

function parseArgs(argv) {
    const args = {
        friendId: "",
        userId: null,
        count: 300,
        days: 15,
    };

    for (let index = 0; index < argv.length; index += 1) {
        const token = argv[index];
        const nextValue = argv[index + 1];

        if (token === "--friendId" && nextValue) {
            args.friendId = nextValue;
            index += 1;
            continue;
        }

        if (token === "--userId" && nextValue) {
            args.userId = nextValue;
            index += 1;
            continue;
        }

        if (token === "--count" && nextValue) {
            args.count = Number.parseInt(nextValue, 10);
            index += 1;
            continue;
        }

        if (token === "--days" && nextValue) {
            args.days = Number.parseInt(nextValue, 10);
            index += 1;
        }
    }

    if (!args.friendId) {
        throw new Error("--friendId 는 필수입니다.");
    }

    if (!Number.isInteger(args.count) || args.count < 1) {
        throw new Error("--count 는 1 이상의 정수여야 합니다.");
    }

    if (!Number.isInteger(args.days) || args.days < 1) {
        throw new Error("--days 는 1 이상의 정수여야 합니다.");
    }

    return args;
}

function buildMessageContent(dayOffset, indexWithinDay) {
    const templates = [
        "오늘 일정 다시 맞춰볼까?",
        "지금 출발하면 몇 시쯤 도착할 것 같아?",
        "중간 지점 카페로 보는 거 괜찮아?",
        "위치 공유 확인했어. 근처에서 보면 될 듯!",
        "오늘은 내가 조금 더 가까이 갈 수 있어.",
        `약속 시간 ${indexWithinDay + 1}차 확인 메시지야.`,
        `날짜 ${dayOffset + 1}일차 더미 대화 흐름 확인 중이야.`,
        `채팅 스크롤 테스트용 메시지 ${indexWithinDay + 1}번이야.`,
    ];

    return templates[(dayOffset + indexWithinDay) % templates.length];
}

function buildDatedMessages(input) {
    const messages = [];
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const basePerDay = Math.floor(input.count / input.days);
    const remainder = input.count % input.days;

    for (let dayOffset = input.days - 1; dayOffset >= 0; dayOffset -= 1) {
        const day = new Date(startOfToday);
        day.setDate(startOfToday.getDate() - dayOffset);

        const perDayCount = basePerDay + (input.days - dayOffset <= remainder ? 1 : 0);

        for (let indexWithinDay = 0; indexWithinDay < perDayCount; indexWithinDay += 1) {
            const senderIsUser = indexWithinDay % 2 === 0;
            const senderId = senderIsUser ? input.user.id : input.friend.id;
            const receiverId = senderIsUser ? input.friend.id : input.user.id;
            const minuteOffset = indexWithinDay * 11;
            const createdAt = new Date(day);

            createdAt.setHours(9 + Math.floor(minuteOffset / 60), minuteOffset % 60, 0, indexWithinDay);

            messages.push({
                sender_id: senderId,
                receiver_id: receiverId,
                content: buildMessageContent(dayOffset, indexWithinDay),
                created_at: createdAt.toISOString(),
            });
        }
    }

    return messages;
}

async function listAcceptedPairs(supabase, friendId, userId) {
    const { data, error } = await supabase
        .from("friends")
        .select("user_id, friend_id, status")
        .eq("status", "accepted")
        .or(`user_id.eq.${friendId},friend_id.eq.${friendId}`);

    if (error) {
        throw error;
    }

    const counterpartIds = [...new Set(data.flatMap((row) => {
        if (row.user_id === friendId) {
            return [row.friend_id];
        }

        if (row.friend_id === friendId) {
            return [row.user_id];
        }

        return [];
    }))].filter((candidateId) => !userId || candidateId === userId);

    if (!counterpartIds.length) {
        throw new Error(userId
            ? `friendId=${friendId} 와 accepted 관계인 userId=${userId} 를 찾지 못했습니다.`
            : `friendId=${friendId} 와 accepted 관계인 사용자를 찾지 못했습니다.`);
    }

    const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, nickname")
        .in("id", [friendId, ...counterpartIds]);

    if (usersError) {
        throw usersError;
    }

    const userById = new Map(users.map((user) => [user.id, user]));
    const friend = userById.get(friendId);

    if (!friend) {
        throw new Error(`users 테이블에서 friendId=${friendId} 를 찾지 못했습니다.`);
    }

    return counterpartIds.map((counterpartId) => {
        const user = userById.get(counterpartId);

        if (!user) {
            throw new Error(`users 테이블에서 counterpart userId=${counterpartId} 를 찾지 못했습니다.`);
        }

        return { user, friend };
    });
}

async function insertMessagesForPair(supabase, pair, count, days) {
    const payload = buildDatedMessages({
        user: pair.user,
        friend: pair.friend,
        count,
        days,
    });

    const chunkSize = 100;

    for (let index = 0; index < payload.length; index += chunkSize) {
        const chunk = payload.slice(index, index + chunkSize);
        const { error } = await supabase
            .from("messages")
            .insert(chunk);

        if (error) {
            throw error;
        }
    }

    return payload;
}

async function run() {
    const args = parseArgs(process.argv.slice(2));
    const envPath = resolveEnvPath();
    loadEnvFile(envPath);

    const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL").replace(/\/$/, "");
    const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false },
    });

    const pairs = await listAcceptedPairs(supabase, args.friendId, args.userId);

    console.log(`Accepted pair count: ${pairs.length}`);

    for (const pair of pairs) {
        const insertedMessages = await insertMessagesForPair(supabase, pair, args.count, args.days);
        const firstCreatedAt = insertedMessages[0]?.created_at ?? null;
        const lastCreatedAt = insertedMessages.at(-1)?.created_at ?? null;

        console.log([
            `Inserted ${insertedMessages.length} messages`,
            `user=${pair.user.nickname}(${pair.user.id})`,
            `friend=${pair.friend.nickname}(${pair.friend.id})`,
            `first=${firstCreatedAt}`,
            `last=${lastCreatedAt}`,
        ].join(" | "));
    }
}

run().catch((error) => {
    console.error("Dummy message generation failed.");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});