import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SleepDashboard from "@/components/SleepDashboard"

export default async function SleepPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <SleepDashboard user={user} />
}
