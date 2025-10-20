"use client";

import type React from "react";
import { AuthModalProvider } from "./AuthModalProvider";
import { AuthProvider } from "./AuthProvider";
import { MswProvider } from "./MswProvider";
import { QueryProvider } from "./QueryProvider";
import { WebSocketProvider } from "./WebSocketProvider";

interface AppProvidersProps {
	children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
	return (
		<MswProvider>
			<QueryProvider>
				<AuthProvider>
					<AuthModalProvider>
						<WebSocketProvider>{children}</WebSocketProvider>
					</AuthModalProvider>
				</AuthProvider>
			</QueryProvider>
		</MswProvider>
	);
}
