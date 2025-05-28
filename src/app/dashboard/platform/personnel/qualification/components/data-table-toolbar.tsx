"use client"

import { Table } from "@tanstack/react-table"
import { X, Plus, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/shared/data-table"
import { PersonnelQualificationQuery } from "@/types/personnel"
import { useState } from "react"
import { PersonnelFormDialog } from "./personnel-form-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  query: PersonnelQualificationQuery
  setQuery: React.Dispatch<React.SetStateAction<PersonnelQualificationQuery>>
}

export function DataTableToolbar<TData>({
  table,
  query,
  setQuery,
}: DataTableToolbarProps<TData>) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchValue, setSearchValue] = useState(query.params?.keywords?.name || "");

  const isFiltered = query.params?.keywords?.name || 
                    query.params?.status || 
                    query.params?.gender || 
                    query.params?.department;

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchValue(value);
    setQuery(prev => ({
      ...prev,
      page_num: 1,
      params: {
        ...prev.params,
        keywords: {
          ...prev.params?.keywords,
          name: value || undefined
        }
      }
    }));
  };

  // 处理状态筛选
  const handleStatusFilter = (value: string) => {
    setQuery(prev => ({
      ...prev,
      page_num: 1,
      params: {
        ...prev.params,
        status: value === "all" ? undefined : value
      }
    }));
  };

  // 处理性别筛选
  const handleGenderFilter = (value: string) => {
    setQuery(prev => ({
      ...prev,
      page_num: 1,
      params: {
        ...prev.params,
        gender: value === "all" ? undefined : value
      }
    }));
  };

  // 重置筛选
  const resetFilters = () => {
    setSearchValue("");
    setQuery(prev => ({
      ...prev,
      page_num: 1,
      params: {
        keywords: {},
        search_mode: "and"
      }
    }));
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索姓名..."
            value={searchValue}
            onChange={(event) => handleSearch(event.target.value)}
            className="pl-8 h-8 w-[150px] lg:w-[250px]"
          />
        </div>

        {/* 状态筛选 */}
        <Select
          value={query.params?.status || "all"}
          onValueChange={handleStatusFilter}
        >
          <SelectTrigger className="h-8 w-[120px]">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="0">正常</SelectItem>
            <SelectItem value="1">停用</SelectItem>
          </SelectContent>
        </Select>

        {/* 性别筛选 */}
        <Select
          value={query.params?.gender || "all"}
          onValueChange={handleGenderFilter}
        >
          <SelectTrigger className="h-8 w-[100px]">
            <SelectValue placeholder="性别" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部性别</SelectItem>
            <SelectItem value="男">男</SelectItem>
            <SelectItem value="女">女</SelectItem>
          </SelectContent>
        </Select>

        {/* 重置按钮 */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={resetFilters}
            className="h-8 px-2 lg:px-3"
          >
            重置
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* 新增按钮 */}
        <Button
          size="sm"
          onClick={() => setShowCreateDialog(true)}
          className="h-8"
        >
          <Plus className="mr-2 h-4 w-4" />
          新增人员
        </Button>

        {/* 列显示选项 */}
        <DataTableViewOptions table={table} />
      </div>

      {/* 新增人员对话框 */}
      <PersonnelFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        mode="create"
      />
    </div>
  )
} 