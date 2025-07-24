"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { DataExportRequest } from "@/lib/profile-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Database, Download, Trash2, Shield, AlertTriangle, FileText, Calendar } from "lucide-react"

interface DataManagementProps {
  userId: string
}

export default function DataManagement({ userId }: DataManagementProps) {
  const [exportRequests, setExportRequests] = useState<DataExportRequest[]>([])
  const [exportType, setExportType] = useState<"full" | "partial" | "specific_tables">("full")
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchExportRequests()
  }, [userId])

  const fetchExportRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("data_export_requests")
        .select("*")
        .eq("user_id", userId)
        .order("requested_at", { ascending: false })
        .limit(10)

      if (error) throw error
      setExportRequests(data || [])
    } catch (error) {
      console.error("Erro ao buscar solicitações de exportação:", error)
    } finally {
      setLoading(false)
    }
  }

  const requestDataExport = async () => {
    setRequesting(true)
    try {
      const { error } = await supabase.from("data_export_requests").insert({
        user_id: userId,
        export_type: exportType,
        status: "pending",
      })

      if (error) throw error
      await fetchExportRequests()
    } catch (error) {
      console.error("Erro ao solicitar exportação:", error)
    } finally {
      setRequesting(false)
    }
  }

  const deleteAllData = async () => {
    const confirmed = window.confirm(
      "⚠️ ATENÇÃO: Esta ação irá deletar TODOS os seus dados permanentemente. Esta ação não pode ser desfeita. Tem certeza que deseja continuar?",
    )

    if (!confirmed) return

    const doubleConfirm = window.confirm(
      "Esta é sua última chance. Todos os seus dados serão perdidos para sempre. Confirma a exclusão?",
    )

    if (!doubleConfirm) return

    try {
      // This would typically be handled by a server function for security
      // For now, we'll just show a message
      alert("Funcionalidade de exclusão de dados será implementada com segurança adicional.")
    } catch (error) {
      console.error("Erro ao deletar dados:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50"
      case "processing":
        return "text-blue-600 bg-blue-50"
      case "failed":
        return "text-red-600 bg-red-50"
      default:
        return "text-yellow-600 bg-yellow-50"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Concluído"
      case "processing":
        return "Processando"
      case "failed":
        return "Falhou"
      default:
        return "Pendente"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gerenciamento de Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Gerenciamento de Dados
        </CardTitle>
        <p className="text-sm text-gray-600">Exporte seus dados ou gerencie sua privacidade</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Export */}
        <div>
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportação de Dados
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Exportação</label>
              <Select value={exportType} onValueChange={(value: any) => setExportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Exportação Completa</SelectItem>
                  <SelectItem value="partial">Dados Essenciais</SelectItem>
                  <SelectItem value="specific_tables">Tabelas Específicas</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                {exportType === "full" && "Inclui todos os seus dados em formato JSON"}
                {exportType === "partial" && "Inclui apenas dados principais (perfil, metas, preferências)"}
                {exportType === "specific_tables" && "Permite escolher quais dados exportar"}
              </p>
            </div>

            <Button onClick={requestDataExport} disabled={requesting} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              {requesting ? "Solicitando..." : "Solicitar Exportação"}
            </Button>

            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                A exportação pode levar alguns minutos. Você receberá um link para download quando estiver pronta. Os
                arquivos ficam disponíveis por 7 dias.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        <Separator />

        {/* Export History */}
        <div>
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Histórico de Exportações
          </h3>
          {exportRequests.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Nenhuma exportação solicitada ainda</p>
          ) : (
            <div className="space-y-3">
              {exportRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {request.export_type === "full" && "Exportação Completa"}
                          {request.export_type === "partial" && "Dados Essenciais"}
                          {request.export_type === "specific_tables" && "Tabelas Específicas"}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Solicitado em {new Date(request.requested_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  {request.status === "completed" && request.file_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={request.file_url} download>
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Privacy and Data Deletion */}
        <div>
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacidade e Exclusão
          </h3>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Seus direitos de privacidade:</strong>
                <ul className="mt-2 text-sm space-y-1">
                  <li>• Você pode exportar todos os seus dados a qualquer momento</li>
                  <li>• Você pode solicitar a correção de dados incorretos</li>
                  <li>• Você pode deletar sua conta e todos os dados associados</li>
                  <li>• Seus dados são criptografados e protegidos</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="text-sm font-medium text-red-900 mb-2 flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Zona de Perigo
              </h4>
              <p className="text-sm text-red-800 mb-3">
                A exclusão de dados é permanente e não pode ser desfeita. Recomendamos fazer uma exportação antes de
                prosseguir.
              </p>
              <Button variant="destructive" onClick={deleteAllData} size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar Todos os Dados
              </Button>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 pt-4 border-t">
          <p>
            Para mais informações sobre como tratamos seus dados, consulte nossa
            <a href="/privacy" className="text-blue-600 hover:underline ml-1">
              Política de Privacidade
            </a>
            .
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
