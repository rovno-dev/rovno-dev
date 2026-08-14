import { Icon, IconProps } from "@/components/icons/icon"
export function UserIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M25 25C30.5228 25 35 20.5228 35 15C35 9.47715 30.5228 5 25 5C19.4772 5 15 9.47715 15 15C15 20.5228 19.4772 25 25 25Z" fill="var(--on-bg-high)" />
      <path d="M44 45C44 35.6 35.5 28 25 28C14.5 28 6 35.6 6 45" stroke="var(--on-bg-high)" strokeWidth="4" strokeLinecap="round" />
    </Icon>
  )
}
