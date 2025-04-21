"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function MenusPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">菜单管理</h2>
          <p className="text-muted-foreground">
            管理系统菜单和权限配置
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>菜单列表</CardTitle>
        </CardHeader>
        <CardContent>
          <p>菜单管理功能正在开发中...</p>
        </CardContent>
      </Card>
    </div>
  )
} 