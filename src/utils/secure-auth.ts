/**
 * 前端加密工具 - 简化版本
 * 使用浏览器内置的Web Crypto API进行RSA加密
 */

// 缓存公钥，避免重复请求
let cachedPublicKey: CryptoKey | null = null;
let keyExpireTime: number = 0;

/**
 * 获取服务器公钥
 */
async function getServerPublicKey(): Promise<CryptoKey> {
  // 检查缓存是否有效
  if (cachedPublicKey && Date.now() < keyExpireTime) {
    return cachedPublicKey;
  }
  
  try {
    const response = await fetch('/api/v1/system/auth/public-key', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const result = await response.json();
    if (result.code !== 200 || !result.data.public_key) {
      throw new Error('获取公钥失败: ' + result.msg);
    }
    
    // 转换PEM格式公钥为CryptoKey
    const publicKey = await importRSAPublicKey(result.data.public_key);
    
    // 缓存公钥和过期时间
    cachedPublicKey = publicKey;
    keyExpireTime = Date.now() + (result.data.expires_in * 1000);
    
    return publicKey;
  } catch (error) {
    console.error('获取公钥失败:', error);
    throw error;
  }
}

/**
 * 将PEM格式公钥转换为CryptoKey对象
 */
async function importRSAPublicKey(pemKey: string): Promise<CryptoKey> {
  try {
    // 移除PEM头尾并解码base64
    const pemHeader = '-----BEGIN PUBLIC KEY-----';
    const pemFooter = '-----END PUBLIC KEY-----';
    const pemContents = pemKey.replace(pemHeader, '').replace(pemFooter, '').replace(/\s+/g, '');
    
    // 将base64转换为ArrayBuffer
    const binaryString = window.atob(pemContents);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // 导入公钥
    return await window.crypto.subtle.importKey(
      'spki',
      bytes.buffer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256'
      },
      false,
      ['encrypt']
    );
  } catch (error) {
    console.error('导入RSA公钥失败:', error);
    throw new Error('公钥格式错误');
  }
}

/**
 * 使用RSA公钥加密密码
 */
async function encryptPassword(password: string, publicKey: CryptoKey): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP'
      },
      publicKey,
      data
    );
    
    // 转换为base64
    const encryptedArray = new Uint8Array(encrypted);
    let binary = '';
    for (let i = 0; i < encryptedArray.byteLength; i++) {
      binary += String.fromCharCode(encryptedArray[i]);
    }
    
    return window.btoa(binary);
  } catch (error) {
    console.error('密码加密失败:', error);
    throw new Error('密码加密失败');
  }
}

/**
 * 安全登录函数
 */
export async function secureLogin(username: string, password: string): Promise<any> {
  try {
    // 基本验证
    if (!username || !password) {
      throw new Error('用户名和密码不能为空');
    }
    
    // 获取公钥并加密密码
    const publicKey = await getServerPublicKey();
    const encryptedPassword = await encryptPassword(password, publicKey);
    
    // 构建登录请求
    const loginData = {
      username: username.trim(),
      encrypted_password: encryptedPassword,
      user_agent: navigator.userAgent
    };
    
    // 发送登录请求
    const response = await fetch('/api/v1/system/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
      credentials: 'same-origin',
    });
    
    const result = await response.json();
    
    if (result.code !== 200) {
      throw new Error(result.msg || "登录失败");
    }
    
    return result.data;
  } catch (error) {
    console.error('安全登录失败:', error);
    throw error;
  }
}
