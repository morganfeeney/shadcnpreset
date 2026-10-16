import type { ComponentProps } from "react"

/** shadcncraft's mark, drawn in the current text colour. */
export function ShadcncraftLogo(props: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 22 22" fill="none" aria-hidden="true" {...props}>
      <path
        d="M21.5184 1.29212V6.96228H8.17855L4.56597 13.0345C4.42461 13.2733 4.16859 13.4178 3.89058 13.4178H0.785341C0.351833 13.4178 0 13.066 0 12.6324V6.96228H7.60211L10.756 1.65809C11.1801 0.943425 11.9498 0.506775 12.7806 0.506775H20.733C21.1665 0.506775 21.5184 0.858608 21.5184 1.29212Z"
        fill="currentColor"
      />
      <path
        d="M0 20.6005V14.9303H13.3398L16.9524 8.85804C17.0937 8.6193 17.3498 8.47479 17.6278 8.47479H20.7346C21.1681 8.47479 21.5199 8.82663 21.5199 9.26013V14.9303H13.9178L10.7639 20.2345C10.3398 20.9492 9.57017 21.3858 8.73928 21.3858H0.785341C0.351833 21.3858 0 21.034 0 20.6005Z"
        fill="currentColor"
      />
    </svg>
  )
}
