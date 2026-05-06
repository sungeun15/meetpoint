import type { AuthCopy, AuthMode } from "@/app/components/auth/types";

export const authCopyByMode: Record<AuthMode, AuthCopy> = {
    login: {
        eyebrow: "Sign in to your account",
        title: "Welcome to MeetPoint",
        submitLabel: "Sign In",
        helperHref: "/signup",
        helperText: "Don't have an account? Sign up",
    },
    signup: {
        eyebrow: "Create your account",
        title: "Welcome to MeetPoint",
        submitLabel: "Sign Up",
        helperHref: "/login",
        helperText: "Already have an account? Sign in",
    },
};

export const authFieldPlaceholder = {
    nickname: "Enter nickname",
    password: "Enter password",
    confirmPassword: "Confirm password",
} as const;

const authValidationMessage = {
    nicknameRequired: "Nickname is required.",
    passwordRequired: "Password is required.",
    passwordMismatch: "Passwords do not match.",
} as const;

export function getValidationMessage(mode: AuthMode, nickname: string, password: string, confirmPassword: string) {
    if (!nickname.trim()) {
        return authValidationMessage.nicknameRequired;
    }

    if (!password) {
        return authValidationMessage.passwordRequired;
    }

    if (mode === "signup" && password !== confirmPassword) {
        return authValidationMessage.passwordMismatch;
    }

    return null;
}