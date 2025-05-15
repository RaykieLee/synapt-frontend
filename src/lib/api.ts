import { toast } from "@/components/ui/use-toast";

export interface ApiResponse<T> {
  code: number;
  data: T;
  msg?: string;
}

// 认证失败时的跳转处理
export const handleAuthFailure = () => {
  // 显示提示
  toast({
    title: "认证失败",
    description: "请重新登录",
    variant: "destructive",
  });
  
  // 清除Token
  localStorage.removeItem("token");
  
  // 跳转到登录页
  if (typeof window !== "undefined") {
    // 记录当前页面，以便登录后可以返回
    const currentPath = window.location.pathname;
    if (currentPath !== "/login") {
      localStorage.setItem("redirectAfterLogin", currentPath);
      // 执行跳转
      window.location.href = "/login";
    }
  }
};

// 获取认证令牌
export const getToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    handleAuthFailure();
    throw new Error("认证失败");
  }
  return token;
};

// 统一API请求函数
export async function apiRequest<T>(
  url: string, 
  method: string = "GET", 
  data?: any
): Promise<T> {
  try {
    const token = getToken();
    
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };
    
    const options: RequestInit = {
      method,
      headers,
      ...(data && { body: JSON.stringify(data) })
    };
    
    const response = await fetch(url, options);
    
    if (response.status === 401) {
      handleAuthFailure();
      throw new Error("认证失败");
    }
    
    const result = await response.json() as ApiResponse<T>;
    
    // 判断是否需要重新登录
    if (result.code === 401 || (result.msg && result.msg.includes("登录"))) {
      handleAuthFailure();
      throw new Error("认证失败");
    }
    
    if (result.code !== 200) {
      toast({
        title: "请求失败",
        description: result.msg || "请稍后重试",
        variant: "destructive",
      });
      throw new Error(result.msg || "请求失败");
    }
    
    return result.data;
  } catch (error) {
    // 如果是认证失败的错误，已经在相应位置处理了，这里不需要再次显示提示
    if (error instanceof Error && error.message === "认证失败") {
      throw error;
    }
    
    toast({
      title: "请求失败",
      description: error instanceof Error ? error.message : "请检查网络连接",
      variant: "destructive",
    });
    throw error;
  }
} 