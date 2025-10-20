import {
	getAuthenticateAnonymousResponseMock,
	getCreateMyNoteResponseMock,
	getDeleteMyNoteResponseMock,
	getGetMyNoteByIdResponseMock,
	getGetMyNotesResponseMock,
	getGetNoteByIdResponseMock,
	getGetNotesResponseMock,
	getGetUserProfileResponseMock,
	getLoginRegularUserResponseMock,
	getPromoteAnonymousUserResponseMock,
	getUpdateMyNoteResponseMock,
	getUpdateUserProfileResponseMock,
} from "@/lib/api/generated/client.msw";
import { http, HttpResponse } from "msw";

// Get API base URL from environment - MSW needs to intercept the full URLs
const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// MSW handlers using Orval-generated mocks with OpenAPI examples
export const handlers = [
	// GET /notes - Public notes list
	http.get(`${API_BASE_URL}/notes`, ({ request }) => {
		console.log("[MSW] Intercepted request:", request.url);
		const response = getGetNotesResponseMock();
		console.log("[MSW] Returning response:", response);
		return HttpResponse.json(response);
	}),

	// GET /notes/:id - Public note detail
	http.get(`${API_BASE_URL}/notes/:id`, ({ params }) => {
		const noteId = params.id as string;
		console.log("[MSW] Intercepted note detail request for ID:", noteId);

		// Return the mock data with the requested ID
		const mockResponse = getGetNoteByIdResponseMock();
		mockResponse.data.id = noteId;

		console.log("[MSW] Returning note detail response:", mockResponse);
		return HttpResponse.json(mockResponse);
	}),

	// GET /me/notes - Private notes list
	http.get(`${API_BASE_URL}/me/notes`, () => {
		return HttpResponse.json(getGetMyNotesResponseMock());
	}),

	// POST /me/notes - Create private note
	http.post(`${API_BASE_URL}/me/notes`, () => {
		return HttpResponse.json(getCreateMyNoteResponseMock());
	}),

	// GET /me/notes/:id - Private note detail
	http.get(`${API_BASE_URL}/me/notes/:id`, () => {
		return HttpResponse.json(getGetMyNoteByIdResponseMock());
	}),

	// PATCH /me/notes/:id - Update private note
	http.patch(`${API_BASE_URL}/me/notes/:id`, () => {
		return HttpResponse.json(getUpdateMyNoteResponseMock());
	}),

	// DELETE /me/notes/:id - Delete private note
	http.delete(`${API_BASE_URL}/me/notes/:id`, () => {
		return HttpResponse.json(getDeleteMyNoteResponseMock());
	}),

	// GET /me - Get user profile
	http.get(`${API_BASE_URL}/me`, () => {
		return HttpResponse.json(getGetUserProfileResponseMock());
	}),

	// PATCH /me - Update user profile
	http.patch(`${API_BASE_URL}/me`, () => {
		return HttpResponse.json(getUpdateUserProfileResponseMock());
	}),

	// POST /auth/anonymous-login - Anonymous authentication
	http.post(`${API_BASE_URL}/auth/anonymous-login`, () => {
		return HttpResponse.json(getAuthenticateAnonymousResponseMock());
	}),

	// GET /auth/login - User authentication
	http.get(`${API_BASE_URL}/auth/login`, () => {
		return HttpResponse.json(getLoginRegularUserResponseMock());
	}),

	// POST /auth/anonymous-promote - Promote anonymous user
	http.post(`${API_BASE_URL}/auth/anonymous-promote`, () => {
		return HttpResponse.json(getPromoteAnonymousUserResponseMock());
	}),
];
