import { AuthScreen } from "@/app/components/auth-screen";

export default function SignupPage() {
    return (
        <main className="flex-1 overflow-x-hidden bg-white">
            <AuthScreen mode="signup" />
        </main>
    );
}