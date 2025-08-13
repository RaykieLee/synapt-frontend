import { apiRequest } from "@/lib/api"
import type { VirtualWallet, VirtualWalletCreateDto, VirtualWalletList, VirtualWalletQuery, VirtualWalletUpdateDto } from "@/types/encrypt/virtual-wallet"

export const virtualWalletAPI = {
  getList: (body: VirtualWalletQuery) => apiRequest<VirtualWalletList>("/api/v1/encrypt/virtual-wallets/list", "POST", body),
  create: (body: VirtualWalletCreateDto) => apiRequest<VirtualWallet>("/api/v1/encrypt/virtual-wallets/create", "POST", body),
  update: (id: string, body: VirtualWalletUpdateDto) => apiRequest<VirtualWallet>(`/api/v1/encrypt/virtual-wallets/${id}`, "PUT", body),
  delete: (id: string) => apiRequest<void>(`/api/v1/encrypt/virtual-wallets/${id}`, "DELETE"),
  getDetail: (id: string) => apiRequest<VirtualWallet>(`/api/v1/encrypt/virtual-wallets/${id}`, "GET"),
}
