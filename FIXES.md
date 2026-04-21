# 前端构建修复文档

## 修复时间
2026-04-21

---

## 一、之前修复的 8 个类型错误

| # | 文件 | 问题 | 修复方式 |
|---|------|------|----------|
| 1 | `face/person/components/create-edit-dialog.tsx` | `personData?.data` 不存在 | 直接用 `personData` |
| 2 | `face/person/components/data-table-toolbar.tsx` | `librariesResponse?.data` 不存在 | 直接用 `librariesResponse` |
| 3 | `llm-config/components/data-table-toolbar.tsx` | 错误导入 `@/types/llm-config` | 改为 `@/types/llm` |
| 4 | `llm-config/components/data-table-toolbar.tsx` | `asChild` prop 不支持 | 移除 `asChild` |
| 5 | `llm/components/data-table-toolbar.tsx` | `asChild` prop 不支持 | 移除 `asChild` |
| 6 | `system/roles/components/role-permission-dialog.tsx` | `RoleUpdateDto` 需要全部字段 | 用 `Partial<RoleUpdateDto>` |
| 7 | `hooks/useChatAdapter.ts` | 无用 `@ts-expect-error` | 移除并用 `(msg as any)` |
| 8 | `hooks/useLLMChatForWidget.ts` | 4处无用 `@ts-expect-error` | 移除注释 |

---

## 二、本次修复的 11 个 `<img>` → `<Image>` 警告

| # | 文件 | 行 | 说明 |
|---|------|-----|------|
| 1 | `ai-experience/data-reliability-verification/page.tsx` | 206, 609 | 改为 `NextImage`（避免与 `new Image()` 冲突） |
| 2 | `ai-experience/qualification-recognition/components/upload-zone.tsx` | 246, 528, 618 | 改为 `Image` |
| 3 | `platform/face/person/components/data-table.tsx` | 358 | 改为 `Image` |
| 4 | `dashboard/profile/components/avatar-section.tsx` | 155 | 改为 `Image` |
| 5 | `dashboard/profile/components/avatar-upload-tab.tsx` | 141, 168 | 改为 `Image` |
| 6 | `components/shared/face-recognition.tsx` | 236 | 改为 `Image` |

**注意**：外网 URL 图片使用 `unoptimized` 属性跳过优化。

---

## 三、修复的 react-hooks 依赖警告

### 1. `useLLMChatForWidget.ts`
- **380行**：`updateLastMessage` 从 deps 中移除（已不需要）
- **455行**：`authUser` 改为 `authUser` 对象引用

### 2. `useWebSocket.ts`
- **45行**：`connectWebSocket` 从 `scheduleReconnect` deps 移除，改用 `connectWebSocketRef.current()`
- **循环依赖**：使用 `useRef` + `useEffect` 同步模式解决

### 3. `face-recognition-test.tsx`
- **186行**：`drawFaceBoxes` 从 `handleFiles` deps 移除，改用 `drawFaceBoxesRef.current()`
- 使用 `useRef` + `useEffect` 同步模式解决循环依赖

---

## 四、修复的 alt 属性警告

### `dashboard/system/menus/page.tsx`
- **247行、1000行**：`Image` (lucide-react) 重命名为 `Image as ImageIcon` 避免与 HTML `<img>` 混淆

---

## 五、保留的警告（设计决策）

| 文件 | 行 | 说明 |
|------|-----|------|
| `components/ui/avatar-image.tsx` | 91 | `<img>` 警告 - 该组件通过 CSS className 控制尺寸，转换需要改父组件布局，暂时保留 |

---

## 六、技术要点

### 1. `next/image` vs 原生 `Image` 冲突
导入 `import Image from 'next/image'` 后，原生 `new Image()` 会冲突。解决方法：
- 使用 `import NextImage from 'next/image'` 避免冲突
- 或在调用原生 API 时使用 `new (globalThis as any).Image()`

### 2. useCallback 循环依赖
当函数 A 依赖函数 B，但函数 B 也依赖函数 A 时会产生循环依赖。解决模式：
```tsx
// 1. 创建 ref
const fnRef = useRef<() => void>(() => {});

// 2. 使用 ref 代替直接引用
setTimeout(() => fnRef.current(), 100);

// 3. 保持 ref 同步
useEffect(() => {
  fnRef.current = fn;
}, [fn]);
```
