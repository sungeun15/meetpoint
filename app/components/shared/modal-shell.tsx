import type { ReactNode } from "react";

import { pretendardBodyFont, pretendardHeadingFont } from "./pretendard-fonts";

type ModalShellProps = {
    title: string;
    description?: string;
    children: ReactNode;
    onClose: () => void;
    notice?: ReactNode;
    overlayClassName?: string;
    panelClassName?: string;
    contentClassName?: string;
};

function mergeClassNames(...classNames: Array<string | false | null | undefined>) {
    return classNames.filter(Boolean).join(" ");
}

export function ModalShell({
    title,
    description,
    children,
    onClose,
    notice,
    overlayClassName,
    panelClassName,
    contentClassName,
}: ModalShellProps) {
    return (
        <div className={mergeClassNames("fixed inset-0 z-80 flex items-end bg-[#0f1020]/55 px-3 py-3 sm:items-center sm:justify-center sm:px-6 sm:py-6", overlayClassName)}>
            <div className={mergeClassNames("w-full overflow-hidden rounded-3xl bg-white shadow-[0px_20px_60px_rgba(15,16,32,0.28)]", panelClassName)}>
                <div className="flex items-center justify-between border-b border-[#ece9ff] px-4 py-4 sm:px-5">
                    <div>
                        <p className={`${pretendardHeadingFont.className} text-[17px] text-[#111827] sm:text-[19px]`}>
                            {title}
                        </p>
                        {description ? (
                            <p className={`${pretendardBodyFont.className} mt-1 text-[12px] text-[#6b7280] sm:text-[13px]`}>
                                {description}
                            </p>
                        ) : null}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`${pretendardBodyFont.className} rounded-full border border-[#ddd7ff] px-3 py-1.5 text-[12px] text-[#5b43d6] transition-colors hover:bg-[#f5f1ff] sm:text-[13px]`}
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