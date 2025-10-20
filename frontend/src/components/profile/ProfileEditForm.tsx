import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/button";
import type { UpdateUserProfileBody } from "@/lib/api/generated/schemas";
import {
	validateAvatarUrl,
	validateDisplayName,
	validateEmail,
} from "@/utils/profile";

interface ProfileEditFormProps {
	formData: UpdateUserProfileBody;
	onUpdateField: (field: keyof UpdateUserProfileBody, value: string) => void;
	onSave: () => void;
	onCancel: () => void;
	isLoading: boolean;
}

export function ProfileEditForm({
	formData,
	onUpdateField,
	onSave,
	onCancel,
	isLoading,
}: ProfileEditFormProps) {
	const errors = {
		displayName: !validateDisplayName(formData.displayName || "")
			? "Display name is required and must be 60 characters or less"
			: undefined,
		email: !validateEmail(formData.email || "")
			? "Please enter a valid email address"
			: undefined,
		avatarUrl: !validateAvatarUrl(formData.avatarUrl || "")
			? "Please enter a valid URL"
			: undefined,
	};

	const hasErrors = Object.values(errors).some((error) => error !== undefined);
	const canSave = !hasErrors && !isLoading;

	return (
		<div className="space-y-4">
			<FormField
				label="Display Name"
				id="displayName"
				type="text"
				value={formData.displayName || ""}
				onChange={(value) => onUpdateField("displayName", value)}
				required
				maxLength={60}
				disabled={isLoading}
				error={errors.displayName}
			/>

			<FormField
				label="Email"
				id="email"
				type="email"
				value={formData.email || ""}
				onChange={(value) => onUpdateField("email", value)}
				disabled={isLoading}
				helperText="Used for account recovery and notifications"
				error={errors.email}
			/>

			<FormField
				label="Avatar URL"
				id="avatarUrl"
				type="url"
				value={formData.avatarUrl || ""}
				onChange={(value) => onUpdateField("avatarUrl", value)}
				placeholder="https://example.com/avatar.jpg"
				disabled={isLoading}
				helperText="Optional: Link to your profile picture. Leave blank to use default avatar."
				error={errors.avatarUrl}
			/>

			<div className="flex gap-2 pt-4">
				<Button onClick={onSave} disabled={!canSave}>
					{isLoading ? "Saving..." : "Save Changes"}
				</Button>
				<Button variant="outline" onClick={onCancel} disabled={isLoading}>
					Cancel
				</Button>
			</div>
		</div>
	);
}
