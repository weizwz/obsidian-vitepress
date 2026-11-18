const CODE_ICONS: Record<string, string> = {
  pnpm: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#F9AD00" d="M2 2h6v6H2zm7 0h6v6H9zm7 0h6v6h-6zm0 7h6v6h-6z"/><path fill="#4E4E4E" d="M9 9h6v6H9zm0 7h6v6H9zm7 0h6v6h-6zm-14 0h6v6H2z"/></svg>',
  yarn: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#2C8EBB" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m4.4 14.3c-.6.5-1.5.5-2.1 0-.4-.3-.9-.5-1.5-.5-.6 0-1.1.2-1.5.5-.6.5-1.5.5-2.1 0-.5-.4-.6-1.1-.3-1.7.4-.7.6-1.5.5-2.3-.1-.9-.5-1.7-1.1-2.3-.5-.5-.5-1.3 0-1.8s1.3-.5 1.8 0c.6.6 1.3.9 2.1 1 .8.1 1.6-.1 2.3-.6.6-.4 1.4-.3 1.8.3s.3 1.4-.3 1.8c-.6.4-1 1.1-1 1.9 0 .8.4 1.5 1 1.9.6.4.8 1.2.4 1.8"/></svg>',
  npm: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#CB3837" d="M2 7h20v10H12v2H8v-2H2zm2 2v6h4v-4h2v4h2V9zm8 0v6h2v-4h2v4h2v-4h2v4h2V9z"/></svg>',
  bun: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><ellipse cx="12" cy="13" rx="9" ry="7" fill="#FBF0DF" stroke="#14110F" stroke-width="1.5"/><circle cx="9" cy="12" r="1.2" fill="#14110F"/><circle cx="15" cy="12" r="1.2" fill="#14110F"/><path d="M10.5 14.5q1.5 1 3 0" fill="none" stroke="#DE4E6B" stroke-width="1.5" stroke-linecap="round"/></svg>',
  deno: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="9.5" fill="#121214" stroke="#fff" stroke-width="1"/><path fill="#fff" d="M12 5.5c-3 0-5.2 1.8-5.2 4.3 0 1.3.7 2.4 1.8 3.1v4.6h6.8v-4.2c1-.7 1.8-1.9 1.8-3.5 0-2.5-2.2-4.3-5.2-4.3m-1.7 3.8a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8m3.4 0a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8"/></svg>',
  nodejs:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#5FA04E" d="M12 2 3.5 6.9v9.8L12 21.6l8.5-4.9V6.9zm0 4.2 4.8 2.8v5.6L12 17.4l-4.8-2.8V9z"/></svg>',
  vite: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#646CFF" d="m21.5 4.2-9 16.3c-.2.4-.8.4-1 0L2.5 4.2c-.3-.5.1-1 .6-.9l8.9 1.6c.1 0 .2 0 .3 0l8.6-1.6c.5-.1.9.4.6.9"/><path fill="#FFCA28" d="m16.2 2.5-6.6 1.3c-.2 0-.3.2-.3.4l-.4 6.8c0 .3.2.5.5.4l1.8-.4c.3-.1.6.2.5.5l-.5 2.7c-.1.3.2.6.5.5l1.1-.3c.3-.1.6.2.5.5l-.9 4.2c-.1.4.4.6.7.2l.1-.2 5.4-10.7c.1-.3-.1-.6-.4-.5l-1.9.4c-.3.1-.6-.2-.5-.5l1.2-4.3c.1-.3-.2-.6-.5-.5"/></svg>',
  vitest:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#729B1B" d="M21 5 12 20 3 5l9 2.5z"/><path fill="#FCC72B" d="m14.8 3.2-5 1-.4 5.5 2-.5-.5 4 4.5-6.5-2 .4z"/></svg>',
  webpack:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#8DD6F9" d="M12 2 3.5 6.9v10.2L12 22l8.5-4.9V6.9z"/><path fill="#1C78C0" d="M12 6.2 7 9.1v5.8l5 2.9 5-2.9V9.1z"/></svg>',
  rollup:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#EF3335" d="M17.5 3.5c-2.5-1.5-6.5-1.5-9.5.5C5 6 4 9.5 4 13v7l4-2.5V13c0-2.5 1-4.5 3-5.5 2-1 4.5-.5 5.5 1 1 1.5.5 3.5-1 4.5l-4.5 3v4l6-4c3-2 3.5-6 1.5-9-.3-.5-.6-.9-1-1.5"/></svg>',
  esbuild:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="9.5" fill="#FFCF00"/><path fill="none" stroke="#191919" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="m10 8-4 4 4 4m4-8 4 4-4 4"/></svg>',
  tailwind:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#38BDF8" d="M12 6c-2.7 0-4.3 1.3-5 4 1-1.3 2.2-1.8 3.5-1.5.8.2 1.3.7 1.9 1.4 1 1 2.1 2.1 4.6 2.1 2.7 0 4.3-1.3 5-4-1 1.3-2.2 1.8-3.5 1.5-.8-.2-1.3-.7-1.9-1.4C15.6 7.1 14.5 6 12 6M7 12c-2.7 0-4.3 1.3-5 4 1-1.3 2.2-1.8 3.5-1.5.8.2 1.3.7 1.9 1.4 1 1 2.1 2.1 4.6 2.1 2.7 0 4.3-1.3 5-4-1 1.3-2.2 1.8-3.5 1.5-.8-.2-1.3-.7-1.9-1.4-1-1-2.1-2.1-4.6-2.1"/></svg>',
  ts: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><rect width="20" height="20" x="2" y="2" rx="3" fill="#3178C6"/><path fill="#fff" d="M11 11.5H8.8V19H7v-7.5H4.8V10H11zm1.5 6.8v-1.6c.6.4 1.4.7 2.2.7.9 0 1.3-.3 1.3-.8 0-.6-.5-.8-1.6-1.2-1.4-.5-2.1-1.1-2.1-2.3 0-1.4 1.1-2.3 2.8-2.3.9 0 1.6.2 2.1.4v1.5c-.5-.3-1.2-.5-1.9-.5-.8 0-1.2.3-1.2.8 0 .5.4.7 1.5 1.1 1.5.5 2.3 1.1 2.3 2.4 0 1.4-1 2.4-3 2.4-1 0-1.9-.2-2.4-.6"/></svg>',
  js: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><rect width="20" height="20" x="2" y="2" rx="3" fill="#F7DF1E"/><path fill="#000" d="M11 16.4c0 1.7-1 2.5-2.5 2.5-1.1 0-1.8-.5-2.2-1.3l1.3-.8c.2.4.5.7.9.7.5 0 .8-.2.8-1V10H11zm2.2 1.2 1.3-.8c.3.6.8.9 1.6.9.7 0 1.1-.3 1.1-.8 0-.5-.4-.7-1.3-1.1l-.5-.2c-1.3-.5-2.1-1.2-2.1-2.5 0-1.2.9-2.2 2.4-2.2 1.1 0 1.9.4 2.4 1.3l-1.3.8c-.3-.5-.6-.7-1.1-.7s-.8.3-.8.7c0 .5.3.7 1.2 1.1l.5.2c1.5.6 2.3 1.3 2.3 2.7 0 1.5-1.2 2.4-2.8 2.4-1.6 0-2.6-.7-2.9-1.8"/></svg>',
  react:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="2" fill="#61DAFB"/><g fill="none" stroke="#61DAFB" stroke-width="1.4"><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/></g></svg>',
  vue: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#41B883" d="M2 4h4l6 10.4L18 4h4L12 21z"/><path fill="#35495E" d="M6 4h3.5L12 8.3 14.5 4H18l-6 10.4z"/></svg>',
  svelte:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#FF3E00" d="M18.6 5.2c-1.5-2.1-4.5-2.7-6.8-1.4L6.7 6.9C5 7.9 4 9.7 4.2 11.7c.1.9.5 1.8 1.1 2.4-.4.8-.6 1.7-.4 2.7.4 2 2 3.6 4 3.9 1.2.2 2.4 0 3.4-.6l5.1-3.1c1.7-1 2.7-2.8 2.5-4.8-.1-.9-.5-1.8-1.1-2.4.4-.8.6-1.7.4-2.7-.1-.7-.3-1.3-.6-1.9"/><path fill="#fff" d="M10.4 17.5c-1.2.2-2.4-.5-2.7-1.7-.1-.5 0-1 .2-1.5l.2-.4.4.3c.6.4 1.3.7 2 .8h.2v.3c0 .3.2.6.5.7.3.1.6 0 .9-.2l5.1-3.1c.4-.3.7-.8.6-1.3-.1-.6-.6-1-1.2-.9-.3 0-.6.1-.8.3l-2 1.2c-.6.4-1.4.5-2.1.3-1.4-.3-2.4-1.6-2.2-3 .1-.9.6-1.7 1.4-2.2l5.1-3.1c1.2-.7 2.8-.4 3.6.8.5.7.7 1.6.5 2.4-.1.5-.3.9-.6 1.3l-.2.3-.4-.3c-.6-.4-1.3-.7-2-.8h-.2v-.3c0-.3-.2-.6-.5-.7-.3-.1-.6 0-.9.2L10 9.6c-.4.3-.7.8-.6 1.3.1.6.6 1 1.2.9.3 0 .6-.1.8-.3l2-1.2c.6-.4 1.4-.5 2.1-.3 1.4.3 2.4 1.6 2.2 3-.1.9-.6 1.7-1.4 2.2l-5.1 3.1c-.3.1-.5.2-.8.2"/></svg>',
  solid:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#76B3E1" d="M21 7.5 14 4 4.5 9l7 3.5z"/><path fill="#4F88C6" d="m4.5 9 7 3.5L9 19l-6-3z"/><path fill="#2C4F7C" d="M19.5 14.5 12.5 11 3 16l7 3.5z"/></svg>',
  next: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="10" fill="#000"/><path fill="#fff" d="M9 16V8h1.4l5.4 7.8-.9.8L9.8 9.2V16zm5.5-8h1.3v4.5h-1.3z"/></svg>',
  nuxt: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#00DC82" d="M10.8 4.6c.5-.9 1.9-.9 2.4 0l7.6 13.2c.5.9-.1 2.1-1.2 2.1H4.4c-1.1 0-1.7-1.2-1.2-2.1z"/><path fill="#003543" d="M14.3 9.2c.4-.7 1.4-.7 1.8 0l4.6 8c.4.7-.1 1.6-.9 1.6h-9.2c-.8 0-1.3-.9-.9-1.6z" opacity=".35"/></svg>',
  angular:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#DD0031" d="M12 2 3 5.2l1.4 12L12 22l7.6-4.8 1.4-12z"/><path fill="#C3002F" d="M12 2v20l7.6-4.8 1.4-12z"/><path fill="#fff" d="M12 4.7 6.6 17h2l1.1-2.8h4.6l1.1 2.8h2zm1.5 7.8h-3L12 8.7z"/></svg>',
  astro:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#FF5D01" d="M9.5 17.5c-.7 1.5-.3 3.2 1 4.2-.3-1.1.3-2.2 1.5-2.2s1.8 1.1 1.5 2.2c1.3-1 1.7-2.7 1-4.2l-2.5 1z"/><path fill="#1E1E2E" d="m14.8 3 4.7 13.5-3.2-1.5-1.5-4.5H9.2l-1.5 4.5-3.2 1.5L9.2 3z"/></svg>',
  java: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#5382A1" d="M8.9 16.5s-.9.5.6.7c1.8.2 2.8.2 4.8-.2 0 0 .5.3 1.3.6-4.6 2-10.3-.1-6.7-1.1m-.6-2.3s-1 .7.5.9c2 .2 3.5.2 6.2-.3 0 0 .4.4 1 .6-5.5 1.6-11.6.1-7.7-1.2"/><path fill="#E76F00" d="M13 10.7c1.1 1.3-.3 2.5-.3 2.5s2.9-1.5 1.6-3.4c-1.2-1.8-2.2-2.7 3-5.7 0 0-8.1 2-4.3 6.6m-2.7-8c.2 2.4-2.8 4-2.8 6.4 0 1.4.8 2.4 2.2 3-1-1.3-.4-2.5.7-3.6 1.5-1.4 1.3-3.7-.1-5.8"/><path fill="#5382A1" d="M17.8 18.7c-4.5.9-9.9.7-13.2-.2 0 0 .7.6 4.1.8 5.2.3 13.2-.2 13.4-2.3 0 0-.4.9-4.3 1.7"/></svg>',
  php: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><ellipse cx="12" cy="12" rx="10.5" ry="6" fill="#777BB4"/><path fill="#fff" d="M5.5 14.5 6.6 9h2.2c1.2 0 1.9.6 1.7 1.8-.2 1.3-1.2 2-2.4 2H7l-.3 1.7zm1.8-2.7h.9c.6 0 1-.3 1.1-.9.1-.5-.2-.8-.8-.8h-.9zm3.2 2.7L11.6 9h1.3l-.3 1.5h1c1.1 0 1.6.5 1.4 1.6l-.5 2.4h-1.3l.4-2.1c.1-.5 0-.8-.5-.8h-.9l-.5 2.9zm4.6 0L16.2 9h2.2c1.2 0 1.9.6 1.7 1.8-.2 1.3-1.2 2-2.4 2h-1.1l-.3 1.7zm1.8-2.7h.9c.6 0 1-.3 1.1-.9.1-.5-.2-.8-.8-.8h-.9z"/></svg>',
  py: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#3776AB" d="M11.9 2c-4.5 0-4.2 1.9-4.2 1.9v2h4.3v.6H6S3 6.2 3 10.6c0 4.4 2.6 4.2 2.6 4.2h1.6v-2.1s-.1-2.6 2.5-2.6h4.2s2.4 0 2.4-2.3V4.3S16.6 2 11.9 2M9.5 3.4a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6"/><path fill="#FFD43B" d="M12.1 22c4.5 0 4.2-1.9 4.2-1.9v-2H12v-.6h6s3 .3 3-4.1c0-4.4-2.6-4.2-2.6-4.2h-1.6v2.1s.1 2.6-2.5 2.6h-4.2s-2.4 0-2.4 2.3v3.5S7.4 22 12.1 22m2.4-1.4a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6"/></svg>',
  go: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><text x="2" y="16" font-family="sans-serif" font-weight="bold" font-size="13" fill="#00ADD8">GO</text></svg>',
  rust: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="8" fill="none" stroke="#DEA584" stroke-width="2.5"/><text x="8.5" y="15.5" font-family="sans-serif" font-weight="bold" font-size="10" fill="#DEA584">R</text></svg>',
  c: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#00599C" d="M12 2 3.5 6.9v10.2L12 22l8.5-4.9V6.9z"/><path fill="#fff" d="M15.6 14.3a4.3 4.3 0 1 1 0-4.6l-1.8 1a2.2 2.2 0 1 0 0 2.6z"/></svg>',
  cpp: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#00599C" d="M12 2 3.5 6.9v10.2L12 22l8.5-4.9V6.9z"/><path fill="#fff" d="M12.5 14.3a4 4 0 1 1 0-4.6l-1.6.9a2 2 0 1 0 0 2.8zm2-2.8h1v-1h1v1h1v1h-1v1h-1v-1h-1zm3.2 0h1v-1h1v1h1v1h-1v1h-1v-1h-1z"/></svg>',
  csharp:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#68217A" d="M12 2 3.5 6.9v10.2L12 22l8.5-4.9V6.9z"/><path fill="#fff" d="M13 14.3a4 4 0 1 1 0-4.6l-1.6.9a2 2 0 1 0 0 2.8zm2-3.8h.8v1h1v-1h.8v1h.7v.8h-.7v1h.7v.8h-.7v1h-.8v-1h-1v1H15v-1h-.7v-.8h.7v-1h-.7v-.8h.7zm.8 1.8v1h1v-1z"/></svg>',
  ruby: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#CC342D" d="m17 3 4 4-9 14L3 13l4-10zm-5 14.5L18.5 7l-2.8-2.5H8.3L5.5 7z"/></svg>',
  kotlin: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#7F52FF" d="M3 3h18l-9 9 9 9H3z"/></svg>',
  swift:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><rect width="20" height="20" x="2" y="2" rx="4" fill="#F05138"/><path fill="#fff" d="M18.3 15.2c.6-2-.3-4.6-2.4-6.4 1.3 1.8 1.4 3.8.5 5.1-1.9-1.1-4.3-3.2-6-5.2 1.2 1.8 2.9 3.6 4.7 4.9-2.2-.8-4.8-2.5-6.9-4.6 1.5 2.2 3.7 4.2 6.2 5.3-1.9.7-4.2.5-6.2-.7 1.7 2.2 4.7 3.3 7.4 2.5 1.1-.3 2-.9 2.7-1.6.5.6.8 1.2.9 1.8.4-.7.3-1-.9-1.1"/></svg>',
  dart: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#0175C2" d="M6.5 6.5 14 3l6.5 6.5V19H10L3.5 12.5z"/><path fill="#29B6F6" d="M6.5 6.5 16 16v3H10L3.5 12.5z"/></svg>',
  nginx:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#009639" d="M12 2 3.5 6.9v10.2L12 22l8.5-4.9V6.9z"/><path fill="#fff" d="M8.5 16.5V7.5h1.8l3.7 5.6V7.5h1.5v9h-1.8L10 10.9v5.6z"/></svg>',
  docker:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#2496ED" d="M13 7h2.5v2.5H13zm-3 0h2.5v2.5H10zm-3 0h2.5v2.5H7zm-3 3h2.5v2.5H4zm3 0h2.5v2.5H7zm3 0h2.5v2.5H10zm3 0h2.5v2.5H13zm0-6h2.5v2.5H13zm7.5 7.2c-.5-.3-1.6-.4-2.4-.2-.1-.9-.7-1.7-1.4-2.3l-.3-.2-.2.3c-.4.6-.5 1.6-.1 2.4.2.4.5.7.8.9H3.1l-.1.4c-.2 1.4.1 2.9.9 4.1 1 1.5 2.6 2.3 4.8 2.3 4.6 0 8-2.1 9.6-6 .6 0 2 .1 2.7-1.3 0-.1.1-.2.1-.3l-.1-.1z"/></svg>',
  git: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#F05032" d="M21.4 11.1 12.9 2.6c-.5-.5-1.3-.5-1.8 0L9.3 4.4l2.2 2.2c.5-.2 1.1-.1 1.5.3.4.4.5 1 .3 1.5l2.1 2.1c.5-.2 1.1-.1 1.5.3.6.6.6 1.5 0 2.1s-1.5.6-2.1 0c-.4-.4-.5-1-.3-1.6l-2-2v5.2c.6.3.9.9.9 1.6 0 1-.8 1.7-1.7 1.7s-1.7-.8-1.7-1.7c0-.7.4-1.3 1-1.6V9.2c-.6-.3-1-.9-1-1.6 0-.2 0-.4.1-.6L7.9 4.8 2.6 10.1c-.5.5-.5 1.3 0 1.8l8.5 8.5c.5.5 1.3.5 1.8 0l8.5-8.5c.5-.5.5-1.3 0-1.8"/></svg>',
  env: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><rect width="18" height="18" x="3" y="3" rx="2" fill="#ECD53F"/><path fill="#222" d="M7 9h4v1.5H8.5v1h2.2V13H8.5v1H11v1.5H7zm6 0h1.5l1.5 3.5V9h1.5v6.5H16l-1.5-3.5v3.5H13z"/></svg>',
  json: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#CBCB41" d="M7 4c-1.5 0-2.5 1-2.5 2.5v3c0 .8-.5 1.5-1.5 1.5v2c1 0 1.5.7 1.5 1.5v3C4.5 19 5.5 20 7 20h1v-2H7.2c-.5 0-.7-.3-.7-.8v-3c0-1-.4-1.7-1.2-2.2.8-.5 1.2-1.2 1.2-2.2v-3c0-.5.2-.8.7-.8H8V4zm10 0h-1v2h.8c.5 0 .7.3.7.8v3c0 1 .4 1.7 1.2 2.2-.8.5-1.2 1.2-1.2 2.2v3c0 .5-.2.8-.7.8H16v2h1c1.5 0 2.5-1 2.5-2.5v-3c0-.8.5-1.5 1.5-1.5v-2c-1 0-1.5-.7-1.5-1.5v-3C19.5 5 18.5 4 17 4"/></svg>',
  yaml: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#CB171E" d="M4 4h3l3 5.5L13 4h3l-4.5 8v8h-3v-8z"/></svg>',
  toml: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#9C4221" d="M5 4h3v2H6.8v12H8v2H5zm14 0h-3v2h1.2v12H16v2h3z"/><path fill="#5C5C5C" d="M8.5 8.5h7v2h-2.5v6h-2v-6H8.5z"/></svg>',
  xml: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#E37933" d="m8.5 16.5-4.5-4.5 4.5-4.5 1.4 1.4L6.8 12l3.1 3.1zm7 0L20 12l-4.5-4.5-1.4 1.4 3.1 3.1-3.1 3.1zm-4.8 1.5 2.6-12h1.8l-2.6 12z"/></svg>',
  sql: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><ellipse cx="12" cy="6" rx="8" ry="3" fill="#E38C00"/><path fill="#E38C00" d="M4 9.5v3c0 1.7 3.6 3 8 3s8-1.3 8-3v-3c-1.8 1.2-4.8 1.8-8 1.8s-6.2-.6-8-1.8m0 5v3c0 1.7 3.6 3 8 3s8-1.3 8-3v-3c-1.8 1.2-4.8 1.8-8 1.8s-6.2-.6-8-1.8"/></svg>',
  graphql:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="none" stroke="#E10098" stroke-width="1.5" d="M12 3.5 19.5 7.8v8.4L12 20.5l-7.5-4.3V7.8z"/><path fill="none" stroke="#E10098" stroke-width="1.5" d="m12 3.5 7.5 12.7h-15z"/><circle cx="12" cy="3.5" r="1.6" fill="#E10098"/><circle cx="19.5" cy="7.8" r="1.6" fill="#E10098"/><circle cx="19.5" cy="16.2" r="1.6" fill="#E10098"/><circle cx="12" cy="20.5" r="1.6" fill="#E10098"/><circle cx="4.5" cy="16.2" r="1.6" fill="#E10098"/><circle cx="4.5" cy="7.8" r="1.6" fill="#E10098"/></svg>',
  css: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#264DE4" d="M4 3h16l-1.5 16.5L12 21.5l-6.5-2z"/><path fill="#fff" d="M7.5 7h9l-.3 2.5H10l.2 2h5.7l-.5 5-3.4 1-3.4-1-.2-2h2l.1 1 1.5.4 1.5-.4.2-2H8z"/></svg>',
  scss: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><rect width="20" height="20" x="2" y="2" rx="4" fill="#CD6799"/><text x="4.5" y="15.5" font-family="sans-serif" font-weight="bold" font-size="9.5" fill="#fff">Sass</text></svg>',
  html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="#E34F26" d="M4 3h16l-1.5 16.5L12 21.5l-6.5-2z"/><path fill="#fff" d="M7.5 7h9l-.2 2H9.7l.2 2h6.2l-.5 5.5-3.6 1-3.6-1-.2-2.5h2l.1 1.2 1.7.5 1.7-.5.2-2.2H8z"/></svg>',
  sh: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><rect width="20" height="16" x="2" y="4" rx="2" fill="#4EAA25"/><path fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="m7 9 3 3-3 3m5 0h5"/></svg>',
  md: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><rect width="20" height="14" x="2" y="5" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path fill="currentColor" d="M5 15V9h2l2 2.5L11 9h2v6h-2v-3.5L9 14l-2-2.5V15zm11 0-2.5-3h1.5V9h2v3h1.5z"/></svg>'
}

const KEYWORD_RULES: Array<[RegExp, string]> = [
  [/(?:^|[\s._/-])pnpm(?:$|[\s._/-])/i, 'pnpm'],
  [/(?:^|[\s._/-])yarn(?:$|[\s._/-])/i, 'yarn'],
  [/(?:^|[\s._/-])npm(?:$|[\s._/-])/i, 'npm'],
  [/(?:^|[\s._/-])bun(?:$|[\s._/-])/i, 'bun'],
  [/(?:^|[\s._/-])deno(?:$|[\s._/-])/i, 'deno'],
  [/(?:^|[\s._/-])node(?:js)?(?:$|[\s._/-])/i, 'nodejs'],
  [/(?:^|[\s._/-])vitest(?:$|[\s._/-])/i, 'vitest'],
  [/(?:^|[\s._/-])vite(?:$|[\s._/-])/i, 'vite'],
  [/(?:^|[\s._/-])webpack(?:$|[\s._/-])/i, 'webpack'],
  [/(?:^|[\s._/-])rollup(?:$|[\s._/-])/i, 'rollup'],
  [/(?:^|[\s._/-])esbuild(?:$|[\s._/-])/i, 'esbuild'],
  [/(?:^|[\s._/-])tailwind(?:css)?(?:$|[\s._/-])/i, 'tailwind'],
  [/(?:^|[\s._/-])next(?:\.?js)?(?:$|[\s._/-])/i, 'next'],
  [/(?:^|[\s._/-])nuxt(?:\.?js)?(?:$|[\s._/-])/i, 'nuxt'],
  [/(?:^|[\s._/-])svelte(?:$|[\s._/-])/i, 'svelte'],
  [/(?:^|[\s._/-])solid(?:js)?(?:$|[\s._/-])/i, 'solid'],
  [/(?:^|[\s._/-])angular(?:$|[\s._/-])/i, 'angular'],
  [/(?:^|[\s._/-])astro(?:$|[\s._/-])/i, 'astro'],
  [/(?:^|[\s._/-])react(?:$|[\s._/-])/i, 'react'],
  [/(?:^|[\s._/-])vue(?:$|[\s._/-])/i, 'vue'],
  [/(?:^|[\s._/-])nginx(?:$|[\s._/-])/i, 'nginx'],
  [/(?:^|[\s._/-])docker(?:file|compose)?(?:$|[\s._/-])/i, 'docker'],
  [/(?:^|[\s._/-])\.?git(?:ignore|attributes|modules)?(?:$|[\s._/-])/i, 'git'],
  [/(?:^|[\s._/-])\.env(?:\.|$)/i, 'env']
]

const EXT_TO_ICON: Record<string, string> = {
  ts: 'ts',
  mts: 'ts',
  cts: 'ts',
  js: 'js',
  mjs: 'js',
  cjs: 'js',
  jsx: 'react',
  tsx: 'react',
  vue: 'vue',
  svelte: 'svelte',
  astro: 'astro',
  java: 'java',
  php: 'php',
  py: 'py',
  go: 'go',
  rs: 'rust',
  c: 'c',
  h: 'c',
  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  hpp: 'cpp',
  cs: 'csharp',
  rb: 'ruby',
  kt: 'kotlin',
  kts: 'kotlin',
  swift: 'swift',
  dart: 'dart',
  json: 'json',
  jsonc: 'json',
  json5: 'json',
  yml: 'yaml',
  yaml: 'yaml',
  toml: 'toml',
  xml: 'xml',
  svg: 'xml',
  sql: 'sql',
  gql: 'graphql',
  graphql: 'graphql',
  css: 'css',
  scss: 'scss',
  sass: 'scss',
  less: 'css',
  html: 'html',
  htm: 'html',
  md: 'md',
  mdx: 'md',
  sh: 'sh',
  bash: 'sh',
  zsh: 'sh',
  fish: 'sh',
  conf: 'nginx'
}

const LANG_TO_ICON: Record<string, string> = {
  ts: 'ts',
  typescript: 'ts',
  js: 'js',
  javascript: 'js',
  jsx: 'react',
  tsx: 'react',
  react: 'react',
  vue: 'vue',
  svelte: 'svelte',
  solid: 'solid',
  angular: 'angular',
  astro: 'astro',
  java: 'java',
  php: 'php',
  py: 'py',
  python: 'py',
  go: 'go',
  golang: 'go',
  rs: 'rust',
  rust: 'rust',
  c: 'c',
  cpp: 'cpp',
  'c++': 'cpp',
  cs: 'csharp',
  csharp: 'csharp',
  'c#': 'csharp',
  rb: 'ruby',
  ruby: 'ruby',
  kt: 'kotlin',
  kotlin: 'kotlin',
  swift: 'swift',
  dart: 'dart',
  nginx: 'nginx',
  docker: 'docker',
  dockerfile: 'docker',
  json: 'json',
  jsonc: 'json',
  json5: 'json',
  yml: 'yaml',
  yaml: 'yaml',
  toml: 'toml',
  xml: 'xml',
  svg: 'xml',
  sql: 'sql',
  mysql: 'sql',
  postgresql: 'sql',
  pgsql: 'sql',
  graphql: 'graphql',
  gql: 'graphql',
  css: 'css',
  scss: 'scss',
  sass: 'scss',
  less: 'css',
  html: 'html',
  md: 'md',
  markdown: 'md',
  mdx: 'md',
  sh: 'sh',
  bash: 'sh',
  zsh: 'sh',
  shell: 'sh',
  shellscript: 'sh',
  dotenv: 'env',
  env: 'env'
}

export function getCodeIconSvg(filename: string, lang: string): string | null {
  const name = filename.trim().toLowerCase()
  const l = lang.trim().toLowerCase()

  for (const [pattern, iconKey] of KEYWORD_RULES) {
    if (pattern.test(name)) {
      return CODE_ICONS[iconKey] || null
    }
  }

  const baseName = name.split('/').pop() || name
  const dotIdx = baseName.lastIndexOf('.')
  if (dotIdx !== -1 && dotIdx < baseName.length - 1) {
    const ext = baseName.slice(dotIdx + 1)
    const iconKey = EXT_TO_ICON[ext]
    if (iconKey && CODE_ICONS[iconKey]) {
      return CODE_ICONS[iconKey]
    }
  }

  const langKey = LANG_TO_ICON[l]
  return (langKey && CODE_ICONS[langKey]) || null
}

export function appendCodeIcon(container: HTMLElement, svgStr: string): void {
  const normalized = svgStr.includes('xmlns=') ? svgStr : svgStr.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
  const svgDoc = new DOMParser().parseFromString(normalized, 'image/svg+xml')
  if (svgDoc.documentElement && svgDoc.documentElement.nodeName === 'svg') {
    container.appendChild(container.ownerDocument.importNode(svgDoc.documentElement, true))
  }
}
