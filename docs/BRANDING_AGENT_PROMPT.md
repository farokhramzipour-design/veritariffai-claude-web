Here's a detailed prompt to give your AI agent:

PROMPT:

Redesign the "Meet Our Team" section to match the Veritariff design system exactly. The current section looks generic and unpolished. Replace it entirely with a premium, high-impact team section that feels like it belongs in the same "Fintech meets Cyberpunk" aesthetic as the rest of the landing page.

KEEP THIS DATA (do not change any real content):

Person 1:

    Name: Hasti Ebrahimighosour
    Role Line 1: Business Development
    Role Line 2: Founder
    LinkedIn link: keep existing href
    Avatar image: keep existing <img> src

Person 2:

    Name: Behnam Ahmadifar
    Role Line 1: CTO
    Role Line 2: Founder
    LinkedIn link: keep existing href
    Avatar image: keep existing <img> src

Footer tagline: "We are a passionate team dedicated to revolutionizing trade compliance with cutting-edge technology."

DESIGN REQUIREMENTS:

Section wrapper:

    Background: #0A192F (match page dark navy)
    Add the animated drifting grid background (same .grid-bg class used in other dark sections)
    Add a subtle radial teal glow (rgba(100,255,218,0.05)) centered behind the cards
    Top border: 1px solid rgba(100,255,218,0.12)
    Padding: 110px 5%

Section heading:

    Replace plain "Meet Our Team" with the same typographic treatment used across the page
    Add a small eyebrow label above in JetBrains Mono, teal color, uppercase, wide letter-spacing: // THE FOUNDERS
    Main heading in Syne font, font-weight: 800, white, large — styled like other section H2s
    Both eyebrow and heading use the .reveal scroll-triggered animation class

Team cards — completely redesign:

    Layout: centered flex row, gap 32px, max-width 900px, centered on page. Cards should be equal width (~380px each)
    Card background: rgba(255,255,255,0.025) glassmorphism with backdrop-filter: blur(20px)
    Card border: 1px solid rgba(100,255,218,0.12)
    Card border-radius: 16px
    Card padding: 40px 36px
    Card text-align: center
    Apply .reveal with .d1 / .d2 staggered delays

Card hover state:

    transform: translateY(-8px)
    Border color transitions to rgba(100,255,218,0.4)
    Box shadow: 0 20px 60px rgba(100,255,218,0.08), 0 0 0 1px rgba(100,255,218,0.15)
    A bottom border line sweeps in via ::after pseudo-element: scaleX(0) → scaleX(1), teal gradient
    A subtle teal gradient overlay fades in via ::before pseudo-element on hover

Avatar:

    Display the existing <img> in a circular frame: width: 100px, height: 100px, border-radius: 50%, object-fit: cover
    Add a teal glowing ring around the avatar: border: 2px solid var(--teal) with box-shadow: 0 0 20px rgba(100,255,218,0.4)
    Wrap the avatar in a container that has a second outer dashed ring (border: 1px dashed rgba(100,255,218,0.25), border-radius: 50%) that slowly rotates via CSS animation (animation: spin 12s linear infinite)
    On card hover, the avatar ring glow should intensify

Name:

    font-family: 'Syne', sans-serif
    font-weight: 800
    font-size: 1.3rem
    color: #E6F1FF
    margin-top: 20px, margin-bottom: 8px
    letter-spacing: -0.01em

Role lines:

    Each role line in JetBrains Mono, font-size: 0.82rem, color: #64FFDA (teal), letter-spacing: 0.08em
    Separated by a · divider OR stacked on separate lines
    Add a small teal tag-style pill around each role: background: rgba(100,255,218,0.08), border: 1px solid rgba(100,255,218,0.2), border-radius: 20px, padding: 3px 12px

LinkedIn button:

    Remove the plain current LinkedIn link style
    Replace with a styled ghost button: border: 1px solid rgba(100,255,218,0.25), color: var(--teal), border-radius: 6px, padding: 8px 20px, font-size: 0.82rem, font-family: 'JetBrains Mono'
    On hover: background fills with rgba(100,255,218,0.1), border brightens, emits soft glow
    Keep the LinkedIn SVG icon to the left of the text
    margin-top: 24px
    display: inline-flex, align-items: center, gap: 8px

Footer tagline:

    Center-aligned, max-width: 600px, margin: 0 auto
    font-size: 1rem, color: #A8B2D8, line-height: 1.7
    Wrap the word "revolutionizing" in a <em> or <span> and color it var(--teal) to add visual emphasis
    Add .reveal scroll animation with .d4 delay
    Add a short 1px teal horizontal rule above it: width: 60px, centered, margin: 40px auto 24px, background: var(--teal), opacity: 0.4

Animations to add:

    Both cards use .reveal class: slide up from translateY(40px) with opacity 0 → 1 on scroll (use existing IntersectionObserver reveal system already on the page)
    The rotating dashed ring on the avatar should use the same @keyframes spin already defined on the page
    The teal avatar glow should pulse subtly using a box-shadow keyframe animation (same pattern as the AEO badge pulse)
    On page load or when section scrolls into view, the cards should animate in with a 0.1s and 0.3s stagger

Strict rules:

    Do not change any names, titles, LinkedIn URLs, or avatar image sources
    Do not modify any other section on the page
    Do not remove or alter the existing IntersectionObserver reveal system — just apply the existing .reveal, .d1, .d2 classes to new elements
    Use only fonts, CSS variables, and keyframes already defined on the page (--teal, --navy, --white, --grey-light, --border, Syne, DM Sans, JetBrains Mono)
    The redesigned section must be fully responsive — on mobile (max-width: 768px), cards should stack vertically in a single column
