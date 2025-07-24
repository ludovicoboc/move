import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import LeisureDashboard from "@/components/LeisureDashboard"

export default async function LeisurePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <LeisureDashboard user={user} />
}
