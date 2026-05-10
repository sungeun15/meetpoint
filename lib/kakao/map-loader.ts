export type KakaoLatLng = {
    getLat: () => number;
    getLng: () => number;
};
type KakaoLatLngBounds = {
    extend: (position: KakaoLatLng) => void;
};
type KakaoSize = unknown;
type KakaoPoint = unknown;
type KakaoMarkerImage = unknown;
type KakaoMapControl = unknown;
type KakaoMapTypeId = unknown;
type KakaoControlPosition = unknown;
type KakaoCopyrightPosition = unknown;
export type KakaoMarkerInstance = {
    setMap: (map: KakaoMapInstance | null) => void;
    setPosition: (position: KakaoLatLng) => void;
};
type KakaoMouseEvent = {
    latLng: KakaoLatLng;
};
type KakaoAddressResult = {
    address?: {
        address_name: string;
    };
    road_address?: {
        address_name: string;
    };
};
type KakaoInfoWindowInstance = {
    open: (map: KakaoMapInstance, marker?: KakaoMarkerInstance) => void;
    close: () => void;
    setContent: (content: string | Node) => void;
};
type KakaoGeocoderResult = {
    address_name: string;
    x: string;
    y: string;
    address?: {
        address_name: string;
    };
    road_address?: {
        address_name: string;
    };
};

export type KakaoMapInstance = {
    relayout: () => void;
    setCenter: (position: KakaoLatLng) => void;
    setBounds: (
        bounds: KakaoLatLngBounds,
        paddingTop?: number,
        paddingRight?: number,
        paddingBottom?: number,
        paddingLeft?: number,
    ) => void;
    setLevel: (level: number, options?: { animate?: boolean | { duration: number }; anchor?: KakaoLatLng }) => void;
    getLevel: () => number;
    setMapTypeId: (mapTypeId: KakaoMapTypeId) => void;
    getMapTypeId: () => KakaoMapTypeId;
    addControl: (control: KakaoMapControl, position: KakaoControlPosition) => void;
    removeControl: (control: KakaoMapControl) => void;
    addOverlayMapTypeId: (mapTypeId: KakaoMapTypeId) => void;
    removeOverlayMapTypeId: (mapTypeId: KakaoMapTypeId) => void;
    setMinLevel: (minLevel: number) => void;
    setMaxLevel: (maxLevel: number) => void;
    setDraggable: (draggable: boolean) => void;
    getDraggable: () => boolean;
    setZoomable: (zoomable: boolean) => void;
    getZoomable: () => boolean;
    setKeyboardShortcuts: (active: boolean) => void;
    getKeyboardShortcuts: () => boolean;
    setCopyrightPosition: (position: KakaoCopyrightPosition, reversed?: boolean) => void;
    setCursor: (style: string) => void;
};

type KakaoMapSdk = {
    maps: {
        load: (callback: () => void) => void;
        LatLng: new (latitude: number, longitude: number) => KakaoLatLng;
        LatLngBounds: new () => KakaoLatLngBounds;
        Size: new (width: number, height: number) => KakaoSize;
        Point: new (x: number, y: number) => KakaoPoint;
        MarkerImage: new (
            src: string,
            size: KakaoSize,
            options?: { offset?: KakaoPoint },
        ) => KakaoMarkerImage;
        MapTypeControl: new () => KakaoMapControl;
        ZoomControl: new () => KakaoMapControl;
        MapTypeId: {
            ROADMAP: KakaoMapTypeId;
            SKYVIEW: KakaoMapTypeId;
            HYBRID: KakaoMapTypeId;
            TRAFFIC: KakaoMapTypeId;
            TERRAIN: KakaoMapTypeId;
            BICYCLE: KakaoMapTypeId;
        };
        ControlPosition: {
            TOPRIGHT: KakaoControlPosition;
            RIGHT: KakaoControlPosition;
            TOPLEFT: KakaoControlPosition;
        };
        CopyrightPosition: {
            BOTTOMRIGHT: KakaoCopyrightPosition;
            BOTTOMLEFT: KakaoCopyrightPosition;
        };
        event: {
            addListener: (target: unknown, type: string, handler: (mouseEvent: KakaoMouseEvent) => void) => void;
        };
        Map: new (
            container: HTMLElement,
            options: {
                center: KakaoLatLng;
                level: number;
                mapTypeId?: KakaoMapTypeId;
                draggable?: boolean;
                scrollwheel?: boolean;
                keyboardShortcuts?: boolean;
                tileAnimation?: boolean;
            },
        ) => KakaoMapInstance;
        Marker: new (options: {
            map: KakaoMapInstance;
            position: KakaoLatLng;
            title?: string;
            image?: KakaoMarkerImage;
        }) => KakaoMarkerInstance;
        InfoWindow: new (options: {
            content?: string | Node;
            removable?: boolean;
            zIndex?: number;
            position?: KakaoLatLng;
            disableAutoPan?: boolean;
        }) => KakaoInfoWindowInstance;
        services: {
            Status: {
                OK: string;
                ZERO_RESULT: string;
                ERROR: string;
            };
            AnalyzeType: {
                EXACT: string;
                SIMILAR: string;
            };
            Geocoder: new () => {
                addressSearch: (
                    addr: string,
                    callback: (result: KakaoGeocoderResult[], status: string) => void,
                    options?: {
                        page?: number;
                        size?: number;
                        analyze_type?: string;
                    },
                ) => void;
                coord2Address: (
                    x: number,
                    y: number,
                    callback: (result: KakaoAddressResult[], status: string) => void,
                ) => void;
            };
        };
    };
};

declare global {
    interface Window {
        kakao?: KakaoMapSdk;
    }
}

let kakaoMapPromise: Promise<KakaoMapSdk> | null = null;

function resolveLoadedSdk(resolve: (value: KakaoMapSdk) => void, reject: (reason?: unknown) => void) {
    const kakao = window.kakao;

    if (!kakao?.maps) {
        reject(new Error("Kakao Map SDK did not initialize correctly."));
        return;
    }

    kakao.maps.load(() => {
        resolve(kakao);
    });
}

export async function loadKakaoMapSdk() {
    if (typeof window === "undefined") {
        throw new Error("Kakao Map SDK can only be loaded in the browser.");
    }

    const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY;

    if (!appKey) {
        throw new Error("NEXT_PUBLIC_KAKAO_MAP_APP_KEY is missing.");
    }

    if (window.kakao?.maps) {
        return new Promise<KakaoMapSdk>((resolve, reject) => {
            resolveLoadedSdk(resolve, reject);
        });
    }

    if (!kakaoMapPromise) {
        kakaoMapPromise = new Promise<KakaoMapSdk>((resolve, reject) => {
            const existingScript = document.querySelector<HTMLScriptElement>("script[data-kakao-map-sdk='true']");

            const handleLoad = () => {
                resolveLoadedSdk(resolve, reject);
            };

            const handleError = () => {
                reject(new Error("Failed to load Kakao Map SDK."));
            };

            if (existingScript) {
                existingScript.addEventListener("load", handleLoad, { once: true });
                existingScript.addEventListener("error", handleError, { once: true });
                return;
            }

            const script = document.createElement("script");
            script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;
            script.async = true;
            script.setAttribute("data-kakao-map-sdk", "true");
            script.addEventListener("load", handleLoad, { once: true });
            script.addEventListener("error", handleError, { once: true });
            document.head.appendChild(script);
        }).catch((error) => {
            kakaoMapPromise = null;
            throw error;
        });
    }

    return kakaoMapPromise;
}