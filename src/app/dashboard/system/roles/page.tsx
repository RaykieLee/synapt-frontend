"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function RolesPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">角色管理</h2>
          <p className="text-muted-foreground">
            管理系统角色和权限分配
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>角色列表</CardTitle>
        </CardHeader>
        <CardContent>
          <p>角色管理功能正在开发中...</p>
        </CardContent>
      </Card>
    </div>
  )
} 