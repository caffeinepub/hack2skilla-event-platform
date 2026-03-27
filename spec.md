# Hack2Skilla Tech Event Platform

## Current State
New project. No existing application files.

## Requested Changes (Diff)

### Add
- Full landing page with animated Three.js hero (particle globe), About section, Event Categories with expandable cards, Team section, Partners/Sponsors carousel, Media section, Newsletter signup, Testimonials carousel, Blog placeholder, Footer
- Search and filter events by category and date on landing page
- Event cards with Live/Upcoming/Completed status badges
- Event detail page with full description and registration form
- Admin authentication: 3 hardcoded accounts with hashed passwords in Motoko backend
- JWT-style session tokens stored in browser, admin dashboard protected
- Admin dashboard: CRUD events (name, category, description, date/time, location, payment type, registration limit, banner, special instructions), publish/unpublish toggle, participant management, CSV export, analytics panel
- Blob storage for event banner uploads
- User registration form (name, email, contact, org/school)
- Stripe payment flow for paid events
- Free event registration with confirmation
- Success page after registration
- Testimonials management in admin
- Fully responsive (mobile/tablet/desktop)

### Modify
N/A -- new project

### Remove
N/A -- new project

## Implementation Plan
1. Select components: authorization, blob-storage, stripe
2. Generate Motoko backend with:
   - Admin auth (3 hardcoded accounts, SHA256 hashed passwords, session tokens)
   - Events CRUD (with category, status computation from date, publish flag, payment type, price, limit, banner)
   - Registrations (per event, per user: name, email, contact, org)
   - Testimonials CRUD
   - Newsletter subscriptions
   - Analytics queries (total regs, payment stats, event counts by status)
3. Frontend:
   - Landing page with React Three Fiber animated particle hero
   - Event categories with expandable dropdowns and animations
   - Search/filter by category and date
   - Event cards (Live/Upcoming/Completed badges)
   - Event detail page + registration form
   - Admin login page (restricted)
   - Admin dashboard with tabs: Events, Registrations, Analytics, Testimonials
   - Stripe checkout for paid events
   - CSV export utility
   - Responsive layout throughout
