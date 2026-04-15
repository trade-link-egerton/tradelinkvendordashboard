# TradeLink Vendor Dashboard

A React + TypeScript dashboard for marketplace vendors to manage products, orders, payouts, reports, and store settings.

## Overview

This frontend is designed for authenticated vendor users and integrates with a backend API (base path `/api/v1`).

Core capabilities:

- Token-based login using backend-issued bearer token
- Vendor onboarding and application flow
- Product and category management
- Order management and status progression
- Payout and wallet visibility
- Revenue and performance reporting
- Store settings and notification preferences
- Light/dark theming

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router v6
- Tailwind CSS
- Recharts (analytics charts)
- Sonner (toast notifications)
- Lucide React (icons)

## Project Structure

```text
src/
	App.tsx                     # Routing and protected route setup
	index.tsx                   # App bootstrap
	index.css                   # Theme tokens + shared utility classes
	components/
		layout/
			DashboardLayout.tsx     # Main app shell (sidebar + top bar + outlet)
			Sidebar.tsx             # Navigation and vendor summary
			TopBar.tsx              # Search, notifications, theme toggle
		shared/
			DataTable.tsx
			Modal.tsx
			StatusBadge.tsx
			KPICard.tsx
			...
	contexts/
		ThemeContext.tsx          # Light/dark mode context
	lib/
		api.ts                    # Generic API client + auth/error handling
		auth.ts                   # Access-token localStorage utilities
		session.ts                # Vendor session localStorage utilities
		vendorApi.ts              # Typed API wrappers per module
	pages/
		Login.tsx
		VendorApplication.tsx
		OnboardingChecklist.tsx
		Dashboard.tsx
		Products.tsx
		AddProduct.tsx
		Categories.tsx
		Orders.tsx
		OrderDetail.tsx
		Returns.tsx
		Reports.tsx
		Payouts.tsx
		Settings.tsx
		Support.tsx
```

## Running Locally

1. Install dependencies.

```bash
npm install
```

2. Create `.env` in the project root.

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

3. Start the dev server.

```bash
npm run dev
```

4. Open the app and log in at `/login` with a valid bearer token.

## Authentication Flow

1. User pastes token on the login page.
2. Token is saved to localStorage key `vendor_access_token`.
3. App verifies token by calling `GET /vendors/me`.
4. Store/vendor session metadata is saved in localStorage:
	 - `vendor_store_name`
	 - `vendor_display_name`
	 - `vendor_user_id`
5. Protected routes are unlocked.

If the backend returns `401`, the app clears token and session automatically.

## Routes

Public routes:

- `/login` - token login
- `/apply` - vendor application flow

Protected routes:

- `/onboarding` - onboarding checklist
- `/` - dashboard home
- `/products` - products list
- `/products/new` - create product
- `/products/:id/edit` - edit product
- `/categories` - category tree management
- `/orders` - orders list
- `/orders/:id` - order detail + actions
- `/returns` - returns view (currently mock data)
- `/reports` - analytics and KPIs
- `/payouts` - wallet and payout history
- `/settings` - store settings and preferences
- `/support` - support ticket UI + FAQ (UI currently local/demo)

## Feature Modules

### 1) Vendor Application

- Multi-step onboarding form for vendor registration
- Submits to `POST /vendors/apply`
- Checks existing application status using `GET /vendors/application`

### 2) Dashboard

- KPI cards (revenue, orders, pending, average order value)
- Revenue chart by selected period (`day`, `week`, `month`)
- Low-stock alerts panel
- Recent orders table

Primary API calls:

- `GET /dashboard/summary`
- `GET /inventory/low-stock/`
- `GET /reports/revenue`

### 3) Products

- Product listing with search and status badges
- Create/edit form with category and status controls
- Delete product action

Primary API calls:

- `GET /products/`
- `GET /products/{id}/`
- `POST /products/`
- `PATCH /products/{id}/`
- `DELETE /products/{id}/`
- `GET /categories/` (for form dropdown)

### 4) Categories

- Hierarchical category tree view
- Create and delete category
- Displays product counts

Primary API calls:

- `GET /categories/tree/`
- `POST /categories/`
- `DELETE /categories/{id}/`

### 5) Orders

- Order list with status tabs and search
- Order detail page with itemized totals
- Status progression actions (`confirmed`, `packed`, `shipped`)
- Cancellation flow for eligible statuses

Primary API calls:

- `GET /orders/`
- `GET /orders/{id}/`
- `PATCH /orders/{id}/status/`
- `POST /orders/{id}/cancel/`

### 6) Reports

- Sales bar chart by selected date range
- KPIs: total sales, total orders, average order value, top category

Primary API calls:

- `GET /reports/revenue`
- `GET /reports/orders`
- `GET /reports/products`

### 7) Payouts

- Available and pending wallet balances
- Payout history table
- Withdraw modal (UI-only placeholder)

Primary API calls:

- `GET /wallet`
- `GET /payouts`

### 8) Settings

- Store profile editing
- Email notification preference
- Updates store name in local session display

Primary API calls:

- `GET /store`
- `PATCH /store`
- `GET /settings`
- `PATCH /settings`

### 9) Support and Returns

- `Support` currently provides local ticket form UI, static ticket examples, and FAQ
- `Returns` currently uses mock data and no backend integration

## API Layer Design

`src/lib/api.ts` provides:

- `apiRequest<T>()` for typed fetch requests
- automatic bearer auth header injection
- query parameter serialization
- response parsing for JSON/text
- normalized error handling via `ApiError`
- session/token cleanup on unauthorized responses

`src/lib/vendorApi.ts` provides typed, feature-oriented wrappers used by pages.

## Theming and Styling

- Theme context toggles `light` and `dark` classes on `document.documentElement`
- Theme preference persists in localStorage key `theme`
- CSS variables define semantic colors (`--bg-primary`, `--text-primary`, etc.)
- Shared utility component classes:
	- `.card`
	- `.input-field`
	- `.btn-primary`
	- `.btn-secondary`
	- `.btn-danger`

## Environment Variables

- `VITE_API_BASE_URL` (optional)
	- default fallback: `/api/v1`
	- use full URL in development if frontend and backend run on different origins

## Scripts

- `npm run dev` - start local development server
- `npm run build` - create production build
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint

## Current Limitations

- Returns screen is mock-data only
- Support ticket submission is UI-only and not connected to backend
- Payout withdrawal modal is UI-only (no withdrawal endpoint wired)
- Some action buttons (for example export controls) are present as placeholders

## Backend Endpoint Reference

For full backend endpoint definitions and payload examples, see:

- `vendoradmindahboard.md`
