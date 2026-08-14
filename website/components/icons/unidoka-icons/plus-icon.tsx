import { Icon, IconProps } from "@/components/icons/icon"
export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M25 8V42M8 25H42" stroke="var(--on-bg-high)" strokeWidth="5" strokeLinecap="round"/>
    </Icon>
  )
}
