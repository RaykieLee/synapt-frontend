// 登录响应接口
export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user_info: {
    userId: number;
    userName: string;
    nickName: string;
    avatar: string;
    roles: string[];
    menus: any[];
    buttons: string[];
  };
}

// 保存登录信息到本地存储
export const saveLoginInfo = (data: LoginResponse) => {
  // 保存token
  localStorage.setItem('token', data.access_token);
  localStorage.setItem('token_type', data.token_type);
  localStorage.setItem('expires_in', data.expires_in.toString());
  localStorage.setItem('token_time', Date.now().toString());
  
  // 保存用户信息
  localStorage.setItem('userInfo', JSON.stringify(data.user_info));
}

// 清除登录信息
export const clearLoginInfo = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('token_type');
  localStorage.removeItem('expires_in');
  localStorage.removeItem('token_time');
  localStorage.removeItem('userInfo');
}

// 检查登录状态
export const isLoggedIn = (): boolean => {
  const token = localStorage.getItem('token');
  const tokenTime = localStorage.getItem('token_time');
  const expiresIn = localStorage.getItem('expires_in');
  
  if (!token || !tokenTime || !expiresIn) return false;
  
  const expiryTime = parseInt(tokenTime) + parseInt(expiresIn) * 1000;
  const currentTime = Date.now();
  
  return currentTime < expiryTime;
}

// 获取认证token
export const getAuthToken = (): string | null => {
  if (!isLoggedIn()) return null;
  
  const tokenType = localStorage.getItem('token_type');
  const token = localStorage.getItem('token');
  
  return `${tokenType} ${token}`;
}

// 检查按钮权限
export const hasButtonPermission = (permCode: string): boolean => {
  const userInfoStr = localStorage.getItem('userInfo');
  if (!userInfoStr) return false;
  
  try {
    const userInfo = JSON.parse(userInfoStr);
    return userInfo.buttons && userInfo.buttons.includes(permCode);
  } catch (error) {
    console.error('Failed to parse user info:', error);
    return false;
  }
} 