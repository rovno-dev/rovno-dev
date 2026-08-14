import { Icon, IconProps } from "@/components/icons/icon"
export function PauseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="10" y="7" width="10" height="36" rx="2" fill="var(--on-bg-high)" />
      <rect x="30" y="7" width="10" height="36" rx="2" fill="var(--on-bg-high)" />
    </Icon>
  )
}
