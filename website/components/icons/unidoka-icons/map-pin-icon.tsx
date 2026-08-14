import { Icon, IconProps } from "@/components/icons/icon"
export function MapPinIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M25 46C25 46 42 32.5 42 19.5C42 10.1 34.4 2.5 25 2.5C15.6 2.5 8 10.1 8 19.5C8 32.5 25 46 25 46Z" stroke="var(--on-bg-high)" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="25" cy="19" r="5" fill="var(--on-bg-high)" />
    </Icon>
  )
}
