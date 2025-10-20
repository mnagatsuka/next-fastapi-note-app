"use client";

import type { WebsocketMessageType } from "@/lib/api/generated/schemas";
import { useWebSocketStore } from "@/lib/stores/websocket-store";
import { useCallback } from "react";

export function useWebSocket() {
	const {
		status,
		error,
		connect,
		disconnect,
		subscribe,
		reconnectAttempts,
		maxReconnectAttempts,
	} = useWebSocketStore();

	// Note: Connection is managed by WebSocketProvider, not by individual hooks
	// This prevents multiple connection attempts from different components

	// Subscribe to specific message types
	const subscribeToMessage = useCallback(
		<T = unknown>(type: WebsocketMessageType, callback: (data: T) => void) => {
			return subscribe(type, callback);
		},
		[subscribe],
	);

	return {
		status,
		error,
		reconnectAttempts,
		maxReconnectAttempts,
		isConnected: status === "connected",
		isConnecting: status === "connecting",
		isDisconnected: status === "disconnected",
		hasError: status === "error",
		connect,
		disconnect,
		subscribeToMessage,
	};
}
