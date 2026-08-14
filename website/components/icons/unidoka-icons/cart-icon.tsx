import { Icon, IconProps } from "@/components/icons/icon"
export function CartIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 4H11L14 30H38L42 12H15" stroke="var(--on-bg-high)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="18" cy="40" r="4" fill="var(--on-bg-high)" />
      <circle cx="35" cy="40" r="4" fill="var(--on-bg-high)" />
    </Icon>
  )
}
