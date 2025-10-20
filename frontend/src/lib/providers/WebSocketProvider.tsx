"use client";

import { useWebSocketStore } from "@/lib/stores/websocket-store";
import { useEffect } from "react";

interface WebSocketProviderProps {
	children: React.ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
	const { status, connect, disconnect } = useWebSocketStore();

	useEffect(() => {
		// Auto-connect when provider mounts (only once)
		if (status === "disconnected") {
			console.log("WebSocketProvider: Auto-connecting...");
			connect();
		}

		// Cleanup: disconnect when provider unmounts
		return () => {
			console.log("WebSocketProvider: Cleaning up...");
			disconnect();
		};
	}, []); // Empty dependency array - only run on mount/unmount

	// Don't render anything, just manage the WebSocket connection
	return <>{children}</>;
}
