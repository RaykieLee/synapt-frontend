"use client"

import React, { useCallback, useEffect, useState } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  NodeTypes,
  Panel,
  ReactFlowProvider,
  ConnectionMode,
  Handle,
  Position,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Save, Play, Settings, Trash2, ChevronRight, ChevronDown, GripVertical, ChevronLeft, ChevronRight as ChevronRightIcon, Folder, FolderOpen, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { schedulerApi } from '@/api/scheduler'

interface TaskNodeData {
  label: string
  taskId: string
  taskType: string
  description?: string
  status?: string
  enabled?: boolean
  originalTask?: any
  isNew?: boolean
  [key: string]: any
}

// 自定义节点类型
const TaskNode = ({ data }: { data: TaskNodeData }) => {
  const statusColors: Record<string, string> = {
    pending: 'bg-gray-500',
    running: 'bg-blue-500',
    success: 'bg-green-500',
    failed: 'bg-red-500',
    skipped: 'bg-yellow-500',
  }

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-200 min-w-[200px] relative">
      {/* 输入手柄 - 左侧 */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg hover:bg-blue-600 hover:scale-110 transition-all cursor-pointer"
        style={{ left: -8, zIndex: 10 }}
      />
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-bold text-sm">{data.label}</div>
          <div className="text-xs text-gray-600 mt-1">{data.taskType || '任务'}</div>
          {data.description && (
            <div className="text-xs text-gray-500 mt-1">{data.description}</div>
          )}
        </div>
        <Badge
          variant="outline"
          className={`ml-2 text-xs ${statusColors[data.status || 'pending'] || 'bg-gray-500'} text-white`}
        >
          {data.status || '待执行'}
        </Badge>
      </div>
      <div className="mt-2 flex justify-between items-center">
        <span className="text-xs text-gray-500">#{data.taskId}</span>
        {data.enabled !== false && (
          <Badge variant="secondary" className="text-xs">启用</Badge>
        )}
      </div>

      {/* 输出手柄 - 右侧 */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-lg hover:bg-green-600 hover:scale-110 transition-all cursor-pointer"
        style={{ right: -8, zIndex: 10 }}
      />
    </div>
  )
}

// 可折叠任务列表组件 - 支持三级分类和收起功能
interface TaskListSidebarProps {
  tasks: any[]
  onDragStart: (event: React.DragEvent, task: any) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const TaskListSidebar = ({ tasks, onDragStart, isCollapsed, onToggleCollapse }: TaskListSidebarProps) => {
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set())

  // 按任务类型分组
  const groupedTasks = tasks.reduce((acc: Record<string, any[]>, task: any) => {
    // 根据task_type映射到用户友好的分类名称
    let category: string;
    switch (task.task_type) {
      case 'builtin_function':
        category = '内置函数';
        break;
      case 'python_script':
        category = 'Python脚本';
        break;
      case 'shell_command':
        category = 'Shell命令';
        break;
      case 'http_request':
        category = 'HTTP请求';
        break;
      default:
        category = task.isTemplate ? '任务模板' : '请选择任务类型';
    }
    
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(task)
    return acc
  }, {} as Record<string, any[]>)

  const toggleType = (type: string) => {
    setExpandedTypes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(type)) {
        newSet.delete(type)
      } else {
        newSet.add(type)
      }
      return newSet
    })
  }

  // 移除toggleCategory函数，现在只有一级分类

  if (isCollapsed) {
    return (
      <div className="w-12 bg-white border-r border-gray-200 h-full flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="p-2 hover:bg-gray-100"
          title="展开任务列表"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
        <div className="mt-4 writing-mode-vertical text-sm text-gray-600 font-medium">
          任务列表
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800">任务列表</h3>
          <p className="text-xs text-gray-500 mt-1">拖拽任务到流程图</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="p-2 hover:bg-gray-100"
          title="收起任务列表"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {Object.entries(groupedTasks).map(([type, tasks]) => (
          <div key={type} className="mb-3">
            <button
              onClick={() => toggleType(type)}
              className="w-full flex items-center justify-between p-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
            >
              <div className="flex items-center">
                {expandedTypes.has(type) ? (
                  <FolderOpen className="h-4 w-4 mr-2 text-blue-600" />
                ) : (
                  <Folder className="h-4 w-4 mr-2 text-gray-600" />
                )}
                <span>{type} ({tasks.length})</span>
              </div>
              {expandedTypes.has(type) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            {expandedTypes.has(type) && (
              <div className="ml-4 mt-1 space-y-1">
                {tasks.map((task: any) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e: React.DragEvent) => onDragStart(e, task)}
                    className="p-2 text-xs bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-md cursor-move transition-colors group"
                  >
                    <div className="flex items-center">
                      <FileText className="h-3 w-3 text-gray-400 mr-2 group-hover:text-blue-500" />
                      <div>
                        <div className="font-medium text-gray-800">{task.name}</div>
                        <div className="text-xs text-gray-500">#{task.task_id || task.id}</div>
                        {task.description && (
                          <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                            {task.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const nodeTypes: NodeTypes = {
  taskNode: TaskNode,
}

// 默认边类型
const defaultEdgeOptions = {
  animated: true,
  style: {
    stroke: '#3b82f6',
    strokeWidth: 3,
  },
  type: 'smoothstep',
}

interface WorkflowEditorProps {
  pipelineId: string
  flowConfig?: string
  onSave: (flowData: any) => void
}

function WorkflowEditorContent({ pipelineId, flowConfig, onSave }: WorkflowEditorProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  // 初始化节点和边
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // 获取所有任务类型
  const { data: taskTypes } = useQuery({
    queryKey: ['scheduler-task-types'],
    queryFn: schedulerApi.taskRegistry.getTypes,
  })

  // 获取所有内置函数
  const { data: builtinFunctions } = useQuery({
    queryKey: ['scheduler-builtin-functions'],
    queryFn: schedulerApi.taskRegistry.getBuiltinFunctions,
  })

  // 合并所有可用任务
  const allAvailableTasks = React.useMemo(() => {
    const tasks: any[] = []
    
    // 添加内置函数
    if (builtinFunctions) {
      tasks.push(...builtinFunctions)
    }
    
    // 添加任务类型（作为任务模板）
    if (taskTypes) {
      taskTypes.forEach((type: any) => {
        // 为每种任务类型创建一个模板任务
        tasks.push({
          id: `template_${type.value}`,
          task_id: type.value,
          name: type.display_name || type.value,
          task_type: type.value,
          description: `${type.display_name}任务模板`,
          isTemplate: true,
        })
      })
    }
    
    return tasks
  }, [taskTypes, builtinFunctions])

  // 从flowConfig解析初始数据
  useEffect(() => {
    setIsLoading(true)
    
    if (flowConfig && flowConfig !== 'null' && flowConfig !== '') {
      try {
        const flowData = JSON.parse(flowConfig)
        if (flowData && flowData.nodes && Array.isArray(flowData.nodes) && flowData.nodes.length > 0) {
          setNodes(flowData.nodes)
          if (flowData.edges && Array.isArray(flowData.edges)) {
            setEdges(flowData.edges)
          }
          toast({
            title: "加载成功",
            description: "已加载保存的流程图配置",
          })
          setIsLoading(false)
          return
        }
      } catch (error) {
        console.error('解析流程图配置失败:', error)
        toast({
          title: "加载失败",
          description: "流程图配置格式错误，将使用默认布局",
          variant: "destructive",
        })
      }
    }
    
    // 如果没有有效的flowConfig，初始化空流程图
    setTimeout(() => {
      setNodes([])
      setEdges([])
      setIsLoading(false)
    }, 300)
  }, [flowConfig, setNodes, setEdges, toast])

  // 处理连接
  const onConnect = useCallback(
    (params: Connection) => {
      // 防止自连接
      if (params.source === params.target) {
        return;
      }
      
      // 防止右侧连接右侧，左侧连接左侧
      // 确保源节点只能使用输出手柄（右侧），目标节点只能使用输入手柄（左侧）
      if (params.sourceHandle !== 'output' || params.targetHandle !== 'input') {
        return;
      }
      
      setEdges((eds: Edge[]) => addEdge(params, eds));
    },
    [setEdges]
  )

  // 添加新任务节点 - 已移除，使用拖拽功能替代
  const addNewTaskNode = useCallback(() => {
    // 此函数已废弃，使用拖拽功能添加节点
  }, [])

  // 保存流程图
  const handleSaveFlow = useCallback(() => {
    const flowData = {
      nodes: nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          originalTask: undefined // 移除原始任务数据，避免循环引用
        }
      })),
      edges: edges,
      metadata: {
        updatedAt: new Date().toISOString(),
        taskCount: nodes.length,
        edgeCount: edges.length,
      }
    }

    onSave(flowData)
    
    toast({
      title: "成功",
      description: "流程图已保存",
    })
  }, [nodes, edges, onSave, toast])

  // 删除选中的节点
  const deleteSelectedNode = useCallback(() => {
    if (!selectedNode) return

    setNodes((nds: Node[]) => nds.filter(node => node.id !== selectedNode.id))
    setEdges((eds: Edge[]) => eds.filter(edge => 
      edge.source !== selectedNode.id && edge.target !== selectedNode.id
    ))
    setSelectedNode(null)
    
    toast({
      title: "成功",
      description: "节点已删除",
    })
  }, [selectedNode, setNodes, setEdges, toast])

  // 节点点击事件
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  // 画布点击事件
  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  // 处理拖拽放置
  const { screenToFlowPosition } = useReactFlow()
  
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      
      const taskData = event.dataTransfer.getData('application/json')
      if (!taskData) return
      
      try {
        const task = JSON.parse(taskData)
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        })
        
        const newNode: Node = {
          id: `task_${Date.now()}`,
          type: 'taskNode',
          position,
          data: {
            label: task.name || '新任务',
            taskId: task.task_id,
            taskType: task.task_type,
            description: task.description,
            status: 'pending',
            enabled: true,
            originalTask: task,
          } as TaskNodeData,
        }
        
        setNodes((nds: Node[]) => [...nds, newNode])
        
        toast({
          title: "成功",
          description: `已添加任务: ${task.name}`,
        })
      } catch (error) {
        console.error('添加任务失败:', error)
        toast({
          title: "错误",
          description: "添加任务失败",
          variant: "destructive",
        })
      }
    },
    [screenToFlowPosition, setNodes, toast]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }, [])

  const onDragStart = useCallback((event: React.DragEvent, task: any) => {
    event.dataTransfer.setData('application/json', JSON.stringify(task))
    event.dataTransfer.effectAllowed = 'copy'
  }, [])

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev)
  }, [])

  return (
    <div className="h-[600px] w-full flex">
      <TaskListSidebar
        tasks={allAvailableTasks}
        onDragStart={onDragStart}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />
      
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          connectionMode={ConnectionMode.Loose}
          connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls />
          <MiniMap
            nodeStrokeWidth={3}
            nodeColor="#3b82f6"
            maskColor="rgba(0, 0, 0, 0.1)"
          />
          
          <Panel position="top-right" className="flex gap-2 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200">
            <Button
              variant="destructive"
              size="sm"
              onClick={deleteSelectedNode}
              disabled={!selectedNode}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-1.5 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              删除节点
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveFlow}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-1.5"
            >
              <Save className="h-4 w-4 mr-1.5" />
              保存
            </Button>
          </Panel>

          {selectedNode && (
            <Panel position="bottom-left" className="bg-gray-900 text-white p-4 rounded-lg shadow-xl max-w-sm border border-gray-700">
              <div className="text-sm">
                <div className="font-bold mb-3 text-base border-b border-gray-700 pb-2">节点详情</div>
                <div className="space-y-2">
                  <div><span className="font-semibold text-blue-300">名称:</span> <span className="text-gray-200">{String((selectedNode.data as any).label)}</span></div>
                  <div><span className="font-semibold text-blue-300">ID:</span> <span className="text-gray-200 font-mono text-xs">{String((selectedNode.data as any).taskId)}</span></div>
                  <div><span className="font-semibold text-blue-300">类型:</span> <span className="text-gray-200">{String((selectedNode.data as any).taskType)}</span></div>
                  {(selectedNode.data as any).description && (
                    <div>
                      <span className="font-semibold text-blue-300">描述:</span>
                      <div className="text-gray-200 mt-1 text-xs bg-gray-800 p-2 rounded">{String((selectedNode.data as any).description)}</div>
                    </div>
                  )}
                </div>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>
    </div>
  )
}

export default function WorkflowEditor(props: WorkflowEditorProps) {
  return (
    <ReactFlowProvider>
      <WorkflowEditorContent {...props} />
    </ReactFlowProvider>
  )
}