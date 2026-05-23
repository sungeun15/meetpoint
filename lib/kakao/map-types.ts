export type KakaoLatLng = {
    // 현재 좌표의 위도를 반환합니다.
    getLat: () => number;
    // 현재 좌표의 경도를 반환합니다.
    getLng: () => number;
};

type KakaoLatLngBounds = {
    // bounds 범위에 좌표를 추가합니다.
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
    // 마커를 특정 지도에 붙이거나 제거합니다.
    setMap: (map: KakaoMapInstance | null) => void;
    // 마커 좌표를 변경합니다.
    setPosition: (position: KakaoLatLng) => void;
};

export type KakaoPolylineInstance = {
    // 폴리라인을 특정 지도에 붙이거나 제거합니다.
    setMap: (map: KakaoMapInstance | null) => void;
};

type KakaoMouseEvent = {
    // 클릭 등 이벤트가 발생한 지도 좌표입니다.
    latLng: KakaoLatLng;
};

type KakaoAddressResult = {
    address?: {
        // 지번 주소 문자열입니다.
        address_name: string;
    };
    road_address?: {
        // 도로명 주소 문자열입니다.
        address_name: string;
    };
};

type KakaoInfoWindowInstance = {
    // 인포윈도우를 지도/마커에 엽니다.
    open: (map: KakaoMapInstance, marker?: KakaoMarkerInstance) => void;
    // 인포윈도우를 닫습니다.
    close: () => void;
    // 인포윈도우 내용을 교체합니다.
    setContent: (content: string | Node) => void;
};

type KakaoGeocoderResult = {
    // Kakao가 반환한 대표 주소명입니다.
    address_name: string;
    // 경도 문자열입니다.
    x: string;
    // 위도 문자열입니다.
    y: string;
    address?: {
        // 지번 주소 정보입니다.
        address_name: string;
    };
    road_address?: {
        // 도로명 주소 정보입니다.
        address_name: string;
    };
};

export type KakaoMapInstance = {
    // 숨김 처리 뒤 지도 크기 재계산이 필요할 때 호출합니다.
    relayout: () => void;
    // 지도의 중심 좌표를 이동합니다.
    setCenter: (position: KakaoLatLng) => void;
    setBounds: (
        // 지도에 맞춰 보여줄 전체 범위입니다.
        bounds: KakaoLatLngBounds,
        paddingTop?: number,
        paddingRight?: number,
        paddingBottom?: number,
        paddingLeft?: number,
    ) => void;
    // 확대 레벨을 변경합니다.
    setLevel: (level: number, options?: { animate?: boolean | { duration: number }; anchor?: KakaoLatLng }) => void;
    // 현재 확대 레벨을 읽습니다.
    getLevel: () => number;
    // 기본/위성 등 지도 타입을 바꿉니다.
    setMapTypeId: (mapTypeId: KakaoMapTypeId) => void;
    getMapTypeId: () => KakaoMapTypeId;
    // 기본 컨트롤을 추가합니다.
    addControl: (control: KakaoMapControl, position: KakaoControlPosition) => void;
    removeControl: (control: KakaoMapControl) => void;
    // 교통/자전거 같은 오버레이를 켭니다.
    addOverlayMapTypeId: (mapTypeId: KakaoMapTypeId) => void;
    removeOverlayMapTypeId: (mapTypeId: KakaoMapTypeId) => void;
    setMinLevel: (minLevel: number) => void;
    setMaxLevel: (maxLevel: number) => void;
    // 드래그 가능 여부를 제어합니다.
    setDraggable: (draggable: boolean) => void;
    getDraggable: () => boolean;
    // 마우스 휠 줌 가능 여부를 제어합니다.
    setZoomable: (zoomable: boolean) => void;
    getZoomable: () => boolean;
    // 키보드 단축키 사용 여부를 제어합니다.
    setKeyboardShortcuts: (active: boolean) => void;
    getKeyboardShortcuts: () => boolean;
    setCopyrightPosition: (position: KakaoCopyrightPosition, reversed?: boolean) => void;
    // 지도 위 마우스 커서를 바꿉니다.
    setCursor: (style: string) => void;
};

export type KakaoMapSdk = {
    maps: {
        // SDK 내부 모듈 로딩 완료 후 콜백을 실행합니다.
        load: (callback: () => void) => void;
        // 위도/경도 좌표 객체를 생성합니다.
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
            // 일반 지도입니다.
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
            // 지도 객체 이벤트 리스너를 등록합니다.
            addListener: (target: unknown, type: string, handler: (mouseEvent: KakaoMouseEvent) => void) => void;
        };
        Map: new (
            container: HTMLElement,
            options: {
                // 초기 중심 좌표입니다.
                center: KakaoLatLng;
                // 초기 확대 레벨입니다.
                level: number;
                mapTypeId?: KakaoMapTypeId;
                draggable?: boolean;
                scrollwheel?: boolean;
                keyboardShortcuts?: boolean;
                tileAnimation?: boolean;
            },
        ) => KakaoMapInstance;
        Marker: new (options: {
            // 마커를 표시할 지도 인스턴스입니다.
            map: KakaoMapInstance;
            // 마커 위치입니다.
            position: KakaoLatLng;
            title?: string;
            image?: KakaoMarkerImage;
            zIndex?: number;
        }) => KakaoMarkerInstance;
        Polyline: new (options: {
            map?: KakaoMapInstance;
            // 연결할 경로 좌표 배열입니다.
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
                    // 검색할 주소 문자열입니다.
                    addr: string,
                    callback: (result: KakaoGeocoderResult[], status: string) => void,
                    options?: {
                        page?: number;
                        size?: number;
                        analyze_type?: string;
                    },
                ) => void;
                coord2Address: (
                    // 경도입니다.
                    x: number,
                    // 위도입니다.
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