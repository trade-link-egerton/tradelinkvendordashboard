# Vendor Dashboard API Documentation

## Overview
This document describes all vendor dashboard endpoints currently implemented in the backend.

- Base URL: `/api/v1`
- Authentication: `Authorization: Bearer <access_token>`
- Content-Type: `application/json`

## Vendor Admission And Store Setup

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/vendors/apply` | Submit a vendor application |
| GET | `/vendors/application` | Fetch current user's application |
| PATCH | `/vendors/application` | Update current user's application fields |
| GET | `/vendors/me` | Get vendor profile |
| PATCH | `/vendors/me` | Update vendor profile |
| GET | `/store` | Get store profile |
| PATCH | `/store` | Update store profile |

### POST /vendors/apply
Request body:
```json
{
  "business_name": "Acme Traders",
  "business_email": "vendor@example.com",
  "business_phone": "+254700000000",
  "tax_id": "A12345",
  "review_notes": "Ready for onboarding"
}
```

Success response (201):
```json
{
  "user_id": "uuid",
  "business_name": "Acme Traders",
  "business_email": "vendor@example.com",
  "business_phone": "+254700000000",
  "tax_id": "A12345",
  "status": "submitted",
  "submitted_at": "2026-04-11T10:22:33.000000+00:00",
  "reviewed_at": null,
  "review_notes": "Ready for onboarding"
}
```

## Admin Vendor Approval

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/admin/vendors` | List all vendor applications |
| PATCH | `/admin/vendors/{user_id}/status` | Approve/reject vendor application |

Notes:
- `GET /admin/vendors` supports query param `status`.
- Allowed status values: `pending`, `submitted`, `approved`, `rejected`.

## Products

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/products/` | Create product |
| GET | `/products/` | List products |
| GET | `/products/{id}/` | Retrieve product |
| PATCH | `/products/{id}/` | Update product |
| DELETE | `/products/{id}/` | Delete product |
| PATCH | `/products/{id}/publish/` | Publish product |
| PATCH | `/products/{id}/archive/` | Archive product |
| POST | `/products/bulk-upload/` | Bulk create products |
| PATCH | `/products/bulk-update/` | Bulk update products |
| POST | `/products/{id}/images/` | Add product image |
| DELETE | `/products/{id}/images/{image_id}/` | Delete product image |

### Product list filters
`GET /products/` supports:
- `search`
- `category_id`
- `min_price`
- `max_price`
- `in_stock`
- `page`
- `limit`

### POST /products/bulk-upload/
Request body:
```json
{
  "products": [
    {
      "name": "Coffee Beans",
      "price": 1200,
      "description": "500g premium beans",
      "stock_quantity": 30,
      "image_url": "https://example.com/coffee.jpg",
      "category_id": "category-uuid"
    }
  ]
}
```

## Categories And Catalog

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/categories/` | List categories |
| POST | `/categories/` | Create category |
| PATCH | `/categories/{id}/` | Update category |
| DELETE | `/categories/{id}/` | Delete category |
| GET | `/categories/tree/` | Get category tree |

## Inventory

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/inventory/` | List inventory snapshot |
| PATCH | `/inventory/{product_id}/` | Update product stock |
| GET | `/inventory/low-stock/` | List low stock products |

Notes:
- `GET /inventory/low-stock/` supports query param `threshold` (default `5`).

## Orders And Fulfillment

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/orders/` | List orders |
| GET | `/orders/{id}/` | Get order details |
| PATCH | `/orders/{id}/status/` | Update order status |
| POST | `/orders/{id}/cancel/` | Cancel order |
| POST | `/orders/{id}/refund/` | Record refund |
| POST | `/orders/{id}/ship/` | Mark order shipped |

Allowed statuses for `PATCH /orders/{id}/status/`:
- `new`
- `pending`
- `confirmed`
- `packed`
- `shipped`
- `delivered`
- `cancelled`

## Payouts And Wallet

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/payouts` | List vendor payouts |
| GET | `/payouts/{id}` | Get payout details |
| GET | `/wallet` | Get wallet balances |

## Reports And Analytics

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/reports/revenue` | Revenue totals |
| GET | `/reports/orders` | Orders by status |
| GET | `/reports/products` | Product metrics |
| GET | `/reports/custom?from=...&to=...` | Date-range custom report |
| GET | `/reports/export` | Export metadata |
| GET | `/dashboard/summary` | Dashboard aggregate metrics |

### GET /dashboard/summary
Success response (200):
```json
{
  "revenueToday": 0,
  "ordersToday": 0,
  "pendingOrders": 0,
  "lowStockCount": 0,
  "topProducts": [],
  "recentOrders": []
}
```

## Reviews And Customer Interaction

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/reviews/` | List all reviews |
| GET | `/reviews/{product_id}/` | List reviews for a product |
| POST | `/reviews/{id}/respond/` | Respond to review |

### POST /reviews/{id}/respond/
Request body:
```json
{
  "response": "Thank you for your feedback. We have fixed this issue."
}
```

Success response (201):
```json
{
  "review_id": "review-uuid",
  "response": "Thank you for your feedback. We have fixed this issue.",
  "responder_id": "vendor-user-uuid"
}
```

## Notifications And Settings

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/notifications` | List notifications |
| PATCH | `/notifications/{id}/read` | Mark notification as read |
| GET | `/settings` | Get vendor settings |
| PATCH | `/settings` | Update vendor settings |

## Error Responses
Common error payload:
```json
{
  "detail": "Error message"
}
```

Typical status codes:
- `200` success
- `201` created
- `204` no content
- `400` bad request
- `401` unauthorized
- `403` forbidden
- `404` not found
- `500` server error

## Implementation Notes
- Some vendor dashboard endpoints currently use in-memory stores for temporary data handling:
  - vendor applications
  - store profiles
  - settings
  - notifications
  - review responses
- Products, orders, payments, inventory calculations, payouts, and reports are backed by existing service-layer integrations.


0791323200