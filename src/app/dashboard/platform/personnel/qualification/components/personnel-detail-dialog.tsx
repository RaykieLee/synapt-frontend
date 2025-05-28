"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/radix/dialog"
import { Separator } from "@/components/ui/separator"
import { PersonnelQualification } from "@/types/personnel"
import { User, Phone, Mail, Building, Briefcase, GraduationCap, Calendar, Award } from "lucide-react"

interface PersonnelDetailDialogProps {
  personnel: PersonnelQualification
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PersonnelDetailDialog({
  personnel,
  open,
  onOpenChange,
}: PersonnelDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {personnel.name} - 人员资质详情
          </DialogTitle>
          <DialogDescription>
            查看人员的基本信息和证书资质详情
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 基本信息 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">基本信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">姓名:</span>
                  <span className="font-medium">{personnel.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">性别:</span>
                  <Badge variant={personnel.gender === "男" ? "default" : "secondary"}>
                    {personnel.gender}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">年龄:</span>
                  <span>{personnel.age || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">入职时间:</span>
                  <span>{personnel.entry_date || "-"}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">联系电话:</span>
                  <span>{personnel.phone || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">邮箱:</span>
                  <span>{personnel.email || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">部门:</span>
                  <span>{personnel.department || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">职位:</span>
                  <span>{personnel.position || "-"}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 教育背景 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              教育背景
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">学历:</span>
                <span>{personnel.education || "-"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">专业:</span>
                <span>{personnel.major || "-"}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* 工作经历 */}
          {personnel.work_experience && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-4">工作经历</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{personnel.work_experience}</p>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* 证书资质 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="h-5 w-5" />
              证书资质 ({personnel.certificates?.length || 0})
            </h3>
            {personnel.certificates && personnel.certificates.length > 0 ? (
              <div className="grid gap-4">
                {personnel.certificates.map((cert) => (
                  <div key={cert.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{cert.certificate_name}</h4>
                      <Badge variant={cert.status === "0" ? "default" : "secondary"}>
                        {cert.status === "0" ? "有效" : "无效"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div>类别: {cert.certificate_category}</div>
                      <div>级别: {cert.certificate_level}</div>
                      <div>颁发机构: {cert.issuing_authority || "-"}</div>
                      <div>证书编号: {cert.certificate_number || "-"}</div>
                      <div>颁发日期: {cert.issue_date || "-"}</div>
                      <div>有效期至: {cert.expiry_date || "-"}</div>
                    </div>
                    {cert.remark && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        备注: {cert.remark}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                暂无证书信息
              </div>
            )}
          </div>

          {/* 其他信息 */}
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-4">其他信息</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">状态:</span>
                <Badge variant={personnel.status === "0" ? "default" : "secondary"}>
                  {personnel.status === "0" ? "正常" : "停用"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">创建时间:</span>
                <span>{personnel.create_time ? new Date(personnel.create_time).toLocaleString() : "-"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">创建者:</span>
                <span>{personnel.create_by || "-"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">更新时间:</span>
                <span>{personnel.update_time ? new Date(personnel.update_time).toLocaleString() : "-"}</span>
              </div>
            </div>
            {personnel.remark && (
              <div className="mt-4">
                <span className="text-sm text-muted-foreground">备注:</span>
                <div className="mt-1 bg-muted/50 p-3 rounded-lg text-sm">
                  {personnel.remark}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 