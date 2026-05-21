# Design System Document

## 1. Overview & Creative North Star: "The Digital Obsidian"
This design system moves away from the "template-heavy" look of standard developer portfolios. Instead, it adopts a **"Digital Obsidian"** aesthetic—an editorial approach that treats the screen as a high-performance, pressurized environment. The core philosophy is **Tonal Depth over Structural Lines**. 

By eliminating 1px borders and rigid grids, we create a "glass-on-glass" experience where content feels like it is floating in a deep, pressurized space. The contrast between the hyper-modern **Space Grotesk** and the utilitarian **Pretendard** creates a "Tech-Editorial" vibe: authoritative, clean, and unmistakably developer-focused.

---

## 2. Colors: Tonal Architecture
We use a Material Design-inspired palette to create a layered dark environment. The primary accent (`#4cd7f6`) is used sparingly, like a laser cutting through the dark.

### The Core Palette
- **Background (`#131315`):** The absolute base. Everything sits on this.
- **Primary (`#4cd7f6`):** Our high-energy cyan. Used for CTAs and critical status indicators.
- **Secondary (`#c0c1ff`):** A muted lavender for interactive elements that shouldn't compete with the primary.
- **Tertiary (`#4edea3`):** Reserved for "Success" or "Live" states (배포완료).

### The "No-Line" Rule
**Explicit Instruction:** Do not use `border: 1px solid`. Sectioning must be achieved through background shifts.
- To separate the Hero from the Content, shift the background from `surface` to `surface_container_low`.
- To highlight a Card, use `surface_container_highest` against a `surface` background.

### Surface Hierarchy & Glassmorphism
Treat the UI as a series of stacked sheets.
- **Level 0:** `surface` (Background)
- **Level 1:** `surface_container_low` (Section backgrounds)
- **Level 2:** `surface_container_high` (Cards and floating elements)
- **Glass Effect:** For the Navigation Bar and Tooltips, use `surface_container` at 70% opacity with a `backdrop-blur: 12px`. This prevents the "pasted-on" look and integrates the UI components into the environment.

---

## 3. Typography: Tech-Editorial Scale
The hierarchy is designed to make MDX content feel like a high-end magazine article.

| Role | Font Family | Size | Intent |
| :--- | :--- | :--- | :--- |
| **Display-LG** | Space Grotesk | 3.5rem | Hero headlines, oversized branding. |
| **Headline-MD** | Space Grotesk | 1.75rem | Section titles, Project names. |
| **Title-MD** | Pretendard | 1.125rem | Blog post titles, Card headers. |
| **Body-MD** | Pretendard | 0.875rem | Standard reading text, Korean descriptions. |
| **Code** | Geist Mono | 0.875rem | Code snippets, technical specs. |
| **Label-SM** | Pretendard | 0.6875rem | Metadata, Badges (배포완료). |

**Editorial Note:** Use `tracking-tighter` on Space Grotesk headlines to emphasize the "Modern Tech" look. Use `leading-relaxed` on Pretendard body text for long-form readability.

---

## 4. Elevation & Depth: The Layering Principle
We convey importance through **Tonal Layering** rather than traditional drop shadows.

- **Soft Lift:** Place a `surface_container_highest` element on a `surface` background. The color contrast alone provides the "lift."
- **Ambient Shadows:** Only for modal-level elements (like the Theme Toggle menu). Use a 24px blur with 6% opacity using a tint of the Primary color (`#4cd7f6`).
- **The Ghost Border:** If high-density data requires a container, use `outline_variant` at **15% opacity**. It should be felt, not seen.

---

## 5. Components: Intentional Primitives

### Navigation Bar
- **Styling:** No bottom border. Use a subtle gradient fade from `surface` to transparent, or a `backdrop-blur` glass effect.
- **Logo ("gotech.lab"):** Rendered in Space Grotesk Bold. The ".lab" should use the Primary (`#4cd7f6`) color.

### Status Badges (Korean)
Badges should feel like hardware labels, not "pills."
- **배포완료 (Live):** `tertiary_container` background with `on_tertiary_container` text.
- **개발중 (WIP):** `primary_container` background with `on_primary_container` text.
- **보관됨 (Archived):** `surface_variant` background with `on_surface_variant` text.
- **Shape:** Use `rounded-sm` (0.125rem) for a more technical, "machined" look.

### Project/Blog Cards
- **Structure:** `surface_container_low` background. 
- **Interaction:** On hover, transition the background to `surface_container_highest` and apply a subtle "Ghost Border" of `primary` at 20% opacity. 
- **Rule:** No dividers between the image, title, and excerpt. Use spacing `8` (2rem) to define content blocks.

### MDX Code Blocks
- **Container:** `surface_container_lowest`.
- **Typography:** Geist Mono.
- **Styling:** Include a "Mac-style" window header (three dots) in `outline_variant` to lean into the developer aesthetic.

---

## 6. Do’s and Don’ts

### Do
- **Do** use asymmetrical margins. A project card might be offset from the main grid to create visual interest.
- **Do** use "vibrant tech" gradients for CTA buttons (e.g., `primary` to `primary_container`).
- **Do** prioritize Korean legibility by ensuring `line-height` is at least 1.6 for Pretendard.

### Don't
- **Don't** use pure black `#000000`. It kills the tonal depth. Use `surface_container_lowest`.
- **Don't** use standard "box-shadows." They look dated. Stick to background color shifts.
- **Don't** use sharp 90-degree corners on large cards. Use `rounded-lg` (0.5rem) to soften the "Brutalist" edge.

---

## 7. Spacing System (Tailwind v4 Reference)
Consistency is maintained through a strict adherence to the spacing scale.
- **Layout Padding:** Desktop layouts should use `12` (3rem) or `16` (4rem) for horizontal padding to provide "luxury" breathing room.
- **Component Gaps:** Use `4` (1rem) for internal card elements and `8` (2rem) for spacing between cards.