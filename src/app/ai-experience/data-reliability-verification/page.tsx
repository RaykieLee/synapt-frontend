'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Eye, 
  Shield, 
  Activity, 
  AlertTriangle, 
  AlertCircle,
  Phone,
  Users,
  FileText,
  Zap,
  UserX,
  Car,
  BarChart3,
  Calculator,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Expand,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import VideoPlayer from '../components/VideoPlayer';

export default function DataReliabilityVerificationPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  const videoUrl = "http://127.0.0.1:8080/record/%E6%95%B0%E6%8D%AE%E5%8F%AF%E9%9D%A0%E6%80%A7%E6%A0%A1%E9%AA%8C%E7%B3%BB%E7%BB%9F%E6%BC%94%E7%A4%BA.mp4";

  // 功能模块数据
  const modules = [
    {
      id: 'login',
      title: '登录模块',
      icon: Phone,
      description: '手机号验证码登录系统',
      details: '通过手机号进行登录，在点击发送验证码时获取登录验证码，输入验证码后，由程序创建多个系统浏览器对象进行管理。',
      features: ['手机号登录', '验证码验证', '多浏览器管理', '自动化控制'],
      color: 'blue',
      image: '/images/data-reliability-verification/login.png'
    },
    {
      id: 'user-application',
      title: '用户停电申请',
      icon: Users,
      description: '用户停电申请文件智能审核',
      details: '自定义申请时间，提取计划停电单不考核原因为用户申请停电的用户，同时，提取附件PDF文件或jpg文件；对其内容进行ocr提取出申请停电用户的用户编号或进行yolo印章和指纹识别。根据模型识别结果进行判断该用户的申请文件是否正确。',
      features: ['OCR文本识别', 'YOLO印章识别', '指纹识别', '文件审核'],
      color: 'green',
      image: '/images/data-reliability-verification/用户停电申请.png'
    },
    {
      id: 'event-verification',
      title: '事件缺失校对',
      icon: Search,
      description: '停电故障事件记录完整性检查',
      details: '在页面上指定数据时间，获取该时间段的停电单数据、故障单数据、中压运行事件数据。并检查停电单单号和故障单单号是否在中压运行事件中记录。',
      features: ['数据完整性检查', '时间段筛选', '事件关联分析', '缺失提醒'],
      color: 'orange',
      image: '/images/data-reliability-verification/事件缺失校对.png'
    },
    {
      id: 'user-verification',
      title: '停电用户缺失校对',
      icon: UserX,
      description: '停电用户数据完整性验证',
      details: '该功能旨在检查计划停电和故障停电的用户是否在供电可靠性数据的停电用户数据中记录。该模块获取指定时间段中的计划停电单和故障单的用户明细数据，在供电可靠性数据的停电用户数据中进行用户缺失校对，在页面上显示每个单号下的缺失用户明细。',
      features: ['用户数据对比', '缺失用户统计', '明细展示', '数据同步检查'],
      color: 'red',
      image: '/images/data-reliability-verification/停电用户缺失校对.png'
    },
    {
      id: 'generator-verification',
      title: '发电车校对',
      icon: Car,
      description: '保供电发电车数据校验',
      details: '该功能模块旨在校验是否保供电，其原理是获取指定时间段中的计划停电和故障停电单下的用户明细，筛选出考核原因为低压发电车和中压发电车的用户；对于低压发电车的用户通过用户编号去计量系统查询线损数据，若组合线损率小于0，则正常，若组合线损率大于0，则查询当天的前后两天数据的组合供出电量，如果前后两天数据的组合供出电量与当天的组合供出电量均相差30%，则正常否则异常；对于中压发电车用户，则请求生产指挥中心系统获取三相数据，获取停电时间时长，当停电时长大于指定值时，该中压发电车用户异常，反之正常。',
      features: ['低压发电车校验', '中压发电车校验', '线损率分析', '异常用户识别'],
      color: 'purple'
    },
    {
      id: 'reason-statistics',
      title: '剔除考核原因统计',
      icon: BarChart3,
      description: '考核原因统计分析',
      details: '该功能模块则是，统计停电单和故障单中的所有用户的考核原因，做统计数据展示。',
      features: ['考核原因分类', '统计图表', '数据分析', '报表生成'],
      color: 'cyan',
      image: '/images/data-reliability-verification/剔除考核原因统计.png'
    },
    {
      id: 'reverse-metering',
      title: '反向计量校对',
      icon: Calculator,
      description: '计量系统双边告警校对',
      details: '获取计划停电单和故障单下的所有用户，统计所有用户，并将用户信息与计量系统的双边告警信息进行用户对比。筛选出告警类型是双边告警，按线路名称、停电开始时间的日期和停电开始时间排序，筛选出相同线路名称和相同日期且出现次数大于等于3次的数据，并进行相邻时间差大于等于30分钟的数据筛选。',
      features: ['双边告警筛选', '时间差分析', '事件缺失检查', 'GIS转换'],
      color: 'indigo',
      image: '/images/data-reliability-verification/反向计量校对.png'
    }
  ];

  // 预加载图片
  useEffect(() => {
    modules.forEach(module => {
      if (module.image) {
        const img = new Image();
        img.src = module.image;
      }
    });
  }, []);

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 border-blue-200',
      green: 'bg-green-50 dark:bg-green-900/10 text-green-600 border-green-200',
      orange: 'bg-orange-50 dark:bg-orange-900/10 text-orange-600 border-orange-200',
      red: 'bg-red-50 dark:bg-red-900/10 text-red-600 border-red-200',
      purple: 'bg-purple-50 dark:bg-purple-900/10 text-purple-600 border-purple-200',
      cyan: 'bg-cyan-50 dark:bg-cyan-900/10 text-cyan-600 border-cyan-200',
      indigo: 'bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 border-indigo-200'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  // 获取当前模块
  const getCurrentModule = () => {
    return modules.find(m => 
      m.id === activeTab || 
      (activeTab === 'user-app' && m.id === 'user-application') ||
      (activeTab === 'event-check' && m.id === 'event-verification') ||
      (activeTab === 'user-check' && m.id === 'user-verification') ||
      (activeTab === 'generator' && m.id === 'generator-verification') ||
      (activeTab === 'statistics' && m.id === 'reason-statistics')
    );
  };

  return (
    <div className="container mx-auto py-4 px-4">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
            <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold">数据可靠性校验</h1>
          <Badge variant="secondary" className="ml-2">AI+RPA</Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          基于RPA自动化和AI算法的电力数据质量智能校验系统
        </p>
      </motion.div>

      {/* 效果展示区域 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {activeTab === 'overview' ? '系统演示视频' : `${getCurrentModule()?.title || ''}效果展示`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
              {activeTab === 'overview' ? (
                // 总览时显示视频
                <VideoPlayer 
                  videoUrl={videoUrl}
                  title="数据可靠性校验系统演示"
                  autoPlay={true}
                  muted={true}
                  loop={true}
                  controls={true}
                />
              ) : (
                // 其他tab时显示对应的效果图片
                (() => {
                  const currentModule = getCurrentModule();
                  if (currentModule?.image) {
                    return (
                      <div className="relative w-full bg-white dark:bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer group" style={{ height: '400px' }}>
                        <img
                          src={currentModule.image}
                          alt={`${currentModule.title}效果图`}
                          className="max-w-full max-h-full object-contain transition-transform duration-200 group-hover:scale-105"
                          onClick={() => setEnlargedImage(currentModule.image)}
                          onError={(e) => {
                            console.error(`图片加载失败: ${currentModule.image}`, e);
                          }}
                          onLoad={() => {
                            console.log(`图片加载成功: ${currentModule.image}`);
                          }}
                          loading="eager"
                        />
                        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-md text-sm">
                          {currentModule.title}效果图
                        </div>
                        <div className="absolute top-4 right-4 bg-blue-600/80 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          效果预览
                        </div>
                        {/* 点击放大提示 */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/70 text-white px-3 py-2 rounded-lg flex items-center gap-2">
                            <Expand className="h-4 w-4" />
                            <span className="text-sm">点击放大</span>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    // 如果没有图片，显示图标展示（备用方案）
                    return (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white bg-gradient-to-br from-gray-800 to-gray-900">
                        {currentModule && (
                          <>
                            <div className={`p-6 rounded-full mb-4 ${getColorClasses(currentModule.color)} bg-opacity-20`}>
                              <currentModule.icon className="h-16 w-16" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">{currentModule.title}</h3>
                            <p className="text-center text-gray-300 max-w-md">{currentModule.description}</p>
                            <div className="mt-4 flex flex-wrap gap-2 justify-center">
                              {currentModule.features.map((feature, idx) => (
                                <Badge key={idx} variant="outline" className="text-white border-white/30">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </>
                        )}
                        
                        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-md text-sm">
                          功能模块效果展示
                        </div>
                        <div className="absolute top-4 right-4 bg-blue-600/80 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          效果预览
                        </div>
                      </div>
                    );
                  }
                })()
              )}
            </div>
            
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">
                {activeTab === 'overview' ? '演示说明' : '功能说明'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {activeTab === 'overview' ? 
                  '演示视频展示了数据可靠性校验系统的完整工作流程，包括登录验证、数据采集、智能分析、异常识别和结果展示等核心功能。系统能够自动完成多个业务系统的数据校验工作，大大提升了电力数据质量管控的效率和准确性。' :
                  (getCurrentModule()?.details || '该功能模块通过智能化的数据处理和分析，确保电力系统数据的准确性和完整性。')
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
          <TabsTrigger value="overview">总览</TabsTrigger>
          <TabsTrigger value="login">登录</TabsTrigger>
          <TabsTrigger value="user-app">用户申请</TabsTrigger>
          <TabsTrigger value="event-check">事件校对</TabsTrigger>
          <TabsTrigger value="user-check">用户校对</TabsTrigger>
          <TabsTrigger value="generator">发电车</TabsTrigger>
          <TabsTrigger value="statistics">统计分析</TabsTrigger>
        </TabsList>

        {/* 总览标签页 */}
        <TabsContent value="overview" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  系统概述
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  数据可靠性校验系统是一个集成了RPA自动化技术和AI算法的智能化电力数据质量管控平台。
                  系统通过自动化的数据采集、智能化的数据分析和精准的异常识别，确保电力系统数据的完整性、准确性和一致性。
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {modules.slice(1).map((module, index) => {
                    const IconComponent = module.icon;
                    return (
                      <motion.div
                        key={module.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className="h-full hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${getColorClasses(module.color)}`}>
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-sm mb-1">{module.title}</h3>
                                <p className="text-xs text-muted-foreground mb-2">{module.description}</p>
                                <div className="flex flex-wrap gap-1">
                                  {module.features.slice(0, 2).map((feature, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {feature}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* 功能模块详细页面 */}
        {modules.map((module) => (
          <TabsContent 
            key={module.id} 
            value={module.id === 'user-application' ? 'user-app' : 
                   module.id === 'event-verification' ? 'event-check' :
                   module.id === 'user-verification' ? 'user-check' :
                   module.id === 'generator-verification' ? 'generator' :
                   module.id === 'reason-statistics' ? 'statistics' :
                   module.id}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* 主要内容 */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <module.icon className="h-5 w-5" />
                      {module.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {module.details}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {module.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 工作流程 */}
                <Card>
                  <CardHeader>
                    <CardTitle>工作流程</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {module.id === 'login' && (
                        <>
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                            <div className="text-sm">
                              <div className="font-medium">输入手机号</div>
                              <div className="text-muted-foreground">用户在登录界面输入手机号码</div>
                            </div>
                          </div>
                          <Separator />
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                            <div className="text-sm">
                              <div className="font-medium">获取验证码</div>
                              <div className="text-muted-foreground">点击发送验证码按钮，系统发送短信验证码</div>
                            </div>
                          </div>
                          <Separator />
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                            <div className="text-sm">
                              <div className="font-medium">验证登录</div>
                              <div className="text-muted-foreground">输入验证码，系统验证后登录成功</div>
                            </div>
                          </div>
                          <Separator />
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                            <div className="text-sm">
                              <div className="font-medium">创建浏览器实例</div>
                              <div className="text-muted-foreground">程序自动创建多个浏览器对象进行业务操作</div>
                            </div>
                          </div>
                        </>
                      )}

                      {module.id === 'user-application' && (
                        <>
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                            <div className="text-sm">
                              <div className="font-medium">设置申请时间</div>
                              <div className="text-muted-foreground">自定义申请时间范围，系统自动筛选数据</div>
                            </div>
                          </div>
                          <Separator />
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                            <div className="text-sm">
                              <div className="font-medium">提取停电单数据</div>
                              <div className="text-muted-foreground">提取计划停电单不考核原因为用户申请停电的用户</div>
                            </div>
                          </div>
                          <Separator />
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                            <div className="text-sm">
                              <div className="font-medium">文件处理分析</div>
                              <div className="text-muted-foreground">OCR提取PDF/JPG文件内容，YOLO识别印章和指纹</div>
                            </div>
                          </div>
                          <Separator />
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                            <div className="text-sm">
                              <div className="font-medium">结果判断</div>
                              <div className="text-muted-foreground">根据模型识别结果判断申请文件是否正确</div>
                            </div>
                          </div>
                        </>
                      )}

                      {/* 其他模块的流程类似结构... */}
                      {module.id !== 'login' && module.id !== 'user-application' && (
                        <>
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                            <div className="text-sm">
                              <div className="font-medium">数据获取</div>
                              <div className="text-muted-foreground">从相关业务系统获取待校验数据</div>
                            </div>
                          </div>
                          <Separator />
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                            <div className="text-sm">
                              <div className="font-medium">数据清洗</div>
                              <div className="text-muted-foreground">对获取的数据进行清洗和预处理</div>
                            </div>
                          </div>
                          <Separator />
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                            <div className="text-sm">
                              <div className="font-medium">校验分析</div>
                              <div className="text-muted-foreground">根据业务规则进行数据校验和分析</div>
                            </div>
                          </div>
                          <Separator />
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                            <div className="text-sm">
                              <div className="font-medium">结果输出</div>
                              <div className="text-muted-foreground">生成校验报告和异常提醒</div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 侧边栏 */}
              <div className="space-y-6">
                {/* 技术特点 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      技术特点
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className={`p-3 rounded-lg border ${getColorClasses(module.color)}`}>
                        <div className="font-medium text-sm">智能化程度高</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          结合AI算法和RPA技术
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg border ${getColorClasses(module.color)}`}>
                        <div className="font-medium text-sm">准确性强</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          多重校验确保数据质量
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg border ${getColorClasses(module.color)}`}>
                        <div className="font-medium text-sm">自动化执行</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          减少人工干预，提升效率
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg border ${getColorClasses(module.color)}`}>
                        <div className="font-medium text-sm">实时监控</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          即时发现和处理异常
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 应用价值 */}
                <Card>
                  <CardHeader>
                    <CardTitle>应用价值</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        <div className="text-sm">
                          <div className="font-medium">提升数据质量</div>
                          <div className="text-muted-foreground text-xs">确保电力数据的准确性和完整性</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        <div className="text-sm">
                          <div className="font-medium">降低人工成本</div>
                          <div className="text-muted-foreground text-xs">自动化处理减少人力投入</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        <div className="text-sm">
                          <div className="font-medium">提高工作效率</div>
                          <div className="text-muted-foreground text-xs">快速完成大量数据校验工作</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        <div className="text-sm">
                          <div className="font-medium">风险预警</div>
                          <div className="text-muted-foreground text-xs">及时发现潜在数据风险</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>

      {/* 图片放大模态框 */}
      {enlargedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-w-screen-lg max-h-screen">
            <img
              src={enlargedImage}
              alt="放大图片"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              className="absolute top-4 right-4 bg-black/70 hover:bg-black/90 text-white border-none"
              size="icon"
              onClick={() => setEnlargedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 