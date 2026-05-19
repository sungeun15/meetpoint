import { useEffect, useRef, useState } from "react";

import { loadKakaoMapSdk } from "@/lib/kakao/map-loader";
import { friendsBodyFont } from "../friends/fonts";
import { ModalShell } from "../shared/modal-shell";
import type { ResolvedLocation } from "./types";

type ChatLocationMapLayerProps = {
    title: string;
    description: string;
    location: ResolvedLocation;
    onClose: () => void;
};

export function ChatLocationMapLayer({
    title,
    description,
    location,
    onClose,
}: ChatLocationMapLayerProps) {
    const kakaoMapContainerRef = useRef<HTMLDivElement | null>(null);
    const [kakaoMapErrorMessage, setKakaoMapErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!kakaoMapContainerRef.current) {
            return;
        }

        let isDisposed = false;
        const container = kakaoMapContainerRef.current;
        container.innerHTML = "";
        setKakaoMapErrorMessage(null);

        loadKakaoMapSdk()
            .then((kakao) => {
                if (isDisposed || !kakaoMapContainerRef.current) {
                    return;
                }

                const position = new kakao.maps.LatLng(location.latitude, location.longitude);
                const map = new kakao.maps.Map(kakaoMapContainerRef.current, {
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
                    setKakaoMapErrorMessage(error instanceof Error ? error.message : "카카오맵을 불러오지 못했어요.");
                }
            });

        return () => {
            isDisposed = true;
            container.innerHTML = "";
        };
    }, [location.address, location.latitude, location.longitude]);

    return (
        <ModalShell
            title={`${title} 맵 확인`}
            description={description}
            onClose={onClose}
            panelClassName="mx-auto max-w-225"
            contentClassName="px-0 py-0"
            notice={(
                <div className={`${friendsBodyFont.className} text-[12px] leading-5 text-[#5f6782]`}>
                    {location.address}
                    <br />
                    위도 {location.latitude.toFixed(5)} · 경도 {location.longitude.toFixed(5)}
                </div>
            )}
        >
            {kakaoMapErrorMessage ? (
                <div className="flex h-[58vh] min-h-90 items-center justify-center bg-[#f8f6ff] px-4 text-center">
                    <p className={`${friendsBodyFont.className} text-[13px] text-[#6b7280]`}>
                        {kakaoMapErrorMessage}
                    </p>
                </div>
            ) : (
                <div
                    ref={kakaoMapContainerRef}
                    className="h-[58vh] min-h-90 w-full border-0"
                />
            )}
        </ModalShell>
    );
}