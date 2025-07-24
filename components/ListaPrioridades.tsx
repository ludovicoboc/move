"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Prioridade } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { History, Info } from "lucide-react"

export default function ListaPrioridades() {
  const [prioridades, setPrioridades] = useState<Prioridade[]>([])
  const [novaPrioridade, setNovaPrioridade] = useState("")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchPrioridades()
  }, [])

  const fetchPrioridades = async () => {
    try {
      const { data, error } = await supabase
        .from("prioridades")
        .select("*")
        .eq("data", new Date().toISOString().split("T")[0])
        .order("created_at")

      if (error) throw error
      setPrioridades(data || [])
    } catch (error) {
      console.error("Erro ao buscar prioridades:", error)
    } finally {
      setLoading(false)
    }
  }

  const adicionarPrioridade = async () => {
    if (!novaPrioridade.trim()) return

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("prioridades").insert({
        user_id: user.id,
        titulo: novaPrioridade.trim(),
      })

      if (error) throw error

      setNovaPrioridade("")
      fetchPrioridades()
    } catch (error) {
      console.error("Erro ao adicionar prioridade:", error)
    }
  }

  const togglePrioridade = async (id: string, concluida: boolean) => {
    try {
      const { error } = await supabase.from("prioridades").update({ concluida: !concluida }).eq("id", id)

      if (error) throw error
      fetchPrioridades()
    } catch (error) {
      console.error("Erro ao atualizar prioridade:", error)
    }
  }

  const deletarPrioridade = async (id: string) => {
    try {
      const { error } = await supabase.from("prioridades").delete().eq("id", id)

      if (error) throw error
      fetchPrioridades()
    } catch (error) {
      console.error("Erro ao deletar prioridade:", error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prioridades do Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Prioridades do Dia</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-2" />
            Ver Histórico
          </Button>
          <span className="text-sm text-gray-500">Hoje</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {prioridades.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Nenhuma prioridade definida para hoje.</p>
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-4">Nenhum medicamento diário cadastrado</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {prioridades.map((prioridade) => (
              <div key={prioridade.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                <Checkbox
                  checked={prioridade.concluida}
                  onCheckedChange={() => togglePrioridade(prioridade.id, prioridade.concluida)}
                />
                <div className={`flex-1 ${prioridade.concluida ? "line-through text-gray-500" : ""}`}>
                  {prioridade.titulo}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deletarPrioridade(prioridade.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            placeholder="Nova prioridade..."
            value={novaPrioridade}
            onChange={(e) => setNovaPrioridade(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                adicionarPrioridade()
              }
            }}
            className="flex-1"
          />
          <Button onClick={adicionarPrioridade}>
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
