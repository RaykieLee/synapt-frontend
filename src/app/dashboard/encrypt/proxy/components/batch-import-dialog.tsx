"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/animate-ui/radix/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/animate-ui/base/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

import { proxyAPI } from "@/api/encrypt/proxy"
import { ProxyBatchImportDto, ProxyBatchImportResult } from "@/types/encrypt/proxy"

interface BatchImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BatchImportDialog({ open, onOpenChange }: BatchImportDialogProps) {
  const queryClient = useQueryClient()
  
  const [proxyText, setProxyText] = useState("")
  const [defaultGroup, setDefaultGroup] = useState("")
  const [autoCheck, setAutoCheck] = useState(false)
  const [importResult, setImportResult] = useState<ProxyBatchImportResult | null>(null)
  const [showResult, setShowResult] = useState(false)

  const importMutation = useMutation({
    mutationFn: (data: ProxyBatchImportDto) => proxyAPI.batchImport(data),
    onSuccess: (result) => {
      setImportResult(result)
      setShowResult(true)
      
      if (result.imported_count > 0) {
        toast.success(`导入成功 ${result.imported_count} 个代理`)
        queryClient.invalidateQueries({ queryKey: ["encrypt", "proxy", "list"] })
      }
      
      if (result.failed_count > 0) {
        toast.warning(`${result.failed_count} 个代理导入失败`)
      }
    },
    onError: (error: any) => {
      toast.error(`导入失败: ${error.message}`)
    },
  })

  const handleImport = () => {
    if (!proxyText.trim()) {
      toast.error("请输入代理信息")
      return
    }

    const data: ProxyBatchImportDto = {
      proxy_text: proxyText,
      default_group: defaultGroup || undefined,
      auto_check: autoCheck
    }

    importMutation.mutate(data)
  }

  const handleClose = () => {
    if (!importMutation.isPending) {
      setProxyText("")
      setDefaultGroup("")
      setAutoCheck(false)
      setImportResult(null)
      setShowResult(false)
      onOpenChange(false)
    }
  }

  const handleContinueImport = () => {
    setShowResult(false)
    setImportResult(null)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            批量导入代理
          </DialogTitle>
        </DialogHeader>

        {!showResult ? (
          <div className="space-y-6">
            {/* 格式说明 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  支持的代理格式
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div>• 基本格式: <code className="bg-muted px-1 rounded">192.168.0.1:8000</code></div>
                <div>• 带认证: <code className="bg-muted px-1 rounded">192.168.0.1:8000:用户名:密码</code></div>
                <div>• 指定类型: <code className="bg-muted px-1 rounded">SOCKS5://192.168.0.1:8000</code></div>
                <div>• 带分组: <code className="bg-muted px-1 rounded">192.168.0.1:8000{`{分组名}`}</code></div>
                <div>• IPv6支持: <code className="bg-muted px-1 rounded">HTTP://[2001:db8::1]:8000</code></div>
                <div className="text-xs mt-2">每行一个代理，支持混合格式</div>
              </CardContent>
            </Card>

            {/* 导入设置 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultGroup">默认分组</Label>
                <Input
                  id="defaultGroup"
                  placeholder="为没有指定分组的代理设置默认分组"
                  value={defaultGroup}
                  onChange={(e) => setDefaultGroup(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <Checkbox
                  id="autoCheck"
                  checked={autoCheck}
                  onCheckedChange={(checked) => setAutoCheck(!!checked)}
                />
                <Label htmlFor="autoCheck" className="text-sm">
                  导入后自动检测
                </Label>
              </div>
            </div>

            {/* 代理文本输入 */}
            <div className="space-y-2">
              <Label htmlFor="proxyText">代理列表</Label>
              <Textarea
                id="proxyText"
                placeholder={`请输入代理信息，每行一个，例如：
192.168.0.1:8000
SOCKS5://192.168.0.2:1080:username:password{高级代理}
HTTP://[2001:db8::1]:8000:user:pass`}
                value={proxyText}
                onChange={(e) => setProxyText(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
              <div className="text-xs text-muted-foreground">
                当前输入 {proxyText.split('\n').filter(line => line.trim()).length} 行
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={handleClose} disabled={importMutation.isPending}>
                取消
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={!proxyText.trim() || importMutation.isPending}
                className="min-w-[100px]"
              >
                {importMutation.isPending ? "导入中..." : "开始导入"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 导入结果汇总 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  {importResult && importResult.imported_count > 0 ? (
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="mr-2 h-5 w-5 text-orange-500" />
                  )}
                  导入结果
                </CardTitle>
                <CardDescription>
                  代理导入操作已完成
                </CardDescription>
              </CardHeader>
              <CardContent>
                {importResult && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{importResult.total_lines}</div>
                      <div className="text-sm text-muted-foreground">总行数</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">{importResult.parsed_count}</div>
                      <div className="text-sm text-muted-foreground">解析成功</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{importResult.imported_count}</div>
                      <div className="text-sm text-muted-foreground">导入成功</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{importResult.failed_count}</div>
                      <div className="text-sm text-muted-foreground">导入失败</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 错误详情 */}
            {importResult && importResult.error_details.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <AlertCircle className="mr-2 h-4 w-4 text-orange-500" />
                    错误详情
                    <Badge variant="secondary" className="ml-2">
                      {importResult.error_details.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {importResult.error_details.map((error, index) => (
                        <div key={index} className="text-sm p-2 bg-orange-50 rounded border-l-4 border-orange-200">
                          {error}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* 操作按钮 */}
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={handleContinueImport}>
                继续导入
              </Button>
              <Button onClick={handleClose}>
                完成
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 