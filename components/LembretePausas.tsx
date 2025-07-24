"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { LembretePausa } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Clock, Coffee } from "lucide-react"

export default function LembretePausas() {
  const [lembrete, setLembrete] = useState<LembretePausa | null>(null)
  const [proximaPausa, setProximaPausa] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchLembrete()
    const interval = setInterval(checkPausa, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

  const fetchLembrete = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase.from("lembretes_pausas").select("*").eq("user_id", user.id).single()

      if (error && error.code !== "PGRST116") throw error

      if (data) {
        setLembrete(data)
        calcularProximaPausa(data)
      } else {
        // Create default reminder
        const { data: newLembrete, error: insertError } = await supabase
          .from("lembretes_pausas")
          .insert({
            user_id: user.id,
            intervalo_minutos: 60,
            ativo: true,
          })
          .select()
          .single()

        if (insertError) throw insertError
        setLembrete(newLembrete)
        calcularProximaPausa(newLembrete)
      }
    } catch (error) {
      console.error("Erro ao buscar lembrete:", error)
    } finally {
      setLoading(false)
    }
  }

  const calcularProximaPausa = (lembreteData: LembretePausa) => {
    if (!lembreteData.ativo) {
      setProximaPausa(null)
      return
    }

    const agora = new Date()
    const ultimoLembrete = lembreteData.ultimo_lembrete ? new Date(lembreteData.ultimo_lembrete) : agora

    const proxima = new Date(ultimoLembrete.getTime() + lembreteData.intervalo_minutos * 60000)

    if (proxima <= agora) {
      // Time for a break!
      setProximaPausa(agora)
      mostrarNotificacaoPausa()
    } else {
      setProximaPausa(proxima)
    }
  }

  const mostrarNotificacaoPausa = () => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Hora da Pausa! 🧘‍♀️", {
        body: "É hora de fazer uma pausa para alongamento e descanso.",
        icon: "/favicon.ico",
      })
    }
  }

  const checkPausa = () => {
    if (lembrete && lembrete.ativo) {
      calcularProximaPausa(lembrete)
    }
  }

  const toggleAtivo = async (ativo: boolean) => {
    if (!lembrete) return

    try {
      const { error } = await supabase.from("lembretes_pausas").update({ ativo }).eq("id", lembrete.id)

      if (error) throw error

      setLembrete({ ...lembrete, ativo })
      if (ativo) {
        calcularProximaPausa({ ...lembrete, ativo })
      } else {
        setProximaPausa(null)
      }
    } catch (error) {
      console.error("Erro ao atualizar lembrete:", error)
    }
  }

  const atualizarIntervalo = async (intervalo: string) => {
    if (!lembrete) return

    const intervaloMinutos = Number.parseInt(intervalo)

    try {
      const { error } = await supabase
        .from("lembretes_pausas")
        .update({ intervalo_minutos: intervaloMinutos })
        .eq("id", lembrete.id)

      if (error) throw error

      const lembreteAtualizado = { ...lembrete, intervalo_minutos: intervaloMinutos }
      setLembrete(lembreteAtualizado)
      calcularProximaPausa(lembreteAtualizado)
    } catch (error) {
      console.error("Erro ao atualizar intervalo:", error)
    }
  }

  const marcarPausaFeita = async () => {
    if (!lembrete) return

    try {
      const agora = new Date().toISOString()
      const { error } = await supabase.from("lembretes_pausas").update({ ultimo_lembrete: agora }).eq("id", lembrete.id)

      if (error) throw error

      const lembreteAtualizado = { ...lembrete, ultimo_lembrete: agora }
      setLembrete(lembreteAtualizado)
      calcularProximaPausa(lembreteAtualizado)
    } catch (error) {
      console.error("Erro ao marcar pausa:", error)
    }
  }

  const solicitarPermissaoNotificacao = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission()
    }
  }

  useEffect(() => {
    solicitarPermissaoNotificacao()
  }, [])

  const formatarTempo = (data: Date) => {
    return data.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const tempoRestante = proximaPausa ? Math.max(0, proximaPausa.getTime() - Date.now()) : 0
  const minutosRestantes = Math.floor(tempoRestante / 60000)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lembrete de Pausas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Lembrete de Pausas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Ativar lembretes</span>
          <Switch checked={lembrete?.ativo || false} onCheckedChange={toggleAtivo} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Intervalo entre pausas</label>
          <Select
            value={lembrete?.intervalo_minutos.toString()}
            onValueChange={atualizarIntervalo}
            disabled={!lembrete?.ativo}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 minutos</SelectItem>
              <SelectItem value="45">45 minutos</SelectItem>
              <SelectItem value="60">1 hora</SelectItem>
              <SelectItem value="90">1h 30min</SelectItem>
              <SelectItem value="120">2 horas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {lembrete?.ativo && proximaPausa && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {tempoRestante <= 0 ? "Hora da Pausa!" : "Próxima pausa"}
              </span>
            </div>

            {tempoRestante <= 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-orange-600">
                  <Coffee className="h-5 w-5" />
                  <span className="font-medium">É hora de fazer uma pausa!</span>
                </div>
                <Button onClick={marcarPausaFeita} size="sm" className="w-full">
                  Pausa Concluída
                </Button>
              </div>
            ) : (
              <div className="text-sm text-blue-600">
                {formatarTempo(proximaPausa)} ({minutosRestantes} min restantes)
              </div>
            )}
          </div>
        )}

        {!lembrete?.ativo && (
          <div className="text-center text-gray-500 py-4">
            <Coffee className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Lembretes de pausa desativados</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
