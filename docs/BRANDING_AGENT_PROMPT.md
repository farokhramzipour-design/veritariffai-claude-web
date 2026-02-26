You are tasked with applying UI/UX enhancements to an existing HTML landing page for "Veritariff." Your job is strictly to add animations and visual effects. Do not change any existing functionality, layout structure, section content, copy, or logic.

ANIMATIONS TO ADD — implement all of the following:
Global / Page-level:

Add a <canvas> element fixed to the background with 150 connected floating particles using teal (#64FFDA) color with line-mesh connections between nearby particles. Must persist as user scrolls.
Add a custom cursor: a small teal dot that follows the mouse instantly, and a larger ring that lags behind with easing. The ring should scale up when hovering over any <a>, <button>, or card element.
Add a scroll progress bar fixed at the top of the page — a 2px teal line that grows in width from 0% to 100% as the user scrolls down the page.
Add a moving grid background (background-size: 60px 60px) with a slow drift animation using background-position keyframes on all dark sections.
Add a repeating scanline overlay on the hero section using repeating-linear-gradient.

Navigation:

On page load, the nav should slide down from translateY(-100%) to translateY(0) with a fade.
On scroll past 60px, the nav should shrink its padding and increase background opacity smoothly via JS scroll listener.
Nav links should have an animated underline that scales in from scaleX(0) to scaleX(1) on hover.
The Sign In button should have a teal fill that slides in from left (translateX(-100%) to translateX(0)) on hover, switching text to dark.

Hero Section:

The eyebrow text should animate in with letter-spacing expanding from wide to normal.
The two flanking lines on the eyebrow should grow from width: 0 to width: 36px using keyframes.
The H1 should fade in from translateY(40px) scale(0.96) to normal.
The italic/em word ("bleeding profit") should have a CSS glitch effect — two pseudo-elements (::before, ::after) with clip-path and text-shadow in red and teal that trigger intermittently via keyframes.
The hero subtitle and CTA wrap should fade up with staggered animation delays.
The live calc ticker (a small inline preview element showing a GBP value) should update its number every 2 seconds with a fade-out/fade-in transition, cycling through a small array of realistic values.
The two segmentation cards should animate in from translateY(30px) scale(0.95) with staggered delays (1.2s and 1.4s).
Cards on hover: lift with translateY(-8px), show a teal border, reveal a gradient overlay (::before), and draw a bottom border line (::after scaleX 0→1). The arrow icon in the top-right corner should appear and shift diagonally on hover.
The trust bar should fade in last with the longest delay.
Floating orb elements should have a slow translateY breathing animation (separate keyframes for each orb).

Problem Section (white background):

All cards and the heading should use a scroll-triggered reveal: opacity: 0 + translateY(40px) → visible when intersected, with staggered transition-delay per card.
The large stat numbers at the top of each card (e.g. "5-Day", "£50k", "3x") should count up from 0 using requestAnimationFrame when the card enters the viewport via IntersectionObserver.
On card hover: lift, show red bottom border sweeping in via scaleX, subtle red gradient overlay from top.

Solution Section — all 3 dashboard panels:

All solution text blocks and visual panels should use directional scroll reveals: left text slides in from translateX(-50px), right visuals from translateX(50px), triggering on scroll.
Every solution visual panel should have a teal scan line (height: 2px, linear-gradient) that continuously sweeps from top: 0% to top: 100% using a looping CSS animation.
Panel borders should brighten and emit a faint glow on hover.

Panel 1 — Calculation Animation (KEEP ALL EXISTING LOGIC, only enhance):

Keep the existing cycle: rolls numbers, animates bars, shows savings badge, toggles status indicator.
Enhance the bar fills: start at width: 0 and transition to target width with cubic-bezier(0.16, 1, 0.3, 1) easing over 1.4s.
The savings badge should spring in using cubic-bezier(0.34, 1.56, 0.64, 1) (overshoot effect) from scale(0.8).
The rolling number animation should use a 4th-power ease-out curve.
Trigger the entire cycle only when the panel enters the viewport (IntersectionObserver, threshold 0.35). Loop every 5.5 seconds.

Panel 2 — Compliance Shield:

The shield icon should have two concentric dashed rings rotating in opposite directions via CSS animation: spin.
A pulse ring should expand outward from the shield with opacity fading to 0 — looping.
The three scan list items should be hidden (opacity: 0, translateX(-10px)) and animate in sequentially with 700ms gaps when the panel enters the viewport.
A scan progress bar at the bottom should animate from 0% to 100% width and fade out, looping infinitely.

Panel 3 — QR Vault:

The QR box should have a slow translateY float animation (up and down, 3s loop).
A dashed border ring around the QR box should slowly rotate.
Individual QR cells should randomly flash to low opacity and restore every 500ms via setInterval.

AEO Badge Section:

All text and the button should use scroll-triggered reveal class animations with staggered delays.
The badge should use reveal-scale: animates in from scale(0.85) with a spring overshoot.
Three concentric rings around the badge should rotate at different speeds and directions using CSS animations.
The badge center should pulse its box-shadow glow in and out on a 4s loop.

Testimonial Cards:

Reveal with staggered scroll-triggered fade-up animation.
On hover: lift, increase border opacity, and draw a teal top-border line sweeping from scaleX(0) to scaleX(1).

Footer CTA Section:

Three full-width horizontal lines should animate: scaleX(0) → scaleX(1) → scaleX(0) in sequence with staggered delays, repeating on a 6s loop.
The heading and paragraph use scroll-triggered reveals with delays.
The four stat numbers should count up from 0 using requestAnimationFrame when the stats row enters the viewport.
The CTA button and footer links use reveal animations with delays.

Button (.btn-primary) — global:

A diagonal light sweep (::before pseudo-element, skewed white gradient) should slide across the button on hover.
Button lifts with translateY(-3px) and emits a teal box-shadow glow on hover.
The arrow SVG inside shifts translateX(5px) on hover.


STRICT RULES:

Do not modify any section text, headings, subtext, or copy.
Do not change the layout, flexbox/grid structure, or section order.
Do not remove or alter any existing JavaScript calculation logic.
Do not change color variables or the design system.
Do not add new sections or remove existing ones.
All new animations must be purely additive — CSS classes, keyframes, and JS listeners layered on top of existing markup.
Use IntersectionObserver for all scroll-triggered effects (do not use scroll event listeners for reveal animations).
All transition-delay values must be applied via utility classes (.d1 through .d6) not inline styles.
Test that the calculation panel still cycles through scenarios and updates the DOM correctly after your changes.