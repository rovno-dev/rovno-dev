import { Icon, IconProps } from "@/components/icons/icon"
export function CalendarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="7" y="10" width="36" height="34" rx="4" stroke="var(--on-bg-high)" strokeWidth="4" />
      <path d="M7 20H43M15 6V14M35 6V14" stroke="var(--on-bg-high)" strokeWidth="4" strokeLinecap="round" />
    </Icon>
  )
}
