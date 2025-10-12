# Campus Placement Management System - Design Guidelines

## Design Approach: Material Design System

**Rationale:** This platform is a utility-focused, information-dense application requiring efficient data presentation, clear navigation, and responsive interaction patterns. Material Design provides the necessary components for complex dashboards, data tables, and form-heavy interfaces while maintaining modern aesthetics.

## Core Design Principles

1. **Role-Based Interface Differentiation** - Distinct visual hierarchies for Student and Coordinator dashboards
2. **Information Clarity** - Clean presentation of job listings, application statuses, and analytics
3. **Action-Oriented Design** - Prominent CTAs for critical actions (Apply, Post Job, Update Status)
4. **Mobile-First Responsiveness** - Students access primarily via mobile devices

## Color Palette

### Light Mode
- **Primary**: 220 85% 55% (Professional Blue) - CTAs, active states, primary actions
- **Primary Variant**: 220 90% 45% (Darker Blue) - Hover states
- **Secondary**: 160 60% 45% (Success Green) - Accepted/Offer status, positive actions
- **Error**: 0 75% 55% (Alert Red) - Deadline warnings, rejected status
- **Warning**: 35 90% 55% (Attention Orange) - Pending actions, approaching deadlines
- **Surface**: 0 0% 100% (Pure White) - Cards, modals, elevated surfaces
- **Background**: 220 15% 97% (Light Gray) - Page background
- **Text Primary**: 220 20% 15% (Near Black)
- **Text Secondary**: 220 10% 45% (Medium Gray)

### Dark Mode
- **Primary**: 220 80% 65% (Lighter Blue for contrast)
- **Surface**: 220 15% 12% (Dark Surface)
- **Background**: 220 15% 8% (Darker Background)
- **Text Primary**: 0 0% 95% (Near White)
- **Text Secondary**: 220 5% 70% (Light Gray)

## Typography

**Font Stack:** 
- **Primary:** 'Inter' (Google Fonts) - Clean, highly legible for data tables and forms
- **Display:** 'Poppins' (Google Fonts) - Dashboard headings and section titles
- **Monospace:** 'JetBrains Mono' - Application IDs, timestamps

**Scale:**
- Headings: text-3xl (Dashboard titles), text-2xl (Section headers), text-xl (Card titles)
- Body: text-base (Primary content), text-sm (Secondary info, table data)
- Captions: text-xs (Timestamps, helper text)
- Weights: font-semibold (Headings), font-medium (Labels), font-normal (Body)

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4 (cards), p-6 (modals), p-8 (page containers)
- Stack spacing: space-y-4 (form fields), space-y-6 (dashboard sections)
- Grid gaps: gap-4 (card grids), gap-6 (dashboard modules)

**Responsive Breakpoints:**
- Mobile: Base styles (students on-the-go)
- Tablet: md: (768px) - Enhanced job browsing
- Desktop: lg: (1024px) - Coordinator dashboards with side navigation

## Component Library

### Navigation
**Student Navigation:**
- Bottom tab bar (mobile): Jobs, Applications, Saved, Profile
- Top app bar with notifications bell (always visible)

**Coordinator Navigation:**
- Persistent left sidebar (desktop): Dashboard, Jobs, Students, Analytics
- Collapsible hamburger menu (mobile/tablet)
- Breadcrumb navigation for deep pages

### Data Display

**Job Cards:**
- Elevated cards with subtle shadow (shadow-md)
- Company logo placeholder (64x64px, rounded-lg)
- Title in text-lg font-semibold
- Key details in grid: Location, CTC, Deadline, Type (chip badges)
- Status indicators: Mandatory (red badge), Saved (star icon), Applied (checkmark badge)
- Action buttons: Apply (primary), Save (icon), Share (icon)

**Application Status Cards:**
- Timeline-style layout showing progression
- Color-coded status badges: Applied (blue), Interview (orange), Offer (green), Rejected (red)
- Expandable sections for notes and updates

**Data Tables (Coordinators):**
- Sticky header rows with sort indicators
- Alternating row backgrounds for readability
- Row hover states (background-gray-50 in light mode)
- Action menus (three-dot) on row hover
- Pagination footer with page size selector

### Forms

**Job Posting Form (Coordinator):**
- Multi-step wizard with progress indicator
- Step 1: Basic Info (title, company, description)
- Step 2: Requirements (skills chips, eligibility filters)
- Step 3: Details (deadline date picker, CTC, location)
- Auto-save draft indicator
- Prominent "Post Job" CTA (w-full on mobile, w-auto on desktop)

**Application Form (Student):**
- Single-page with validation feedback
- Resume upload with drag-drop zone
- Cover letter textarea with character counter
- Confirmation modal before submission

### Interactive Elements

**Buttons:**
- Primary: Filled with primary color, white text, rounded-lg, shadow-sm
- Secondary: Outlined with primary color, transparent bg, rounded-lg
- Tertiary: Text-only with primary color, no border
- Icon buttons: p-2, hover:bg-primary-50, rounded-full
- Sizes: Large (Apply buttons), Medium (default), Small (table actions)

**Chips/Badges:**
- Skill tags: Small, rounded-full, background-primary-100, text-primary-700
- Status badges: Rounded-md, contrast backgrounds based on status
- Department tags: Outlined style with department-specific colors

**Notification Cards:**
- Toast notifications (top-right): Auto-dismiss after 5s
- In-app notification panel: Sliding drawer from right
- Unread indicator: Red dot on bell icon with count badge

### Modals & Overlays

**Confirmation Dialogs:**
- Centered modal, max-w-md
- Clear action labels ("Confirm Application", "Cancel")
- Danger actions in red (Delete, Withdraw)

**Job Details Modal:**
- Full-screen on mobile, max-w-3xl centered on desktop
- Scrollable content area
- Fixed footer with CTAs
- Close button (X) in top-right

### Dashboard Layouts

**Student Dashboard:**
- Hero section: Greeting, upcoming deadlines (horizontal scroll cards)
- Quick stats: Applications count, Offers, Saved jobs (3-column grid on desktop)
- Recent jobs: 2-column grid (mobile: 1-col, tablet: 2-col, desktop: 3-col)
- Application tracker: Timeline/Kanban view toggle

**Coordinator Dashboard:**
- Analytics overview: 4-card stat grid (total jobs, applications, placement rate, active students)
- Charts: Bar chart (applications by month), Pie chart (status distribution)
- Recent activity feed: Latest applications, new students
- Quick actions: Post Job (FAB), Send Notification, Export Data

## Animations

**Use Sparingly:**
- Page transitions: Fade-in (200ms)
- Modal entry: Scale + fade (300ms, ease-out)
- Loading states: Skeleton screens (no spinners unless absolutely necessary)
- List updates: Subtle slide-in for new items

## Images

**Logo/Branding:**
- College logo in top-left (navigation bar): 40px height
- Company logos in job cards: 48x48px, rounded corners, placeholder with company initial if no logo

**Illustrations:**
- Empty states: Minimalist illustrations for "No applications yet", "No saved jobs"
- Success confirmations: Simple checkmark icon in success color

**Hero Section (Landing/Login):**
- NOT APPLICABLE - This is a utility app, dashboard starts immediately after login

## Status Indicators

- **Applied:** Blue circle icon, "Under Review" text
- **Interview:** Orange calendar icon, "Interview Scheduled" text  
- **Offer:** Green checkmark icon, "Offer Received" text
- **Rejected:** Red X icon, "Not Selected" text
- **Deadline Passed:** Gray clock icon, "Expired" text

## Accessibility

- WCAG AA contrast ratios maintained (4.5:1 for text)
- Focus indicators on all interactive elements (ring-2 ring-primary-500)
- Keyboard navigation support (Tab order, Enter/Space activation)
- Screen reader labels for icon-only buttons
- Form error messages tied to inputs with aria-describedby
- Persistent dark mode across all views including forms and modals