/**
 * 解析包含思维链的消息内容
 * 将 <think>...</think> 标签包围的内容提取出来，分离思考部分和回答部分
 */

export interface ParsedMessage {
  thinkingContent: string | null;
  responseContent: string;
  isThinkingComplete: boolean; // 思考是否已完成
}

/**
 * 解析消息内容，提取思维链和回答内容
 * @param content 原始消息内容
 * @returns 解析后的内容对象
 */
export function parseThinkContent(content: string): ParsedMessage {
  let thinkingContent: string | null = null;
  let responseContent = content;
  let isThinkingComplete = true; // 默认为完成状态

  // 检查是否有 <think> 开始标签
  const thinkStartIndex = content.indexOf('<think>');

  if (thinkStartIndex !== -1) {
    // 查找对应的结束标签
    const thinkEndIndex = content.indexOf('</think>', thinkStartIndex);

    if (thinkEndIndex !== -1) {
      // 完整的思考块：提取 <think> 和 </think> 之间的内容
      const startPos = thinkStartIndex + '<think>'.length;
      thinkingContent = content.substring(startPos, thinkEndIndex).trim();
      isThinkingComplete = true;

      // 从响应内容中移除整个思考块
      responseContent = content.substring(0, thinkStartIndex) +
                       content.substring(thinkEndIndex + '</think>'.length);
    } else {
      // 未完成的思考块：从 <think> 开始到内容结尾
      const startPos = thinkStartIndex + '<think>'.length;
      thinkingContent = content.substring(startPos).trim();
      isThinkingComplete = false; // 思考未完成

      // 响应内容只保留 <think> 之前的部分
      responseContent = content.substring(0, thinkStartIndex);
    }

    // 清理响应内容
    responseContent = responseContent.trim();
  }

  return {
    thinkingContent,
    responseContent,
    isThinkingComplete
  };
}

/**
 * 检查消息是否包含思维链
 * @param content 消息内容
 * @returns 是否包含思维链
 */
export function hasThinkContent(content: string): boolean {
  return content.includes('<think>');
}

/**
 * 清理思维链标签，只保留内容
 * @param content 包含思维链标签的内容
 * @returns 清理后的内容
 */
export function cleanThinkTags(content: string): string {
  return content.replace(/<\/?think>/gi, '').trim();
}
