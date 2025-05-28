"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/shared/data-table"
import { DataTableRowActions } from "./data-table-row-actions"
import { Certificate } from "@/types/personnel"

export function getColumns(): ColumnDef<Certificate>[] {
  return [
    {
      accessorKey: "certificate_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="证书名称" />
      ),
      cell: ({ row }) => <div className="w-[150px] font-medium">{row.getValue("certificate_name")}</div>,
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "certificate_category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="证书类别" />
      ),
      cell: ({ row }) => {
        const category = row.getValue("certificate_category") as string;
        return (
          <Badge variant="outline">
            {category}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "certificate_level",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="证书级别" />
      ),
      cell: ({ row }) => {
        const level = row.getValue("certificate_level") as string;
        return (
          <Badge variant="secondary">
            {level}
          </Badge>
        );
      },
    },
    {
      accessorKey: "issuing_authority",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="颁发机构" />
      ),
      cell: ({ row }) => {
        const authority = row.getValue("issuing_authority") as string;
        return <div className="w-[120px]">{authority || "-"}</div>;
      },
    },
    {
      accessorKey: "certificate_number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="证书编号" />
      ),
      cell: ({ row }) => {
        const number = row.getValue("certificate_number") as string;
        return <div className="w-[120px] font-mono text-sm">{number || "-"}</div>;
      },
    },
    {
      accessorKey: "issue_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="颁发日期" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("issue_date") as string;
        return <div className="w-[100px]">{date || "-"}</div>;
      },
    },
    {
      accessorKey: "expiry_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="有效期至" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("expiry_date") as string;
        if (!date) return <div className="w-[100px]">-</div>;
        
        const expiryDate = new Date(date);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        let variant: "default" | "destructive" | "secondary" = "default";
        if (daysUntilExpiry < 0) {
          variant = "destructive"; // 已过期
        } else if (daysUntilExpiry <= 30) {
          variant = "secondary"; // 即将过期
        }
        
        return (
          <div className="w-[100px]">
            <Badge variant={variant} className="text-xs">
              {date}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="状态" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={status === "0" ? "default" : "secondary"}>
            {status === "0" ? "有效" : "无效"}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "create_time",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="创建时间" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("create_time") as string;
        return <div className="w-[150px]">{date ? new Date(date).toLocaleString() : "-"}</div>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <DataTableRowActions row={row} />,
    },
  ];
} 