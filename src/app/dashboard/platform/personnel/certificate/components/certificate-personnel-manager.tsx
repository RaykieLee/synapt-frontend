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
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Certificate, PersonnelQualificationSimple } from "@/types/personnel"
import { certificateAPI, personnelQualificationAPI } from "@/api/personnel"
import { Users, Plus, Minus, Search } from "lucide-react"

interface CertificatePersonnelManagerProps {
  certificate: Certificate
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CertificatePersonnelManager({
  certificate,
  open,
  onOpenChange,
}: CertificatePersonnelManagerProps) {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPersonnel, setSelectedPersonnel] = useState<number[]>([])
  const [obtainDate, setObtainDate] = useState("")
  const [remark, setRemark] = useState("")

  // 获取所有可用人员
  const { data: personnelResponse, isLoading: personnelLoading } = useQuery({
    queryKey: ["personnel", "qualification", "options"],
    queryFn: () => personnelQualificationAPI.getOptions(),
    enabled: open,
  })

  const allPersonnel = personnelResponse?.data || []
  
  // 当前证书已分配的人员ID列表
  const currentPersonnelIds = certificate.personnel?.map(person => person.id) || []
  
  // 过滤可分配的人员（排除已有的）
  const availablePersonnel = allPersonnel.filter(person => 
    !currentPersonnelIds.includes(person.value) &&
    (searchTerm === "" || 
     person.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (person.department && person.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
     (person.position && person.position.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  )

  // 分配人员
  const assignMutation = useMutation({
    mutationFn: certificateAPI.assignPersonnel,
    onSuccess: () => {
      toast.success("人员分配成功")
      queryClient.invalidateQueries({ queryKey: ["personnel", "certificate", "list"] })
      queryClient.invalidateQueries({ queryKey: ["personnel", "certificate", "detail"] })
      setSelectedPersonnel([])
      setObtainDate("")
      setRemark("")
      onOpenChange(false)
    },
    onError: () => {
      toast.error("人员分配失败")
    },
  })

  // 移除人员
  const removeMutation = useMutation({
    mutationFn: certificateAPI.removePersonnel,
    onSuccess: () => {
      toast.success("人员移除成功")
      queryClient.invalidateQueries({ queryKey: ["personnel", "certificate", "list"] })
      queryClient.invalidateQueries({ queryKey: ["personnel", "certificate", "detail"] })
    },
    onError: () => {
      toast.error("人员移除失败")
    },
  })

  const handleAssignPersonnel = () => {
    if (selectedPersonnel.length === 0) {
      toast.error("请选择要分配的人员")
      return
    }

    assignMutation.mutate({
      certificate_id: certificate.id,
      personnel_ids: selectedPersonnel,
      obtain_date: obtainDate || undefined,
      remark: remark || undefined,
    })
  }

  const handleRemovePersonnel = (personnelId: number) => {
    removeMutation.mutate({
      certificate_id: certificate.id,
      personnel_ids: [personnelId],
    })
  }

  const handlePersonnelSelect = (personnelId: number, checked: boolean) => {
    if (checked) {
      setSelectedPersonnel(prev => [...prev, personnelId])
    } else {
      setSelectedPersonnel(prev => prev.filter(id => id !== personnelId))
    }
  }

  const isMutationLoading = assignMutation.isPending || removeMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {certificate.certificate_name} - 人员管理
          </DialogTitle>
          <DialogDescription>
            为证书分配或移除持有人员
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 h-[600px]">
          {/* 左侧：当前人员 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">当前持有人员 ({certificate.personnel?.length || 0})</h3>
            </div>
            
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {certificate.personnel && certificate.personnel.length > 0 ? (
                  certificate.personnel.map((person) => (
                    <div key={person.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{person.name}</h4>
                          <div className="flex gap-2 mt-1">
                            {person.department && (
                              <Badge variant="outline" className="text-xs">
                                {person.department}
                              </Badge>
                            )}
                            {person.position && (
                              <Badge variant="outline" className="text-xs">
                                {person.position}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemovePersonnel(person.id)}
                          disabled={isMutationLoading}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    暂无持有人员
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* 右侧：可分配人员 */}
          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">可分配人员</h3>
              
              {/* 搜索框 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索人员姓名、部门或职位..."
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
                {personnelLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    加载中...
                  </div>
                ) : availablePersonnel.length > 0 ? (
                  availablePersonnel.map((person) => (
                    <div key={person.value} className="border rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={`person-${person.value}`}
                          checked={selectedPersonnel.includes(person.value)}
                          onCheckedChange={(checked) => 
                            handlePersonnelSelect(person.value, checked as boolean)
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <label 
                            htmlFor={`person-${person.value}`}
                            className="font-medium text-sm cursor-pointer"
                          >
                            {person.label}
                          </label>
                          <div className="flex gap-2 mt-1">
                            {person.department && (
                              <Badge variant="outline" className="text-xs">
                                {person.department}
                              </Badge>
                            )}
                            {person.position && (
                              <Badge variant="outline" className="text-xs">
                                {person.position}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "未找到匹配的人员" : "暂无可分配的人员"}
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
            onClick={handleAssignPersonnel}
            disabled={selectedPersonnel.length === 0 || isMutationLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            分配选中人员 ({selectedPersonnel.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 