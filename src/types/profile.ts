// 个人中心相关类型定义

// 性别选项
export const GENDER_OPTIONS = [
  { value: "0", label: "男" },
  { value: "1", label: "女" },
] as const;

// 个人信息
export interface ProfileInfo {
  user_id: number;
  user_name: string;
  nick_name?: string;
  email?: string;
  phonenumber?: string;
  sex?: string;
  avatar?: string;
  create_time?: string;
  login_date?: string;
}

// 个人信息更新
export interface ProfileUpdateDto {
  nick_name?: string;
  email?: string;
  phonenumber?: string;
  sex?: string;
  avatar?: string;
}

// 密码修改
export interface PasswordChangeDto {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

// 表单验证规则
export const PROFILE_VALIDATION = {
  nick_name: {
    maxLength: 30,
    message: "昵称不能超过30个字符"
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "请输入有效的邮箱地址"
  },
  phonenumber: {
    pattern: /^1[3-9]\d{9}$/,
    message: "请输入有效的手机号码"
  },
  password: {
    minLength: 6,
    maxLength: 20,
    message: "密码长度应在6-20个字符之间"
  }
} as const;
