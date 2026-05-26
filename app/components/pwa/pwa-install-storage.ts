const SNAPSHOT_STORAGE_KEY = "meetpoint-install-banner-snapshot";
const LEGACY_DISMISS_STORAGE_KEY = "meetpoint-install-banner-dismiss-until";
const LEGACY_INSTALLED_STORAGE_KEY = "meetpoint-install-banner-installed";
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const RECENT_INSTALL_SIGNAL_WINDOW_IN_MS = 30 * ONE_DAY_IN_MS;

export type PwaInstallSnapshot = {
    dismissUntil: number | null;
    lastAppInstalledAt: number | null;
    lastStandaloneAt: number | null;
};

const EMPTY_SNAPSHOT: PwaInstallSnapshot = {
    dismissUntil: null,
    lastAppInstalledAt: null,
    lastStandaloneAt: null,
};

function isValidTimestamp(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function normalizeSnapshot(snapshot: Partial<PwaInstallSnapshot>, now = Date.now()): PwaInstallSnapshot {
    const nextDismissUntil = snapshot.dismissUntil;
    let dismissUntil: number | null = null;

    if (isValidTimestamp(nextDismissUntil) && nextDismissUntil > now) {
        dismissUntil = nextDismissUntil;
    }

    return {
        dismissUntil,
        lastAppInstalledAt: isValidTimestamp(snapshot.lastAppInstalledAt) ? snapshot.lastAppInstalledAt : null,
        lastStandaloneAt: isValidTimestamp(snapshot.lastStandaloneAt) ? snapshot.lastStandaloneAt : null,
    };
}

function writeSnapshot(snapshot: PwaInstallSnapshot) {
    window.localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
}

function readLegacySnapshot(now = Date.now()): PwaInstallSnapshot {
    const legacyDismissRaw = window.localStorage.getItem(LEGACY_DISMISS_STORAGE_KEY);
    const legacyInstalledRaw = window.localStorage.getItem(LEGACY_INSTALLED_STORAGE_KEY);

    const legacyDismissUntil = Number(legacyDismissRaw);
    const snapshot = normalizeSnapshot({
        dismissUntil: Number.isFinite(legacyDismissUntil) ? legacyDismissUntil : null,
        lastAppInstalledAt: legacyInstalledRaw === "1" ? now : null,
    }, now);

    window.localStorage.removeItem(LEGACY_DISMISS_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_INSTALLED_STORAGE_KEY);
    writeSnapshot(snapshot);

    return snapshot;
}

export function readInstallSnapshot(now = Date.now()): PwaInstallSnapshot {
    try {
        const snapshotRaw = window.localStorage.getItem(SNAPSHOT_STORAGE_KEY);

        if (snapshotRaw) {
            const parsedSnapshot = JSON.parse(snapshotRaw) as Partial<PwaInstallSnapshot>;
            const normalizedSnapshot = normalizeSnapshot(parsedSnapshot, now);

            if (JSON.stringify(parsedSnapshot) !== JSON.stringify(normalizedSnapshot)) {
                writeSnapshot(normalizedSnapshot);
            }

            return normalizedSnapshot;
        }

        if (
            window.localStorage.getItem(LEGACY_DISMISS_STORAGE_KEY) !== null ||
            window.localStorage.getItem(LEGACY_INSTALLED_STORAGE_KEY) !== null
        ) {
            return readLegacySnapshot(now);
        }

        return EMPTY_SNAPSHOT;
    } catch {
        return EMPTY_SNAPSHOT;
    }
}

export function updateInstallSnapshot(
    updater: (snapshot: PwaInstallSnapshot) => PwaInstallSnapshot,
    now = Date.now(),
) {
    try {
        const nextSnapshot = normalizeSnapshot(updater(readInstallSnapshot(now)), now);
        writeSnapshot(nextSnapshot);
        return nextSnapshot;
    } catch {
        return readInstallSnapshot(now);
    }
}

export function hasRecentInstallSignal(snapshot: PwaInstallSnapshot, now = Date.now()) {
    return [snapshot.lastStandaloneAt, snapshot.lastAppInstalledAt].some((timestamp) => {
        if (!isValidTimestamp(timestamp)) {
            return false;
        }

        return now - timestamp <= RECENT_INSTALL_SIGNAL_WINDOW_IN_MS;
    });
}

export function getDismissUntil(duration: number) {
    return Date.now() + duration;
}

export function readDismissUntil() {
    return readInstallSnapshot().dismissUntil;
}

export function saveDismissUntil(nextDismissUntil: number) {
    updateInstallSnapshot((snapshot) => ({
        ...snapshot,
        dismissUntil: nextDismissUntil,
    }));
}

export function clearDismissUntil() {
    updateInstallSnapshot((snapshot) => ({
        ...snapshot,
        dismissUntil: null,
    }));
}

export function markAppInstalled(installedAt = Date.now()) {
    updateInstallSnapshot((snapshot) => ({
        ...snapshot,
        dismissUntil: null,
        lastAppInstalledAt: installedAt,
    }), installedAt);
}

export function markStandaloneLaunch(launchedAt = Date.now()) {
    updateInstallSnapshot((snapshot) => ({
        ...snapshot,
        lastStandaloneAt: launchedAt,
    }), launchedAt);
}