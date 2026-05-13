import { createProtectedPlaceholder } from "@/lib/utils/route-scaffold";

export const dynamic = "force-dynamic";

export const GET = createProtectedPlaceholder("친구 목록 조회");
export const POST = createProtectedPlaceholder("친구 추가");