import { ChatScreen } from "@/app/components/chat-screen";

type ChatPageProps = {
    searchParams: Promise<{ friend?: string | string[] | undefined }>;
};

export default async function ChatPage({ searchParams }: ChatPageProps) {
    const resolvedSearchParams = await searchParams;
    const requestedFriendId = Array.isArray(resolvedSearchParams.friend)
        ? resolvedSearchParams.friend[0] ?? null
        : resolvedSearchParams.friend ?? null;

    return (
        <main className="flex-1 overflow-x-hidden bg-white">
            <ChatScreen requestedFriendId={requestedFriendId} />
        </main>
    );
}