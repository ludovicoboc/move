"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import NavigationSidebar from "./NavigationSidebar"
import { Button } from "@/components/ui/button"
import { Menu, Bed, Anchor, UserIcon, Key, Moon, Sun, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AppLayoutProps {
  children: React.ReactNode
  user: User
  title?: string
}

export default function AppLayout({ children, user, title }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem("theme")
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    } else {
      setIsDarkMode(false)
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)

    if (newDarkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const getUserInitial = () => {
    if (user.user_metadata?.display_name) {
      return user.user_metadata.display_name.charAt(0).toUpperCase()
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return "U"
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Hamburger menu */}
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="p-2">
              <Menu className="h-5 w-5" />
            </Button>

            {/* Right side - Navigation icons */}
            <div className="flex items-center gap-2">
              {/* Sleep */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => router.push("/sleep")} className="p-2">
                    <Bed className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Gestão do Sono</p>
                </TooltipContent>
              </Tooltip>

              {/* Self-awareness */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => router.push("/self-awareness")} className="p-2">
                    <Anchor className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Autoconhecimento</p>
                </TooltipContent>
              </Tooltip>

              {/* Profile */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => router.push("/profile")} className="p-2">
                    <UserIcon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Perfil do Usuário</p>
                </TooltipContent>
              </Tooltip>

              {/* Authentication/Sign out */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="p-2">
                    <Key className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sair</p>
                </TooltipContent>
              </Tooltip>

              {/* Dark mode toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={toggleDarkMode} className="p-2">
                    {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isDarkMode ? "Modo Claro" : "Modo Escuro"}</p>
                </TooltipContent>
              </Tooltip>

              {/* FAQ */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => router.push("/faq")} className="p-2">
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Perguntas Frequentes</p>
                </TooltipContent>
              </Tooltip>

              {/* User Avatar */}
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {getUserInitial()}
              </div>
            </div>
          </div>
        </header>

        {/* Sidebar */}
        <NavigationSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />

        {/* Main content */}
        <main className="p-6">
          {title && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
            </div>
          )}
          {children}
        </main>
      </div>
    </TooltipProvider>
  )
}
