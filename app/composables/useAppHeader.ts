export interface HeaderAction {
  icon?: string
  trailingIcon?: string
  label?: string
  onClick: () => void
}

interface HeaderState {
  title: string
  subtitle?: string
  subtitleStatus?: 'online' | 'offline'
  greeting?: string
  actions: HeaderAction[]
}

export const useAppHeader = () => {
  const state = useState<HeaderState>('app-header', () => ({
    title: '',
    actions: []
  }))

  const setHeader = (config: Partial<HeaderState>) => {
    state.value = {
      title: config.title ?? '',
      greeting: config.greeting,
      subtitle: config.subtitle,
      subtitleStatus: config.subtitleStatus,
      actions: config.actions ?? []
    }
  }

  return { headerState: state, setHeader }
}
