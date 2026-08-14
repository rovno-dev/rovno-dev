import { Icon, IconProps } from "@/components/icons/icon"
export function MicIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="17" y="4" width="16" height="26" rx="8" stroke="var(--on-bg-high)" strokeWidth="4" />
      <path d="M8 20C8 29.3 15.6 37 25 37C34.4 37 42 29.3 42 20" stroke="var(--on-bg-high)" strokeWidth="4" strokeLinecap="round" />
      <path d="M25 37V46M15 46H35" stroke="var(--on-bg-high)" strokeWidth="4" strokeLinecap="round" />
    </Icon>
  )
}
