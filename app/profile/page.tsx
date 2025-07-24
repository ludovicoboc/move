"use client"

import ProfileDashboard from "@/components/ProfileDashboard"
import { WithUser } from "@/components/AuthProvider"

export default function ProfilePage() {
  return (
    <WithUser>
      {(user) => <ProfileDashboard user={user} />}
    </WithUser>
  )
}
