export type DaumPostcodeAddress = {
    address: string;
    roadAddress: string;
    jibunAddress: string;
    zonecode: string;
    userSelectedType?: "R" | "J";
    buildingName?: string;
    apartment?: "Y" | "N";
    bname?: string;
    sido?: string;
    sigungu?: string;
};

type DaumPostcodeInstance = {
    open: (options?: {
        q?: string;
        left?: string | number;
        top?: string | number;
        popupTitle?: string;
        popupKey?: string;
        autoClose?: boolean;
    }) => void;
    embed: (
        element: HTMLElement,
        options?: {
            q?: string;
            autoClose?: boolean;
        },
    ) => void;
};

type DaumPostcodeConstructor = new (options: {
    oncomplete: (data: DaumPostcodeAddress) => void;
    onclose?: (state: string) => void;
    onresize?: (size: { width: number; height: number }) => void;
    width?: string | number;
    height?: string | number;
    popupTitle?: string;
    animation?: boolean;
    hideMapBtn?: boolean;
    hideEngBtn?: boolean;
}) => DaumPostcodeInstance;

type DaumPostcodeApi = {
    Postcode: DaumPostcodeConstructor;
};

declare global {
    interface Window {
        daum?: DaumPostcodeApi;
    }
}

let daumPostcodePromise: Promise<DaumPostcodeApi> | null = null;

export async function loadDaumPostcodeApi() {
    if (typeof window === "undefined") {
        throw new Error("Daum postcode API can only be loaded in the browser.");
    }

    if (window.daum?.Postcode) {
        return window.daum;
    }

    if (!daumPostcodePromise) {
        daumPostcodePromise = new Promise<DaumPostcodeApi>((resolve, reject) => {
            const existingScript = document.querySelector<HTMLScriptElement>("script[data-daum-postcode='true']");

            const handleLoad = () => {
                if (!window.daum?.Postcode) {
                    reject(new Error("Daum postcode API did not initialize correctly."));
                    return;
                }

                resolve(window.daum);
            };

            const handleError = () => {
                reject(new Error("Failed to load Daum postcode API."));
            };

            if (existingScript) {
                existingScript.addEventListener("load", handleLoad, { once: true });
                existingScript.addEventListener("error", handleError, { once: true });
                return;
            }

            const script = document.createElement("script");
            script.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
            script.async = true;
            script.setAttribute("data-daum-postcode", "true");
            script.addEventListener("load", handleLoad, { once: true });
            script.addEventListener("error", handleError, { once: true });
            document.head.appendChild(script);
        }).catch((error) => {
            daumPostcodePromise = null;
            throw error;
        });
    }

    return daumPostcodePromise;
}