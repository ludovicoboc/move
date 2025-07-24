"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

// Hook robusto para gerenciar usuário
export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    const getSession = async () => {
      try {
        // Buscar sessão atual
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error
        
        if (mounted) {
          console.log('👤 SESSION LOADED:', session?.user?.id)
          setUser(session?.user || null)
          setLoading(false)
        }
      } catch (err) {
        console.error('❌ ERRO SESSION:', err)
        if (mounted) {
          setError(err as Error)
          setLoading(false)
        }
      }
    }

    // Buscar sessão inicial
    getSession()

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 AUTH CHANGE:', event, session?.user?.id)
        
        if (mounted) {
          setUser(session?.user || null)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading, error }
}

// Componente de debug para desenvolvimento
export function DebugSession() {
  const [debug, setDebug] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      console.log('🔍 DEBUG SESSION:', {
        session: session,
        user: session?.user,
        userId: session?.user?.id,
        error: error
      })
      
      setDebug({
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        error: error?.message
      })
    }

    checkSession()
  }, [])

  return debug
}