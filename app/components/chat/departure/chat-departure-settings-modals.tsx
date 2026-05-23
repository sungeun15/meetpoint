import type { RefObject } from "react";

import { friendsBodyFont, friendsHeadingFont } from "../../friends/fonts";
import { ModalShell } from "../../shared/modal-shell";

import type { SavedDeparture } from "../types";

type PostcodeSearchModalProps = {
    // 모달 제목에 쓸 파티 라벨입니다.
    partyLabel: string;
    // 모달을 닫습니다.
    onClose: () => void;
    // 다음 주소 검색을 붙일 컨테이너 ref입니다.
    containerRef: RefObject<HTMLDivElement | null>;
};

type DeleteConfirmationModalProps = {
    // 단건 삭제인지 전체 삭제인지 구분합니다.
    kind: "single" | "all";
    // 단건 삭제 시 표시할 저장 위치 이름입니다.
    departureLabel?: string;
    // 전체 삭제 시 표시할 소유자 라벨입니다.
    ownerLabel?: string;
    // 모달을 닫습니다.
    onClose: () => void;
    // 삭제를 확정합니다.
    onConfirm: () => void;
};

type SavedDepartureMapModalProps = {
    // 모달 제목으로 쓸 문구입니다.
    title: string;
    // 지도에 표시할 저장 출발지 원본 데이터입니다.
    departure: SavedDeparture;
    // 화면 상단에 노출할 해석된 주소입니다.
    resolvedAddress: string;
    // 화면 상단에 노출할 저장 시각 라벨입니다.
    timeLabel: string;
    // 지도를 띄우지 못했을 때 보여줄 오류 메시지입니다.
    errorMessage: string | null;
    // 모달을 닫습니다.
    onClose: () => void;
    // 지도를 붙일 컨테이너 ref입니다.
    containerRef: RefObject<HTMLDivElement | null>;
};

export function PostcodeSearchModal({
    partyLabel,
    onClose,
    containerRef,
}: PostcodeSearchModalProps) {
    return (
        <ModalShell
            title={`${partyLabel} 출발 위치 검색`}
            description="선택한 주소를 해당 주소 칸에 바로 채워 넣어요."
            onClose={onClose}
            panelClassName="max-w-180"
            contentClassName="px-3 py-3 sm:px-5 sm:py-5"
        >
            <div
                ref={containerRef}
                className="h-[70vh] min-h-105 w-full overflow-hidden rounded-[18px] border border-[#ece9ff] bg-white sm:max-h-180"
            />
        </ModalShell>
    );
}

export function DeleteConfirmationModal({
    kind,
    departureLabel,
    ownerLabel,
    onClose,
    onConfirm,
}: DeleteConfirmationModalProps) {
    return (
        <ModalShell
            title={kind === "single" ? "저장 위치 삭제" : "저장 위치 전체 삭제"}
            description={kind === "single"
                ? `"${departureLabel}" 저장 위치를 삭제할까요?`
                : `${ownerLabel} 저장 위치를 모두 삭제할까요?`}
            onClose={onClose}
            panelClassName="max-w-xl"
            contentClassName="px-4 py-4 sm:px-5 sm:py-5"
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={onClose}
                    className={`${friendsHeadingFont.className} inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#ddd7ff] px-4 py-2 text-[14px] text-[#5b43d6] transition-colors hover:bg-[#f5f1ff] sm:min-w-28`}
                >
                    취소
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    className={`${friendsHeadingFont.className} inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#fecdd3] bg-[#fff1f2] px-4 py-2 text-[14px] text-[#be123c] transition-colors hover:bg-[#ffe4e6] sm:min-w-28`}
                >
                    삭제하기
                </button>
            </div>
        </ModalShell>
    );
}

export function SavedDepartureMapModal({
    title,
    departure,
    resolvedAddress,
    timeLabel,
    errorMessage,
    onClose,
    containerRef,
}: SavedDepartureMapModalProps) {
    return (
        <ModalShell
            title={`${title} 맵 확인`}
            description={`${departure.label} 위치를 확인합니다.`}
            onClose={onClose}
            panelClassName="mx-auto max-w-225"
            contentClassName="px-0 py-0"
            notice={(
                <div className={`${friendsBodyFont.className} text-[12px] leading-5 text-[#5f6782]`}>
                    {resolvedAddress}
                    <br />
                    {timeLabel}
                </div>
            )}
        >
            {errorMessage ? (
                <div className="flex h-[58vh] min-h-90 items-center justify-center bg-[#f8f6ff] px-4 text-center">
                    <p className={`${friendsBodyFont.className} text-[13px] text-[#6b7280]`}>
                        {errorMessage}
                    </p>
                </div>
            ) : (
                <div
                    ref={containerRef}
                    className="h-[58vh] min-h-90 w-full border-0"
                />
            )}
        </ModalShell>
    );
}