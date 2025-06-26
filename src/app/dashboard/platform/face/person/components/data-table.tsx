"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronDown, ChevronRight, Camera, Plus } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
} from "@/components/animate-ui/headless/accordion"

import { DataTablePagination } from "@/components/shared/data-table"
import { DataTableToolbar } from "./data-table-toolbar"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { FacePersonSearchParams, FacePerson, FaceImageSimple } from "@/types/face"
import { apiRequest } from "@/lib/api"
import { attachmentApi } from "@/api/attachment"
import { faceImageAPI } from "@/api/face"
import { toast } from "sonner"
import { getImagePreviewUrl, openImagePreview } from "@/utils/image-utils"
import { Progress } from "@/components/animate-ui/radix/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/radix/dialog"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageCount?: number
  pageIndex?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onSearch?: (params: FacePersonSearchParams) => void
  onSortingChange?: (sorting: SortingState) => void
  isLoading?: boolean
  columnLabels?: Record<string, string>
  minHeight?: string
}

// 上传进度接口
interface UploadProgress {
  fileId: string
  fileName: string
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
}

// 人脸图片展示组件
function FaceImagesDisplay({ person }: { person: FacePerson }) {
  const queryClient = useQueryClient()
  const [previewUrls, setPreviewUrls] = React.useState<Record<string, string>>({})
  const [loadingImages, setLoadingImages] = React.useState<Set<string>>(new Set())
  const [errorImages, setErrorImages] = React.useState<Set<string>>(new Set())
  const [uploadProgresses, setUploadProgresses] = React.useState<UploadProgress[]>([])
  const [deleteImageDialog, setDeleteImageDialog] = React.useState<{
    open: boolean
    imageId: string
    fileName: string
  }>({
    open: false,
    imageId: '',
    fileName: ''
  })
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const { data: images, isLoading } = useQuery({
    queryKey: ["face-images", "by-person", person.id],
    queryFn: async () => {
      return await apiRequest<FaceImageSimple[]>(`/api/v1/platform/face/person/${person.id}/images`, 'GET')
    },
    enabled: !!person.id,
  })

  // 加载图片预览URL
  React.useEffect(() => {
    const loadPreviewUrls = async () => {
      if (!images) return
      for (const image of images) {
        if (image.image_id && !previewUrls[image.image_id] && !errorImages.has(image.image_id)) {
          setLoadingImages(prev => new Set(prev).add(image.image_id!))
          try {
            const previewUrl = await getImagePreviewUrl(image.image_id)
            setPreviewUrls(prev => ({
              ...prev,
              [image.image_id!]: previewUrl
            }))
          } catch (error) {
            console.error(`获取图片预览失败: ${image.image_id}`, error)
            setErrorImages(prev => new Set(prev).add(image.image_id!))
          } finally {
            setLoadingImages(prev => {
              const newSet = new Set(prev)
              newSet.delete(image.image_id!)
              return newSet
            })
          }
        }
      }
    }

    if (images && images.length > 0) {
      loadPreviewUrls()
    }
  }, [images, previewUrls, errorImages])

  // 上传单个文件
  const uploadSingleFile = async (file: File) => {
    const fileId = `${file.name}-${Date.now()}-${Math.random()}`
    
    // 添加上传进度
    setUploadProgresses(prev => [...prev, {
      fileId,
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    }])

    try {
      // 模拟上传进度（实际项目中attachmentApi.upload可能需要支持进度回调）
      const updateProgress = (progress: number) => {
        setUploadProgresses(prev => prev.map(item => 
          item.fileId === fileId ? { ...item, progress } : item
        ))
      }

      updateProgress(10)

      // 1. 上传文件到附件系统
      const attachment = await attachmentApi.upload(
        file,
        'face_image',
        parseInt(person.id),
        'attachment'
      )

      updateProgress(70)

      // 2. 创建人脸图片记录
      const faceImageData = {
        person_id: person.id,
        library_id: person.library_id,
        image_id: attachment.id,
        status: "0"
      }

      await apiRequest('/api/v1/platform/face/image/create', 'POST', faceImageData)
      
      updateProgress(100)

      // 标记为成功
      setUploadProgresses(prev => prev.map(item => 
        item.fileId === fileId ? { ...item, status: 'success' } : item
      ))

      // 3秒后移除进度条
      setTimeout(() => {
        setUploadProgresses(prev => prev.filter(item => item.fileId !== fileId))
      }, 3000)

      // 刷新数据和清空缓存
      queryClient.invalidateQueries({ queryKey: ["face-images", "by-person", person.id] })
      setPreviewUrls({})
      setErrorImages(new Set())

      toast.success(`成功上传人脸图片: ${file.name}`)
    } catch (error) {
      console.error(`上传文件 ${file.name} 失败:`, error)
      
      // 标记为失败
      setUploadProgresses(prev => prev.map(item => 
        item.fileId === fileId ? { 
          ...item, 
          status: 'error',
          progress: 0,
          error: error instanceof Error ? error.message : '上传失败'
        } : item
      ))

      // 5秒后移除错误的进度条
      setTimeout(() => {
        setUploadProgresses(prev => prev.filter(item => item.fileId !== fileId))
      }, 5000)

      toast.error(`上传失败: ${file.name}`)
    }
  }

  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files).filter(file => 
        file.type.startsWith('image/')
      )
      
      // 直接开始上传每个文件
      fileArray.forEach(file => {
        uploadSingleFile(file)
      })
    }
  }

  // 删除人脸图片
  const deleteMutation = useMutation({
    mutationFn: async (imageId: string) => {
      await faceImageAPI.delete(imageId)
    },
    onSuccess: () => {
      toast.success("人脸图片删除成功")
      queryClient.invalidateQueries({ queryKey: ["face-images", "by-person", person.id] })
      // 清空预览URL缓存
      setPreviewUrls({})
      setErrorImages(new Set())
    },
    onError: (error: any) => {
      toast.error("删除失败：" + (error.message || "未知错误"))
    },
  })

  const handleDeleteImage = (imageId: string, fileName?: string) => {
    setDeleteImageDialog({
      open: true,
      imageId,
      fileName: fileName || `ID: ${imageId.slice(-8)}`
    })
  }

  const confirmDeleteImage = () => {
    deleteMutation.mutate(deleteImageDialog.imageId)
    setDeleteImageDialog({ open: false, imageId: '', fileName: '' })
  }

  const handleImageClick = async (image: FaceImageSimple) => {
    if (!image.image_id) return
    
    try {
      let imageUrl = previewUrls[image.image_id]
      if (!imageUrl) {
        imageUrl = await getImagePreviewUrl(image.image_id)
      }
      // 在新窗口中打开图片
      window.open(imageUrl, '_blank')
    } catch (error) {
      toast.error('无法打开图片预览')
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        <div className="text-sm text-muted-foreground">加载人脸图片中...</div>
        <div className="grid grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, index) => (
            <Skeleton key={index} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">
            人脸图片 ({images?.length || 0})
          </div>
          <div className="text-xs text-muted-foreground">
            人员：{person.person_name} ({person.person_code})
          </div>
        </div>
        
        <div className="space-y-4">
          {/* 上传进度条区域 */}
          {uploadProgresses.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">上传进度</div>
              {uploadProgresses.map((uploadProgress) => (
                <div key={uploadProgress.fileId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate max-w-[200px]">{uploadProgress.fileName}</span>
                    <span className={
                      uploadProgress.status === 'success' ? 'text-green-600' :
                      uploadProgress.status === 'error' ? 'text-red-600' :
                      'text-blue-600'
                    }>
                      {uploadProgress.status === 'success' ? '✓ 完成' :
                       uploadProgress.status === 'error' ? '✗ 失败' :
                       `${uploadProgress.progress}%`}
                    </span>
                  </div>
                  <Progress 
                    value={uploadProgress.status === 'success' ? 100 : uploadProgress.progress} 
                    className="h-2"
                  />
                  {uploadProgress.status === 'error' && uploadProgress.error && (
                    <div className="text-xs text-red-500">{uploadProgress.error}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 图片网格 */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* 添加图片按钮 */}
            <div className="group relative">
              <div 
                className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer flex items-center justify-center"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-center">
                  <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-1" />
                  <span className="text-xs text-gray-500 group-hover:text-blue-600">添加人脸</span>
                </div>
              </div>
            </div>

            {/* 现有图片 */}
            {images?.map((image) => (
              <div key={image.id} className="group relative">
                <div 
                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden border cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                  onClick={() => handleImageClick(image)}
                >
                  {image.image_id && previewUrls[image.image_id] && !errorImages.has(image.image_id) ? (
                    <img
                      src={previewUrls[image.image_id]}
                      alt="人脸图片"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      onError={() => {
                        setErrorImages(prev => new Set(prev).add(image.image_id!))
                      }}
                    />
                  ) : loadingImages.has(image.image_id!) ? (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Camera className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                </div>
                
                {/* 删除按钮 */}
                <button
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteImage(image.id, `ID: ${image.id.slice(-8)}`)
                  }}
                  disabled={deleteMutation.isPending}
                >
                  ×
                </button>
                
                {/* 图片信息悬浮层 */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-end">
                  <div className="p-2 text-white text-xs">
                    <div className="truncate">ID: {image.id.slice(-8)}</div>
                    <div className="truncate">状态: {image.status === '0' ? '启用' : '停用'}</div>
                    {image.image_id && (
                      <div className="truncate">附件: {image.image_id.slice(-8)}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 隐藏的文件输入 */}
      <Input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* 删除人脸图片确认对话框 */}
      <Dialog 
        open={deleteImageDialog.open} 
        onOpenChange={(open: boolean) => setDeleteImageDialog(prev => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除这张人脸图片吗？
              <br />
              文件：{deleteImageDialog.fileName}
              <br />
              此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteImageDialog({ open: false, imageId: '', fileName: '' })}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteImage}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// 可展开的表格行组件
function ExpandableTableRow({ 
  row, 
  columns 
}: { 
  row: any, 
  columns: ColumnDef<any, any>[] 
}) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const person = row.original as FacePerson

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <>
      {/* 主要数据行 */}
      <TableRow
        key={row.id}
        data-state={row.getIsSelected() && "selected"}
        className="group"
      >
        {/* 原有的数据列 */}
        {row.getVisibleCells().map((cell: any) => {
          // 如果是操作列，传递展开状态和切换函数
          if (cell.column.id === 'actions') {
            const cellContext = cell.getContext()
            // 为操作列添加额外的props
            const enhancedContext = {
              ...cellContext,
              isExpanded,
              onToggleExpand: handleToggleExpand
            }
            return (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, enhancedContext)}
              </TableCell>
            )
          }
          
          return (
            <TableCell key={cell.id}>
              {flexRender(
                cell.column.columnDef.cell,
                cell.getContext()
              )}
            </TableCell>
          )
        })}
      </TableRow>
      
      {/* 展开的人脸图片行 */}
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={columns.length} className="p-0 bg-gray-50/50 border-t">
            <FaceImagesDisplay person={person} />
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

export function DataTable<TData extends object, TValue>({
  columns,
  data,
  pageCount,
  pageIndex = 0,
  pageSize = 10,
  onPageChange,
  onSearch,
  onSortingChange,
  isLoading = false,
  columnLabels,
  minHeight = "650px",
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])

  // 处理排序变化
  React.useEffect(() => {
    if (onSortingChange) {
      onSortingChange(sorting);
    }
  }, [sorting, onSortingChange]);

  const table = useReactTable({
    data,
    columns,
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
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    // 启用手动模式，表示这些操作由外部控制
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    pageCount: pageCount,
  })

  // 当页面变化时调用外部传入的回调
  const currentPageIndex = table.getState().pagination.pageIndex;
  React.useEffect(() => {
    if (onPageChange && table.getState().pagination.pageIndex !== pageIndex) { 
      onPageChange(currentPageIndex + 1); // 转换为1-based索引传给外部
    }
  }, [currentPageIndex, onPageChange, pageIndex, table]);
  
  // 单独处理onPageChange的变化
  React.useEffect(() => {
    if (onPageChange) {
      setRowSelection({})
    }
  }, [onPageChange])

  // 生成骨架屏行
  const renderSkeletonRows = () => {
    return Array(pageSize)
      .fill(0)
      .map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          {columns.map((column, columnIndex) => (
            <TableCell key={`skeleton-cell-${columnIndex}`}>
              <Skeleton className="h-6 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))
  }

  // 生成空白填充行以保持表格高度
  const renderEmptyRows = () => {
    if (!data.length) return null;
    
    const filledRowCount = Math.min(data.length, pageSize);
    const emptyRowCount = pageSize - filledRowCount;
    
    if (emptyRowCount <= 0) return null;
    
    return Array(emptyRowCount)
      .fill(0)
      .map((_, index) => (
        <TableRow 
          key={`empty-${index}`} 
          className="h-[41px] border-0"
        >
          {columns.map((column, columnIndex) => (
            <TableCell 
              key={`empty-cell-${columnIndex}`}
              className="border-0"
            >
              &nbsp;
            </TableCell>
          ))}
        </TableRow>
      ));
  };

  // 判断是否有实际数据
  const hasRealData = !isLoading && table.getRowModel().rows?.length > 0;

  return (
    <div className="space-y-4">
      <DataTableToolbar 
        table={table} 
        onSearch={onSearch} 
        columnLabels={columnLabels}
      />
      <div className={`rounded-md ${hasRealData ? 'border' : 'border-t border-l border-r'}`}>
        <div style={{ height: minHeight, maxHeight: minHeight, overflowY: 'auto' }}>
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className={!hasRealData ? 'border-0' : undefined}>
              {isLoading ? (
                renderSkeletonRows()
              ) : table.getRowModel().rows?.length ? (
                <>
                  {table.getRowModel().rows.map((row) => (
                    <ExpandableTableRow
                      key={row.id}
                      row={row}
                      columns={columns}
                    />
                  ))}
                  {renderEmptyRows()}
                </>
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
      </div>
      <DataTablePagination 
        table={table} 
        onPageChange={onPageChange}
      />
    </div>
  )
} 