"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit2, Save, X, User } from "lucide-react"
import { TIMEZONES, LANGUAGES, type UserProfile } from "@/lib/profile-types"

interface BasicInformationProps {
  profile: UserProfile
  onUpdate: (profile: UserProfile) => void
}

export default function BasicInformation({ profile, onUpdate }: BasicInformationProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(profile)
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const { data, error } = await supabase
        .from("user_profiles")
        .update({
          display_name: editData.display_name,
          bio: editData.bio,
          timezone: editData.timezone,
          language: editData.language,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", profile.user_id)
        .select()
        .single()

      if (error) throw error

      onUpdate(data)
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditData(profile)
    setIsEditing(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Basic Information Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Informações Básicas</CardTitle>
          </div>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="display_name">Nome de Exibição</Label>
            {isEditing ? (
              <Input
                id="display_name"
                value={editData.display_name || ""}
                onChange={(e) => setEditData({ ...editData, display_name: e.target.value })}
                placeholder="Seu nome de exibição"
              />
            ) : (
              <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                {profile.display_name || "Não informado"}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="bio">Biografia</Label>
            {isEditing ? (
              <Textarea
                id="bio"
                value={editData.bio || ""}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                placeholder="Conte um pouco sobre você..."
                rows={3}
              />
            ) : (
              <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-md min-h-[80px]">
                {profile.bio || "Nenhuma biografia adicionada"}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="timezone">Fuso Horário</Label>
            {isEditing ? (
              <Select
                value={editData.timezone}
                onValueChange={(value) => setEditData({ ...editData, timezone: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione seu fuso horário" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                {TIMEZONES.find((tz) => tz.value === profile.timezone)?.label || profile.timezone}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="language">Idioma</Label>
            {isEditing ? (
              <Select
                value={editData.language}
                onValueChange={(value) => setEditData({ ...editData, language: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione seu idioma" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                {LANGUAGES.find((lang) => lang.value === profile.language)?.label || profile.language}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>ID do Usuário</Label>
            <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-md font-mono text-sm">{profile.user_id}</div>
          </div>

          <div>
            <Label>Conta Criada</Label>
            <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
              {new Date(profile.created_at).toLocaleDateString("pt-BR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          <div>
            <Label>Última Atualização</Label>
            <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
              {new Date(profile.updated_at).toLocaleDateString("pt-BR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
