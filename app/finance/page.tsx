"use client"

import FinanceDashboard from "@/components/FinanceDashboard"
import { WithUser } from "@/components/AuthProvider"

export default function FinancePage() {
  return (
    <WithUser>
      {(user) => <FinanceDashboard user={user} />}
    </WithUser>
  )
}
