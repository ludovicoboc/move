"use client"

import type { User } from "@supabase/supabase-js"
import { useState } from "react"
import AppLayout from "./AppLayout"
import SleepRecorder from "./SleepRecorder"
import SleepVisualizer from "./SleepVisualizer"
import SleepReminders from "./SleepReminders"
import SleepHygieneTips from "./SleepHygieneTips"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Moon, BarChart3, Bell, Lightbulb } from "lucide-react"

interface SleepDashboardProps {
  user: User
}

export default function SleepDashboard({ user }: SleepDashboardProps) {
  const [activeTab, setActiveTab] = useState("register")

  return (
    <AppLayout user={user} title="Gestão do Sono">
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="register" className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Registrar Sono
            </TabsTrigger>
            <TabsTrigger value="visualize" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Visualizar Sono
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Lembretes
            </TabsTrigger>
            <TabsTrigger value="tips" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Dicas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="register" className="space-y-6">
            <SleepRecorder />
          </TabsContent>

          <TabsContent value="visualize" className="space-y-6">
            <SleepVisualizer />
          </TabsContent>

          <TabsContent value="reminders" className="space-y-6">
            <SleepReminders />
          </TabsContent>

          <TabsContent value="tips" className="space-y-6">
            <SleepHygieneTips />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
