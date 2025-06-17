import { LoginResponse } from './auth';

export interface FaceLoginRequest {
  face_data: string;
}

export interface FaceRegisterRequest {
  user_id: number;
  face_data: string;
}

export interface FaceRecognitionResponse {
  success: boolean;
  confidence: number;
  user_id?: number;
  message: string;
}

/**
 * 人脸识别登录
 * @param faceData Base64编码的人脸图像数据
 * @returns 登录响应数据
 */
export const faceLogin = async (faceData: string): Promise<LoginResponse> => {
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  
  const response = await fetch(`${apiUrl}/api/v1/face-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      face_data: faceData,
    }),
    credentials: 'same-origin',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || errorData.msg || '人脸登录失败');
  }

  return response.json();
};

/**
 * 注册人脸信息
 * @param userId 用户ID
 * @param faceData Base64编码的人脸图像数据
 * @returns 注册结果
 */
export const registerFace = async (userId: number, faceData: string): Promise<FaceRecognitionResponse> => {
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  
  const response = await fetch(`${apiUrl}/api/v1/face-register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      face_data: faceData,
    }),
    credentials: 'same-origin',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || errorData.msg || '人脸注册失败');
  }

  return response.json();
};

/**
 * 删除用户人脸信息
 * @param userId 用户ID
 * @returns 删除结果
 */
export const deleteFace = async (userId: number): Promise<FaceRecognitionResponse> => {
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  
  const response = await fetch(`${apiUrl}/api/v1/face-delete/${userId}`, {
    method: 'DELETE',
    credentials: 'same-origin',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || errorData.msg || '删除人脸信息失败');
  }

  return response.json();
};

/**
 * 获取用户人脸信息状态
 * @param userId 用户ID
 * @returns 人脸信息状态
 */
export const getFaceStatus = async (userId: number): Promise<{ has_face: boolean }> => {
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  
  const response = await fetch(`${apiUrl}/api/v1/face-status/${userId}`, {
    method: 'GET',
    credentials: 'same-origin',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || errorData.msg || '获取人脸状态失败');
  }

  return response.json();
};

/**
 * 模拟人脸识别登录（用于开发和演示）
 * @param faceData Base64编码的人脸图像数据
 * @returns 模拟的登录响应数据
 */
export const mockFaceLogin = async (faceData: string): Promise<LoginResponse> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 模拟70%的成功率
  const isSuccess = Math.random() > 0.3;
  
  if (!isSuccess) {
    throw new Error('人脸识别失败，请重试');
  }

  return {
    access_token: "mock_face_token_" + Date.now(),
    token_type: "bearer",
    expires_in: 7200, // 2小时有效期
    user_info: {
      userId: 999,
      userName: "face_user",
      nickName: "人脸用户",
      avatar: "",
      roles: ["user"],
      menus: [],
      buttons: [],
    }
  };
}; 