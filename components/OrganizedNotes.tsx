"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import type { SelfAwarenessCategory, SelfAwarenessNote } from "@/lib/self-awareness-types"
import { Search, Plus, Edit, Trash2, Tag, Heart, User, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function OrganizedNotes() {
  const [categories, setCategories] = useState<SelfAwarenessCategory[]>([])
  const [notes, setNotes] = useState<SelfAwarenessNote[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<SelfAwarenessNote | null>(null)
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    tags: "",
    mood_rating: undefined as number | undefined,
  })
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchCategories()
    fetchNotes()
  }, [])

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id)
    }
  }, [categories])

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("self_awareness_categories")
      .select("*")
      .order("created_at", { ascending: true })

    if (error) {
      toast({
        title: "Erro ao carregar categorias",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    setCategories(data || [])
  }

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from("self_awareness_notes")
      .select(`
        *,
        category:self_awareness_categories(*)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      toast({
        title: "Erro ao carregar notas",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    setNotes(data || [])
  }

  const handleSaveNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim() || !selectedCategory) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título e conteúdo da nota",
        variant: "destructive",
      })
      return
    }

    const noteData = {
      title: newNote.title,
      content: newNote.content,
      category_id: selectedCategory,
      tags: newNote.tags ? newNote.tags.split(",").map((tag) => tag.trim()) : [],
      mood_rating: newNote.mood_rating,
    }

    let error
    if (editingNote) {
      const { error: updateError } = await supabase
        .from("self_awareness_notes")
        .update(noteData)
        .eq("id", editingNote.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase.from("self_awareness_notes").insert([noteData])
      error = insertError
    }

    if (error) {
      toast({
        title: "Erro ao salvar nota",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    toast({
      title: editingNote ? "Nota atualizada" : "Nota criada",
      description: "Sua nota foi salva com sucesso",
    })

    setNewNote({ title: "", content: "", tags: "", mood_rating: undefined })
    setEditingNote(null)
    setIsNoteDialogOpen(false)
    fetchNotes()
  }

  const handleEditNote = (note: SelfAwarenessNote) => {
    setEditingNote(note)
    setNewNote({
      title: note.title,
      content: note.content,
      tags: note.tags.join(", "),
      mood_rating: note.mood_rating,
    })
    setSelectedCategory(note.category_id)
    setIsNoteDialogOpen(true)
  }

  const handleDeleteNote = async (noteId: string) => {
    const { error } = await supabase.from("self_awareness_notes").delete().eq("id", noteId)

    if (error) {
      toast({
        title: "Erro ao excluir nota",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Nota excluída",
      description: "A nota foi removida com sucesso",
    })

    fetchNotes()
  }

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  const getIconForCategory = (iconName: string) => {
    switch (iconName) {
      case "user":
        return <User className="h-4 w-4" />
      case "heart":
        return <Heart className="h-4 w-4" />
      case "trending-up":
        return <TrendingUp className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getCategoryNotes = (categoryId: string) => {
    return filteredNotes.filter((note) => note.category_id === categoryId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📝 Notas de Autoconhecimento</h2>
          <p className="text-gray-600 mt-1">Organize seus pensamentos e reflexões em categorias estruturadas</p>
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
              {getIconForCategory(category.icon)}
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-orange-800 text-sm">{category.description}</p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getIconForCategory(category.icon)}
                    {category.name}
                  </CardTitle>
                  <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setEditingNote(null)
                          setNewNote({ title: "", content: "", tags: "", mood_rating: undefined })
                        }}
                        className="bg-gray-600 hover:bg-gray-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Nova nota
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{editingNote ? "Editar Nota" : "Nova Nota"}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">Título</Label>
                          <Input
                            id="title"
                            value={newNote.title}
                            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                            placeholder="Título da nota..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="content">Conteúdo</Label>
                          <Textarea
                            id="content"
                            value={newNote.content}
                            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                            placeholder="Escreva suas reflexões..."
                            rows={6}
                          />
                        </div>
                        <div>
                          <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                          <Input
                            id="tags"
                            value={newNote.tags}
                            onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                            placeholder="reflexão, aprendizado, insight..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="mood">Humor (1-5)</Label>
                          <Select
                            value={newNote.mood_rating?.toString() || ""}
                            onValueChange={(value) =>
                              setNewNote({ ...newNote, mood_rating: value ? Number.parseInt(value) : undefined })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione seu humor" />
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
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleSaveNote}>{editingNote ? "Atualizar" : "Salvar"}</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="text-sm text-gray-600">Suas notas em {category.name}</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar notas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {getCategoryNotes(category.id).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhuma nota registrada nesta seção ainda</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getCategoryNotes(category.id).map((note) => (
                      <Card key={note.id} className="border-l-4" style={{ borderLeftColor: category.color }}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-2">{note.title}</h4>
                              <p className="text-gray-600 text-sm mb-3 line-clamp-3">{note.content}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                {note.tags.map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {tag}
                                  </Badge>
                                ))}
                                {note.mood_rating && (
                                  <Badge variant="outline" className="text-xs">
                                    Humor: {note.mood_rating}/5
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button variant="ghost" size="sm" onClick={() => handleEditNote(note)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteNote(note.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 mt-3">
                            {new Date(note.created_at).toLocaleDateString("pt-BR")}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
