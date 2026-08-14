import { Icon, IconProps } from "@/components/icons/icon"
export function PhoneIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14.5 4C11.5 4 9 6.5 9 9.5V40.5C9 43.5 11.5 46 14.5 46H35.5C38.5 46 41 43.5 41 40.5V9.5C41 6.5 38.5 4 35.5 4H14.5Z" stroke="var(--on-bg-high)" strokeWidth="4" />
      <path d="M22 41H28" stroke="var(--on-bg-high)" strokeWidth="4" strokeLinecap="round" />
    </Icon>
  )
}
