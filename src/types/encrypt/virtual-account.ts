// 账户类型由字典 ACCOUNT_TYPE 动态提供，使用 string 表示

export interface VirtualAccount {
  id: string
  virtual_info_id: string // 关联虚拟账户信息id
  account: string // 账号
  account_type: string // 账户类型
  password?: string // 密码
  phone?: string // 电话号码
  primary_email?: string // 主邮箱
  secondary_email?: string // 辅助邮箱
  two_fa?: string // 2FA 身份验证器信息（密钥/备份码/备注）
  // 系统通用基本字段
  status?: string
  remark?: string
  create_time?: string
  create_by?: string
  update_time?: string
  update_by?: string
  deleted?: string
}

export interface VirtualAccountCreateDto extends Omit<VirtualAccount, 'id'|'create_time'|'update_time'|'create_by'|'update_by'|'deleted'> {}

export interface VirtualAccountUpdateDto extends Partial<VirtualAccountCreateDto> {
  id: string
}

export interface VirtualAccountQuery {
  page_num?: number
  page_size?: number
  sorts?: Array<{ field: string; order: 'asc' | 'desc' }>
  params?: {
    virtual_info_id?: string
    account?: string
  account_type?: string
  }
}

export interface VirtualAccountList {
  total: number
  list: VirtualAccount[]
  page_num: number
  page_size: number
  pages: number
}
