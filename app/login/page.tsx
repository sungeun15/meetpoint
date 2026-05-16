import { AuthScreen } from "@/app/components/auth-screen";
import { getCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function LoginPage() {
    const session = await getCurrentSession();

    if (session) {
        redirect("/friends");
    }

    return (
        <main className="flex-1 overflow-x-hidden bg-white">
            <AuthScreen mode="login" />
        </main>
    );
}