import { AuthFormCard } from "@/app/components/auth/auth-form-card";
import type { AuthMode } from "@/app/components/auth/types";

type AuthScreenProps = {
    mode: AuthMode;
};

export function AuthScreen({ mode }: AuthScreenProps) {
    return (
        <section className="flex flex-1 items-center justify-center bg-[#eeebff] px-3 py-5 sm:px-6 sm:py-10 md:px-8 lg:min-h-[calc(100vh-84px)] lg:px-10 lg:py-16">
            <div className="mx-auto flex w-full max-w-[1440px] justify-center">
                <div className="w-full max-w-[760px] py-2 sm:py-8">
                    <AuthFormCard mode={mode} />
                </div>
            </div>
        </section>
    );
}