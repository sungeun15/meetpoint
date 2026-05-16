import { ModalShell } from "../shared/modal-shell";
import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "./fonts";
import type { FriendItem } from "./types";

type FriendAddConfirmLayerProps = {
    friend: FriendItem;
    isSubmitting: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

export function FriendAddConfirmLayer({
    friend,
    isSubmitting,
    onClose,
    onConfirm,
}: FriendAddConfirmLayerProps) {
    return (
        <ModalShell
            title="친구 요청 보내기"
            onClose={onClose}
            panelClassName="max-w-lg"
            contentClassName="space-y-4"
        >
            <div className="rounded-2xl border border-[#ece9ff] bg-[#faf8ff] px-4 py-4">
                <p className={`${friendsBodyFont.className} text-[11px] uppercase tracking-[0.16em] text-[#8a7be5]`}>
                    등록 대상
                </p>
                <p className={`${friendsHeadingFont.className} mt-2 text-[20px] text-[#111827] sm:text-[22px]`}>
                    {friend.nickname}
                </p>
                <p className={`${friendsDisplayFont.className} mt-2 text-[14px] leading-[1.6] text-[#4f5875]`}>
                    이 사용자에게 친구 요청을 보내시겠어요?
                </p>
                <p className={`${friendsBodyFont.className} mt-2 text-[13px] leading-[1.65] text-[#6b7280]`}>
                    {friend.locationHint}
                </p>
            </div>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className={`${friendsBodyFont.className} min-h-11 flex-1 rounded-xl border border-[#ddd7ff] px-4 py-2 text-[14px] text-[#6b7280] transition-colors hover:bg-[#f8f6ff] disabled:cursor-not-allowed disabled:opacity-60`}
                >
                    취소
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isSubmitting}
                    className={`${friendsHeadingFont.className} min-h-11 flex-1 rounded-xl bg-[#6c5ce7] px-4 py-2 text-[14px] font-bold text-white transition-colors hover:bg-[#5b4ad2] disabled:cursor-not-allowed disabled:opacity-60`}
                >
                    {isSubmitting ? "요청 전송 중..." : "친구 요청 보내기"}
                </button>
            </div>
        </ModalShell>
    );
}