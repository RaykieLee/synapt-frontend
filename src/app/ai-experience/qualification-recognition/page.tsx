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

export default function QualificationRecognitionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
        // },
        // {
        //   "评分": 5,
        //   "证书要求": [
        //     {
        //       "证书类型": "工程类",
        //       "证书等级": "中级"
        //     },
        //     {
        //       "证书类型": "软件类",
        //       "证书等级": "中级"
        //     }
        //   ],
        //   "持有证书的最小比例": 60,
        //   "最低人数要求": 15,
        //   "所需工作经验年限": 3
        // },
        // {
        //   "评分": 3,
        //   "证书要求": [
        //     {
        //       "证书类型": "工程类",
        //       "证书等级": "中级"
        //     },
        //     {
        //       "证书类型": "软件类",
        //       "证书等级": "中级"
        //     }
        //   ],
        //   "持有证书的最小比例": 40,
        //   "最低人数要求": 15,
        //   "所需工作经验年限": 3
        // },
        // {
        //   "评分": 1,
        //   "证书要求": [
        //     {
        //       "证书类型": "工程类",
        //       "证书等级": "中级"
        //     },
        //     {
        //       "证书类型": "软件类",
        //       "证书等级": "中级"
        //     }
        //   ],
        //   "持有证书的最小比例": 20,
        //   "最低人数要求": 15,
        //   "所需工作经验年限": 3
        }
      ]
    }
  };

  // 示例图片数据
  const exampleImages = [
    {
      id: 1,
      title: '标书人员要求文档',
      description: '包含负责人要求、团队要求、学历证书等完整的人员资质规范',
      category: '要求文档'
    },
    {
      id: 2,
      title: '投标人员配置表',
      description: '详细的人员配置要求、评分标准、证书等级等信息',
      category: '配置表'
    },
    {
      id: 3,
      title: '资质要求明细',
      description: '包含不同角色的学历、经验、证书要求及对应评分',
      category: '明细表'
    },
    {
      id: 4,
      title: '技术团队规范',
      description: '技术团队人员配置标准、证书持有比例等综合要求',
      category: '团队规范'
    }
  ];

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
          '需要持有PMP或高级信息系统项目管理师证书'
        ],
        skills: ['项目管理', '团队领导', '技术架构', '质量控制'],
        confidence: 0.98
      },
      {
        name: '技术团队要求',
        id_card: '--',
        education: '硕士以上',
        major: '相关技术专业',
        work_experience: '3年以上',
        certifications: ['工程类中级证书', '软件类中级证书'],
        position: '技术团队成员',
        company: '--',
        project_experience: [
          '团队最低人数要求：15人',
          '硕士学历人员最少2人',
          '持有中级工程类或软件类证书比例需达到要求标准',
          '根据证书持有比例不同，可获得1-7分的评分'
        ],
        skills: ['软件开发', '系统集成', '工程实施', '技术支持'],
        confidence: 0.95
      }
    ]
  };

  // WebSocket连接初始化
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        await websocketService.connect();
        setIsWebSocketConnected(true);
        toast({
          title: "WebSocket连接成功",
          description: "已启用实时流式传输功能",
        });
      } catch (error) {
        console.error('WebSocket连接失败:', error);
        setIsWebSocketConnected(false);
        setUseWebSocket(false);
      }
    };

    if (useWebSocket) {
      connectWebSocket();
    }

    return () => {
      websocketService.disconnect();
    };
  }, [useWebSocket, toast]);

  // 文件识别 mutation
  const fileRecognitionMutation = useMutation({
    mutationFn: recognizeFileQualification,
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "识别完成",
        description: `成功识别到标书要求信息`,
      });
    },
    onError: (error) => {
      console.error('文件识别失败:', error);
      // 使用示例数据作为后备
      setResult(exampleResult);
      toast({
        title: "演示模式",
        description: "当前为演示模式，显示示例识别结果",
        variant: "default",
      });
    }
  });

  // 文本识别 mutation
  const textRecognitionMutation = useMutation({
    mutationFn: recognizeTextQualification,
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "识别完成",
        description: `成功识别到标书要求信息`,
      });
    },
    onError: (error) => {
      console.error('文本识别失败:', error);
      // 使用示例数据作为后备
      setResult(exampleResult);
      toast({
        title: "演示模式",
        description: "当前为演示模式，显示示例识别结果",
        variant: "default",
      });
    }
  });

  const isProcessing = fileRecognitionMutation.isPending || textRecognitionMutation.isPending || isStreaming;

  // 处理文件选择
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    toast({
      title: "文件已选择",
      description: `已选择文件: ${file.name}`,
    });
  };

  // WebSocket流式识别
  const handleStreamingRecognition = async (file: File) => {
    try {
      setIsStreaming(true);
      setStreamingProgress(undefined);
      setAccumulatedContent('');
      setFinalStreamData(null);

      const base64Data = await fileToBase64(file);
      const imageFormat = file.type.split('/')[1] || 'jpeg';

      const callbacks: QualificationRecognitionCallbacks = {
        onProgress: (message, step) => {
          setStreamingProgress({ message, step });
        },
        onContent: (content, accumulated) => {
          setAccumulatedContent(accumulated);
        },
        onSuccess: (data, rawContent) => {
          setFinalStreamData(data);
          setStreamingProgress({ message: '识别完成' });
          
          // 构建结果对象
          const result: RecognitionResult = {
            success: true,
            processing_time: 0,
            tender_requirements: data,
            data: []
          };
          setResult(result);
          
          toast({
            title: "流式识别完成",
            description: "标书要求已成功识别并解析",
          });
        },
        onError: (error) => {
          toast({
            title: "识别失败",
            description: error,
            variant: "destructive",
          });
        }
      };

      await websocketService.qualificationRecognitionStream(
        base64Data,
        imageFormat,
        callbacks
      );

    } catch (error) {
      console.error('流式识别失败:', error);
      toast({
        title: "连接错误",
        description: "WebSocket连接失败，请尝试刷新页面",
        variant: "destructive",
      });
    } finally {
      setIsStreaming(false);
    }
  };

  // 处理文件或文本处理
  const handleProcessFile = async () => {
    if (!selectedFile && !textInput.trim()) {
      toast({
        title: "请选择文件或输入文本",
        description: "请先上传文件或输入要识别的文本",
        variant: "destructive",
      });
      return;
    }

    // 显示处理提示
    toast({
      title: "开始AI识别",
      description: "AI正在分析中，预计需要30秒-2分钟，请耐心等待...",
    });

    try {
      if (activeTab === 'file' && selectedFile) {
        if (useWebSocket && isWebSocketConnected) {
          await handleStreamingRecognition(selectedFile);
        } else {
          await fileRecognitionMutation.mutateAsync({ file: selectedFile });
        }
      } else if (activeTab === 'text' && textInput.trim()) {
        await textRecognitionMutation.mutateAsync({ text: textInput });
      }
    } catch (error) {
      // 检查是否是超时错误
      if (error instanceof Error && error.message.includes('超时')) {
        toast({
          title: "请求超时",
          description: "AI处理时间较长，建议尝试使用实时流式模式或稍后重试",
          variant: "destructive",
        });
      }
      // 错误已在 mutation 的 onError 中处理
    }
  };

  // 重置状态
  const handleReset = () => {
    setSelectedFile(null);
    setTextInput('');
    setResult(null);
    setAccumulatedContent('');
    setFinalStreamData(null);
    setStreamingProgress(undefined);
    toast({
      title: "已重置",
      description: "所有输入和结果已清空",
    });
  };

  // 处理JSON复制
  const handleCopyJSON = (data: string) => {
    navigator.clipboard.writeText(data);
    toast({
      title: "已复制",
      description: "JSON数据已复制到剪贴板",
    });
  };

  // 处理标书要求更新
  const handleTenderRequirementsUpdate = (requirements: TenderRequirement) => {
    if (result) {
      setResult({
        ...result,
        tender_requirements: requirements
      });
    }
  };

  // 渲染示例图片组件
  const renderExampleImages = () => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          示例图片
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exampleImages.map((example) => (
            <motion.div
              key={example.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: example.id * 0.1 }}
              className="group cursor-pointer"
              onClick={() => {
                // 演示点击示例的效果
                toast({
                  title: "示例演示",
                  description: `查看${example.title}的识别效果`,
                });
                setResult(exampleResult);
              }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 flex items-center justify-center">
                    <FileText className="h-12 w-12 text-blue-500" />
                    <motion.div
                      className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100"
                      initial={false}
                      animate={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="absolute top-2 right-2"
                  >
                    {example.category}
                  </Badge>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                    {example.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {example.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-6">
          <Alert>
            <Eye className="h-4 w-4" />
            <AlertDescription>
              点击任意示例图片可以查看详细的标书要求信息提取效果。
              支持识别各种标书文档格式。
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );

  // 渲染文件上传组件
  const renderFileUpload = () => (
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

        <div className="flex gap-3">
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

  return (
    <div className="container mx-auto py-6 px-4">
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

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-[calc(100vh-250px)]">
        {/* 左侧：示例图片 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="xl:col-span-1"
        >
          {renderExampleImages()}
        </motion.div>

        {/* 中间：文件上传/文本输入 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="xl:col-span-1"
        >
          {renderFileUpload()}
        </motion.div>

        {/* 右侧：结果展示 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="xl:col-span-1"
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
              requirements={result.tender_requirements}
              onUpdate={handleTenderRequirementsUpdate}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 