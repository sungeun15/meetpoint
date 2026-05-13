import { createProtectedPlaceholder } from "@/lib/utils/route-scaffold";

export const dynamic = "force-dynamic";

export const GET = createProtectedPlaceholder("저장된 출발 위치 목록 조회");
export const POST = createProtectedPlaceholder("저장된 출발 위치 추가");