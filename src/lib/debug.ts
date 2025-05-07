import * as React from 'react';

/**
 * React 循环渲染检测工具
 */

/**
 * 渲染计数器 - 帮助检测组件的渲染次数
 * 在组件内部使用此hook来监控渲染次数
 * 
 * 示例:
 * ```tsx
 * function MyComponent() {
 *   usePerfTracker('MyComponent');
 *   return <div>...</div>;
 * }
 * ```
 */
export function usePerfTracker(componentName: string) {
  if (process.env.NODE_ENV !== 'development') return;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const renderCount = React.useRef(0);
  
  // eslint-disable-next-line react-hooks/rules-of-hooks
  React.useEffect(() => {
    renderCount.current += 1;
    console.log(`[PERF] ${componentName} rendered: ${renderCount.current} times`);
  });
}

/**
 * 循环检测器 - 在组件中使用此函数检测值的变化
 * 当值频繁变化时可能表明存在循环渲染的问题
 * 
 * 示例:
 * ```tsx
 * function MyComponent() {
 *   const value = getSomeValue();
 *   trackValueChanges('myValue', value);
 *   return <div>...</div>;
 * }
 * ```
 */
export function trackValueChanges(valueName: string, value: any) {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.log(`[TRACK] ${valueName} changed:`, value);
} 