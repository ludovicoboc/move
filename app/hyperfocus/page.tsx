import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import HyperfocusDashboard from "@/components/HyperfocusDashboard"

export default async function HyperfocusPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <HyperfocusDashboard user={user} />
}
