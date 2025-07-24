"use client"

import type { User } from "@supabase/supabase-js"
import MealPlanner from "./MealPlanner"
import MealLog from "./MealLog"
import HydrationReminder from "./HydrationReminder"
import AppLayout from "./AppLayout"

interface NutritionDashboardProps {
  user: User
}

export default function NutritionDashboard({ user }: NutritionDashboardProps) {
  return (
    <AppLayout user={user} title="Alimentação">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <MealPlanner />
        <MealLog />
      </div>

      <div className="max-w-2xl">
        <HydrationReminder />
      </div>
    </AppLayout>
  )
}
