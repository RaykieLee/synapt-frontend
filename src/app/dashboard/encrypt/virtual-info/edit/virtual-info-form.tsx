"use client"

import { UseFormReturn } from "react-hook-form"
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

interface VirtualInfoFormProps {
  form: UseFormReturn<any>
}

export function VirtualInfoForm({ form }: VirtualInfoFormProps) {
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

      {/* 联系信息 */}
      <TabsContent value="contact" className="space-y-6 mt-6">
        <div className="space-y-4">
          <div>
            <h4 className="text-md font-medium">联系信息</h4>
            <p className="text-sm text-muted-foreground">各种联系方式和社交账户</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>主邮箱</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入邮箱地址" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gmail邮箱</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入Gmail地址" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>电话号码</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入电话号码" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="x"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>X账号</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入X账号" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discord"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discord账号</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入Discord账号" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
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
                    <Input type="password" placeholder="请输入密码" {...field} />
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