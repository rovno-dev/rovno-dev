import { Icon, IconProps } from "@/components/icons/icon"
export function ExitIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 6L26 12L20 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M10 12H26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M10 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M10 12H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="6" y="4" width="6" height="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="6" y="4" width="6" height="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </Icon>
  )
}
