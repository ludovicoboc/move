"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Utensils, BookOpen, GraduationCap, Heart, Play, DollarSign, Target, X } from "lucide-react"

interface NavigationSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigationItems = [
  {
    name: "Início",
    href: "/",
    icon: Home,
  },
  {
    name: "Alimentação",
    href: "/food",
    icon: Utensils,
  },
  {
    name: "Receitas",
    href: "/recipes",
    icon: BookOpen,
  },
  {
    name: "Estudos",
    href: "/studies",
    icon: GraduationCap,
  },
  {
    name: "Saúde",
    href: "/health",
    icon: Heart,
  },
  {
    name: "Lazer",
    href: "/leisure",
    icon: Play,
  },
  {
    name: "Finanças",
    href: "/finance",
    icon: DollarSign,
  },
  {
    name: "Hiperfocos",
    href: "/hyperfocus",
    icon: Target,
  },
]

export default function NavigationSidebar({ isOpen, onClose }: NavigationSidebarProps) {
  const pathname = usePathname()

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("navigation-sidebar")
      const hamburger = document.getElementById("hamburger-button")

      if (
        isOpen &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        hamburger &&
        !hamburger.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "hidden" // Prevent background scrolling
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        id="navigation-sidebar"
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-orange-100 text-orange-700 border-l-4 border-orange-500"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            <p>Versão 1.0.0</p>
          </div>
        </div>
      </div>
    </>
  )
}
