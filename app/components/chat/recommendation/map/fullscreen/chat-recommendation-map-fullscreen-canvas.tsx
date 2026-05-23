"use client";

import { useEffect, useRef, useState } from "react";

import type { KakaoMapInstance } from "@/lib/kakao/map-loader";
import {
    KakaoMapControlPanel,
    KakaoMapFitBoundsButton,
    type OverlayMode,
} from "../chat-recommendation-map-controls";
import {
    createRecommendationMapScene,
    fitMapToMarkerBounds,
    type KakaoMapSdkInstance,
    updateRecommendationMapSceneRoutes,
    updateRecommendationMapSceneSelection,
} from "../chat-recommendation-map-scene";
import type { MapMarker, RecommendationRouteSegment } from "../../../types";

type ChatRecommendationMapFullscreenCanvasProps = {
    markers: MapMarker[];
    selectedMarkerId?: string | null;
    routeSegments?: RecommendationRouteSegment[];
    onMarkerSelect?: (markerId: string) => void;
};

export function ChatRecommendationMapFullscreenCanvas({
    markers,
    selectedMarkerId = null,
    routeSegments = [],
    onMarkerSelect,
}: ChatRecommendationMapFullscreenCanvasProps) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<KakaoMapInstance | null>(null);
    const kakaoRef = useRef<KakaoMapSdkInstance | null>(null);
    const sceneRef = useRef<Awaited<ReturnType<typeof createRecommendationMapScene>> | null>(null);
    const onMarkerSelectRef = useRef(onMarkerSelect);
    const selectedMarkerIdRef = useRef(selectedMarkerId);
    const routeSegmentsRef = useRef(routeSegments);
    const selectedPlaceFocusLevelRef = useRef<number | null>(null);
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [overlayModes, setOverlayModes] = useState<Record<OverlayMode, boolean>>({
        TRAFFIC: false,
        BICYCLE: false,
        TERRAIN: false,
    });
    const [isDraggable, setIsDraggable] = useState(true);
    const [isZoomable, setIsZoomable] = useState(true);

    function syncMapState() {
        const map = mapRef.current;

        if (!map) {
            return;
        }

        setIsDraggable(map.getDraggable());
        setIsZoomable(map.getZoomable());
        selectedPlaceFocusLevelRef.current = map.getLevel();
    }

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

    function handleFitBounds() {
        const map = mapRef.current;
        const kakao = kakaoRef.current;

        if (!map || !kakao || markers.length === 0) {
            return;
        }

        fitMapToMarkerBounds(map, kakao, markers);
    }

    useEffect(() => {
        onMarkerSelectRef.current = onMarkerSelect;
    }, [onMarkerSelect]);

    useEffect(() => {
        selectedMarkerIdRef.current = selectedMarkerId;
    }, [selectedMarkerId]);

    useEffect(() => {
        routeSegmentsRef.current = routeSegments;
    }, [routeSegments]);

    useEffect(() => {
        let isMounted = true;
        let resizeObserver: ResizeObserver | null = null;
        const container = mapContainerRef.current;

        async function renderMap() {
            if (!container) {
                return;
            }

            container.innerHTML = "";
            setStatus("loading");
            setErrorMessage(null);

            try {
                const scene = await createRecommendationMapScene({
                    container,
                    markers,
                    selectedMarkerId: selectedMarkerIdRef.current,
                    selectedPlaceFocusLevel: selectedPlaceFocusLevelRef.current,
                    routeSegments: routeSegmentsRef.current,
                    onMarkerSelect: (markerId) => {
                        onMarkerSelectRef.current?.(markerId);
                    },
                    onMapIdle: syncMapState,
                });

                if (!isMounted) {
                    scene.resizeObserver.disconnect();
                    return;
                }

                sceneRef.current = scene;
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

            if (mapRef.current) {
                selectedPlaceFocusLevelRef.current = mapRef.current.getLevel();
            }

            sceneRef.current = null;
            mapRef.current = null;
            kakaoRef.current = null;

            if (container) {
                container.innerHTML = "";
            }
        };
    }, [markers]);

    useEffect(() => {
        if (!sceneRef.current || status !== "ready") {
            return;
        }

        updateRecommendationMapSceneSelection({ scene: sceneRef.current, selectedMarkerId });
        syncMapState();
    }, [selectedMarkerId, status]);

    useEffect(() => {
        if (!sceneRef.current || status !== "ready") {
            return;
        }

        updateRecommendationMapSceneRoutes({ scene: sceneRef.current, routeSegments });
    }, [routeSegments, status]);

    useEffect(() => {
        if (status !== "ready") {
            return;
        }

        const map = mapRef.current;
        const kakao = kakaoRef.current;

        if (!map || !kakao) {
            return;
        }

        let firstFrameId = 0;
        let secondFrameId = 0;

        firstFrameId = window.requestAnimationFrame(() => {
            secondFrameId = window.requestAnimationFrame(() => {
                map.relayout();
                map.setDraggable(true);
                map.setZoomable(true);

                if (selectedMarkerIdRef.current && sceneRef.current) {
                    updateRecommendationMapSceneSelection({
                        scene: sceneRef.current,
                        selectedMarkerId: selectedMarkerIdRef.current,
                    });
                } else {
                    fitMapToMarkerBounds(map, kakao, markers);
                }

                syncMapState();
            });
        });

        return () => {
            window.cancelAnimationFrame(firstFrameId);
            window.cancelAnimationFrame(secondFrameId);
        };
    }, [markers, status]);

    if (status === "error") {
        return <div className="flex h-full min-h-0 items-center justify-center rounded-2xl border border-[#f1c6d6] bg-[#fff7fa] px-4 py-5 text-center text-sm text-[#9f2951]">{errorMessage}</div>;
    }

    return (
        <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3 sm:gap-4">
            <KakaoMapControlPanel
                overlayModes={overlayModes}
                isDraggable={isDraggable}
                isZoomable={isZoomable}
                onOverlayToggle={handleOverlayToggle}
                onInteractionToggle={handleInteractionToggle}
            />

            <div className="relative h-full min-h-0 overflow-hidden rounded-2xl border border-[#d9d4ff] bg-white">
                {status === "ready" ? <KakaoMapFitBoundsButton onFitBounds={handleFitBounds} /> : null}
                {status === "loading" ? <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/75 text-sm font-semibold text-[#2b2373] backdrop-blur-sm">Loading Kakao Map...</div> : null}
                <div ref={mapContainerRef} className="h-full min-h-0 w-full" aria-label="Fullscreen Kakao Map" data-map-surface="fullscreen" />
            </div>
        </div>
    );
}