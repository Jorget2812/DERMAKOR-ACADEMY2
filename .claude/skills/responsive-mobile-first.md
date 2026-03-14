# Responsive & Mobile-First Guard Skill

**Goal:** Enforce a premium, adaptive experience across all screen sizes.

## Steps

1.  **Mobile-First Audit:**
    *   Ensure all layouts start with mobile styles and scale up (md, lg breakpoints).
    *   Verify touch target sizes (minimum 44x44px) and spacing.
2.  **Dynamic Adaptation:**
    *   Use modern CSS (Flexbox, Grid) for fluid layouts.
    *   Handle safe areas (iOS/Android notches) correctly in styling.
3.  **Performance Check:**
    *   Audit image delivery (Next/Image) for mobile bandwidth.
    *   Minimize layout shifts (CLS) on dynamic content loading.
4.  **Interactive Quality:**
    *   Check for swipe gestures and mobile-native interaction patterns.
    *   Verify text readability and input usability on small screens.

## Rules

*   **Mobile-First is Strict:** No "desktop-first" styling allowed.
*   **Premium Feel:** Use smooth transitions and subtle animations for all size changes.
*   **Touch Friendly:** Inputs and buttons must be accessible to thumbs.
*   **Test Reality:** Verify on real mobile devices or accurate simulators.

## Expected Output

*   Pixel-perfect responsive design with flawless mobile functionality.
