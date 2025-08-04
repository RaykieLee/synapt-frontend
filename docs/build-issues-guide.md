# Next.js 构建问题修复指南

本文档记录了 Next.js 项目构建过程中常见的错误和警告，以及相应的解决方案。

## 1. TypeScript 错误

### 1.1 require() 导入错误

**错误信息：**
```
A `require()` style import is forbidden. @typescript-eslint/no-require-imports
```

**解决方案：**
将 `require()` 导入替换为 ES6 `import` 语法：

```typescript
// ❌ 错误写法
const mockUseChatAdapter = require('@/hooks/useChatAdapter').useChatAdapter;

// ✅ 正确写法
const { useChatAdapter: mockUseChatAdapter } = await import('@/hooks/useChatAdapter');
```

### 1.2 const 声明错误

**错误信息：**
```
'children' is never reassigned. Use 'const' instead. prefer-const
```

**解决方案：**
将 `let` 声明改为 `const`：

```typescript
// ❌ 错误写法
let children = element.props.children

// ✅ 正确写法
const children = element.props.children
```

### 1.3 空接口错误

**错误信息：**
```
An interface declaring no members is equivalent to its supertype. @typescript-eslint/no-empty-object-type
```

**解决方案：**
为空接口添加注释或字段：

```typescript
// ❌ 错误写法
export interface VirtualInfoUpdateDto extends VirtualInfoCreateDto {}

// ✅ 正确写法
export interface VirtualInfoUpdateDto extends VirtualInfoCreateDto {
  // 继承所有创建字段，可以在这里添加更新特有的字段
  id?: string; // 更新时可能需要的ID字段
}
```

### 1.4 Zod Schema 类型错误

**错误信息：**
```
Type 'boolean | undefined' is not assignable to type 'boolean'
```

**解决方案：**
确保 Zod schema 中的 boolean 字段不使用 `.default()` 或正确处理可选性：

```typescript
// ❌ 可能有问题的写法
is_active: z.boolean().default(true),

// ✅ 正确写法
is_active: z.boolean(),
```

## 2. React Hooks 依赖警告

### 2.1 useEffect 缺少依赖

**错误信息：**
```
React Hook useEffect has a missing dependency: 'modules'. Either include it or remove the dependency array.
```

**解决方案：**
将缺少的依赖添加到依赖数组中，或使用 `useMemo` 包装常量：

```typescript
// ❌ 错误写法
const modules = [/* ... */];
useEffect(() => {
  modules.forEach(/* ... */);
}, []); // 缺少 modules 依赖

// ✅ 正确写法 1：添加依赖
useEffect(() => {
  modules.forEach(/* ... */);
}, [modules]);

// ✅ 正确写法 2：使用 useMemo
const modules = useMemo(() => [/* ... */], []);
useEffect(() => {
  modules.forEach(/* ... */);
}, [modules]);
```

### 2.2 useCallback 缺少依赖

**错误信息：**
```
React Hook useCallback has missing dependencies: 'acceptedTypes' and 'maxSize'.
```

**解决方案：**
使用 `useMemo` 包装常量或添加到依赖数组：

```typescript
// ❌ 错误写法
const acceptedTypes = ['image/jpeg', 'image/png'];
const validateFile = useCallback((file: File) => {
  if (!acceptedTypes.includes(file.type)) {
    // ...
  }
}, []); // 缺少 acceptedTypes 依赖

// ✅ 正确写法
const acceptedTypes = useMemo(() => ['image/jpeg', 'image/png'], []);
const validateFile = useCallback((file: File) => {
  if (!acceptedTypes.includes(file.type)) {
    // ...
  }
}, [acceptedTypes]);
```

### 2.3 不必要的依赖

**错误信息：**
```
React Hook useCallback has an unnecessary dependency: 'setNodes'.
```

**解决方案：**
移除不必要的依赖：

```typescript
// ❌ 错误写法
const handleSomething = useCallback(() => {
  // 不使用 setNodes
}, [setNodes]); // 不必要的依赖

// ✅ 正确写法
const handleSomething = useCallback(() => {
  // 不使用 setNodes
}, []);
```

## 3. 图片优化警告

### 3.1 使用 Next.js Image 组件

**警告信息：**
```
Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image`
```

**解决方案：**
对于需要优化的图片，使用 Next.js 的 Image 组件：

```typescript
// ❌ 普通 img 标签
<img src="/path/to/image.jpg" alt="描述" />

// ✅ Next.js Image 组件
import Image from 'next/image';
<Image src="/path/to/image.jpg" alt="描述" width={500} height={300} />
```

### 3.2 添加 alt 属性

**警告信息：**
```
Image elements must have an alt prop, either with meaningful text, or an empty string for decorative images.
```

**解决方案：**
为所有 img 标签添加 alt 属性：

```typescript
// ❌ 缺少 alt 属性
<img src="/path/to/image.jpg" />

// ✅ 添加 alt 属性
<img src="/path/to/image.jpg" alt="图片描述" />

// ✅ 装饰性图片使用空字符串
<img src="/path/to/decoration.jpg" alt="" />
```

## 4. ESLint 指令警告

### 4.1 未使用的 eslint-disable

**警告信息：**
```
Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any').
```

**解决方案：**
移除不必要的 eslint-disable 注释：

```typescript
// ❌ 不必要的禁用指令
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data = someFunction();

// ✅ 移除不必要的注释
const data = someFunction();
```

## 5. 预防措施

### 5.1 开发时检查

在开发过程中定期运行以下命令检查问题：

```bash
# 类型检查
npm run type-check

# ESLint 检查
npm run lint

# 构建检查
npm run build
```

### 5.2 代码规范

1. **导入规范**：统一使用 ES6 import 语法
2. **变量声明**：优先使用 `const`，必要时使用 `let`
3. **Hooks 依赖**：仔细检查依赖数组，使用 `useMemo` 和 `useCallback` 优化
4. **图片处理**：为所有图片添加 alt 属性，考虑使用 Next.js Image 组件
5. **类型定义**：避免空接口，为接口添加有意义的字段或注释

### 5.3 自动化检查

建议在 CI/CD 流程中添加构建检查，确保代码质量：

```yaml
# .github/workflows/build.yml
- name: Build check
  run: npm run build
```

## 6. 常用修复命令

```bash
# 自动修复 ESLint 问题
npm run lint -- --fix

# 类型检查
npx tsc --noEmit

# 构建检查
npm run build
```

通过遵循本指南，可以有效避免和解决 Next.js 项目中的常见构建问题。
