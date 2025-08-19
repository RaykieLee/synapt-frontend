import { LoginResponse } from './auth';

/**
 * 人脸识别登录 (仅发送 image_base64 字段，后端使用默认阈值)
 * @param imageBase64 Base64编码（可含 data: 前缀）
 * @returns 登录响应数据
 */
export const faceLogin = async (imageBase64: string): Promise<LoginResponse> => {
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  const response = await fetch(`${apiUrl}/api/v1/platform/face/face-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_base64: imageBase64 }),
    // 人脸登录不应强制带已有登录态，但如果浏览器已有 cookie/凭证，保留 same-origin；如需彻底无凭证可改为 'omit'
    credentials: 'same-origin',
  });

  let result: any;
  try {
    result = await response.json();
  } catch (e) {
    // 捕获并重新抛出，附加原始错误信息方便调试
    console.error('faceLogin parse json error', e);
    throw new Error('人脸登录响应解析失败');
  }

  if (result?.code !== 200 || !result?.data) {
    throw new Error(result?.msg || '人脸登录失败');
  }

  return result.data as LoginResponse;
};

// 如果后续需要人脸注册 / 状态查询 / 删除等接口，可在此文件继续补充或拆分到单独模块。
