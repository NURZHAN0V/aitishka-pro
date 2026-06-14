const icons: Record<string, string> = {
  'arrow-right': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13.172 12 8.222 7.05l1.415-1.414L16 12l-6.364 6.364-1.414-1.415z"/></svg>',
  'arrow-down': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 13.172 7.05 8.222 5.636 9.636 12 16l6.364-6.364-1.414-1.414z"/></svg>',
  'arrow-right-drop': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="m10 15.586-3.293-3.293-1.414 1.414L10 18.414l9.707-9.707-1.414-1.414z"/></svg>',
  'arrow-left-drop': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14 8.586 10.707 12 14 15.414 12.586 16.828 8 12.243l4.586-4.586z"/></svg>',
  'menu': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4h18v2H3zm0 7h18v2H3zm0 7h18v2H3z"/></svg>',
  'close': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="m12 10.586 4.95-4.95 1.414 1.414L13.414 12l4.95 4.95-1.414 1.414L12 13.414l-4.95 4.95-1.414-1.414L10.586 12 5.636 7.05 7.05 5.636z"/></svg>',
  'article': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 22H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1m-1-2V4H5v16zM7 6h4v4H7zm0 6h10v2H7zm0 4h10v2H7zm6-9h4v2h-4z"/></svg>',
  'video': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3.993C3 3.445 3.445 3 3.993 3h16.014c.548 0 .993.445.993.993v16.014a.994.994 0 0 1-.993.993H3.993A.993.993 0 0 1 3 20.007zm10 5.504 4.847 3.11a.5.5 0 0 1 0 .848L13 16.493z"/></svg>',
  'graduation': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 1 9l4 2.18V17l3-1.73V12.18L12 15l8-4.5V8h2v7.09l2 1.09V9l3-1.65zm6.82 11.62L12 19.72 5.18 14.6 12 11.28z"/></svg>',
  'support': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12v4.143C2 17.167 2.897 18 4 18h1a1 1 0 0 0 1-1v-5.143a1 1 0 0 0-1-1h-.908C4.648 6.987 7.978 4 12 4s7.352 2.987 7.908 6.857H19a1 1 0 0 0-1 1V18c0 1.103-.897 2-2 2h-1v-1h-4v-3h2v-1h-4v-2h4v-1h-2V9h5a7 7 0 1 0-14 0h2a5 5 0 1 1 10 0z"/></svg>',
  'telegram': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.357 10.532-6.648c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/></svg>',
  'phone': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9.366 10.682a10.556 10.556 0 0 0 3.952 3.952l.884-1.238a1 1 0 0 1 1.294-.296 11.422 11.422 0 0 0 4.583 1.364 1 1 0 0 1 .92.919l.807 5.993a1 1 0 0 1-.877.986 18.633 18.633 0 0 1-7.557-2.303 17.566 17.566 0 0 1-5.562-5.562 18.633 18.633 0 0 1-2.303-7.557 1 1 0 0 1 .986-.877l5.994.807a1 1 0 0 1 .919.92 11.422 11.422 0 0 0 1.365 4.583 1 1 0 0 1-.296 1.294z"/></svg>',
  'mail': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1m17 4.238-7.928 7.1L4 7.216V19h16zM4.511 5l7.55 6.662L19.502 5z"/></svg>',
  'map-pin': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20.9 4.5 13.5a7.5 7.5 0 1 1 15 0zm0-2.828 5.964-5.964a5.5 5.5 0 1 0-11.928 0zM12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4"/></svg>',
  'calendar': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 1h2v2H9zm4 0h2v2h-2zM4 7h16v14H4zm2 2v10h12V9z"/></svg>',
  'links': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17 17H7V7h10zm-4-2V9H9v6zM7 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/></svg>',
  'chevron-up': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="m12 10.828 5.657 5.657-1.414 1.414L12 13.657l-4.243 4.242-1.414-1.414z"/></svg>',
}

export function getIcon(name: string): string {
  return icons[name] ?? ''
}
