# UI Sitemap

## 1. Public Pages (Visitor)
- `/`: Hero, Featured products (no prices).
- `/shop`: Grid of products with "Request Professional Access" button.
- `/shop/[slug]`: Product details, variants, NO PRICE.
- `/professional-access`: Onboarding form.
- `/login`: Standard Supabase Auth login.
- `/invite/[token]`: Password setup for new approved users.

## 2. Verified App Space (`/app`)
- `/app`: Dashboard with recent activity, shop highlights, and academy progress.
- `/app/shop`: Full catalog WITH prices & tiered discounts.
- `/app/shop/[slug]`: Buy now/Add to cart.
- `/app/cart`: Item list, discount subtotal, shipping calculation.
- `/app/orders`: History of B2B orders.

## 3. Academy Space (`/app/academy`)
- `/app/academy`: Dashboard, "Continue Learning".
- `/app/courses`: List of available courses (Standard/Premium filter).
- `/app/courses/[slug]`: Course overview.
- `/app/learn/[courseId]/lesson/[lessonId]`: Video player + PDF viewer + Lesson content.
- `/app/library`: Resources (Protocols, Masterclasses, Blog).

## 4. Admin Panel (`/admin`)
- `/admin/verifications`: List PENDING requests.
- `/admin/users`: Level management, status toggle.
- `/admin/discounts`: Monthly discount configuration.
- `/admin/products`: CRUD for products and variants.
- `/admin/orders`: Full order management.
- `/admin/academy`: Content management for LMS and Library.
- `/admin/audit`: Action logs.
