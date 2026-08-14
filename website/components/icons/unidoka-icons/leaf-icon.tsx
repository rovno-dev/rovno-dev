import { Icon, IconProps } from "@/components/icons/icon"
export function LeafIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 46C4 46 4 30 18 18C32 6 46 4 46 4C46 4 44 18 32 32C18 46 4 46 4 46Z" fill="var(--on-bg-high)" />
      <path d="M4 46L25 25" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round" />
    </Icon>
  )
}
