# Material 3 Date Picker Specifications

Reference: [Material Design 3 - Date Pickers Specs](https://m3.material.io/components/date-pickers/specs)

## Common Component: Calendar Grid

### Layout
- 7-column grid for days of the week.

### Dimensions
- **Date Cell Row Height:** 40dp.
- **Weekday Label Row Height:** 24dp (Docked) to 40dp (Modal).
- **Date Cell Width:** Subdivided within the container (approx. 48dp in Modal, 40-44dp in Docked).
- **Selection Indicator:** 40dp diameter circle.

### Typography
- **Days of week:** `Body large` (Outfit/Inter/Roboto).
- **Calendar dates:** `Body large`.

### Colors
- **Selected Date:** `On primary` text on a `Primary` container circle.
- **Today’s Date:** `Primary` outline with `Primary` text.
- **Unselected Dates:** `On surface` text.
- **Outside Month Dates:** `On surface variant` (lower emphasis).

---

## 1. Docked Date Picker (Desktop Optimization)
Typically used within a menu or anchored to a text field.

### Dimensions
- **Width:** 360dp.
- **Total Height:** 460dp.
- **Container Padding:** 12dp (Left/Right), 12dp (Bottom).

### Layout
- **Header:** Features an outlined or filled text field (standard M3 text field specs).
- **Controls Area:** Month and Year selection menus (approx. 30dp height) with navigation arrows.
- **Action Bar:** Cancel/OK text buttons (36dp height area) with 16dp spacing between them.

### Typography
- **Month/Year Menus:** `Label large`.
- **Action Buttons:** `Label large`.

### Colors
- **Container:** `Surface container high`.
- **Header/Navigation Icons:** `On surface variant`.

---

## 2. Modal Date Picker (Mobile/Tablet Optimization)
A full-dialog or full-screen experience often triggered by a text field.

### Dimensions
- **Width:** 360dp (standard) or full-screen on small mobile devices.
- **Total Height:** 524dp.
- **Header Height:** 120dp.

### Layout
- **Header:** Supporting text label (e.g., "Select date") and a large date headline (e.g., "Mon, Aug 17").
- **Control Bar:** 48dp height row for Month/Year selection and navigation arrows.
- **Action Area:** Bottom-aligned Cancel/OK buttons (40dp height) with 8dp top padding and 12dp bottom padding.

### Typography
- **Supporting Text:** `Label medium`.
- **Date Headline:** `Headline medium`.
- **Month/Year Selector:** `Label large`.
- **Action Buttons:** `Label large`.

### Colors
- **Header Container:** `Surface container high`.
- **Headline Text:** `On surface`.
- **Supporting Text:** `On surface variant`.
- **Divider:** `Outline variant` (separates header from grid in some layouts).

---

## Key Differences Summary

| Feature | Docked (Desktop) | Modal (Mobile) |
| :--- | :--- | :--- |
| **Total Height** | 460dp | 524dp |
| **Header** | Integrated Text Field | Large Headline (120dp height) |
| **Primary Typography** | `Body large` / `Label large` | `Headline medium` / `Label large` |
| **Usage** | Contextual/Menu-based | Focused Dialog/Full-screen |
