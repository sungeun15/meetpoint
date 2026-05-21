"use client";

import { useState } from "react";

import { useChatScreenFriendsState } from "./screen-state/use-chat-screen-friends-state";
import { useChatScreenLocationState } from "./screen-state/use-chat-screen-location-state";
import { useChatScreenMessageState } from "./screen-state/use-chat-screen-message-state";
import { useRecommendationFlowState } from "./recommendation/use-recommendation-flow-state";

export function useChatScreenState(requestedFriendId: string | null = null) {
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
    const {
        friends,
        setFriends,
        isLoadingFriends,
        friendSearch,
        setFriendSearch,
        activeFriendId,
        filteredFriends,
        selectedFriend,
        handleSelectFriend,
    } = useChatScreenFriendsState({
        requestedFriendId,
        setFeedbackMessage,
    });
    const {
        isLoadingMessages,
        isLoadingOlderMessages,
        selectedMessages,
        canLoadOlderMessages,
        draftMessage,
        handleDraftMessageChange,
        handleSendMessage,
        handleLoadOlderMessages,
    } = useChatScreenMessageState({
        activeFriendId,
        setFeedbackMessage,
        setFriends,
    });
    const {
        mySharedLocation,
        myLocationForSelectedFriend,
        lastSharedAt,
        myLocationStatus,
        friendLocationStatus,
        handleShareLocationToFriend,
        handleShareLocationToAllFriends,
        handleShareResolvedLocation,
    } = useChatScreenLocationState({
        activeFriendId,
        selectedFriend,
        setFeedbackMessage,
    });
    const {
        meetingMode,
        selectedCategory,
        departureInputMethod,
        departureSearchQueries,
        visibleSavedDepartures,
        selectedSavedDepartureIds,
        selectedSavedDepartures,
        selectedDepartureFriendId,
        departureFriendOptions,
        selectedDepartureLabels,
        recommendationSummary,
        canRecommend,
        hasMyLocationStatusData,
        hasFriendLocationStatusData,
        hasRecommendations,
        recommendationCards,
        mapMarkers,
        handleMeetingModeChange,
        handleCategoryChange,
        handleDepartureInputMethodChange,
        handleDepartureSearchQueryChange,
        handleDepartureFriendChange,
        handlePinnedDepartureSelect,
        handleSavedDepartureSelect,
        handleDeleteSavedDeparture,
        handleDeleteAllSavedDepartures,
        handleUpdateSavedDeparture,
        handleCreateSavedDeparture,
        handleRecommend,
    } = useRecommendationFlowState({
        activeFriendId,
        mySharedLocation: myLocationForSelectedFriend,
        selectedFriend,
        availableFriends: friends,
        setFeedbackMessage,
    });
    const selectedFriendDepartureLocation = meetingMode === "later"
        && departureInputMethod === "saved"
        && selectedSavedDepartures.friend
        ? {
            label: selectedSavedDepartures.friend.label,
            address: selectedSavedDepartures.friend.address,
            latitude: selectedSavedDepartures.friend.latitude,
            longitude: selectedSavedDepartures.friend.longitude,
        }
        : null;

    return {
        isLoadingFriends, // 친구 목록을 아직 불러오는 중인지 나타냅니다.
        isLoadingMessages, // 현재 친구의 메시지 첫 로딩이 진행 중인지 나타냅니다.
        isLoadingOlderMessages, // 이전 메시지 더보기를 불러오는 중인지 나타냅니다.
        friendSearch, // 친구 검색 입력값 원본.
        setFriendSearch, // 친구 검색 입력값을 바꾸는 setter .
        activeFriendId, // 현재 화면에서 기준이 되는 친구 id .
        filteredFriends, // 검색어가 반영된 친구 목록.
        selectedFriend, // 현재 선택된 친구 객체.
        selectedMessages, // 현재 친구 대화창에 보여 줄 메시지 목록.
        canLoadOlderMessages, // 이전 메시지를 더 불러올 수 있는지 여부.
        draftMessage, // 입력창에 쓰고 있는 메시지 초안.
        feedbackMessage, // 화면 상단/토스트 등에 보여 줄 피드백 문구.
        myLocationStatus, // 내 위치 공유 상태 패널에 보여 줄 요약 정보.
        friendLocationStatus, // 친구 위치 상태 패널에 보여 줄 요약 정보.
        mySharedLocation, // 내가 마지막으로 공유한 실제 위치 정보.
        lastSharedAt, // 내 위치를 마지막으로 공유한 시각 라벨.
        meetingMode, // 추천의 현재 모임 방식(now/later).
        selectedCategory, // 추천에 선택된 장소 카테고리.
        departureInputMethod, // 출발지 입력 방식(search/pin/saved).
        departureSearchQueries, // 참여자별 출발지 검색 입력값.
        visibleSavedDepartures, // 현재 필터 기준으로 보여 줄 저장 출발지 목록.
        selectedSavedDepartureIds, // 참여자별 현재 선택된 저장 출발지 id .
        selectedFriendDepartureLocation, // 나중에 만나기에서 현재 선택된 친구 저장 출발 위치입니다.
        selectedDepartureFriendId, // 친구 출발지 목록에 적용된 친구 필터 id .
        departureFriendOptions, // 친구 출발지 필터 드롭다운 옵션 목록.
        selectedDepartureLabels, // 추천 계산에 실제로 사용할 출발지 라벨.
        recommendationSummary, // 현재 추천 결과 또는 미리보기 요약.
        canRecommend, // 지금 상태에서 추천 계산을 실행할 수 있는지 여부.
        hasMyLocationStatusData, // 내 위치 데이터가 준비됐는지 나타냅니다.
        hasFriendLocationStatusData, // 친구 위치 데이터가 준비됐는지 나타냅니다.
        hasRecommendations, // 현재 친구 기준 추천 결과가 이미 있는지 나타냅니다.
        recommendationCards, // 추천 결과 카드 목록.
        mapMarkers, // 지도에 그릴 사람/중심점/장소 marker 목록.
        handleSelectFriend, // 현재 대화 친구를 바꾸는 handler .
        handleDraftMessageChange, // 메시지 초안 입력값을 바꾸는 handler .
        handleSendMessage, // 현재 초안 메시지를 전송하는 handler .
        handleLoadOlderMessages, // 이전 메시지를 추가로 불러오는 handler .
        handleShareLocationToFriend, // 현재 친구 1명에게 위치를 공유하는 handler .
        handleShareLocationToAllFriends, // 전체 친구에게 위치를 공유하는 handler .
        handleShareResolvedLocation, // 지도에서 고른 위치를 직접 공유 저장하는 handler .
        handleMeetingModeChange, // 추천 모임 방식을 바꾸는 handler .
        handleCategoryChange, // 추천 카테고리를 바꾸는 handler .
        handleDepartureInputMethodChange, // 출발지 입력 방식을 바꾸는 handler .
        handleDepartureSearchQueryChange, // 출발지 검색 입력값을 바꾸는 handler .
        handleDepartureFriendChange, // 친구 출발지 필터 대상을 바꾸는 handler .
        handlePinnedDepartureSelect, // 핀으로 고른 출발지를 반영하는 handler .
        handleSavedDepartureSelect, // 저장 출발지를 선택하는 handler .
        handleDeleteSavedDeparture, // 저장 출발지 한 건을 삭제하는 handler .
        handleDeleteAllSavedDepartures, // 현재 보이는 저장 출발지를 모두 삭제하는 handler .
        handleUpdateSavedDeparture, // 저장 출발지 제목/주소를 수정하는 handler .
        handleCreateSavedDeparture, // 현재 입력값으로 저장 출발지를 만드는 handler .
        handleRecommend, // 현재 조건으로 추천 계산을 실행하는 handler .
    };
}
