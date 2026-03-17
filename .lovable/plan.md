

# Plan: Optimize PDP Mobile Performance (CLS + LCP)

## Problem Summary
- **CLS 0.89** — extremely high, caused by content shifting during load (images without dimensions, async content insertion, skeleton mismatch)
- **LCP 4.2s** — main product image discovered late (SPA fetch → render), no preload, no priority hints
- **FCP 3.1s** — render-blocking font, large JS bundle

## Changes

### 1. CLS Fixes (Target: < 0.1)

**A. Gallery image: explicit width/height + aspect-ratio container**
- The `.pdp__gallery` already has `aspect-ratio: 1/1` — good. But the `<motion.img>` inside has no `width`/`height` attributes. Add `width="1000" height="1000"` to prevent layout shift.
- Remove `AnimatePresence` + `motion.img` fade animation on initial render (only animate on user-initiated image change). The fade causes a frame where no image is visible → CLS.

**B. Reserve space for text content above the fold**
- Add `min-height` to the info column elements: title area (`min-height: 40px`), price row (`min-height: 24px`), installment (`min-height: 20px`), description (`min-height: 44px`).
- Set `min-height` on the variant selector area and buybox to prevent jumps.

**C. Loading skeleton that matches final layout**
- Replace the current loading spinner (`min-h-[60vh] flex items-center`) with a skeleton that mirrors the PDP grid: a square placeholder for the gallery + text lines for title/price/button. This prevents the massive shift from spinner → full content.

**D. MobileBulletOverlay — fixed height**
- The overlay already has `min-height` via CSS but the `AnimatePresence` transitions cause shifts. Add `min-height: 32px` to `.pdp__mobile-bullets-overlay` explicitly.

**E. TrustBarRotator — already has min-height (54px / 46px mobile)** — OK, no change needed.

### 2. LCP Fixes (Target: < 2.5s)

**A. Preload LCP image via `<link rel="preload">` in `<head>`**
- Since this is a SPA, we can't statically preload. Instead, inject a `<link rel="preload" as="image">` in the `useEffect` as soon as the product data arrives — before React renders the image. Use `fetchpriority="high"`.

**B. Mark main gallery image as high priority**
- Add `loading="eager"` and `fetchPriority="high"` to the first gallery image (index 0).
- Remove `loading="lazy"` from the first image (it's currently not set, but ensure it stays eager).

**C. Use Shopify CDN image transforms for mobile**
- Shopify CDN supports `_800x800` or `?width=800` params. For mobile, request a smaller image (e.g., `width=800`) instead of the full-res image. This reduces download size significantly.
- Add a helper: `function optimizeImageUrl(url: string, width = 800) { return url?.includes('cdn.shopify.com') ? url.replace(/\.([a-z]+)(\?.*)?$/, '_${width}x.$1$2') : url; }` — actually Shopify Storefront API images support `?width=X` query param.

**D. Preconnect to Shopify CDN** — already done in `index.html` (`cdn.shopify.com`). Good.

### 3. CSS/JS Optimizations

**A. Move inline `<style>` block to a separate CSS file**
- The PDP has ~1600 lines of inline CSS in a template literal inside JSX. This is parsed by JS, then injected into the DOM on every render. Extract it to `src/pages/Produto.css` and import it. This:
  - Reduces JS bundle size
  - Allows browser to cache CSS separately
  - Removes render-blocking JS-to-CSS overhead

**B. Lazy-load below-fold components**
- `ReviewsSection` — wrap in lazy/Suspense or use IntersectionObserver to defer loading
- `VideoStories` — already conditionally rendered (only when `storiesOpen`), OK
- `ProductCard` for related products — defer with IntersectionObserver

**C. Reduce framer-motion usage above the fold**
- The `AnimatePresence` + `motion.img` on the gallery adds JS overhead for the initial render. Use a simpler CSS transition for the initial load, keep framer-motion only for user-triggered transitions.

### 4. Cache & Assets

**A. Font loading** — already using `media="print" onload="this.media='all'"` pattern. Good.

**B. Shopify API preconnect** — already done. Good.

**C. Add `immutable` cache headers** — this is a Vite/hosting concern. Vite already hashes filenames. No code change needed; this is a hosting config issue outside scope.

### 5. Implementation Files

| File | Changes |
|------|---------|
| `src/pages/Produto.tsx` | Extract CSS to separate file; add width/height to gallery img; add `fetchPriority="high"` + `loading="eager"` to first image; add LCP preload `useEffect`; add Shopify image resize helper; add skeleton loader; add min-heights for CLS; lazy-load ReviewsSection; optimize Shopify image URLs for mobile |
| `src/pages/Produto.css` | New file with extracted PDP styles |
| `src/components/ReviewsSection.tsx` | No structural change, just lazy-loaded from PDP |

### What Each Change Attacks

| Change | CLS | LCP | Render-blocking |
|--------|-----|-----|-----------------|
| width/height on gallery img | ✓ | | |
| Skeleton loader matching layout | ✓ | | |
| min-heights on text elements | ✓ | | |
| Fixed overlay heights | ✓ | | |
| `fetchPriority="high"` on LCP img | | ✓ | |
| Preload link injection | | ✓ | |
| Shopify CDN resize for mobile | | ✓ | |
| Extract CSS to file | | | ✓ |
| Lazy-load ReviewsSection | | | ✓ |
| Remove initial framer-motion fade | ✓ | ✓ | |

### Remaining Gargalos (post-implementation)
- **Shopify API latency** (~300-500ms) is the biggest remaining bottleneck — the SPA must fetch product data before anything renders. SSR/SSG would solve this but is outside React SPA scope.
- **Third-party fonts** (Google Fonts Inter) — already optimized with async loading.
- **Unused JS from dependencies** (framer-motion, lucide-react full bundles) — tree-shaking helps but these are large libraries.

