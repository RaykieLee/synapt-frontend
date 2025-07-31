"use client"

import { ColumnDef } from "@tanstack/react-table"
import { LLMConfig, ModelType } from "@/types/llm-config"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/animate-ui/base/checkbox"
import { DataTableRowActions } from "./data-table-row-actions"

export function getColumns(onEdit?: (config: LLMConfig) => void): ColumnDef<LLMConfig>[] {
  return [
    // 选择列（必须，支持批量操作）
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "config_name",
      header: "配置名称",
      cell: ({ row }) => (
        <div className="font-medium max-w-[200px] truncate">{row.getValue("config_name")}</div>
      ),
    },
    {
      accessorKey: "model_type",
      header: "模型类型",
      cell: ({ row }) => {
        const modelType = row.getValue("model_type") as string
        const getTypeColor = (type: string) => {
          switch (type) {
            case ModelType.LLM:
              return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            case ModelType.EMBEDDING:
              return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            case ModelType.SPEECH2TEXT:
              return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
            case ModelType.TTS:
              return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
            default:
              return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
          }
        }
        return (
          <Badge className={getTypeColor(modelType)}>
            {modelType}
          </Badge>
        )
      },
    },
    {
      accessorKey: "provider",
      header: "提供商",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("provider")}</div>
      ),
    },
    {
      accessorKey: "model_name",
      header: "模型名称",
      cell: ({ row }) => (
        <div className="max-w-[150px] truncate">{row.getValue("model_name")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge variant={status === "0" ? "default" : "secondary"}>
            {status === "0" ? "启用" : "停用"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "description",
      header: "描述",
      cell: ({ row }) => {
        const description = row.getValue("description") as string
        return (
          <div className="max-w-[200px] truncate" title={description}>
            {description || "-"}
          </div>
        )
      },
    },
    {
      accessorKey: "create_time",
      header: "创建时间",
      cell: ({ row }) => {
        const createTime = row.getValue("create_time") as string
        return createTime ? new Date(createTime).toLocaleString('zh-CN') : "-"
      },
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => <DataTableRowActions row={row} onEdit={onEdit} />,
      enableSorting: false,
      enableHiding: false,
    },
  ]
}