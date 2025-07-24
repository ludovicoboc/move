"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Accessibility, Palette, Target, Bell, Database, RefreshCw, Loader2 } from "lucide-react"
import BasicInformation from "./BasicInformation"
import AccessibilityPreferences from "./AccessibilityPreferences"
import ThemeCustomization from "./ThemeCustomization"
import DailyGoalsSettings from "./DailyGoalsSettings"
import NotificationSettings from "./NotificationSettings"
import DataManagement from "./DataManagement"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import type { ProfileData } from "@/lib/profile-types"
import { fetchAllUserPreferences } from "@/lib/user-preferences"

interface ProfileDashboardProps {
  user: SupabaseUser
}

export default function ProfileDashboard({ user }: ProfileDashboardProps) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("basic")
  const supabase = createClient()

  useEffect(() => {
    loadProfileData()
  }, [])

  const loadProfileData = async () => {
    console.log('🔄 CARREGANDO PREFERÊNCIAS PROFILE para:', user.id)
    
    try {
      setIsLoading(true)

      // Usar as novas funções com validação rigorosa
      const preferences = await fetchAllUserPreferences(user.id)

      if (
        preferences.profile &&
        preferences.accessibility &&
        preferences.theme &&
        preferences.goals &&
        preferences.notifications
      ) {
        setProfileData({
          profile: preferences.profile,
          accessibility: preferences.accessibility,
          theme: preferences.theme,
          goals: preferences.goals,
          notifications: preferences.notifications,
        })
        console.log('✅ PREFERÊNCIAS PROFILE CARREGADAS')
      }
    } catch (error) {
      console.error('❌ ERRO CARREGANDO PREFERÊNCIAS PROFILE:', error)
      // Ainda assim tentar definir dados padrão se possível
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileUpdate = (updatedData: any, section: keyof ProfileData) => {
    if (profileData) {
      setProfileData({
        ...profileData,
        [section]: updatedData,
      })
    }
  }

  const handleReset = async () => {
    if (confirm("Tem certeza que deseja redefinir todas as configurações para os valores padrão?")) {
      await loadProfileData()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Erro ao Carregar Perfil</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">Não foi possível carregar os dados do perfil.</p>
            <Button onClick={loadProfileData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {profileData.profile.display_name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Informações Pessoais</h1>
            <p className="text-gray-600 dark:text-gray-300">Gerencie suas preferências e configurações</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Redefinir
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Básico</span>
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="flex items-center gap-2">
            <Accessibility className="h-4 w-4" />
            <span className="hidden sm:inline">Acessibilidade</span>
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Tema</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Metas</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Dados</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <BasicInformation
            profile={profileData.profile}
            onUpdate={(profile) => handleProfileUpdate(profile, "profile")}
          />
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-6">
          <AccessibilityPreferences
            userId={user.id}
          />
        </TabsContent>

        <TabsContent value="theme" className="space-y-6">
          <ThemeCustomization
            userId={user.id}
          />
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <DailyGoalsSettings userId={user.id} />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings
            userId={user.id}
          />
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <DataManagement userId={profileData.profile.user_id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
