import { parseThinkContent, hasThinkContent } from '../think-parser';

describe('think-parser', () => {
  describe('parseThinkContent', () => {
    it('should parse complete thinking block', () => {
      const content = '这是前面的内容<think>这是思考内容</think>这是后面的回答';
      const result = parseThinkContent(content);

      expect(result.thinkingContent).toBe('这是思考内容');
      expect(result.responseContent).toBe('这是前面的内容这是后面的回答');
      expect(result.isThinkingComplete).toBe(true);
    });

    it('should parse incomplete thinking block', () => {
      const content = '这是前面的内容<think>这是正在进行的思考...';
      const result = parseThinkContent(content);

      expect(result.thinkingContent).toBe('这是正在进行的思考...');
      expect(result.responseContent).toBe('这是前面的内容');
      expect(result.isThinkingComplete).toBe(false);
    });

    it('should handle content without thinking', () => {
      const content = '这是普通的回答内容';
      const result = parseThinkContent(content);

      expect(result.thinkingContent).toBeNull();
      expect(result.responseContent).toBe('这是普通的回答内容');
      expect(result.isThinkingComplete).toBe(true);
    });

    it('should handle empty thinking block', () => {
      const content = '前面内容<think></think>后面内容';
      const result = parseThinkContent(content);

      expect(result.thinkingContent).toBe('');
      expect(result.responseContent).toBe('前面内容后面内容');
      expect(result.isThinkingComplete).toBe(true);
    });

    it('should handle multiline thinking content', () => {
      const content = `前面内容<think>
第一行思考
第二行思考
第三行思考
</think>后面内容`;
      const result = parseThinkContent(content);

      expect(result.thinkingContent).toBe('第一行思考\n第二行思考\n第三行思考');
      expect(result.responseContent).toBe('前面内容后面内容');
      expect(result.isThinkingComplete).toBe(true);
    });
  });

  describe('hasThinkContent', () => {
    it('should detect thinking content', () => {
      expect(hasThinkContent('内容<think>思考</think>更多内容')).toBe(true);
      expect(hasThinkContent('内容<think>未完成的思考')).toBe(true);
      expect(hasThinkContent('普通内容')).toBe(false);
      expect(hasThinkContent('')).toBe(false);
    });
  });
});
