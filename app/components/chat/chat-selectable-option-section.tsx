import { friendsBodyFont, friendsDisplayFont, friendsHeadingFont } from "../friends/fonts";

import { mergeClassNames } from "./class-names";

type SelectableOption<OptionId extends string> = {
    id: OptionId;
    label: string;
    description: string;
};

type ChatSelectableOptionSectionProps<OptionId extends string> = {
    title: string;
    options: SelectableOption<OptionId>[];
    selectedId: OptionId;
    onSelect: (nextId: OptionId) => void;
    columnsClassName: string;
    optionTitleClassName: string;
};

export function ChatSelectableOptionSection<OptionId extends string>({
    title,
    options,
    selectedId,
    onSelect,
    columnsClassName,
    optionTitleClassName,
}: ChatSelectableOptionSectionProps<OptionId>) {
    return (
        <div className="rounded-[18px] bg-white/72 px-3.5 py-3.5 shadow-[0px_12px_24px_rgba(52,41,104,0.08)] sm:px-4 sm:py-4">
            <p className={`${friendsDisplayFont.className} text-[13px] text-[#111827] sm:text-[16px]`}>
                {title}
            </p>
            <div className={mergeClassNames("mt-3 grid gap-2", columnsClassName)}>
                {options.map((option) => {
                    const isSelected = selectedId === option.id;

                    return (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => onSelect(option.id)}
                            className={mergeClassNames(
                                "rounded-2xl border px-3.5 py-2.5 text-left transition-colors sm:px-4 sm:py-3",
                                isSelected
                                    ? "border-[#6c5ce7] bg-[#f5f1ff] shadow-[0px_10px_22px_rgba(108,92,231,0.12)]"
                                    : "border-white/60 bg-white/80 hover:bg-white",
                            )}
                        >
                            <p className={mergeClassNames(friendsHeadingFont.className, optionTitleClassName)}>
                                {option.label}
                            </p>
                            <p className={`${friendsBodyFont.className} mt-1 text-[11px] leading-[1.55] text-[#6b7280] sm:text-[13px]`}>
                                {option.description}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}