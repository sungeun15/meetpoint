export const LOCATION_SHARE_SCOPE_VALUES = ["friend", "all_friends"] as const;

export type LocationShareScope = (typeof LOCATION_SHARE_SCOPE_VALUES)[number];

export function isLocationShareScope(value: unknown): value is LocationShareScope {
    return typeof value === "string" && LOCATION_SHARE_SCOPE_VALUES.includes(value as LocationShareScope);
}