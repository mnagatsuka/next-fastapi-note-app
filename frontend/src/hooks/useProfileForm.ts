import type {
	UpdateUserProfileBody,
	UserProfile,
} from "@/lib/api/generated/schemas";
import { useEffect, useState } from "react";

interface UseProfileFormProps {
	profile: UserProfile | null;
	isEditing: boolean;
}

export function useProfileForm({ profile, isEditing }: UseProfileFormProps) {
	const [formData, setFormData] = useState<UpdateUserProfileBody>({
		displayName: "",
		email: "",
		avatarUrl: "",
	});

	// Initialize form data when profile loads or editing state changes
	useEffect(() => {
		if (profile && !isEditing) {
			setFormData({
				displayName: profile.displayName || "",
				email: profile.email || "",
				avatarUrl: profile.avatarUrl || "",
			});
		}
	}, [profile, isEditing]);

	const resetFormData = (profileData: UserProfile) => {
		setFormData({
			displayName: profileData.displayName || "",
			email: profileData.email || "",
			avatarUrl: profileData.avatarUrl || "",
		});
	};

	const updateField = (field: keyof UpdateUserProfileBody, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const getChangedFields = (originalProfile: UserProfile) => {
		const updates: UpdateUserProfileBody = {};

		if (formData.displayName !== originalProfile.displayName) {
			updates.displayName = formData.displayName;
		}
		if (formData.email !== originalProfile.email) {
			updates.email = formData.email;
		}
		if (formData.avatarUrl !== originalProfile.avatarUrl) {
			updates.avatarUrl = formData.avatarUrl;
		}

		return updates;
	};

	return {
		formData,
		resetFormData,
		updateField,
		getChangedFields,
	};
}
