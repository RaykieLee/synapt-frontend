"use client"

import { Row } from "@tanstack/react-table"
import { Edit, Trash, ChevronDown, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FacePerson } from "@/types/face"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/animate-ui/radix/dialog'
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { facePersonAPI } from "@/api"
import { toast } from "sonner"
import { CreateEditDialog } from "./create-edit-dialog"
import { userApi } from '@/api/user'
import { Input } from '@/components/ui/input'

function BindUserDialog({ open, onOpenChange, person }: { readonly open: boolean; readonly onOpenChange: (v: boolean)=>void; readonly person: FacePerson }) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const { data: bound, refetch: refetchBound } = useQuery({
    queryKey: ['face-person-bound-user', person.id],
    queryFn: () => facePersonAPI.getBoundUser(person.id),
    enabled: open
  })
  const { data: usersResp, refetch: refetchUsers, isFetching } = useQuery({
    queryKey: ['user-search-for-bind', search],
    queryFn: async () => {
      const keywords = search ? { user_name: search } : {}
      return userApi.getList({ page_num: 1, page_size: 10, params: { keywords }})
    },
    enabled: open
  })
  const bindMutation = useMutation({
    mutationFn: (user_id: number) => facePersonAPI.bindUser(person.id, user_id),
    onSuccess: () => {
      toast.success('绑定成功')
      refetchBound()
      queryClient.invalidateQueries({ queryKey: ['face', 'person'] })
    }
  })
  const unbindMutation = useMutation({
    mutationFn: () => facePersonAPI.unbindUser(person.id),
    onSuccess: () => {
      toast.success('解绑成功')
      refetchBound()
      queryClient.invalidateQueries({ queryKey: ['face', 'person'] })
    }
  })
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>关联用户 - {person.person_name}</DialogTitle>
          <DialogDescription>为该人员选择一个系统用户进行关联</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">
              当前绑定：
              {bound ? (
                <span>
                  {bound.user_name || ''} {bound.nick_name ? `(${bound.nick_name})` : ''}
                </span>
              ) : '未绑定'}
            </p>
            {bound?.data && (
              <Button variant="outline" size="sm" className="mt-2" onClick={()=>unbindMutation.mutate()} disabled={unbindMutation.isPending}>解除绑定</Button>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <Input placeholder="搜索用户名/昵称" value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setSearch(e.target.value)} />
            <Button variant="secondary" onClick={()=>refetchUsers()} disabled={!search || isFetching}>搜索</Button>
          </div>
          <div className="max-h-64 overflow-auto border rounded p-2 space-y-1 text-sm">
            {usersResp?.rows?.map((u: any) => (
              <div key={u.user_id} className={`flex items-center justify-between gap-2 p-1 rounded hover:bg-accent ${selectedUserId===u.user_id?'bg-accent':''}`}> 
                <div>
                  <div className="font-medium">{u.user_name}</div>
                  <div className="text-xs text-muted-foreground">{u.nick_name}</div>
                </div>
                <Button size="sm" onClick={()=>{setSelectedUserId(u.user_id)}}>选择</Button>
              </div>
            ))}
            {usersResp?.rows?.length===0 && <div className="text-center py-4 text-muted-foreground">无结果</div>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={()=>onOpenChange(false)}>关闭</Button>
          <Button disabled={!selectedUserId || bindMutation.isPending} onClick={()=> selectedUserId && bindMutation.mutate(selectedUserId)}>保存绑定</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  isExpanded?: boolean
  onToggleExpand?: () => void
}

export function DataTableRowActions<TData>({
  row,
  isExpanded = false,
  onToggleExpand,
}: Readonly<DataTableRowActionsProps<TData>>) {
  const queryClient = useQueryClient()
  const person = row.original as FacePerson
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openBindDialog, setOpenBindDialog] = useState(false)

  // 删除人员
  const deleteMutation = useMutation({
    mutationFn: (id: string) => facePersonAPI.delete(id),
    onSuccess: () => {
      toast.success("删除成功")
      queryClient.invalidateQueries({ queryKey: ["face", "person"] })
      setOpenDeleteDialog(false)
    },
    onError: (error) => {
      toast.error(`删除失败: ${error}`)
    },
  })

  const confirmDelete = () => {
    deleteMutation.mutate(person.id)
  }

  return (
    <>
      <div className="flex items-center gap-1">


        {/* 编辑按钮 */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setOpenEditDialog(true)}
          title="编辑人员"
        >
          <Edit className="h-4 w-4" />
        </Button>

        {/* 删除按钮 */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-red-600 hover:text-red-600 hover:bg-red-50"
          onClick={() => setOpenDeleteDialog(true)}
          title="删除人员"
        >
          <Trash className="h-4 w-4" />
        </Button>
        {/* 关联用户按钮 */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setOpenBindDialog(true)}
          title="关联用户"
        >
          U
        </Button>
                {/* 展开/折叠按钮 */}
                <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onToggleExpand}
          title={isExpanded ? "折叠人脸图片" : "展开人脸图片"}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* 删除确认对话框 */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除人员"{person.person_name}"吗？此操作将同时删除该人员的所有人脸图片数据，此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDeleteDialog(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑人员弹窗 */}
      <CreateEditDialog
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
        personId={person.id}
        defaultLibraryId={person.library_id}
      />
  <BindUserDialog open={openBindDialog} onOpenChange={setOpenBindDialog} person={person} />
    </>
  )
} 