'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { 
  FileText, 
  Upload, 
  Image as ImageIcon, 
  FileCheck2, 
  AlertCircle,
  Eye,
  Sparkles,
  Wifi,
  WifiOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  recognizeFileQualification, 
  recognizeTextQualification,
  RecognitionResult,
  TenderRequirement 
} from '@/api/qualification-recognition';
import { useMutation } from '@tanstack/react-query';
import { UploadZone } from './components/upload-zone';
import { ResultDisplay } from './components/result-display';
// import { StreamingJsonDisplay } from './components/streaming-json-display';
// import { websocketService, fileToBase64, QualificationRecognitionCallbacks } from '@/services/websocket';
import { Attachment } from '@/types/attachment';
import { attachmentApi } from '@/api/attachment';

export default function QualificationRecognitionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const [textInput, setTextInput] = useState('');
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [activeTab, setActiveTab] = useState('file');
  
  // WebSocket相关状态 - 暂时关闭
  // const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  // const [isStreaming, setIsStreaming] = useState(false);
  // const [streamingProgress, setStreamingProgress] = useState<{message: string; step?: string} | undefined>();
  // const [accumulatedContent, setAccumulatedContent] = useState('');
  // const [finalStreamData, setFinalStreamData] = useState<any>(null);
  // const [useWebSocket, setUseWebSocket] = useState(true);
  
  const { toast } = useToast();

  // 标书人员要求示例数据
  const exampleTenderRequirement: TenderRequirement = {
    "负责人要求": [
      {
        "评分": 5,
        "所需工作经验年限": 5,
        "学历要求": {
          "学历": "博士",
          "专业": ["计算机", "电气自动化", "信息通信"],
          "最少数量": 1
        }
      },
      {
        "评分": 5,
        "证书要求": [
          {
            "证书名称": "PMP"
          },
          {
            "证书名称": "高级信息系统项目管理师"
          }
        ]
      }
    ],
    "团队要求": {
      "学历要求": [
        {
          "评分": 3,
          "学历": "硕士",
          "最少数量": 2
        }
      ],
      "整体要求": [
        {
          "评分": 7,
          "证书要求": [
            {
              "证书类型": "工程类",
              "证书等级": "中级"
            },
            {
              "证书类型": "软件类",
              "证书等级": "中级"
            }
          ],
          "持有证书的最小比例": 80,
          "最低人数要求": 15,
          "所需工作经验年限": 3
        }
      ]
    }
  };

  // 示例结果数据（作为演示用）
  const exampleResult: RecognitionResult = {
    success: true,
    processing_time: 2.3,
    tender_requirements: exampleTenderRequirement,
    data: [
      {
        name: '项目负责人要求',
        id_card: '--',
        education: '博士',
        major: '计算机/电气自动化/信息通信',
        work_experience: '5年以上',
        certifications: ['PMP', '高级信息系统项目管理师'],
        position: '项目负责人',
        company: '--',
        project_experience: [
          '要求具备5年以上相关工作经验',
          '必须具备博士学历，专业为计算机、电气自动化或信息通信',
          '持有PMP或高级信息系统项目管理师证书'
        ],
        skills: ['项目管理', '团队领导', '技术架构', '质量控制'],
        confidence: 0.98
      }
    ]
  };

  // 使用Mutation处理文件识别
  const fileMutation = useMutation({
    mutationFn: (params: { attachment_id: string }) => recognizeFileQualification(params),
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "识别成功",
        description: "文件内容已成功识别",
      });
    },
    onError: (error) => {
      console.error('文件识别失败:', error);
      toast({
        title: "识别失败",
        description: error instanceof Error ? error.message : "文件识别过程中发生错误",
        variant: "destructive",
      });
    },
  });

  // 使用Mutation处理文本识别
  const textMutation = useMutation({
    mutationFn: recognizeTextQualification,
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "识别完成",
        description: "文本内容已成功识别并提取关键信息",
      });
    },
    onError: (error) => {
      console.error('识别失败:', error);
      toast({
        title: "识别失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      });
    },
  });

  const isProcessing = fileMutation.isPending || textMutation.isPending;

  // WebSocket相关功能暂时关闭
  /*
  // WebSocket连接初始化
  useEffect(() => {
    const initWebSocket = async () => {
      try {
        await connectWebSocket();
      } catch (error) {
        console.log('WebSocket连接失败，将使用标准HTTP模式');
      }
    };

    initWebSocket();

    return () => {
      if (websocketService.isConnected()) {
        websocketService.disconnect();
      }
    };
  }, []);

  // WebSocket连接函数
  const connectWebSocket = async () => {
    // WebSocket连接逻辑...
  };

  // 流式识别处理
  const handleStreamingRecognition = async (file: File) => {
    // 流式识别逻辑...
  };
  */

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    setSelectedAttachment(null);
  };

  const handleExampleSelect = async (attachment: Attachment) => {
    try {
      // 获取附件的下载URL
      const downloadUrl = await attachmentApi.getPreviewUrl(attachment.id);
      
      // 创建文件对象
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const file = new File([blob], attachment.file_name, { type: attachment.mime_type });
      
      setSelectedFile(file);
      setSelectedAttachment(attachment);
      
      toast({
        title: "示例文档已选择",
        description: `已选择示例文档: ${attachment.file_name}`,
      });
    } catch (error) {
      console.error('获取示例文档失败:', error);
      toast({
        title: "获取示例失败",
        description: "无法获取示例文档，请重试",
        variant: "destructive",
      });
    }
  };

  const handleProcessFile = async () => {
    if (!selectedFile && !textInput.trim()) return;

    try {
      // 清除之前的结果
      setResult(null);

      if (selectedFile) {
        // 1. 先上传文件到MinIO
        const attachment = await attachmentApi.upload(
          selectedFile,
          'qualification-recognition',
          undefined,
          'attachment'
        );

        // 2. 使用附件ID调用识别接口
        await fileMutation.mutateAsync({
          attachment_id: attachment.id
        });
      } else if (textInput.trim()) {
        await textMutation.mutateAsync({
          text: textInput.trim()
        });
      }
    } catch (error) {
      console.error('处理失败:', error);
      toast({
        title: "处理失败",
        description: error instanceof Error ? error.message : "上传或识别过程中发生错误",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSelectedAttachment(null);
    setTextInput('');
    setResult(null);
  };

  const handleCopyJSON = (data: string) => {
    navigator.clipboard.writeText(data);
    toast({
      title: "已复制",
      description: "JSON数据已复制到剪贴板",
    });
  };

  // 渲染文件上传组件
  const renderFileUpload = () => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          文件识别
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              文件上传
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              文本输入
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="file" className="space-y-4">
            <UploadZone
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              onExampleSelect={handleExampleSelect}
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
              maxSize={10 * 1024 * 1024}
            />
          </TabsContent>
          
          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-input">输入标书要求文本</Label>
              <Textarea
                id="text-input"
                placeholder="请输入标书中的人员资质要求文本信息..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={8}
                className="resize-none"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>已输入 {textInput.length} 字符</span>
                <span>建议输入完整的人员要求信息获得更好的识别效果</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              可以直接粘贴标书文档中关于人员资质要求的相关内容
            </p>
          </TabsContent>
        </Tabs>

        {/* 按钮区域 */}
        <div className="flex gap-3">
          <Button 
            onClick={handleProcessFile}
            disabled={isProcessing || (!selectedFile && !textInput.trim())}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                识别中...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                开始识别
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={isProcessing}
          >
            重置
          </Button>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            AI将从上传的文件或文本中提取标书中关于人员的学历、工作经验、证书要求、评分标准等关键信息。
            <br />
            <span className="text-orange-600 font-medium">
              AI处理时间约30秒-2分钟，系统已设置合适的超时时间，请耐心等待。
            </span>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-6 px-4 max-w-screen-2xl">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
            <FileCheck2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold">标书人员资质识别</h1>
          <Badge variant="secondary" className="ml-2 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI算法
          </Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          基于大语言模型和文档解析技术的智能标书人员资质要求提取系统
        </p>
      </motion.div>

      {/* 主要内容区域 - 修改为2列布局，左侧更宽 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-7 gap-6 min-h-[calc(100vh-250px)]">
        {/* 左侧：文件上传/文本输入 - 根据屏幕大小占不同比例 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-3 xl:col-span-4"
        >
          {renderFileUpload()}
        </motion.div>

        {/* 右侧：结果展示 - 根据屏幕大小占不同比例 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 xl:col-span-3"
        >
          {/* 显示结果 */}
          <ResultDisplay
            result={result}
            isProcessing={isProcessing}
            onCopyJSON={handleCopyJSON}
          />
        </motion.div>
      </div>
    </div>
  );
} 