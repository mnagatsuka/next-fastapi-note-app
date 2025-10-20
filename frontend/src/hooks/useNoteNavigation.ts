import {
	getGetMyNoteByIdQueryKey,
	getGetMyNotesQueryKey,
} from "@/lib/api/generated/client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

/**
 * Custom hook for note navigation and cache management
 * Provides consistent navigation patterns across all note-related pages
 */
export const useNoteNavigation = () => {
	const router = useRouter();
	const queryClient = useQueryClient();

	// Navigation functions
	const navigateToNotes = () => {
		router.push("/me");
	};

	const navigateToNote = (noteId: string) => {
		router.push(`/me/notes/${noteId}`);
	};

	const navigateToEdit = (noteId: string) => {
		router.push(`/me/notes/${noteId}/edit`);
	};

	const navigateToCreate = () => {
		router.push("/me/notes/new");
	};

	// Cache management functions
	const invalidateNotesCache = async () => {
		await queryClient.invalidateQueries({
			queryKey: getGetMyNotesQueryKey({ page: 1, limit: 100 }),
		});
	};

	const invalidateNoteCache = async (noteId: string) => {
		await queryClient.invalidateQueries({
			queryKey: getGetMyNoteByIdQueryKey(noteId),
		});
	};

	const invalidateAllNoteCaches = async (noteId?: string) => {
		await invalidateNotesCache();
		if (noteId) {
			await invalidateNoteCache(noteId);
		}
	};

	// Combined navigation + cache operations (common patterns)
	const saveAndNavigateToNotes = async () => {
		await invalidateNotesCache();
		navigateToNotes();
	};

	const saveAndNavigateToNote = async (noteId: string) => {
		await invalidateAllNoteCaches(noteId);
		navigateToNote(noteId);
	};

	return {
		// Basic navigation
		navigateToNotes,
		navigateToNote,
		navigateToEdit,
		navigateToCreate,

		// Cache management
		invalidateNotesCache,
		invalidateNoteCache,
		invalidateAllNoteCaches,

		// Combined operations
		saveAndNavigateToNotes,
		saveAndNavigateToNote,
	};
};
