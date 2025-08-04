"use client"

import { Row } from "@tanstack/react-table"
import { MoreHorizontal, Edit, Trash, Download, Eye, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Attachment, isImageType } from "@/types/attachment"
import { attachmentApi } from "@/api/attachment"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { string } from "zod"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const attachment = row.original as Attachment;
  const queryClient = useQueryClient();

  // 删除附件
  const deleteMutation = useMutation({
    mutationFn: (id: string) => attachmentApi.delete(id),
    onSuccess: () => {
      toast.success("附件删除成功");
      queryClient.invalidateQueries({ queryKey: ["attachments", "list"] });
    },
    onError: (error: any) => {
      toast.error("删除失败：" + (error.message || "未知错误"));
    },
  });

  const handleDelete = () => {
    if (confirm(`您确定要删除附件 "${attachment.file_name}" 吗？此操作无法撤销。`)) {
      deleteMutation.mutate(attachment.id);
    }
  };

  const handleCopyUrl = async () => {
    try {
      const url = await attachmentApi.getPreviewUrl(attachment.id);
      await navigator.clipboard.writeText(url);
      toast.success("链接已复制到剪贴板");
    } catch (error) {
      toast.error("复制失败");
    }
  };

  const handlePreview = async () => {
    if (isImageType(attachment.mime_type)) {
      const url = await attachmentApi.getPreviewUrl(attachment.id);
      window.open(url, '_blank');
    } else {
      toast.info("该文件类型不支持预览");
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
          <DropdownMenuItem onClick={() => attachmentApi.download(attachment.id)}>
            <Download className="mr-2 h-4 w-4" />
            下载
          </DropdownMenuItem>
          
          {isImageType(attachment.mime_type) && (
            <DropdownMenuItem onClick={handlePreview}>
              <Eye className="mr-2 h-4 w-4" />
              预览
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem onClick={handleCopyUrl}>
            <Copy className="mr-2 h-4 w-4" />
            复制链接
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="text-red-600"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash className="mr-2 h-4 w-4" />
            {deleteMutation.isPending ? "删除中..." : "删除"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
} 