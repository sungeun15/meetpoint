import { FriendsScreen } from "@/app/components/friends-screen";
import { getCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function FriendsPage() {
    const session = await getCurrentSession();

    if (!session) {
        redirect("/login");
    }

    return (
        <main className="flex-1 overflow-x-hidden bg-white">
            <FriendsScreen />
        </main>
    );
}