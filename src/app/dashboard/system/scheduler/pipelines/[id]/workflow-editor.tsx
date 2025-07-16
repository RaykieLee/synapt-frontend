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
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Plus, Save, Play, Settings, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { useQueryClient } from '@tanstack/react-query'

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
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-200 min-w-[200px]">
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
    </div>
  )
}

const nodeTypes: NodeTypes = {
  taskNode: TaskNode,
}

// 默认边类型
const defaultEdgeOptions = {
  animated: true,
  style: { stroke: '#3b82f6', strokeWidth: 2 },
}

interface WorkflowEditorProps {
  pipelineId: string
  tasks: any[]
  flowConfig?: string
  onSave: (flowData: any) => void
}

function WorkflowEditorContent({ pipelineId, tasks, flowConfig, onSave }: WorkflowEditorProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  // 初始化节点和边
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  // 从flowConfig解析初始数据
  useEffect(() => {
    if (flowConfig) {
      try {
        const flowData = JSON.parse(flowConfig)
        if (flowData.nodes) {
          setNodes(flowData.nodes)
        }
        if (flowData.edges) {
          setEdges(flowData.edges)
        }
      } catch (error) {
        console.error('解析流程图配置失败:', error)
        initializeFromTasks()
      }
    } else {
      initializeFromTasks()
    }
  }, [flowConfig, tasks, setNodes, setEdges])

  // 从任务列表初始化节点
  const initializeFromTasks = useCallback(() => {
    if (!tasks || tasks.length === 0) return

    const newNodes: Node[] = tasks.map((task, index) => ({
      id: task.id.toString(),
      type: 'taskNode',
      position: {
        x: 100 + (index % 3) * 250,
        y: 100 + Math.floor(index / 3) * 150
      },
      data: {
        label: task.name || `任务 ${index + 1}`,
        taskId: task.task_id,
        taskType: task.task_type,
        description: task.description,
        status: task.status,
        enabled: task.enabled,
        originalTask: task,
      } as TaskNodeData,
    }))

    // 创建默认的线性连接
    const newEdges: Edge[] = []
    for (let i = 0; i < newNodes.length - 1; i++) {
      newEdges.push({
        id: `e${newNodes[i].id}-${newNodes[i + 1].id}`,
        source: newNodes[i].id,
        target: newNodes[i + 1].id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      })
    }

    setNodes(newNodes)
    setEdges(newEdges)
  }, [tasks, setNodes, setEdges])

  // 处理连接
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds: Edge[]) => addEdge(params, eds)),
    [setEdges]
  )

  // 添加新任务节点
  const addNewTaskNode = useCallback(() => {
    const newNode: Node = {
      id: `task_${Date.now()}`,
      type: 'taskNode',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        label: '新任务',
        taskId: `task_${Date.now()}`,
        taskType: 'custom',
        description: '新添加的任务节点',
        status: 'pending',
        enabled: true,
        isNew: true,
      } as TaskNodeData,
    }
    setNodes((nds: Node[]) => [...nds, newNode])
  }, [setNodes])

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

  return (
    <div className="h-[600px] w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap 
          nodeStrokeWidth={3}
          nodeColor="#3b82f6"
          maskColor="rgba(0, 0, 0, 0.1)"
        />
        
        <Panel position="top-right" className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={addNewTaskNode}
            className="bg-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            添加节点
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={deleteSelectedNode}
            disabled={!selectedNode}
            className="bg-white"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            删除节点
          </Button>
          <Button 
            size="sm" 
            onClick={handleSaveFlow}
            className="bg-white"
          >
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
        </Panel>

        {selectedNode && (
          <Panel position="bottom-left" className="bg-white p-4 rounded-lg shadow-lg max-w-sm">
            <div className="text-sm">
              <div className="font-semibold mb-2">节点详情</div>
              <div className="space-y-1">
                <div><span className="font-medium">名称:</span> {String((selectedNode.data as any).label)}</div>
                <div><span className="font-medium">ID:</span> {String((selectedNode.data as any).taskId)}</div>
                <div><span className="font-medium">类型:</span> {String((selectedNode.data as any).taskType)}</div>
                {(selectedNode.data as any).description && (
                  <div><span className="font-medium">描述:</span> {String((selectedNode.data as any).description)}</div>
                )}
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
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