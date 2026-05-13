import { createProtectedPlaceholder } from "@/lib/utils/route-scaffold";

export const dynamic = "force-dynamic";

export const GET = createProtectedPlaceholder("메시지 조회");
export const POST = createProtectedPlaceholder("메시지 저장");