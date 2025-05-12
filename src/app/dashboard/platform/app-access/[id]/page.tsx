"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { appAccessAPI } from "@/api"
import { Skeleton } from "@/components/ui/skeleton"
import { AppDetailForm } from "../components/app-detail-form"

export default function AppAccessDetailPage() {
  const params = useParams()
  const router = useRouter()
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
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!app) {
    return (
      <div className="container mx-auto px-0 py-6 md:px-6">
        <div className="flex flex-col space-y-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">应用详情</h2>
            <p className="text-muted-foreground">
              未找到应用信息
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-lg font-medium mb-4">未找到ID为 {appId} 的应用</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-0 py-6 md:px-6">
      <div className="rounded-lg border bg-card p-6">
        <AppDetailForm app={app} mode="view" />
      </div>
    </div>
  )
} 