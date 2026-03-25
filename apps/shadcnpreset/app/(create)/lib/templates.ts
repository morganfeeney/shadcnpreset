export const TEMPLATES = [
  {
    value: "next",
    title: "Next.js",
    logo: "<svg role='img' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><title>Next.js</title><path d='M18.665 21.978C16.758 23.255 14.465 24 12 24 5.377 24 0 18.623 0 12S5.377 0 12 0s12 5.377 12 12c0 3.583-1.574 6.801-4.067 9.001L9.219 7.2H7.2v9.596h1.615V9.251l9.85 12.727Zm-3.332-8.533 1.6 2.061V7.2h-1.6v6.245Z' fill='currentColor'/></svg>",
  },
  {
    value: "vite",
    title: "Vite",
    logo: "<svg xmlns='http://www.w3.org/2000/svg' width='410' height='404' fill='none' viewBox='0 0 410 404'><path fill='var(--foreground)' d='m399.641 59.525-183.998 329.02c-3.799 6.793-13.559 6.833-17.415.073L10.582 59.556C6.38 52.19 12.68 43.266 21.028 44.76l184.195 32.923c1.175.21 2.378.208 3.553-.006l180.343-32.87c8.32-1.517 14.649 7.337 10.522 14.719'/></svg>",
  },
  {
    value: "react-router",
    title: "React Router",
    logo: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M12.118 5.466a2.306 2.306 0 0 0-.623.08c-.278.067-.702.332-.953.583-.41.423-.49.609-.662 1.469-.08.423.41 1.43.847 1.734.45.317 1.085.502 2.065.608 1.429.16 1.84.636 1.84 2.197 0 1.377-.385 1.747-1.96 1.906-1.707.172-2.58.834-2.765 2.117-.106.781.41 1.76 1.125 2.091 1.627.768 3.15-.198 3.467-2.196.211-1.284.622-1.642 1.998-1.747 1.588-.133 2.409-.675 2.713-1.787.278-1.02-.304-2.157-1.297-2.554-.264-.106-.873-.238-1.35-.291-1.495-.16-1.879-.424-2.038-1.39-.225-1.337-.317-1.562-.794-2.09a2.174 2.174 0 0 0-1.613-.73z' fill='currentColor'/></svg>",
  },
] as const

export type TemplateValue = (typeof TEMPLATES)[number]["value"]

export function getFramework(template: string) {
  return template.replace("-monorepo", "") as TemplateValue
}

export const NO_MONOREPO_FRAMEWORKS = ["laravel"] as const

export function getTemplateValue(framework: string, monorepo: boolean) {
  if (
    NO_MONOREPO_FRAMEWORKS.includes(
      framework as (typeof NO_MONOREPO_FRAMEWORKS)[number]
    )
  ) {
    return framework
  }

  return monorepo ? `${framework}-monorepo` : framework
}
