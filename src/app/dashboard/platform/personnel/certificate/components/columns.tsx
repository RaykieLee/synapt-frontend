"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/animate-ui/base/checkbox"
import { DataTableColumnHeader } from "@/components/shared/data-table"
import { DataTableRowActions } from "./data-table-row-actions"
import { Certificate } from "@/types/personnel"

export function getColumns(): ColumnDef<Certificate>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <label className="translate-y-[2px]">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => {
              table.toggleAllPageRowsSelected(!!value)
            }}
            aria-label="全选"
          />
        </label>
      ),
      cell: ({ row }) => (
        <label className="translate-y-[2px]">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value)
            }}
            aria-label="选择行"
          />
        </label>
      ),
      enableSorting: false,
      enableHiding: false,
    },
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
        const level = row.getValue("certificate_level") as number;
        const levelMap: Record<number, string> = {
          1: "初级",
          2: "中级", 
          3: "高级",
          4: "专家级"
        };
        return (
          <Badge variant="secondary">
            {levelMap[level] || level}
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
        return (
          <div 
            className="w-[160px] truncate" 
            title={authority}
          >
            {authority || "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "certificate_number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="证书编号" />
      ),
      cell: ({ row }) => {
        const number = row.getValue("certificate_number") as string;
        return (
          <div 
            className="w-[160px] font-mono text-sm truncate" 
            title={number}
          >
            {number || "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "personnel",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="持有人员" />
      ),
      cell: ({ row }) => {
        const certificate = row.original;
        const personnel = certificate.personnel || [];
        
        if (personnel.length === 0) {
          return <div className="w-[120px] text-muted-foreground">暂无人员</div>;
        }
        
        if (personnel.length === 1) {
          return (
            <div className="w-[120px]">
              <Badge variant="outline" className="text-xs truncate max-w-full">
                {personnel[0].name}
              </Badge>
            </div>
          );
        }
        
        return (
          <div className="w-[120px] space-y-1">
            <Badge variant="outline" className="text-xs truncate max-w-full">
              {personnel[0].name}
            </Badge>
            {personnel.length > 1 && (
              <Badge variant="secondary" className="text-xs ml-1">
                +{personnel.length - 1}
              </Badge>
            )}
          </div>
        );
      },
      enableSorting: false,
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