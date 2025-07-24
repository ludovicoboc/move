"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { ThemePreferences } from "@/lib/profile-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Palette, Monitor, Sun, Moon, Layout, Sparkles } from "lucide-react"
import { AVAILABLE_COLORS } from "@/lib/profile-types"

interface ThemeCustomizationProps {
  userId: string
}

export default function ThemeCustomization({ userId }: ThemeCustomizationProps) {
  const [preferences, setPreferences] = useState<ThemePreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchPreferences()
  }, [userId])

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase.from("theme_preferences").select("*").eq("user_id", userId).single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      if (data) {
        setPreferences(data)
      } else {
        // Create default preferences
        const { data: newPrefs, error: insertError } = await supabase
          .from("theme_preferences")
          .insert({ user_id: userId })
          .select()
          .single()

        if (insertError) throw insertError
        setPreferences(newPrefs)
      }
    } catch (error) {
      console.error("Erro ao buscar preferências de tema:", error)
    } finally {
      setLoading(false)
    }
  }

  const updatePreference = async (key: keyof ThemePreferences, value: any) => {
    if (!preferences) return

    try {
      const { error } = await supabase
        .from("theme_preferences")
        .update({
          [key]: value,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      if (error) throw error

      setPreferences({ ...preferences, [key]: value })
    } catch (error) {
      console.error("Erro ao atualizar preferência de tema:", error)
    }
  }

  const getThemeIcon = (mode: string) => {
    switch (mode) {
      case "light":
        return <Sun className="h-4 w-4" />
      case "dark":
        return <Moon className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Personalização de Tema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!preferences) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Personalização de Tema
        </CardTitle>
        <p className="text-sm text-gray-600">Personalize a aparência da aplicação de acordo com suas preferências</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Mode */}
        <div className="space-y-2">
          <Label>Modo do Tema</Label>
          <Select value={preferences.theme_mode} onValueChange={(value) => updatePreference("theme_mode", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Sistema (Automático)
                </div>
              </SelectItem>
              <SelectItem value="light">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  Claro
                </div>
              </SelectItem>
              <SelectItem value="dark">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  Escuro
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Color Scheme */}
        <div>
          <h3 className="text-sm font-medium mb-4">Esquema de Cores</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Cor Primária</Label>
              <div className="grid grid-cols-4 gap-2">
                {AVAILABLE_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => updatePreference("primary_color", color.value)}
                    className={`
                      flex items-center gap-2 p-2 rounded-md border transition-all
                      ${
                        preferences.primary_color === color.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    <div className={`w-4 h-4 rounded-full ${color.class}`} />
                    <span className="text-xs">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cor de Destaque</Label>
              <div className="grid grid-cols-4 gap-2">
                {AVAILABLE_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => updatePreference("accent_color", color.value)}
                    className={`
                      flex items-center gap-2 p-2 rounded-md border transition-all
                      ${
                        preferences.accent_color === color.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    <div className={`w-4 h-4 rounded-full ${color.class}`} />
                    <span className="text-xs">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Layout Preferences */}
        <div>
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Preferências de Layout
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Estilo da Barra Lateral</Label>
              <Select
                value={preferences.sidebar_style}
                onValueChange={(value) => updatePreference("sidebar_style", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Padrão</SelectItem>
                  <SelectItem value="compact">Compacto</SelectItem>
                  <SelectItem value="minimal">Minimalista</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estilo dos Cartões</Label>
              <Select value={preferences.card_style} onValueChange={(value) => updatePreference("card_style", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Padrão</SelectItem>
                  <SelectItem value="minimal">Minimalista</SelectItem>
                  <SelectItem value="bordered">Com Bordas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Animation Level */}
        <div>
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Nível de Animação
          </h3>
          <Select
            value={preferences.animation_level}
            onValueChange={(value) => updatePreference("animation_level", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma</SelectItem>
              <SelectItem value="reduced">Reduzida</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="enhanced">Aprimorada</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">Controla a quantidade de animações e transições na interface</p>
        </div>

        <div className="text-xs text-gray-500 pt-4 border-t">
          <p>As alterações de tema são aplicadas imediatamente e sincronizadas em todos os seus dispositivos.</p>
        </div>
      </CardContent>
    </Card>
  )
}
