import { Icon, IconProps } from "@/components/icons/icon"
export function MinusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 25H42" stroke="var(--on-bg-high)" strokeWidth="5" strokeLinecap="round"/>
    </Icon>
  )
}
