import type { ReactNode } from "react";

import { friendsBodyFont, friendsHeadingFont } from "../friends/fonts";
import { mergeClassNames } from "./class-names";

type ChatModalShellProps = {
    title: string;
    description: string;
    children: ReactNode;
    onClose: () => void;
    notice?: ReactNode;
    overlayClassName?: string;
    panelClassName?: string;
    contentClassName?: string;
};

export function ChatModalShell({
    title,
    description,
    children,
    onClose,
    notice,
    overlayClassName,
    panelClassName,
    contentClassName,
}: ChatModalShellProps) {
    return (
        <div className={mergeClassNames("fixed inset-0 z-80 flex items-end bg-[#0f1020]/55 px-3 py-3 sm:items-center sm:justify-center sm:px-6 sm:py-6", overlayClassName)}>
            <div className={mergeClassNames("w-full overflow-hidden rounded-3xl bg-white shadow-[0px_20px_60px_rgba(15,16,32,0.28)]", panelClassName)}>
                <div className="flex items-center justify-between border-b border-[#ece9ff] px-4 py-4 sm:px-5">
                    <div>
                        <p className={`${friendsHeadingFont.className} text-[17px] text-[#111827] sm:text-[19px]`}>
                            {title}
                        </p>
                        <p className={`${friendsBodyFont.className} mt-1 text-[12px] text-[#6b7280] sm:text-[13px]`}>
                            {description}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`${friendsBodyFont.className} rounded-full border border-[#ddd7ff] px-3 py-1.5 text-[12px] text-[#5b43d6] transition-colors hover:bg-[#f5f1ff] sm:text-[13px]`}
                    >
                        닫기
                    </button>
                </div>

                {notice ? (
                    <div className="bg-[#faf8ff] px-4 py-3 sm:px-5">
                        {notice}
                    </div>
                ) : null}

                <div className={mergeClassNames("px-4 py-4 sm:px-5 sm:py-5", contentClassName)}>
                    {children}
                </div>
            </div>
        </div>
    );
}