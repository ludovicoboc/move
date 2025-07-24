"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { NotificationPreferences } from "@/lib/profile-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Bell,
  Eye,
  Coffee,
  CheckSquare,
  Utensils,
  Moon,
  BookOpen,
  Mail,
  Smartphone,
  Volume2,
  Vibrate,
} from "lucide-react"

interface NotificationSettingsProps {
  userId: string
}

export default function NotificationSettings({ userId }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchPreferences()
  }, [userId])

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase.from("notification_preferences").select("*").eq("user_id", userId).single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      if (data) {
        setPreferences(data)
      } else {
        // Create default preferences
        const { data: newPrefs, error: insertError } = await supabase
          .from("notification_preferences")
          .insert({ user_id: userId })
          .select()
          .single()

        if (insertError) throw insertError
        setPreferences(newPrefs)
      }
    } catch (error) {
      console.error("Erro ao buscar preferências de notificação:", error)
    } finally {
      setLoading(false)
    }
  }

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return

    try {
      const { error } = await supabase
        .from("notification_preferences")
        .update({
          [key]: value,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      if (error) throw error

      setPreferences({ ...preferences, [key]: value })
    } catch (error) {
      console.error("Erro ao atualizar preferência de notificação:", error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configurações de Notificação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!preferences) return null

  const notificationTypes = [
    {
      key: "visual_reminders" as keyof NotificationPreferences,
      label: "Lembretes Visuais",
      description: "Exibir lembretes visuais no painel",
      icon: Eye,
      value: preferences.visual_reminders,
    },
    {
      key: "scheduled_breaks" as keyof NotificationPreferences,
      label: "Pausas Programadas",
      description: "Lembretes para fazer pausas",
      icon: Coffee,
      value: preferences.scheduled_breaks,
    },
    {
      key: "task_reminders" as keyof NotificationPreferences,
      label: "Lembretes de Tarefas",
      description: "Notificações sobre tarefas pendentes",
      icon: CheckSquare,
      value: preferences.task_reminders,
    },
    {
      key: "meal_reminders" as keyof NotificationPreferences,
      label: "Lembretes de Refeição",
      description: "Horários de refeições e hidratação",
      icon: Utensils,
      value: preferences.meal_reminders,
    },
    {
      key: "sleep_reminders" as keyof NotificationPreferences,
      label: "Lembretes de Sono",
      description: "Horários para dormir e acordar",
      icon: Moon,
      value: preferences.sleep_reminders,
    },
    {
      key: "study_reminders" as keyof NotificationPreferences,
      label: "Lembretes de Estudo",
      description: "Sessões de estudo programadas",
      icon: BookOpen,
      value: preferences.study_reminders,
    },
  ]

  const deliveryMethods = [
    {
      key: "email_notifications" as keyof NotificationPreferences,
      label: "Notificações por Email",
      description: "Receber notificações por email",
      icon: Mail,
      value: preferences.email_notifications,
    },
    {
      key: "push_notifications" as keyof NotificationPreferences,
      label: "Notificações Push",
      description: "Notificações do navegador",
      icon: Smartphone,
      value: preferences.push_notifications,
    },
    {
      key: "sound_notifications" as keyof NotificationPreferences,
      label: "Notificações Sonoras",
      description: "Reproduzir sons para notificações",
      icon: Volume2,
      value: preferences.sound_notifications,
    },
    {
      key: "vibration_notifications" as keyof NotificationPreferences,
      label: "Notificações por Vibração",
      description: "Vibrar em dispositivos móveis",
      icon: Vibrate,
      value: preferences.vibration_notifications,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Configurações de Notificação
        </CardTitle>
        <p className="text-sm text-gray-600">Configure como e quando você deseja receber notificações</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Types */}
        <div>
          <h3 className="text-sm font-medium mb-4">Tipos de Notificação</h3>
          <div className="space-y-4">
            {notificationTypes.map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-50">
                    <item.icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={item.key}>{item.label}</Label>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </div>
                <Switch
                  id={item.key}
                  checked={item.value}
                  onCheckedChange={(checked) => updatePreference(item.key, checked)}
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Delivery Methods */}
        <div>
          <h3 className="text-sm font-medium mb-4">Métodos de Entrega</h3>
          <div className="space-y-4">
            {deliveryMethods.map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-50">
                    <item.icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={item.key}>{item.label}</Label>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </div>
                <Switch
                  id={item.key}
                  checked={item.value}
                  onCheckedChange={(checked) => updatePreference(item.key, checked)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-900 mb-2">⚠️ Importante</h4>
          <p className="text-sm text-yellow-800">
            Para receber notificações push, você precisa permitir notificações no seu navegador. As notificações por
            email são enviadas apenas para eventos importantes.
          </p>
        </div>

        <div className="text-xs text-gray-500">
          <p>Você pode ajustar essas configurações a qualquer momento. As alterações são aplicadas imediatamente.</p>
        </div>
      </CardContent>
    </Card>
  )
}
