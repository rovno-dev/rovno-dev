import { Icon, IconProps } from "@/components/icons/icon"
export function MenuIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 12H43M7 25H43M7 38H43" stroke="var(--on-bg-high)" strokeWidth="5" strokeLinecap="round"/>
    </Icon>
  )
}
