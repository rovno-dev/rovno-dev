import { Icon, IconProps } from "@/components/icons/icon"
export function DownloadIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M25 5V33M25 33L12 21M25 33L38 21" stroke="var(--on-bg-high)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 42H43" stroke="var(--on-bg-high)" strokeWidth="5" strokeLinecap="round" />
    </Icon>
  )
}
