"use client"

import { AppDetailForm } from "../components/app-detail-form"

export default function CreateAppAccessPage() {
  return (
    <div className="container mx-auto px-0 py-6 md:px-6">
      <div className="rounded-lg border bg-card p-6">
        <AppDetailForm mode="create" />
      </div>
    </div>
  )
} 