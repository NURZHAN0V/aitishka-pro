const SECTION_ROOTS = ['/articles', '/media']

export function isNavLinkActive(currentPath: string, to: string): boolean {
  if (SECTION_ROOTS.includes(to))
    return currentPath === to || currentPath.startsWith(`${to}/`)

  return currentPath === to
}
