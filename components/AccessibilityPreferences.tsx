"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { AccessibilityPreferences } from "@/lib/profile-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Eye, Volume2, Keyboard, Palette, Zap } from "lucide-react"

interface AccessibilityPreferencesProps {
  userId: string
}

export default function AccessibilityPreferences({ userId }: AccessibilityPreferencesProps) {
  const [preferences, setPreferences] = useState<AccessibilityPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchPreferences()
  }, [userId])

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from("accessibility_preferences")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      if (data) {
        setPreferences(data)
      } else {
        // Create default preferences
        const { data: newPrefs, error: insertError } = await supabase
          .from("accessibility_preferences")
          .insert({ user_id: userId })
          .select()
          .single()

        if (insertError) throw insertError
        setPreferences(newPrefs)
      }
    } catch (error) {
      console.error("Erro ao buscar preferências de acessibilidade:", error)
    } finally {
      setLoading(false)
    }
  }

  const updatePreference = async (key: keyof AccessibilityPreferences, value: any) => {
    if (!preferences) return

    try {
      const { error } = await supabase
        .from("accessibility_preferences")
        .update({
          [key]: value,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      if (error) throw error

      setPreferences({ ...preferences, [key]: value })
    } catch (error) {
      console.error("Erro ao atualizar preferência:", error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preferências de Acessibilidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => (
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Preferências de Acessibilidade
        </CardTitle>
        <p className="text-sm text-gray-600">Configure as opções de acessibilidade para melhorar sua experiência</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visual Preferences */}
        <div>
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Preferências Visuais
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="high-contrast">Alto Contraste</Label>
                <p className="text-xs text-gray-500">Aumenta o contraste para melhor legibilidade</p>
              </div>
              <Switch
                id="high-contrast"
                checked={preferences.high_contrast}
                onCheckedChange={(checked) => updatePreference("high_contrast", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="reduced-stimuli">Redução de Estímulos</Label>
                <p className="text-xs text-gray-500">Remove animações e reduz cores intensas</p>
              </div>
              <Switch
                id="reduced-stimuli"
                checked={preferences.reduced_stimuli}
                onCheckedChange={(checked) => updatePreference("reduced_stimuli", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="large-text">Texto Grande</Label>
                <p className="text-xs text-gray-500">Aumenta o tamanho do texto em toda a aplicação</p>
              </div>
              <Switch
                id="large-text"
                checked={preferences.large_text}
                onCheckedChange={(checked) => updatePreference("large_text", checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Multiplicador de Tamanho do Texto: {preferences.text_size_multiplier}x</Label>
              <Slider
                value={[preferences.text_size_multiplier]}
                onValueChange={([value]) => updatePreference("text_size_multiplier", value)}
                min={0.8}
                max={2.0}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Menor</span>
                <span>Normal</span>
                <span>Maior</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color-blind-support">Suporte para Daltonismo</Label>
              <Select
                value={preferences.color_blind_support}
                onValueChange={(value) => updatePreference("color_blind_support", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  <SelectItem value="deuteranopia">Deuteranopia (Verde-Vermelho)</SelectItem>
                  <SelectItem value="protanopia">Protanopia (Vermelho-Verde)</SelectItem>
                  <SelectItem value="tritanopia">Tritanopia (Azul-Amarelo)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Motion and Animation */}
        <div>
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Movimento e Animação
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="reduced-motion">Movimento Reduzido</Label>
                <p className="text-xs text-gray-500">Reduz ou remove animações e transições</p>
              </div>
              <Switch
                id="reduced-motion"
                checked={preferences.reduced_motion}
                onCheckedChange={(checked) => updatePreference("reduced_motion", checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Navigation and Interaction */}
        <div>
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            Navegação e Interação
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="keyboard-navigation">Navegação por Teclado</Label>
                <p className="text-xs text-gray-500">Otimiza a navegação usando apenas o teclado</p>
              </div>
              <Switch
                id="keyboard-navigation"
                checked={preferences.keyboard_navigation}
                onCheckedChange={(checked) => updatePreference("keyboard_navigation", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="focus-indicators">Indicadores de Foco</Label>
                <p className="text-xs text-gray-500">Mostra claramente qual elemento está selecionado</p>
              </div>
              <Switch
                id="focus-indicators"
                checked={preferences.focus_indicators}
                onCheckedChange={(checked) => updatePreference("focus_indicators", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="screen-reader">Suporte a Leitor de Tela</Label>
                <p className="text-xs text-gray-500">Otimiza a experiência para leitores de tela</p>
              </div>
              <Switch
                id="screen-reader"
                checked={preferences.screen_reader_support}
                onCheckedChange={(checked) => updatePreference("screen_reader_support", checked)}
              />
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 pt-4 border-t">
          <p className="flex items-center gap-1">
            <Volume2 className="h-3 w-3" />
            As preferências visuais são aplicadas imediatamente e salvas automaticamente para uso futuro.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
