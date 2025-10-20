import React from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a test query client with default options optimized for testing
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries for tests
        gcTime: 0, // Disable garbage collection
      },
      mutations: {
        retry: false,
      },
    },
  })
}

// Test providers wrapper
interface ProvidersProps {
  children: React.ReactNode
  queryClient?: QueryClient
}

function TestProviders({ children, queryClient }: ProvidersProps) {
  const testQueryClient = queryClient ?? createTestQueryClient()

  return (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  )
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
}

function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const { queryClient, ...renderOptions } = options

  return render(ui, {
    wrapper: ({ children }) => (
      <TestProviders queryClient={queryClient}>{children}</TestProviders>
    ),
    ...renderOptions,
  })
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { renderWithProviders, createTestQueryClient }