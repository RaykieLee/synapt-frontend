'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Award, 
  User, 
  Building, 
  CheckCircle, 
  Clock, 
  BarChart3,
  Download,
  Sparkles,
  GraduationCap,
  Briefcase,
  Star,
  Target,
  TrendingUp,
  FileText,
  Copy
} from 'lucide-react';
import { RecognitionResult, PersonQualification } from '@/api/qualification-recognition';
import { TenderRequirementsDisplay } from './tender-requirements-display';

interface ResultDisplayProps {
  result: RecognitionResult | null;
  isProcessing: boolean;
  onCopyJSON?: (data: string) => void;
}

const confidenceColor = (confidence: number) => {
  if (confidence >= 0.9) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
  if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
  return 'text-red-600 bg-red-100 dark:bg-red-900/20';
};

const SkillTag = ({ skill, index }: { skill: string; index: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, x: -10 }}
    animate={{ opacity: 1, scale: 1, x: 0 }}
    transition={{ delay: index * 0.05, duration: 0.3 }}
    whileHover={{ scale: 1.05 }}
    className="inline-block"
  >
    <Badge variant="secondary" className="text-xs cursor-default">
      {skill}
    </Badge>
  </motion.div>
);

const CertificationBadge = ({ cert, index }: { cert: string; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.4 }}
    whileHover={{ scale: 1.02 }}
    className="relative group"
  >
    <Badge variant="outline" className="text-xs pr-8 group-hover:shadow-md transition-shadow">
      <Award className="h-3 w-3 mr-1" />
      {cert}
    </Badge>
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: index * 0.1 + 0.2 }}
      className="absolute -top-1 -right-1"
    >
      <div className="w-2 h-2 bg-green-500 rounded-full" />
    </motion.div>
  </motion.div>
);

const ProjectCard = ({ project, index }: { project: string; index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1, duration: 0.4 }}
    whileHover={{ scale: 1.01, backgroundColor: 'hsl(var(--accent))' }}
    className="p-3 bg-muted rounded-lg cursor-default transition-colors"
  >
    <div className="flex items-start gap-2">
      <Briefcase className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
      <p className="text-sm">{project}</p>
    </div>
  </motion.div>
);

const PersonCard = ({ person, index }: { person: PersonQualification; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ 
      duration: 0.5, 
      delay: index * 0.15,
      type: "spring",
      stiffness: 100
    }}
    whileHover={{ 
      y: -5,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    }}
  >
    <Card className="overflow-hidden relative group">
      {/* 背景渐变效果 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              className="p-3 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </motion.div>
            <div>
              <motion.h3 
                className="text-xl font-bold"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 + 0.2 }}
              >
                {person.name}
              </motion.h3>
              <motion.p 
                className="text-sm text-muted-foreground flex items-center gap-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 + 0.3 }}
              >
                <Building className="h-3 w-3" />
                {person.position} @ {person.company}
              </motion.p>
            </div>
          </div>
          
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              delay: index * 0.15 + 0.4,
              type: "spring",
              stiffness: 200
            }}
          >
            <Badge 
              variant="secondary" 
              className={`flex items-center gap-1 ${confidenceColor(person.confidence)}`}
            >
              <Sparkles className="h-3 w-3" />
              置信度: {Math.round(person.confidence * 100)}%
            </Badge>
          </motion.div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 relative z-10">
        {/* 基本信息和教育背景 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 + 0.5 }}
          >
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              基本信息
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground w-16">身份证:</span>
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                  {person.id_card}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">学历:</span>
                <Badge variant="outline" className="text-xs">
                  {person.education}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">专业:</span>
                <span>{person.major}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">经验:</span>
                <Badge variant="secondary" className="text-xs">
                  {person.work_experience}
                </Badge>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 + 0.6 }}
          >
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-500" />
              专业证书
              <Badge variant="outline" className="text-xs">
                {person.certifications.length}
              </Badge>
            </h4>
            <div className="space-y-2">
              {person.certifications.map((cert, idx) => (
                <CertificationBadge key={idx} cert={cert} index={idx} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* 项目经验 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.15 + 0.7 }}
        >
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-green-500" />
            项目经验
            <Badge variant="outline" className="text-xs">
              {person.project_experience.length} 个项目
            </Badge>
          </h4>
          <div className="space-y-2">
            {person.project_experience.map((project, idx) => (
              <ProjectCard key={idx} project={project} index={idx} />
            ))}
          </div>
        </motion.div>

        {/* 技能标签 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.15 + 0.8 }}
        >
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            核心技能
            <Badge variant="outline" className="text-xs">
              {person.skills.length} 项
            </Badge>
          </h4>
          <div className="flex flex-wrap gap-2">
            {person.skills.map((skill, idx) => (
              <SkillTag key={idx} skill={skill} index={idx} />
            ))}
          </div>
        </motion.div>
      </CardContent>
    </Card>
  </motion.div>
);

export function ResultDisplay({ result, isProcessing, onCopyJSON }: ResultDisplayProps) {
  const handleCopyJSON = () => {
    if (result && onCopyJSON) {
      onCopyJSON(JSON.stringify(result, null, 2));
    }
  };

  return (
    <Card className="h-full max-h-[calc(100vh-200px)] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          识别结果
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* 处理中的动态效果 */}
              <div className="flex items-center justify-center space-x-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                />
                <span className="text-sm font-medium">正在分析人员资质信息...</span>
              </div>
              
              {/* 模拟加载步骤 */}
              <div className="space-y-4">
                {[
                  '解析文档结构...',
                  '提取个人信息...',
                  '识别技能证书...',
                  '分析项目经验...',
                  '生成结构化数据...'
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.5, duration: 0.3 }}
                    className="flex items-center gap-3"
                  >
                    <motion.div
                      className="w-3 h-3 bg-primary rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className="text-sm">{step}</span>
                  </motion.div>
                ))}
              </div>
              
              {/* 骨架屏 */}
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <motion.div 
                    key={i} 
                    className="space-y-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.3 }}
                  >
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-24 w-full" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex flex-col"
            >
              {/* 处理结果摘要 */}
              <motion.div 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800 mb-6 flex-shrink-0"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </motion.div>
                  <div>
                    <span className="font-semibold text-green-800 dark:text-green-400 text-lg">
                      识别完成
                    </span>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      成功提取人员资质信息
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-green-700 dark:text-green-300">
                    <Clock className="h-3 w-3" />
                    <span>{result.processing_time}s</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-700 dark:text-green-300">
                    <BarChart3 className="h-3 w-3" />
                    <span>{result.data.length} 人</span>
                  </div>
                </div>
              </motion.div>

              {/* 识别结果详情 */}
              <div className="flex-1 overflow-hidden">
                <Tabs defaultValue="structured" className="h-full flex flex-col">
                  <TabsList className={`grid w-full ${result.tender_requirements ? 'grid-cols-3' : 'grid-cols-2'} flex-shrink-0`}>
                    <TabsTrigger value="structured" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      结构化结果
                    </TabsTrigger>
                    {result.tender_requirements && (
                      <TabsTrigger value="requirements" className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        标书要求
                      </TabsTrigger>
                    )}
                    <TabsTrigger value="json" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      JSON格式
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="structured" className="flex-1 overflow-y-auto mt-6 space-y-6">
                    {result.data.map((person, index) => (
                      <PersonCard key={index} person={person} index={index} />
                    ))}
                  </TabsContent>

                  {result.tender_requirements && (
                    <TabsContent value="requirements" className="flex-1 overflow-y-auto mt-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <TenderRequirementsDisplay requirements={result.tender_requirements} />
                      </motion.div>
                    </TabsContent>
                  )}
                  
                  <TabsContent value="json" className="flex-1 overflow-y-auto mt-6">
                    <motion.div 
                      className="relative h-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <pre className="bg-muted p-4 rounded-lg text-sm h-full overflow-auto border">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                      <motion.div
                        className="absolute top-2 right-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyJSON}
                          className="bg-background/80 backdrop-blur-sm"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          复制
                        </Button>
                      </motion.div>
                    </motion.div>
                  </TabsContent>
                </Tabs>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 text-muted-foreground"
            >
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <FileText className="h-16 w-16 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-lg font-semibold mb-2">等待识别</h3>
              <p>上传文件或输入文本后，识别结果将在此处显示</p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
} 