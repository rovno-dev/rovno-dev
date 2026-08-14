import { Icon, IconProps } from "@/components/icons/icon"
export function LockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M38 18H36V14C36 8.5 31.5 4 26 4C20.5 4 16 8.5 16 14V18H14C11.8 18 10 19.8 10 22V40C10 42.2 11.8 44 14 44H38C40.2 44 42 42.2 42 40V22C42 19.8 40.2 18 38 18ZM20 14C20 10.7 22.7 8 26 8C29.3 8 32 10.7 32 14V18H20V14ZM26 35C23.8 35 22 33.2 22 31C22 28.8 23.8 27 26 27C28.2 27 30 28.8 30 31C30 33.2 28.2 35 26 35Z" fill="var(--on-bg-high)" />
    </Icon>
  )
}
