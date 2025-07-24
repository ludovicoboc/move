"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Plus, X, Lightbulb } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { HyperfocusFormData } from "@/lib/hyperfocus-types"

interface InterestConverterProps {
  user: User
  onHyperfocusCreated: () => void
}

const HYPERFOCUS_COLORS = [
  "#EF4444", // red
  "#22C55E", // green
  "#3B82F6", // blue
  "#A855F7", // purple
  "#F59E0B", // amber
  "#8B5CF6", // violet
  "#6B7280", // gray
  "#374151", // dark gray
]

export default function InterestConverter({ user, onHyperfocusCreated }: InterestConverterProps) {
  const [formData, setFormData] = useState<HyperfocusFormData>({
    title: "",
    description: "",
    color: "#3B82F6",
    time_limit: 30,
    tasks: [""],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from("hyperfocuses").insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        color: formData.color,
        time_limit: formData.time_limit,
        tasks: formData.tasks.filter((task) => task.trim() !== ""),
      })

      if (error) throw error

      // Reset form
      setFormData({
        title: "",
        description: "",
        color: "#3B82F6",
        time_limit: 30,
        tasks: [""],
      })

      onHyperfocusCreated()
    } catch (error) {
      console.error("Error creating hyperfocus:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTask = () => {
    setFormData((prev) => ({
      ...prev,
      tasks: [...prev.tasks, ""],
    }))
  }

  const removeTask = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index),
    }))
  }

  const updateTask = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task, i) => (i === index ? value : task)),
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-orange-500" />
        <h2 className="text-lg font-semibold">Conversor de Interesses</h2>
      </div>

      <p className="text-sm text-gray-600">
        Transforme um interesse intenso em um projeto estruturado com tarefas claras e objetivos.
      </p>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Interesse/Hiperfoco *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Programação em Python"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time_limit">Tempo Limite (em minutos, opcional)</Label>
                <Input
                  id="time_limit"
                  type="number"
                  value={formData.time_limit}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, time_limit: Number.parseInt(e.target.value) || 30 }))
                  }
                  placeholder="Ex: 30"
                  min="5"
                  max="480"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva seu interesse ou hiperfoco"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Cor do Hiperfoco</Label>
              <div className="flex gap-2">
                {HYPERFOCUS_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? "border-gray-800" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData((prev) => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Decomposição em Tarefas</Label>
              <div className="space-y-2">
                {formData.tasks.map((task, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={task}
                      onChange={(e) => updateTask(index, e.target.value)}
                      placeholder={`Tarefa ${index + 1}`}
                    />
                    {formData.tasks.length > 1 && (
                      <Button type="button" variant="outline" size="icon" onClick={() => removeTask(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={addTask}
                  className="text-orange-600 hover:text-orange-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar mais uma tarefa
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={isSubmitting || !formData.title.trim()}
            >
              {isSubmitting ? "Convertendo..." : "Converter em Hiperfoco"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Dica para gerenciar o tempo</p>
              <p>
                "Utilize os 25 minutos de foco para se aprofundar no que te interessa mais." - Pomodoro de foque
                híbrido.
              </p>
              <p className="mt-2">
                Trabalho: "Sempre o interesse pode virar uma referência de trabalho, que seja para uma mentoria
                avançada."
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
