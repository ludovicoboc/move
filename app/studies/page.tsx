import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import StudiesDashboard from "@/components/StudiesDashboard"

export default async function StudiesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <StudiesDashboard user={user} />
}
