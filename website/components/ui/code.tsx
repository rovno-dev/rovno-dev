import { ReactNode } from "react"

export interface CodeProps {
  children: ReactNode
}

export default function Code({ children }: CodeProps) {
  return (
    <p className="text-sm text-muted-foreground font-mono bg-muted/40 p-2 rounded">{children}</p>
  )
}