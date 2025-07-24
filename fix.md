// =====================================================
// CORREÇÃO ESPECÍFICA - DEBUG E SOLUÇÃO
// =====================================================

// 1. PRIMEIRO: DEBUG PARA ENTENDER O PROBLEMA
console.log('=== DEBUG SUPABASE SESSION ===')

// Adicione isso no seu componente atual para debug:
export function DebugSession() {
  const [debug, setDebug] = useState(null)

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

  return (
    <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px' }}>
      <h3>🔍 DEBUG SESSION</h3>
      <pre>{JSON.stringify(debug, null, 2)}</pre>
    </div>
  )
}

// =====================================================
// 2. SOLUÇÃO CORRIGIDA - USE ESTA VERSÃO
// =====================================================

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Hook robusto para gerenciar usuário
export function useUser() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
          setError(err)
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

// =====================================================
// 3. FUNÇÕES CORRIGIDAS COM VALIDAÇÃO RIGOROSA
// =====================================================

export async function fetchAccessibilityPreferences(userId) {
  // VALIDAÇÃO CRÍTICA
  if (!userId || userId === 'undefined' || typeof userId !== 'string') {
    console.error('❌ USERID INVÁLIDO:', userId)
    throw new Error(`Usuário inválido: ${userId}`)
  }

  console.log('🔍 BUSCANDO ACCESSIBILITY para:', userId)

  try {
    const { data, error } = await supabase
      .from('accessibility_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.log('⚠️ ERRO/SEM DADOS:', error.code)
      // Se não encontrar, criar registro padrão
      if (error.code === 'PGRST116') {
        return await createDefaultAccessibilityPreferences(userId)
      }
      throw error
    }

    console.log('✅ ACCESSIBILITY ENCONTRADO:', data)
    return data
  } catch (err) {
    console.error('❌ ERRO ACCESSIBILITY:', err)
    throw err
  }
}

export async function fetchThemePreferences(userId) {
  if (!userId || userId === 'undefined' || typeof userId !== 'string') {
    throw new Error(`Usuário inválido: ${userId}`)
  }

  console.log('🔍 BUSCANDO THEME para:', userId)

  try {
    const { data, error } = await supabase
      .from('theme_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return await createDefaultThemePreferences(userId)
      }
      throw error
    }

    return data
  } catch (err) {
    console.error('❌ ERRO THEME:', err)
    throw err
  }
}

export async function fetchDailyGoals(userId) {
  if (!userId || userId === 'undefined' || typeof userId !== 'string') {
    throw new Error(`Usuário inválido: ${userId}`)
  }

  console.log('🔍 BUSCANDO GOALS para:', userId)

  try {
    const { data, error } = await supabase
      .from('daily_goals')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return await createDefaultDailyGoals(userId)
      }
      throw error
    }

    return data
  } catch (err) {
    console.error('❌ ERRO GOALS:', err)
    throw err
  }
}

// =====================================================
// 4. CRIAR REGISTROS PADRÃO SE NECESSÁRIO
// =====================================================

async function createDefaultAccessibilityPreferences(userId) {
  console.log('➕ CRIANDO ACCESSIBILITY PADRÃO para:', userId)
  
  const { data, error } = await supabase
    .from('accessibility_preferences')
    .insert([{ user_id: userId }])
    .select()
    .single()

  if (error) throw error
  return data
}

async function createDefaultThemePreferences(userId) {
  console.log('➕ CRIANDO THEME PADRÃO para:', userId)
  
  const { data, error } = await supabase
    .from('theme_preferences')
    .insert([{ user_id: userId }])
    .select()
    .single()

  if (error) throw error
  return data
}

async function createDefaultDailyGoals(userId) {
  console.log('➕ CRIANDO GOALS PADRÃO para:', userId)
  
  const { data, error } = await supabase
    .from('daily_goals')
    .insert([{ user_id: userId }])
    .select()
    .single()

  if (error) throw error
  return data
}

// =====================================================
// 5. COMPONENTE EXEMPLO COM VALIDAÇÃO RIGOROSA
// =====================================================

export function UserPreferences() {
  const { user, loading: userLoading, error: userError } = useUser()
  const [preferences, setPreferences] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log('👤 USER STATE:', { user: user?.id, loading: userLoading })
    
    // SÓ CARREGAR SE: não está loading E tem usuário E tem ID válido
    if (!userLoading && user?.id && user.id !== 'undefined') {
      loadPreferences()
    } else if (!userLoading && !user) {
      console.log('⚠️ USUÁRIO NÃO LOGADO')
      setError('Usuário não está logado')
    }
  }, [user, userLoading])

  const loadPreferences = async () => {
    console.log('🔄 CARREGANDO PREFERÊNCIAS para:', user.id)
    
    setLoading(true)
    setError(null)

    try {
      const [accessibility, theme, goals] = await Promise.all([
        fetchAccessibilityPreferences(user.id),
        fetchThemePreferences(user.id),
        fetchDailyGoals(user.id)
      ])

      setPreferences({ accessibility, theme, goals })
      console.log('✅ PREFERÊNCIAS CARREGADAS')
    } catch (err) {
      console.error('❌ ERRO CARREGANDO PREFERÊNCIAS:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Estados de loading e erro
  if (userLoading) return <div>🔄 Carregando usuário...</div>
  if (userError) return <div>❌ Erro de autenticação: {userError.message}</div>
  if (!user) return <div>🚪 Usuário não está logado</div>
  
  if (loading) return <div>📋 Carregando preferências...</div>
  if (error) return <div>❌ Erro: {error}</div>

  return (
    <div>
      <h2>⚙️ Preferências do Usuário</h2>
      <p><strong>ID:</strong> {user.id}</p>
      <p><strong>Email:</strong> {user.email}</p>
      
      {preferences ? (
        <div>
          <h3>✅ Preferências carregadas!</h3>
          <details>
            <summary>Ver dados</summary>
            <pre>{JSON.stringify(preferences, null, 2)}</pre>
          </details>
        </div>
      ) : (
        <button onClick={loadPreferences}>🔄 Recarregar</button>
      )}
    </div>
  )
}