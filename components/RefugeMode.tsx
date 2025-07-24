"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import type { RefugeSession, RefugeModeSettings } from "@/lib/self-awareness-types"
import { Shield, Heart, Lightbulb, Settings, Play } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const copingStrategies = [
  "Respiração profunda",
  "Alongamento suave",
  "Música calma",
  "Escrita livre",
  "Meditação guiada",
  "Caminhada lenta",
  "Hidratação",
  "Contato com a natureza",
  "Abraço em almofada",
  "Aromaterapia",
]

export default function RefugeMode() {
  const [isRefugeModeActive, setIsRefugeModeActive] = useState(false)
  const [currentSession, setCurrentSession] = useState<RefugeSession | null>(null)
  const [refugeSettings, setRefugeSettings] = useState<RefugeModeSettings>({
    mode: "normal",
    reduce_animations: false,
    high_contrast: false,
    larger_text: false,
    hide_distractions: false,
  })
  const [sessionData, setSessionData] = useState({
    trigger_description: "",
    selected_strategies: [] as string[],
    notes: "",
  })
  const [sessionTimer, setSessionTimer] = useState(0)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRefugeModeActive && currentSession) {
      interval = setInterval(() => {
        setSessionTimer((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRefugeModeActive, currentSession])

  const startRefugeSession = async () => {
    const { data, error } = await supabase
      .from("refuge_sessions")
      .insert([
        {
          trigger_description: sessionData.trigger_description,
          coping_strategies: sessionData.selected_strategies,
          notes: sessionData.notes,
        },
      ])
      .select()
      .single()

    if (error) {
      toast({
        title: "Erro ao iniciar sessão",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    setCurrentSession(data)
    setIsRefugeModeActive(true)
    setSessionTimer(0)

    toast({
      title: "Modo Refúgio Ativado",
      description: "Você está em um espaço seguro. Respire fundo e cuide de si.",
    })
  }

  const endRefugeSession = async (effectiveness: number) => {
    if (!currentSession) return

    const duration = Math.floor(sessionTimer / 60)

    const { error } = await supabase
      .from("refuge_sessions")
      .update({
        duration_minutes: duration,
        effectiveness_rating: effectiveness,
        ended_at: new Date().toISOString(),
      })
      .eq("id", currentSession.id)

    if (error) {
      toast({
        title: "Erro ao finalizar sessão",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    setIsRefugeModeActive(false)
    setCurrentSession(null)
    setSessionTimer(0)
    setSessionData({
      trigger_description: "",
      selected_strategies: [],
      notes: "",
    })

    toast({
      title: "Sessão Finalizada",
      description: `Você passou ${duration} minutos em modo refúgio. Bem feito!`,
    })
  }

  const toggleStrategy = (strategy: string) => {
    setSessionData((prev) => ({
      ...prev,
      selected_strategies: prev.selected_strategies.includes(strategy)
        ? prev.selected_strategies.filter((s) => s !== strategy)
        : [...prev.selected_strategies, strategy],
    }))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (isRefugeModeActive && currentSession) {
    return (
      <div
        className={`min-h-screen p-4 transition-all duration-300 ${
          refugeSettings.mode === "minimal"
            ? "bg-gray-50"
            : refugeSettings.mode === "simplified"
              ? "bg-blue-50"
              : "bg-gradient-to-br from-blue-50 to-indigo-50"
        }`}
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="border-blue-200 shadow-lg">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-blue-800">Modo Refúgio Ativo</CardTitle>
              </div>
              <div className="text-3xl font-mono text-blue-600">{formatTime(sessionTimer)}</div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Você está em um espaço seguro. Respire fundo e use as estratégias que selecionou.
                </p>
              </div>

              {sessionData.selected_strategies.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Suas Estratégias de Apoio
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {sessionData.selected_strategies.map((strategy, index) => (
                      <Badge key={index} variant="secondary" className="p-2 justify-center">
                        {strategy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="font-medium text-gray-800">Como você está se sentindo agora?</h4>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant="outline"
                      onClick={() => endRefugeSession(rating)}
                      className="h-16 flex flex-col items-center justify-center"
                    >
                      <span className="text-2xl mb-1">
                        {rating === 1 ? "😰" : rating === 2 ? "😟" : rating === 3 ? "😐" : rating === 4 ? "😌" : "😊"}
                      </span>
                      <span className="text-xs">{rating}</span>
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Clique em como você se sente para finalizar a sessão
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Modo Refúgio
          </h2>
          <p className="text-gray-600 mt-1">Um espaço seguro para momentos de sobrecarga sensorial ou emocional</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações do Refúgio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mode">Modo de Interface</Label>
              <Select
                value={refugeSettings.mode}
                onValueChange={(value: any) => setRefugeSettings((prev) => ({ ...prev, mode: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="simplified">Simplificado</SelectItem>
                  <SelectItem value="minimal">Minimalista</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="animations">Reduzir animações</Label>
                <Switch
                  id="animations"
                  checked={refugeSettings.reduce_animations}
                  onCheckedChange={(checked) => setRefugeSettings((prev) => ({ ...prev, reduce_animations: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="contrast">Alto contraste</Label>
                <Switch
                  id="contrast"
                  checked={refugeSettings.high_contrast}
                  onCheckedChange={(checked) => setRefugeSettings((prev) => ({ ...prev, high_contrast: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="text">Texto maior</Label>
                <Switch
                  id="text"
                  checked={refugeSettings.larger_text}
                  onCheckedChange={(checked) => setRefugeSettings((prev) => ({ ...prev, larger_text: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="distractions">Ocultar distrações</Label>
                <Switch
                  id="distractions"
                  checked={refugeSettings.hide_distractions}
                  onCheckedChange={(checked) => setRefugeSettings((prev) => ({ ...prev, hide_distractions: checked }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Iniciar Sessão de Refúgio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="trigger">O que está causando desconforto? (opcional)</Label>
              <Textarea
                id="trigger"
                value={sessionData.trigger_description}
                onChange={(e) => setSessionData((prev) => ({ ...prev, trigger_description: e.target.value }))}
                placeholder="Descreva brevemente o que você está sentindo..."
                rows={3}
              />
            </div>

            <div>
              <Label>Estratégias de Apoio</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {copingStrategies.map((strategy) => (
                  <Button
                    key={strategy}
                    variant={sessionData.selected_strategies.includes(strategy) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleStrategy(strategy)}
                    className="justify-start text-xs"
                  >
                    {strategy}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notas adicionais (opcional)</Label>
              <Textarea
                id="notes"
                value={sessionData.notes}
                onChange={(e) => setSessionData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Qualquer coisa que possa ajudar..."
                rows={2}
              />
            </div>

            <Button onClick={startRefugeSession} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
              <Shield className="h-4 w-4 mr-2" />
              Ativar Modo Refúgio
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Dica para o Modo Refúgio:</p>
              <p>
                Este espaço foi criado para momentos de sobrecarga. Não há pressa - use o tempo que precisar. Lembre-se:
                cuidar de si mesmo não é egoísmo, é necessário.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
