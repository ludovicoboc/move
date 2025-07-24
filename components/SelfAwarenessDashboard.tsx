"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import OrganizedNotes from "./OrganizedNotes"
import RefugeMode from "./RefugeMode"
import ReflectiveJournal from "./ReflectiveJournal"
import SelfAnalysisTools from "./SelfAnalysisTools"
import { BookOpen, Shield, PenTool, BarChart3, Eye, EyeOff } from "lucide-react"

export default function SelfAwarenessDashboard() {
  const [isSimplifiedMode, setIsSimplifiedMode] = useState(false)

  const toggleSimplifiedMode = () => {
    setIsSimplifiedMode(!isSimplifiedMode)
  }

  if (isSimplifiedMode) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">🧠 Autoconhecimento</h1>
            <Button onClick={toggleSimplifiedMode} variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Modo Completo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Modo Refúgio</h3>
              <p className="text-gray-600">Espaço seguro para momentos difíceis</p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <PenTool className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Reflexões</h3>
              <p className="text-gray-600">Escreva seus pensamentos</p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <BookOpen className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Minhas Notas</h3>
              <p className="text-gray-600">Organize seus aprendizados</p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <BarChart3 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Análises</h3>
              <p className="text-gray-600">Monitore seu bem-estar</p>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🧠 Autoconhecimento</h1>
            <p className="text-gray-600 mt-1">Um espaço seguro e adaptável para reflexão pessoal e crescimento</p>
          </div>
          <Button onClick={toggleSimplifiedMode} variant="outline">
            <EyeOff className="h-4 w-4 mr-2" />
            Modo Simplificado
          </Button>
        </div>

        <Tabs defaultValue="notes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Notas Organizadas
            </TabsTrigger>
            <TabsTrigger value="refuge" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Modo Refúgio
            </TabsTrigger>
            <TabsTrigger value="journal" className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              Diário Reflexivo
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Autoanálise
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notes">
            <OrganizedNotes />
          </TabsContent>

          <TabsContent value="refuge">
            <RefugeMode />
          </TabsContent>

          <TabsContent value="journal">
            <ReflectiveJournal />
          </TabsContent>

          <TabsContent value="analysis">
            <SelfAnalysisTools />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
