import { apiRequest } from "@/lib/api";

// 个人信息接口
export interface ProfileInfo {
  user_id: number;
  user_name: string;
  nick_name?: string;
  email?: string;
  phonenumber?: string;
  sex?: string; // "0"-男 "1"-女
  avatar?: string;
  create_time?: string;
  login_date?: string;
}

// 个人信息更新接口
export interface ProfileUpdateDto {
  nick_name?: string;
  email?: string;
  phonenumber?: string;
  sex?: string;
  avatar?: string;
}

// 密码修改接口
export interface PasswordChangeDto {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

// API响应接口
export interface ApiResponse<T> {
  code: number;
  data: T;
  msg?: string;
}

/**
 * 个人中心API
 */
export const profileApi = {
  /**
   * 获取个人信息
   */
  getInfo: () => 
    apiRequest<ProfileInfo>("/api/v1/system/profile/info", "GET"),

  /**
   * 更新个人信息
   */
  updateInfo: (data: ProfileUpdateDto) => 
    apiRequest<ProfileInfo>("/api/v1/system/profile/info", "PUT", data),

  /**
   * 修改密码
   */
  changePassword: (data: PasswordChangeDto) => 
    apiRequest<any>("/api/v1/system/profile/password", "PUT", data),

  /**
   * 更新头像
   */
  updateAvatar: (avatarUrl: string) => 
    apiRequest<ProfileInfo>("/api/v1/system/profile/avatar", "PUT", { avatar_url: avatarUrl }),

  /**
   * 获取当前用户信息（从认证接口）
   */
  getCurrentUserInfo: () => 
    apiRequest<any>("/api/v1/info", "GET"),
};
