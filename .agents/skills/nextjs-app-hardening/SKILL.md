---
name: nextjs-app-hardening
description: Guidelines and code patterns to secure Next.js applications, decouple admin/client views, block front-end inspect element/F12 key events, clear client console logs, and fix autocomplete styling in dark-mode inputs.
---

# Next.js Application Hardening & Security

## Overview
This skill provides developer rules and configuration snippets to secure Next.js applications, manage admin routing scopes, disable developer inspect-element capabilities, and resolve dark-theme browser autofill styling issues.

## Dependencies
- `make-interfaces-feel-better` — Referenced for form design principles, text-wrap balancing, and scale-on-press presets.

## Quick Start
To secure a Next.js portal page from client inspection and direct URL bypasses, follow these steps:
1. Append the restricted route paths to `src/middleware.ts` to enforce session verification checks.
2. Install the event listeners in your global client layout wrapper to disable context menus and DevTools keyboard shortcuts.
3. Add autofill webkit CSS overrides to `src/app/globals.css`.

---

## Workflow (Instruction-Only)

### 1. Configure Middleware Route Security
Ensure all admin-only dashboard views are matched and redirected:
- Update `src/middleware.ts` config to match the paths:
```typescript
export const config = {
  matcher: [
    '/portal/:path*',
    '/roster/:path*',
    '/schedule/:path*',
    '/analytics/:path*',
    '/wallet/:path*',
    '/profile/:path*',
  ],
}
```
- Validate both user session checks and system local administrator cookie/storage sessions:
```typescript
const isAdminSession = request.cookies.get('evolve-admin-session')?.value === 'true';
if (isProtectedRoute && !user && !isAdminSession) {
  return NextResponse.redirect(new URL('/admin', request.url));
}
```

### 2. Implement Frontend Inspector Prevention
Add event listeners to the global client layout wrapper (`ThemeLayoutWrapper.tsx`) to suppress element inspection:
- **Right-Click Block:**
```typescript
const handleContextMenu = (e: MouseEvent) => e.preventDefault();
document.addEventListener('contextmenu', handleContextMenu);
```
- **Inspect Key Combos Block:**
```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
    (e.ctrlKey && e.key === 'u')
  ) {
    e.preventDefault();
  }
};
document.addEventListener('keydown', handleKeyDown);
```
- **Console Wiping Interval:**
```typescript
const interval = setInterval(() => console.clear(), 1000);
```

### 3. Resolve Dark Mode Autofill Visibility Leaks
Ensure browser autofilled values are visible in dark-theme inputs by adding webkit rules to your global CSS:
```css
input:-webkit-autofill,
input:-webkit-autofill:hover, 
input:-webkit-autofill:focus, 
input:-webkit-autofill:active {
  -webkit-text-fill-color: #ffffff !important;
  -webkit-box-shadow: 0 0 0px 1000px #121212 inset !important;
  transition: background-color 5000s ease-in-out 0s;
}
```

---

## Common Mistakes
*   **Forgetting next.config Middleware Path Matchers:** Missing a route prefix in the config matcher allows users to navigate directly to the page without checking auth state.
*   **Using `transition: all` with Event Listeners:** Applying general transitions onto inputs while using dynamic event listeners can cause first-frame layout stuttering.
