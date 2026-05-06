"use client"

import { Card } from "@/components/ui/card"
import { ContentSequence } from "@/components/ui/content-transition"

export default function DashboardPage() {
  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
      <ContentSequence staggerDelay={0.1}>
        <Card className="p-6 shadow-sm rounded-lg">
          <h3 className="font-medium mb-2">系统概览</h3>
          <div className="text-3xl font-bold">27</div>
          <p className="text-sm text-muted-foreground mt-1">应用总数</p>
        </Card>

        <Card className="p-6 shadow-sm rounded-lg">
          <h3 className="font-medium mb-2">用户统计</h3>
          <div className="text-3xl font-bold">143</div>
          <p className="text-sm text-muted-foreground mt-1">活跃用户</p>
        </Card>

        <Card className="p-6 shadow-sm rounded-lg">
          <h3 className="font-medium mb-2">系统状态</h3>
          <div className="text-3xl font-bold text-green-600">正常</div>
          <p className="text-sm text-muted-foreground mt-1">所有服务运行良好</p>
        </Card>

        <Card className="p-6 shadow-sm rounded-lg md:col-span-3">
          <h3 className="font-medium mb-4">最近活动</h3>
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <div>
                <div className="font-medium">系统更新</div>
                <div className="text-sm text-muted-foreground">AI模型库已更新到最新版本</div>
              </div>
              <div className="text-sm text-muted-foreground">今天 10:23</div>
            </div>
            <div className="flex justify-between border-b pb-2">
              <div>
                <div className="font-medium">新用户注册</div>
                <div className="text-sm text-muted-foreground">5名新用户加入了平台</div>
              </div>
              <div className="text-sm text-muted-foreground">昨天 14:35</div>
            </div>
            <div className="flex justify-between border-b pb-2">
              <div>
                <div className="font-medium">性能优化</div>
                <div className="text-sm text-muted-foreground">系统响应时间提升了15%</div>
              </div>
              <div className="text-sm text-muted-foreground">2天前</div>
            </div>
          </div>
        </Card>
      </ContentSequence>
    </div>
  )
}
