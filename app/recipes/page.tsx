import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import RecipesDashboard from "@/components/RecipesDashboard"

export default async function RecipesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <RecipesDashboard user={user} />
}
