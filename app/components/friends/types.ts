export type { FriendRelationState } from "@/lib/contracts/friends";

export type FriendLocationSnapshot = {
    address: string;
    latitude: number;
    longitude: number;
    sharedAt?: string | null;
};

export type FriendItem = {
    id: string;
    nickname: string;
    status: string;
    locationHint: string;
    locationSnapshot?: FriendLocationSnapshot;
};

export type PendingFriendRequestItem = FriendItem & {
    requestId: string;
    requestedAtLabel: string;
    direction: "incoming" | "outgoing";
};