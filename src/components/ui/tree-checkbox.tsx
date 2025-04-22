"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronRight, ChevronDown } from "lucide-react"

interface MenuNode {
  id: number
  label: string
  children?: MenuNode[]
}

interface TreeCheckboxProps {
  node: MenuNode
  selectedIds: number[]
  onSelectedChange: (ids: number[]) => void
  level?: number
}

// 递归函数：获取节点及其所有子节点的ID
const getAllChildIds = (node: MenuNode): number[] => {
  const ids = [node.id]
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => {
      ids.push(...getAllChildIds(child))
    })
  }
  return ids
}

// 递归函数：获取父节点ID
const getParentIds = (node: MenuNode, childId: number): number[] => {
  // 如果当前节点没有子节点，返回空数组
  if (!node.children || node.children.length === 0) {
    return []
  }

  // 如果直接子节点中包含childId，返回当前节点ID
  if (node.children.some(child => child.id === childId)) {
    return [node.id]
  }

  // 递归查找子节点
  for (const child of node.children) {
    const parentIds = getParentIds(child, childId)
    if (parentIds.length > 0) {
      // 找到了，将当前节点ID添加到结果中
      return [...parentIds, node.id]
    }
  }

  // 未找到
  return []
}

export function TreeCheckbox({ node, selectedIds, onSelectedChange, level = 0 }: TreeCheckboxProps) {
  const [expanded, setExpanded] = React.useState(true)
  const hasChildren = node.children && node.children.length > 0
  
  // 检查当前节点是否选中
  const isChecked = selectedIds.includes(node.id)
  
  // 检查子节点是否全部选中
  const isIndeterminate = hasChildren && 
    node.children!.some(child => selectedIds.includes(child.id)) &&
    !node.children!.every(child => selectedIds.includes(child.id))

  // 处理节点选择
  const handleNodeSelect = (checked: boolean) => {
    let newSelectedIds = [...selectedIds]
    
    if (checked) {
      // 添加当前节点
      if (!newSelectedIds.includes(node.id)) {
        newSelectedIds.push(node.id)
      }
      
      // 添加所有子节点
      if (hasChildren) {
        const childIds = getAllChildIds(node).filter(id => id !== node.id)
        childIds.forEach(id => {
          if (!newSelectedIds.includes(id)) {
            newSelectedIds.push(id)
          }
        })
      }
    } else {
      // 移除当前节点
      newSelectedIds = newSelectedIds.filter(id => id !== node.id)
      
      // 移除所有子节点
      if (hasChildren) {
        const childIds = getAllChildIds(node).filter(id => id !== node.id)
        newSelectedIds = newSelectedIds.filter(id => !childIds.includes(id))
      }
    }
    
    onSelectedChange(newSelectedIds)
  }
  
  const toggleExpanded = () => setExpanded(!expanded)

  return (
    <div>
      <div className="flex items-center space-x-2 py-1" style={{ paddingLeft: `${level * 20}px` }}>
        {hasChildren && (
          <button type="button" onClick={toggleExpanded} className="p-1 rounded-sm hover:bg-gray-100">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}
        {!hasChildren && <div className="w-6" />}
        <Checkbox 
          id={`tree-node-${node.id}`}
          checked={isChecked} 
          onCheckedChange={handleNodeSelect}
          className={isIndeterminate ? "data-[state=indeterminate]:bg-primary" : ""}
          data-state={isIndeterminate ? "indeterminate" : isChecked ? "checked" : "unchecked"}
        />
        <label
          htmlFor={`tree-node-${node.id}`}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {node.label}
        </label>
      </div>
      
      {hasChildren && expanded && (
        <div className="pl-4">
          {node.children!.map(childNode => (
            <TreeCheckbox
              key={childNode.id}
              node={childNode}
              selectedIds={selectedIds}
              onSelectedChange={onSelectedChange}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
} 