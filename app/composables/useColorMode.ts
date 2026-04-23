export function useColorMode() {
  const isDark = useState('colorMode', () => false)

  function apply(dark: boolean) {
    document.documentElement.dataset.theme = dark ? 'dark' : ''
  }

  function toggle() {
    isDark.value = !isDark.value
    apply(isDark.value)
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  function init() {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = saved ? saved === 'dark' : prefersDark
    apply(isDark.value)
  }

  return { isDark, toggle, init }
}
