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
import { EditableTenderRequirements } from './components/editable-tender-requirements';
import { StreamingJsonDisplay } from './components/streaming-json-display';
import { websocketService, fileToBase64, QualificationRecognitionCallbacks } from '@/services/websocket';
import { Attachment } from '@/types/attachment';
import { attachmentApi } from '@/api/attachment';

export default function QualificationRecognitionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const [textInput, setTextInput] = useState('');
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [activeTab, setActiveTab] = useState('file');
  
  // WebSocket相关状态
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingProgress, setStreamingProgress] = useState<{message: string; step?: string} | undefined>();
  const [accumulatedContent, setAccumulatedContent] = useState('');
  const [finalStreamData, setFinalStreamData] = useState<any>(null);
  const [useWebSocket, setUseWebSocket] = useState(true);
  
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
    mutationFn: recognizeFileQualification,
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "识别完成",
        description: "文件内容已成功识别并提取关键信息",
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
    try {
      if (websocketService.isConnected()) {
        setIsWebSocketConnected(true);
        return;
      }

      const callbacks: QualificationRecognitionCallbacks = {
        onProgress: (message: string, step?: string) => {
          console.log('识别进度:', message, step);
          setStreamingProgress({ message, step });
        },
        onContent: (content: string, accumulated: string) => {
          console.log('收到流式内容:', content);
          setAccumulatedContent(accumulated);
        },
        onSuccess: (data: any, rawContent?: string) => {
          console.log('流式识别完成:', data);
          setIsStreaming(false);
          setFinalStreamData(data);
          
          // 解析完整结果
          try {
            if (data) {
              setResult(data);
              toast({
                title: "识别完成",
                description: "流式识别已完成，结果已更新",
              });
            }
          } catch (error) {
            console.error('解析流式结果失败:', error);
          }
        },
        onError: (error: string) => {
          console.error('WebSocket错误:', error);
          setIsStreaming(false);
          toast({
            title: "连接错误",
            description: "实时连接已断开，请检查网络连接",
            variant: "destructive",
          });
        }
      };

      await websocketService.connect();
      // 注意：这里不需要setCallbacks，因为callbacks会在调用时传递
      setIsWebSocketConnected(true);
      
      toast({
        title: "实时连接已建立",
        description: "现在可以使用流式识别功能",
      });
    } catch (error) {
      console.error('WebSocket连接失败:', error);
      setIsWebSocketConnected(false);
      throw error;
    }
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    setSelectedAttachment(null); // 清除附件选择
    setResult(null);
    
    // 清除流式状态
    setAccumulatedContent('');
    setFinalStreamData(null);
    setStreamingProgress(undefined);
  };

  // 新增：处理示例附件选择
  const handleExampleSelect = async (attachment: Attachment) => {
    try {
      // 获取附件的下载URL
      const downloadUrl = await attachmentApi.getPreviewUrl(attachment.id);
      
      // 创建文件对象
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const file = new File([blob], attachment.file_name, { type: attachment.mime_type });
      
      // 使用handleFileSelect来正确设置文件和预览
      handleFileSelect(file);
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

  const handleStreamingRecognition = async (file: File) => {
    if (!websocketService.isConnected()) {
      throw new Error('WebSocket连接未建立');
    }

    try {
      setIsStreaming(true);
      setAccumulatedContent('');
      setFinalStreamData(null);
      setStreamingProgress({ message: '正在准备文件...', step: 'prepare' });

      // 将文件转换为base64
      const base64Data = await fileToBase64(file);
      
      setStreamingProgress({ message: '开始流式识别...', step: 'start' });

      // 使用现有的qualificationRecognitionStream方法
      const callbacks: QualificationRecognitionCallbacks = {
        onProgress: (message: string, step?: string) => {
          setStreamingProgress({ message, step });
        },
        onContent: (content: string, accumulated: string) => {
          setAccumulatedContent(accumulated);
        },
        onSuccess: (data: any) => {
          setIsStreaming(false);
          setFinalStreamData(data);
          if (data) {
            setResult(data);
            toast({
              title: "识别完成",
              description: "流式识别已完成，结果已更新",
            });
          }
        },
        onError: (error: string) => {
          setIsStreaming(false);
          toast({
            title: "识别失败",
            description: error,
            variant: "destructive",
          });
        }
      };

      await websocketService.qualificationRecognitionStream(
        base64Data,
        file.type.split('/')[1] || 'jpeg',
        callbacks
      );

    } catch (error) {
      console.error('流式识别失败:', error);
      setIsStreaming(false);
      throw error;
    }
  };

  const handleProcessFile = async () => {
    if (!selectedFile && !textInput.trim()) return;

    try {
      // 清除之前的结果
      setResult(null);
      setAccumulatedContent('');
      setFinalStreamData(null);
      setStreamingProgress(undefined);

      if (selectedFile) {
        // 如果WebSocket连接可用且用户选择使用WebSocket
        if (isWebSocketConnected && useWebSocket) {
          await handleStreamingRecognition(selectedFile);
        } else {
          // 使用标准HTTP请求
          await fileMutation.mutateAsync({
            file: selectedFile
          });
        }
      } else if (textInput.trim()) {
        await textMutation.mutateAsync({
          text: textInput.trim()
        });
      }
    } catch (error) {
      console.error('处理失败:', error);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSelectedAttachment(null);
    setTextInput('');
    setResult(null);
    
    // 清除流式状态
    setAccumulatedContent('');
    setFinalStreamData(null);
    setStreamingProgress(undefined);
    setIsStreaming(false);
  };

  const handleCopyJSON = (data: string) => {
    navigator.clipboard.writeText(data);
    toast({
      title: "已复制",
      description: "JSON数据已复制到剪贴板",
    });
  };

  const handleTenderRequirementsUpdate = (requirements: TenderRequirement) => {
    if (result) {
      setResult({
        ...result,
        tender_requirements: requirements
      });
    }
  };

  // 渲染文件上传组件
  const renderFileUpload = () => {
    console.log('渲染文件上传组件, 状态:', { selectedFile: !!selectedFile, textInput: textInput.length, activeTab, isProcessing });
    
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              文件识别
            </CardTitle>
            
            {/* WebSocket连接状态 */}
            <div className="flex items-center gap-2">
              {isWebSocketConnected ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  实时连接
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <WifiOff className="h-3 w-3" />
                  标准模式
                </Badge>
              )}
            </div>
          </div>
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
        <div className="flex gap-3 p-2 border border-gray-200 rounded bg-gray-50">
          <Button 
            onClick={handleProcessFile}
            disabled={isProcessing || (!selectedFile && !textInput.trim())}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {isStreaming ? '流式识别中...' : '识别中...'}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {isWebSocketConnected && useWebSocket ? '开始流式识别' : '开始识别'}
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
            {isWebSocketConnected && useWebSocket && (
              <span className="text-primary font-medium">
                {' '}当前启用实时流式传输，您可以看到识别过程的实时进度。
              </span>
            )}
            <br />
            <span className="text-orange-600 font-medium">
              AI处理时间约30秒-2分钟，系统已设置合适的超时时间，请耐心等待。
            </span>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

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
          {isWebSocketConnected && (
            <Badge variant="default" className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              实时流式
            </Badge>
          )}
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
          {/* 显示流式JSON或结果 */}
          {isStreaming || accumulatedContent || finalStreamData ? (
            <StreamingJsonDisplay
              isStreaming={isStreaming}
              progress={streamingProgress}
              accumulatedContent={accumulatedContent}
              finalData={finalStreamData}
              onComplete={(data) => {
                console.log('流式识别完成:', data);
              }}
            />
          ) : (
            <ResultDisplay
              result={result}
              isProcessing={isProcessing && !isStreaming}
              onCopyJSON={handleCopyJSON}
            />
          )}
        </motion.div>
      </div>

      {/* 标书要求编辑区域 */}
      <AnimatePresence>
        {result?.tender_requirements && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8"
          >
            <EditableTenderRequirements
              requirements={result.tender_requirements!}
              onUpdate={handleTenderRequirementsUpdate}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 