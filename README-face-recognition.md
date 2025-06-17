# 人脸识别登录功能说明

## 概述
本项目已集成人脸识别登录功能，用户可以通过人脸识别的方式快速登录系统。目前前端已完成实现，支持摄像头调用、人脸图像捕获和识别流程。

## 功能特性

### 前端功能
- ✅ 摄像头权限申请和启动
- ✅ 实时视频预览和人脸框定位
- ✅ 人脸图像捕获和处理  
- ✅ 识别状态反馈和错误处理
- ✅ 登录方式切换（密码登录/人脸登录）
- ✅ 用户体验优化提示

### 后端集成（待实现）
- ⏳ 人脸特征提取和存储
- ⏳ 人脸识别算法集成
- ⏳ 用户人脸信息管理API
- ⏳ 人脸登录验证API

## 前端组件结构

### 核心组件
1. **FaceRecognition** (`src/components/shared/face-recognition.tsx`)
   - 人脸识别核心组件
   - 摄像头控制和视频显示
   - 图像捕获和处理
   - 识别状态管理

2. **登录页面** (`src/app/login/page.tsx`)
   - 支持密码登录和人脸登录两种方式
   - Tab切换界面
   - 登录状态管理

3. **人脸识别服务** (`src/services/faceRecognition.ts`)
   - API调用封装
   - 人脸登录、注册、删除等接口
   - 模拟登录功能（开发阶段）

## 使用说明

### 用户端操作流程
1. 访问登录页面
2. 切换到"人脸识别"标签
3. 阅读使用提示，确保环境适合
4. 点击"启动摄像头"按钮
5. 将面部对准摄像头，保持在识别框内
6. 点击"开始识别"进行人脸识别
7. 识别成功后自动登录系统

### 开发者集成指南

#### 1. API接口规范

**人脸登录接口**
```
POST /api/v1/face-login
Content-Type: application/json

请求体：
{
  "face_data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..." // Base64编码的人脸图像
}

响应：
{
  "code": 200,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 7200,
    "user_info": {
      "userId": 123,
      "userName": "user001",
      "nickName": "张三",
      "avatar": "",
      "roles": ["user"],
      "menus": [],
      "buttons": []
    }
  },
  "msg": "登录成功"
}
```

**人脸注册接口**
```
POST /api/v1/face-register
Content-Type: application/json

请求体：
{
  "user_id": 123,
  "face_data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
}

响应：
{
  "code": 200,
  "data": {
    "success": true,
    "confidence": 0.95,
    "message": "人脸注册成功"
  },
  "msg": "注册成功"
}
```

**人脸信息管理接口**
```
# 删除人脸信息
DELETE /api/v1/face-delete/{user_id}

# 查询人脸状态
GET /api/v1/face-status/{user_id}
响应：{"has_face": true}
```

#### 2. 后端实现建议

**技术栈选择**
- 人脸识别算法：face_recognition、OpenCV、或云服务API（如百度、腾讯云等）
- 数据存储：将人脸特征向量存储在数据库中
- 安全性：对人脸数据进行加密存储

**数据库表结构建议**
```sql
CREATE TABLE user_face_features (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    face_encoding TEXT NOT NULL,  -- 人脸特征向量
    face_image_path VARCHAR(255), -- 人脸图像路径（可选）
    confidence DECIMAL(4,3),      -- 注册时的置信度
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id)
);
```

**实现要点**
1. 人脸特征提取：从Base64图像中提取128维特征向量
2. 特征比对：计算欧氏距离，设置合适的阈值（建议0.6以下）
3. 防伪检测：可选择加入活体检测功能
4. 安全性：添加请求频率限制，防止暴力破解

#### 3. 环境配置

**前端环境变量**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

**浏览器要求**
- 需要HTTPS环境或localhost才能访问摄像头
- 支持WebRTC的现代浏览器

## 安全考虑

### 隐私保护
- 人脸图像数据仅用于登录验证，不做其他用途
- 建议存储特征向量而非原始图像
- 用户可随时删除已注册的人脸信息

### 安全措施
- 添加活体检测，防止照片攻击
- 设置识别失败次数限制
- 记录登录日志，便于审计

## 开发状态

### ✅ 已完成
- 前端人脸识别组件开发
- 登录页面集成
- API服务封装
- 模拟登录功能
- 基础UI和交互逻辑

### ⏳ 待实现
- 后端人脸识别API开发
- 数据库表结构设计
- 人脸特征存储和比对算法
- 管理后台的人脸信息管理功能
- 用户设置中的人脸管理功能

### 🚀 未来优化
- 活体检测功能
- 多人脸支持
- 移动端适配优化
- 识别性能优化
- 国际化支持

## 测试说明

目前系统运行在模拟模式下：
- 人脸识别有75%的模拟成功率
- 识别成功后会自动登录为"人脸用户"
- 可以正常跳转到系统首页

在后端API开发完成后，修改 `src/services/faceRecognition.ts` 中的 `faceLogin` 函数调用即可切换到真实的识别模式。 