import { useEffect } from 'react'

export function useScrollToTopOnMenu(
  activeSidebarMenu: string,
  targetMenu: string,
  bodyScrollRef: React.RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    if (activeSidebarMenu !== targetMenu) return
    const target = bodyScrollRef.current
    if (!target) return

    target.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto',
    })
  }, [activeSidebarMenu, bodyScrollRef, targetMenu])
}
