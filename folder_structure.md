# Project Structure (Domain-Driven)

```
/
├── app/                  # Next.js App Router
│   ├── (auth)/           # Auth group: login, register, invite
│   ├── (public)/         # Public: shop, professional-access
│   ├── app/              # Protected (Verified): shop, cart, orders
│   ├── admin/            # Admin: users, products, academy
│   └── api/              # Webhooks, resources
├── components/           # Shared UI
│   ├── ui/               # shadcn/ui
│   └── domains/          # Domain-specific components
│       ├── commerce/
│       ├── academy/
│       ├── admin/
│       └── auth/
├── domains/              # Business Logic (Layered)
│   ├── commerce/
│   │   ├── actions.ts    # Server Actions
│   │   ├── types.ts      # Zod schemas & TS types
│   │   └── services.ts   # DB logic
│   ├── academy/
│   │   ├── actions.ts
│   │   └── types.ts
│   ├── admin/
│   │   ├── actions.ts
│   │   └── types.ts
│   └── auth-verification/
│       ├── actions.ts
│       └── types.ts
├── lib/                  # Utilities
│   ├── supabase/         # Client/Server/Middleware
│   ├── stripe/           # Config & logic
│   └── utils.ts
├── messages/             # i18n (fr.json, it.json, de.json)
└── public/               # Static assets
```
