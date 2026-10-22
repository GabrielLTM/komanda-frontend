---
version: alpha
name: "Mau Mau Lanches — Komanda"
description: "Painel operacional de lancheria com identidade de balcão local, ação coral e leitura rápida."
colors:
  primary: "#C41F27"
  primary-hover: "#9E161D"
  background: "#F7F5F2"
  surface: "#FFFFFF"
  text: "#1F1A17"
  text-muted: "#7A7068"
  border: "#ECE6DF"
  warning-surface: "#FFF6DB"
  danger-surface: "#FFF0F0"
  success: "#2F9E44"
typography:
  sans:
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  mono:
    fontFamily: "'IBM Plex Mono', ui-monospace, monospace"
rounded:
  sm: "0.5rem"
  md: "0.625rem"
  lg: "0.875rem"
spacing:
  page-gutter: "1.625rem"
  compact-control: "0.5rem"
components:
  button:
    backgroundColor: "colors.primary"
    textColor: "#FFFFFF"
    rounded: "0.625rem"
  button-hover:
    backgroundColor: "colors.primary-hover"
  card:
    backgroundColor: "#FFFFFF"
    textColor: "colors.text"
    rounded: "0.875rem"
  muted-copy:
    textColor: "colors.text-muted"
  divider:
    backgroundColor: "colors.border"
  warning:
    backgroundColor: "colors.warning-surface"
  danger:
    backgroundColor: "colors.danger-surface"
  success:
    backgroundColor: "colors.success"
  dialog:
    backgroundColor: "#FFFFFF"
    rounded: "1rem"
---

# Mau Mau Lanches — Design System

## Overview

### Creative North Star

The existing interface reads like a neighborhood snack bar’s order counter: a warm paper-like canvas, dark ink, coral-red action buttons, and small golden highlights. Preserve this established identity and its quick, compact rhythm; this change adds reliable catalog forms without restyling the product.

### Product context and register

- **Audience and primary job:** Mau Mau Lanches staff manage menu items, categories, delivery areas, and couriers while serving orders.
- **Target market(s) and evidence:** Brazilian food-service operation; product name, Guaíba location label, Portuguese copy, BRL formatting, and source interface establish this context.
- **Locale(s) and language policy:** Brazilian Portuguese (`pt-BR`); money is formatted in BRL and decimal-entry fields accept comma or dot.
- **Usage scene:** Repeated desktop/laptop counter use with short, direct CRUD tasks and dense menu rows; forms must also remain usable on narrow screens.
- **Register:** Product/admin. Clarity and familiar source behavior take priority over a redesign.
- **Memorable signature:** Coral actions against warm off-white surfaces, with restrained golden highlights for order context.
- **Restraint:** Keep lists and forms compact, labels direct, and error messages actionable. Do not add decorative layers or new visual motifs to the integration.
- **Anti-references:** Generic dark SaaS dashboards, cold blue enterprise grids, and promotional landing-page styling; these conflict with the source identity and operational use.
- **Token ownership/runtime mapping:** Existing `src/index.css` and component styles remain canonical for this scoped compatibility work. This document mirrors accepted values. Font files are loaded through `@font-face` in `src/index.css`; component styles currently use the same palette values directly. No runtime token generator is configured.

## Colors

The primary action is Mau Mau coral (`#C41F27`), with the deeper `#9E161D` hover. Warm gray-brown text (`#1F1A17`, `#4A423C`, `#7A7068`) stays readable on the off-white canvas (`#F7F5F2`) and white cards. Hairlines (`#ECE6DF`, `#E2DBD3`) separate controls without making the interface feel technical. Gold (`#FFF6DB`, with `#7A5A00` text) signals contextual guidance; red-tinted surfaces communicate errors. Green is reserved for active/success status.

## Typography

Plus Jakarta Sans is the interface face, using the supplied local font assets and system sans fallbacks. IBM Plex Mono is available for numeric/technical use. Headings are compact and weighty; body copy and table values stay around 13–15px for counter-side scanning. Use sentence case and Brazilian Portuguese copy. Preserve native script fallbacks through the system stack.

## Layout

The source uses a fixed 210px navigation rail beside a naturally scrolling main workspace with roughly 22–26px page padding. Admin forms and cards use compact 8–14px internal gaps. Product rows stay dense on desktop and wrap actions on narrow screens; do not impose viewport-height clipping on the main content. Keep important content visible without hover-only access.

## Elevation & Depth

Hierarchy comes from white surfaces, warm 1px borders, and modest shadows on overlays. Avoid blur or layered elevation in ordinary rows. Dialogs sit above the application with a dark translucent scrim; errors and warnings use their semantic tinted surfaces.

## Shapes

Buttons and inputs use 8–10px corners, larger cards use 14px, and dialogs use 16px. Pills are reserved for category/status chips. Lucide icons use the existing 13–18px stroke style and remain paired with text except for clearly named compact controls.

## Components

### Foundational visual states

Keep the existing neutral, white, coral, green, and gold state colors. Disabled controls reduce emphasis and do not respond; busy controls retain their dimensions. Loading and error messages use reserved, readable inline areas.

### Buttons and actions

Solid coral is the primary action, white with a warm border is neutral, and red text on a pale red surface is destructive. Keep delete confirmation beside the affected record and name the record in the confirmation context. Disabled controls should visibly communicate their unavailable state.

### Navigation and data display

The white left rail and coral selected item are the established navigation. Catalog and category lists use compact rows, small uppercase column labels, and warm separators. Small-screen layouts may wrap actions; all content remains reachable with document scrolling.

### Forms and overlays

Use direct Portuguese labels, inline validation, and server errors in the form that owns the change. Modal surfaces are white, rounded, viewport-bounded, and internally scrollable for long content. Toasts are dark, stable, and announced politely; critical errors remain inline.

### Iconography

Lucide React with thin-to-medium strokes; icons supplement labels and use accessible names when they stand alone.

### Motion

The source uses short 150ms interaction transitions. Keep motion limited to hover and small state changes, and respect reduced-motion preferences where animation is introduced.

### Content and data visualization

Use practical, conversational Brazilian Portuguese, active verbs, BRL currency, and explicit labels. Never imply that a local demonstration or unavailable operation has been saved remotely.

## Do's and Don'ts

- **Do:** Preserve the current counter-oriented layout and color hierarchy while making catalog changes persistent.
- **Do:** Keep the original form values visible when the server rejects a save.
- **Don't:** Invent neighborhoods, courier settlements, catalog entries, or remote order persistence.
- **Don't:** replace the source identity with a generic dashboard redesign.
