import { useState } from "react";

import { SAVED_DEPARTURE_PAGE_SIZE } from "./chat-departure-settings-helpers";
import type { DepartureParty } from "../types";

export function useChatDepartureSettingsSavedListState() {
    const [savedDepartureVisibleCounts, setSavedDepartureVisibleCounts] = useState<Record<DepartureParty, number>>({
        // 내 저장 출발지 기본 노출 개수입니다.
        me: SAVED_DEPARTURE_PAGE_SIZE,
        // 친구 저장 출발지 기본 노출 개수입니다.
        friend: SAVED_DEPARTURE_PAGE_SIZE,
    });
    const [savedDepartureFilterQueries, setSavedDepartureFilterQueries] = useState<Record<DepartureParty, string>>({
        // 내 저장 출발지 검색어입니다.
        me: "",
        // 친구 저장 출발지 검색어입니다.
        friend: "",
    });

    return {
        savedDepartureVisibleCounts,
        setSavedDepartureVisibleCounts,
        savedDepartureFilterQueries,
        setSavedDepartureFilterQueries,
    };
}