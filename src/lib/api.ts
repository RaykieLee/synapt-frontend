import { toast } from "@/components/ui/use-toast";

export interface ApiResponse<T> {
  code: number;
  data: T;
  msg?: string;
}

// 获取认证令牌
export const getToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    toast({
      title: "认证失败",
      description: "请重新登录",
      variant: "destructive",
    });
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
      toast({
        title: "认证失败",
        description: "请重新登录",
        variant: "destructive",
      });
      throw new Error("认证失败");
    }
    
    const result = await response.json() as ApiResponse<T>;
    
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
    toast({
      title: "请求失败",
      description: error instanceof Error ? error.message : "请检查网络连接",
      variant: "destructive",
    });
    throw error;
  }
} 