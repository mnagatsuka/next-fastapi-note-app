"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfileForm } from "@/hooks/useProfileForm";
import {
	useGetUserProfile,
	useUpdateUserProfile,
} from "@/lib/api/generated/client";
import type { UserProfile } from "@/lib/api/generated/schemas";
import { auth } from "@/lib/firebase/config";
import { useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "firebase/auth";
import { useState } from "react";
import { ProfileDisplay } from "./ProfileDisplay";
import { ProfileEditForm } from "./ProfileEditForm";

export function ProfileSection() {
	const [isEditing, setIsEditing] = useState(false);
	const queryClient = useQueryClient();

	// API hooks
	const { data: profileResponse, isLoading, error } = useGetUserProfile();
	const updateProfileMutation = useUpdateUserProfile();

	const profile = profileResponse?.data;

	// Form management
	const { formData, resetFormData, updateField, getChangedFields } =
		useProfileForm({
			profile: profile || null,
			isEditing,
		});

	const handleEdit = () => {
		if (profile) {
			resetFormData(profile);
		}
		setIsEditing(true);
	};

	const handleCancel = () => {
		setIsEditing(false);
		if (profile) {
			resetFormData(profile);
		}
	};

	const handleSave = async () => {
		if (!profile) return;

		try {
			const updates = getChangedFields(profile);

			if (Object.keys(updates).length > 0) {
				// Update backend profile
				await updateProfileMutation.mutateAsync({ data: updates });

				// Update Firebase user profile to sync displayName and photoURL
				await updateFirebaseProfile(updates);

				// Refresh profile data
				await queryClient.invalidateQueries({ queryKey: ["/me"] });
			}

			setIsEditing(false);
		} catch (error) {
			console.error("Failed to update profile:", error);
			throw error; // Re-throw to let the UI handle the error display
		}
	};

	const updateFirebaseProfile = async (updates: { displayName?: string; avatarUrl?: string }) => {
		if (
			!auth.currentUser ||
			!(updates.displayName !== undefined || updates.avatarUrl !== undefined)
		) {
			return;
		}

		const firebaseUpdates: { displayName?: string; photoURL?: string } = {};

		if (updates.displayName !== undefined) {
			firebaseUpdates.displayName = updates.displayName;
		}

		if (updates.avatarUrl !== undefined) {
			// Use default avatar when user clears their custom avatar
			// This ensures Firebase always has a valid URL string
			const avatarUrl = updates.avatarUrl?.trim();
			firebaseUpdates.photoURL =
				avatarUrl && avatarUrl.length > 0
					? avatarUrl
					: `${window.location.origin}/default-avatar.svg`;
		}

		await updateProfile(auth.currentUser, firebaseUpdates);
	};

	if (isLoading) {
		return <LoadingState />;
	}

	if (error || !profile) {
		return <ErrorState />;
	}

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle>Profile Information</CardTitle>
				{!isEditing && (
					<Button variant="outline" onClick={handleEdit}>
						Edit
					</Button>
				)}
			</CardHeader>

			<CardContent className="space-y-6">
				{isEditing ? (
					<ProfileEditForm
						formData={formData}
						onUpdateField={updateField}
						onSave={handleSave}
						onCancel={handleCancel}
						isLoading={updateProfileMutation.isPending}
					/>
				) : (
					<ProfileDisplay profile={profile} />
				)}
			</CardContent>
		</Card>
	);
}

function LoadingState() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Profile Information</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="h-4 bg-muted animate-pulse rounded w-1/2" />
					<div className="h-4 bg-muted animate-pulse rounded w-3/4" />
					<div className="h-4 bg-muted animate-pulse rounded w-1/3" />
				</div>
			</CardContent>
		</Card>
	);
}

function ErrorState() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Profile Information</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="text-center py-4">
					<div className="text-destructive mb-2">Failed to load profile</div>
					<Button variant="outline" onClick={() => window.location.reload()}>
						Try Again
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
