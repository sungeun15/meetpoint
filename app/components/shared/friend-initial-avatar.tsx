import { getFriendInitial } from "../friends/data";
import { friendsDisplayFont } from "../friends/fonts";

type FriendInitialAvatarProps = {
    nickname: string;
    className?: string;
    textClassName?: string;
};

export function FriendInitialAvatar({ nickname, className = "", textClassName = "" }: FriendInitialAvatarProps) {
    return (
        <div className={`flex shrink-0 items-center justify-center rounded-full bg-[#d9d9d9] text-[#111827] ${className}`}>
            <span className={`${friendsDisplayFont.className} leading-none ${textClassName}`}>
                {getFriendInitial(nickname)}
            </span>
        </div>
    );
}