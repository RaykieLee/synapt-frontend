'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider as NextThemeProvider } from 'next-themes'
import { useState, ReactNode } from 'react'
import { AuthProvider } from '@/contexts/auth-context'
import { ChatConnectionProvider } from '@/contexts/chat-connection-context'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: Readonly<ProvidersProps>) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 5, // 5分钟
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ChatConnectionProvider>
          <NextThemeProvider 
            attribute="class" 
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </NextThemeProvider>
        </ChatConnectionProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
} 