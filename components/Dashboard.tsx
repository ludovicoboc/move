"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import PainelDia from "./PainelDia"
import ListaPrioridades from "./ListaPrioridades"
import LembretePausas from "./LembretePausas"
import AppLayout from "./AppLayout"
import { CheckCircle, Calendar, Clock, Utensils, BookOpen } from "lucide-react"
import Link from "next/link"

interface DashboardProps {
  user: User
}

export default function Dashboard({ user }: DashboardProps) {
  const [stats, setStats] = useState({
    prioridadesConcluidas: 0,
    totalPrioridades: 0,
    proximosCompromissos: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const hoje = new Date().toISOString().split("T")[0]

      // Fetch priorities stats
      const { data: prioridades } = await supabase.from("prioridades").select("concluida").eq("data", hoje)

      const totalPrioridades = prioridades?.length || 0
      const prioridadesConcluidas = prioridades?.filter((p) => p.concluida).length || 0

      // Fetch upcoming appointments
      const { data: compromissos } = await supabase
        .from("painel_dia")
        .select("*")
        .eq("data", hoje)
        .eq("concluida", false)

      setStats({
        prioridadesConcluidas,
        totalPrioridades,
        proximosCompromissos: compromissos?.length || 0,
      })
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error)
    } finally {
      setLoading(false)
    }
  }

  const porcentagemConcluida =
    stats.totalPrioridades > 0 ? Math.round((stats.prioridadesConcluidas / stats.totalPrioridades) * 100) : 0

  const getTempoRestanteTexto = () => {
    const agora = new Date()
    const horaAtual = agora.getHours()

    if (horaAtual < 12) {
      return "Bom dia! Aproveite sua manhã produtiva"
    } else if (horaAtual < 18) {
      return "Boa tarde! Continue focado em seus objetivos"
    } else {
      return "Finalizando o dia - Aproveite seu tempo com sabedoria"
    }
  }

  const headerActions = (
    <div className="flex items-center gap-2">
      <Link href="/food">
        <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent">
          <Utensils className="h-4 w-4 mr-2" />
          Alimentação
        </Button>
      </Link>
      <Link href="/recipes">
        <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent">
          <BookOpen className="h-4 w-4 mr-2" />
          Receitas
        </Button>
      </Link>
    </div>
  )

  return (
    <AppLayout user={user} title="Início" actions={headerActions}>
      <div className="mb-8">
        <p className="text-gray-600">Aqui está seu progresso e tarefas para hoje.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Prioridades Concluídas</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.prioridadesConcluidas}/{stats.totalPrioridades}
            </div>
            <p className="text-xs text-gray-500">{porcentagemConcluida}% das tarefas concluídas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Próximos Compromissos</CardTitle>
            <Calendar className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.proximosCompromissos}</div>
            <p className="text-xs text-gray-500">Atividades programadas para hoje</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tempo Restante</CardTitle>
            <Clock className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Finalizando o dia</div>
            <p className="text-xs text-gray-500">{getTempoRestanteTexto()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PainelDia />
        </div>
        <div className="space-y-6">
          <ListaPrioridades />
          <LembretePausas />
        </div>
      </div>
    </AppLayout>
  )
}
