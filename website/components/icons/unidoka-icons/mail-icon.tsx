import { Icon, IconProps } from "@/components/icons/icon"
export function MailIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 10H41C43.2 10 45 11.8 45 14V36C45 38.2 43.2 40 41 40H9C6.8 40 5 38.2 5 36V14C5 11.8 6.8 10 9 10Z" stroke="var(--on-bg-high)" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M5 15L25 27L45 15" stroke="var(--on-bg-high)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </Icon>
  )
}
