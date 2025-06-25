"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/animate-ui/radix/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { FaceImage, FaceImageCreateDto, FaceImageUpdateDto } from "@/types/face"
import { faceImageAPI, facePersonAPI, faceLibraryAPI } from "@/api/face"

const formSchema = z.object({
  person_id: z.number({ required_error: "请选择人员" }),
  library_id: z.number({ required_error: "请选择人脸库" }),
  image_id: z.string().optional(),
  face_feature: z.string().optional(),
  status: z.string().min(1, "请选择状态"),
  remark: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface CreateEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  faceImage?: FaceImage
  mode: "create" | "edit"
  defaultPersonId?: number
  defaultLibraryId?: number
}

export function CreateEditDialog({
  open,
  onOpenChange,
  faceImage,
  mode,
  defaultPersonId,
  defaultLibraryId,
}: CreateEditDialogProps) {
  const queryClient = useQueryClient()
  const [selectedLibraryId, setSelectedLibraryId] = useState<number | undefined>(
    faceImage?.library_id || defaultLibraryId
  )

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      person_id: faceImage?.person_id || defaultPersonId || 0,
      library_id: faceImage?.library_id || defaultLibraryId || 0,
      image_id: faceImage?.image_id || "",
      face_feature: faceImage?.face_feature || "",
      status: faceImage?.status || "enabled",
      remark: faceImage?.remark || "",
    },
  })

  // 获取人脸库列表
  const { data: librariesData } = useQuery({
    queryKey: ["face-libraries", "all"],
    queryFn: () => faceLibraryAPI.getAll(),
    staleTime: 5 * 60 * 1000,
  })

  // 获取人员列表（基于选中的人脸库）
  const { data: personsData } = useQuery({
    queryKey: ["face-persons", "all", selectedLibraryId],
    queryFn: () => facePersonAPI.getAll(selectedLibraryId),
    enabled: !!selectedLibraryId,
    staleTime: 5 * 60 * 1000,
  })

  // 创建人脸图片
  const createMutation = useMutation({
    mutationFn: (data: FaceImageCreateDto) => faceImageAPI.create(data),
    onSuccess: () => {
      toast.success("人脸图片创建成功")
      queryClient.invalidateQueries({ queryKey: ["face-images"] })
      queryClient.invalidateQueries({ queryKey: ["face-persons"] })
      queryClient.invalidateQueries({ queryKey: ["face-libraries"] })
      onOpenChange(false)
      form.reset()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.msg || "创建失败")
    },
  })

  // 更新人脸图片
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FaceImageUpdateDto }) =>
      faceImageAPI.update(id, data),
    onSuccess: () => {
      toast.success("人脸图片更新成功")
      queryClient.invalidateQueries({ queryKey: ["face-images"] })
      queryClient.invalidateQueries({ queryKey: ["face-persons"] })
      queryClient.invalidateQueries({ queryKey: ["face-libraries"] })
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.msg || "更新失败")
    },
  })

  const onSubmit = (data: FormData) => {
    if (mode === "create") {
      createMutation.mutate(data as FaceImageCreateDto)
    } else if (faceImage) {
      updateMutation.mutate({
        id: faceImage.id,
        data: data as FaceImageUpdateDto,
      })
    }
  }

  // 监听人脸库变化，重置人员选择
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "library_id" && value.library_id !== selectedLibraryId) {
        setSelectedLibraryId(value.library_id)
        form.setValue("person_id", 0)
      }
    })
    return () => subscription.unsubscribe()
  }, [form, selectedLibraryId])

  const libraries = librariesData?.data || []
  const persons = personsData?.data || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "新增人脸图片" : "编辑人脸图片"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="library_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>人脸库 *</FormLabel>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(Number(value))}
                      disabled={mode === "edit"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择人脸库" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {libraries.map((library) => (
                          <SelectItem
                            key={library.id}
                            value={library.id.toString()}
                          >
                            {library.library_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="person_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>人员 *</FormLabel>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(Number(value))}
                      disabled={!selectedLibraryId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择人员" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {persons.map((person) => (
                          <SelectItem
                            key={person.id}
                            value={person.id.toString()}
                          >
                            {person.person_name} ({person.person_face_id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="image_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>图片ID</FormLabel>
                    <FormControl>
                      <Input placeholder="输入图片ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>状态 *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择状态" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="enabled">启用</SelectItem>
                        <SelectItem value="disabled">禁用</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="face_feature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>人脸特征值</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="输入人脸特征值（可选）"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>备注</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="输入备注信息（可选）"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "处理中..."
                  : mode === "create"
                  ? "创建"
                  : "更新"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 