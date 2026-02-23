# API & Server Action Contracts

## 1. Auth & Verification
- `submitVerificationRequest(data: VerificationRequestSchema): Promise<Result>`
  - PUBLIC. Validates and saves to `verification_requests`.
- `adminApproveRequest(requestId: string, initialLevel: UserLevel): Promise<Result>`
  - ADMIN. Creates auth user, profile, sends invite email.
- `adminRejectRequest(requestId: string, reason?: string): Promise<Result>`
  - ADMIN. Marks request as REJECTED.
- `acceptInvite(token: string, password: string): Promise<Result>`
  - PUBLIC. Sets password and activates profile.

## 2. Commerce (Shop)
- `listProductsPublic(): Promise<Product[]>`
  - PUBLIC. Returns products WITHOUT prices.
- `listProductsVerified(): Promise<ProductWithPrice[]>`
  - VERIFIED. Returns products with base price, level discount, and final price.
- `createCheckoutSession(items: CartItem[]): Promise<{ url: string }>`
  - VERIFIED. Validates stock, calculates final prices, creates Stripe session.
- `handleStripeWebhook(event: Stripe.Event): Promise<void>`
  - WEBHOOK. Idempotent. Decrements stock (UPDATE ... WHERE stock >= qty), creates order/payment.

## 3. Academy
- `getCourseContent(slug: string): Promise<Course>`
  - VERIFIED + LEVEL STANDARD/PREMIUM. Validates visibility.
- `updateLessonProgress(lessonId: string, position: number, completed: boolean): Promise<void>`
  - VERIFIED + LEVEL STANDARD/PREMIUM.
- `getSignedResourceUrl(path: string): Promise<string>`
  - VERIFIED + LEVEL STANDARD/PREMIUM. Generates 60s signed URL for PDFs.

## 4. Admin
- `updateMonthlyDiscount(month: string, level: UserLevel, percent: number): Promise<void>`
  - ADMIN. Validates caps (30%/50%).
- `updateProductStock(variantId: string, delta: number): Promise<void>`
  - ADMIN. Manual stock adjustment.
