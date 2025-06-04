"use client"

import { Row } from "@tanstack/react-table"
import { MoreHorizontal, Edit, Trash, Eye, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PersonnelQualification } from "@/types/personnel"
import { useState } from "react"
import { PersonnelDetailDialog } from "./personnel-detail-dialog"
import { PersonnelFormDialog } from "./personnel-form-dialog"
import { PersonnelCertificateManager } from "./personnel-certificate-manager"
import { DeleteConfirmationDialog } from "@/components/shared/data-table"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { personnelQualificationAPI } from "@/api/personnel"
import { toast } from "sonner"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const personnel = row.original as PersonnelQualification;
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCertificateManager, setShowCertificateManager] = useState(false);

  const queryClient = useQueryClient();

  // 删除人员资质
  const deleteMutation = useMutation({
    mutationFn: (id: number) => personnelQualificationAPI.delete(id),
    onSuccess: () => {
      toast.success("删除成功");
      queryClient.invalidateQueries({ queryKey: ["personnel", "qualification", "list"] });
      queryClient.invalidateQueries({ queryKey: ["personnel", "stats"] });
      setShowDeleteDialog(false);
    },
    onError: () => {
      toast.error("删除失败");
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(personnel.id);
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
          <DropdownMenuItem onClick={() => setShowCertificateManager(true)}>
            <Award className="mr-2 h-4 w-4" />
            证书管理
          </DropdownMenuItem>
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
      <PersonnelDetailDialog
        personnel={personnel}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      />

      {/* 编辑对话框 */}
      <PersonnelFormDialog
        personnel={personnel}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        mode="edit"
      />

      {/* 证书管理对话框 */}
      <PersonnelCertificateManager
        personnel={personnel}
        open={showCertificateManager}
        onOpenChange={setShowCertificateManager}
      />

      {/* 删除确认对话框 */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="删除人员资质"
        description={`确定要删除人员 "${personnel.name}" 的资质信息吗？此操作将同时删除该人员的所有证书信息，且无法撤销。`}
        isDeleting={deleteMutation.isPending}
      />
    </>
  );
} 