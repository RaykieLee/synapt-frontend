export type VirtualWallet = {
  id: string
  virtual_info_id: string
  mnemonic?: string
  seed?: string
  eth_address?: string
  eth_private_key?: string
  sol_address?: string
  sol_private_key?: string
  status?: string
  remark?: string
}

export type VirtualWalletCreateDto = Omit<VirtualWallet, 'id'>
export type VirtualWalletUpdateDto = Partial<Omit<VirtualWallet, 'virtual_info_id'>> & { id: string }

export type VirtualWalletList = {
  total: number
  page_num: number
  page_size: number
  list: VirtualWallet[]
}

export type VirtualWalletQuery = {
  page_num?: number
  page_size?: number
  sorts?: any[]
  params?: Record<string, any>
}
