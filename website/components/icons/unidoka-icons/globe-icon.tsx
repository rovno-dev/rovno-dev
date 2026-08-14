import { Icon, IconProps } from "@/components/icons/icon"
export function GlobeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="25" cy="25" r="20" stroke="var(--on-bg-high)" strokeWidth="4" />
      <ellipse cx="25" cy="25" rx="8" ry="20" stroke="var(--on-bg-high)" strokeWidth="3" />
      <path d="M5 25H45" stroke="var(--on-bg-high)" strokeWidth="3" />
    </Icon>
  )
}
