# 大模型配置管理模块

## 概述
本模块提供了大语言模型配置的完整管理功能，包括创建、编辑、删除和查看配置信息。配置信息存储在数据库中，支持多种大模型提供商。

## 功能特性
- ✅ 配置列表展示（支持分页、搜索、排序）
- ✅ 创建新配置
- ✅ 编辑现有配置
- ✅ 删除配置
- ✅ 启用/禁用配置
- ✅ 支持多种大模型提供商（OpenAI、Anthropic、Google等）

## 技术栈
- **框架**: Next.js 14
- **语言**: TypeScript
- **状态管理**: React Query (TanStack Query)
- **UI组件**: Shadcn UI
- **表格**: TanStack Table
- **表单**: React Hook Form + Zod
- **样式**: Tailwind CSS

## 目录结构
```
llm-config/
├── page.tsx                    # 主页面组件
├── README.md                   # 本文档
├── components/
│   ├── columns.tsx            # 表格列定义
│   ├── create-edit-dialog.tsx # 创建/编辑对话框
│   ├── data-table.tsx         # 数据表格组件
│   ├── data-table-row-actions.tsx # 行操作菜单
│   └── toolbar.tsx            # 工具栏组件
```

## 使用说明

### 1. 访问页面
访问路径：`/dashboard/platform/llm-config`

### 2. 创建配置
1. 点击"创建配置"按钮
2. 填写配置信息：
   - 配置名称：便于识别的名称
   - 提供商：选择大模型提供商
   - 模型名称：具体的模型标识
   - API密钥：提供商的API密钥
   - 基础URL：可选，自定义API端点
   - 描述：可选，配置说明
   - 最大Token数：单次请求的最大token数
   - 温度值：模型输出的随机性（0-2）
   - 超时时间：请求超时时间（秒）
   - 启用状态：是否启用该配置

### 3. 编辑配置
1. 在配置列表中找到目标配置
2. 点击行尾的"编辑"按钮
3. 修改配置信息
4. 点击"更新"保存

### 4. 删除配置
1. 在配置列表中找到目标配置
2. 点击行尾的"删除"按钮
3. 确认删除操作

### 5. 启用/禁用配置
1. 在配置列表中找到目标配置
2. 使用状态开关切换启用/禁用状态

## API接口
- `GET /api/platform/llm-config` - 获取配置列表
- `POST /api/platform/llm-config` - 创建新配置
- `GET /api/platform/llm-config/{id}` - 获取单个配置
- `PUT /api/platform/llm-config/{id}` - 更新配置
- `DELETE /api/platform/llm-config/{id}` - 删除配置

## 数据模型
```typescript
interface LLMConfig {
  id: string;
  config_name: string;
  provider: string;
  model_name: string;
  api_key: string;
  base_url?: string;
  description?: string;
  status: "active" | "inactive";
  max_tokens?: number;
  temperature?: number;
  timeout?: number;
  create_time: string;
  update_time: string;
}
```

## 支持的提供商
- OpenAI (openai)
- Anthropic (anthropic)
- Google (google)
- Azure (azure)
- DeepSeek (deepseek)
- Moonshot (moonshot)
- 其他 (other)

## 开发说明

### 添加新的提供商
1. 在 `create-edit-dialog.tsx` 的提供商选择列表中添加新选项
2. 更新类型定义文件中的提供商类型

### 自定义表格列
编辑 `columns.tsx` 文件，可以：
- 添加新的显示列
- 修改列的排序规则
- 调整列的宽度

### 扩展配置字段
1. 更新类型定义文件 `llm-config.ts`
2. 更新表单验证规则 `create-edit-dialog.tsx`
3. 更新表格列定义 `columns.tsx`

## 注意事项
- API密钥在传输和存储时会进行加密处理
- 删除操作不可恢复，请谨慎操作
- 建议为不同的使用场景创建独立的配置
- 定期检查API密钥的有效性