import type {
	WebsocketMessage,
	WebsocketMessageType,
} from "@/lib/api/generated/schemas";
import { getWebSocketUrl } from "@/lib/config/env";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

type MessageSubscriber<T = unknown> = (data: T) => void;

interface WebSocketState {
	// Connection state
	status: ConnectionStatus;
	error: string | null;
	reconnectAttempts: number;
	maxReconnectAttempts: number;
	reconnectDelay: number;

	// WebSocket instance
	socket: WebSocket | null;

	// Message subscriptions
	subscribers: Map<WebsocketMessageType, Set<MessageSubscriber<unknown>>>;
}

interface WebSocketActions {
	// Connection management
	connect: () => void;
	disconnect: () => void;
	reconnect: () => void;

	// Message handling
	subscribe: <T = unknown>(
		type: WebsocketMessageType,
		callback: MessageSubscriber<T>,
	) => () => void;
	unsubscribe: (
		type: WebsocketMessageType,
		callback: MessageSubscriber<unknown>,
	) => void;

	// Internal methods
	setStatus: (status: ConnectionStatus) => void;
	setError: (error: string | null) => void;
	handleMessage: (message: WebsocketMessage) => void;
}

export type WebSocketStore = WebSocketState & WebSocketActions;

const getWSUrl = () => {
	if (typeof window === "undefined") return "";
	return getWebSocketUrl();
};

export const useWebSocketStore = create<WebSocketStore>()(
	devtools(
		(set, get) => ({
			// State
			status: "disconnected",
			error: null,
			reconnectAttempts: 0,
			maxReconnectAttempts: 5,
			reconnectDelay: 3000,
			socket: null,
			subscribers: new Map(),

			// Actions
			connect: () => {
				const { status, socket } = get();

				if (status === "connected" || status === "connecting") {
					return;
				}

				const wsUrl = getWSUrl();
				if (!wsUrl) {
					set({ error: "WebSocket URL not configured", status: "error" });
					return;
				}

				try {
					set({ status: "connecting", error: null });

					const newSocket = new WebSocket(wsUrl);

					newSocket.onopen = () => {
						console.log("WebSocket connected");
						set({
							status: "connected",
							error: null,
							reconnectAttempts: 0,
							socket: newSocket,
						});
					};

					newSocket.onmessage = (event) => {
						try {
							const message: WebsocketMessage = JSON.parse(event.data);
							get().handleMessage(message);
						} catch (error) {
							console.error("Failed to parse WebSocket message:", error);
						}
					};

					newSocket.onclose = (event) => {
						console.log("WebSocket disconnected:", event.code, event.reason);
						set({ status: "disconnected", socket: null });

						// Auto-reconnect if not intentionally closed
						if (event.code !== 1000) {
							const {
								reconnectAttempts,
								maxReconnectAttempts,
								reconnectDelay,
							} = get();
							if (reconnectAttempts < maxReconnectAttempts) {
								setTimeout(() => {
									get().reconnect();
								}, reconnectDelay);
							}
						}
					};

					newSocket.onerror = (error) => {
						console.error("WebSocket error:", error);
						set({ status: "error", error: "Connection failed" });
					};
				} catch (error) {
					console.error("Failed to create WebSocket connection:", error);
					set({ status: "error", error: "Failed to connect" });
				}
			},

			disconnect: () => {
				const { socket } = get();
				if (socket) {
					socket.close(1000, "Client disconnect");
				}
				set({ status: "disconnected", socket: null, error: null });
			},

			reconnect: () => {
				const { reconnectAttempts } = get();
				set({ reconnectAttempts: reconnectAttempts + 1 });
				get().connect();
			},

			subscribe: <T = unknown>(
				type: WebsocketMessageType,
				callback: MessageSubscriber<T>,
			) => {
				const { subscribers } = get();

				if (!subscribers.has(type)) {
					subscribers.set(type, new Set());
				}

				subscribers.get(type)?.add(callback as MessageSubscriber<unknown>);

				// Return unsubscribe function
				return () => {
					get().unsubscribe(type, callback as MessageSubscriber<unknown>);
				};
			},

			unsubscribe: (
				type: WebsocketMessageType,
				callback: MessageSubscriber<unknown>,
			) => {
				const { subscribers } = get();
				subscribers.get(type)?.delete(callback);

				// Clean up empty sets
				if (subscribers.get(type)?.size === 0) {
					subscribers.delete(type);
				}
			},

			setStatus: (status) => set({ status }),

			setError: (error) => set({ error }),

			handleMessage: (message: WebsocketMessage) => {
				const { subscribers } = get();
				const typeSubscribers = subscribers.get(message.type);

				if (typeSubscribers) {
					for (const callback of typeSubscribers) {
						try {
							callback(message.data);
						} catch (error) {
							console.error(
								`Error in WebSocket message handler for type ${message.type}:`,
								error,
							);
						}
					}
				}
			},
		}),
		{
			name: "websocket-store",
		},
	),
);
