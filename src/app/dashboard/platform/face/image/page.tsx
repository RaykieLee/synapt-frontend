"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { faceImageAPI } from "@/api/face"
import { FaceImageQuery, FaceImageSearchParams } from "@/types/face"

export default function FaceImagePage() {
  const [searchParams, setSearchParams] = useState<FaceImageSearchParams>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // 构建查询参数
  const queryParams: FaceImageQuery = {
    page_num: currentPage,
    page_size: pageSize,
    sorts: [
      {
        field: "create_time",
        order: "desc"
      }
    ],
    params: {
      keywords: {
        image_id: searchParams.image_id,
      },
      status: searchParams.status,
      person_id: searchParams.person_id,
      library_id: searchParams.library_id,
      search_mode: "and"
    }
  }

  // 获取人脸图片列表
  const { data, isLoading, error } = useQuery({
    queryKey: ["face-images", "list", queryParams],
    queryFn: () => faceImageAPI.getList(queryParams),
    staleTime: 5 * 60 * 1000,
  })

  const handleSearch = (params: FaceImageSearchParams) => {
    setSearchParams(params)
    setCurrentPage(1) // 重置到第一页
  }

  const handleReset = () => {
    setSearchParams({})
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1) // 重置到第一页
  }

  const images = data?.data?.list || []
  const total = data?.data?.total || 0
  const pageCount = Math.ceil(total / pageSize)

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>人脸图片管理</CardTitle>
            <CardDescription>加载失败，请刷新页面重试</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">人脸图片管理</h1>
          <p className="text-muted-foreground">
            管理人脸识别系统中的人脸图片信息
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>人脸图片列表</CardTitle>
          <CardDescription>
            共 {total} 条记录
            {searchParams.library_id && (
              <span className="ml-2 text-blue-600">
                已筛选人脸库
              </span>
            )}
            {searchParams.person_id && (
              <span className="ml-2 text-green-600">
                已筛选人员
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={images}
            searchParams={searchParams}
            onSearch={handleSearch}
            onReset={handleReset}
            pagination={{
              pageIndex: currentPage - 1,
              pageSize: pageSize,
              total: total,
              onPageChange: handlePageChange,
              onPageSizeChange: handlePageSizeChange,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
} 