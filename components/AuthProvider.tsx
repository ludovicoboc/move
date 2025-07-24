"use client"

import { useUser } from '@/hooks/use-user'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface AuthProviderProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export default function AuthProvider({ children, requireAuth = true }: AuthProviderProps) {
  const { user, loading, error } = useUser()
  const router = useRouter()

  useEffect(() => {
    console.log('🔐 AUTH PROVIDER STATE:', { user: user?.id, loading, error: error?.message })
    
    // Se não está carregando e não tem usuário e requer autenticação
    if (!loading && !user && requireAuth) {
      console.log('🚪 REDIRECIONANDO PARA LOGIN')
      router.push('/auth/login')
    }
  }, [user, loading, error, requireAuth, router])

  // Estados de loading e erro
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">🔄 Carregando usuário...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">❌ Erro de autenticação</div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error.message}</p>
          <button 
            onClick={() => router.push('/auth/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Ir para Login
          </button>
        </div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">🚪 Usuário não está logado</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Componente para páginas que precisam do usuário
interface WithUserProps {
  children: (user: NonNullable<ReturnType<typeof useUser>['user']>) => React.ReactNode
}

export function WithUser({ children }: WithUserProps) {
  const { user, loading, error } = useUser()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">🔄 Carregando usuário...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">❌ Erro de autenticação</div>
          <p className="text-gray-600 dark:text-gray-300">{error?.message || 'Usuário não encontrado'}</p>
        </div>
      </div>
    )
  }

  return <>{children(user)}</>
}