"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
import { useState, useCallback, useRef } from "react"
import debounce from "lodash/debounce"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DataTableViewOptions,
  DataTableFacetedFilter,
  DeleteConfirmationDialog
} from "@/components/shared/data-table"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { UserSearchParams, User } from "@/types/user"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onSearch?: (params: UserSearchParams) => void
  columnLabels?: Record<string, string>
  showCreateButton?: boolean
  onCreateClick?: () => void
  createButtonText?: string
  createButtonIcon?: React.ComponentType<any>
}

export function DataTableToolbar<TData extends object>({
  table,
  onSearch,
  columnLabels,
  showCreateButton = false,
  onCreateClick,
  createButtonText = "新建",
  createButtonIcon: CreateIcon,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [deleteOpen, setDeleteOpen] = useState(false)
  
  // 使用ref存储当前的搜索参数
  const searchParamsRef = useRef<UserSearchParams>({})

  // 状态选项
  const statusOptions = [
    { label: "正常", value: "0" },
    { label: "停用", value: "1" },
  ]

  // 批量删除
  const queryClient = useQueryClient()

  // 更新搜索参数
  const updateSearchParams = (key: keyof UserSearchParams, value: string | undefined) => {
    searchParamsRef.current = {
      ...searchParamsRef.current,
      [key]: value || undefined
    }
    debouncedSearch();
  }

  // 创建防抖搜索函数
  const debouncedSearchFn = useCallback(() => {
    if (onSearch) {
      onSearch(searchParamsRef.current)
    }
  }, [onSearch]);

  // 使用防抖处理搜索
  const debouncedSearch = debounce(debouncedSearchFn, 500);

  // 自定义用户列标签
  const userColumnLabels = {
    user_name: "用户名",
    nick_name: "昵称",
    email: "邮箱",
    phonenumber: "手机号",
    roles: "角色",
    status: "状态",
    create_time: "创建时间",
    ...columnLabels
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="搜索用户名..."
          value={(table.getColumn("user_name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const value = event.target.value
            table.getColumn("user_name")?.setFilterValue(value)
            updateSearchParams("user_name", value)
          }}
          className="h-8 w-[150px] lg:w-[200px]"
        />
        <Input
          placeholder="搜索昵称..."
          value={(table.getColumn("nick_name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const value = event.target.value
            table.getColumn("nick_name")?.setFilterValue(value)
            updateSearchParams("nick_name", value)
          }}
          className="h-8 w-[150px] lg:w-[180px]"
        />
        <Input
          placeholder="搜索邮箱..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const value = event.target.value
            table.getColumn("email")?.setFilterValue(value)
            updateSearchParams("email", value)
          }}
          className="h-8 w-[150px] lg:w-[200px]"
        />
        <Input
          placeholder="搜索手机号..."
          value={(table.getColumn("phonenumber")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const value = event.target.value
            table.getColumn("phonenumber")?.setFilterValue(value)
            updateSearchParams("phonenumber", value)
          }}
          className="h-8 w-[150px] lg:w-[180px]"
        />
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="状态"
            options={statusOptions}
            onSelect={(selectedValue) => {
              const status = selectedValue && selectedValue.length > 0 ? selectedValue[0] : undefined;
              updateSearchParams("status", status);
              if (onSearch) {
                const updatedParams = {
                  ...searchParamsRef.current,
                  status: status
                };
                onSearch(updatedParams);
              }
            }}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters()
              searchParamsRef.current = {}
              if (onSearch) {
                onSearch({})
              }
            }}
            className="h-8 px-2 lg:px-3"
          >
            重置
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {table.getSelectedRowModel().rows.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            className="h-8"
            onClick={() => setDeleteOpen(true)}
          >
            删除选中
          </Button>
        )}
        <DataTableViewOptions 
          table={table} 
          columnLabels={userColumnLabels}
        />
        {showCreateButton && onCreateClick && (
          <Button
            size="sm"
            className="h-8"
            onClick={onCreateClick}
          >
            {CreateIcon && <CreateIcon className="mr-2 h-4 w-4" />}
            {createButtonText}
          </Button>
        )}
      </div>

      {/* 批量删除确认对话框 */}
      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => {
          const ids = table.getSelectedRowModel().rows.map(
            (row) => (row.original as User).user_id
          )
          // 这里需要调用批量删除的回调
          console.log("批量删除用户IDs:", ids)
        }}
        title="确认删除"
        description={`确定要删除选中的 ${table.getSelectedRowModel().rows.length} 个用户吗？此操作不可恢复。`}
        isDeleting={false}
      />
    </div>
  )
} 