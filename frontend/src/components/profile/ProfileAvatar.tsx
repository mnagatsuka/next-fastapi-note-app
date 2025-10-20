import { getDisplayAvatar } from "@/utils/profile";

interface ProfileAvatarProps {
	avatarUrl?: string | null;
	displayName: string;
	size?: "sm" | "md" | "lg";
	className?: string;
}

const sizeClasses = {
	sm: "h-8 w-8",
	md: "h-16 w-16",
	lg: "h-24 w-24",
};

export function ProfileAvatar({
	avatarUrl,
	displayName,
	size = "md",
	className = "",
}: ProfileAvatarProps) {
	return (
		<img
			src={getDisplayAvatar(avatarUrl)}
			alt={`${displayName}'s avatar`}
			className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
			onError={(e) => {
				e.currentTarget.src = getDisplayAvatar();
			}}
		/>
	);
}
