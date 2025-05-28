"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Award, TrendingUp, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { personnelQualificationAPI } from "@/api/personnel";
import PersonnelQualificationPage from "./qualification/page";
import CertificatePage from "./certificate/page";

export default function PersonnelManagementPage() {
  const [activeTab, setActiveTab] = useState("qualification");

  // 获取统计数据
  const { data: statsResponse } = useQuery({
    queryKey: ["personnel", "stats"],
    queryFn: () => personnelQualificationAPI.getStats(),
  });

  const stats = statsResponse?.data;

  return (
    <div className="container mx-auto px-0 py-6 md:px-6">
      <div className="flex flex-col space-y-8">
        {/* 页面标题 */}
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">人员资质管理</h2>
            <p className="text-muted-foreground">
              管理人员基本信息和证书资质，跟踪证书有效期
            </p>
          </div>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总人员数</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_personnel}</div>
                <p className="text-xs text-muted-foreground">
                  平均年龄 {stats.avg_age} 岁
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">证书总数</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.certificate_stats.total_certificates}</div>
                <p className="text-xs text-muted-foreground">
                  人均 {(stats.certificate_stats.total_certificates / stats.total_personnel).toFixed(1)} 个证书
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">部门分布</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(stats.by_department).length}</div>
                <p className="text-xs text-muted-foreground">
                  个部门
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">即将过期</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.certificate_stats.expiring_soon}
                </div>
                <p className="text-xs text-muted-foreground">
                  30天内过期证书
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 主要内容区域 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="qualification">人员资质</TabsTrigger>
            <TabsTrigger value="certificate">证书管理</TabsTrigger>
          </TabsList>

          <TabsContent value="qualification" className="space-y-4">
            <PersonnelQualificationPage />
          </TabsContent>

          <TabsContent value="certificate" className="space-y-4">
            <CertificatePage />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 