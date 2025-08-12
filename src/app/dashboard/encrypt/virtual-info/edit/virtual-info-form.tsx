"use client"

import { UseFormReturn } from "react-hook-form"
import { useSearchParams } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { virtualAccountAPI } from "@/api/encrypt/virtual-account"
import { dictAPI } from "@/api/dict"
import type { DictOption } from "@/types/dict"
import type { VirtualAccount, VirtualAccountCreateDto, VirtualAccountUpdateDto } from "@/types/encrypt/virtual-account"
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useMemo, useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

type VirtualInfoFormProps = Readonly<{
  form: UseFormReturn<any>
}>

export function VirtualInfoForm({ form }: VirtualInfoFormProps) {
  const searchParams = useSearchParams()
  const editId = searchParams.get('id') || ''
  const isEdit = !!editId
  const qc = useQueryClient()
  const { data: accounts } = useQuery({
    queryKey: ["encrypt", "virtual-accounts", "list", editId],
    queryFn: () => virtualAccountAPI.getList({ params: { virtual_info_id: editId }, page_num: 1, page_size: 50 }),
    enabled: isEdit,
  })

  // 动态加载账户类型字典
  const { data: accountTypeOptions } = useQuery({
    queryKey: ["dict", "ACCOUNT_TYPE"],
    queryFn: () => dictAPI.getDictOptions("ACCOUNT_TYPE"),
  })

  // 账户创建/编辑对话框状态
  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<VirtualAccount | null>(null)

  const accountSchema = useMemo(() => z.object({
    account: z.string().min(1, "账号不能为空"),
    account_type: z.string().min(1, "请选择账户类型"),
    password: z.string().optional(),
    phone: z.string().optional(),
    primary_email: z.string().optional(),
    secondary_email: z.string().optional(),
    two_fa: z.string().optional(),
    status: z.string().optional(),
    remark: z.string().optional(),
  }), [])

  type AccountFormValues = z.infer<typeof accountSchema>
  const accountForm = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      account: "",
      account_type: "",
      password: "",
      phone: "",
      primary_email: "",
      secondary_email: "",
      two_fa: "",
      status: "0",
      remark: "",
    }
  })

  const openCreateAccount = () => {
    setEditingAccount(null)
    accountForm.reset()
    setAccountDialogOpen(true)
  }
  const openEditAccount = (acc: VirtualAccount) => {
    setEditingAccount(acc)
    accountForm.reset({
      account: acc.account || "",
      account_type: acc.account_type || "",
      password: acc.password || "",
      phone: acc.phone || "",
      primary_email: acc.primary_email || "",
      secondary_email: acc.secondary_email || "",
      two_fa: acc.two_fa || "",
      status: acc.status || "0",
      remark: acc.remark || "",
    })
    setAccountDialogOpen(true)
  }

  const createMutation = useMutation({
    mutationFn: async (values: AccountFormValues) => {
      if (!editId) throw new Error("缺少虚拟信息ID")
      const payload: VirtualAccountCreateDto = { ...values, virtual_info_id: editId }
      return virtualAccountAPI.create(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["encrypt", "virtual-accounts", "list", editId] })
      setAccountDialogOpen(false)
    }
  })
  const updateMutation = useMutation({
    mutationFn: async (values: AccountFormValues) => {
      if (!editingAccount?.id) throw new Error("缺少账户ID")
      const payload: VirtualAccountUpdateDto = { ...values, id: editingAccount.id }
      return virtualAccountAPI.update(editingAccount.id, payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["encrypt", "virtual-accounts", "list", editId] })
      setAccountDialogOpen(false)
    }
  })
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => virtualAccountAPI.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["encrypt", "virtual-accounts", "list", editId] })
  })

  const submitAccount = (values: AccountFormValues) => {
    if (editingAccount) updateMutation.mutate(values)
    else createMutation.mutate(values)
  }
  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="basic">基本信息</TabsTrigger>
        <TabsTrigger value="contact">联系信息</TabsTrigger>
        <TabsTrigger value="address">地址信息</TabsTrigger>
        <TabsTrigger value="account">账户信息</TabsTrigger>
        <TabsTrigger value="security">安全信息</TabsTrigger>
        <TabsTrigger value="other">其他设置</TabsTrigger>
      </TabsList>

      {/* 基本信息 */}
      <TabsContent value="basic" className="space-y-6 mt-6">
        <div className="space-y-4">
          <div>
            <h4 className="text-md font-medium">基本信息</h4>
            <p className="text-sm text-muted-foreground">虚拟身份的基础个人信息</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="first"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>名</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入名" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="last"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>姓</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入姓" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>性别</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="请选择性别" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">男</SelectItem>
                      <SelectItem value="female">女</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>国籍</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入国籍代码" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </TabsContent>

      {/* 联系信息：改为展示关联账户的表格（账号/类型/邮箱/电话/2FA 等） */}
      <TabsContent value="contact" className="space-y-6 mt-6">
        <div className="space-y-4">
          <div>
            <h4 className="text-md font-medium">联系信息</h4>
            <p className="text-sm text-muted-foreground">展示所有与该虚拟信息关联的账户</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">管理与该虚拟信息关联的账户。</p>
              <Button size="sm" onClick={openCreateAccount} disabled={!isEdit}>新增账户</Button>
            </div>
            <div className="rounded-md border overflow-hidden">
              <div className="grid grid-cols-7 gap-2 px-4 py-2 text-sm font-medium bg-muted/50">
                <div>账户</div>
                <div>类型</div>
                <div>主邮箱</div>
                <div>辅助邮箱</div>
                <div>电话</div>
                <div>2FA</div>
                <div className="text-right">操作</div>
              </div>
              {(!isEdit || !accounts || accounts.list.length === 0) ? (
                <div className="p-4 text-sm text-muted-foreground">{isEdit ? '暂无关联账户' : '保存后可为该虚拟信息添加关联账户'}</div>
              ) : (
                <div className="divide-y">
                  {accounts.list.map(acc => (
                    <div key={acc.id} className="grid grid-cols-7 gap-2 px-4 py-2 text-sm items-center">
                      <div className="truncate" title={acc.account}>{acc.account}</div>
                      <div>{(accountTypeOptions || []).find(o => o.value === acc.account_type)?.label || acc.account_type}</div>
                      <div className="truncate" title={acc.primary_email || ''}>{acc.primary_email || '-'}</div>
                      <div className="truncate" title={acc.secondary_email || ''}>{acc.secondary_email || '-'}</div>
                      <div>{acc.phone || '-'}</div>
                      <div className="truncate" title={acc.two_fa || ''}>{acc.two_fa ? '已设置' : '-'}</div>
                      <div className="text-right space-x-2">
                        <Button size="sm" variant="outline" onClick={() => openEditAccount(acc)}>编辑</Button>
                        <Button size="sm" variant="destructive" onClick={() => { if (confirm('确认删除该账户？')) deleteMutation.mutate(acc.id) }}>删除</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* 账户编辑对话框 */}
        <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAccount ? '编辑账户' : '新增账户'}</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={accountForm.handleSubmit(submitAccount)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <FormField control={accountForm.control} name="account" render={({ field }) => (
                <FormItem>
                  <FormLabel>账号</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入账号" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={accountForm.control} name="account_type" render={({ field }) => (
                <FormItem>
                  <FormLabel>账户类型</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="请选择账户类型" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(accountTypeOptions || []).map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={accountForm.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>密码</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="可选" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={accountForm.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>电话</FormLabel>
                  <FormControl>
                    <Input placeholder="可选" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={accountForm.control} name="primary_email" render={({ field }) => (
                <FormItem>
                  <FormLabel>主邮箱</FormLabel>
                  <FormControl>
                    <Input placeholder="可选" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={accountForm.control} name="secondary_email" render={({ field }) => (
                <FormItem>
                  <FormLabel>辅助邮箱</FormLabel>
                  <FormControl>
                    <Input placeholder="可选" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={accountForm.control} name="two_fa" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>2FA 信息</FormLabel>
                  <FormControl>
                    <Textarea placeholder="密钥/备份码/备注（可选）" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={accountForm.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>状态</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="请选择状态" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">启用</SelectItem>
                      <SelectItem value="1">停用</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={accountForm.control} name="remark" render={({ field }) => (
                <FormItem>
                  <FormLabel>备注</FormLabel>
                  <FormControl>
                    <Input placeholder="可选" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="md:col-span-2" />
              <DialogFooter className="md:col-span-2">
                <Button type="button" variant="outline" onClick={() => setAccountDialogOpen(false)}>取消</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingAccount ? '保存' : '创建'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </TabsContent>

      {/* 地址信息 */}
      <TabsContent value="address" className="space-y-6 mt-6">
        <div className="space-y-4">
          <div>
            <h4 className="text-md font-medium">地址信息</h4>
            <p className="text-sm text-muted-foreground">详细的地址和位置信息</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="street_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>街道号码</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入街道号码" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="street_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>街道名称</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入街道名称" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>城市</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入城市" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>州/省</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入州或省" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>国家</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入国家" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邮编</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入邮编" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coordinates_latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>纬度</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入纬度" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coordinates_longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>经度</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入经度" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </TabsContent>

      {/* 账户信息 */}
      <TabsContent value="account" className="space-y-6 mt-6">
        <div className="space-y-4">
          <div>
            <h4 className="text-md font-medium">账户信息</h4>
            <p className="text-sm text-muted-foreground">用户账户和身份相关信息</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>用户名</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入用户名" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>密码</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input type={form.watch('show_password') ? 'text' : 'password'} placeholder="请输入密码" {...field} />
                      <label className="flex items-center gap-1 text-sm text-muted-foreground">
                        <input type="checkbox" onChange={(e) => form.setValue('show_password', e.target.checked)} /> 显示
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ssn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>社会保障号</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入社会保障号" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="picture"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>头像URL</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入头像链接" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </TabsContent>

      {/* 安全信息 */}
      <TabsContent value="security" className="space-y-6 mt-6">
        <div className="space-y-4">
          <div>
            <h4 className="text-md font-medium">安全信息</h4>
            <p className="text-sm text-muted-foreground">安全相关的敏感信息</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="seed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>种子</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入种子" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="wallet_word"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>钱包助记词</FormLabel>
                  <FormControl>
                    <Textarea placeholder="请输入钱包助记词" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </TabsContent>

      {/* 其他设置 */}
      <TabsContent value="other" className="space-y-6 mt-6">
        <div className="space-y-4">
          <div>
            <h4 className="text-md font-medium">其他设置</h4>
            <p className="text-sm text-muted-foreground">状态和备注信息</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>状态</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="请选择状态" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">启用</SelectItem>
                      <SelectItem value="1">停用</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Textarea placeholder="请输入备注" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
} 