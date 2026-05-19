export type FriendRelationState = "accepted" | "incoming_pending" | "outgoing_pending";

export type LocationShareScope = "friend" | "all_friends";

export type FriendSummary = {
    id: string;
    relationId?: string;
    nickname: string;
    lat: number | null;
    lng: number | null;
    locationUpdatedAt: string | null;
    locationShareScope: LocationShareScope | null;
    unreadCount: number;
    lastMessagePreview: string | null;
};

export type PendingFriendRequestSummary = FriendSummary & {
    requestId: string;
    requestedAt: string;
};

export type FriendsListResponse = {
    friends: FriendSummary[];
    incomingRequests: PendingFriendRequestSummary[];
    outgoingRequests: PendingFriendRequestSummary[];
};

export type FriendRequestCreateResponse = {
    requestId: string;
    requestedAt: string;
    friend: FriendSummary;
};

export type FriendRequestActionResponse =
    | {
        requestId: string;
        action: "accept";
        friend: FriendSummary;
    }
    | {
        requestId: string;
        action: "reject";
        requesterId: string;
    };

export type FriendSearchResponse = {
    friend: FriendSummary | null;
    relation: {
        state: FriendRelationState;
        requestId: string;
    } | null;
};
