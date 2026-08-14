import { Icon, IconProps } from "@/components/icons/icon"
export function CameraIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="5" y="14" width="40" height="28" rx="6" stroke="var(--on-bg-high)" strokeWidth="4" />
      <path d="M16 14L19 8H31L34 14" stroke="var(--on-bg-high)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="25" cy="28" r="7" stroke="var(--on-bg-high)" strokeWidth="4" />
    </Icon>
  )
}
