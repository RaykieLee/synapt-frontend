"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/shared/data-table"
import { DataTableRowActions } from "./data-table-row-actions"
import { Attachment, formatFileSize, getFileTypeIcon, isImageType } from "@/types/attachment"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Download, Eye } from "lucide-react"
import { attachmentApi } from "@/api/attachment"
import { useState, useEffect } from "react"
import { Checkbox } from "@/components/animate-ui/base/checkbox"

// 带认证的图片预览组件
function AuthenticatedImagePreview({ attachment }: { attachment: Attachment }) {
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const icon = getFileTypeIcon(attachment.mime_type)

  useEffect(() => {
    const loadPreviewUrl = async () => {
      try {
        setIsLoading(true)
        const url = await attachmentApi.getPreviewUrl(attachment.id)
        setPreviewUrl(url)
      } catch (error) {
        console.error("Failed to load preview URL:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadPreviewUrl()
  }, [attachment.id])

  return (
    <Avatar className="h-8 w-8">
      {!isLoading && previewUrl ? (
        <AvatarImage 
          src={previewUrl} 
          alt={attachment.file_name}
        />
      ) : null}
      <AvatarFallback>{icon}</AvatarFallback>
    </Avatar>
  )
}

export function getColumns(): ColumnDef<Attachment>[] {
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
      accessorKey: "file_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="文件名" />
      ),
      cell: ({ row }) => {
        const attachment = row.original;
        const icon = getFileTypeIcon(attachment.mime_type);
        const isImage = isImageType(attachment.mime_type);
        
        return (
          <div className="flex items-center space-x-2 w-[250px]">
            {isImage ? (
              <AuthenticatedImagePreview attachment={attachment} />
            ) : (
              <div className="h-8 w-8 flex items-center justify-center">
                <span className="text-lg">{icon}</span>
              </div>
            )}
            <div className="flex flex-col min-w-0 flex-1">
              <span 
                className="font-medium truncate cursor-pointer hover:text-primary" 
                title={attachment.file_name}
              >
                {attachment.file_name}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {attachment.mime_type}
              </span>
            </div>
          </div>
        );
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "file_size",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="文件大小" />
      ),
      cell: ({ row }) => {
        const size = row.getValue("file_size") as number;
        return <div className="w-[100px]">{formatFileSize(size)}</div>;
      },
      enableSorting: true,
    },
    {
      accessorKey: "mime_type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="文件类型" />
      ),
      cell: ({ row }) => {
        const mimeType = row.getValue("mime_type") as string;
        return (
          <div className="w-[150px]">
            <Badge variant="outline" className="text-xs">
              {mimeType}
            </Badge>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "entity_code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="关联实体" />
      ),
      cell: ({ row }) => {
        const entityCode = row.getValue("entity_code") as string;
        const entityId = row.original.entity_id;
        
        return (
          <div className="w-[120px]">
            <Badge variant="outline">
              {entityCode}
              {entityId && ` #${entityId}`}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "uploader_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="上传者" />
      ),
      cell: ({ row }) => {
        const uploaderName = row.getValue("uploader_name") as string;
        return (
          <div className="w-[100px]">
            {uploaderName ? (
              <Badge variant="secondary">{uploaderName}</Badge>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "bucket_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="存储桶" />
      ),
      cell: ({ row }) => {
        const bucketName = row.getValue("bucket_name") as string;
        return (
          <div className="w-[140px]">
            <Badge variant="outline">{bucketName}</Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="创建时间" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string;
        return (
          <div className="w-[150px]">
            {new Date(date).toLocaleString('zh-CN')}
          </div>
        );
      },
      enableSorting: true,
    },
    {
      id: "preview",
      header: "预览",
      cell: ({ row }) => {
        const attachment = row.original;
        const isImage = isImageType(attachment.mime_type);
        
        if (!isImage) {
          return <div className="w-[60px]">-</div>;
        }
        
        return (
          <div className="w-[60px]">
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                try {
                  const previewUrl = await attachmentApi.getPreviewUrl(attachment.id);
                  window.open(previewUrl, '_blank');
                } catch (error) {
                  console.error('Failed to get preview URL:', error);
                }
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
    {
      id: "download",
      header: "下载",
      cell: ({ row }) => {
        const attachment = row.original;
        
        return (
          <div className="w-[60px]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => attachmentApi.download(attachment.id)}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <DataTableRowActions row={row} />,
    },
  ];
} 