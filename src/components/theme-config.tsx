"use client"

import { useState, useEffect } from "react"
import { Check, Sun, Moon, Laptop } from "lucide-react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"

// 预定义的颜色主题
const colorThemes = [
  { name: "默认", value: "#0ea5e9", color: "bg-blue-500" },
  { name: "紫色", value: "#8b5cf6", color: "bg-purple-500" },
  { name: "粉色", value: "#ec4899", color: "bg-pink-500" },
  { name: "红色", value: "#ef4444", color: "bg-red-500" },
  { name: "橙色", value: "#f97316", color: "bg-orange-500" },
  { name: "青色", value: "#06b6d4", color: "bg-cyan-500" },
  { name: "绿色", value: "#22c55e", color: "bg-green-500" },
]

export function ThemeConfig({ open, onOpenChange }: { open?: boolean, onOpenChange?: (open: boolean) => void }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // 本地存储圆角半径设置
  const [radius, setRadius] = useState(() => {
    if (typeof window !== "undefined") {
      const savedRadius = localStorage.getItem("ui-radius")
      return savedRadius ? parseFloat(savedRadius) : 0.5
    }
    return 0.5
  })
  
  // 本地存储主题颜色设置
  const [primaryColor, setPrimaryColor] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ui-primary-color") || "#0ea5e9"
    }
    return "#0ea5e9"
  })

  // 确保在客户端渲染后再显示UI
  useEffect(() => {
    setMounted(true)
    
    // 在组件挂载时应用保存的颜色
    if (typeof window !== "undefined") {
      const savedColor = localStorage.getItem("ui-primary-color")
      const savedRadius = localStorage.getItem("ui-radius")
      
      if (savedRadius) {
        const radiusValue = parseFloat(savedRadius)
        document.documentElement.style.setProperty("--radius", `${radiusValue}rem`)
      }
      
      if (savedColor) {
        // 延迟一点执行，等待DOM加载完成
        requestAnimationFrame(() => {
          // 直接调用applyColorStyles函数来立即应用颜色
          const hexToHSL = (hex: string) => {
            // 移除可能的#前缀
            const h = hex.replace('#', '')
            
            // 将hex转换为RGB
            const r = parseInt(h.substring(0, 2), 16) / 255
            const g = parseInt(h.substring(2, 4), 16) / 255
            const b = parseInt(h.substring(4, 6), 16) / 255
            
            const max = Math.max(r, g, b)
            const min = Math.min(r, g, b)
            let h2 = 0, s = 0, l = (max + min) / 2
            
            if (max !== min) {
              const d = max - min
              s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
              
              switch(max) {
                case r: h2 = (g - b) / d + (g < b ? 6 : 0); break
                case g: h2 = (b - r) / d + 2; break
                case b: h2 = (r - g) / d + 4; break
              }
              
              h2 = Math.round(h2 * 60)
            }
            
            s = Math.round(s * 100)
            l = Math.round(l * 100)
            
            return `${h2} ${s}% ${l}%`
          }
          
          // 直接设置颜色
          const applyColorStyles = (hex: string) => {
            // 创建或更新自定义样式表
            let styleElement = document.getElementById('theme-styles') as HTMLStyleElement
            
            if (!styleElement) {
              styleElement = document.createElement('style')
              styleElement.id = 'theme-styles'
              document.head.appendChild(styleElement)
            }
            
            // 从十六进制计算对比色
            const getContrastYIQ = (hexcolor: string) => {
              const r = parseInt(hexcolor.substring(1, 3), 16)
              const g = parseInt(hexcolor.substring(3, 5), 16)
              const b = parseInt(hexcolor.substring(5, 7), 16)
              const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
              return (yiq >= 128) ? '#000000' : '#ffffff'
            }
            
            // 计算文本颜色
            const textColor = getContrastYIQ(hex)
            
            // 设置CSS变量
            const hslColor = hexToHSL(hex)
            
            // 直接覆盖Tailwind类的CSS规则
            const css = `
              :root {
                --primary: ${hslColor};
                --primary-foreground: ${textColor === '#ffffff' ? '0 0% 100%' : '0 0% 0%'};
              }
              
              /* 直接覆盖按钮样式 */
              .bg-primary {
                background-color: ${hex} !important;
              }
              
              .text-primary-foreground {
                color: ${textColor} !important;
              }
              
              .border-primary {
                border-color: ${hex} !important;
              }
              
              /* 为标准按钮添加样式 */
              [data-slot="button"][class*="variant-default"] {
                background-color: ${hex} !important;
                color: ${textColor} !important;
              }
              
              /* 为按钮悬停添加样式 */
              [data-slot="button"][class*="variant-default"]:hover {
                background-color: ${hex}dd !important;
              }
            `
            
            styleElement.textContent = css
          }
          
          applyColorStyles(savedColor)
          setPrimaryColor(savedColor)
        })
      }
    }
  }, [])

  // 更新圆角半径
  useEffect(() => {
    if (mounted) {
      document.documentElement.style.setProperty("--radius", `${radius}rem`)
      localStorage.setItem("ui-radius", radius.toString())
    }
  }, [radius, mounted])

  // 更新主题颜色
  useEffect(() => {
    if (mounted) {
      // 将HEX颜色转换为HSL格式
      const hexToHSL = (hex: string) => {
        // 移除可能的#前缀
        const h = hex.replace('#', '')
        
        // 将hex转换为RGB
        const r = parseInt(h.substring(0, 2), 16) / 255
        const g = parseInt(h.substring(2, 4), 16) / 255
        const b = parseInt(h.substring(4, 6), 16) / 255
        
        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        let h2 = 0, s = 0, l = (max + min) / 2
        
        if (max !== min) {
          const d = max - min
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
          
          switch(max) {
            case r: h2 = (g - b) / d + (g < b ? 6 : 0); break
            case g: h2 = (b - r) / d + 2; break
            case b: h2 = (r - g) / d + 4; break
          }
          
          h2 = Math.round(h2 * 60)
        }
        
        s = Math.round(s * 100)
        l = Math.round(l * 100)
        
        return `${h2} ${s}% ${l}%`
      }
      
      // 更直接的方式应用颜色
      const applyColorStyles = (hex: string) => {
        // 创建或更新自定义样式表
        let styleElement = document.getElementById('theme-styles') as HTMLStyleElement
        
        if (!styleElement) {
          styleElement = document.createElement('style')
          styleElement.id = 'theme-styles'
          document.head.appendChild(styleElement)
        }
        
        // 从十六进制计算对比色
        const getContrastYIQ = (hexcolor: string) => {
          const r = parseInt(hexcolor.substring(1, 3), 16)
          const g = parseInt(hexcolor.substring(3, 5), 16)
          const b = parseInt(hexcolor.substring(5, 7), 16)
          const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
          return (yiq >= 128) ? '#000000' : '#ffffff'
        }
        
        // 计算文本颜色
        const textColor = getContrastYIQ(hex)
        
        // 设置CSS变量
        const hslColor = hexToHSL(hex)
        
        // 直接覆盖Tailwind类的CSS规则
        const css = `
          :root {
            --primary: ${hslColor};
            --primary-foreground: ${textColor === '#ffffff' ? '0 0% 100%' : '0 0% 0%'};
          }
          
          /* 直接覆盖按钮样式 */
          .bg-primary {
            background-color: ${hex} !important;
          }
          
          .text-primary-foreground {
            color: ${textColor} !important;
          }
          
          .border-primary {
            border-color: ${hex} !important;
          }
          
          /* 为标准按钮添加样式 */
          [data-slot="button"][class*="variant-default"] {
            background-color: ${hex} !important;
            color: ${textColor} !important;
          }
          
          /* 为按钮悬停添加样式 */
          [data-slot="button"][class*="variant-default"]:hover {
            background-color: ${hex}dd !important;
          }
        `
        
        styleElement.textContent = css
      }
      
      applyColorStyles(primaryColor)
      localStorage.setItem("ui-primary-color", primaryColor)
    }
  }, [primaryColor, mounted])

  if (!mounted) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button id="theme-config-trigger" variant="ghost" size="icon" className="hidden">
          {theme === "light" ? (
            <Sun className="h-5 w-5" />
          ) : theme === "dark" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Laptop className="h-5 w-5" />
          )}
          <span className="sr-only">主题设置</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>外观风格</DialogTitle>
          <DialogDescription>
            自定义界面主题和外观设置
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="mode" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mode">浅色/深色</TabsTrigger>
            <TabsTrigger value="color">主题色</TabsTrigger>
            <TabsTrigger value="radius">圆角半径</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mode" className="py-4">
            <RadioGroup
              defaultValue={theme}
              onValueChange={(value) => setTheme(value)}
            >
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <RadioGroupItem
                    value="light"
                    id="light"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="light"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Sun className="mb-3 h-6 w-6" />
                    浅色
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="dark"
                    id="dark"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="dark"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Moon className="mb-3 h-6 w-6" />
                    深色
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="system"
                    id="system"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="system"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Laptop className="mb-3 h-6 w-6" />
                    自动
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </TabsContent>
          
          <TabsContent value="color" className="py-4">
            <div className="mb-4">
              <Label>主题颜色</Label>
              <div className="mt-3 grid grid-cols-7 gap-2">
                {colorThemes.map((item) => (
                  <div
                    key={item.value}
                    className={cn(
                      "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full",
                      item.color,
                      primaryColor === item.value && "ring-2 ring-primary ring-offset-2"
                    )}
                    onClick={() => setPrimaryColor(item.value)}
                  >
                    {primaryColor === item.value && (
                      <Check className="h-4 w-4 text-white" />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-col gap-2">
                <Label>预览效果</Label>
                <div className="flex gap-2 mt-2">
                  <Button 
                    variant="default" 
                    style={{
                      backgroundColor: primaryColor,
                      color: primaryColor && ((parseInt(primaryColor.substring(1, 3), 16) * 299 + parseInt(primaryColor.substring(3, 5), 16) * 587 + parseInt(primaryColor.substring(5, 7), 16) * 114) / 1000 >= 128) ? '#000000' : '#ffffff'
                    }}
                  >
                    默认按钮
                  </Button>
                  <Button variant="secondary">次要按钮</Button>
                  <Button 
                    variant="outline" 
                    style={{
                      borderColor: primaryColor,
                    }}
                  >
                    边框按钮
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="radius" className="py-4">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <Label>圆角半径</Label>
                <span className="text-sm text-muted-foreground">{radius}rem</span>
              </div>
              <Slider
                className="mt-3"
                defaultValue={[radius]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={(values) => setRadius(values[0])}
              />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>直角</span>
                <span>圆角</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 