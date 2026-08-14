import { Icon, IconProps } from "@/components/icons/icon"
export function CreditCardIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="5" y="10" width="40" height="30" rx="6" stroke="var(--on-bg-high)" strokeWidth="4" />
      <path d="M5 20H45" stroke="var(--on-bg-high)" strokeWidth="4" />
      <path d="M12 32H20" stroke="var(--on-bg-high)" strokeWidth="4" strokeLinecap="round" />
    </Icon>
  )
}
