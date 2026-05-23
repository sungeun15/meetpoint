import type { Dispatch, SetStateAction } from "react";
import { useEffect, useMemo, useState } from "react";

import type { LocationShareScope } from "@/lib/contracts/friends";

import { resolveCoordinateDisplayAddress } from "../chat-coordinate-address-helpers";
import {
    buildBrowserSharedLocation,
    buildManualSharedLocation,
    buildStoredSharedLocation,
    getLocationShareCopy,
    getLocationShareGeolocationErrorMessage,
    getMissingLocationShareTargetMessage,
} from "../location/chat-location-share-helpers";
import {
    buildFriendLocationStatus,
    buildMyLocationStatus,
    formatCurrentTime,
    type SharedLocationState,
} from "../chat-screen-helpers";
import type { ResolvedLocation } from "../types";
import type { FriendItem } from "../../friends/types";
import { formatLocationUpdatedLabel } from "../../friends/mappers";
import { requestApi } from "./chat-screen-state-api";

type LocationSaveResponse = {
    location: {
        lat: number; // 저장된 내 위치 위도입니다.
        lng: number; // 저장된 내 위치 경도입니다.
        locationUpdatedAt: string | null; // 서버 기준 위치 갱신 시각입니다.
    };
    locationShareScope: LocationShareScope; // 실제 저장된 공유 범위입니다.
    locationShareTargetUserId: string | null; // 친구 1명 공유일 때 대상 친구 id 입니다.
};

type LocationLookupResponse = {
    location: {
        lat: number; // 서버에 저장된 내 위치 위도입니다.
        lng: number; // 서버에 저장된 내 위치 경도입니다.
        locationUpdatedAt: string | null; // 마지막 위치 갱신 시각입니다.
    } | null;
    locationShareScope: LocationShareScope | null; // 현재 저장된 공유 범위입니다.
    locationShareTargetUserId: string | null; // 친구 1명 공유일 때 대상 친구 id 입니다.
};

type ManualShareFallbackHandler = (scope: LocationShareScope) => void;

type UseChatScreenLocationStateArgs = {
    activeFriendId: string; // 현재 대화 중인 친구 id 입니다.
    selectedFriend: FriendItem | null; // 상태 패널과 recommendation 에 사용할 현재 친구 정보입니다.
    setShouldRedirectToLogin: Dispatch<SetStateAction<boolean>>;
    setFeedbackMessage: Dispatch<SetStateAction<string | null>>; // 상위 화면 피드백 문구를 갱신합니다.
};

function commitSharedLocation(input: {
    nextLocation: ResolvedLocation;
    feedbackLabel: string;
    locationShareScope: LocationShareScope;
    locationShareTargetUserId: string | null;
    setMySharedLocation: Dispatch<SetStateAction<SharedLocationState | null>>;
    setFeedbackMessage: Dispatch<SetStateAction<string | null>>;
}) {
    const nextTimestamp = formatCurrentTime();

    input.setMySharedLocation({
        ...input.nextLocation,
        sharedAt: nextTimestamp,
        shareScope: input.locationShareScope,
        sharedFriendId: input.locationShareTargetUserId,
    });
    input.setFeedbackMessage(`${input.feedbackLabel} ${nextTimestamp}에 반영했어요.`);
}

export function useChatScreenLocationState({
    activeFriendId,
    selectedFriend,
    setShouldRedirectToLogin,
    setFeedbackMessage,
}: UseChatScreenLocationStateArgs) {
    const [mySharedLocation, setMySharedLocation] = useState<SharedLocationState | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadMyLocation() {
            try {
                const result = await requestApi<LocationLookupResponse>("/api/location", "위치 정보를 불러오지 못했습니다.", {
                    method: "GET",
                    cache: "no-store",
                });

                if (!isMounted) {
                    return;
                }

                if (result.status === "unauthorized") {
                    setShouldRedirectToLogin(true);
                    return;
                }

                if (result.status === "error") {
                    return;
                }

                if (!result.data.location) {
                    setMySharedLocation(null);
                    return;
                }

                const resolvedAddress = await resolveCoordinateDisplayAddress({
                    latitude: result.data.location.lat,
                    longitude: result.data.location.lng,
                    fallbackPrefix: "공유한 위치",
                });

                setMySharedLocation({
                    ...buildStoredSharedLocation(result.data.location.lat, result.data.location.lng, resolvedAddress),
                    sharedAt: formatLocationUpdatedLabel(result.data.location.locationUpdatedAt) ?? "최근",
                    shareScope: result.data.locationShareScope,
                    sharedFriendId: result.data.locationShareTargetUserId,
                });
            } catch {
                if (!isMounted) {
                    return;
                }
            }
        }

        void loadMyLocation();

        return () => {
            isMounted = false;
        };
    }, [setShouldRedirectToLogin]);

    const myLocationForSelectedFriend = useMemo(() => {
        if (!mySharedLocation) {
            return null;
        }

        if (mySharedLocation.shareScope === "all_friends") {
            return mySharedLocation;
        }

        if (mySharedLocation.shareScope === "friend" && mySharedLocation.sharedFriendId === activeFriendId) {
            return mySharedLocation;
        }

        return null;
    }, [activeFriendId, mySharedLocation]);

    const lastSharedAt = mySharedLocation?.sharedAt ?? null;
    const myLocationStatus = buildMyLocationStatus(mySharedLocation, selectedFriend);
    const friendLocationStatus = buildFriendLocationStatus(selectedFriend);

    async function persistSharedLocation(scope: LocationShareScope, nextLocation: ResolvedLocation) {
        const missingTargetMessage = getMissingLocationShareTargetMessage(scope, activeFriendId);

        if (missingTargetMessage) {
            setFeedbackMessage(missingTargetMessage);
            return false;
        }

        const shareCopy = getLocationShareCopy(scope);

        try {
            const result = await requestApi<LocationSaveResponse>("/api/location", "위치 저장 중 오류가 발생했습니다.", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    lat: nextLocation.latitude,
                    lng: nextLocation.longitude,
                    scope,
                    friendId: scope === "friend" ? activeFriendId : null,
                }),
            });

            if (result.status === "unauthorized") {
                setShouldRedirectToLogin(true);
                return false;
            }

            if (result.status === "error") {
                setFeedbackMessage(result.message);
                return false;
            }

            commitSharedLocation({
                nextLocation,
                feedbackLabel: shareCopy.successLabel,
                locationShareScope: result.data.locationShareScope,
                locationShareTargetUserId: result.data.locationShareTargetUserId,
                setMySharedLocation,
                setFeedbackMessage,
            });
            return true;
        } catch {
            setFeedbackMessage("네트워크 오류로 위치를 저장하지 못했습니다.");
            return false;
        }
    }

    function shareLocation(scope: LocationShareScope, onManualShareFallback?: ManualShareFallbackHandler) {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
            setFeedbackMessage("브라우저에서 위치 정보를 지원하지 않아 지도에서 직접 위치를 지정해 주세요.");
            onManualShareFallback?.(scope);
            return;
        }

        const missingTargetMessage = getMissingLocationShareTargetMessage(scope, activeFriendId);

        if (missingTargetMessage) {
            setFeedbackMessage(missingTargetMessage);
            return;
        }

        const shareCopy = getLocationShareCopy(scope);

        setFeedbackMessage(shareCopy.checkingMessage);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const resolvedAddress = await resolveCoordinateDisplayAddress({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    fallbackPrefix: "브라우저 현재 위치",
                });

                await persistSharedLocation(
                    scope,
                    buildBrowserSharedLocation(position.coords.latitude, position.coords.longitude, resolvedAddress),
                );
            },
            (error) => {
                setFeedbackMessage(getLocationShareGeolocationErrorMessage(error.code));
                onManualShareFallback?.(scope);
            },
            {
                enableHighAccuracy: true,
                timeout: 8000,
                maximumAge: 0,
            },
        );
    }

    function handleShareLocationToFriend(onManualShareFallback?: ManualShareFallbackHandler) {
        shareLocation("friend", onManualShareFallback);
    }

    function handleShareLocationToAllFriends(onManualShareFallback?: ManualShareFallbackHandler) {
        shareLocation("all_friends", onManualShareFallback);
    }

    async function handleShareResolvedLocation(scope: LocationShareScope, location: ResolvedLocation) {
        setFeedbackMessage(getLocationShareCopy(scope).manualShareMessage);

        return persistSharedLocation(scope, buildManualSharedLocation(location));
    }

    return {
        mySharedLocation,
        myLocationForSelectedFriend,
        lastSharedAt,
        myLocationStatus,
        friendLocationStatus,
        handleShareLocationToFriend,
        handleShareLocationToAllFriends,
        handleShareResolvedLocation,
    };
}