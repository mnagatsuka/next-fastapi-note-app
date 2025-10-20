import type { UserProfile } from "@/lib/api/generated/schemas";
import { formatDate } from "@/utils/profile";
import { ProfileAvatar } from "./ProfileAvatar";

interface ProfileDisplayProps {
	profile: UserProfile;
}

export function ProfileDisplay({ profile }: ProfileDisplayProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center gap-4">
				<ProfileAvatar
					avatarUrl={profile.avatarUrl}
					displayName={profile.displayName}
					size="md"
				/>
				<div>
					<h3 className="text-lg font-semibold">{profile.displayName}</h3>
					{profile.email && (
						<p className="text-sm text-muted-foreground">{profile.email}</p>
					)}
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4 pt-4 border-t">
				<div>
					<dt className="text-sm font-medium text-muted-foreground">
						Account Type
					</dt>
					<dd className="text-sm">
						{profile.isAnonymous ? "Anonymous" : "Regular"}
					</dd>
				</div>
				<div>
					<dt className="text-sm font-medium text-muted-foreground">
						Member Since
					</dt>
					<dd className="text-sm">{formatDate(profile.createdAt)}</dd>
				</div>
			</div>

			{profile.updatedAt !== profile.createdAt && (
				<div className="text-xs text-muted-foreground">
					Last updated: {formatDate(profile.updatedAt)}
				</div>
			)}
		</div>
	);
}
