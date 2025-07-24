"use client"

import Dashboard from "@/components/Dashboard"
import { WithUser } from "@/components/AuthProvider"

export default function Home() {
  return (
    <WithUser>
      {(user) => <Dashboard user={user} />}
    </WithUser>
  )
}
