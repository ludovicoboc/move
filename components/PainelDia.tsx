"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { PainelDiaItem } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Clock } from "lucide-react"

export default function PainelDia() {
  const [items, setItems] = useState<PainelDiaItem[]>([])
  const [novoHorario, setNovoHorario] = useState("")
  const [novaAtividade, setNovaAtividade] = useState("")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const cores = ["blue", "green", "orange", "red", "purple", "pink"]

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("painel_dia")
        .select("*")
        .eq("data", new Date().toISOString().split("T")[0])
        .order("horario")

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error("Erro ao buscar itens:", error)
    } finally {
      setLoading(false)
    }
  }

  const adicionarItem = async () => {
    if (!novoHorario || !novaAtividade) return

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("painel_dia").insert({
        user_id: user.id,
        horario: novoHorario,
        atividade: novaAtividade,
        cor: cores[Math.floor(Math.random() * cores.length)],
      })

      if (error) throw error

      setNovoHorario("")
      setNovaAtividade("")
      fetchItems()
    } catch (error) {
      console.error("Erro ao adicionar item:", error)
    }
  }

  const toggleConcluida = async (id: string, concluida: boolean) => {
    try {
      const { error } = await supabase.from("painel_dia").update({ concluida: !concluida }).eq("id", id)

      if (error) throw error
      fetchItems()
    } catch (error) {
      console.error("Erro ao atualizar item:", error)
    }
  }

  const getCorClasse = (cor: string) => {
    const cores = {
      blue: "border-l-blue-500 bg-blue-50",
      green: "border-l-green-500 bg-green-50",
      orange: "border-l-orange-500 bg-orange-50",
      red: "border-l-red-500 bg-red-50",
      purple: "border-l-purple-500 bg-purple-50",
      pink: "border-l-pink-500 bg-pink-50",
    }
    return cores[cor as keyof typeof cores] || cores.blue
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Painel do Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Painel do Dia</CardTitle>
        <Button
          onClick={() => {
            const modal = document.getElementById("add-horario-modal")
            if (modal) modal.style.display = "block"
          }}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Horário
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhuma atividade programada para hoje.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`border-l-4 p-4 rounded-r-lg cursor-pointer transition-opacity ${
                item.concluida ? "opacity-50" : ""
              } ${getCorClasse(item.cor)}`}
              onClick={() => toggleConcluida(item.id, item.concluida)}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  {item.horario}
                </div>
                <div className={`flex-1 ${item.concluida ? "line-through" : ""}`}>{item.atividade}</div>
              </div>
            </div>
          ))
        )}

        {/* Modal para adicionar novo horário */}
        <div
          id="add-horario-modal"
          className="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              e.currentTarget.style.display = "none"
            }
          }}
        >
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Adicionar Novo Horário</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Horário</label>
                <Input type="time" value={novoHorario} onChange={(e) => setNovoHorario(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Atividade</label>
                <Input
                  type="text"
                  placeholder="Digite a atividade..."
                  value={novaAtividade}
                  onChange={(e) => setNovaAtividade(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={adicionarItem} className="flex-1">
                  Adicionar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const modal = document.getElementById("add-horario-modal")
                    if (modal) modal.style.display = "none"
                    setNovoHorario("")
                    setNovaAtividade("")
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
