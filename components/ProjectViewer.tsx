"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FolderOpen, TreePine } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { HyperfocusProject, Hyperfocus } from "@/lib/hyperfocus-types"

interface ProjectViewerProps {
  user: User
}

export default function ProjectViewer({ user }: ProjectViewerProps) {
  const [projects, setProjects] = useState<HyperfocusProject[]>([])
  const [hyperfocuses, setHyperfocuses] = useState<Hyperfocus[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch projects with hyperfocus data
      const { data: projectData, error: projectError } = await supabase
        .from("hyperfocus_projects")
        .select(`
          *,
          hyperfocus:hyperfocuses(*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (projectError) throw projectError

      // Fetch hyperfocuses
      const { data: hyperfocusData, error: hyperfocusError } = await supabase
        .from("hyperfocuses")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (hyperfocusError) throw hyperfocusError

      setProjects(projectData || [])
      setHyperfocuses(hyperfocusData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo"
      case "paused":
        return "Pausado"
      case "completed":
        return "Concluído"
      default:
        return status
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TreePine className="h-5 w-5 text-green-600" />
        <h2 className="text-lg font-semibold">Visualização em Árvore de Projetos</h2>
      </div>

      {hyperfocuses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-gray-500 mb-2">Nenhum hiperfoco encontrado.</p>
                <p className="text-sm text-gray-400">Crie seu primeiro hiperfoco na guia "Conversor de Interesses".</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {hyperfocuses.map((hyperfocus) => {
            const hyperfocusProjects = projects.filter((p) => p.hyperfocus_id === hyperfocus.id)

            return (
              <Card key={hyperfocus.id} className="overflow-hidden">
                <CardHeader className="pb-3" style={{ borderLeft: `4px solid ${hyperfocus.color}` }}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: hyperfocus.color }} />
                      {hyperfocus.title}
                    </CardTitle>
                    <Badge variant="outline">
                      {hyperfocusProjects.length} projeto{hyperfocusProjects.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  {hyperfocus.description && <p className="text-sm text-gray-600 mt-2">{hyperfocus.description}</p>}
                </CardHeader>

                <CardContent>
                  {hyperfocus.tasks && hyperfocus.tasks.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Tarefas Base:</h4>
                      <div className="space-y-1">
                        {hyperfocus.tasks.map((task, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                            {task}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {hyperfocusProjects.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Projetos Ativos:</h4>
                      {hyperfocusProjects.map((project) => (
                        <Card key={project.id} className="bg-gray-50">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium">{project.name}</h5>
                              <Badge variant="secondary" className={getStatusColor(project.status)}>
                                {getStatusText(project.status)}
                              </Badge>
                            </div>

                            {project.description && <p className="text-sm text-gray-600 mb-3">{project.description}</p>}

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Progresso</span>
                                <span>{project.progress}%</span>
                              </div>
                              <Progress value={project.progress} className="h-2" />
                            </div>

                            {project.milestones && project.milestones.length > 0 && (
                              <div className="mt-3">
                                <h6 className="text-xs font-medium text-gray-700 mb-2">Marcos:</h6>
                                <div className="space-y-1">
                                  {project.milestones.map((milestone, index) => (
                                    <div key={index} className="flex items-center gap-2 text-xs">
                                      <div
                                        className={`w-2 h-2 rounded-full ${
                                          milestone.completed ? "bg-green-500" : "bg-gray-300"
                                        }`}
                                      />
                                      <span className={milestone.completed ? "line-through text-gray-500" : ""}>
                                        {milestone.title}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Nenhum projeto criado para este hiperfoco ainda.
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
