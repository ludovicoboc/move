import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import NutritionDashboard from "@/components/NutritionDashboard"

export default async function FoodPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <NutritionDashboard user={user} />
}
