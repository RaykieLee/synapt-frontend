"use client";

import { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTableToolbar } from "./data-table-toolbar";
import { LLMConfig, LLMConfigSearchParams } from "@/types/llm-config";
import { DataTablePagination } from "@/components/shared/data-table";

interface DataTableProps {
  columns: ColumnDef<LLMConfig>[];
  data: LLMConfig[];
  loading?: boolean;
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  onSearch: (searchParams: LLMConfigSearchParams) => void;
  onPageChange: (page: number) => void;
  onEdit: (config: LLMConfig) => void;
  onBatchDelete: (selectedIds: string[]) => void;
  onAddNew: () => void;
}

export function DataTable({
  columns,
  data,
  loading = false,
  pageCount,
  pageIndex,
  pageSize,
  onSearch,
  onPageChange,
  onEdit,
  onBatchDelete,
  onAddNew,
}: DataTableProps) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    meta: {
      onEdit,
    },
  });

  const selectedCount = table.getSelectedRowModel().rows.length;

  const handleBatchDelete = () => {
    const selectedIds = table.getSelectedRowModel().rows.map(
      (row) => (row.original as LLMConfig).id
    );
    onBatchDelete(selectedIds);
    table.resetRowSelection();
  };

  return (
    <div className="space-y-4">
      <DataTableToolbar 
        table={table} 
        onSearch={onSearch} 
        onAddNew={onAddNew}
        onBatchDelete={handleBatchDelete}
      />

      <div className="rounded-md border min-h-[520px]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="h-12">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              // 骨架屏加载状态
              Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index} className="h-12">
                  {columns.map((_, cellIndex) => (
                    <TableCell key={cellIndex} className="h-12">
                      <div className="h-4 bg-muted animate-pulse rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="h-12"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="h-12">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        table={table}
        onPageChange={onPageChange}
      />
    </div>
  );
}