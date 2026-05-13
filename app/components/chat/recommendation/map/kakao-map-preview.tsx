"use client";

import { useEffect, useRef, useState } from "react";

import type { KakaoMapInstance } from "@/lib/kakao/map-loader";
import { KAKAO_MAP_MIN_HEIGHT_CLASS } from "../chat-recommendation-layout";
import {
    KakaoMapControlPanel,
    KakaoMapFitBoundsButton,
    type OverlayMode,
} from "./chat-recommendation-map-controls";
import {
    createRecommendationMapScene,
    fitMapToMarkerBounds,
    type KakaoMapSdkInstance,
} from "./chat-recommendation-map-scene";
import type { MapMarker } from "../../types";

type KakaoMapPreviewProps = {
    markers?: MapMarker[]; // 현재 지도에 보여 줄 마커 목록입니다.
    selectedMarkerId?: string | null; // 강조할 장소 마커 id입니다.
    onMarkerSelect?: (markerId: string) => void; // 장소 마커 선택 이벤트를 상위에 전달합니다.
};

// recommendation 지도 scene을 React 수명주기에 맞춰 생성/정리하는 프리뷰 컴포넌트입니다.
export function KakaoMapPreview({
    markers = [],
    selectedMarkerId = null,
    onMarkerSelect,
}: KakaoMapPreviewProps) {
    // scene 인스턴스와 상위 콜백 참조를 보관해 재렌더 간에도 지도 객체를 제어합니다.
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<KakaoMapInstance | null>(null);
    const kakaoRef = useRef<KakaoMapSdkInstance | null>(null);
    const onMarkerSelectRef = useRef(onMarkerSelect);
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [overlayModes, setOverlayModes] = useState<Record<OverlayMode, boolean>>({
        TRAFFIC: false,
        BICYCLE: false,
        TERRAIN: false,
    });
    const [isDraggable, setIsDraggable] = useState(true);
    const [isZoomable, setIsZoomable] = useState(true);

    // 현재 지도 인스턴스의 드래그/줌 상태를 React state로 동기화합니다.
    function syncMapState() {
        const map = mapRef.current;

        if (!map) {
            return;
        }

        setIsDraggable(map.getDraggable());
        setIsZoomable(map.getZoomable());
    }

    // 오버레이 토글 UI를 실제 Kakao 지도 오버레이 상태에 반영합니다.
    function handleOverlayToggle(overlayMode: OverlayMode) {
        const map = mapRef.current;
        const kakao = kakaoRef.current;

        if (!map || !kakao) {
            return;
        }

        setOverlayModes((currentOverlayModes) => {
            const nextValue = !currentOverlayModes[overlayMode];

            if (nextValue) {
                map.addOverlayMapTypeId(kakao.maps.MapTypeId[overlayMode]);
            } else {
                map.removeOverlayMapTypeId(kakao.maps.MapTypeId[overlayMode]);
            }

            return {
                ...currentOverlayModes,
                [overlayMode]: nextValue,
            };
        });
    }

    // 드래그와 휠 줌 가능 여부를 지도 객체에 즉시 반영합니다.
    function handleInteractionToggle(interaction: "drag" | "zoom") {
        const map = mapRef.current;

        if (!map) {
            return;
        }

        if (interaction === "drag") {
            const nextValue = !isDraggable;
            map.setDraggable(nextValue);
            setIsDraggable(nextValue);
            return;
        }

        const nextValue = !isZoomable;
        map.setZoomable(nextValue);
        setIsZoomable(nextValue);
    }

    // 현재 마커 전체가 보이도록 bounds를 다시 맞춥니다.
    function handleFitBounds() {
        const map = mapRef.current;
        const kakao = kakaoRef.current;

        if (!map || !kakao || markers.length === 0) {
            return;
        }

        fitMapToMarkerBounds(map, kakao, markers);
    }

    // 최신 onMarkerSelect 콜백을 ref에 유지해 scene 내부 클릭 핸들러에서 안전하게 사용합니다.
    useEffect(() => {
        onMarkerSelectRef.current = onMarkerSelect;
    }, [onMarkerSelect]);

    // markers 또는 선택 상태가 바뀌면 scene을 다시 생성해 현재 상태를 반영합니다.
    useEffect(() => {
        let isMounted = true;
        let resizeObserver: ResizeObserver | null = null;

        async function renderMap() {
            if (!mapContainerRef.current) {
                return;
            }

            setStatus("loading");
            setErrorMessage(null);

            try {
                if (!isMounted || !mapContainerRef.current) {
                    return;
                }

                const scene = await createRecommendationMapScene({
                    container: mapContainerRef.current,
                    markers,
                    selectedMarkerId,
                    onMarkerSelect: (markerId) => {
                        onMarkerSelectRef.current?.(markerId);
                    },
                    onMapIdle: syncMapState,
                });

                if (!isMounted) {
                    scene.resizeObserver.disconnect();
                    return;
                }

                mapRef.current = scene.map;
                kakaoRef.current = scene.kakao;
                resizeObserver = scene.resizeObserver;
                syncMapState();
                setStatus("ready");
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                setStatus("error");
                setErrorMessage(error instanceof Error ? error.message : "Unknown Kakao Map error.");
            }
        }

        renderMap();

        return () => {
            isMounted = false;
            resizeObserver?.disconnect();
            mapRef.current = null;
            kakaoRef.current = null;
        };
    }, [markers, selectedMarkerId]);

    if (status === "error") {
        return (
            <div className={`flex ${KAKAO_MAP_MIN_HEIGHT_CLASS} items-center justify-center rounded-2xl border border-[#f1c6d6] bg-[#fff7fa] px-4 py-5 text-center`}>
                <div>
                    <p className="text-sm font-semibold text-[#9f2951]">Kakao Map could not load</p>
                    <p className="mt-2 text-sm leading-6 text-[#6b7280]">{errorMessage}</p>
                    <p className="mt-3 text-xs leading-5 text-[#8b6b7b]">.env.local에 NEXT_PUBLIC_KAKAO_MAP_APP_KEY를 넣고 localhost 도메인을 Kakao JS SDK 도메인에 등록해 주세요.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid gap-3 sm:gap-4">
            {status === "ready" ? (
                <KakaoMapControlPanel
                    overlayModes={overlayModes}
                    isDraggable={isDraggable}
                    isZoomable={isZoomable}
                    onOverlayToggle={handleOverlayToggle}
                    onInteractionToggle={handleInteractionToggle}
                />
            ) : null}

            <div className="relative overflow-hidden rounded-2xl border border-[#d9d4ff] bg-white">
                {status === "ready" ? <KakaoMapFitBoundsButton onFitBounds={handleFitBounds} /> : null}

                {status === "loading" ? (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/75 text-center backdrop-blur-sm">
                        <div>
                            <p className="text-sm font-semibold text-[#2b2373]">Loading Kakao Map...</p>
                            <p className="mt-2 text-xs leading-5 text-[#6b7280]">
                                {markers.length > 0 ? "선택한 위치와 추천 마커를 지도에 그리는 중입니다." : "기본 지도를 준비 중입니다."}
                            </p>
                        </div>
                    </div>
                ) : null}

                <div ref={mapContainerRef} className={`${KAKAO_MAP_MIN_HEIGHT_CLASS} w-full`} aria-label="Kakao Map preview" />
            </div>
        </div>
    );
}