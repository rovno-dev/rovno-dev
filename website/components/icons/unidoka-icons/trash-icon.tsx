import { Icon, IconProps } from "@/components/icons/icon"
export function TrashIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10 40C10 42.2 11.8 44 14 44H36C38.2 44 40 42.2 40 40V12H10V40ZM43 7H34.5L31.5 4H18.5L15.5 7H7V10H43V7Z" fill="var(--on-bg-high)" />
    </Icon>
  )
}
