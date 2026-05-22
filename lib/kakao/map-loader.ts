import type { KakaoMapSdk } from "./map-types";

export type {
    KakaoLatLng,
    KakaoMapInstance,
    KakaoMapSdk,
    KakaoMarkerInstance,
    KakaoPolylineInstance,
} from "./map-types";

let kakaoMapPromise: Promise<KakaoMapSdk> | null = null;

function resolveLoadedSdk(resolve: (value: KakaoMapSdk) => void, reject: (reason?: unknown) => void) {
    // 스크립트가 로드된 뒤에도 window.kakao.maps 가 없으면 초기화 실패로 간주합니다.
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
        // 이미 SDK가 올라와 있으면 기존 인스턴스를 재사용합니다.
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
                // 중복 script 태그를 만들지 않고 기존 로딩 이벤트에만 합류합니다.
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
            // 로딩 실패 후에는 다음 시도에서 다시 script 로딩을 시작할 수 있게 초기화합니다.
            kakaoMapPromise = null;
            throw error;
        });
    }

    return kakaoMapPromise;
}