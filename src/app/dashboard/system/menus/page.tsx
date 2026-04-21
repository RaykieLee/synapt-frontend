"use client"

import * as React from "react"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { 
  Copy, 
  Edit, 
  MoreHorizontal, 
  Plus, 
  Trash,
  ChevronDown,
  ChevronRight,
  Home,
  Settings,
  Users,
  FileText,
  Layers,
  PieChart,
  Bell,
  ShieldAlert,
  Wrench,
  ChevronsUpDown,
  Check,
  FolderTree,
  ListChecks,
  LayoutDashboard,
  Server,
  Database,
  Activity,
  Github,
  Info,
  Lock,
  Mail,
  MessageSquare,
  Search,
  CreditCard,
  Calendar,
  // 新增图标
  UserCheck,
  UserPlus,
  UserMinus,
  Shield,
  ShieldCheck,
  Key,
  Folder,
  FolderOpen,
  FileEdit,
  FilePlus,
  FileCheck,
  FileX,
  Image as ImageIcon,
  Video,
  Music,
  Download,
  Upload,
  Link,
  ExternalLink,
  Settings2,
  Cog,
  Package,
  Package2,
  Truck,
  ShoppingCart,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart,
  LineChart,
  BarChart3,
  Target,
  Award,
  Star,
  Heart,
  Eye,
  EyeOff,
  Camera,
  Mic,
  Phone,
  PhoneCall,
  Smartphone,
  Tablet,
  Monitor,
  Laptop,
  Wifi,
  Globe,
  MapPin,
  Navigation,
  Compass,
  Clock,
  Timer,
  Hourglass,
  Bookmark,
  Tag,
  Tags,
  Hash,
  AtSign,
  Percent,
  Archive,
  Inbox,
  Send,
  Reply,
  Forward,
  RefreshCw,
  RotateCcw,
  Repeat,
  Shuffle,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Zap,
  Sun,
  Moon,
  CloudRain,
  Umbrella,
  Thermometer,
  Battery,
  BatteryLow,
  Cpu,
  HardDrive,
  MemoryStick,
  Printer,
  Keyboard,
  Mouse,
  Headphones,
  Gamepad2,
  Book,
  BookOpen,
  GraduationCap,
  School,
  Building,
  Building2,
  Factory,
  Store,
  Warehouse,
  Car,
  Bus,
  Train,
  Plane,
  Ship,
  Bike,
  Coffee,
  Pizza,
  Apple,
  Gift
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from '@/components/animate-ui/radix/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

// 导入类型和API服务
import { Menu, MenuCreateDto, MenuUpdateDto, ParentMenu } from "@/types/menu"
import { menuApi } from "@/api/menu"

// 添加图标选择组件
const IconSelector = ({ 
  value, 
  onChange 
}: { 
  value: string, 
  onChange: (value: string) => void 
}) => {
  const [open, setOpen] = useState(false);
  
  // 图标映射
  const iconMap: { [key: string]: React.ReactNode } = {
    // 基础图标
    'home': <Home className="h-4 w-4" />,
    'settings': <Settings className="h-4 w-4" />,
    'settings2': <Settings2 className="h-4 w-4" />,
    'cog': <Cog className="h-4 w-4" />,
    'dashboard': <LayoutDashboard className="h-4 w-4" />,
    'layers': <Layers className="h-4 w-4" />,
    'activity': <Activity className="h-4 w-4" />,
    'wrench': <Wrench className="h-4 w-4" />,
    
    // 用户相关
    'users': <Users className="h-4 w-4" />,
    'user-check': <UserCheck className="h-4 w-4" />,
    'user-plus': <UserPlus className="h-4 w-4" />,
    'user-minus': <UserMinus className="h-4 w-4" />,
    
    // 安全权限
    'shield': <Shield className="h-4 w-4" />,
    'shield-alert': <ShieldAlert className="h-4 w-4" />,
    'shield-check': <ShieldCheck className="h-4 w-4" />,
    'lock': <Lock className="h-4 w-4" />,
    'key': <Key className="h-4 w-4" />,
    
    // 文件系统
    'file': <FileText className="h-4 w-4" />,
    'file-edit': <FileEdit className="h-4 w-4" />,
    'file-plus': <FilePlus className="h-4 w-4" />,
    'file-check': <FileCheck className="h-4 w-4" />,
    'file-x': <FileX className="h-4 w-4" />,
    'folder': <Folder className="h-4 w-4" />,
    'folder-open': <FolderOpen className="h-4 w-4" />,
    'folder-tree': <FolderTree className="h-4 w-4" />,
    'archive': <Archive className="h-4 w-4" />,
    
    // 媒体
    'image': <ImageIcon className="h-4 w-4" />,
    'video': <Video className="h-4 w-4" />,
    'music': <Music className="h-4 w-4" />,
    'camera': <Camera className="h-4 w-4" />,
    'mic': <Mic className="h-4 w-4" />,
    
    // 通信
    'mail': <Mail className="h-4 w-4" />,
    'message': <MessageSquare className="h-4 w-4" />,
    'phone': <Phone className="h-4 w-4" />,
    'phone-call': <PhoneCall className="h-4 w-4" />,
    'send': <Send className="h-4 w-4" />,
    'reply': <Reply className="h-4 w-4" />,
    'forward': <Forward className="h-4 w-4" />,
    'inbox': <Inbox className="h-4 w-4" />,
    
    // 导航链接
    'link': <Link className="h-4 w-4" />,
    'external-link': <ExternalLink className="h-4 w-4" />,
    'download': <Download className="h-4 w-4" />,
    'upload': <Upload className="h-4 w-4" />,
    'navigation': <Navigation className="h-4 w-4" />,
    'compass': <Compass className="h-4 w-4" />,
    'map-pin': <MapPin className="h-4 w-4" />,
    'globe': <Globe className="h-4 w-4" />,
    
    // 图表统计
    'chart': <PieChart className="h-4 w-4" />,
    'bar-chart': <BarChart className="h-4 w-4" />,
    'bar-chart3': <BarChart3 className="h-4 w-4" />,
    'line-chart': <LineChart className="h-4 w-4" />,
    'trending-up': <TrendingUp className="h-4 w-4" />,
    'trending-down': <TrendingDown className="h-4 w-4" />,
    'target': <Target className="h-4 w-4" />,
    
    // 商务电商
    'shopping-cart': <ShoppingCart className="h-4 w-4" />,
    'shopping-bag': <ShoppingBag className="h-4 w-4" />,
    'dollar-sign': <DollarSign className="h-4 w-4" />,
    'credit-card': <CreditCard className="h-4 w-4" />,
    'package': <Package className="h-4 w-4" />,
    'package2': <Package2 className="h-4 w-4" />,
    'truck': <Truck className="h-4 w-4" />,
    
    // 设备硬件
    'smartphone': <Smartphone className="h-4 w-4" />,
    'tablet': <Tablet className="h-4 w-4" />,
    'monitor': <Monitor className="h-4 w-4" />,
    'laptop': <Laptop className="h-4 w-4" />,
    'server': <Server className="h-4 w-4" />,
    'database': <Database className="h-4 w-4" />,
    'cpu': <Cpu className="h-4 w-4" />,
    'hard-drive': <HardDrive className="h-4 w-4" />,
    'memory-stick': <MemoryStick className="h-4 w-4" />,
    'printer': <Printer className="h-4 w-4" />,
    'keyboard': <Keyboard className="h-4 w-4" />,
    'mouse': <Mouse className="h-4 w-4" />,
    'headphones': <Headphones className="h-4 w-4" />,
    'gamepad2': <Gamepad2 className="h-4 w-4" />,
    
    // 网络连接
    'wifi': <Wifi className="h-4 w-4" />,
    'battery': <Battery className="h-4 w-4" />,
    'battery-low': <BatteryLow className="h-4 w-4" />,
    'zap': <Zap className="h-4 w-4" />,
    
    // 建筑场所
    'building': <Building className="h-4 w-4" />,
    'building2': <Building2 className="h-4 w-4" />,
    'factory': <Factory className="h-4 w-4" />,
    'store': <Store className="h-4 w-4" />,
    'warehouse': <Warehouse className="h-4 w-4" />,
    'school': <School className="h-4 w-4" />,
    
    // 交通工具
    'car': <Car className="h-4 w-4" />,
    'bus': <Bus className="h-4 w-4" />,
    'train': <Train className="h-4 w-4" />,
    'plane': <Plane className="h-4 w-4" />,
    'ship': <Ship className="h-4 w-4" />,
    'bike': <Bike className="h-4 w-4" />,
    
    // 时间日期
    'calendar': <Calendar className="h-4 w-4" />,
    'clock': <Clock className="h-4 w-4" />,
    'timer': <Timer className="h-4 w-4" />,
    'hourglass': <Hourglass className="h-4 w-4" />,
    
    // 标记分类
    'bookmark': <Bookmark className="h-4 w-4" />,
    'tag': <Tag className="h-4 w-4" />,
    'tags': <Tags className="h-4 w-4" />,
    'hash': <Hash className="h-4 w-4" />,
    'at-sign': <AtSign className="h-4 w-4" />,
    'percent': <Percent className="h-4 w-4" />,
    
    // 操作控制
    'search': <Search className="h-4 w-4" />,
    'list': <ListChecks className="h-4 w-4" />,
    'bell': <Bell className="h-4 w-4" />,
    'eye': <Eye className="h-4 w-4" />,
    'eye-off': <EyeOff className="h-4 w-4" />,
    'refresh-cw': <RefreshCw className="h-4 w-4" />,
    'rotate-ccw': <RotateCcw className="h-4 w-4" />,
    'repeat': <Repeat className="h-4 w-4" />,
    'shuffle': <Shuffle className="h-4 w-4" />,
    
    // 媒体控制
    'play': <Play className="h-4 w-4" />,
    'pause': <Pause className="h-4 w-4" />,
    'skip-back': <SkipBack className="h-4 w-4" />,
    'skip-forward': <SkipForward className="h-4 w-4" />,
    'volume2': <Volume2 className="h-4 w-4" />,
    'volume-x': <VolumeX className="h-4 w-4" />,
    
    // 天气环境
    'sun': <Sun className="h-4 w-4" />,
    'moon': <Moon className="h-4 w-4" />,
    'cloud-rain': <CloudRain className="h-4 w-4" />,
    'umbrella': <Umbrella className="h-4 w-4" />,
    'thermometer': <Thermometer className="h-4 w-4" />,
    
    // 学习教育
    'book': <Book className="h-4 w-4" />,
    'book-open': <BookOpen className="h-4 w-4" />,
    'graduation-cap': <GraduationCap className="h-4 w-4" />,
    
    // 社交评价
    'star': <Star className="h-4 w-4" />,
    'heart': <Heart className="h-4 w-4" />,
    'award': <Award className="h-4 w-4" />,
    'github': <Github className="h-4 w-4" />,
    'info': <Info className="h-4 w-4" />,
    
    // 生活休闲
    'coffee': <Coffee className="h-4 w-4" />,
    'pizza': <Pizza className="h-4 w-4" />,
    'apple': <Apple className="h-4 w-4" />,
    'gift': <Gift className="h-4 w-4" />,
  };
  
  // 获取当前选中的图标
  const selectedIcon = iconMap[value] || <Layers className="h-4 w-4 text-gray-400" />;
  
  return (
    <div className="relative">
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center">
          <div className="mr-2">{selectedIcon}</div>
          <span>{value || "选择图标"}</span>
        </div>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      {open && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-96 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* 基础图标 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">基础图标</h4>
            <div className="grid grid-cols-8 gap-2">
                {['home', 'settings', 'settings2', 'cog', 'dashboard', 'layers', 'activity', 'wrench'].map((key) => (
                <Button
                  key={key}
                  variant="ghost"
                    className={`h-10 w-10 p-0 ${value === key ? "bg-gray-100 border border-gray-300" : ""}`}
                  onClick={() => {
                    onChange(key);
                    setOpen(false);
                  }}
                >
                  <div className="relative">
                      {iconMap[key]}
                    {value === key && (
                      <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-green-500"></div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>

            {/* 用户管理 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">用户管理</h4>
              <div className="grid grid-cols-8 gap-2">
                {['users', 'user-check', 'user-plus', 'user-minus'].map((key) => (
                  <Button
                    key={key}
                    variant="ghost"
                    className={`h-10 w-10 p-0 ${value === key ? "bg-gray-100 border border-gray-300" : ""}`}
                    onClick={() => {
                      onChange(key);
                      setOpen(false);
                    }}
                  >
                    <div className="relative">
                      {iconMap[key]}
                      {value === key && (
                        <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-green-500"></div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* 安全权限 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">安全权限</h4>
              <div className="grid grid-cols-8 gap-2">
                {['shield', 'shield-alert', 'shield-check', 'lock', 'key'].map((key) => (
                  <Button
                    key={key}
                    variant="ghost"
                    className={`h-10 w-10 p-0 ${value === key ? "bg-gray-100 border border-gray-300" : ""}`}
                    onClick={() => {
                      onChange(key);
                      setOpen(false);
                    }}
                  >
                    <div className="relative">
                      {iconMap[key]}
                      {value === key && (
                        <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-green-500"></div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* 文件系统 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">文件系统</h4>
              <div className="grid grid-cols-8 gap-2">
                {['file', 'file-edit', 'file-plus', 'file-check', 'file-x', 'folder', 'folder-open', 'folder-tree', 'archive'].map((key) => (
                  <Button
                    key={key}
                    variant="ghost"
                    className={`h-10 w-10 p-0 ${value === key ? "bg-gray-100 border border-gray-300" : ""}`}
                    onClick={() => {
                      onChange(key);
                      setOpen(false);
                    }}
                  >
                    <div className="relative">
                      {iconMap[key]}
                      {value === key && (
                        <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-green-500"></div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* 图表统计 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">图表统计</h4>
              <div className="grid grid-cols-8 gap-2">
                {['chart', 'bar-chart', 'bar-chart3', 'line-chart', 'trending-up', 'trending-down', 'target'].map((key) => (
                  <Button
                    key={key}
                    variant="ghost"
                    className={`h-10 w-10 p-0 ${value === key ? "bg-gray-100 border border-gray-300" : ""}`}
                    onClick={() => {
                      onChange(key);
                      setOpen(false);
                    }}
                  >
                    <div className="relative">
                      {iconMap[key]}
                      {value === key && (
                        <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-green-500"></div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* 通信联系 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">通信联系</h4>
              <div className="grid grid-cols-8 gap-2">
                {['mail', 'message', 'phone', 'phone-call', 'send', 'reply', 'forward', 'inbox'].map((key) => (
                  <Button
                    key={key}
                    variant="ghost"
                    className={`h-10 w-10 p-0 ${value === key ? "bg-gray-100 border border-gray-300" : ""}`}
                    onClick={() => {
                      onChange(key);
                      setOpen(false);
                    }}
                  >
                    <div className="relative">
                      {iconMap[key]}
                      {value === key && (
                        <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-green-500"></div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* 设备硬件 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">设备硬件</h4>
              <div className="grid grid-cols-8 gap-2">
                {['server', 'database', 'cpu', 'hard-drive', 'smartphone', 'tablet', 'monitor', 'laptop'].map((key) => (
                  <Button
                    key={key}
                    variant="ghost"
                    className={`h-10 w-10 p-0 ${value === key ? "bg-gray-100 border border-gray-300" : ""}`}
                    onClick={() => {
                      onChange(key);
                      setOpen(false);
                    }}
                  >
                    <div className="relative">
                      {iconMap[key]}
                      {value === key && (
                        <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-green-500"></div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* 常用功能 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">常用功能</h4>
              <div className="grid grid-cols-8 gap-2">
                {['search', 'list', 'bell', 'eye', 'eye-off', 'calendar', 'clock', 'bookmark'].map((key) => (
                  <Button
                    key={key}
                    variant="ghost"
                    className={`h-10 w-10 p-0 ${value === key ? "bg-gray-100 border border-gray-300" : ""}`}
                    onClick={() => {
                      onChange(key);
                      setOpen(false);
                    }}
                  >
                    <div className="relative">
                      {iconMap[key]}
                      {value === key && (
                        <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-green-500"></div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function MenusPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  // 状态管理
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [currentMenu, setCurrentMenu] = useState<Menu | null>(null)
  const [expandedMenus, setExpandedMenus] = useState<Set<number>>(new Set())
  
  // 新菜单默认值
  const [newMenu, setNewMenu] = useState<Partial<MenuCreateDto>>({
    menu_name: "",
    parent_id: 0,
    order_num: 0,
    path: "",
    component: "",
    is_frame: 1,
    is_cache: 0,
    menu_type: "M",
    visible: "0",
    status: "0",
    perms: "",
    icon: "#",
    remark: ""
  })

  // 获取菜单列表查询
  const { data: menus = [], isLoading } = useQuery<Menu[]>({
    queryKey: ['menus'],
    queryFn: () => menuApi.getList(),
    staleTime: 5, // 5秒不重新获取数据
  })
  
  // 生成父菜单选项
  const parentMenus = React.useMemo(() => {
    const parentOptions = [{ id: 0, name: "作为一级菜单" }]
    menus
      .filter((menu: Menu) => menu.menu_type !== "F") // 排除按钮类型
      .forEach((menu: Menu) => {
        parentOptions.push({ id: menu.menu_id, name: menu.menu_name })
      })
    return parentOptions
  }, [menus])

  // 添加菜单的mutation
  const addMenuMutation = useMutation({
    mutationFn: (menu: MenuCreateDto) => menuApi.create(menu),
    onSuccess: () => {
      toast({
        title: "添加成功",
        description: "菜单已成功添加",
      })
      setShowAddDialog(false)
      // 重置表单
      setNewMenu({
        menu_name: "",
        parent_id: 0,
        order_num: 0,
        path: "",
        component: "",
        is_frame: 1,
        is_cache: 0,
        menu_type: "M",
        visible: "0",
        status: "0",
        perms: "",
        icon: "#",
        remark: ""
      })
      // 刷新菜单列表
      queryClient.invalidateQueries({ queryKey: ['menus'] })
    },
    onError: (error: Error) => {
      toast({
        title: "添加失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      })
    }
  })

  // 修改菜单的mutation
  const updateMenuMutation = useMutation({
    mutationFn: (data: { menuId: number; menu: MenuUpdateDto }) => 
      menuApi.update(data.menuId, data.menu),
    onSuccess: () => {
      toast({
        title: "更新成功",
        description: "菜单信息已更新",
      })
      setShowEditDialog(false)
      // 刷新菜单列表
      queryClient.invalidateQueries({ queryKey: ['menus'] })
    },
    onError: (error: Error) => {
      toast({
        title: "更新失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      })
    }
  })

  // 删除菜单的mutation
  const deleteMenuMutation = useMutation({
    mutationFn: (menuId: number) => menuApi.delete(menuId),
    onSuccess: () => {
      toast({
        title: "删除成功",
        description: "菜单已删除",
      })
      // 刷新菜单列表
      queryClient.invalidateQueries({ queryKey: ['menus'] })
    },
    onError: (error: Error) => {
      toast({
        title: "删除失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      })
    }
  })

  // 获取菜单详情的查询
  const getMenuDetail = async (menuId: number) => {
    try {
      const data = await menuApi.getDetail(menuId)
      setCurrentMenu(data)
      return data
    } catch (error) {
      console.error("获取菜单详情失败", error)
      toast({
        title: "获取菜单详情失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      })
    }
  }

  // 过滤菜单列表
  const filteredMenus = React.useMemo(() => {
    let result = menus

    // 搜索过滤
    if (searchTerm) {
      result = result.filter(
        (menu) =>
          menu.menu_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (menu.perms && menu.perms.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // 状态过滤
    if (statusFilter !== "all") {
      result = result.filter((menu) => menu.status === statusFilter)
    }

    return result
  }, [menus, searchTerm, statusFilter])

  // 处理搜索输入
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // 添加菜单
  const handleAddMenu = async () => {
    if (!newMenu.menu_name) {
      toast({
        title: "请完善必填信息",
        description: "菜单名称为必填项",
        variant: "destructive",
      })
      return
    }

    addMenuMutation.mutate(newMenu as MenuCreateDto)
  }

  // 添加下级菜单
  const handleAddSubMenu = (parentMenu: Menu) => {
    // 重置表单并设置父菜单
    setNewMenu({
      menu_name: "",
      parent_id: parentMenu.menu_id,
      order_num: 0,
      path: "",
      component: "",
      is_frame: 1,
      is_cache: 0,
      menu_type: "M",
      visible: "0",
      status: "0",
      perms: "",
      icon: "#",
      remark: ""
    })
    setShowAddDialog(true)
  }

  // 打开编辑对话框
  const openEditDialog = async (menu: Menu) => {
    await getMenuDetail(menu.menu_id)
    setShowEditDialog(true)
  }

  // 编辑菜单
  const handleEditMenu = async () => {
    if (!currentMenu || !currentMenu.menu_name) {
      toast({
        title: "请完善必填信息",
        description: "菜单名称为必填项",
        variant: "destructive",
      })
      return
    }

    updateMenuMutation.mutate({
      menuId: currentMenu.menu_id,
      menu: currentMenu as MenuUpdateDto
    })
  }

  // 删除菜单
  const handleDeleteMenu = async (id: number) => {
    if (!confirm("确定要删除此菜单吗？删除后不可恢复。")) {
      return
    }
    deleteMenuMutation.mutate(id)
  }

  // 渲染菜单类型
  const renderMenuType = (type: string) => {
    switch (type) {
      case "M":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">目录</Badge>
      case "C":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">菜单</Badge>
      case "F":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">按钮</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  // 渲染状态徽章
  const renderStatusBadge = (status: string) => {
    if (status === "0") {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">正常</Badge>
    }
    return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">停用</Badge>
  }

  // 渲染可见性
  const renderVisibleBadge = (visible: string) => {
    if (visible === "0") {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">显示</Badge>
    }
    return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">隐藏</Badge>
  }

  // 获取父菜单名称
  const getParentMenuName = (parentId: number) => {
    if (parentId === 0) return "无";
    
    const parent = menus.find(menu => menu.menu_id === parentId);
    return parent ? parent.menu_name : `ID: ${parentId}`;
  }

  // 添加切换展开/折叠的函数
  const toggleMenuExpand = (menuId: number) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
  };

  // 修改树形结构构建函数
  const buildMenuTree = (menus: Menu[]) => {
    const menuMap = new Map<number, Menu & { level: number, children: (Menu & { level: number, children: any[] })[] }>();
    const result: (Menu & { level: number, children: any[] })[] = [];

    // 初始化带层级和子项的菜单对象
    menus.forEach(menu => {
      menuMap.set(menu.menu_id, { ...menu, level: 0, children: [] });
    });

    // 构建树形结构
    menus.forEach(menu => {
      const menuWithLevel = menuMap.get(menu.menu_id)!;
      if (menu.parent_id === 0) {
        // 根菜单
        menuWithLevel.level = 0;
        result.push(menuWithLevel);
      } else {
        // 子菜单
        const parent = menuMap.get(menu.parent_id);
        if (parent) {
          menuWithLevel.level = parent.level + 1;
          parent.children.push(menuWithLevel);
        } else {
          // 找不到父菜单，作为根菜单处理
          menuWithLevel.level = 0;
          result.push(menuWithLevel);
        }
      }
    });

    return result;
  };

  // 修改平铺函数修复类型问题
  const flattenMenuTree = (menuTree: (Menu & { level: number, children: any[] })[]) => {
    const result: (Menu & { level: number, hasChildren?: boolean, isParent?: boolean })[] = [];
    
    const flatten = (menus: (Menu & { level: number, children: any[] })[]) => {
      menus.forEach(menu => {
        const { children, ...rest } = menu;
        const hasChildren = children && children.length > 0;
        
        // 添加是否有子菜单的标记
        result.push({
          ...rest,
          hasChildren,
          isParent: true
        });
        
        // 只有当父菜单展开时才显示子菜单
        if (hasChildren && expandedMenus.has(menu.menu_id)) {
          flatten(children);
        }
      });
    };
    
    flatten(menuTree);
    return result;
  };

  // 渲染菜单图标
  const renderMenuIcon = (icon: string) => {
    // 使用相同的图标映射
    const iconMap: { [key: string]: React.ReactNode } = {
      // 基础图标
      'home': <Home className="h-4 w-4" />,
      'settings': <Settings className="h-4 w-4" />,
      'settings2': <Settings2 className="h-4 w-4" />,
      'cog': <Cog className="h-4 w-4" />,
      'dashboard': <LayoutDashboard className="h-4 w-4" />,
      'layers': <Layers className="h-4 w-4" />,
      'activity': <Activity className="h-4 w-4" />,
      'wrench': <Wrench className="h-4 w-4" />,
      
      // 用户相关
      'users': <Users className="h-4 w-4" />,
      'user-check': <UserCheck className="h-4 w-4" />,
      'user-plus': <UserPlus className="h-4 w-4" />,
      'user-minus': <UserMinus className="h-4 w-4" />,
      
      // 安全权限
      'shield': <Shield className="h-4 w-4" />,
      'shield-alert': <ShieldAlert className="h-4 w-4" />,
      'shield-check': <ShieldCheck className="h-4 w-4" />,
      'lock': <Lock className="h-4 w-4" />,
      'key': <Key className="h-4 w-4" />,
      
      // 文件系统
      'file': <FileText className="h-4 w-4" />,
      'file-edit': <FileEdit className="h-4 w-4" />,
      'file-plus': <FilePlus className="h-4 w-4" />,
      'file-check': <FileCheck className="h-4 w-4" />,
      'file-x': <FileX className="h-4 w-4" />,
      'folder': <Folder className="h-4 w-4" />,
      'folder-open': <FolderOpen className="h-4 w-4" />,
      'folder-tree': <FolderTree className="h-4 w-4" />,
      'archive': <Archive className="h-4 w-4" />,
      
      // 媒体
      'image': <ImageIcon className="h-4 w-4" />,
      'video': <Video className="h-4 w-4" />,
      'music': <Music className="h-4 w-4" />,
      'camera': <Camera className="h-4 w-4" />,
      'mic': <Mic className="h-4 w-4" />,
      
      // 通信
      'mail': <Mail className="h-4 w-4" />,
      'message': <MessageSquare className="h-4 w-4" />,
      'phone': <Phone className="h-4 w-4" />,
      'phone-call': <PhoneCall className="h-4 w-4" />,
      'send': <Send className="h-4 w-4" />,
      'reply': <Reply className="h-4 w-4" />,
      'forward': <Forward className="h-4 w-4" />,
      'inbox': <Inbox className="h-4 w-4" />,
      
      // 导航链接
      'link': <Link className="h-4 w-4" />,
      'external-link': <ExternalLink className="h-4 w-4" />,
      'download': <Download className="h-4 w-4" />,
      'upload': <Upload className="h-4 w-4" />,
      'navigation': <Navigation className="h-4 w-4" />,
      'compass': <Compass className="h-4 w-4" />,
      'map-pin': <MapPin className="h-4 w-4" />,
      'globe': <Globe className="h-4 w-4" />,
      
      // 图表统计
      'chart': <PieChart className="h-4 w-4" />,
      'bar-chart': <BarChart className="h-4 w-4" />,
      'bar-chart3': <BarChart3 className="h-4 w-4" />,
      'line-chart': <LineChart className="h-4 w-4" />,
      'trending-up': <TrendingUp className="h-4 w-4" />,
      'trending-down': <TrendingDown className="h-4 w-4" />,
      'target': <Target className="h-4 w-4" />,
      
      // 商务电商
      'shopping-cart': <ShoppingCart className="h-4 w-4" />,
      'shopping-bag': <ShoppingBag className="h-4 w-4" />,
      'dollar-sign': <DollarSign className="h-4 w-4" />,
      'credit-card': <CreditCard className="h-4 w-4" />,
      'package': <Package className="h-4 w-4" />,
      'package2': <Package2 className="h-4 w-4" />,
      'truck': <Truck className="h-4 w-4" />,
      
      // 设备硬件
      'smartphone': <Smartphone className="h-4 w-4" />,
      'tablet': <Tablet className="h-4 w-4" />,
      'monitor': <Monitor className="h-4 w-4" />,
      'laptop': <Laptop className="h-4 w-4" />,
      'server': <Server className="h-4 w-4" />,
      'database': <Database className="h-4 w-4" />,
      'cpu': <Cpu className="h-4 w-4" />,
      'hard-drive': <HardDrive className="h-4 w-4" />,
      'memory-stick': <MemoryStick className="h-4 w-4" />,
      'printer': <Printer className="h-4 w-4" />,
      'keyboard': <Keyboard className="h-4 w-4" />,
      'mouse': <Mouse className="h-4 w-4" />,
      'headphones': <Headphones className="h-4 w-4" />,
      'gamepad2': <Gamepad2 className="h-4 w-4" />,
      
      // 网络连接
      'wifi': <Wifi className="h-4 w-4" />,
      'battery': <Battery className="h-4 w-4" />,
      'battery-low': <BatteryLow className="h-4 w-4" />,
      'zap': <Zap className="h-4 w-4" />,
      
      // 建筑场所
      'building': <Building className="h-4 w-4" />,
      'building2': <Building2 className="h-4 w-4" />,
      'factory': <Factory className="h-4 w-4" />,
      'store': <Store className="h-4 w-4" />,
      'warehouse': <Warehouse className="h-4 w-4" />,
      'school': <School className="h-4 w-4" />,
      
      // 交通工具
      'car': <Car className="h-4 w-4" />,
      'bus': <Bus className="h-4 w-4" />,
      'train': <Train className="h-4 w-4" />,
      'plane': <Plane className="h-4 w-4" />,
      'ship': <Ship className="h-4 w-4" />,
      'bike': <Bike className="h-4 w-4" />,
      
      // 时间日期
      'calendar': <Calendar className="h-4 w-4" />,
      'clock': <Clock className="h-4 w-4" />,
      'timer': <Timer className="h-4 w-4" />,
      'hourglass': <Hourglass className="h-4 w-4" />,
      
      // 标记分类
      'bookmark': <Bookmark className="h-4 w-4" />,
      'tag': <Tag className="h-4 w-4" />,
      'tags': <Tags className="h-4 w-4" />,
      'hash': <Hash className="h-4 w-4" />,
      'at-sign': <AtSign className="h-4 w-4" />,
      'percent': <Percent className="h-4 w-4" />,
      
      // 操作控制
      'search': <Search className="h-4 w-4" />,
      'list': <ListChecks className="h-4 w-4" />,
      'bell': <Bell className="h-4 w-4" />,
      'eye': <Eye className="h-4 w-4" />,
      'eye-off': <EyeOff className="h-4 w-4" />,
      'refresh-cw': <RefreshCw className="h-4 w-4" />,
      'rotate-ccw': <RotateCcw className="h-4 w-4" />,
      'repeat': <Repeat className="h-4 w-4" />,
      'shuffle': <Shuffle className="h-4 w-4" />,
      
      // 媒体控制
      'play': <Play className="h-4 w-4" />,
      'pause': <Pause className="h-4 w-4" />,
      'skip-back': <SkipBack className="h-4 w-4" />,
      'skip-forward': <SkipForward className="h-4 w-4" />,
      'volume2': <Volume2 className="h-4 w-4" />,
      'volume-x': <VolumeX className="h-4 w-4" />,
      
      // 天气环境
      'sun': <Sun className="h-4 w-4" />,
      'moon': <Moon className="h-4 w-4" />,
      'cloud-rain': <CloudRain className="h-4 w-4" />,
      'umbrella': <Umbrella className="h-4 w-4" />,
      'thermometer': <Thermometer className="h-4 w-4" />,
      
      // 学习教育
      'book': <Book className="h-4 w-4" />,
      'book-open': <BookOpen className="h-4 w-4" />,
      'graduation-cap': <GraduationCap className="h-4 w-4" />,
      
      // 社交评价
      'star': <Star className="h-4 w-4" />,
      'heart': <Heart className="h-4 w-4" />,
      'award': <Award className="h-4 w-4" />,
      'github': <Github className="h-4 w-4" />,
      'info': <Info className="h-4 w-4" />,
      
      // 生活休闲
      'coffee': <Coffee className="h-4 w-4" />,
      'pizza': <Pizza className="h-4 w-4" />,
      'apple': <Apple className="h-4 w-4" />,
      'gift': <Gift className="h-4 w-4" />,
    };

    // 如果图标在映射中，返回对应组件
    if (icon && iconMap[icon]) {
      return iconMap[icon];
    }

    // 默认图标
    return <Layers className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="container mx-auto px-0 py-6 md:px-6">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between space-y-2">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">菜单管理</h2>
          <p className="text-muted-foreground">
            管理系统菜单和权限配置
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader className="px-6 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <Input
                placeholder="搜索菜单名称或权限标识..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full max-w-sm"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="所有状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有状态</SelectItem>
                  <SelectItem value="0">正常</SelectItem>
                  <SelectItem value="1">停用</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  添加菜单
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>添加菜单</DialogTitle>
                  <DialogDescription>
                    {newMenu.parent_id && newMenu.parent_id !== 0 
                      ? `为 "${getParentMenuName(newMenu.parent_id)}" 创建下级菜单`
                      : "创建新的系统菜单"
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="menu-type" className="text-right">
                      菜单类型 *
                    </Label>
                    <div className="col-span-3">
                    <Select 
                      value={newMenu.menu_type} 
                      onValueChange={(value) => {
                        setNewMenu({ 
                          ...newMenu, 
                          menu_type: value,
                          // 重置与类型相关的字段
                          path: value === "F" ? "" : newMenu.path,
                          component: value === "F" ? "" : newMenu.component
                        })
                      }}
                    >
                        <SelectTrigger className="w-full">
                        <SelectValue placeholder="选择菜单类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">目录</SelectItem>
                        <SelectItem value="C">菜单</SelectItem>
                        <SelectItem value="F">按钮</SelectItem>
                      </SelectContent>
                    </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="parent-menu" className="text-right">
                      上级菜单
                    </Label>
                    <div className="col-span-3">
                    <Select 
                      value={newMenu.parent_id?.toString()} 
                      onValueChange={(value) => setNewMenu({ ...newMenu, parent_id: parseInt(value) })}
                    >
                        <SelectTrigger className="w-full">
                        <SelectValue placeholder="选择上级菜单" />
                      </SelectTrigger>
                      <SelectContent>
                        {parentMenus.map(menu => (
                          <SelectItem key={menu.id} value={menu.id.toString()}>
                            {menu.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="menu-name" className="text-right">
                      菜单名称 *
                    </Label>
                    <Input
                      id="menu-name"
                      value={newMenu.menu_name}
                      onChange={(e) => setNewMenu({ ...newMenu, menu_name: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="order-num" className="text-right">
                      显示顺序
                    </Label>
                    <Input
                      id="order-num"
                      type="number"
                      value={newMenu.order_num?.toString()}
                      onChange={(e) => setNewMenu({ ...newMenu, order_num: parseInt(e.target.value) || 0 })}
                      className="col-span-3"
                    />
                  </div>
                  {newMenu.menu_type !== "F" && (
                    <>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="path" className="text-right">
                          路由地址
                        </Label>
                        <Input
                          id="path"
                          value={newMenu.path}
                          onChange={(e) => setNewMenu({ ...newMenu, path: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      {newMenu.menu_type === "C" && (
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="component" className="text-right">
                            组件路径
                          </Label>
                          <Input
                            id="component"
                            value={newMenu.component || ""}
                            onChange={(e) => setNewMenu({ ...newMenu, component: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                      )}
                    </>
                  )}
                  {newMenu.menu_type === "F" && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="perms" className="text-right">
                        权限标识
                      </Label>
                      <Input
                        id="perms"
                        value={newMenu.perms || ""}
                        onChange={(e) => setNewMenu({ ...newMenu, perms: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">
                      状态
                    </Label>
                    <div className="col-span-3">
                    <Select 
                      value={newMenu.status} 
                      onValueChange={(value) => setNewMenu({ ...newMenu, status: value })}
                    >
                        <SelectTrigger className="w-full">
                        <SelectValue placeholder="选择状态" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">正常</SelectItem>
                        <SelectItem value="1">停用</SelectItem>
                      </SelectContent>
                    </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="icon" className="text-right">
                      菜单图标
                    </Label>
                    <div className="col-span-3">
                      <IconSelector
                        value={newMenu.icon || ""}
                        onChange={(value) => setNewMenu({ ...newMenu, icon: value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="remark" className="text-right pt-2">
                      备注
                    </Label>
                    <Textarea
                      id="remark"
                      value={newMenu.remark || ""}
                      onChange={(e) => setNewMenu({ ...newMenu, remark: e.target.value })}
                      className="col-span-3"
                      rows={3}
                      placeholder="请输入备注信息..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">取消</Button>
                  </DialogClose>
                  <Button 
                    onClick={handleAddMenu} 
                    disabled={!newMenu.menu_name}
                  >
                    确认添加
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>菜单名称</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>排序</TableHead>
                  <TableHead>权限标识</TableHead>
                  <TableHead>路径</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>备注</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMenus.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      没有找到符合条件的菜单
                    </TableCell>
                  </TableRow>
                ) : (
                  flattenMenuTree(buildMenuTree(filteredMenus)).map((menu) => (
                    <TableRow key={menu.menu_id}>
                      <TableCell className="font-medium">
                        <div 
                          className="flex items-center" 
                          style={{ paddingLeft: `${menu.level * 20}px` }}
                        >
                          {menu.hasChildren && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 mr-1"
                              onClick={() => toggleMenuExpand(menu.menu_id)}
                            >
                              {expandedMenus.has(menu.menu_id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </Button>
                          )}
                          {!menu.hasChildren && menu.level > 0 && (
                            <div className="w-6 mr-1"></div>
                          )}
                          {renderMenuIcon(menu.icon)}
                          <span className="ml-2">{menu.menu_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{renderMenuType(menu.menu_type)}</TableCell>
                      <TableCell>{menu.order_num}</TableCell>
                      <TableCell>{menu.perms || "-"}</TableCell>
                      <TableCell>{menu.path || "-"}</TableCell>
                      <TableCell>{renderStatusBadge(menu.status)}</TableCell>
                      <TableCell className="max-w-[150px] truncate" title={menu.remark || "-"}>{menu.remark || "-"}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(menu)}>
                              <Edit className="mr-2 h-4 w-4" />
                              编辑
                            </DropdownMenuItem>
                            {menu.menu_type !== "F" && (
                              <DropdownMenuItem onClick={() => handleAddSubMenu(menu)}>
                                <Plus className="mr-2 h-4 w-4" />
                                添加下级菜单
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(menu.menu_id.toString())}>
                              <Copy className="mr-2 h-4 w-4" />
                              复制ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteMenu(menu.menu_id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 编辑菜单对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>编辑菜单</DialogTitle>
            <DialogDescription>
              修改菜单信息
            </DialogDescription>
          </DialogHeader>
          {currentMenu && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-menu-type" className="text-right">
                  菜单类型 *
                </Label>
                <div className="col-span-3">
                <Select 
                  value={currentMenu.menu_type} 
                  onValueChange={(value) => {
                    setCurrentMenu({ 
                      ...currentMenu, 
                      menu_type: value,
                      // 重置与类型相关的字段
                      path: value === "F" ? "" : currentMenu.path,
                      component: value === "F" ? "" : currentMenu.component
                    })
                  }}
                >
                    <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择菜单类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">目录</SelectItem>
                    <SelectItem value="C">菜单</SelectItem>
                    <SelectItem value="F">按钮</SelectItem>
                  </SelectContent>
                </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-parent-menu" className="text-right">
                  上级菜单
                </Label>
                <div className="col-span-3">
                <Select 
                  value={currentMenu.parent_id.toString()} 
                  onValueChange={(value) => setCurrentMenu({ ...currentMenu, parent_id: parseInt(value) })}
                >
                    <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择上级菜单" />
                  </SelectTrigger>
                  <SelectContent>
                    {parentMenus.map(menu => (
                      <SelectItem key={menu.id} value={menu.id.toString()}>
                        {menu.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-menu-name" className="text-right">
                  菜单名称 *
                </Label>
                <Input
                  id="edit-menu-name"
                  value={currentMenu.menu_name}
                  onChange={(e) => setCurrentMenu({ ...currentMenu, menu_name: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-order-num" className="text-right">
                  显示顺序
                </Label>
                <Input
                  id="edit-order-num"
                  type="number"
                  value={currentMenu.order_num.toString()}
                  onChange={(e) => setCurrentMenu({ ...currentMenu, order_num: parseInt(e.target.value) || 0 })}
                  className="col-span-3"
                />
              </div>
              {currentMenu.menu_type !== "F" && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-path" className="text-right">
                      路由地址
                    </Label>
                    <Input
                      id="edit-path"
                      value={currentMenu.path}
                      onChange={(e) => setCurrentMenu({ ...currentMenu, path: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  {currentMenu.menu_type === "C" && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-component" className="text-right">
                        组件路径
                      </Label>
                      <Input
                        id="edit-component"
                        value={currentMenu.component || ""}
                        onChange={(e) => setCurrentMenu({ ...currentMenu, component: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                  )}
                </>
              )}
              {currentMenu.menu_type === "F" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-perms" className="text-right">
                    权限标识
                  </Label>
                  <Input
                    id="edit-perms"
                    value={currentMenu.perms || ""}
                    onChange={(e) => setCurrentMenu({ ...currentMenu, perms: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-icon" className="text-right">
                  菜单图标
                </Label>
                <div className="col-span-3">
                  <IconSelector
                    value={currentMenu.icon || ""}
                    onChange={(value) => setCurrentMenu({ ...currentMenu, icon: value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-remark" className="text-right pt-2">
                  备注
                </Label>
                <Textarea
                  id="edit-remark"
                  value={currentMenu.remark || ""}
                  onChange={(e) => setCurrentMenu({ ...currentMenu, remark: e.target.value })}
                  className="col-span-3"
                  rows={3}
                  placeholder="请输入备注信息..."
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  状态
                </Label>
                <div className="col-span-3">
                <Select 
                  value={currentMenu.status} 
                  onValueChange={(value) => setCurrentMenu({ ...currentMenu, status: value })}
                >
                    <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">正常</SelectItem>
                    <SelectItem value="1">停用</SelectItem>
                  </SelectContent>
                </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">取消</Button>
            </DialogClose>
            <Button 
              onClick={handleEditMenu} 
              disabled={!currentMenu || !currentMenu.menu_name}
            >
              保存修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
} 