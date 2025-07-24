"use client"

import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// =====================================================
// FUNÇÕES CORRIGIDAS COM VALIDAÇÃO RIGOROSA
// =====================================================

export async function fetchAccessibilityPreferences(userId: string) {
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

export async function fetchThemePreferences(userId: string) {
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

export async function fetchDailyGoals(userId: string) {
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

export async function fetchNotificationPreferences(userId: string) {
  if (!userId || userId === 'undefined' || typeof userId !== 'string') {
    throw new Error(`Usuário inválido: ${userId}`)
  }

  console.log('🔍 BUSCANDO NOTIFICATIONS para:', userId)

  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return await createDefaultNotificationPreferences(userId)
      }
      throw error
    }

    return data
  } catch (err) {
    console.error('❌ ERRO NOTIFICATIONS:', err)
    throw err
  }
}

export async function fetchUserProfile(userId: string) {
  if (!userId || userId === 'undefined' || typeof userId !== 'string') {
    throw new Error(`Usuário inválido: ${userId}`)
  }

  console.log('🔍 BUSCANDO PROFILE para:', userId)

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return await createDefaultUserProfile(userId)
      }
      throw error
    }

    return data
  } catch (err) {
    console.error('❌ ERRO PROFILE:', err)
    throw err
  }
}

// =====================================================
// CRIAR REGISTROS PADRÃO SE NECESSÁRIO
// =====================================================

async function createDefaultAccessibilityPreferences(userId: string) {
  console.log('➕ CRIANDO ACCESSIBILITY PADRÃO para:', userId)
  
  const { data, error } = await supabase
    .from('accessibility_preferences')
    .insert([{ user_id: userId }])
    .select()
    .single()

  if (error) throw error
  return data
}

async function createDefaultThemePreferences(userId: string) {
  console.log('➕ CRIANDO THEME PADRÃO para:', userId)
  
  const { data, error } = await supabase
    .from('theme_preferences')
    .insert([{ user_id: userId }])
    .select()
    .single()

  if (error) throw error
  return data
}

async function createDefaultDailyGoals(userId: string) {
  console.log('➕ CRIANDO GOALS PADRÃO para:', userId)
  
  const { data, error } = await supabase
    .from('daily_goals')
    .insert([{ user_id: userId }])
    .select()
    .single()

  if (error) throw error
  return data
}

async function createDefaultNotificationPreferences(userId: string) {
  console.log('➕ CRIANDO NOTIFICATIONS PADRÃO para:', userId)
  
  const { data, error } = await supabase
    .from('notification_preferences')
    .insert([{ user_id: userId }])
    .select()
    .single()

  if (error) throw error
  return data
}

async function createDefaultUserProfile(userId: string) {
  console.log('➕ CRIANDO PROFILE PADRÃO para:', userId)
  
  // Buscar dados do usuário para pegar email
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .insert([{ 
      user_id: userId,
      display_name: user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Usuário'
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

// =====================================================
// FUNÇÃO PARA CARREGAR TODAS AS PREFERÊNCIAS
// =====================================================

export async function fetchAllUserPreferences(userId: string) {
  if (!userId || userId === 'undefined' || typeof userId !== 'string') {
    throw new Error(`Usuário inválido: ${userId}`)
  }

  console.log('🔄 CARREGANDO TODAS AS PREFERÊNCIAS para:', userId)

  try {
    const [profile, accessibility, theme, goals, notifications] = await Promise.all([
      fetchUserProfile(userId),
      fetchAccessibilityPreferences(userId),
      fetchThemePreferences(userId),
      fetchDailyGoals(userId),
      fetchNotificationPreferences(userId)
    ])

    console.log('✅ TODAS AS PREFERÊNCIAS CARREGADAS')
    return { profile, accessibility, theme, goals, notifications }
  } catch (err) {
    console.error('❌ ERRO CARREGANDO TODAS AS PREFERÊNCIAS:', err)
    throw err
  }
}