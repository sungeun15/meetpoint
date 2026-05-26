export type PlatformContext = {
    isIos: boolean;
    isIphoneSafari: boolean;
    isAndroid: boolean;
    isDesktop: boolean;
};

export type InstallCopy = {
    badge: string;
    title: string | null;
    description: string | null;
    hint: string | null;
    installLabel: string | null;
};

export function buildInstallCopy(platformContext: PlatformContext, canPromptInstall: boolean): InstallCopy {
    if (canPromptInstall) {
        return {
            badge: platformContext.isDesktop ? "Desktop App" : "MeetPoint App",
            title: platformContext.isDesktop ? null : "MeetPoint를 홈 화면에 설치해두세요",
            description: platformContext.isDesktop
                ? null
                : "홈 화면에서 바로 열 수 있게 가볍게 설치해 두면 약속 준비가 훨씬 빨라져요.",
            hint: platformContext.isDesktop
                ? null
                : "설치 버튼을 누르면 브라우저 설치 창이 열리고, 이후에는 앱처럼 바로 실행됩니다.",
            installLabel: "Install MeetPoint",
        };
    }

    if (platformContext.isIphoneSafari) {
        return {
            badge: "iPhone Safari",
            title: "아이폰 홈 화면에 MeetPoint를 살짝 올려둘 수 있어요",
            description: "Safari 아래쪽 공유 버튼을 누른 뒤 홈 화면에 추가를 선택하면, 다음 만남 준비를 앱처럼 바로 이어서 열 수 있어요.",
            hint: "Safari 하단 공유 버튼(네모 밖으로 화살표) > 홈 화면에 추가 > 추가",
            installLabel: "Install MeetPoint",
        };
    }

    if (platformContext.isIos) {
        return {
            badge: "iPhone & iPad",
            title: "홈 화면에 MeetPoint를 추가해두세요",
            description: "브라우저의 공유 메뉴에서 홈 화면에 추가를 선택하면 앱처럼 더 빠르게 다시 들어올 수 있어요.",
            hint: "브라우저 공유 메뉴 > 홈 화면에 추가",
            installLabel: "Install MeetPoint",
        };
    }

    if (platformContext.isAndroid) {
        return {
            badge: "Android",
            title: "홈 화면에 MeetPoint를 올려두면 더 빨라집니다",
            description: "브라우저 메뉴에서 앱 설치 또는 홈 화면에 추가를 선택하면 친구와 약속 화면을 더 빠르게 다시 열 수 있어요.",
            hint: "브라우저 메뉴 > 앱 설치 또는 홈 화면에 추가",
            installLabel: "Install MeetPoint",
        };
    }

    return {
        badge: "Desktop",
        title: null,
        description: null,
        hint: null,
        installLabel: "Install MeetPoint",
    };
}