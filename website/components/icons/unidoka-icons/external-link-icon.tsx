import { Icon, IconProps } from "@/components/icons/icon"
export function ExternalLinkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M30 7H43V20M43 7L18 32" stroke="var(--on-bg-high)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 11H11C8.8 11 7 12.8 7 15V39C7 41.2 8.8 43 11 43H35C37.2 43 39 41.2 39 39V29" stroke="var(--on-bg-high)" strokeWidth="4" strokeLinecap="round"/>
    </Icon>
  )
}
