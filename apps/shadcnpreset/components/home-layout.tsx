import { ReactNode } from "react"

export function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-slot="layout"
      className="group/layout section-soft relative z-10 mx-auto grid w-full max-w-[1800px] gap-(--gap) p-(--gap) [--gap:--spacing(4)] md:[--gap:--spacing(6)] 2xl:[--customizer-width:--spacing(56)]"
    >
      {children}
    </div>
  )
}
