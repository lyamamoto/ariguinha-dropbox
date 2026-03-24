const modules = import.meta.glob('./*.(svg|png)', { eager: true, import: 'default' })

export const assetIcons: Record<string, string> = Object.fromEntries(
  Object.entries(modules).map(([path, url]) => [
    path.split('/').pop()!.split('.')[0]!.toLowerCase(),
    url as string,
  ])
)
