"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import AppLayout from "./AppLayout"
import InterestConverter from "./InterestConverter"
import ToggleSystem from "./ToggleSystem"
import ProjectViewer from "./ProjectViewer"
import FocusTimer from "./FocusTimer"

interface HyperfocusDashboardProps {
  user: User
}

export default function HyperfocusDashboard({ user }: HyperfocusDashboardProps) {
  const [activeTab, setActiveTab] = useState("converter")
  const [refreshKey, setRefreshKey] = useState(0)

  const handleHyperfocusCreated = () => {
    setRefreshKey((prev) => prev + 1)
    // Optionally switch to timer tab after creating a hyperfocus
    // setActiveTab("timer")
  }

  const tabs = [
    { id: "converter", label: "Conversor de Interesses", active: activeTab === "converter" },
    { id: "toggle", label: "Sistema de Alternância", active: activeTab === "toggle" },
    { id: "projects", label: "Estrutura de Projetos", active: activeTab === "projects" },
    { id: "timer", label: "Temporizador", active: activeTab === "timer" },
  ]

  return (
    <AppLayout user={user} title="Hiperfocos">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-4xl">🎯</div>
          <h1 className="text-2xl font-bold text-gray-900">Hiperfocos</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Transforme seus interesses intensos em projetos estruturados e gerencie suas transições de foco.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  tab.active
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "converter" && (
            <InterestConverter
              key={`converter-${refreshKey}`}
              user={user}
              onHyperfocusCreated={handleHyperfocusCreated}
            />
          )}

          {activeTab === "toggle" && <ToggleSystem key={`toggle-${refreshKey}`} user={user} />}

          {activeTab === "projects" && <ProjectViewer key={`projects-${refreshKey}`} user={user} />}

          {activeTab === "timer" && <FocusTimer key={`timer-${refreshKey}`} user={user} />}
        </div>
      </div>
    </AppLayout>
  )
}
