import { Icon, IconProps } from "@/components/icons/icon"
export function SettingsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 25H5M38 25H45M25 12V5M25 38V45M15.8 15.8L10.9 10.9M39.1 39.1L34.2 34.2M39.1 10.9L34.2 15.8M15.8 34.2L10.9 39.1" stroke="var(--on-bg-high)" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="25" cy="25" r="7" stroke="var(--on-bg-high)" strokeWidth="4"/>
    </Icon>
  )
}
