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
  data?: any,
  options?: {
    timeout?: number; // 超时时间（毫秒）
    [key: string]: any;
  }
): Promise<T> {
  try {
    const token = getToken();
    
    // 根据数据类型设置不同的headers
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${token}`
    };
    
    // 如果数据不是FormData，则设置Content-Type为application/json
    // FormData会由浏览器自动设置正确的Content-Type (包含boundary)
    if (data && !(data instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    
    const requestOptions: RequestInit = {
      method,
      headers,
      ...(data && { 
        body: data instanceof FormData ? data : JSON.stringify(data) 
      })
    };

    // 创建AbortController来处理超时
    const controller = new AbortController();
    requestOptions.signal = controller.signal;

    // 设置超时（默认30秒，可通过options自定义）
    const timeout = options?.timeout || 30000;
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId); // 清除超时定时器
      
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
    } catch (fetchError) {
      clearTimeout(timeoutId); // 确保清除超时定时器
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error(`请求超时 (${timeout / 1000}秒)`);
      }
      
      throw fetchError;
    }
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

// 语音转录API
export interface TranscribeResponse {
  text: string;
  confidence?: number;
  duration?: number;
  model?: string;
  language?: string;
}

export async function transcribeAudio(
  audioBlob: Blob,
  options?: {
    model?: string;
    sampleRate?: number;
    language?: string;
  }
): Promise<string> {
  try {
    const formData = new FormData();

    // 添加音频文件
    formData.append('audio_file', audioBlob, 'audio.webm');

    // 添加可选参数
    if (options?.model) {
      formData.append('model', options.model);
    }
    if (options?.sampleRate) {
      formData.append('sample_rate', options.sampleRate.toString());
    }
    if (options?.language) {
      formData.append('language', options.language);
    }

    const result = await apiRequest<TranscribeResponse>(
      '/api/v1/asr/transcribe',
      'POST',
      formData,
      { timeout: 60000 } // 60秒超时，因为语音转录可能需要较长时间
    );

    return result.text || '';
  } catch (error) {
    console.error('语音转录失败:', error);
    throw new Error('语音转录失败，请重试');
  }
}