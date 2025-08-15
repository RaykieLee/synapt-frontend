"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { configAPI } from "@/api/config";

interface MCPConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MCPConfigDialog({ open, onOpenChange }: MCPConfigDialogProps) {
  const queryClient = useQueryClient();
  const [mcpConfig, setMcpConfig] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 获取现有的MCP配置
  const { data: currentConfig, isLoading } = useQuery({
    queryKey: ["config", "key", "llm_mcp_config_json"],
    queryFn: () => configAPI.getConfigByKey("llm_mcp_config_json"),
    enabled: open,
  });

  // 更新配置
  const updateConfigMutation = useMutation({
    mutationFn: async (configValue: string) => {
      // 先验证JSON格式
      try {
        JSON.parse(configValue);
      } catch (error) {
        throw new Error("JSON格式不正确，请检查配置内容");
      }

      // 使用新的根据key更新配置的API
      return configAPI.updateConfigByKey("llm_mcp_config_json", {
        config_name: "LLM MCP配置",
        config_key: "llm_mcp_config_json",
        config_value: configValue,
        status: "0",
        group_name: "llm",
        is_frontend: false,
        remark: "大语言模型MCP(Model Context Protocol)配置"
      });
    },
    onSuccess: () => {
      toast.success("MCP配置保存成功");
      queryClient.invalidateQueries({ queryKey: ["config"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // 填充现有配置
  useEffect(() => {
    if (currentConfig) {
      setMcpConfig(currentConfig);
    } else {
      // 设置默认配置模板
      setMcpConfig(JSON.stringify({
        "mcpServers": {
          "memory": {
            "command": "python",
            "args": ["./mcp_server.py"]
          }
        }
      }, null, 2));
    }
  }, [currentConfig]);

  const handleSubmit = () => {
    if (!mcpConfig.trim()) {
      toast.error("配置内容不能为空");
      return;
    }

    setIsSubmitting(true);
    updateConfigMutation.mutate(mcpConfig, {
      onSettled: () => setIsSubmitting(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>MCP配置</DialogTitle>
          <DialogDescription>
            配置Model Context Protocol (MCP)服务器连接信息。配置应为有效的JSON格式。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mcp-config">MCP配置JSON</Label>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <Textarea
                id="mcp-config"
                value={mcpConfig}
                onChange={(e) => setMcpConfig(e.target.value)}
                placeholder="请输入MCP配置JSON..."
                className="font-mono text-sm min-h-[300px] resize-y"
                disabled={isSubmitting}
              />
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="mb-2">配置示例：</p>
            <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`{
  "mcpServers": {
    "memory": {
      "command": "python",
      "args": ["./mcp_server.py"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/files"]
    }
  }
}`}
            </pre>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            保存配置
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
