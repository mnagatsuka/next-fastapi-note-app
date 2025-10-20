import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface NotesState {
	// Pagination state for public notes
	currentPage: number;
	authorFilter: string | null;

	// Editor state
	editorMode: "create" | "edit";
	editingNoteId: string | null;
}

interface NotesActions {
	// Pagination actions
	setCurrentPage: (page: number) => void;
	setAuthorFilter: (authorId: string | null) => void;
	resetPagination: () => void;

	// Editor actions
	setEditorMode: (mode: "create" | "edit") => void;
	setEditingNoteId: (noteId: string | null) => void;
	enterEditMode: (noteId: string) => void;
	enterCreateMode: () => void;
	exitEditor: () => void;
}

export type NotesStore = NotesState & NotesActions;

export const useNotesStore = create<NotesStore>()(
	devtools(
		(set) => ({
			// State
			currentPage: 1,
			authorFilter: null,
			editorMode: "create",
			editingNoteId: null,

			// Pagination actions
			setCurrentPage: (page) => set({ currentPage: page }),

			setAuthorFilter: (authorId) => {
				set({
					authorFilter: authorId,
					currentPage: 1, // Reset to first page when filtering
				});
			},

			resetPagination: () =>
				set({
					currentPage: 1,
					authorFilter: null,
				}),

			// Editor actions
			setEditorMode: (mode) => set({ editorMode: mode }),

			setEditingNoteId: (noteId) => set({ editingNoteId: noteId }),

			enterEditMode: (noteId) =>
				set({
					editorMode: "edit",
					editingNoteId: noteId,
				}),

			enterCreateMode: () =>
				set({
					editorMode: "create",
					editingNoteId: null,
				}),

			exitEditor: () =>
				set({
					editorMode: "create",
					editingNoteId: null,
				}),
		}),
		{
			name: "notes-store",
		},
	),
);
