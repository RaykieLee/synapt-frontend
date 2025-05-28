"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/shared/data-table"
import { DataTableRowActions } from "./data-table-row-actions"
import { PersonnelQualification } from "@/types/personnel"

export function getColumns(): ColumnDef<PersonnelQualification>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="姓名" />
      ),
      cell: ({ row }) => <div className="w-[120px] font-medium">{row.getValue("name")}</div>,
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "gender",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="性别" />
      ),
      cell: ({ row }) => {
        const gender = row.getValue("gender") as string;
        return (
          <Badge variant={gender === "男" ? "default" : "secondary"}>
            {gender}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "age",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="年龄" />
      ),
      cell: ({ row }) => {
        const age = row.getValue("age") as number;
        return <div className="w-[60px]">{age || "-"}</div>;
      },
    },
    {
      accessorKey: "department",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="部门" />
      ),
      cell: ({ row }) => {
        const department = row.getValue("department") as string;
        return <div className="w-[120px]">{department || "-"}</div>;
      },
    },
    {
      accessorKey: "position",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="职位" />
      ),
      cell: ({ row }) => {
        const position = row.getValue("position") as string;
        return <div className="w-[120px]">{position || "-"}</div>;
      },
    },
    {
      accessorKey: "phone",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="联系电话" />
      ),
      cell: ({ row }) => {
        const phone = row.getValue("phone") as string;
        return <div className="w-[120px]">{phone || "-"}</div>;
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="邮箱" />
      ),
      cell: ({ row }) => {
        const email = row.getValue("email") as string;
        return <div className="w-[180px] truncate">{email || "-"}</div>;
      },
    },
    {
      accessorKey: "certificates",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="证书数量" />
      ),
      cell: ({ row }) => {
        const certificates = row.getValue("certificates") as any[];
        const count = certificates?.length || 0;
        return (
          <Badge variant={count > 0 ? "default" : "secondary"}>
            {count} 个
          </Badge>
        );
      },
      enableSorting: false,
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
            {status === "0" ? "正常" : "停用"}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "entry_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="入职时间" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("entry_date") as string;
        return <div className="w-[100px]">{date || "-"}</div>;
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