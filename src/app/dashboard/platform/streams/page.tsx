'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { streamAPI } from '@/api/stream';
import { Stream, StreamStatus, StreamUpdateDto } from '@/types/stream';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Pagination } from '@/components/ui/pagination';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Plus, 
  Pencil, 
  Trash2, 
  Search,
  CheckSquare,
  Square,
  AlertCircle
} from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 表单验证Schema
const streamFormSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  rtsp_url: z.string().min(1, "RTSP地址不能为空").url("请输入有效的URL"),
  description: z.string().optional(),
});

type StreamFormValues = z.infer<typeof streamFormSchema>;

export default function StreamsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchName, setSearchName] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<StreamStatus | ''>('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentStream, setCurrentStream] = useState<Stream | null>(null);
  const [selectedStreams, setSelectedStreams] = useState<number[]>([]);
  const form = useForm<StreamFormValues>({
    resolver: zodResolver(streamFormSchema),
    defaultValues: {
      name: "",
      rtsp_url: "",
      description: "",
    },
  });

  const editForm = useForm<StreamFormValues>({
    resolver: zodResolver(streamFormSchema),
    defaultValues: {
      name: "",
      rtsp_url: "",
      description: "",
    },
  });

  // 获取视频流列表
  const { data: streamResponse, isLoading } = useQuery({
    queryKey: ['streams', page, pageSize, searchName, selectedStatus],
    queryFn: () => streamAPI.getList({
      name: searchName || undefined,
      status: selectedStatus || undefined,
      page,
      page_size: pageSize,
    }),
  });

  const streams = streamResponse?.data || [];
  const total = streamResponse?.total || 0;

  // 创建视频流
  const createMutation = useMutation({
    mutationFn: streamAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streams'] });
      setShowCreateDialog(false);
      form.reset();
      toast({
        title: '创建成功',
        description: '视频流已成功创建',
      });
    },
  });

  // 更新视频流
  const updateMutation = useMutation({
    mutationFn: ({ streamId, data }: { streamId: number; data: StreamFormValues }) =>
      streamAPI.update(streamId, { ...data, stream_id: streamId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streams'] });
      setShowEditDialog(false);
      setCurrentStream(null);
      toast({
        title: '更新成功',
        description: '视频流信息已更新',
      });
    },
  });

  // 删除视频流
  const deleteMutation = useMutation({
    mutationFn: streamAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streams'] });
      setShowDeleteDialog(false);
      toast({
        title: '删除成功',
        description: '视频流已删除',
      });
    },
  });

  // 批量删除视频流
  const batchDeleteMutation = useMutation({
    mutationFn: streamAPI.batchDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streams'] });
      setSelectedStreams([]);
      toast({
        title: '批量删除成功',
        description: '所选视频流已删除',
      });
    },
  });

  // 启动视频流
  const startMutation = useMutation({
    mutationFn: streamAPI.start,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streams'] });
      toast({
        title: '启动成功',
        description: '视频流已启动',
      });
    },
  });

  // 停止视频流
  const stopMutation = useMutation({
    mutationFn: streamAPI.stop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streams'] });
      toast({
        title: '停止成功',
        description: '视频流已停止',
      });
    },
  });

  // 重启视频流
  const restartMutation = useMutation({
    mutationFn: streamAPI.restart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streams'] });
      toast({
        title: '重启成功',
        description: '视频流已重启',
      });
    },
  });

  // 处理搜索
  const handleSearch = () => {
    setPage(1);
  };

  // 处理状态筛选
  const handleStatusFilter = (status: StreamStatus | '') => {
    setSelectedStatus(status);
    setPage(1);
  };

  // 处理选择
  const handleSelect = (streamId: number) => {
    setSelectedStreams(prev =>
      prev.includes(streamId)
        ? prev.filter(id => id !== streamId)
        : [...prev, streamId]
    );
  };

  // 处理全选
  const handleSelectAll = () => {
    if (streams.length > 0) {
      setSelectedStreams(prev =>
        prev.length === streams.length
          ? []
          : streams.map(stream => stream.stream_id)
      );
    }
  };

  // 打开编辑对话框
  const openEditDialog = (stream: Stream) => {
    setCurrentStream(stream);
    setShowEditDialog(true);
  };

  // 打开删除对话框
  const openDeleteDialog = (stream: Stream) => {
    setCurrentStream(stream);
    setShowDeleteDialog(true);
  };

  // 获取状态标签样式
  const getStatusStyle = (status: StreamStatus) => {
    switch (status) {
      case StreamStatus.Online:
        return 'bg-green-100 text-green-800';
      case StreamStatus.Offline:
        return 'bg-gray-100 text-gray-800';
      case StreamStatus.Error:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取状态文本
  const getStatusText = (status: StreamStatus) => {
    switch (status) {
      case StreamStatus.Online:
        return '在线';
      case StreamStatus.Offline:
        return '离线';
      case StreamStatus.Error:
        return '错误';
      default:
        return '未知';
    }
  };

  // 创建视频流
  const onSubmit = async (data: StreamFormValues) => {
    try {
      await streamAPI.create(data);
      toast({
        title: "创建成功",
        description: "视频流创建成功",
      });
      setShowCreateDialog(false);
      form.reset();
      handleSearch();
    } catch (error: any) {
      toast({
        title: "创建失败",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // 更新视频流
  const handleEdit = async (data: StreamFormValues) => {
    if (!currentStream) return;
    try {
      const updateData: StreamUpdateDto = {
        stream_id: currentStream.stream_id,
        ...data,
      };
      await streamAPI.update(currentStream.stream_id, updateData);
      toast({
        title: "更新成功",
        description: "视频流更新成功",
      });
      setShowEditDialog(false);
      editForm.reset();
      handleSearch();
    } catch (error: any) {
      toast({
        title: "更新失败",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // 删除视频流
  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该视频流吗？')) return;
    try {
      await streamAPI.delete(id);
      toast({
        title: '删除成功',
        description: '视频流删除成功'
      });
      handleSearch();
    } catch (error: any) {
      toast({
        title: '删除失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // 获取状态显示
  const getStatusBadge = (status: StreamStatus) => {
    switch (status) {
      case StreamStatus.Online:
        return <Badge variant="default" className="bg-green-500">在线</Badge>;
      case StreamStatus.Offline:
        return <Badge variant="secondary" className="bg-gray-500">离线</Badge>;
      case StreamStatus.Error:
        return <Badge variant="destructive">错误</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  useEffect(() => {
    if (currentStream && showEditDialog) {
      editForm.reset({
        name: currentStream.name,
        rtsp_url: currentStream.rtsp_url,
        description: currentStream.description || "",
      });
    }
  }, [currentStream, showEditDialog]);

  return (
    <div className="container mx-auto py-8">
      {/* 工具栏 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            placeholder="搜索视频流名称"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-64"
          />
          <Button onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" />
            搜索
          </Button>
          <Select
            value={selectedStatus}
            onValueChange={(value) => handleStatusFilter(value as StreamStatus)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部状态</SelectItem>
              <SelectItem value={StreamStatus.Online}>在线</SelectItem>
              <SelectItem value={StreamStatus.Offline}>离线</SelectItem>
              <SelectItem value={StreamStatus.Error}>错误</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-4">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新建视频流
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新建视频流</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>名称</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rtsp_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RTSP地址</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>描述</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateDialog(false);
                        form.reset();
                      }}
                    >
                      取消
                    </Button>
                    <Button type="submit">创建</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          {selectedStreams.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => batchDeleteMutation.mutate(selectedStreams)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              批量删除
            </Button>
          )}
        </div>
      </div>

      {/* 视频流列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {streams.map((stream: Stream) => (
          <Card key={stream.stream_id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedStreams.includes(stream.stream_id)}
                  onCheckedChange={() => handleSelect(stream.stream_id)}
                />
                <div>
                  <h3 className="text-lg font-semibold">{stream.name}</h3>
                  <p className="text-sm text-muted-foreground">{stream.rtsp_url}</p>
                </div>
              </div>
              <span className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                getStatusStyle(stream.status)
              )}>
                {getStatusBadge(stream.status)}
              </span>
            </div>
            
            {stream.description && (
              <p className="text-sm text-muted-foreground mb-4">{stream.description}</p>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {stream.resolution && <span className="mr-4">分辨率: {stream.resolution}</span>}
                {stream.fps && <span>帧率: {stream.fps}fps</span>}
              </div>
              <div className="flex items-center gap-2">
                {stream.status === StreamStatus.Offline && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startMutation.mutate(stream.stream_id)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}
                {stream.status === StreamStatus.Online && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => stopMutation.mutate(stream.stream_id)}
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => restartMutation.mutate(stream.stream_id)}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const streamData: Stream = {
                      stream_id: stream.stream_id,
                      name: stream.name,
                      rtsp_url: stream.rtsp_url,
                      description: stream.description || '',
                      status: stream.status,
                      create_time: stream.create_time,
                      update_time: stream.update_time,
                      hls_url: stream.hls_url || '',
                      fps: stream.fps || 0,
                      resolution: stream.resolution || ''
                    }
                    setCurrentStream(streamData)
                    setShowEditDialog(true)
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={() => openDeleteDialog(stream)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 分页 */}
      {streamResponse && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            共 {total} 条记录
          </div>
          <Pagination
            currentPage={page}
            pageSize={pageSize}
            total={total}
            onChange={setPage}
          />
        </div>
      )}

      {/* 编辑对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑视频流</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
            <FormField
              control={editForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>名称</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={editForm.control}
              name="rtsp_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RTSP URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={editForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                取消
              </Button>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除视频流</DialogTitle>
            <DialogDescription>
              确定要删除该视频流吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => currentStream && handleDelete(currentStream.stream_id)}
            >
              确定删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 