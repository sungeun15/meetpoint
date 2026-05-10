"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { KakaoMapInstance } from "@/lib/kakao/map-loader";
import { loadKakaoMapSdk } from "@/lib/kakao/map-loader";
import { createPersonMarkerImage } from "./kakao-marker-icons";

type OverlayMode = "TRAFFIC" | "BICYCLE" | "TERRAIN";

type KakaoMapPreviewProps = {
    placeLabels?: string[];
};

type SampleMarker = {
    id: string;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    markerType?: "person" | "place" | "midpoint";
};

const defaultPlaceLabels = ["추천 카페", "추천 식당", "추천 놀거리"];

const myLocationInfo = {
    label: "내 위치 · 광화문",
    address: "서울 종로구 세종대로 지하 172",
    latitude: 37.57162,
    longitude: 126.97688,
};

const friendLocationInfo = {
    label: "친구 위치 · 청와대",
    address: "서울특별시 종로구 청와대로 1",
    latitude: 37.58601,
    longitude: 126.97488,
};

const midpointInfo = {
    latitude: 37.57881,
    longitude: 126.97588,
};

const overlayOptionLabels: Record<OverlayMode, string> = {
    TRAFFIC: "교통",
    BICYCLE: "자전거",
    TERRAIN: "지형",
};

function createMarkerImage(
    kakao: Awaited<ReturnType<typeof loadKakaoMapSdk>>,
    markerType: SampleMarker["markerType"],
    markerId: string,
) {
    if (markerType !== "person") {
        return undefined;
    }

    return createPersonMarkerImage(kakao, markerId === "me" ? "me" : "friend");
}

function buildSampleMarkers(placeLabels: string[]): SampleMarker[] {
    const resolvedPlaceLabels = [0, 1, 2].map((index) => placeLabels[index] ?? defaultPlaceLabels[index]);

    return [
        {
            id: "me",
            title: `${myLocationInfo.label} · ${myLocationInfo.address}`,
            description: "현재 사용자의 더미 위치예요. 광화문역 기준으로 추천 계산에 사용됩니다.",
            latitude: myLocationInfo.latitude,
            longitude: myLocationInfo.longitude,
            markerType: "person",
        },
        {
            id: "friend",
            title: `${friendLocationInfo.label} · ${friendLocationInfo.address}`,
            description: "친구의 더미 위치예요. 청와대 인근 기준으로 추천 계산에 사용됩니다.",
            latitude: friendLocationInfo.latitude,
            longitude: friendLocationInfo.longitude,
            markerType: "person",
        },
        {
            id: "midpoint",
            title: "중심점 · 경복궁역 인근",
            description: "두 사람의 이동 균형을 기준으로 계산한 중간 지점입니다.",
            latitude: midpointInfo.latitude,
            longitude: midpointInfo.longitude,
            markerType: "midpoint",
        },
        {
            id: "place-1",
            title: resolvedPlaceLabels[0],
            description: "추천 1순위 장소예요. 중심점과 가장 가까운 후보입니다.",
            latitude: 37.57765,
            longitude: 126.97691,
            markerType: "place",
        },
        {
            id: "place-2",
            title: resolvedPlaceLabels[1],
            description: "추천 2순위 장소예요. 이동 거리 균형이 안정적인 후보입니다.",
            latitude: 37.57942,
            longitude: 126.97364,
            markerType: "place",
        },
        {
            id: "place-3",
            title: resolvedPlaceLabels[2],
            description: "추천 3순위 장소예요. 대체 선택지로 보기 좋은 후보입니다.",
            latitude: 37.57694,
            longitude: 126.97958,
            markerType: "place",
        },
    ];
}

function buildInfoWindowContent(marker: SampleMarker) {
    const toneClassName = marker.markerType === "person"
        ? "background:linear-gradient(135deg,#eef2ff 0%,#fdf2f8 100%);color:#312e81;"
        : marker.markerType === "midpoint"
            ? "background:linear-gradient(135deg,#ecfeff 0%,#eef2ff 100%);color:#0f172a;"
            : "background:linear-gradient(135deg,#fff7ed 0%,#fef2f2 100%);color:#7c2d12;";

    return `
        <div style="min-width:220px;max-width:260px;padding:14px 14px 12px;border-radius:18px;border:1px solid rgba(167,139,250,0.22);box-shadow:0 14px 34px rgba(43,35,115,0.16);${toneClassName}">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                <strong style="font-size:14px;line-height:1.35;">${marker.title}</strong>
                <span style="display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:rgba(255,255,255,0.78);padding:4px 8px;font-size:11px;font-weight:700;">${marker.markerType === "person" ? "인물" : marker.markerType === "midpoint" ? "중심점" : "장소"}</span>
            </div>
            <p style="margin:8px 0 0;font-size:12px;line-height:1.55;color:rgba(15,23,42,0.76);">${marker.description}</p>
        </div>
    `;
}

function buildMarkerBounds(kakao: Awaited<ReturnType<typeof loadKakaoMapSdk>>, sampleMarkers: SampleMarker[]) {
    const bounds = new kakao.maps.LatLngBounds();

    sampleMarkers.forEach((marker) => {
        bounds.extend(new kakao.maps.LatLng(marker.latitude, marker.longitude));
    });

    return bounds;
}

export function KakaoMapPreview({ placeLabels = [] }: KakaoMapPreviewProps) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<KakaoMapInstance | null>(null);
    const kakaoRef = useRef<Awaited<ReturnType<typeof loadKakaoMapSdk>> | null>(null);
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [overlayModes, setOverlayModes] = useState<Record<OverlayMode, boolean>>({
        TRAFFIC: false,
        BICYCLE: false,
        TERRAIN: false,
    });
    const [isDraggable, setIsDraggable] = useState(true);
    const [isZoomable, setIsZoomable] = useState(true);
    const sampleMarkers = useMemo(() => buildSampleMarkers(placeLabels), [placeLabels]);

    function syncMapState() {
        const map = mapRef.current;

        if (!map) {
            return;
        }

        setIsDraggable(map.getDraggable());
        setIsZoomable(map.getZoomable());
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
                const kakao = await loadKakaoMapSdk();

                if (!isMounted || !mapContainerRef.current) {
                    return;
                }

                const centerMarker = sampleMarkers.find((marker) => marker.id === "midpoint") ?? sampleMarkers[0];
                const center = new kakao.maps.LatLng(centerMarker.latitude, centerMarker.longitude);
                const map = new kakao.maps.Map(mapContainerRef.current, {
                    center,
                    level: 5,
                    mapTypeId: kakao.maps.MapTypeId.ROADMAP,
                    draggable: true,
                    scrollwheel: true,
                    keyboardShortcuts: true,
                    tileAnimation: true,
                });

                mapRef.current = map;
                kakaoRef.current = kakao;
                map.setMinLevel(2);
                map.setMaxLevel(9);
                map.setKeyboardShortcuts(true);
                map.setCopyrightPosition(kakao.maps.CopyrightPosition.BOTTOMRIGHT, true);
                map.setCursor("grab");

                const mapTypeControl = new kakao.maps.MapTypeControl();
                const zoomControl = new kakao.maps.ZoomControl();
                map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);
                map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
                const infoWindow = new kakao.maps.InfoWindow({ removable: true, zIndex: 5 });

                sampleMarkers.forEach((marker) => {
                    const position = new kakao.maps.LatLng(marker.latitude, marker.longitude);
                    const image = createMarkerImage(kakao, marker.markerType, marker.id);

                    const markerInstance = new kakao.maps.Marker({
                        map,
                        position,
                        title: marker.title,
                        image,
                    });

                    kakao.maps.event.addListener(markerInstance, "click", () => {
                        infoWindow.setContent(buildInfoWindowContent(marker));
                        infoWindow.open(map, markerInstance);
                    });
                });

                const bounds = buildMarkerBounds(kakao, sampleMarkers);
                map.setBounds(bounds, 56, 40, 40, 40);

                kakao.maps.event.addListener(map, "idle", syncMapState);
                kakao.maps.event.addListener(map, "click", () => {
                    infoWindow.close();
                });

                map.relayout();
                map.setCenter(center);

                resizeObserver = new ResizeObserver(() => {
                    map.relayout();
                    map.setBounds(bounds, 56, 40, 40, 40);
                });
                resizeObserver.observe(mapContainerRef.current);
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
    }, [sampleMarkers]);

    if (status === "error") {
        return (
            <div className="flex min-h-72 items-center justify-center rounded-2xl border border-[#f1c6d6] bg-[#fff7fa] px-4 py-5 text-center sm:min-h-80 lg:min-h-88">
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
                <div className="rounded-[22px] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(244,240,255,0.92)_100%)] p-3 shadow-[0px_18px_36px_rgba(43,35,115,0.14)] backdrop-blur-md sm:p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c6ae6]">Overlay & Interaction</p>
                            <p className="mt-1 text-[14px] font-semibold text-[#201a53]">지도 겹침 정보와 탐색 방식을 빠르게 바꿀 수 있어요.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#5f6782] shadow-[0px_8px_18px_rgba(43,35,115,0.08)]">
                                교통/자전거/지형 오버레이
                            </span>
                            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#5f6782] shadow-[0px_8px_18px_rgba(43,35,115,0.08)]">
                                드래그/휠 줌 제어
                            </span>
                        </div>
                    </div>

                    <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                        <div className="rounded-2xl border border-white/70 bg-white/88 p-3 shadow-[0px_12px_28px_rgba(43,35,115,0.08)]">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c6ae6]">Overlay</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {(Object.keys(overlayOptionLabels) as OverlayMode[]).map((overlayMode) => (
                                    <button
                                        key={overlayMode}
                                        type="button"
                                        onClick={() => handleOverlayToggle(overlayMode)}
                                        className={`rounded-xl px-3 py-1.5 text-[12px] font-semibold transition ${overlayModes[overlayMode] ? "bg-[#201a53] text-white shadow-[0px_10px_20px_rgba(43,35,115,0.22)]" : "border border-[#d9d4ff] bg-[#faf8ff] text-[#2b2373] hover:bg-[#f3efff]"}`}
                                    >
                                        {overlayOptionLabels[overlayMode]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/70 bg-white/88 p-3 shadow-[0px_12px_28px_rgba(43,35,115,0.08)]">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c6ae6]">Interaction</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleInteractionToggle("drag")}
                                    className={`rounded-xl px-3 py-1.5 text-[12px] font-semibold transition ${isDraggable ? "bg-[#eff6ff] text-[#1d4ed8]" : "border border-[#d9d4ff] bg-white text-[#2b2373]"}`}
                                >
                                    드래그 {isDraggable ? "ON" : "OFF"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleInteractionToggle("zoom")}
                                    className={`rounded-xl px-3 py-1.5 text-[12px] font-semibold transition ${isZoomable ? "bg-[#eff6ff] text-[#1d4ed8]" : "border border-[#d9d4ff] bg-white text-[#2b2373]"}`}
                                >
                                    휠 줌 {isZoomable ? "ON" : "OFF"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            <div className="relative overflow-hidden rounded-2xl border border-[#d9d4ff] bg-white">
                {status === "loading" ? (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/75 text-center backdrop-blur-sm">
                        <div>
                            <p className="text-sm font-semibold text-[#2b2373]">Loading Kakao Map...</p>
                            <p className="mt-2 text-xs leading-5 text-[#6b7280]">더미 좌표 기준 추천 지도를 준비 중입니다.</p>
                        </div>
                    </div>
                ) : null}

                <div ref={mapContainerRef} className="min-h-72 w-full sm:min-h-80 lg:min-h-88" aria-label="Kakao Map preview" />
            </div>
        </div>
    );
}