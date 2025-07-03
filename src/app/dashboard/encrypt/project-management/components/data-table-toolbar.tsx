"use client"

import { ChangeEvent, useState } from "react"
import { Table } from "@tanstack/react-table"
import { X, Filter, PlusCircle, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ProjectManagementSearchParams } from "@/types/encrypt/project-management"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchParams: ProjectManagementSearchParams
  onSearchParamsChange: (params: ProjectManagementSearchParams) => void
  selectedCount: number
  onBatchDelete: () => void
  onAddNew: () => void
}

export function DataTableToolbar<TData>({
  table,
  searchParams,
  onSearchParamsChange,
  selectedCount,
  onBatchDelete,
  onAddNew,
}: DataTableToolbarProps<TData>) {
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)

  const isFiltered = searchParams.keywords?.project_name || 
                    searchParams.current_status || 
                    searchParams.has_token ||
                    searchParams.keywords?.project_code ||
                    searchParams.keywords?.sector ||
                    searchParams.keywords?.track ||
                    searchParams.keywords?.support_chain

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    onSearchParamsChange({
      ...searchParams,
      keywords: {
        ...searchParams.keywords,
        project_name: value,
      },
    })
  }

  const handleStatusChange = (value: string) => {
    onSearchParamsChange({
      ...searchParams,
      current_status: value === "all" ? undefined : value,
    })
  }

  const handleTokenChange = (value: string) => {
    onSearchParamsChange({
      ...searchParams,
      has_token: value === "all" ? undefined : value,
    })
  }

  const updateAdvancedFilter = (key: string, value: string) => {
    onSearchParamsChange({
      ...searchParams,
      keywords: {
        ...searchParams.keywords,
        [key]: value || undefined,
      },
    })
  }

  const resetAllFilters = () => {
    onSearchParamsChange({
      keywords: {},
    })
  }

  const clearAdvancedFilters = () => {
    // 只保留主要筛选条件
    onSearchParamsChange({
      ...searchParams,
      keywords: {
        project_name: searchParams.keywords?.project_name,
      },
    })
  }

  // 计算高级筛选器数量
  const getActiveFiltersCount = () => {
    let count = 0
    if (searchParams.current_status) count++
    if (searchParams.has_token) count++
    if (searchParams.keywords?.project_code) count++
    if (searchParams.keywords?.sector) count++
    if (searchParams.keywords?.track) count++
    if (searchParams.keywords?.support_chain) count++
    return count
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/* 项目名称搜索 */}
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索项目名称..."
            value={searchParams.keywords?.project_name || ""}
            onChange={handleSearchChange}
            className="pl-8"
          />
        </div>

        {/* 项目状态筛选 */}
        <Select
          value={searchParams.current_status || "all"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="项目状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="not_started">未开始</SelectItem>
            <SelectItem value="in_progress">进行中</SelectItem>
            <SelectItem value="completed">已结束</SelectItem>
          </SelectContent>
        </Select>

        {/* 发币状态筛选 */}
        <Select
          value={searchParams.has_token || "all"}
          onValueChange={handleTokenChange}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="发币状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="1">已发币</SelectItem>
            <SelectItem value="0">未发币</SelectItem>
          </SelectContent>
        </Select>

        {/* 更多筛选 */}
        <Popover open={moreFiltersOpen} onOpenChange={setMoreFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 border-dashed relative">
              <Filter className="mr-2 h-4 w-4" />
              更多筛选
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">高级筛选</h4>
                <Button variant="ghost" size="sm" onClick={clearAdvancedFilters}>
                  清除
                </Button>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-3">
                {/* 项目编号搜索 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">项目编号</label>
                  <Input
                    placeholder="搜索项目编号..."
                    value={searchParams.keywords?.project_code || ""}
                    onChange={(e) => updateAdvancedFilter('project_code', e.target.value)}
                  />
                </div>

                {/* 所属板块搜索 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">所属板块</label>
                  <Input
                    placeholder="如：DeFi, NFT..."
                    value={searchParams.keywords?.sector || ""}
                    onChange={(e) => updateAdvancedFilter('sector', e.target.value)}
                  />
                </div>

                {/* 赛道搜索 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">赛道</label>
                  <Input
                    placeholder="搜索赛道..."
                    value={searchParams.keywords?.track || ""}
                    onChange={(e) => updateAdvancedFilter('track', e.target.value)}
                  />
                </div>

                {/* 支持链搜索 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">支持链</label>
                  <Input
                    placeholder="如：Ethereum..."
                    value={searchParams.keywords?.support_chain || ""}
                    onChange={(e) => updateAdvancedFilter('support_chain', e.target.value)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-muted-foreground">
                  {getActiveFiltersCount() > 0 ? 
                    `已应用 ${getActiveFiltersCount()} 个筛选条件` : 
                    "未应用筛选条件"
                  }
                </p>
                <Button size="sm" onClick={() => setMoreFiltersOpen(false)}>
                  完成
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* 重置筛选 */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={resetAllFilters}
            className="h-8 px-2 lg:px-3"
          >
            重置
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}

        {/* 显示活跃筛选条件 */}
        {isFiltered && (
          <div className="flex items-center space-x-1">
            <Separator orientation="vertical" className="h-4" />
            <div className="flex flex-wrap gap-1">
              {searchParams.keywords?.project_name && (
                <Badge variant="secondary" className="text-xs">
                  名称: {searchParams.keywords.project_name}
                </Badge>
              )}
              {searchParams.current_status && (
                <Badge variant="secondary" className="text-xs">
                  状态: {searchParams.current_status === 'not_started' ? '未开始' : 
                        searchParams.current_status === 'in_progress' ? '进行中' : '已结束'}
                </Badge>
              )}
              {searchParams.has_token && (
                <Badge variant="secondary" className="text-xs">
                  发币: {searchParams.has_token === '1' ? '是' : '否'}
                </Badge>
              )}
              {searchParams.keywords?.project_code && (
                <Badge variant="secondary" className="text-xs">
                  编号: {searchParams.keywords.project_code}
                </Badge>
              )}
              {searchParams.keywords?.sector && (
                <Badge variant="secondary" className="text-xs">
                  板块: {searchParams.keywords.sector}
                </Badge>
              )}
              {searchParams.keywords?.track && (
                <Badge variant="secondary" className="text-xs">
                  赛道: {searchParams.keywords.track}
                </Badge>
              )}
              {searchParams.keywords?.support_chain && (
                <Badge variant="secondary" className="text-xs">
                  支持链: {searchParams.keywords.support_chain}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* 批量删除 */}
        {selectedCount > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onBatchDelete}
            className="h-8"
          >
            删除选中 ({selectedCount})
          </Button>
        )}

        {/* 列显示控制 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto hidden h-8 lg:flex"
            >
              列显示
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>显示列</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                const columnLabels: { [key: string]: string } = {
                  project_code: "项目编号",
                  project_name: "项目名称",
                  official_website: "项目官网",
                  support_chain: "支持链",
                  sector: "所属板块",
                  track: "赛道",
                  has_token: "是否发币",
                  current_status: "当前状态",
                  twitter_followers: "推特粉丝",
                  financing_amount: "融资金额",
                  create_time: "创建时间",
                }
                
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {columnLabels[column.id] || column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 新增按钮 */}
        <Button onClick={onAddNew} size="sm" className="h-8">
          <PlusCircle className="mr-2 h-4 w-4" />
          新增项目
        </Button>
      </div>
    </div>
  )
} 