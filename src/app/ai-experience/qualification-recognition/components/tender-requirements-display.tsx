'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  GraduationCap, 
  Award, 
  Users, 
  Star,
  Clock,
  Target,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { TenderRequirement } from '@/api/qualification-recognition';

interface TenderRequirementsDisplayProps {
  requirements: TenderRequirement;
}

const ScoreCard = ({ score, children }: { score: number; children: React.ReactNode }) => {
  const getScoreColor = (score: number) => {
    if (score >= 7) return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
    if (score >= 5) return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
    if (score >= 3) return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
    return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-lg border-2 ${getScoreColor(score)}`}
    >
      <div className="flex items-center justify-between mb-3">
        <Badge variant="secondary" className="flex items-center gap-1">
          <Star className="h-3 w-3" />
          评分: {score}
        </Badge>
      </div>
      {children}
    </motion.div>
  );
};

export function TenderRequirementsDisplay({ requirements }: TenderRequirementsDisplayProps) {
  return (
    <div className="space-y-6">
      {/* 负责人要求 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
            负责人要求
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {requirements.负责人要求.map((req, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ScoreCard score={req.评分}>
                <div className="space-y-3">
                  {req.所需工作经验年限 && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">工作经验: {req.所需工作经验年限}年以上</span>
                    </div>
                  )}
                  
                  {req.学历要求 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        <span className="text-sm font-medium">学历要求:</span>
                      </div>
                      <div className="ml-6 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">学历: {req.学历要求.学历}</span>
                          {req.学历要求.最少数量 && (
                            <Badge variant="outline" className="text-xs">
                              最少 {req.学历要求.最少数量} 人
                            </Badge>
                          )}
                        </div>
                        {req.学历要求.专业 && (
                          <div className="flex flex-wrap gap-1">
                            <span className="text-xs text-muted-foreground">专业:</span>
                            {req.学历要求.专业.map((major, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {major}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {req.证书要求 && req.证书要求.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        <span className="text-sm font-medium">证书要求:</span>
                      </div>
                      <div className="flex flex-wrap gap-2 ml-6">
                        {req.证书要求.map((cert, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {cert.证书名称 || `${cert.证书类型} ${cert.证书等级}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScoreCard>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* 团队要求 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-500" />
            团队要求
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 学历要求 */}
          {requirements.团队要求.学历要求.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                学历要求
              </h4>
              <div className="space-y-2">
                {requirements.团队要求.学历要求.map((req, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ScoreCard score={req.评分}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{req.学历}学历</span>
                        <Badge variant="outline" className="text-xs">
                          最少 {req.最少数量} 人
                        </Badge>
                      </div>
                    </ScoreCard>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* 整体要求 */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              整体要求
            </h4>
            <div className="space-y-4">
              {requirements.团队要求.整体要求.map((req, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                >
                  <ScoreCard score={req.评分}>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          <span>最低人数: {req.最低人数要求}人</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>工作经验: {req.所需工作经验年限}年</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          证书持有比例: {req.持有证书的最小比例}%
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          <span className="text-sm font-medium">证书要求:</span>
                        </div>
                        <div className="flex flex-wrap gap-2 ml-6">
                          {req.证书要求.map((cert, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {cert.证书名称 || `${cert.证书类型} ${cert.证书等级}`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ScoreCard>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 