import { CircleAlert, CircleCheck } from "lucide-react"

export const statuses = [
  {
    value: "0",
    label: "启用",
    icon: CircleCheck,
  },
  {
    value: "1",
    label: "停用",
    icon: CircleAlert,
  },
]

export const enabledOptions = [
  {
    value: "true",
    label: "启用",
  },
  {
    value: "false",
    label: "禁用",
  },
] 