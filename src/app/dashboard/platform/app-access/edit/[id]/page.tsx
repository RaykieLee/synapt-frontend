"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { appAccessAPI } from "@/api"
import { Skeleton } from "@/components/ui/skeleton"
import { AppDetailForm } from "../../components/app-detail-form"

export default function EditAppAccessPage() {
  const params = useParams()
  const appId = Number(params.id)

  // 获取应用接入详情
  const { data: response, isLoading } = useQuery({
    queryKey: ["app-access", "detail", appId],
    queryFn: () => appAccessAPI.getDetail(appId),
    enabled: !!appId && !isNaN(appId),
  })

  const app = response?.data

  if (isLoading) {
    return (
      <div className="container mx-auto px-0 py-6 md:px-6">
        <div className="flex flex-col space-y-8">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-0 py-6 md:px-6">
      <div className="rounded-lg border bg-card p-6">
        {app && <AppDetailForm app={app} mode="edit" />}
      </div>
    </div>
  )
} 