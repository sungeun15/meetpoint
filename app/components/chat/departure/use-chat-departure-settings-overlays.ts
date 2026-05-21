import { useEffect, useRef, useState, type RefObject } from "react";

import { loadDaumPostcodeApi } from "@/lib/daum/postcode-loader";
import { loadKakaoMapSdk } from "@/lib/kakao/map-loader";

import type { DepartureParty, SavedDeparture } from "../types";

export type PostcodeLayerState = {
    // 주소 검색 레이어를 연 파티입니다.
    party: DepartureParty;
    // 모달 제목과 안내 문구에 표시할 파티 라벨입니다.
    partyLabel: string;
    // 주소 검색기 최초 검색어로 넣을 값입니다.
    initialQuery: string;
};

export type DeleteConfirmationState =
    | {
        // 저장 출발지 하나를 삭제하는 모드입니다.
        kind: "single";
        // 삭제 대상 파티입니다.
        party: DepartureParty;
        // 삭제할 저장 출발지 ID입니다.
        departureId: string;
        // 삭제 확인 문구에 표시할 저장 출발지 이름입니다.
        departureLabel: string;
    }
    | {
        // 저장 출발지 전체 삭제 모드입니다.
        kind: "all";
        // 삭제 대상 파티입니다.
        party: DepartureParty;
        // 전체 삭제 확인 문구에 표시할 소유자 라벨입니다.
        ownerLabel: string;
    };

export type SavedDepartureMapLayerState = {
    // 지도 레이어 상단 제목입니다.
    title: string;
    // 지도에 표시할 저장 출발지 원본 데이터입니다.
    departure: SavedDeparture;
};

export type PinPickerLayerState =
    | {
        // 출발지 선택용 핀 모드입니다.
        kind: "departure";
        // 핀을 찍는 대상 파티입니다.
        party: DepartureParty;
    }
    | {
        // 저장 출발지 수정용 핀 모드입니다.
        kind: "saved-departure-edit";
        // 수정 대상 파티입니다.
        party: DepartureParty;
        // 수정할 저장 출발지 원본 데이터입니다.
        departure: SavedDeparture;
    };

type UseChatDepartureSettingsOverlaysArgs = {
    // 다음 주소 검색기를 붙일 컨테이너 ref입니다.
    postcodeContainerRef: RefObject<HTMLDivElement | null>;
    // 저장 출발지 지도를 붙일 컨테이너 ref입니다.
    savedDepartureMapContainerRef: RefObject<HTMLDivElement | null>;
    // 파티별 화면 표시 라벨입니다.
    departurePartyLabels: Record<DepartureParty, string>;
    // 파티별 현재 주소 검색어입니다.
    departureSearchQueries: Record<DepartureParty, string>;
    // 친구 출발지 문구에 사용할 라벨입니다.
    selectedDepartureFriendLabel: string;
    // 주소 검색어를 바꾸는 상위 콜백입니다.
    onDepartureSearchQueryChange: (party: DepartureParty, nextQuery: string) => void;
    // 주소 검색 결과가 선택됐을 때 호출할 상위 콜백입니다.
    onSearchAddressSelected: (party: DepartureParty, address: string) => void;
};

export function useChatDepartureSettingsOverlays({
    postcodeContainerRef,
    savedDepartureMapContainerRef,
    departurePartyLabels,
    departureSearchQueries,
    selectedDepartureFriendLabel,
    onDepartureSearchQueryChange,
    onSearchAddressSelected,
}: UseChatDepartureSettingsOverlaysArgs) {
    const departureSearchQueryChangeRef = useRef(onDepartureSearchQueryChange);
    const searchAddressSelectedRef = useRef(onSearchAddressSelected);
    const [postcodeLayerState, setPostcodeLayerState] = useState<PostcodeLayerState | null>(null);
    const [pinPickerLayerState, setPinPickerLayerState] = useState<PinPickerLayerState | null>(null);
    const [postcodeFeedbackMessage, setPostcodeFeedbackMessage] = useState<string | null>(null);
    const [deleteConfirmationState, setDeleteConfirmationState] = useState<DeleteConfirmationState | null>(null);
    const [savedDepartureMapLayerState, setSavedDepartureMapLayerState] = useState<SavedDepartureMapLayerState | null>(null);
    const [savedDepartureMapErrorMessage, setSavedDepartureMapErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        departureSearchQueryChangeRef.current = onDepartureSearchQueryChange;
    }, [onDepartureSearchQueryChange]);

    useEffect(() => {
        searchAddressSelectedRef.current = onSearchAddressSelected;
    }, [onSearchAddressSelected]);

    useEffect(() => {
        if (!postcodeLayerState || !postcodeContainerRef.current) {
            return;
        }

        let isDisposed = false;
        const container = postcodeContainerRef.current;
        container.innerHTML = "";

        loadDaumPostcodeApi()
            .then((daum) => {
                if (isDisposed || !postcodeContainerRef.current) {
                    return;
                }

                new daum.Postcode({
                    animation: true,
                    hideEngBtn: true,
                    popupTitle: `${postcodeLayerState.partyLabel} 출발 위치 찾기`,
                    width: "100%",
                    height: "100%",
                    oncomplete: async (data) => {
                        try {
                            const selectedAddress = data.userSelectedType === "J"
                                ? data.jibunAddress || data.address || data.roadAddress
                                : data.roadAddress || data.address || data.jibunAddress;

                            if (!selectedAddress) {
                                throw new Error("주소를 확인하지 못했어요. 다시 선택해 주세요.");
                            }

                            if (isDisposed) {
                                return;
                            }

                            departureSearchQueryChangeRef.current(postcodeLayerState.party, selectedAddress);
                            setPostcodeFeedbackMessage(null);
                            searchAddressSelectedRef.current(postcodeLayerState.party, selectedAddress);
                            setPostcodeLayerState(null);
                        } catch (error) {
                            setPostcodeFeedbackMessage(error instanceof Error ? error.message : "주소를 반영하지 못했어요.");
                        }
                    },
                    onclose: () => {
                        if (!isDisposed) {
                            setPostcodeLayerState(null);
                        }
                    },
                }).embed(postcodeContainerRef.current, postcodeLayerState.initialQuery.trim()
                    ? {
                        autoClose: true,
                        q: postcodeLayerState.initialQuery.trim(),
                    }
                    : {
                        autoClose: true,
                    });
            })
            .catch((error) => {
                if (!isDisposed) {
                    setPostcodeLayerState(null);
                    setPostcodeFeedbackMessage(error instanceof Error ? error.message : "다음 주소 검색기를 열지 못했어요.");
                }
            });

        return () => {
            isDisposed = true;
            container.innerHTML = "";
        };
    }, [postcodeContainerRef, postcodeLayerState]);

    useEffect(() => {
        if (!savedDepartureMapLayerState || !savedDepartureMapContainerRef.current) {
            return;
        }

        let isDisposed = false;
        const container = savedDepartureMapContainerRef.current;
        container.innerHTML = "";
        setSavedDepartureMapErrorMessage(null);

        loadKakaoMapSdk()
            .then((kakao) => {
                if (isDisposed || !savedDepartureMapContainerRef.current) {
                    return;
                }

                const position = new kakao.maps.LatLng(
                    savedDepartureMapLayerState.departure.latitude,
                    savedDepartureMapLayerState.departure.longitude,
                );
                const map = new kakao.maps.Map(savedDepartureMapContainerRef.current, {
                    center: position,
                    level: 3,
                    mapTypeId: kakao.maps.MapTypeId.ROADMAP,
                });
                const zoomControl = new kakao.maps.ZoomControl();
                map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

                new kakao.maps.Marker({
                    map,
                    position,
                });
            })
            .catch((error) => {
                if (!isDisposed) {
                    setSavedDepartureMapErrorMessage(error instanceof Error ? error.message : "카카오맵을 불러오지 못했어요.");
                }
            });

        return () => {
            isDisposed = true;
            container.innerHTML = "";
        };
    }, [savedDepartureMapContainerRef, savedDepartureMapLayerState]);

    function handleOpenDaumAddressSearch(party: DepartureParty) {
        setPostcodeLayerState({
            party,
            partyLabel: departurePartyLabels[party],
            initialQuery: departureSearchQueries[party].trim(),
        });
        setPostcodeFeedbackMessage(null);
    }

    function handleOpenPinPicker(party: DepartureParty) {
        setPinPickerLayerState({
            kind: "departure",
            party,
        });
    }

    function handleDeleteSavedDepartureClick(party: DepartureParty, departureId: string, departureLabel: string) {
        setDeleteConfirmationState({
            kind: "single",
            party,
            departureId,
            departureLabel,
        });
    }

    function handleDeleteAllSavedDeparturesClick(party: DepartureParty) {
        const ownerLabel = party === "me" ? "내" : selectedDepartureFriendLabel;

        setDeleteConfirmationState({
            kind: "all",
            party,
            ownerLabel,
        });
    }

    function handleOpenSavedDepartureMapLayer(party: DepartureParty, departure: SavedDeparture) {
        setSavedDepartureMapLayerState({
            title: party === "me" ? "내 출발 위치" : `${selectedDepartureFriendLabel} 출발 위치`,
            departure,
        });
    }

    function handleOpenSavedDepartureEditLayer(party: DepartureParty, departure: SavedDeparture) {
        setPinPickerLayerState({
            kind: "saved-departure-edit",
            party,
            departure,
        });
    }

    return {
        postcodeLayerState,
        pinPickerLayerState,
        postcodeFeedbackMessage,
        deleteConfirmationState,
        savedDepartureMapLayerState,
        savedDepartureMapErrorMessage,
        setPostcodeLayerState,
        setPinPickerLayerState,
        setDeleteConfirmationState,
        setSavedDepartureMapLayerState,
        handleOpenDaumAddressSearch,
        handleOpenPinPicker,
        handleDeleteSavedDepartureClick,
        handleDeleteAllSavedDeparturesClick,
        handleOpenSavedDepartureMapLayer,
        handleOpenSavedDepartureEditLayer,
    };
}