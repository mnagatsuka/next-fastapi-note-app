"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	useGetUserProfile,
	useUpdateUserProfile,
} from "@/lib/api/generated/client";
import { auth } from "@/lib/firebase/config";
import { useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "firebase/auth";
import { useEffect, useState } from "react";

export function ProfileSection() {
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({
		displayName: "",
		email: "",
		avatarUrl: "",
	});

	// Default avatar URL
	const defaultAvatarUrl = "/default-avatar.svg";

	const queryClient = useQueryClient();

	// API hooks
	const { data: profileResponse, isLoading, error } = useGetUserProfile();

	const updateProfileMutation = useUpdateUserProfile();

	const profile = profileResponse?.data;

	// Initialize form data when profile loads
	useEffect(() => {
		if (profile && !isEditing) {
			setFormData({
				displayName: profile.displayName || "",
				email: profile.email || "",
				avatarUrl: profile.avatarUrl || "",
			});
		}
	}, [profile, isEditing]);

	const handleEdit = () => {
		if (profile) {
			setFormData({
				displayName: profile.displayName || "",
				email: profile.email || "",
				avatarUrl: profile.avatarUrl || "",
			});
		}
		setIsEditing(true);
	};

	const handleCancel = () => {
		setIsEditing(false);
		if (profile) {
			setFormData({
				displayName: profile.displayName || "",
				email: profile.email || "",
				avatarUrl: profile.avatarUrl || "",
			});
		}
	};

	const handleSave = async () => {
		if (!profile) return;

		try {
			// Only send changed fields
			const updates: { displayName?: string; email?: string; avatarUrl?: string } = {};
			if (formData.displayName !== profile.displayName) {
				updates.displayName = formData.displayName;
			}
			if (formData.email !== profile.email) {
				updates.email = formData.email || undefined;
			}
			if (formData.avatarUrl !== profile.avatarUrl) {
				updates.avatarUrl = formData.avatarUrl || undefined;
			}

			if (Object.keys(updates).length > 0) {
				await updateProfileMutation.mutateAsync({ data: updates });

				// Update Firebase user profile to sync displayName and photoURL
				if (
					auth.currentUser &&
					(updates.displayName || updates.avatarUrl !== undefined)
				) {
					const firebaseUpdates: {
						displayName?: string;
						photoURL?: string | null;
					} = {};

					if (updates.displayName !== undefined) {
						firebaseUpdates.displayName = updates.displayName;
					}

					if (updates.avatarUrl !== undefined) {
						firebaseUpdates.photoURL = updates.avatarUrl || null;
					}

					await updateProfile(auth.currentUser, firebaseUpdates);
				}

				// Refresh profile data
				await queryClient.invalidateQueries({ queryKey: ["/me"] });
			}

			setIsEditing(false);
		} catch (error) {
			console.error("Failed to update profile:", error);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	if (isLoading) {
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

	if (error || !profile) {
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
					// Edit Form
					<div className="space-y-4">
						<div className="space-y-2">
							<label htmlFor="displayName" className="text-sm font-medium">
								Display Name
							</label>
							<input
								id="displayName"
								type="text"
								value={formData.displayName}
								onChange={(e) =>
									setFormData({ ...formData, displayName: e.target.value })
								}
								className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent"
								required
								maxLength={60}
								disabled={updateProfileMutation.isPending}
							/>
							<div className="text-xs text-muted-foreground">
								{formData.displayName.length}/60 characters
							</div>
						</div>

						<div className="space-y-2">
							<label htmlFor="email" className="text-sm font-medium">
								Email
							</label>
							<input
								id="email"
								type="email"
								value={formData.email}
								onChange={(e) =>
									setFormData({ ...formData, email: e.target.value })
								}
								className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent"
								disabled={updateProfileMutation.isPending}
							/>
							<div className="text-xs text-muted-foreground">
								Used for account recovery and notifications
							</div>
						</div>

						<div className="space-y-2">
							<label htmlFor="avatarUrl" className="text-sm font-medium">
								Avatar URL
							</label>
							<input
								id="avatarUrl"
								type="url"
								value={formData.avatarUrl}
								onChange={(e) =>
									setFormData({ ...formData, avatarUrl: e.target.value })
								}
								className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent"
								placeholder="https://example.com/avatar.jpg"
								disabled={updateProfileMutation.isPending}
							/>
							<div className="text-xs text-muted-foreground">
								Optional: Link to your profile picture. Leave blank to use
								default avatar.
							</div>
						</div>

						<div className="flex gap-2 pt-4">
							<Button
								onClick={handleSave}
								disabled={updateProfileMutation.isPending}
							>
								{updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
							</Button>
							<Button
								variant="outline"
								onClick={handleCancel}
								disabled={updateProfileMutation.isPending}
							>
								Cancel
							</Button>
						</div>
					</div>
				) : (
					// Display View
					<div className="space-y-4">
						<div className="flex items-center gap-4">
							<img
								src={profile.avatarUrl || defaultAvatarUrl}
								alt="Profile avatar"
								className="h-16 w-16 rounded-full object-cover"
								onError={(e) => {
									e.currentTarget.src = defaultAvatarUrl;
								}}
							/>
							<div>
								<h3 className="text-lg font-semibold">{profile.displayName}</h3>
								{profile.email && (
									<p className="text-sm text-muted-foreground">
										{profile.email}
									</p>
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
				)}
			</CardContent>
		</Card>
	);
}
