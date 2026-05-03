Tradlink Vendor Reports API Documentation
Version: 1.0
Base URL: https://api.tradlink.co.ke/api/reports/
Content-Type: application/json
Authentication: Bearer token (JWT) in Authorization header
Authentication
All endpoints require an Authorization header with a valid Supabase JWT:
http
Copy

Authorization: Bearer <supabase_jwt_token>

The token must belong to a user with an associated vendor_profile. The API extracts vendor_id automatically from the token.
Common Query Parameters
Date Ranges
Table
Value	Description
today	From 00:00 UTC today until now
7d	Last 7 days
30d	Last 30 days (default for most endpoints)
90d	Last 90 days
quarter	Current quarter
year	Current calendar year
all	All historical data
Status Values
Table
Value	Description
all	No status filter (default)
pending	Order/shipment awaiting action
processing	Being prepared
shipped	Dispatched
delivered	Completed successfully
cancelled	Cancelled by user or system
failed	Payment or delivery failed
in_transit	Currently in transit
Sort Options
Table
Endpoint	Valid Sort Values
Orders	date, amount_desc, status
Products	qty_desc, qty_asc, revenue_desc
Error Responses
Standard Error Format
JSON
Copy

{
  "detail": "Human-readable error message",
  "code": "error_code_optional"
}

HTTP Status Codes
Table
Code	Meaning	When
200	OK	Successful report generation
400	Bad Request	Invalid query parameter (e.g., invalid date range)
401	Unauthorized	Missing or invalid JWT
403	Forbidden	User is not a vendor
404	Not Found	Vendor profile not found
501	Not Implemented	Report backend not yet connected (inventory, earnings, etc.)
503	Service Unavailable	Supabase RPC timeout or connection error
Endpoints
1. Sales Overview
GET /api/reports/sales/
Revenue time-series, order totals, average order value, and top category for the authenticated vendor.
Query Parameters
Table
Parameter	Type	Required	Default	Description
range	string	No	30d	Date range filter
status	string	No	all	Filter by order status
granularity	string	No	daily	Time bucketing: hourly, daily, weekly, monthly
Response 200 OK
JSON
Copy

{
  "revenue_series": [
    { "label": "2026-04-03", "value": 12500 },
    { "label": "2026-04-04", "value": 18700 },
    { "label": "2026-04-05", "value": 9400 }
  ],
  "total_orders": 47,
  "total_sales": 154200,
  "avg_order_value": 3280.85,
  "top_category": "Electronics"
}

Field Descriptions
Table
Field	Type	Description
revenue_series	array	Time-bucketed revenue data points
revenue_series[].label	string	Period label (date or month name)
revenue_series[].value	number	Revenue amount in KES
total_orders	integer	Count of orders in period
total_sales	number	Sum of all revenue in period (KES)
avg_order_value	number	total_sales / total_orders
top_category	string	Name of best-selling category by volume
Example Request
bash
Copy

curl -H "Authorization: Bearer <token>" \
  "https://api.tradlink.co.ke/api/reports/sales/?range=30d&status=all&granularity=daily"

2. Orders Report
GET /api/reports/orders/
Paginated list of all orders containing the vendor's products, with filtering and search.
Query Parameters
Table
Parameter	Type	Required	Default	Description
range	string	No	30d	Date range filter
status	string	No	all	Order status filter
shipping_type	string	No	all	home or pickup
sort	string	No	date	Sort order
search	string	No	—	Fuzzy search on order ID or product name
Response 200 OK
JSON
Copy

{
  "total_orders": 156,
  "orders": [
    {
      "order_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "order_date": "2026-05-01 14:32",
      "item_count": 3,
      "total_amount": 4500.00,
      "shipping_type": "home",
      "status": "delivered"
    }
  ]
}

Field Descriptions
Table
Field	Type	Description
total_orders	integer	Total matching orders
orders	array	Order rows
orders[].order_id	UUID	Unique order identifier
orders[].order_date	string	Formatted date string YYYY-MM-DD HH24:MI
orders[].item_count	integer	Number of items from this vendor in the order
orders[].total_amount	number	Total KES value of vendor's items
orders[].shipping_type	string	home or pickup
orders[].status	string	Current order status
Example Request
bash
Copy

curl -H "Authorization: Bearer <token>" \
  "https://api.tradlink.co.ke/api/reports/orders/?range=7d&status=pending&shipping_type=home&sort=date"

3. Product Performance
GET /api/reports/products/
Best and worst selling products with quantity sold and revenue.
Query Parameters
Table
Parameter	Type	Required	Default	Description
range	string	No	30d	Date range (7d, 30d, 90d, all)
sort	string	No	qty_desc	Sort by quantity or revenue
search	string	No	—	Filter by product name (case-insensitive)
Response 200 OK
JSON
Copy

{
  "products": [
    {
      "product_name": "Wireless Earbuds Pro",
      "qty_sold": 142,
      "revenue": 426000.00
    },
    {
      "product_name": "USB-C Cable 2m",
      "qty_sold": 89,
      "revenue": 8900.00
    }
  ]
}

Field Descriptions
Table
Field	Type	Description
products	array	Product performance rows
products[].product_name	string	Product name
products[].qty_sold	integer	Total units sold in period
products[].revenue	number	Total revenue in KES
Example Request
bash
Copy

curl -H "Authorization: Bearer <token>" \
  "https://api.tradlink.co.ke/api/reports/products/?range=30d&sort=revenue_desc&search=earbuds"

4. Stock Levels
GET /api/reports/inventory/
Current inventory snapshot, low-stock alerts, and flash-sale status.

    Status: 501 Not Implemented — Backend RPC not yet connected.

Query Parameters
Table
Parameter	Type	Required	Default	Description
stock_level	string	No	all	all, low (<10), out, healthy
sort	string	No	qty_asc	qty_asc, qty_desc, updated, price
search	string	No	—	Product name search
flash_sale_only	boolean	No	false	Only flash-sale items
Response 501 Not Implemented
JSON
Copy

{
  "detail": "Inventory API not yet connected"
}

Planned Response 200 OK
JSON
Copy

{
  "total_skus": 45,
  "low_stock": 3,
  "out_of_stock": 1,
  "flash_sale_items": 8,
  "products": [
    {
      "product_name": "Running Shoes",
      "quantity": 4,
      "price": 3500.00,
      "is_flash_sale": false,
      "last_updated": "2026-04-28T09:15:00Z"
    }
  ]
}

5. Stock Movements
GET /api/reports/movements/
History of inventory changes (sales, restocks, manual adjustments).

    Status: 501 Not Implemented — Backend RPC not yet connected.

Query Parameters
Table
Parameter	Type	Required	Default	Description
range	string	No	30d	Date range
movement_type	string	No	all	all, in, order, manual
Response 501 Not Implemented
JSON
Copy

{
  "detail": "Movements API not yet connected"
}

Planned Response 200 OK
JSON
Copy

{
  "movements": [
    {
      "movement_id": "uuid",
      "product_name": "T-Shirt Black",
      "movement_type": "order",
      "quantity_change": -2,
      "previous_quantity": 15,
      "new_quantity": 13,
      "reference_id": "order-uuid",
      "created_at": "2026-05-01T10:00:00Z"
    }
  ]
}

6. Earnings
GET /api/reports/earnings/
Wallet balance breakdown and period earnings summary.

    Status: 501 Not Implemented — Backend RPC not yet connected.

Query Parameters
Table
Parameter	Type	Required	Default	Description
range	string	No	30d	30d, quarter, year, all
Response 501 Not Implemented
JSON
Copy

{
  "detail": "Wallet API not yet connected"
}

Planned Response 200 OK
JSON
Copy

{
  "available_balance": 125000.00,
  "pending_balance": 45000.00,
  "period_earnings": 89000.00,
  "currency": "KES",
  "completed_orders_count": 34
}

7. Payouts
GET /api/reports/payouts/
Payout history, status tracking, and payment method breakdown.

    Status: 501 Not Implemented — Backend RPC not yet connected.

Query Parameters
Table
Parameter	Type	Required	Default	Description
range	string	No	30d	Date range
status	string	No	all	all, pending, completed, failed
payment_method	string	No	all	all, mpesa_till, mpesa_paybill, bank_transfer, mobile_money
Response 501 Not Implemented
JSON
Copy

{
  "detail": "Payouts API not yet connected"
}

Planned Response 200 OK
JSON
Copy

{
  "total_paid_out": 250000.00,
  "pending": 45000.00,
  "failed": 0.00,
  "payout_count": 12,
  "payouts": [
    {
      "payout_id": "uuid",
      "amount": 50000.00,
      "status": "completed",
      "method": "mpesa_till",
      "requested_at": "2026-04-15T08:00:00Z",
      "processed_at": "2026-04-15T10:30:00Z"
    }
  ]
}

8. Product Reviews
GET /api/reports/reviews/
Customer feedback, ratings distribution, and product-level review data.

    Status: 501 Not Implemented — Backend RPC not yet connected.

Query Parameters
Table
Parameter	Type	Required	Default	Description
range	string	No	30d	30d, 90d, all
rating	string	No	all	all, 5, 4, 3 (3 and below)
search	string	No	—	Product name search
Response 501 Not Implemented
JSON
Copy

{
  "detail": "Reviews API not yet connected"
}

Planned Response 200 OK
JSON
Copy

{
  "avg_rating": 4.3,
  "total_reviews": 128,
  "five_star": 78,
  "low_star": 12,
  "reviews": [
    {
      "product_name": "Wireless Earbuds Pro",
      "rating_value": 5,
      "comment": "Great sound quality!",
      "date_created": "2026-04-20T16:45:00Z"
    }
  ]
}

9. Shipments
GET /api/reports/shipments/
Delivery status, tracking numbers, and shipment history.

    Status: 501 Not Implemented — Backend RPC not yet connected.

Query Parameters
Table
Parameter	Type	Required	Default	Description
range	string	No	30d	7d, 30d, custom
status	string	No	all	all, pending, in_transit, delivered, failed
search	string	No	—	Tracking number search
Response 501 Not Implemented
JSON
Copy

{
  "detail": "Shipments API not yet connected"
}

Planned Response 200 OK
JSON
Copy

{
  "total_shipments": 89,
  "in_transit": 12,
  "delivered": 72,
  "failed": 5,
  "shipments": [
    {
      "shipment_id": "uuid",
      "tracking_number": "TRK123456789",
      "status": "in_transit",
      "delivery_fee": 250.00,
      "last_update_time": "2026-05-02T14:00:00Z"
    }
  ]
}

10. Suborders
GET /api/reports/suborders/
Vendor-specific slices of multi-vendor orders.

    Status: 501 Not Implemented — Backend RPC not yet connected.

Query Parameters
Table
Parameter	Type	Required	Default	Description
range	string	No	30d	7d, 30d, 90d
status	string	No	all	Order status filter
Response 501 Not Implemented
JSON
Copy

{
  "detail": "Suborders API not yet connected"
}

Planned Response 200 OK
JSON
Copy

{
  "total_suborders": 64,
  "total_subtotal": 320000.00,
  "pending": 8,
  "delivered": 52,
  "suborders": [
    {
      "suborder_id": "uuid",
      "order_id": "parent-order-uuid",
      "subtotal": 5000.00,
      "status": "delivered",
      "created_at": "2026-04-25T11:00:00Z"
    }
  ]
}

Data Types Reference
Currency
All monetary values are returned as numbers (not strings) in KES (Kenyan Shilling).
Dates & Times

    Query params: Use range keywords (30d, 7d, etc.)
    Response strings: YYYY-MM-DD HH24:MI for display dates
    Response ISO: YYYY-MM-DDTHH:mm:ssZ for machine-readable timestamps

UUIDs
All identifiers are standard UUID v4 strings.
Null Handling
Fields with no value return null (not "N/A" or "—"). The frontend should handle nulls for display formatting.
Rate Limits
Table
Tier	Requests / Minute
Standard	60
Premium	300
429 responses include a Retry-After header.
Changelog
Table
Version	Date	Changes
1.0	2026-05-03	Initial documentation for Sales, Orders, Products. Stubs for remaining 7 reports.
Document generated for the Tradlink Frontend Team.