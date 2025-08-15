"use client"

import { useState, useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/animate-ui/radix/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Wand2, CheckCircle, XCircle, AlertCircle } from "lucide-react"

import { virtualInfoAPI } from "@/api/encrypt"
import { proxyAPI } from "@/api/encrypt"
import type {
  VirtualInfoGenerateRequest,
  VirtualInfoBatchGenerateResult,
  ProxyEntity
} from "@/types/encrypt"

interface GenerateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GenerateDialog({ open, onOpenChange }: GenerateDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // 表单状态
  const [formData, setFormData] = useState<VirtualInfoGenerateRequest>({
    count: 5,
    nationality: "US",
    gender: undefined,
    use_proxy: false,
    proxy_id: undefined,
    generate_wallet: true,
    wallet_strength: 256
  })

  // 结果状态
  const [result, setResult] = useState<VirtualInfoBatchGenerateResult | null>(null)
  const [showResult, setShowResult] = useState(false)

  // 获取支持的国籍列表
  const { data: nationalitiesData } = useQuery({
    queryKey: ["virtual-info", "nationalities"],
    queryFn: () => virtualInfoAPI.getSupportedNationalities(),
    staleTime: 10 * 60 * 1000, // 10分钟缓存
  })

  // 获取代理列表（用于代理选择）
  const { data: proxiesData } = useQuery({
    queryKey: ["encrypt", "proxy", "list", { page_num: 1, page_size: 100, params: { status: "0" } }],
    queryFn: () => proxyAPI.getList({ 
      page_num: 1, 
      page_size: 100, 
      params: { status: "0" }
    }),
    enabled: formData.use_proxy,
    staleTime: 5 * 60 * 1000,
  })

  const availableProxies = proxiesData?.list || []

  // 生成虚拟信息
  const generateMutation = useMutation({
    mutationFn: (request: VirtualInfoGenerateRequest) => virtualInfoAPI.generate(request),
    onSuccess: (data) => {
      setResult(data)
      setShowResult(true)
      toast({
        title: "生成完成",
        description: `成功生成 ${data.success_count} 个虚拟信息，失败 ${data.failed_count} 个`,
      })
      // 刷新虚拟信息列表
      queryClient.invalidateQueries({ queryKey: ["encrypt", "virtual-info", "list"] })
    },
    onError: (error: any) => {
      toast({
        title: "生成失败",
        description: error.message || "未知错误",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 验证表单
    if (formData.count < 1 || formData.count > 50) {
      toast({
        title: "验证失败",
        description: "生成数量必须在1-50之间",
        variant: "destructive",
      })
      return
    }

    if (formData.use_proxy && !formData.proxy_id) {
      toast({
        title: "验证失败", 
        description: "使用代理时必须选择一个代理",
        variant: "destructive",
      })
      return
    }

    generateMutation.mutate(formData)
  }

  const handleReset = () => {
    setFormData({
      count: 5,
      nationality: "US", 
      gender: undefined,
      use_proxy: false,
      proxy_id: undefined,
      generate_wallet: true,
      wallet_strength: 256
    })
    setResult(null)
    setShowResult(false)
  }

  const handleClose = () => {
    if (!generateMutation.isPending) {
      handleReset()
      onOpenChange(false)
    }
  }

  const nationalityOptions = nationalitiesData?.codes || []

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            生成虚拟信息
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(80vh-8rem)] px-1">
          {!showResult ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 基本设置 */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">基本设置</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="count">生成数量</Label>
                    <Input
                      id="count"
                      type="number"
                      min="1"
                      max="50"
                      value={formData.count}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        count: parseInt(e.target.value) || 1 
                      }))}
                      disabled={generateMutation.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationality">国籍</Label>
                    <Select
                      value={formData.nationality}
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        nationality: value 
                      }))}
                      disabled={generateMutation.isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择国籍" />
                      </SelectTrigger>
                      <SelectContent>
                        {nationalityOptions.map((code) => (
                          <SelectItem key={code} value={code}>
                            {code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">性别（可选）</Label>
                  <Select
                    value={formData.gender || "auto"}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      gender: value === "auto" ? undefined : value as "male" | "female"
                    }))}
                    disabled={generateMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择性别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">自动</SelectItem>
                      <SelectItem value="male">男性</SelectItem>
                      <SelectItem value="female">女性</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* 代理设置 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">代理设置</h3>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="use_proxy" className="text-sm">使用代理获取位置</Label>
                    <Switch
                      id="use_proxy"
                      checked={formData.use_proxy}
                      onCheckedChange={(checked) => setFormData(prev => ({ 
                        ...prev, 
                        use_proxy: checked,
                        proxy_id: checked ? prev.proxy_id : undefined
                      }))}
                      disabled={generateMutation.isPending}
                    />
                  </div>
                </div>

                {formData.use_proxy && (
                  <div className="space-y-2">
                    <Label htmlFor="proxy">选择代理</Label>
                    <Select
                      value={formData.proxy_id || ""}
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        proxy_id: value || undefined 
                      }))}
                      disabled={generateMutation.isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择代理服务器" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProxies.map((proxy: ProxyEntity) => (
                          <SelectItem key={proxy.id} value={proxy.id}>
                            {proxy.host}:{proxy.port} ({proxy.proxy_type})
                            {proxy.group && ` - ${proxy.group}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.use_proxy && availableProxies.length === 0 && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          没有可用的代理，请先添加代理服务器
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              {/* 钱包设置 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">钱包设置</h3>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="generate_wallet" className="text-sm">生成钱包助记词</Label>
                    <Switch
                      id="generate_wallet"
                      checked={formData.generate_wallet}
                      onCheckedChange={(checked) => setFormData(prev => ({ 
                        ...prev, 
                        generate_wallet: checked 
                      }))}
                      disabled={generateMutation.isPending}
                    />
                  </div>
                </div>

                {formData.generate_wallet && (
                  <div className="space-y-2">
                    <Label htmlFor="wallet_strength">助记词强度</Label>
                    <Select
                      value={formData.wallet_strength.toString()}
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        wallet_strength: parseInt(value) as 128 | 256 
                      }))}
                      disabled={generateMutation.isPending}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="128">128位 (12个单词)</SelectItem>
                        <SelectItem value="256">256位 (24个单词)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                  disabled={generateMutation.isPending}
                >
                  取消
                </Button>
                <Button 
                  type="submit" 
                  disabled={generateMutation.isPending}
                  className="min-w-[100px]"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      开始生成
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            /* 生成结果 */
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-4">生成结果</h3>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{result?.success_count || 0}</div>
                    <div className="text-sm text-muted-foreground">成功</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{result?.failed_count || 0}</div>
                    <div className="text-sm text-muted-foreground">失败</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{result?.total_count || 0}</div>
                    <div className="text-sm text-muted-foreground">总计</div>
                  </div>
                </div>

                {result && result.total_count > 0 && (
                  <Progress 
                    value={(result.success_count / result.total_count) * 100} 
                    className="mb-4"
                  />
                )}
              </div>

              {result && result.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    错误详情 ({result.errors.length})
                  </h4>
                  <div className="max-h-32 overflow-y-auto">
                    {result.errors.map((error, index) => (
                      <Alert key={index} variant="destructive" className="mb-2">
                        <AlertDescription className="text-xs">{error}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                >
                  重新生成
                </Button>
                <Button onClick={handleClose}>
                  完成
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 