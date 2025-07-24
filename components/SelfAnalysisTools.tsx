"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import type { SelfAnalysisMetric } from "@/lib/self-awareness-types"
import { BarChart3, TrendingUp, Calendar, Plus, Target } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const metricTypes = [
  { value: "mood", label: "Humor", color: "bg-blue-100 text-blue-800" },
  { value: "energy", label: "Energia", color: "bg-green-100 text-green-800" },
  { value: "stress", label: "Estresse", color: "bg-red-100 text-red-800" },
  { value: "focus", label: "Foco", color: "bg-purple-100 text-purple-800" },
  { value: "anxiety", label: "Ansiedade", color: "bg-orange-100 text-orange-800" },
  { value: "motivation", label: "Motivação", color: "bg-indigo-100 text-indigo-800" },
  { value: "social", label: "Social", color: "bg-pink-100 text-pink-800" },
  { value: "sleep", label: "Sono", color: "bg-cyan-100 text-cyan-800" },
]

export default function SelfAnalysisTools() {
  const [metrics, setMetrics] = useState<SelfAnalysisMetric[]>([])
  const [newMetric, setNewMetric] = useState({
    metric_name: "",
    metric_value: "",
    metric_type: "",
    notes: "",
  })
  const [selectedPeriod, setSelectedPeriod] = useState("week")
  const [selectedMetricType, setSelectedMetricType] = useState("all")
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchMetrics()
  }, [selectedPeriod, selectedMetricType])

  const fetchMetrics = async () => {
    let query = supabase.from("self_analysis_metrics").select("*").order("recorded_date", { ascending: false })

    // Filter by period
    const now = new Date()
    const startDate = new Date()

    switch (selectedPeriod) {
      case "week":
        startDate.setDate(now.getDate() - 7)
        break
      case "month":
        startDate.setMonth(now.getMonth() - 1)
        break
      case "quarter":
        startDate.setMonth(now.getMonth() - 3)
        break
    }

    query = query.gte("recorded_date", startDate.toISOString().split("T")[0])

    // Filter by metric type
    if (selectedMetricType !== "all") {
      query = query.eq("metric_type", selectedMetricType)
    }

    const { data, error } = await query

    if (error) {
      toast({
        title: "Erro ao carregar métricas",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    setMetrics(data || [])
  }

  const handleSaveMetric = async () => {
    if (!newMetric.metric_name.trim() || !newMetric.metric_value || !newMetric.metric_type) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, valor e tipo da métrica",
        variant: "destructive",
      })
      return
    }

    const metricData = {
      metric_name: newMetric.metric_name,
      metric_value: Number.parseFloat(newMetric.metric_value),
      metric_type: newMetric.metric_type,
      notes: newMetric.notes || null,
      recorded_date: new Date().toISOString().split("T")[0],
    }

    const { error } = await supabase.from("self_analysis_metrics").insert([metricData])

    if (error) {
      toast({
        title: "Erro ao salvar métrica",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Métrica registrada",
      description: "Sua métrica foi salva com sucesso",
    })

    setNewMetric({
      metric_name: "",
      metric_value: "",
      metric_type: "",
      notes: "",
    })

    fetchMetrics()
  }

  const getMetricTypeInfo = (type: string) => {
    return (
      metricTypes.find((mt) => mt.value === type) || { value: type, label: type, color: "bg-gray-100 text-gray-800" }
    )
  }

  const calculateAverage = (type: string) => {
    const typeMetrics = metrics.filter((m) => m.metric_type === type)
    if (typeMetrics.length === 0) return 0
    const sum = typeMetrics.reduce((acc, m) => acc + m.metric_value, 0)
    return (sum / typeMetrics.length).toFixed(1)
  }

  const getMetricTrend = (type: string) => {
    const typeMetrics = metrics.filter((m) => m.metric_type === type).slice(0, 7)
    if (typeMetrics.length < 2) return "stable"

    const recent = typeMetrics.slice(0, 3).reduce((acc, m) => acc + m.metric_value, 0) / 3
    const older = typeMetrics.slice(3, 6).reduce((acc, m) => acc + m.metric_value, 0) / 3

    if (recent > older + 0.5) return "up"
    if (recent < older - 0.5) return "down"
    return "stable"
  }

  const uniqueMetricTypes = [...new Set(metrics.map((m) => m.metric_type))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-green-600" />
            Ferramentas de Autoanálise
          </h2>
          <p className="text-gray-600 mt-1">Monitore e analise padrões em seu bem-estar e comportamento</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Registrar Nova Métrica
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="metric-name">Nome da Métrica</Label>
                  <Input
                    id="metric-name"
                    value={newMetric.metric_name}
                    onChange={(e) => setNewMetric({ ...newMetric, metric_name: e.target.value })}
                    placeholder="Ex: Humor matinal, Nível de ansiedade..."
                  />
                </div>
                <div>
                  <Label htmlFor="metric-value">Valor (1-10)</Label>
                  <Input
                    id="metric-value"
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    value={newMetric.metric_value}
                    onChange={(e) => setNewMetric({ ...newMetric, metric_value: e.target.value })}
                    placeholder="5.0"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="metric-type">Tipo</Label>
                <Select
                  value={newMetric.metric_type}
                  onValueChange={(value) => setNewMetric({ ...newMetric, metric_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de métrica" />
                  </SelectTrigger>
                  <SelectContent>
                    {metricTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  value={newMetric.notes}
                  onChange={(e) => setNewMetric({ ...newMetric, notes: e.target.value })}
                  placeholder="Contexto adicional sobre esta medição..."
                  rows={3}
                />
              </div>
              <Button onClick={handleSaveMetric} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Registrar Métrica
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Histórico de Métricas
                </CardTitle>
                <div className="flex gap-2">
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Semana</SelectItem>
                      <SelectItem value="month">Mês</SelectItem>
                      <SelectItem value="quarter">Trimestre</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedMetricType} onValueChange={setSelectedMetricType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {metricTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {metrics.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma métrica registrada no período selecionado</p>
                  <p className="text-sm mt-1">Comece registrando suas primeiras métricas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {metrics.map((metric) => {
                    const typeInfo = getMetricTypeInfo(metric.metric_type)
                    return (
                      <Card
                        key={metric.id}
                        className="border-l-4"
                        style={{
                          borderLeftColor: typeInfo.color.includes("blue")
                            ? "#3b82f6"
                            : typeInfo.color.includes("green")
                              ? "#10b981"
                              : typeInfo.color.includes("red")
                                ? "#ef4444"
                                : "#8b5cf6",
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium text-gray-900">{metric.metric_name}</h4>
                                <Badge className={typeInfo.color} variant="secondary">
                                  {typeInfo.label}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 mb-2">
                                <span className="text-2xl font-bold text-gray-900">{metric.metric_value}</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${(metric.metric_value / 10) * 100}%` }}
                                  />
                                </div>
                              </div>
                              {metric.notes && <p className="text-sm text-gray-600 mb-2">{metric.notes}</p>}
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(metric.recorded_date).toLocaleDateString("pt-BR")}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Resumo Analítico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {uniqueMetricTypes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Registre métricas para ver análises</p>
              ) : (
                uniqueMetricTypes.map((type) => {
                  const typeInfo = getMetricTypeInfo(type)
                  const average = calculateAverage(type)
                  const trend = getMetricTrend(type)
                  const count = metrics.filter((m) => m.metric_type === type).length

                  return (
                    <Card
                      key={type}
                      className="border-l-4"
                      style={{
                        borderLeftColor: typeInfo.color.includes("blue")
                          ? "#3b82f6"
                          : typeInfo.color.includes("green")
                            ? "#10b981"
                            : typeInfo.color.includes("red")
                              ? "#ef4444"
                              : "#8b5cf6",
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={typeInfo.color} variant="secondary">
                            {typeInfo.label}
                          </Badge>
                          <span className="text-xs text-gray-500">{count} registros</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Média</p>
                            <p className="text-xl font-bold">{average}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Tendência</p>
                            <div className="flex items-center gap-1">
                              {trend === "up" && <TrendingUp className="h-4 w-4 text-green-600" />}
                              {trend === "down" && <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />}
                              {trend === "stable" && <div className="h-4 w-4 bg-gray-400 rounded-full" />}
                              <span className="text-xs capitalize">
                                {trend === "up" ? "Subindo" : trend === "down" ? "Descendo" : "Estável"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-1">Dica de Autoanálise:</p>
                  <p>
                    Registre suas métricas regularmente para identificar padrões. Pequenas mudanças ao longo do tempo
                    podem revelar insights valiosos sobre seu bem-estar.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
