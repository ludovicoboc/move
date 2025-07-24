"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Exam } from "@/lib/study-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Edit, Trash2 } from "lucide-react"

export default function ExamManagement() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    exam_date: "",
    institution: "",
  })
  const supabase = createClient()

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase.from("exams").select("*").order("exam_date", { ascending: true })

      if (error) throw error
      setExams(data || [])
    } catch (error) {
      console.error("Erro ao buscar concursos:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert("Nome do concurso é obrigatório")
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const examData = {
        user_id: user.id,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        exam_date: formData.exam_date || null,
        institution: formData.institution.trim() || null,
      }

      if (editingExam) {
        const { error } = await supabase.from("exams").update(examData).eq("id", editingExam.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("exams").insert(examData)

        if (error) throw error
      }

      setFormData({ name: "", description: "", exam_date: "", institution: "" })
      setShowForm(false)
      setEditingExam(null)
      fetchExams()
    } catch (error) {
      console.error("Erro ao salvar concurso:", error)
    }
  }

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam)
    setFormData({
      name: exam.name,
      description: exam.description || "",
      exam_date: exam.exam_date || "",
      institution: exam.institution || "",
    })
    setShowForm(true)
  }

  const handleDelete = async (examId: string) => {
    if (!confirm("Tem certeza que deseja excluir este concurso?")) return

    try {
      const { error } = await supabase.from("exams").delete().eq("id", examId)

      if (error) throw error
      fetchExams()
    } catch (error) {
      console.error("Erro ao excluir concurso:", error)
    }
  }

  const getStatusBadge = (exam: Exam) => {
    if (!exam.exam_date) return null

    const examDate = new Date(exam.exam_date)
    const today = new Date()
    const diffTime = examDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return <Badge variant="secondary">Finalizado</Badge>
    } else if (diffDays === 0) {
      return <Badge className="bg-red-500">Hoje</Badge>
    } else if (diffDays <= 7) {
      return <Badge className="bg-orange-500">Esta semana</Badge>
    } else if (diffDays <= 30) {
      return <Badge className="bg-yellow-500">Este mês</Badge>
    } else {
      return <Badge variant="outline">{diffDays} dias</Badge>
    }
  }

  const getNextExam = () => {
    const today = new Date()
    return exams
      .filter((exam) => exam.exam_date && new Date(exam.exam_date) >= today)
      .sort((a, b) => new Date(a.exam_date!).getTime() - new Date(b.exam_date!).getTime())[0]
  }

  const nextExam = getNextExam()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Próximo Concurso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-20 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Próximo Concurso</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Ver Todos Concursos
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setShowForm(true)
              setEditingExam(null)
              setFormData({ name: "", description: "", exam_date: "", institution: "" })
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Concurso
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {nextExam ? (
          <div className="p-4 border rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold">{nextExam.name}</h3>
                {nextExam.institution && <p className="text-sm text-gray-600">{nextExam.institution}</p>}
              </div>
              {getStatusBadge(nextExam)}
            </div>
            {nextExam.description && <p className="text-sm text-gray-600 mb-3">{nextExam.description}</p>}
            {nextExam.exam_date && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                {new Date(nextExam.exam_date).toLocaleDateString("pt-BR")}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Nenhum concurso planejado</p>
          </div>
        )}

        {showForm && (
          <div className="mt-6 p-4 border rounded-lg bg-gray-50">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Concurso*</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Concurso Público Municipal"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Instituição</label>
                <Input
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  placeholder="Ex: Prefeitura Municipal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data do Exame</label>
                <Input
                  type="date"
                  value={formData.exam_date}
                  onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Informações adicionais sobre o concurso"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingExam ? "Atualizar" : "Adicionar"}</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingExam(null)
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}

        {exams.length > 1 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3">Outros Concursos</h4>
            <div className="space-y-2">
              {exams
                .filter((exam) => exam.id !== nextExam?.id)
                .map((exam) => (
                  <div key={exam.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{exam.name}</div>
                      {exam.exam_date && (
                        <div className="text-sm text-gray-500">
                          {new Date(exam.exam_date).toLocaleDateString("pt-BR")}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(exam)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(exam.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
