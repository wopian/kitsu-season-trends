export function usePageMotion() {
  const destination = useState<string | null>('page-motion-destination', () => null)
  const router = useRouter()

  function markDestination(to: string, event: MouseEvent) {
    if (event.defaultPrevented || event.button !== 0 ||
      event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return

    const path = router.resolve(to).path
    destination.value = event.detail > 0 && path !== router.currentRoute.value.path ? path : null
  }

  return { destination, markDestination }
}
