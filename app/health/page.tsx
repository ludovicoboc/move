"use client"

import HealthDashboard from "@/components/HealthDashboard"
import { WithUser } from "@/components/AuthProvider"

export default function HealthPage() {
  return (
    <WithUser>
      {(user) => <HealthDashboard user={user} />}
    </WithUser>
  )
}
