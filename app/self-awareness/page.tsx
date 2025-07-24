import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SelfAwarenessDashboard from "@/components/SelfAwarenessDashboard"

export default async function SelfAwarenessPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <SelfAwarenessDashboard />
}
