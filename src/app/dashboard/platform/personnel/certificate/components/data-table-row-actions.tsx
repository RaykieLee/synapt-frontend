"use client"

import { Row } from "@tanstack/react-table"
import { MoreHorizontal, Edit, Trash, Eye, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Certificate } from "@/types/personnel"
import { useState } from "react"
import { CertificateDetailDialog } from "./certificate-detail-dialog"
import { CertificateFormDialog } from "./certificate-form-dialog"
import { DeleteConfirmationDialog } from "@/components/shared/data-table"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { certificateAPI } from "@/api/personnel"
import { toast } from "sonner"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const certificate = row.original as Certificate;
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const queryClient = useQueryClient();

  // 删除证书
  const deleteMutation = useMutation({
    mutationFn: (id: number) => certificateAPI.delete(id),
    onSuccess: () => {
      toast.success("删除成功");
      queryClient.invalidateQueries({ queryKey: ["personnel", "certificate", "list"] });
      queryClient.invalidateQueries({ queryKey: ["personnel", "stats"] });
      setShowDeleteDialog(false);
    },
    onError: () => {
      toast.error("删除失败");
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(certificate.id);
  };

  const handleDownload = () => {
    if (certificate.certificate_file) {
      // 这里应该实现文件下载逻辑
      window.open(certificate.certificate_file, '_blank');
    } else {
      toast.error("该证书没有关联文件");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">打开菜单</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => setShowDetailDialog(true)}>
            <Eye className="mr-2 h-4 w-4" />
            查看详情
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            编辑
          </DropdownMenuItem>
          {certificate.certificate_file && (
            <DropdownMenuItem onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              下载证书
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-red-600"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="mr-2 h-4 w-4" />
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 详情对话框 */}
      <CertificateDetailDialog
        certificate={certificate}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      />

      {/* 编辑对话框 */}
      <CertificateFormDialog
        certificate={certificate}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        mode="edit"
      />

      {/* 删除确认对话框 */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="删除证书"
        description={`确定要删除证书 "${certificate.certificate_name}" 吗？此操作无法撤销。`}
        isDeleting={deleteMutation.isPending}
      />
    </>
  );
} 