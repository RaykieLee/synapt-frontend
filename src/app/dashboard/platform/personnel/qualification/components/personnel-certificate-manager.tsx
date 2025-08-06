"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/radix/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/animate-ui/base/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PersonnelQualification, Certificate } from "@/types/personnel"
import { certificateAPI } from "@/api/personnel"
import { Award, Plus, Minus, Search } from "lucide-react"

interface PersonnelCertificateManagerProps {
  personnel: PersonnelQualification
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PersonnelCertificateManager({
  personnel,
  open,
  onOpenChange,
}: PersonnelCertificateManagerProps) {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCertificates, setSelectedCertificates] = useState<number[]>([])
  const [obtainDate, setObtainDate] = useState("")
  const [remark, setRemark] = useState("")

  // 获取所有可用证书
  const { data: certificatesResponse, isLoading: certificatesLoading } = useQuery({
    queryKey: ["personnel", "certificate", "list", "all"],
    queryFn: () => certificateAPI.getList({
      page_num: 1,
      page_size: 1000, // 获取所有证书
      params: {
        status: "0" // 只获取启用的证书
      }
    }),
    enabled: open,
  })

  const allCertificates = certificatesResponse?.list || [];

  // 当前人员已有的证书ID列表
  const currentCertificateIds = personnel.certificates?.map(cert => cert.id) || []

  // 过滤可分配的证书（排除已有的）
  const availableCertificates = allCertificates.filter(cert =>
    !currentCertificateIds.includes(cert.id) &&
    (searchTerm === "" ||
     cert.certificate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     cert.certificate_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
     cert.certificate_level.toString().includes(searchTerm.toLowerCase())
    )
  )

  // 分配证书
  const assignMutation = useMutation({
    mutationFn: certificateAPI.assignCertificates,
    onSuccess: () => {
      toast.success("证书分配成功")
      queryClient.invalidateQueries({ queryKey: ["personnel", "qualification", "list"] })
      queryClient.invalidateQueries({ queryKey: ["personnel", "qualification", "detail"] })
      setSelectedCertificates([])
      setObtainDate("")
      setRemark("")
      onOpenChange(false)
    },
    onError: () => {
      toast.error("证书分配失败")
    },
  })

  // 移除证书
  const removeMutation = useMutation({
    mutationFn: certificateAPI.removeCertificates,
    onSuccess: () => {
      toast.success("证书移除成功")
      queryClient.invalidateQueries({ queryKey: ["personnel", "qualification", "list"] })
      queryClient.invalidateQueries({ queryKey: ["personnel", "qualification", "detail"] })
    },
    onError: () => {
      toast.error("证书移除失败")
    },
  })

  const handleAssignCertificates = () => {
    if (selectedCertificates.length === 0) {
      toast.error("请选择要分配的证书")
      return
    }

    assignMutation.mutate({
      personnel_id: personnel.id,
      certificate_ids: selectedCertificates,
      obtain_date: obtainDate || undefined,
      remark: remark || undefined,
    })
  }

  const handleRemoveCertificate = (certificateId: number) => {
    removeMutation.mutate({
      personnel_id: personnel.id,
      certificate_ids: [certificateId],
    })
  }

  const handleCertificateSelect = (certificateId: number, checked: boolean) => {
    if (checked) {
      setSelectedCertificates(prev => [...prev, certificateId])
    } else {
      setSelectedCertificates(prev => prev.filter(id => id !== certificateId))
    }
  }

  const isMutationLoading = assignMutation.isPending || removeMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            {personnel.name} - 证书管理
          </DialogTitle>
          <DialogDescription>
            为人员分配或移除证书资质
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 h-[600px]">
          {/* 左侧：当前证书 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">当前证书 ({personnel.certificates?.length || 0})</h3>
            </div>
            
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {personnel.certificates && personnel.certificates.length > 0 ? (
                  personnel.certificates.map((cert) => (
                    <div key={cert.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{cert.certificate_name}</h4>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {cert.certificate_category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {cert.certificate_level}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveCertificate(cert.id)}
                          disabled={isMutationLoading}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      </div>
                      {cert.issuing_authority && (
                        <p className="text-xs text-muted-foreground">
                          颁发机构: {cert.issuing_authority}
                        </p>
                      )}
                      {cert.expiry_date && (
                        <p className="text-xs text-muted-foreground">
                          有效期至: {cert.expiry_date}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    暂无证书
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* 右侧：可分配证书 */}
          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">可分配证书</h3>
              
              {/* 搜索框 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索证书名称、类别或级别..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* 获得日期和备注 */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="obtain_date" className="text-xs">获得日期</Label>
                  <Input
                    id="obtain_date"
                    type="date"
                    value={obtainDate}
                    onChange={(e) => setObtainDate(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="remark" className="text-xs">备注</Label>
                  <Input
                    id="remark"
                    placeholder="备注信息"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {certificatesLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    加载中...
                  </div>
                ) : availableCertificates.length > 0 ? (
                  availableCertificates.map((cert) => (
                    <div key={cert.id} className="border rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={`cert-${cert.id}`}
                          checked={selectedCertificates.includes(cert.id)}
                          onCheckedChange={(checked) => 
                            handleCertificateSelect(cert.id, checked as boolean)
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <label 
                            htmlFor={`cert-${cert.id}`}
                            className="font-medium text-sm cursor-pointer"
                          >
                            {cert.certificate_name}
                          </label>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {cert.certificate_category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {cert.certificate_level}
                            </Badge>
                          </div>
                          {cert.issuing_authority && (
                            <p className="text-xs text-muted-foreground mt-1">
                              颁发机构: {cert.issuing_authority}
                            </p>
                          )}
                          {cert.personnel && cert.personnel.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              已分配给: {cert.personnel.map(p => p.name).join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "未找到匹配的证书" : "暂无可分配的证书"}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button 
            onClick={handleAssignCertificates}
            disabled={selectedCertificates.length === 0 || isMutationLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            分配选中证书 ({selectedCertificates.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 