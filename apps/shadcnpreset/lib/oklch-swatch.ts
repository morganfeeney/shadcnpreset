type ThemeSample = {
  light: {
    primary: string
    chart1: string
    background: string | null
  }
  dark: {
    primary: string
    chart1: string
    background: string | null
  }
}

const THEME_SAMPLES: Record<string, ThemeSample> = {
  neutral: {
    light: {
      primary: "oklch(0.205 0 0)",
      chart1: "oklch(0.87 0 0)",
      background: "oklch(1 0 0)",
    },
    dark: {
      primary: "oklch(0.922 0 0)",
      chart1: "oklch(0.87 0 0)",
      background: "oklch(0.145 0 0)",
    },
  },
  stone: {
    light: {
      primary: "oklch(0.216 0.006 56.043)",
      chart1: "oklch(0.869 0.005 56.366)",
      background: "oklch(1 0 0)",
    },
    dark: {
      primary: "oklch(0.923 0.003 48.717)",
      chart1: "oklch(0.869 0.005 56.366)",
      background: "oklch(0.147 0.004 49.25)",
    },
  },
  zinc: {
    light: {
      primary: "oklch(0.21 0.006 285.885)",
      chart1: "oklch(0.871 0.006 286.286)",
      background: "oklch(1 0 0)",
    },
    dark: {
      primary: "oklch(0.92 0.004 286.32)",
      chart1: "oklch(0.871 0.006 286.286)",
      background: "oklch(0.141 0.005 285.823)",
    },
  },
  mauve: {
    light: {
      primary: "oklch(0.212 0.019 322.12)",
      chart1: "oklch(0.865 0.012 325.68)",
      background: "oklch(1 0 0)",
    },
    dark: {
      primary: "oklch(0.922 0.005 325.62)",
      chart1: "oklch(0.865 0.012 325.68)",
      background: "oklch(0.145 0.008 326)",
    },
  },
  olive: {
    light: {
      primary: "oklch(0.228 0.013 107.4)",
      chart1: "oklch(0.88 0.011 106.6)",
      background: "oklch(1 0 0)",
    },
    dark: {
      primary: "oklch(0.93 0.007 106.5)",
      chart1: "oklch(0.88 0.011 106.6)",
      background: "oklch(0.153 0.006 107.1)",
    },
  },
  mist: {
    light: {
      primary: "oklch(0.218 0.008 223.9)",
      chart1: "oklch(0.872 0.007 219.6)",
      background: "oklch(1 0 0)",
    },
    dark: {
      primary: "oklch(0.925 0.005 214.3)",
      chart1: "oklch(0.872 0.007 219.6)",
      background: "oklch(0.148 0.004 228.8)",
    },
  },
  taupe: {
    light: {
      primary: "oklch(0.214 0.009 43.1)",
      chart1: "oklch(0.868 0.007 39.5)",
      background: "oklch(1 0 0)",
    },
    dark: {
      primary: "oklch(0.922 0.005 34.3)",
      chart1: "oklch(0.868 0.007 39.5)",
      background: "oklch(0.147 0.004 49.3)",
    },
  },
  amber: {
    light: {
      primary: "oklch(0.555 0.163 48.998)",
      chart1: "oklch(0.879 0.169 91.605)",
      background: null,
    },
    dark: {
      primary: "oklch(0.473 0.137 46.201)",
      chart1: "oklch(0.879 0.169 91.605)",
      background: null,
    },
  },
  blue: {
    light: {
      primary: "oklch(0.488 0.243 264.376)",
      chart1: "oklch(0.809 0.105 251.813)",
      background: null,
    },
    dark: {
      primary: "oklch(0.424 0.199 265.638)",
      chart1: "oklch(0.809 0.105 251.813)",
      background: null,
    },
  },
  cyan: {
    light: {
      primary: "oklch(0.52 0.105 223.128)",
      chart1: "oklch(0.865 0.127 207.078)",
      background: null,
    },
    dark: {
      primary: "oklch(0.45 0.085 224.283)",
      chart1: "oklch(0.865 0.127 207.078)",
      background: null,
    },
  },
  emerald: {
    light: {
      primary: "oklch(0.508 0.118 165.612)",
      chart1: "oklch(0.845 0.143 164.978)",
      background: null,
    },
    dark: {
      primary: "oklch(0.432 0.095 166.913)",
      chart1: "oklch(0.845 0.143 164.978)",
      background: null,
    },
  },
  fuchsia: {
    light: {
      primary: "oklch(0.518 0.253 323.949)",
      chart1: "oklch(0.833 0.145 321.434)",
      background: null,
    },
    dark: {
      primary: "oklch(0.452 0.211 324.591)",
      chart1: "oklch(0.833 0.145 321.434)",
      background: null,
    },
  },
  green: {
    light: {
      primary: "oklch(0.532 0.157 131.589)",
      chart1: "oklch(0.871 0.15 154.449)",
      background: null,
    },
    dark: {
      primary: "oklch(0.453 0.124 130.933)",
      chart1: "oklch(0.871 0.15 154.449)",
      background: null,
    },
  },
  indigo: {
    light: {
      primary: "oklch(0.457 0.24 277.023)",
      chart1: "oklch(0.785 0.115 274.713)",
      background: null,
    },
    dark: {
      primary: "oklch(0.398 0.195 277.366)",
      chart1: "oklch(0.785 0.115 274.713)",
      background: null,
    },
  },
  lime: {
    light: {
      primary: "oklch(0.532 0.157 131.589)",
      chart1: "oklch(0.897 0.196 126.665)",
      background: null,
    },
    dark: {
      primary: "oklch(0.453 0.124 130.933)",
      chart1: "oklch(0.897 0.196 126.665)",
      background: null,
    },
  },
  orange: {
    light: {
      primary: "oklch(0.553 0.195 38.402)",
      chart1: "oklch(0.837 0.128 66.29)",
      background: null,
    },
    dark: {
      primary: "oklch(0.47 0.157 37.304)",
      chart1: "oklch(0.837 0.128 66.29)",
      background: null,
    },
  },
  pink: {
    light: {
      primary: "oklch(0.525 0.223 3.958)",
      chart1: "oklch(0.823 0.12 346.018)",
      background: null,
    },
    dark: {
      primary: "oklch(0.459 0.187 3.815)",
      chart1: "oklch(0.823 0.12 346.018)",
      background: null,
    },
  },
  purple: {
    light: {
      primary: "oklch(0.496 0.265 301.924)",
      chart1: "oklch(0.827 0.119 306.383)",
      background: null,
    },
    dark: {
      primary: "oklch(0.438 0.218 303.724)",
      chart1: "oklch(0.827 0.119 306.383)",
      background: null,
    },
  },
  red: {
    light: {
      primary: "oklch(0.505 0.213 27.518)",
      chart1: "oklch(0.808 0.114 19.571)",
      background: null,
    },
    dark: {
      primary: "oklch(0.444 0.177 26.899)",
      chart1: "oklch(0.808 0.114 19.571)",
      background: null,
    },
  },
  rose: {
    light: {
      primary: "oklch(0.514 0.222 16.935)",
      chart1: "oklch(0.81 0.117 11.638)",
      background: null,
    },
    dark: {
      primary: "oklch(0.455 0.188 13.697)",
      chart1: "oklch(0.81 0.117 11.638)",
      background: null,
    },
  },
  sky: {
    light: {
      primary: "oklch(0.5 0.134 242.749)",
      chart1: "oklch(0.828 0.111 230.318)",
      background: null,
    },
    dark: {
      primary: "oklch(0.443 0.11 240.79)",
      chart1: "oklch(0.828 0.111 230.318)",
      background: null,
    },
  },
  teal: {
    light: {
      primary: "oklch(0.511 0.096 186.391)",
      chart1: "oklch(0.855 0.138 181.071)",
      background: null,
    },
    dark: {
      primary: "oklch(0.437 0.078 188.216)",
      chart1: "oklch(0.855 0.138 181.071)",
      background: null,
    },
  },
  violet: {
    light: {
      primary: "oklch(0.491 0.27 292.581)",
      chart1: "oklch(0.811 0.111 293.571)",
      background: null,
    },
    dark: {
      primary: "oklch(0.432 0.232 292.759)",
      chart1: "oklch(0.811 0.111 293.571)",
      background: null,
    },
  },
  yellow: {
    light: {
      primary: "oklch(0.852 0.199 91.936)",
      chart1: "oklch(0.905 0.182 98.111)",
      background: null,
    },
    dark: {
      primary: "oklch(0.795 0.184 86.047)",
      chart1: "oklch(0.905 0.182 98.111)",
      background: null,
    },
  },
}

function resolveThemeEntry(name: string) {
  return THEME_SAMPLES[name] ?? THEME_SAMPLES.neutral
}

export function getThemeSwatchPair(
  themeName: string,
  role: "primary" | "chart1" | "background"
) {
  const entry = resolveThemeEntry(themeName)
  const light = entry.light[role] ?? entry.light.primary
  const dark = entry.dark[role] ?? entry.dark.primary

  return {
    light,
    dark,
  }
}
