import { Icon, IconProps } from "@/components/icons/icon"
export function HomeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M25 7L7 21V41C7 42.1 7.9 43 9 43H18V31H32V43H41C42.1 43 43 42.1 43 41V21L25 7Z" fill="var(--on-bg-high)" />
    </Icon>
  )
}
