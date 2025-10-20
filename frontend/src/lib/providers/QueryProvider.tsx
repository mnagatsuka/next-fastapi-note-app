"use client";

import { isProduction } from "@/lib/config/env";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type React from "react";
import { useMemo, useState } from "react";

interface QueryProviderProps {
	children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
	const [client] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60_000,
						refetchOnWindowFocus: false,
						retry: 1,
					},
					mutations: {
						retry: 1,
					},
				},
			}),
	);

	const devtools = useMemo(
		() =>
			!isProduction() ? <ReactQueryDevtools initialIsOpen={false} /> : null,
		[],
	);

	return (
		<QueryClientProvider client={client}>
			{children}
			{devtools}
		</QueryClientProvider>
	);
}
