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
type KakaoStrokeStyle =
    | "solid"
    | "shortdash"
    | "shortdot"
    | "shortdashdot"
    | "shortdashdotdot"
    | "dot"
    | "dash"
    | "longdash"
    | "dashdot"
    | "longdashdot"
    | "longdashdotdot";

export type KakaoMarkerInstance = {
    setMap: (map: KakaoMapInstance | null) => void;
    setPosition: (position: KakaoLatLng) => void;
};

export type KakaoPolylineInstance = {
    setMap: (map: KakaoMapInstance | null) => void;
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

export type KakaoMapSdk = {
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
        Polyline: new (options: {
            map?: KakaoMapInstance;
            path: KakaoLatLng[];
            strokeWeight?: number;
            strokeColor?: string;
            strokeOpacity?: number;
            strokeStyle?: KakaoStrokeStyle;
            zIndex?: number;
            endArrow?: boolean;
        }) => KakaoPolylineInstance;
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