'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  GraduationCap, 
  Award, 
  Users, 
  Star,
  Clock,
  Target,
  CheckCircle,
  TrendingUp,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Copy
} from 'lucide-react';
import { TenderRequirement } from '@/api/qualification-recognition';
import { useToast } from '@/components/ui/use-toast';

interface EditableTenderRequirementsProps {
  requirements: TenderRequirement;
  onUpdate?: (requirements: TenderRequirement) => void;
}

export function EditableTenderRequirements({ 
  requirements, 
  onUpdate 
}: EditableTenderRequirementsProps) {
  const [editData, setEditData] = useState<TenderRequirement>(requirements);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setEditData(requirements);
  }, [requirements]);

  const handleSave = () => {
    onUpdate?.(editData);
    setIsEditing(false);
    toast({
      title: "保存成功",
      description: "标书要求已更新",
    });
  };

  const handleCancel = () => {
    setEditData(requirements);
    setIsEditing(false);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(editData, null, 2));
    toast({
      title: "已复制",
      description: "JSON数据已复制到剪贴板",
    });
  };

  // 添加负责人要求项
  const addLeaderRequirement = () => {
    setEditData({
      ...editData,
      负责人要求: [...editData.负责人要求, {
        评分: 1,
        所需工作经验年限: 1,
        学历要求: {
          学历: "",
          专业: [],
          最少数量: 1
        }
      }]
    });
  };

  // 删除负责人要求项
  const removeLeaderRequirement = (index: number) => {
    setEditData({
      ...editData,
      负责人要求: editData.负责人要求.filter((_, i) => i !== index)
    });
  };

  // 更新负责人要求项
  const updateLeaderRequirement = (index: number, field: string, value: any) => {
    const updated = [...editData.负责人要求];
    updated[index] = { ...updated[index], [field]: value };
    setEditData({
      ...editData,
      负责人要求: updated
    });
  };

  // 添加团队学历要求
  const addTeamEducationRequirement = () => {
    setEditData({
      ...editData,
      团队要求: {
        ...editData.团队要求,
        学历要求: [...editData.团队要求.学历要求, {
          评分: 1,
          学历: "",
          最少数量: 1
        }]
      }
    });
  };

  // 添加团队整体要求
  const addTeamOverallRequirement = () => {
    setEditData({
      ...editData,
      团队要求: {
        ...editData.团队要求,
        整体要求: [...editData.团队要求.整体要求, {
          评分: 1,
          证书要求: [],
          持有证书的最小比例: 0,
          最低人数要求: 1,
          所需工作经验年限: 1
        }]
      }
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
    if (score >= 5) return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
    if (score >= 3) return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
    return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
  };

  return (
    <div className="space-y-6">
      {/* 操作按钮 */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">标书要求配置</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyJSON}
          >
            <Copy className="h-4 w-4 mr-1" />
            复制JSON
          </Button>
          
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
                <X className="h-4 w-4 mr-1" />
                取消
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
              >
                <Save className="h-4 w-4 mr-1" />
                保存
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 className="h-4 w-4 mr-1" />
              编辑
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="view" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="view">可视化视图</TabsTrigger>
          <TabsTrigger value="json">JSON视图</TabsTrigger>
        </TabsList>
        
        <TabsContent value="view" className="space-y-6">
          {/* 负责人要求 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" />
                  负责人要求
                </CardTitle>
                {isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addLeaderRequirement}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    添加要求
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <AnimatePresence>
                {editData.负责人要求.map((req, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`p-4 rounded-lg border-2 ${getScoreColor(req.评分)}`}
                  >
                    <div className="space-y-4">
                      {/* 评分 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`leader-score-${index}`}>评分:</Label>
                          {isEditing ? (
                            <Input
                              id={`leader-score-${index}`}
                              type="number"
                              value={req.评分}
                              onChange={(e) => updateLeaderRequirement(index, '评分', parseInt(e.target.value) || 0)}
                              className="w-20"
                              min="0"
                              max="10"
                            />
                          ) : (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {req.评分}
                            </Badge>
                          )}
                        </div>
                        
                        {isEditing && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeLeaderRequirement(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {/* 工作经验年限 */}
                      {(req.所需工作经验年限 !== undefined || isEditing) && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <Label>工作经验:</Label>
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={req.所需工作经验年限 || 0}
                                onChange={(e) => updateLeaderRequirement(index, '所需工作经验年限', parseInt(e.target.value) || 0)}
                                className="w-20"
                                min="0"
                              />
                              <span className="text-sm">年以上</span>
                            </div>
                          ) : (
                            <span className="text-sm">{req.所需工作经验年限}年以上</span>
                          )}
                        </div>
                      )}

                      {/* 学历要求 */}
                      {(req.学历要求 || isEditing) && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            <Label>学历要求:</Label>
                          </div>
                          <div className="ml-6 space-y-2">
                            {isEditing ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Label>学历:</Label>
                                  <Input
                                    value={req.学历要求?.学历 || ''}
                                    onChange={(e) => updateLeaderRequirement(index, '学历要求', {
                                      ...req.学历要求,
                                      学历: e.target.value
                                    })}
                                    placeholder="博士/硕士/本科"
                                    className="w-32"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <Label>最少数量:</Label>
                                  <Input
                                    type="number"
                                    value={req.学历要求?.最少数量 || 1}
                                    onChange={(e) => updateLeaderRequirement(index, '学历要求', {
                                      ...req.学历要求,
                                      最少数量: parseInt(e.target.value) || 1
                                    })}
                                    className="w-20"
                                    min="1"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label>专业:</Label>
                                  <Textarea
                                    value={req.学历要求?.专业?.join(', ') || ''}
                                    onChange={(e) => updateLeaderRequirement(index, '学历要求', {
                                      ...req.学历要求,
                                      专业: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                                    })}
                                    placeholder="计算机, 电气自动化, 信息通信"
                                    rows={2}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">学历: {req.学历要求?.学历}</span>
                                  {req.学历要求?.最少数量 && (
                                    <Badge variant="outline" className="text-xs">
                                      最少 {req.学历要求.最少数量} 人
                                    </Badge>
                                  )}
                                </div>
                                {req.学历要求?.专业 && (
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
                            )}
                          </div>
                        </div>
                      )}

                      {/* 证书要求 */}
                      {(req.证书要求 && req.证书要求.length > 0) || isEditing && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            <Label>证书要求:</Label>
                          </div>
                          <div className="ml-6">
                            {isEditing ? (
                              <Textarea
                                value={req.证书要求?.map(cert => cert.证书名称).join(', ') || ''}
                                onChange={(e) => updateLeaderRequirement(index, '证书要求', 
                                  e.target.value.split(',').map(name => ({ 证书名称: name.trim() })).filter(cert => cert.证书名称)
                                )}
                                placeholder="PMP, 高级信息系统项目管理师"
                                rows={2}
                              />
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {req.证书要求?.map((cert, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {cert.证书名称}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
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
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    学历要求
                  </h4>
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addTeamEducationRequirement}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      添加学历要求
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  {editData.团队要求.学历要求.map((req, index) => (
                    <motion.div
                      key={index}
                      className={`p-3 rounded-lg border-2 ${getScoreColor(req.评分)}`}
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={req.学历}
                            onChange={(e) => {
                              const updated = [...editData.团队要求.学历要求];
                              updated[index] = { ...updated[index], 学历: e.target.value };
                              setEditData({
                                ...editData,
                                团队要求: { ...editData.团队要求, 学历要求: updated }
                              });
                            }}
                            placeholder="学历"
                            className="w-24"
                          />
                          <span>学历，最少</span>
                          <Input
                            type="number"
                            value={req.最少数量}
                            onChange={(e) => {
                              const updated = [...editData.团队要求.学历要求];
                              updated[index] = { ...updated[index], 最少数量: parseInt(e.target.value) || 1 };
                              setEditData({
                                ...editData,
                                团队要求: { ...editData.团队要求, 学历要求: updated }
                              });
                            }}
                            className="w-20"
                            min="1"
                          />
                          <span>人，评分</span>
                          <Input
                            type="number"
                            value={req.评分}
                            onChange={(e) => {
                              const updated = [...editData.团队要求.学历要求];
                              updated[index] = { ...updated[index], 评分: parseInt(e.target.value) || 1 };
                              setEditData({
                                ...editData,
                                团队要求: { ...editData.团队要求, 学历要求: updated }
                              });
                            }}
                            className="w-20"
                            min="0"
                            max="10"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{req.学历}学历</span>
                          <Badge variant="outline" className="text-xs">
                            最少 {req.最少数量} 人
                          </Badge>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 整体要求 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    整体要求
                  </h4>
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addTeamOverallRequirement}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      添加整体要求
                    </Button>
                  )}
                </div>
                <div className="space-y-4">
                  {editData.团队要求.整体要求.map((req, index) => (
                    <motion.div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${getScoreColor(req.评分)}`}
                    >
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                              <Label>评分:</Label>
                              <Input
                                type="number"
                                value={req.评分}
                                onChange={(e) => {
                                  const updated = [...editData.团队要求.整体要求];
                                  updated[index] = { ...updated[index], 评分: parseInt(e.target.value) || 1 };
                                  setEditData({
                                    ...editData,
                                    团队要求: { ...editData.团队要求, 整体要求: updated }
                                  });
                                }}
                                className="w-20"
                                min="0"
                                max="10"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Label>最低人数:</Label>
                              <Input
                                type="number"
                                value={req.最低人数要求}
                                onChange={(e) => {
                                  const updated = [...editData.团队要求.整体要求];
                                  updated[index] = { ...updated[index], 最低人数要求: parseInt(e.target.value) || 1 };
                                  setEditData({
                                    ...editData,
                                    团队要求: { ...editData.团队要求, 整体要求: updated }
                                  });
                                }}
                                className="w-20"
                                min="1"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                              <Label>工作经验:</Label>
                              <Input
                                type="number"
                                value={req.所需工作经验年限}
                                onChange={(e) => {
                                  const updated = [...editData.团队要求.整体要求];
                                  updated[index] = { ...updated[index], 所需工作经验年限: parseInt(e.target.value) || 1 };
                                  setEditData({
                                    ...editData,
                                    团队要求: { ...editData.团队要求, 整体要求: updated }
                                  });
                                }}
                                className="w-20"
                                min="0"
                              />
                              <span className="text-sm">年</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Label>证书比例:</Label>
                              <Input
                                type="number"
                                value={req.持有证书的最小比例}
                                onChange={(e) => {
                                  const updated = [...editData.团队要求.整体要求];
                                  updated[index] = { ...updated[index], 持有证书的最小比例: parseInt(e.target.value) || 0 };
                                  setEditData({
                                    ...editData,
                                    团队要求: { ...editData.团队要求, 整体要求: updated }
                                  });
                                }}
                                className="w-20"
                                min="0"
                                max="100"
                              />
                              <span className="text-sm">%</span>
                            </div>
                          </div>
                        </div>
                      ) : (
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
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="json">
          <Card>
            <CardHeader>
              <CardTitle>JSON数据</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={JSON.stringify(editData, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setEditData(parsed);
                    } catch (error) {
                      // 忽略无效的JSON
                    }
                  }}
                  className="font-mono text-sm min-h-96"
                />
              ) : (
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96 border">
                  {JSON.stringify(editData, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 