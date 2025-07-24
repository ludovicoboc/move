"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import type { ReflectionPrompt, ReflectionEntry } from "@/lib/self-awareness-types"
import { BookOpen, Plus, Lightbulb, Calendar, Shuffle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ReflectiveJournal() {
  const [prompts, setPrompts] = useState<ReflectionPrompt[]>([])
  const [entries, setEntries] = useState<ReflectionEntry[]>([])
  const [selectedPrompt, setSelectedPrompt] = useState<ReflectionPrompt | null>(null)
  const [currentEntry, setCurrentEntry] = useState({
    entry_text: "",
    mood_before: undefined as number | undefined,
    mood_after: undefined as number | undefined,
    insights: [] as string[],
  })
  const [newInsight, setNewInsight] = useState("")
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false)
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false)
  const [newPrompt, setNewPrompt] = useState({
    prompt_text: "",
    category: "personal",
  })
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchPrompts()
    fetchEntries()
  }, [])

  const fetchPrompts = async () => {
    const { data, error } = await supabase
      .from("reflection_prompts")
      .select("*")
      .order("usage_count", { ascending: false })

    if (error) {
      toast({
        title: "Erro ao carregar prompts",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    setPrompts(data || [])
  }

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from("reflection_entries")
      .select(`
        *,
        prompt:reflection_prompts(*)
      `)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      toast({
        title: "Erro ao carregar entradas",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    setEntries(data || [])
  }

  const getRandomPrompt = () => {
    if (prompts.length === 0) return
    const randomIndex = Math.floor(Math.random() * prompts.length)
    setSelectedPrompt(prompts[randomIndex])
  }

  const handleSaveEntry = async () => {
    if (!currentEntry.entry_text.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Escreva sua reflexão antes de salvar",
        variant: "destructive",
      })
      return
    }

    const entryData = {
      prompt_id: selectedPrompt?.id || null,
      entry_text: currentEntry.entry_text,
      mood_before: currentEntry.mood_before,
      mood_after: currentEntry.mood_after,
      insights: currentEntry.insights,
    }

    const { error } = await supabase.from("reflection_entries").insert([entryData])

    if (error) {
      toast({
        title: "Erro ao salvar entrada",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    // Update prompt usage count
    if (selectedPrompt) {
      await supabase
        .from("reflection_prompts")
        .update({ usage_count: selectedPrompt.usage_count + 1 })
        .eq("id", selectedPrompt.id)
    }

    toast({
      title: "Reflexão salva",
      description: "Sua entrada foi registrada com sucesso",
    })

    setCurrentEntry({
      entry_text: "",
      mood_before: undefined,
      mood_after: undefined,
      insights: [],
    })
    setSelectedPrompt(null)
    setIsEntryDialogOpen(false)
    fetchEntries()
    fetchPrompts()
  }

  const handleSavePrompt = async () => {
    if (!newPrompt.prompt_text.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Escreva o prompt antes de salvar",
        variant: "destructive",
      })
      return
    }

    const { error } = await supabase.from("reflection_prompts").insert([newPrompt])

    if (error) {
      toast({
        title: "Erro ao salvar prompt",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Prompt criado",
      description: "Seu prompt personalizado foi adicionado",
    })

    setNewPrompt({ prompt_text: "", category: "personal" })
    setIsPromptDialogOpen(false)
    fetchPrompts()
  }

  const addInsight = () => {
    if (newInsight.trim()) {
      setCurrentEntry((prev) => ({
        ...prev,
        insights: [...prev.insights, newInsight.trim()],
      }))
      setNewInsight("")
    }
  }

  const removeInsight = (index: number) => {
    setCurrentEntry((prev) => ({
      ...prev,
      insights: prev.insights.filter((_, i) => i !== index),
    }))
  }

  const getMoodEmoji = (mood: number) => {
    switch (mood) {
      case 1:
        return "😢"
      case 2:
        return "😕"
      case 3:
        return "😐"
      case 4:
        return "😊"
      case 5:
        return "😄"
      default:
        return "❓"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "daily":
        return "bg-blue-100 text-blue-800"
      case "weekly":
        return "bg-green-100 text-green-800"
      case "wellbeing":
        return "bg-purple-100 text-purple-800"
      case "personal":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            Diário Reflexivo
          </h2>
          <p className="text-gray-600 mt-1">Explore seus pensamentos através de reflexões guiadas</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isPromptDialogOpen} onOpenChange={setIsPromptDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Novo Prompt
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Prompt Personalizado</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="prompt-text">Pergunta de Reflexão</Label>
                  <Textarea
                    id="prompt-text"
                    value={newPrompt.prompt_text}
                    onChange={(e) => setNewPrompt({ ...newPrompt, prompt_text: e.target.value })}
                    placeholder="Ex: O que me trouxe alegria hoje?"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={newPrompt.category}
                    onValueChange={(value) => setNewPrompt({ ...newPrompt, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Pessoal</SelectItem>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="wellbeing">Bem-estar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsPromptDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSavePrompt}>Salvar Prompt</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Prompts de Reflexão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={getRandomPrompt} variant="outline" className="flex-1 bg-transparent">
                  <Shuffle className="h-4 w-4 mr-2" />
                  Prompt Aleatório
                </Button>
                <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Reflexão
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Nova Entrada no Diário</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {selectedPrompt && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getCategoryColor(selectedPrompt.category)}>
                              {selectedPrompt.category}
                            </Badge>
                          </div>
                          <p className="text-indigo-800 font-medium">{selectedPrompt.prompt_text}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Humor antes da reflexão</Label>
                          <Select
                            value={currentEntry.mood_before?.toString() || ""}
                            onValueChange={(value) =>
                              setCurrentEntry((prev) => ({
                                ...prev,
                                mood_before: value ? Number.parseInt(value) : undefined,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Como você está?" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">😢 Muito baixo</SelectItem>
                              <SelectItem value="2">😕 Baixo</SelectItem>
                              <SelectItem value="3">😐 Neutro</SelectItem>
                              <SelectItem value="4">😊 Bom</SelectItem>
                              <SelectItem value="5">😄 Excelente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Humor após a reflexão</Label>
                          <Select
                            value={currentEntry.mood_after?.toString() || ""}
                            onValueChange={(value) =>
                              setCurrentEntry((prev) => ({
                                ...prev,
                                mood_after: value ? Number.parseInt(value) : undefined,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Como você se sente agora?" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">😢 Muito baixo</SelectItem>
                              <SelectItem value="2">😕 Baixo</SelectItem>
                              <SelectItem value="3">😐 Neutro</SelectItem>
                              <SelectItem value="4">😊 Bom</SelectItem>
                              <SelectItem value="5">😄 Excelente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="reflection">Sua Reflexão</Label>
                        <Textarea
                          id="reflection"
                          value={currentEntry.entry_text}
                          onChange={(e) => setCurrentEntry((prev) => ({ ...prev, entry_text: e.target.value }))}
                          placeholder="Escreva seus pensamentos e sentimentos..."
                          rows={6}
                        />
                      </div>

                      <div>
                        <Label>Insights e Aprendizados</Label>
                        <div className="flex gap-2 mb-2">
                          <Input
                            value={newInsight}
                            onChange={(e) => setNewInsight(e.target.value)}
                            placeholder="Adicione um insight..."
                            onKeyPress={(e) => e.key === "Enter" && addInsight()}
                          />
                          <Button onClick={addInsight} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {currentEntry.insights.map((insight, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => removeInsight(index)}
                            >
                              {insight} ×
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsEntryDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSaveEntry}>Salvar Reflexão</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {selectedPrompt && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getCategoryColor(selectedPrompt.category)}>{selectedPrompt.category}</Badge>
                    <span className="text-xs text-gray-500">Usado {selectedPrompt.usage_count} vezes</span>
                  </div>
                  <p className="text-indigo-800 font-medium">{selectedPrompt.prompt_text}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {prompts.slice(0, 6).map((prompt) => (
                  <Card
                    key={prompt.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedPrompt(prompt)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getCategoryColor(prompt.category)} variant="secondary">
                          {prompt.category}
                        </Badge>
                        <span className="text-xs text-gray-500">{prompt.usage_count}x</span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">{prompt.prompt_text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Reflexões Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {entries.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhuma reflexão ainda. Comece escrevendo!</p>
              ) : (
                entries.map((entry) => (
                  <Card key={entry.id} className="border-l-4 border-l-indigo-400">
                    <CardContent className="p-4">
                      {entry.prompt && (
                        <p className="text-xs text-indigo-600 mb-2 font-medium">{entry.prompt.prompt_text}</p>
                      )}
                      <p className="text-sm text-gray-700 line-clamp-3 mb-3">{entry.entry_text}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{new Date(entry.created_at).toLocaleDateString("pt-BR")}</span>
                        <div className="flex items-center gap-2">
                          {entry.mood_before && <span>Antes: {getMoodEmoji(entry.mood_before)}</span>}
                          {entry.mood_after && <span>Depois: {getMoodEmoji(entry.mood_after)}</span>}
                        </div>
                      </div>
                      {entry.insights.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {entry.insights.slice(0, 2).map((insight, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {insight}
                            </Badge>
                          ))}
                          {entry.insights.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{entry.insights.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
