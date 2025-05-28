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
import { Certificate } from "@/types/personnel"
import { Award, Building, Calendar, FileText, Hash, Download } from "lucide-react"

interface CertificateDetailDialogProps {
  certificate: Certificate
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CertificateDetailDialog({
  certificate,
  open,
  onOpenChange,
}: CertificateDetailDialogProps) {
  const handleDownload = () => {
    if (certificate.certificate_file) {
      window.open(certificate.certificate_file, '_blank');
    }
  };

  // 计算证书状态
  const getExpiryStatus = () => {
    if (!certificate.expiry_date) return null;
    
    const expiryDate = new Date(certificate.expiry_date);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: "已过期", variant: "destructive" as const, days: Math.abs(daysUntilExpiry) };
    } else if (daysUntilExpiry <= 30) {
      return { status: "即将过期", variant: "secondary" as const, days: daysUntilExpiry };
    } else {
      return { status: "有效", variant: "default" as const, days: daysUntilExpiry };
    }
  };

  const expiryStatus = getExpiryStatus();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            {certificate.certificate_name} - 证书详情
          </DialogTitle>
          <DialogDescription>
            查看证书的详细信息和有效期状态
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 基本信息 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">基本信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">证书名称:</span>
                  <span className="font-medium">{certificate.certificate_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">证书类别:</span>
                  <Badge variant="outline">{certificate.certificate_category}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">证书级别:</span>
                  <Badge variant="secondary">{certificate.certificate_level}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">状态:</span>
                  <Badge variant={certificate.status === "0" ? "default" : "secondary"}>
                    {certificate.status === "0" ? "有效" : "无效"}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">颁发机构:</span>
                  <span>{certificate.issuing_authority || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">证书编号:</span>
                  <span className="font-mono text-sm">{certificate.certificate_number || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">颁发日期:</span>
                  <span>{certificate.issue_date || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">有效期至:</span>
                  <span>{certificate.expiry_date || "-"}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 有效期状态 */}
          {expiryStatus && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-4">有效期状态</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={expiryStatus.variant}>
                      {expiryStatus.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {expiryStatus.status === "已过期" 
                        ? `已过期 ${expiryStatus.days} 天`
                        : expiryStatus.status === "即将过期"
                        ? `还有 ${expiryStatus.days} 天过期`
                        : `还有 ${expiryStatus.days} 天过期`
                      }
                    </span>
                  </div>
                  {expiryStatus.status === "已过期" && (
                    <p className="text-sm text-red-600">
                      ⚠️ 该证书已过期，请及时更新或重新申请
                    </p>
                  )}
                  {expiryStatus.status === "即将过期" && (
                    <p className="text-sm text-orange-600">
                      ⚠️ 该证书即将过期，请提前准备更新
                    </p>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* 证书文件 */}
          {certificate.certificate_file && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  证书文件
                </h3>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">证书文件</span>
                    </div>
                    <Button size="sm" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      下载
                    </Button>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* 备注信息 */}
          {certificate.remark && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-4">备注信息</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{certificate.remark}</p>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* 其他信息 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">其他信息</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">创建时间:</span>
                <span>{certificate.create_time ? new Date(certificate.create_time).toLocaleString() : "-"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">创建者:</span>
                <span>{certificate.create_by || "-"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">更新时间:</span>
                <span>{certificate.update_time ? new Date(certificate.update_time).toLocaleString() : "-"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">更新者:</span>
                <span>{certificate.update_by || "-"}</span>
              </div>
            </div>
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