# Evolve Studio Workspace Rules

This file documents critical development guidelines and constraints for the Evolve Studio project.

---

## 1. Frontend & Input Autofill Guard
When designing dark-mode forms or custom text inputs, always include CSS overrides for browser autocomplete/autofill states in the global stylesheet (`src/app/globals.css`) to prevent text from turning invisible:
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

## 2. Route & Path Security Verification
Whenever UI routes are restricted to the Admin dropdown menu (e.g., Wallet, Profile, Roster, Analytics), verify that:
1. The route path is added to the matcher configuration array inside `src/middleware.ts`.
2. The route logic checks both Supabase authentication state (`user`) and the local administrator cookie state (`evolve-admin-session`).

## 3. Local Test Credentials
Use the following credentials to authenticate and verify admin portal operations locally:
- **Email:** `admin@crtl.com`
- **Password:** `admin123`
