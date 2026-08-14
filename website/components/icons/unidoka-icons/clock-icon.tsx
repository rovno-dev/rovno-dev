import { Icon, IconProps } from "@/components/icons/icon"
export function ClockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="25" cy="25" r="20" stroke="var(--on-bg-high)" strokeWidth="4" />
      <path d="M25 12V25L34 32" stroke="var(--on-bg-high)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  )
}
