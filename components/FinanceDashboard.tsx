"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import AppLayout from "./AppLayout"
import ExpenseTracker from "./ExpenseTracker"
import VirtualEnvelopes from "./VirtualEnvelopes"
import PaymentCalendar from "./PaymentCalendar"
import AddExpense from "./AddExpense"

interface FinanceDashboardProps {
  user: User
}

export default function FinanceDashboard({ user }: FinanceDashboardProps) {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleExpenseAdded = () => {
    // Trigger refresh of components that depend on expense data
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <AppLayout user={user} title="Finanças">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <div key={`expense-tracker-${refreshKey}`}>
            <ExpenseTracker user={user} />
          </div>

          <PaymentCalendar user={user} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div key={`virtual-envelopes-${refreshKey}`}>
            <VirtualEnvelopes user={user} />
          </div>

          <AddExpense user={user} onExpenseAdded={handleExpenseAdded} />
        </div>
      </div>
    </AppLayout>
  )
}
