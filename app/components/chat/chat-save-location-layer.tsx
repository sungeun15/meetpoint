"use client";

import { useState } from "react";

import { ModalShell } from "../shared/modal-shell";
import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../friends/fonts";

type ChatSaveLocationLayerProps = {
    title: string;
    sourceLabel: string;
    previewValue: string;
    onClose: () => void;
    onConfirm: (nextTitle: string) => void;
};

export function ChatSaveLocationLayer({
    title,
    sourceLabel,
    previewValue,
    onClose,
    onConfirm,
}: ChatSaveLocationLayerProps) {
    const [draftTitle, setDraftTitle] = useState("");

    return (
        <ModalShell
            title={title}
            description="저장할 제목을 입력하면 저장 위치 목록에 추가돼요."
            onClose={onClose}
            panelClassName="max-w-2xl"
            contentClassName="space-y-4"
        >
            <div className="rounded-2xl border border-[#ece9ff] bg-[#faf8ff] px-4 py-4">
                <p className={`${friendsBodyFont.className} text-[11px] uppercase tracking-[0.16em] text-[#8a7be5]`}>
                    {sourceLabel}
                </p>
                <p className={`${friendsDisplayFont.className} mt-2 break-keep text-[14px] leading-[1.6] text-[#111827] sm:text-[15px]`}>
                    {previewValue}
                </p>
            </div>

            <label className="block">
                <span className={`${friendsBodyFont.className} text-[12px] text-[#6b7280] sm:text-[13px]`}>
                    저장 제목
                </span>
                <input
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                    placeholder="예: 집, 학교 정문, 친구 출발 위치"
                    className={`${friendsBodyFont.className} mt-2 h-12 w-full rounded-xl border border-[#ddd7ff] bg-white px-4 text-[14px] text-[#111827] outline-none transition focus:border-[#6c5ce7]`}
                />
            </label>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={onClose}
                    className={`${friendsBodyFont.className} min-h-11 flex-1 rounded-xl border border-[#ddd7ff] px-4 py-2 text-[14px] text-[#6b7280] transition-colors hover:bg-[#f8f6ff]`}
                >
                    취소
                </button>
                <button
                    type="button"
                    onClick={() => onConfirm(draftTitle)}
                    disabled={!draftTitle.trim()}
                    className={`${friendsHeadingFont.className} min-h-11 flex-1 rounded-xl bg-[#6c5ce7] px-4 py-2 text-[14px] font-bold text-white transition-colors hover:bg-[#5b4ad2] disabled:cursor-not-allowed disabled:opacity-60`}
                >
                    저장하기
                </button>
            </div>
        </ModalShell>
    );
}