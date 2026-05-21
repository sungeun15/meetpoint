type PlaceholderCardProps = {
    children: React.ReactNode;
    centered?: boolean;
    padded?: "default" | "spacious";
};

function ChatScreenPlaceholderCard({ children, centered = false, padded = "default" }: PlaceholderCardProps) {
    return (
        <div
            className={[
                "rounded-3xl bg-white shadow-[0px_18px_44px_rgba(52,41,104,0.14)]",
                padded === "spacious"
                    ? "px-5 py-8 sm:px-6 sm:py-10"
                    : "px-5 py-5 sm:px-6 sm:py-6",
                centered ? "text-center" : "",
            ].filter(Boolean).join(" ")}
        >
            {children}
        </div>
    );
}

export function ChatScreenTopPanelsLoading() {
    return (
        <div className="grid min-w-0 gap-2.5 sm:gap-4 xl:gap-5">
            <ChatScreenPlaceholderCard>
                <div className="space-y-3 animate-pulse">
                    <div className="h-6 w-40 rounded-full bg-[#ece7ff]" />
                    <div className="h-4 w-64 max-w-full rounded-full bg-[#f2eeff]" />
                </div>
            </ChatScreenPlaceholderCard>

            <ChatScreenPlaceholderCard>
                <div className="space-y-3 animate-pulse">
                    <div className="h-5 w-28 rounded-full bg-[#ece7ff]" />
                    <div className="space-y-2">
                        <div className="h-4 w-full rounded-full bg-[#f4f0ff]" />
                        <div className="h-4 w-5/6 rounded-full bg-[#f4f0ff]" />
                        <div className="h-12 w-full rounded-2xl bg-[#f7f4ff]" />
                    </div>
                </div>
            </ChatScreenPlaceholderCard>

            <ChatScreenPlaceholderCard>
                <div className="space-y-3 animate-pulse">
                    <div className="h-5 w-32 rounded-full bg-[#ece7ff]" />
                    <div className="h-24 w-full rounded-[20px] bg-[#f7f4ff]" />
                </div>
            </ChatScreenPlaceholderCard>
        </div>
    );
}

export function ChatScreenEmptyState() {
    return (
        <ChatScreenPlaceholderCard centered padded="spacious">
            <p className="text-[20px] font-semibold text-[#1f2937] sm:text-[24px]">
                대화를 시작할 친구를 선택해 주세요.
            </p>
            <p className="mt-2 text-[14px] leading-[1.7] text-[#6b7280] sm:text-[15px]">
                아직 수락된 친구가 없다면 friends 화면에서 친구 요청 상태를 먼저 확인해 보세요.
            </p>
        </ChatScreenPlaceholderCard>
    );
}

export function ChatScreenRecommendationLoading() {
    return (
        <ChatScreenPlaceholderCard>
            <div className="space-y-3 animate-pulse">
                <div className="h-5 w-36 rounded-full bg-[#ece7ff]" />
                <div className="h-4 w-64 max-w-full rounded-full bg-[#f2eeff]" />
                <div className="grid gap-3 lg:grid-cols-3">
                    <div className="h-28 rounded-[20px] bg-[#f7f4ff]" />
                    <div className="h-28 rounded-[20px] bg-[#f7f4ff]" />
                    <div className="h-28 rounded-[20px] bg-[#f7f4ff]" />
                </div>
            </div>
        </ChatScreenPlaceholderCard>
    );
}