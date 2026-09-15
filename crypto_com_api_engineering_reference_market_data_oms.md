# Crypto.com Exchange Institutional API v1

## Engineering Reference for Market Data + OMS --- REST, WebSocket and FIX 4.4

**Purpose:** implementation-oriented reference for building (1) a
market-data service and (2) an order-management system against
Crypto.com Exchange.

**Documentation baseline:** official Crypto.com Institutional Exchange
API v1 and FIX 4.4 documentation, checked 2026-09-15.

> This is an engineering consolidation, not a verbatim mirror. Payloads
> marked **official-style example** follow the documented schema; values
> may be illustrative. When a field is product/account dependent,
> validate against UAT and the official specification before production.

------------------------------------------------------------------------

# 0. What you should be able to build from this document

After implementing the pieces below you should have:

### Market-data service

``` text
instrument reference
    ↓
WS/FIX connection management
    ↓
book snapshot / incremental updates
    ↓
local L2 book
    ↓
BBO / depth / trades / ticker / candles / mark / index / funding
    ↓
normalized event bus
```

### OMS

``` text
strategy / trader
    ↓
pre-trade validation
    ↓
client-order-id allocator
    ↓
order gateway (REST/WS/FIX)
    ↓
exchange acknowledgement
    ↓
user.order / FIX ExecutionReport
    ↓
order state machine
    ↓
user.trade / FIX fills
    ↓
positions + balances + reconciliation
    ↓
persistent journal
```

The key architectural rule is that **order submission/cancellation is
asynchronous**. A successful request acknowledgement is not the final
order state. Order state must be driven by `user.order` or FIX
`ExecutionReport`, and fills by `user.trade` / FIX trade execution
reports.

------------------------------------------------------------------------

# 1. Environments

## REST

Production:

``` text
https://api.crypto.com/exchange/v1/{method}
```

UAT:

``` text
https://uat-api.3ona.co/exchange/v1/{method}
```

Header:

``` http
Content-Type: application/json
```

## WebSocket

Production user/authenticated:

``` text
wss://stream.crypto.com/exchange/v1/user
```

Production market data:

``` text
wss://stream.crypto.com/exchange/v1/market
```

UAT user:

``` text
wss://uat-stream.3ona.co/exchange/v1/user
```

UAT market:

``` text
wss://uat-stream.3ona.co/exchange/v1/market
```

## FIX

FIX uses AWS PrivateLink. Production endpoint families:

``` text
Order Management : tcp://prd3-fix-ud-f18b.crypto.local:31301
Drop Copy        : tcp://prd3-fix-uc-f18b.crypto.local:30300
BTC Market Data  : tcp://prd3-fix-md-f18b.crypto.local:34402
ETH Market Data  : tcp://prd3-fix-md-f18b.crypto.local:34403
Other MD shards  : tcp://prd3-fix-md-f18b.crypto.local:34405-34407
```

UAT:

``` text
Order Management : tcp://uat1-fix-ud-f18a.crypto.local:31301
Drop Copy        : tcp://uat1-fix-uc-f18a.crypto.local:30300
BTC Market Data  : tcp://uat1-fix-md-f18a.crypto.local:34402
ETH Market Data  : tcp://uat1-fix-md-f18a.crypto.local:34403
Other MD shards  : tcp://uat1-fix-md-f18a.crypto.local:34405-34407
```

Market-data routing:

``` text
BTC-related                -> 34402
ETH-related incl. ETH/BTC  -> 34403
symbol first char 0-9/A-D  -> 34405
E-M                        -> 34406
N-Z                        -> 34407
```

------------------------------------------------------------------------

# 2. Numeric and time conventions

Treat price and quantity as decimal values, never binary floating point.

Recommended application types:

``` text
C#     decimal
Java   BigDecimal
Python Decimal
Rust   rust_decimal::Decimal (or equivalent fixed decimal)
```

The API explicitly requires prices to be JSON strings.

Examples:

``` json
"price": "68250.50"
"quantity": "0.125"
```

REST/WS timestamps are usually Unix epoch milliseconds, while some
history fields use nanoseconds. Do not infer units from magnitude inside
generic code; model them explicitly.

FIX timestamps use FIX UTC timestamp syntax, e.g.:

``` text
20190525-08:26:38.989
```

------------------------------------------------------------------------

# 3. Authentication --- REST / WebSocket

## Request envelope

``` json
{
  "id": 10001,
  "method": "private/get-open-orders",
  "api_key": "YOUR_API_KEY",
  "params": {},
  "nonce": 1789450000000,
  "sig": "HMAC_SHA256_HEX"
}
```

## Signature

Conceptually:

``` text
paramsString = canonical(params)
payload =
    method
  + id
  + api_key
  + paramsString
  + nonce

sig = HEX(HMAC_SHA256(secret, payload))
```

Canonical parameter serialization:

1.  sort object keys ascending;
2.  append `key + value`, no separator;
3.  recursively flatten maps/lists according to Crypto.com's algorithm;
4.  preserve decimal textual representation;
5.  sign UTF-8 bytes.

Pseudo-code:

``` text
function flatten(x, level):
    if level >= 3:
        return string(x)

    if map:
        out = ""
        for key in sort(keys):
            out += key
            out += flatten(value, level + 1)
        return out

    if list:
        return concat(flatten(item, level + 1) for item in x)

    return canonicalString(x)
```

Then:

``` text
HMAC_SHA256(secret, method + id + apiKey + flatten(params,0) + nonce)
```

### Important JavaScript issue

Large `order_id` values can exceed exact integer precision in
JavaScript. Model exchange identifiers as strings.

------------------------------------------------------------------------

# 4. WebSocket authentication

Connect to the user socket, wait approximately one second before sending
requests, then:

``` json
{
  "id": 1,
  "method": "public/auth",
  "api_key": "YOUR_API_KEY",
  "nonce": 1789450000000,
  "sig": "..."
}
```

Success:

``` json
{
  "id": 1,
  "method": "public/auth",
  "code": 0
}
```

After authentication, private commands on that socket do not need
`api_key` and `sig` on every message.

------------------------------------------------------------------------

# 5. Heartbeat and reconnect

Server heartbeat:

``` json
{
  "id": 1587523073344,
  "method": "public/heartbeat",
  "code": 0
}
```

Respond within 5 seconds:

``` json
{
  "id": 1587523073344,
  "method": "public/respond-heartbeat"
}
```

Expected interval is approximately 30 seconds.

A production WS client should maintain:

``` text
connection_state
last_rx_time
last_heartbeat_time
last_heartbeat_reply
authenticated
active_subscriptions
pending_requests[id]
reconnect_attempt
```

Reconnect procedure:

``` text
disconnect detected
 -> stop accepting new outbound OMS commands or queue them safely
 -> reconnect
 -> wait ~1s
 -> authenticate user socket
 -> resubscribe private channels
 -> resubscribe market channels
 -> REST get-open-orders
 -> REST get-trades for missing time interval
 -> positions
 -> balances
 -> reconcile local state
 -> resume normal operation
```

------------------------------------------------------------------------

# 6. Rate limits

REST private:

  Method                          Limit
  ----------------------- -------------
  create-order              15 / 100 ms
  cancel-order              15 / 100 ms
  cancel-all-orders         15 / 100 ms
  get-order-detail          30 / 100 ms
  get-trades                        1/s
  get-order-history                 1/s
  other private methods      3 / 100 ms

Public market-data REST endpoints are generally 100/s per method/IP.

WS:

``` text
User socket   150 requests/s
Market socket 100 requests/s
```

`private/get-trades` and `private/get-order-history` are 5/s over WS.

FIX:

``` text
Order Entry     2500 requests/s
Market requests   20 requests/s
```

Implement token buckets per endpoint class, not one global limiter.

------------------------------------------------------------------------

# PART I --- REST API

# 7. Public reference / market-data endpoints

## 7.1 `public/get-instruments`

**Use:** bootstrap symbol/reference data.

**Transport:** REST GET.

Request:

``` http
GET /exchange/v1/public/get-instruments
```

Response shape:

``` json
{
  "id": 1,
  "method": "public/get-instruments",
  "code": 0,
  "result": {
    "data": [
      {
        "symbol": "BTCUSD-PERP",
        "inst_type": "PERPETUAL_SWAP",
        "display_name": "BTCUSD Perpetual",
        "base_ccy": "BTC",
        "quote_ccy": "USD",
        "quote_decimals": 2,
        "quantity_decimals": 4,
        "price_tick_size": "0.5",
        "qty_tick_size": "0.0001",
        "max_leverage": "50",
        "tradable": true,
        "expiry_timestamp_ms": 1624012801123,
        "underlying_symbol": "BTCUSD-INDEX",
        "product_type": "DIGITAL_CURRENCIES"
      }
    ]
  }
}
```

Store at minimum:

``` text
symbol
instrument_type
base
quote
price_tick
qty_tick
price_decimals
qty_decimals
max_leverage
tradable
expiry
underlying
product_type
```

Pre-trade validation:

``` text
price % price_tick_size == 0
quantity % qty_tick_size == 0
tradable == true
```

------------------------------------------------------------------------

## 7.2 `public/get-book`

**Use:** REST L2 snapshot/recovery.

``` http
GET /exchange/v1/public/get-book?instrument_name=BTCUSD-PERP&depth=10
```

Response:

``` json
{
  "code": 0,
  "method": "public/get-book",
  "result": {
    "depth": 10,
    "data": [{
      "asks": [
        ["68251.0", "0.4000", "0"],
        ["68252.0", "1.2790", "0"]
      ],
      "bids": [
        ["68250.5", "0.8000", "0"],
        ["68249.5", "1.1000", "0"]
      ],
      "t": 1789450000123,
      "tt": 1789450000100,
      "u": 545391566464
    }]
  }
}
```

Interpret levels as exchange-defined tuples; keep the third element even
if unused by your current strategy.

Do not poll this endpoint to emulate streaming market data. Use WS/FIX
for production MD.

------------------------------------------------------------------------

## 7.3 `public/get-candlestick`

Request:

``` http
GET /exchange/v1/public/get-candlestick?instrument_name=BTCUSD-PERP&timeframe=M5
```

Response:

``` json
{
  "id": 1,
  "method": "public/get-candlestick",
  "code": 0,
  "result": {
    "interval": "M5",
    "data": [{
      "o": "68100.5",
      "h": "68320.0",
      "l": "68050.0",
      "c": "68202.0",
      "v": "17.2032",
      "t": 1789449900000
    }]
  }
}
```

Fields:

``` text
o open
h high
l low
c close
v volume
t candle start timestamp
```

------------------------------------------------------------------------

## 7.4 `public/get-trades`

``` http
GET /exchange/v1/public/get-trades?instrument_name=BTCUSD-PERP&count=5
```

Response:

``` json
{
  "id": 1,
  "method": "public/get-trades",
  "code": 0,
  "result": {
    "data": [{
      "s": "SELL",
      "p": "68250.5",
      "q": "0.1819",
      "t": 1789450000000,
      "d": "15281981878",
      "i": "BTCUSD-PERP"
    }]
  }
}
```

Normalize to:

``` text
instrument
trade_id
timestamp
price
quantity
taker_side
```

------------------------------------------------------------------------

## 7.5 `public/get-tickers`

Single instrument:

``` http
GET /exchange/v1/public/get-tickers?instrument_name=BTCUSD-PERP
```

Response shape:

``` json
{
  "id": -1,
  "method": "public/get-tickers",
  "code": 0,
  "result": {
    "data": [{
      "h": "69000.0",
      "l": "66500.0",
      "a": "68250.5",
      "i": "BTCUSD-PERP",
      "v": "12345.67",
      "vv": "842000000",
      "oi": "10000",
      "c": "0.021",
      "b": "68250.0",
      "k": "68250.5",
      "t": 1789450000000
    }]
  }
}
```

------------------------------------------------------------------------

## 7.6 `public/get-valuations`

Use for index, mark/funding valuation history according to supported
`valuation_type`.

``` http
GET /exchange/v1/public/get-valuations?instrument_name=BTCUSD-INDEX&valuation_type=index_price&count=1
```

Response:

``` json
{
  "id": 1,
  "method": "public/get-valuations",
  "code": 0,
  "result": {
    "data": [{
      "v": "68247.73",
      "t": 1789450000000
    }],
    "instrument_name": "BTCUSD-INDEX"
  }
}
```

Relevant valuation types include:

``` text
index_price
mark_price
funding_rate
estimated_funding_rate
```

Use the exact supported type for the instrument/product.

------------------------------------------------------------------------

## 7.7 `public/get-expired-settlement-price`

``` http
GET /exchange/v1/public/get-expired-settlement-price?instrument_type=FUTURE&page=1
```

Response item:

``` json
{
  "i": "BTCUSD-YYMMDD",
  "x": 1789450000000,
  "v": "68247.73",
  "t": 1789449940000
}
```

``` text
i instrument
x expiry timestamp
v settlement value
t timestamp
```

------------------------------------------------------------------------

## 7.8 `public/get-insurance`

``` http
GET /exchange/v1/public/get-insurance?instrument_name=USD&count=1
```

Response:

``` json
{
  "id": 1,
  "method": "public/get-insurance",
  "code": 0,
  "result": {
    "data": [{
      "v": "50000000",
      "t": 1789450000000
    }],
    "instrument_name": "USD"
  }
}
```

Optional filters include `count`, `start_ts`, `end_ts`.

------------------------------------------------------------------------

# 8. Private account / balance / position API

All examples below omit `api_key`/`sig` for readability. REST production
requests must be signed.

Generic signed POST:

``` json
{
  "id": 100,
  "method": "private/...",
  "api_key": "...",
  "params": {},
  "nonce": 1789450000000,
  "sig": "..."
}
```

## 8.1 `private/user-balance`

Request:

``` json
{
  "id": 11,
  "method": "private/user-balance",
  "params": {}
}
```

Important account-level fields:

``` text
total_available_balance
total_margin_balance
total_initial_margin
total_position_im
total_haircut
total_maintenance_margin
total_position_cost
total_cash_balance
total_collateral_value
total_session_unrealized_pnl
total_session_realized_pnl
total_effective_leverage
position_limit
used_position_limit
is_liquidating
position_balances[]
```

OMS usage:

``` text
startup reconciliation
periodic risk snapshot
pre-trade sanity check
post-disconnect reconciliation
```

Do not use it as the only real-time risk feed; subscribe to user
balance/risk streams.

------------------------------------------------------------------------

## 8.2 `private/user-balance-history`

``` json
{
  "id": 11,
  "method": "private/user-balance-history",
  "params": {}
}
```

Response shape:

``` json
{
  "result": {
    "instrument_name": "USD",
    "data": [{
      "t": 1629478800000,
      "c": "811.621851"
    }]
  }
}
```

------------------------------------------------------------------------

## 8.3 `private/get-accounts`

``` json
{
  "id": 12,
  "method": "private/get-accounts",
  "params": {
    "page_size": 30,
    "page": 1
  },
  "nonce": 1789450000000
}
```

Returns master/sub-account metadata. Cache account UUIDs and explicitly
map them to your internal account model.

------------------------------------------------------------------------

## 8.4 `private/create-subaccount-transfer`

Purpose: transfer assets between eligible master/sub-account contexts.

Engineering payload pattern:

``` json
{
  "id": 13,
  "method": "private/create-subaccount-transfer",
  "params": {
    "from": "<source-account-uuid>",
    "to": "<destination-account-uuid>",
    "currency": "USDT",
    "amount": "1000"
  },
  "nonce": 1789450000000
}
```

**Important:** account-transfer field availability/semantics can depend
on account setup. Validate the exact account identifiers and parameter
names against UAT/current official endpoint table before enabling money
movement.

OMS should isolate transfer permissions from trading API keys.

------------------------------------------------------------------------

## 8.5 `private/get-subaccount-balances`

``` json
{
  "id": 14,
  "method": "private/get-subaccount-balances",
  "params": {},
  "nonce": 1789450000000
}
```

The endpoint requires an explicit empty `params` object.

Response is account-grouped and includes balance/margin/collateral
information.

------------------------------------------------------------------------

## 8.6 `private/get-positions`

All:

``` json
{
  "id": 1,
  "method": "private/get-positions",
  "params": {},
  "nonce": 1789450000000
}
```

Filter:

``` json
{
  "id": 1,
  "method": "private/get-positions",
  "params": {
    "instrument_name": "BTCUSD-PERP"
  },
  "nonce": 1789450000000
}
```

Representative position:

``` json
{
  "account_id": "...",
  "quantity": "-0.1984",
  "cost": "-10159.573500",
  "open_position_pnl": "-497.743736",
  "open_pos_cost": "-10159.352200",
  "session_pnl": "2.236145",
  "update_timestamp_ms": 1789450000000,
  "instrument_name": "BTCUSD-PERP",
  "type": "PERPETUAL_SWAP"
}
```

------------------------------------------------------------------------

# 9. Trading API

# 9.1 `private/create-order`

Request:

``` json
{
  "id": 1001,
  "method": "private/create-order",
  "params": {
    "instrument_name": "BTCUSD-PERP",
    "side": "BUY",
    "type": "LIMIT",
    "price": "68200.0",
    "quantity": "0.01",
    "client_oid": "oms-20260915-000001",
    "time_in_force": "GOOD_TILL_CANCEL"
  },
  "nonce": 1789450000000
}
```

Core parameters:

  -----------------------------------------------------------------------
  Parameter                           Meaning
  ----------------------------------- -----------------------------------
  instrument_name                     exchange symbol

  side                                BUY / SELL

  type                                LIMIT, MARKET and supported
                                      conditional types

  price                               limit price

  quantity                            quantity

  client_oid                          client-generated
                                      idempotency/reconciliation ID

  time_in_force                       GOOD_TILL_CANCEL /
                                      IMMEDIATE_OR_CANCEL / FILL_OR_KILL

  exec_inst                           e.g. POST_ONLY

  ref_price                           conditional trigger reference

  ref_price_type                      MARK_PRICE / INDEX_PRICE /
                                      LAST_PRICE

  spot_margin                         SPOT / MARGIN

  broker_id                           broker identifier

  stp_scope                           self-trade-prevention scope

  stp_inst                            STP action

  stp_id                              STP ID
  -----------------------------------------------------------------------

Limit order:

``` json
{
  "instrument_name": "BTC_USDT",
  "side": "BUY",
  "type": "LIMIT",
  "price": "68200",
  "quantity": "0.01",
  "client_oid": "cl-1"
}
```

Market sell:

``` json
{
  "instrument_name": "BTC_USDT",
  "side": "SELL",
  "type": "MARKET",
  "quantity": "0.01",
  "client_oid": "cl-2"
}
```

Post-only:

``` json
{
  "instrument_name": "BTC_USDT",
  "side": "BUY",
  "type": "LIMIT",
  "price": "68100",
  "quantity": "0.01",
  "exec_inst": "POST_ONLY",
  "time_in_force": "GOOD_TILL_CANCEL",
  "client_oid": "cl-3"
}
```

Conditional stop-style pattern:

``` json
{
  "instrument_name": "BTCUSD-PERP",
  "side": "SELL",
  "type": "STOP_LIMIT",
  "price": "66000",
  "quantity": "0.10",
  "ref_price": "66500",
  "ref_price_type": "MARK_PRICE",
  "client_oid": "stop-1"
}
```

Successful request response pattern:

``` json
{
  "id": 1001,
  "method": "private/create-order",
  "code": 0,
  "result": {
    "client_oid": "oms-20260915-000001",
    "order_id": "5755600460443882762"
  }
}
```

**Do not transition directly to LIVE/WORKING solely because this
response succeeded.** Treat it as gateway acknowledgement and wait for
order events.

------------------------------------------------------------------------

# 9.2 `private/cancel-order`

By exchange order id:

``` json
{
  "id": 1002,
  "method": "private/cancel-order",
  "params": {
    "instrument_name": "BTCUSD-PERP",
    "order_id": "5755600460443882762"
  },
  "nonce": 1789450000100
}
```

Your OMS state should become `PENDING_CANCEL`, not immediately
`CANCELED`.

Final state comes from `user.order` / FIX ExecutionReport.

------------------------------------------------------------------------

# 9.3 `private/cancel-all-orders`

Typical instrument-scoped pattern:

``` json
{
  "id": 1003,
  "method": "private/cancel-all-orders",
  "params": {
    "instrument_name": "BTCUSD-PERP"
  },
  "nonce": 1789450000200
}
```

Use for kill-switch workflows, but still reconcile each affected order.

------------------------------------------------------------------------

# 9.4 `private/close-position`

``` json
{
  "id": 1004,
  "method": "private/close-position",
  "params": {
    "instrument_name": "BTCUSD-PERP",
    "type": "MARKET"
  },
  "nonce": 1789450000300
}
```

Representative response:

``` json
{
  "code": 0,
  "result": {
    "client_oid": "...",
    "order_id": "15744"
  }
}
```

This is asynchronous.

------------------------------------------------------------------------

# 9.5 `private/get-open-orders`

All:

``` json
{
  "id": 1005,
  "method": "private/get-open-orders",
  "params": {},
  "nonce": 1789450000400
}
```

By instrument:

``` json
{
  "id": 1005,
  "method": "private/get-open-orders",
  "params": {
    "instrument_name": "BTCUSD-PERP"
  },
  "nonce": 1789450000400
}
```

This endpoint is central to OMS startup/reconnect reconciliation.

------------------------------------------------------------------------

# 9.6 `private/get-order-detail`

By order ID:

``` json
{
  "id": 1006,
  "method": "private/get-order-detail",
  "params": {
    "order_id": "5755600460443882762"
  },
  "nonce": 1789450000500
}
```

Where supported, query by `client_oid`:

``` json
{
  "id": 1006,
  "method": "private/get-order-detail",
  "params": {
    "client_oid": "oms-20260915-000001"
  },
  "nonce": 1789450000500
}
```

Use this endpoint for targeted recovery, not continuous polling.

------------------------------------------------------------------------

# 9.7 `private/change-account-leverage`

Pattern:

``` json
{
  "id": 1007,
  "method": "private/change-account-leverage",
  "params": {
    "leverage": "5"
  },
  "nonce": 1789450000600
}
```

Treat leverage changes as privileged risk actions and serialize them
against trading if your risk model depends on leverage.

------------------------------------------------------------------------

# 9.8 `private/change-account-settings`

Pattern:

``` json
{
  "id": 1008,
  "method": "private/change-account-settings",
  "params": {
    "<setting>": "<value>"
  },
  "nonce": 1789450000700
}
```

Account settings evolve and are account/product dependent. Query current
settings first and whitelist only settings your application explicitly
supports.

------------------------------------------------------------------------

# 9.9 `private/get-account-settings`

``` json
{
  "id": 1009,
  "method": "private/get-account-settings",
  "params": {},
  "nonce": 1789450000800
}
```

Persist the returned configuration with a timestamp for audit/debugging.

------------------------------------------------------------------------

# 10. Advanced Order Management

## 10.1 `private/create-order-list` --- LIST

``` json
{
  "id": 6573,
  "method": "private/create-order-list",
  "params": {
    "contingency_type": "LIST",
    "order_list": [
      {
        "instrument_name": "CRO_USD",
        "side": "SELL",
        "type": "LIMIT",
        "quantity": "10",
        "price": "0.12",
        "client_oid": "api_leg1"
      },
      {
        "instrument_name": "CRO_USD",
        "side": "SELL",
        "type": "LIMIT",
        "quantity": "20",
        "price": "0.122",
        "client_oid": "api_leg2"
      }
    ]
  },
  "nonce": 1789450000000
}
```

Response is item-level:

``` json
{
  "code": 0,
  "result": [
    {
      "code": 0,
      "index": 0,
      "client_oid": "api_leg1",
      "order_id": "5755600460443882762"
    },
    {
      "code": 306,
      "index": 1,
      "client_oid": "api_leg2",
      "message": "INSUFFICIENT_AVAILABLE_BALANCE",
      "order_id": "..."
    }
  ]
}
```

Do not assume batch atomicity.

------------------------------------------------------------------------

## 10.2 `private/cancel-order-list` --- LIST

Pattern:

``` json
{
  "id": 6574,
  "method": "private/cancel-order-list",
  "params": {
    "contingency_type": "LIST",
    "order_list": [
      {
        "instrument_name": "CRO_USD",
        "order_id": "5755600460443882762"
      },
      {
        "instrument_name": "CRO_USD",
        "order_id": "5755600460443882763"
      }
    ]
  },
  "nonce": 1789450000000
}
```

Each cancellation must still be reconciled independently.

------------------------------------------------------------------------

## 10.3 `private/create-order-list` --- OCO

Exactly two orders:

``` json
{
  "id": 123456789,
  "method": "private/create-order-list",
  "params": {
    "contingency_type": "OCO",
    "order_list": [
      {
        "instrument_name": "BTCUSD-PERP",
        "quantity": "0.1",
        "type": "LIMIT",
        "price": "70000",
        "side": "SELL"
      },
      {
        "instrument_name": "BTCUSD-PERP",
        "quantity": "0.1",
        "type": "STOP_LOSS",
        "ref_price": "65000",
        "side": "SELL"
      }
    ]
  },
  "nonce": 1789450000000
}
```

Response:

``` json
{
  "code": 0,
  "result": {
    "list_id": 6498090546073120100
  }
}
```

------------------------------------------------------------------------

## 10.4 `private/cancel-order-list` --- OCO

``` json
{
  "id": 123456790,
  "method": "private/cancel-order-list",
  "params": {
    "contingency_type": "OCO",
    "list_id": 6498090546073120100
  },
  "nonce": 1789450000000
}
```

------------------------------------------------------------------------

## 10.5 `private/get-order-list` --- OCO

``` json
{
  "id": 123456791,
  "method": "private/get-order-list",
  "params": {
    "contingency_type": "OCO",
    "list_id": 6498090546073120100
  },
  "nonce": 1789450000000
}
```

Use to recover the linkage and states of both OCO legs.

------------------------------------------------------------------------

# 11. Market Maker API

## 11.1 `public/mm/get-ivm-instruments`

Public query for instruments relevant to the market-maker/IVM program.

Pattern:

``` http
GET /exchange/v1/public/mm/get-ivm-instruments
```

Use as reference/configuration input, not as trading state.

## 11.2 `private/mm/get-kpis`

``` json
{
  "id": 2001,
  "method": "private/mm/get-kpis",
  "params": {},
  "nonce": 1789450000000
}
```

Returns account-level market-making KPI information.

## 11.3 `private/mm/get-instrument-kpis`

``` json
{
  "id": 2002,
  "method": "private/mm/get-instrument-kpis",
  "params": {
    "instrument_name": "BTC_USDT"
  },
  "nonce": 1789450000000
}
```

Keep MM reporting outside the critical order path.

------------------------------------------------------------------------

# 12. History / reconciliation API

## 12.1 `private/get-order-history`

``` json
{
  "id": 3001,
  "method": "private/get-order-history",
  "params": {
    "instrument_name": "BTCUSD-PERP",
    "start_time": 1789360000000,
    "end_time": 1789450000000
  },
  "nonce": 1789450000000
}
```

Representative order record:

``` json
{
  "account_id": "...",
  "order_id": "18342311",
  "client_oid": "1613571154795",
  "order_type": "LIMIT",
  "time_in_force": "GOOD_TILL_CANCEL",
  "side": "BUY",
  "exec_inst": [],
  "quantity": "0.0001",
  "limit_price": "51000.0",
  "order_value": "3.900100",
  "maker_fee_rate": "0.000250",
  "taker_fee_rate": "0.000400",
  "avg_price": "0.0",
  "cumulative_quantity": "0.0000",
  "cumulative_value": "0.000000",
  "cumulative_fee": "0.000000",
  "status": "CANCELED",
  "instrument_name": "BTCUSD-PERP",
  "fee_instrument_name": "USD"
}
```

------------------------------------------------------------------------

## 12.2 `private/get-trades`

Use primarily for recovery.

``` json
{
  "id": 3002,
  "method": "private/get-trades",
  "params": {
    "instrument_name": "BTCUSD-PERP",
    "start_time": "1619089031996081486",
    "end_time": "1619200052124211357",
    "limit": 20
  },
  "nonce": 1789450000000
}
```

Representative fill:

``` json
{
  "account_id": "...",
  "event_date": "2021-02-17",
  "journal_type": "TRADING",
  "traded_quantity": "0.0500",
  "traded_price": "51278.5",
  "fees": "-1.025570",
  "order_id": "19708564",
  "trade_id": "38554669",
  "trade_match_id": "76423",
  "instrument_name": "BTCUSD-PERP"
}
```

Dedup key should include exchange trade/fill identifier, not just order
ID.

------------------------------------------------------------------------

## 12.3 `private/get-transactions`

Pattern:

``` json
{
  "id": 3003,
  "method": "private/get-transactions",
  "params": {
    "start_time": 1789360000000,
    "end_time": 1789450000000
  },
  "nonce": 1789450000000
}
```

Use for cash/account ledger reconciliation rather than live OMS state.

------------------------------------------------------------------------

## 12.4 `private/get-fee-rate`

``` json
{
  "id": 3004,
  "method": "private/get-fee-rate",
  "params": {},
  "nonce": 1789450000000
}
```

Response:

``` json
{
  "result": {
    "spot_tier": "3",
    "deriv_tier": "3",
    "effective_spot_maker_rate_bps": "6.5",
    "effective_spot_taker_rate_bps": "6.9",
    "effective_deriv_maker_rate_bps": "1.1",
    "effective_deriv_taker_rate_bps": "3"
  }
}
```

------------------------------------------------------------------------

## 12.5 `private/get-instrument-fee-rate`

``` json
{
  "id": 3005,
  "method": "private/get-instrument-fee-rate",
  "params": {
    "instrument_name": "BTC_USD"
  },
  "nonce": 1789450000000
}
```

Response:

``` json
{
  "result": {
    "instrument_name": "BTC_USD",
    "effective_maker_rate_bps": "6.5",
    "effective_taker_rate_bps": "6.9"
  }
}
```

------------------------------------------------------------------------

## 12.6 Daily archive exports

Methods:

``` text
private/export/get-daily-trade-archive
private/export/get-daily-transaction-archive
private/export/get-daily-order-archive
```

Generic request pattern:

``` json
{
  "id": 3010,
  "method": "private/export/get-daily-trade-archive",
  "params": {
    "date": "2026-09-14"
  },
  "nonce": 1789450000000
}
```

Use archives for offline reconciliation, audit and warehouse ingestion.
Do not place archive retrieval on the critical OMS path.

------------------------------------------------------------------------

# 13. Wallet API

Wallet actions should use API keys with separately controlled
permissions.

## 13.1 `private/create-withdrawal`

``` json
{
  "id": 4001,
  "method": "private/create-withdrawal",
  "params": {
    "client_wid": "my_withdrawal_002",
    "currency": "BTC",
    "amount": "1",
    "address": "<whitelisted-address>",
    "address_tag": "",
    "network_id": null
  },
  "nonce": 1789450000000
}
```

Response shape:

``` json
{
  "code": 0,
  "result": {
    "id": 2220,
    "amount": 1,
    "fee": 0.0004,
    "symbol": "BTC",
    "address": "<address>",
    "client_wid": "my_withdrawal_002",
    "create_time": 1789450000000,
    "network_id": null
  }
}
```

------------------------------------------------------------------------

## 13.2 `private/get-currency-networks`

``` json
{
  "id": 4002,
  "method": "private/get-currency-networks",
  "params": {
    "currency": "USDT"
  },
  "nonce": 1789450000000
}
```

Use the response to resolve supported networks, fees, deposit/withdraw
status and network identifiers before constructing wallet actions.

------------------------------------------------------------------------

## 13.3 `private/get-deposit-address`

``` json
{
  "id": 4003,
  "method": "private/get-deposit-address",
  "params": {
    "currency": "BTC"
  },
  "nonce": 1789450000000
}
```

Return data can be network-specific and may include address/tag
information.

### Deposit/withdrawal history note

The official changelog records `private/get-deposit-history` and
`private/get-withdrawal-history` as additions, but they are not exposed
in the current institutional navigation table used as the baseline for
this document. Do not hard-code them into a new production integration
without confirming current availability in UAT/account documentation.

------------------------------------------------------------------------

# PART II --- WEBSOCKET

# 14. Subscription protocol

Subscribe:

``` json
{
  "id": 5001,
  "method": "subscribe",
  "params": {
    "channels": [
      "ticker.BTCUSD-PERP",
      "trade.BTCUSD-PERP"
    ]
  }
}
```

Unsubscribe:

``` json
{
  "id": 5002,
  "method": "unsubscribe",
  "params": {
    "channels": [
      "ticker.BTCUSD-PERP"
    ]
  }
}
```

Maintain a set of desired subscriptions separately from confirmed
subscriptions so reconnect can replay intent.

------------------------------------------------------------------------

# 15. Private WebSocket channels

Authenticate first.

## 15.1 `user.order.{instrument_name}` / `user.order`

``` json
{
  "id": 1,
  "method": "subscribe",
  "params": {
    "channels": ["user.order.BTCUSD-PERP"]
  },
  "nonce": 1789450000000
}
```

Representative event:

``` json
{
  "id": 1,
  "method": "subscribe",
  "code": 0,
  "result": {
    "instrument_name": "BTCUSD-PERP",
    "subscription": "user.order.BTCUSD-PERP",
    "channel": "user.order.BTCUSD-PERP",
    "data": [{
      "account_id": "...",
      "order_id": "19848525",
      "client_oid": "oms-1",
      "order_type": "LIMIT",
      "time_in_force": "GOOD_TILL_CANCEL",
      "side": "BUY",
      "exec_inst": [],
      "quantity": "0.0100",
      "limit_price": "68200.0",
      "order_value": "682.0",
      "avg_price": "0",
      "cumulative_quantity": "0",
      "cumulative_value": "0",
      "cumulative_fee": "0",
      "status": "ACTIVE",
      "instrument_name": "BTCUSD-PERP",
      "fee_instrument_name": "USD",
      "create_time": 1789450000000,
      "update_time": 1789450000010
    }]
  }
}
```

Relevant statuses include:

``` text
NEW
PENDING
ACTIVE
CANCELED
FILLED
REJECTED
EXPIRED
```

A partially filled working order may remain `ACTIVE` while
`cumulative_quantity > 0`.

------------------------------------------------------------------------

## 15.2 `user.trade.{instrument_name}` / `user.trade`

``` json
{
  "id": 2,
  "method": "subscribe",
  "params": {
    "channels": ["user.trade.BTCUSD-PERP"]
  },
  "nonce": 1789450000000
}
```

Use this as your primary real-time fill stream.

Normalize each event to:

``` text
exchange_trade_id
order_id
client_oid if supplied
instrument
side
price
quantity
fee
fee_currency
liquidity/maker-taker metadata if supplied
event timestamp
```

Persist before publishing downstream if losing a fill is unacceptable.

------------------------------------------------------------------------

## 15.3 `user.balance`

``` json
{
  "id": 3,
  "method": "subscribe",
  "params": {
    "channels": ["user.balance"]
  },
  "nonce": 1789450000000
}
```

Use for real-time balance/margin updates.

------------------------------------------------------------------------

## 15.4 `user.positions`

``` json
{
  "id": 4,
  "method": "subscribe",
  "params": {
    "channels": ["user.positions"]
  },
  "nonce": 1789450000000
}
```

Use as live position state, but periodically reconcile with
`private/get-positions`.

------------------------------------------------------------------------

## 15.5 `user.account_risk`

``` json
{
  "id": 5,
  "method": "subscribe",
  "params": {
    "channels": ["user.account_risk"]
  },
  "nonce": 1789450000000
}
```

Risk service should treat this as exchange-side risk telemetry, not
replace your own limits.

------------------------------------------------------------------------

## 15.6 `user.position_balance`

``` json
{
  "id": 6,
  "method": "subscribe",
  "params": {
    "channels": ["user.position_balance"]
  },
  "nonce": 1789450000000
}
```

Useful when a consumer needs position and balance changes in the
exchange's combined account model.

------------------------------------------------------------------------

# 16. Public WebSocket market data

## 16.1 `book.{instrument_name}`

Legacy/general book subscription form:

``` json
{
  "id": 10,
  "method": "subscribe",
  "params": {
    "channels": ["book.BTCUSD-PERP"]
  }
}
```

For new implementations prefer explicit depth.

------------------------------------------------------------------------

## 16.2 `book.{instrument_name}.{depth}`

``` json
{
  "id": 11,
  "method": "subscribe",
  "params": {
    "channels": ["book.BTCUSD-PERP.10"]
  }
}
```

Representative payload:

``` json
{
  "result": {
    "instrument_name": "BTCUSD-PERP",
    "subscription": "book.BTCUSD-PERP.10",
    "channel": "book",
    "depth": 10,
    "data": [{
      "asks": [
        ["68251.0", "0.40", "0"],
        ["68252.0", "1.10", "0"]
      ],
      "bids": [
        ["68250.5", "0.75", "0"],
        ["68250.0", "0.30", "0"]
      ],
      "t": 1789450000123,
      "tt": 1789450000100,
      "u": 545391566464
    }]
  }
}
```

### Local-book implementation

Model:

``` text
asks: ordered map price -> size
bids: ordered map price -> size
last_update_id
exchange_timestamp
receive_timestamp
```

For snapshot semantics:

``` text
clear current book
insert all bids
insert all asks
set last update id
publish BookReady
```

For delta semantics when supplied:

``` text
size > 0 -> upsert level
size = 0 -> delete level
validate sequencing/update identifier
```

On any detected gap:

``` text
mark book STALE
stop publishing executable BBO
resubscribe/rebuild
only mark LIVE after a valid fresh snapshot
```

Do not allow a pricing engine to quote from a stale book.

------------------------------------------------------------------------

## 16.3 `ticker.{instrument_name}`

``` json
{
  "id": 12,
  "method": "subscribe",
  "params": {
    "channels": ["ticker.BTCUSD-PERP"]
  }
}
```

Fields:

``` text
h  24h high
l  24h low
a  last
i  instrument
v  volume
vv volume value
oi open interest
c  24h change
b  best bid
k  best ask
t  timestamp
```

Ticker is useful for UI/reference; for execution-quality BBO use your
order book.

------------------------------------------------------------------------

## 16.4 `trade.{instrument_name}`

``` json
{
  "id": 13,
  "method": "subscribe",
  "params": {
    "channels": ["trade.BTCUSD-PERP"]
  }
}
```

Event:

``` json
{
  "result": {
    "channel": "trade",
    "subscription": "trade.BTCUSD-PERP",
    "data": [{
      "s": "SELL",
      "p": "68250.5",
      "q": "0.0001",
      "t": 1789450000000,
      "d": "2030407068",
      "i": "BTCUSD-PERP"
    }]
  }
}
```

------------------------------------------------------------------------

## 16.5 `candlestick.{time_frame}.{instrument_name}`

``` json
{
  "id": 14,
  "method": "subscribe",
  "params": {
    "channels": ["candlestick.M5.BTCUSD-PERP"]
  }
}
```

Normalize to OHLCV bar with explicit interval and start timestamp.

------------------------------------------------------------------------

## 16.6 `index.{instrument_name}`

``` json
{
  "id": 15,
  "method": "subscribe",
  "params": {
    "channels": ["index.BTCUSD-INDEX"]
  }
}
```

Typical data:

``` json
{
  "v": "68247.73",
  "t": 1789450000000
}
```

------------------------------------------------------------------------

## 16.7 `mark.{instrument_name}`

``` json
{
  "id": 16,
  "method": "subscribe",
  "params": {
    "channels": ["mark.BTCUSD-PERP"]
  }
}
```

Use mark price for derivatives risk/liquidation logic where applicable.

------------------------------------------------------------------------

## 16.8 `settlement.{instrument_name}`

``` json
{
  "id": 17,
  "method": "subscribe",
  "params": {
    "channels": ["settlement.BTCUSD-PERP"]
  }
}
```

------------------------------------------------------------------------

## 16.9 `funding.{instrument_name}`

``` json
{
  "id": 18,
  "method": "subscribe",
  "params": {
    "channels": ["funding.BTCUSD-PERP"]
  }
}
```

Represents the fixed hourly rate settling at the end of the current
interval.

------------------------------------------------------------------------

## 16.10 `estimatedfunding.{instrument_name}`

``` json
{
  "id": 19,
  "method": "subscribe",
  "params": {
    "channels": ["estimatedfunding.BTCUSD-PERP"]
  }
}
```

Represents estimated rate for the next interval.

------------------------------------------------------------------------

# 17. Cancel on Disconnect --- WS

Set:

``` json
{
  "id": 20,
  "method": "private/set-cancel-on-disconnect",
  "params": {
    "<scope/configuration>": "<documented-value>"
  },
  "nonce": 1789450000000
}
```

Get:

``` json
{
  "id": 21,
  "method": "private/get-cancel-on-disconnect",
  "params": {},
  "nonce": 1789450000000
}
```

Exact COD scope/config values should be validated against the current
account/FIX configuration. Treat COD as defense-in-depth; maintain an
independent kill switch.

------------------------------------------------------------------------

# PART III --- FIX 4.4

# 18. FIX session fundamentals

Wire delimiter is SOH (`0x01`). Examples below use `|`.

Header:

``` text
8=FIX.4.4|
9=<BodyLength>|
35=<MsgType>|
34=<MsgSeqNum>|
49=<SenderCompID>|
56=<TargetCompID>|
52=<SendingTime>|
...
10=<CheckSum>|
```

Persist:

``` text
outbound_next_seq
inbound_expected_seq
session identity
last logon/logout
last heartbeat/test request
```

Do not keep sequence state only in memory.

------------------------------------------------------------------------

# 19. FIX Logon `35=A`

Core tags:

``` text
35=A
34=1
49=<sender>
56=<target>
98=0
108=<heartbeat-seconds>
141=<Y/N>
553=<API key>
95=<raw-data-length>
96=<nonce/raw data>
554=<signature>
```

Order Management signature payload:

``` text
"public/auth"
+ MsgSeqNum(34)
+ api_key
+ "system_labelONEEX"
+ RawData(96)
```

Market Data:

``` text
"public/auth"
+ MsgSeqNum(34)
+ api_key
+ RawData(96)
```

Drop Copy:

``` text
"public/auth"
+ MsgSeqNum(34)
+ api_key
+ "system_labelONEEX"
+ RawData(96)
```

Then:

``` text
554 = hex(HMAC_SHA256(secret, payload))
```

Illustrative logon:

``` text
8=FIX.4.4|
9=...|
35=A|
34=1|
49=PRD3.CLIENT_NAME.UD.00|
56=PRD3.CDC.UD|
52=20260915-12:00:00.000|
98=0|
108=30|
141=N|
553=API_KEY|
95=13|
96=1789450000000|
554=<signature>|
10=...|
```

After successful logon, allow a small settling interval before
application traffic.

------------------------------------------------------------------------

# 20. FIX administrative messages

## Logout `35=5`

``` text
35=5|58=Normal shutdown|
```

Wait for peer logout acknowledgement before closing TCP when possible.

## Heartbeat `35=0`

``` text
35=0|
```

Response to TestRequest:

``` text
35=0|112=<TestReqID>|
```

## TestRequest `35=1`

``` text
35=1|112=health-123|
```

## ResendRequest `35=2`

``` text
35=2|7=<BeginSeqNo>|16=<EndSeqNo>|
```

## SequenceReset `35=4`

Gap fill:

``` text
35=4|123=Y|36=<NewSeqNo>|
```

If inbound seq is greater than expected:

``` text
expected=100
received=105
 -> request 100..104
 -> buffer/handle 105 according to FIX engine behavior
 -> replay/gap-fill
 -> resume
```

Deduplicate replayed application messages using sequence/PossDup plus
business IDs.

------------------------------------------------------------------------

# 21. FIX `NewOrderSingle (35=D)`

Important tags:

      Tag Name                             Use
  ------- -------------------------------- ------------------------------------
       11 ClOrdID                          client order ID
       18 ExecInst                         post-only/smart post-only
       38 OrderQty                         base quantity
       40 OrdType                          market/limit/etc
       44 Price                            limit price
       54 Side                             1 buy / 2 sell
       55 Symbol                           e.g. BTC_USDT
       59 TimeInForce                      1 GTC / 3 IOC / 4 FOK
       60 TransactTime                     request UTC time
      152 CashOrderQty                     notional quantity where applicable
      544 CashMargin                       1 spot / 2 margin
     1107 TriggerPriceType                 last/index/mark
    12362 SelfMatchPreventionScope         STP scope
     2964 SelfMatchPreventionInstruction   cancel taker/maker/both
     2362 SelfMatchPreventionID            STP id
     2643 CommissionCurrency               fee currency
     7933 BrokerId                         broker
    20100 ReceiveWindow                    stale-order protection

### Limit buy

``` text
35=D|
11=oms-000001|
55=BTC_USDT|
54=1|
40=2|
38=0.0100|
44=68200.0|
59=1|
60=20260915-12:00:00.123|
20100=1000|
```

### Market sell

``` text
35=D|
11=oms-000002|
55=BTC_USDT|
54=2|
40=1|
38=0.0100|
59=3|
60=20260915-12:00:01.123|
20100=1000|
```

### Post-only limit

``` text
35=D|
11=oms-000003|
55=BTC_USDT|
54=1|
40=2|
38=0.0100|
44=68100.0|
18=6|
59=1|
60=20260915-12:00:02.123|
```

`18=6` represents POST_ONLY. Current documentation also supports
SMART_POST_ONLY.

### Spot/margin

``` text
544=1  -> spot
544=2  -> margin
```

### STP

``` text
12362=M  -> master/sub scope
12362=S  -> sub-account only

2964=1 -> cancel taker
2964=2 -> cancel maker
2964=3 -> cancel both
```

`2362` supports documented numeric STP IDs.

### ReceiveWindow

``` text
20100=1000
```

Use to reject requests whose transit/queue age exceeds your tolerance.
The documented range is 100--5000 ms; default is 5000 ms.

------------------------------------------------------------------------

# 22. FIX cancel/replace

## `OrderCancelRequest (35=F)`

Pattern:

``` text
35=F|
11=cancel-000001|
41=oms-000001|
37=<OrderID if known>|
55=BTC_USDT|
54=1|
60=20260915-12:01:00.000|
```

On send:

``` text
local state WORKING -> PENDING_CANCEL
```

Do not mark canceled until exchange confirmation.

## `OrderCancelReplaceRequest (35=G)`

Pattern:

``` text
35=G|
11=replace-000001|
41=oms-000001|
37=<OrderID>|
55=BTC_USDT|
54=1|
38=0.0200|
40=2|
44=68190.0|
59=1|
60=20260915-12:01:01.000|
```

Model replace as a new client request linked to `OrigClOrdID`, not
mutation without history.

## `OrderCancelReject (35=9)`

Must be handled as an event. A cancel rejection means the original order
may still be live or may already have transitioned for another reason;
reconcile before retrying blindly.

------------------------------------------------------------------------

# 23. FIX mass cancel / mass order

## `OrderMassCancelRequest (35=q)`

Pattern:

``` text
35=q|
11=masscancel-001|
530=<scope>|
55=BTC_USDT|
60=20260915-12:02:00.000|
```

Response:

``` text
35=r|...
```

Mass cancel does not eliminate the need to process individual order
lifecycle events.

## `MassOrder (35=DJ)`

Core:

``` text
35=DJ|
893=Y|
2428=<number of entries>|
...
```

Repeating entry action:

``` text
2429=1 -> Add
2429=3 -> Cancel
```

When Add, entry fields follow NewOrderSingle semantics. When Cancel,
they follow OrderCancelRequest semantics.

Documented batch size is 1--10 entries.

------------------------------------------------------------------------

# 24. FIX ExecutionReport `35=8`

This is the heart of the FIX OMS.

Important fields:

``` text
11   ClOrdID
41   OrigClOrdID
37   OrderID
17   ExecID
150  ExecType
39   OrdStatus
55   Symbol
54   Side
38   OrderQty
40   OrdType
44   Price
59   TimeInForce
151  LeavesQty
14   CumQty
6    AvgPx
32   LastQty
31   LastPx
60   TransactTime
103  OrdRejReason
58   Text
544  CashMargin
20101 MatchCount
20102 MatchIndex
```

Documented `ExecType(150)`:

``` text
0 New order
4 Cancelled
A successful NewOrderSingle request acknowledgement
8 rejected NewOrderSingle
6 successful OrderCancelRequest acknowledgement
I OrderStatusRequest response
F Trade
```

### Accepted submission

Illustrative:

``` text
35=8|
11=oms-000001|
37=123456789|
17=900001|
150=A|
39=<status>|
55=BTC_USDT|
54=1|
38=0.01|
14=0|
151=0.01|
```

### Trade

``` text
35=8|
11=oms-000001|
37=123456789|
17=900002|
150=F|
39=<partial-or-filled>|
55=BTC_USDT|
54=1|
38=0.01|
32=0.004|
31=68200.0|
14=0.004|
151=0.006|
6=68200.0|
60=20260915-12:00:05.123|
```

For idempotency, persist `ExecID` before applying the fill.

------------------------------------------------------------------------

# 25. FIX OrderStatusRequest `35=H`

By client ID:

``` text
35=H|
11=oms-000001|
55=BTC_USDT|
54=1|
```

Or by exchange order ID where applicable:

``` text
35=H|
37=123456789|
55=BTC_USDT|
54=1|
```

Response is ExecutionReport with:

``` text
150=I
```

Unknown/stale requests can return a rejected status report with
appropriate reject reason.

------------------------------------------------------------------------

# 26. FIX Market Data

# 26.1 `MarketDataRequest (35=V)`

Book:

``` text
35=V|
262=book.BTC_USDT.1|
263=1|
264=1|
265=1|
266=Y|
547=N|
267=2|
269=0|
269=1|
146=1|
55=BTC_USDT|
```

Full supported FIX book depth in current docs:

``` text
1 or 150
```

Trade subscription:

``` text
35=V|
262=trade.BTC_USDT|
263=1|
264=0|
265=1|
266=N|
547=N|
267=1|
269=2|
146=1|
55=BTC_USDT|
```

Unsubscribe uses:

``` text
263=2
```

------------------------------------------------------------------------

# 26.2 `MarketDataIncrementalRefresh (35=X)`

Important fields:

``` text
262 MDReqID
268 NoMDEntries
279 MDUpdateAction
269 MDEntryType
278 MDEntryID
280 MDEntryRefID
55  Symbol
270 MDEntryPx
271 MDEntrySize
346 NumberOfOrders
10273 MDEntryTimeMs
10851 TakerSide
880 TrdMatchID
```

Actions:

``` text
279=0 New
279=1 Update
279=2 Delete
```

Types:

``` text
269=0 Bid
269=1 Offer
269=2 Trade
269=J Empty Book
```

Book handler:

``` text
for entry in message:
    if type == J:
        clear book
        continue

    if type in {Bid, Offer}:
        if action == New or Update:
            upsert(price, size)
        elif action == Delete:
            delete(price/entry-id)

    if type == Trade:
        emit trade
```

Because FIX MD is incremental, your implementation must be strict about
session sequencing. A FIX sequence gap means market state cannot be
assumed complete until replay/gap-fill/recovery is resolved.

------------------------------------------------------------------------

# 26.3 `MarketDataSnapshotFullRefresh (35=W)`

Use as snapshot/full-refresh state when delivered by the flow.

Process atomically:

``` text
build new temporary book
validate message
swap temporary -> live
publish BookReady
```

Do not expose a half-applied snapshot.

------------------------------------------------------------------------

# 26.4 `MarketDataRequestReject (35=Y)`

On reject:

``` text
mark subscription FAILED
record MDReqID
record reject reason/text
do not keep instrument marked LIVE
```

Implement retry only for transient reasons; configuration/symbol errors
should trip an alert.

------------------------------------------------------------------------

# 27. FIX Security Definition

## `SecurityDefinitionRequest (35=c)`

``` text
35=c|
320=secdef-001|
321=<request-type>|
55=BTC_USDT|
263=<subscription-type if used>|
```

## `SecurityDefinition (35=d)`

Normalize instrument attributes into the same internal reference model
used by REST:

``` text
symbol
display_name
base_currency
quote_currency
price_tick
qty_tick
price_decimals
qty_decimals
max_leverage
tradable
expiry
margin flags
```

## `SecurityListRequest (35=x)` / `SecurityList (35=y)`

Use to bootstrap multiple definitions over FIX when your deployment
wants to avoid REST reference dependency.

------------------------------------------------------------------------

# 28. FIX `BusinessMessageReject (35=j)`

Persist:

``` text
RefSeqNum
RefMsgType
BusinessRejectReason
Text
raw message
```

Classify into:

``` text
protocol/config error
business validation
rate limit
temporary exchange error
unknown
```

Do not automatically retry every business reject.

------------------------------------------------------------------------

# PART IV --- OMS DESIGN

# 29. Canonical internal order model

Recommended model:

``` text
Order {
    internal_order_id
    venue
    account
    instrument

    client_order_id
    exchange_order_id

    side
    order_type
    tif
    price
    stop_price
    original_qty

    cum_qty
    leaves_qty
    avg_price

    state

    created_at
    sent_at
    exchange_created_at
    last_exchange_update_at
    last_local_update_at

    version
}
```

Never use `exchange_order_id` as your primary internal identity because
it may not exist before acknowledgement.

------------------------------------------------------------------------

# 30. OMS state machine

Recommended internal states:

``` text
CREATED
VALIDATED
PENDING_NEW
WORKING
PARTIALLY_FILLED
PENDING_CANCEL
PENDING_REPLACE
FILLED
CANCELED
REJECTED
EXPIRED
UNKNOWN
```

Typical transitions:

``` text
CREATED
 -> VALIDATED
 -> PENDING_NEW
 -> WORKING
 -> PARTIALLY_FILLED
 -> FILLED

WORKING
 -> PENDING_CANCEL
 -> CANCELED

PARTIALLY_FILLED
 -> PENDING_CANCEL
 -> CANCELED

PENDING_NEW
 -> REJECTED

WORKING
 -> PENDING_REPLACE
 -> WORKING(new version)
```

Critical race:

``` text
send cancel
fill arrives
cancel confirmation arrives
```

Your fill handler must remain valid while order is `PENDING_CANCEL`.

Another race:

``` text
timeout after create-order
unknown whether exchange accepted request
```

Never blindly submit a new order with a new client ID. First
query/reconcile the original `client_oid`.

------------------------------------------------------------------------

# 31. Client order ID policy

Generate IDs that are:

``` text
globally unique for the venue/account
stable across retry
searchable in logs
never reused
```

Example:

``` text
CDC-OMS1-BTCUSDT-20260915-000000123
```

Retry rule:

``` text
same logical request after transport uncertainty
 -> same client order ID
 -> recover/query
 -> do not create duplicate economic intent
```

------------------------------------------------------------------------

# 32. Fill model

``` text
Fill {
    venue
    account
    instrument
    exchange_trade_id / ExecID
    exchange_order_id
    client_order_id
    side
    price
    quantity
    fee
    fee_currency
    liquidity
    exchange_timestamp
    receive_timestamp
}
```

Primary key:

``` text
(venue, account, exchange_trade_id)
```

Apply exactly once.

------------------------------------------------------------------------

# 33. Startup reconciliation

At OMS boot:

``` text
1. load persisted orders/fills
2. connect private stream / FIX
3. establish session/authentication
4. subscribe order/trade/account events
5. query get-open-orders
6. query get-trades from last durable checkpoint
7. query positions
8. query balances
9. compare local working orders vs venue working orders
10. repair discrepancies
11. publish OMS_READY
```

Do not expose trading-ready status before reconciliation completes.

------------------------------------------------------------------------

# 34. Reconnect reconciliation

Suppose:

``` text
12:00:00.000 last private WS message
12:00:00.100 disconnect
12:00:03.000 reconnect
```

Recovery:

``` text
get-trades(start = durable_last_trade_time - overlap)
get-open-orders()
get-order-detail() for ambiguous orders
get-positions()
```

Use overlap because timestamp boundaries and network timing can
otherwise create holes.

Deduplicate fills by trade ID.

------------------------------------------------------------------------

# 35. Pre-trade checks

At minimum:

``` text
instrument exists
instrument tradable
price tick valid
quantity tick valid
positive qty
order type supported
TIF compatible
post-only compatible
price bands / fat-finger limits
max order notional
position limit
account limit
strategy limit
available balance/risk
market-data freshness
kill switch false
session healthy
```

Do not rely solely on exchange rejection as risk control.

------------------------------------------------------------------------

# 36. Kill switch

Implement layers:

``` text
strategy stop
instrument cancel-all
account cancel-all
gateway stop-new-orders
cancel-on-disconnect
manual emergency kill
```

A kill should:

``` text
atomically block new order intent locally
send cancels
continue processing fills
continue reconciliation
report remaining live orders
```

Never stop consuming private execution events while killing orders.

------------------------------------------------------------------------

# PART V --- MARKET DATA DESIGN

# 37. Canonical market-data events

``` text
InstrumentDefinition
BookSnapshot
BookDelta
Bbo
Trade
Ticker
Candle
IndexPrice
MarkPrice
FundingRate
EstimatedFundingRate
SettlementPrice
MarketDataStatus
```

Every event should contain:

``` text
venue
instrument
exchange_timestamp
receive_timestamp
sequence/update identifier where available
source = WS/FIX/REST
```

------------------------------------------------------------------------

# 38. Book state

``` text
Book {
    instrument
    bids: descending ordered map
    asks: ascending ordered map
    update_id
    status: INIT | LIVE | STALE
}
```

Derived:

``` text
best_bid
best_ask
mid = (bid + ask) / 2
spread = ask - bid
spread_bps = spread / mid * 10000
depth_N
VWAP_for_size
```

Never compute executable prices if status != LIVE.

------------------------------------------------------------------------

# 39. WS market-data connection plan

For a small universe:

``` text
one market WS
 -> book
 -> trades
 -> ticker
 -> mark/index/funding
```

For a large universe, shard subscriptions by:

``` text
message rate
instrument family
criticality
CPU/parser load
reconnect blast radius
```

Do not put all critical instruments behind one single failure domain if
throughput is high.

------------------------------------------------------------------------

# 40. FIX market-data plan

Use separate FIX sessions according to Crypto.com's market-data
partitions.

Architecture:

``` text
FIX MD session
 -> FIX parser
 -> session sequencer
 -> MD message decoder
 -> per-symbol book builder
 -> normalized event bus
```

Never let strategy code parse FIX tags directly.

------------------------------------------------------------------------

# 41. Market-data freshness

Track:

``` text
now - receive_timestamp
now - exchange_timestamp
heartbeat health
last book update
last trade
last ticker
```

Example policy:

``` text
if book receive age > threshold:
    status = STALE
    pricing disabled
```

Threshold should be instrument/strategy-specific.

------------------------------------------------------------------------

# PART VI --- ERROR HANDLING

# 42. REST/WS response codes

`code = 0` means success.

Important business/error categories include:

``` text
DUPLICATE_CLORDID
INSTRUMENT_EXPIRED
INSTRUMENT_NOT_TRADABLE
INVALID_INSTRUMENT
INVALID_ORDERID
INVALID_ORDERQTY
INVALID_ORDTYPE
INVALID_SIDE
INVALID_TIF
REJ_BY_MATCHING_ENGINE
EXCEED_MAXIMUM_ENTRY_LEVERAGE
INVALID_LEVERAGE
ACCOUNT_IS_IN_MARGIN_CALL
EXCEEDS_ACCOUNT_RISK_LIMIT
INSUFFICIENT_AVAILABLE_BALANCE
TOO_MANY_REQUESTS
INVALID_NONCE
```

Error classifier:

``` text
RETRYABLE:
    transport timeout
    transient disconnect
    selected server errors

RATE_LIMIT:
    TOO_MANY_REQUESTS

BUSINESS_FINAL:
    invalid instrument
    invalid quantity
    insufficient balance
    invalid TIF

AMBIGUOUS:
    create-order timeout after bytes may have reached venue
```

Ambiguous create/cancel is the dangerous class. Reconcile instead of
blindly retrying.

------------------------------------------------------------------------

# 43. Observability

Metrics:

``` text
rest_latency_ms{method}
rest_errors{method,code}
ws_reconnects
ws_heartbeat_lag_ms
ws_messages{channel}
fix_session_up
fix_seq_gap_count
fix_resend_requests
fix_business_rejects
order_submit_latency_ms
order_ack_latency_ms
cancel_latency_ms
fill_receive_latency_ms
open_orders
unknown_orders
book_age_ms{instrument}
book_gap_count{instrument}
trade_age_ms{instrument}
```

Structured logs should always include:

``` text
venue
account
instrument
client_oid
order_id
trade_id/exec_id
request_id
FIX seq num
event type
```

------------------------------------------------------------------------

# 44. Persistence

Minimum durable tables:

``` text
orders
order_events
fills
positions_snapshots
balance_snapshots
api_requests
reconciliation_runs
fix_session_state
market_data_incidents
```

Event journal is preferable to only storing the latest order row.

------------------------------------------------------------------------

# 45. Suggested OMS interfaces

Language-neutral:

``` text
PlaceOrder(command) -> SubmissionResult
CancelOrder(command) -> SubmissionResult
ReplaceOrder(command) -> SubmissionResult
CancelAll(command) -> SubmissionResult

GetOrder(clientOrderId)
GetOpenOrders()
GetPositions()
GetBalances()

OnOrderEvent(event)
OnFill(event)
OnRiskEvent(event)
```

`SubmissionResult` means transport/gateway acceptance, not final
execution state.

------------------------------------------------------------------------

# 46. Suggested market-data interfaces

``` text
SubscribeBook(instrument, depth)
SubscribeTrades(instrument)
SubscribeTicker(instrument)
SubscribeMark(instrument)
SubscribeIndex(instrument)
SubscribeFunding(instrument)

GetBook(instrument)
GetBbo(instrument)
GetLastTrade(instrument)

OnBookSnapshot(...)
OnBookDelta(...)
OnTrade(...)
OnStatus(...)
```

------------------------------------------------------------------------

# 47. End-to-end example --- WS market data

``` text
1 connect wss://stream.crypto.com/exchange/v1/market
2 wait for connection readiness
3 subscribe book.BTCUSD-PERP.10
4 subscribe trade.BTCUSD-PERP
5 subscribe ticker.BTCUSD-PERP
6 receive snapshot
7 build local book
8 mark LIVE
9 process updates
10 reply to every heartbeat
11 on disconnect mark STALE immediately
12 reconnect + resubscribe
13 only resume LIVE after fresh book state
```

------------------------------------------------------------------------

# 48. End-to-end example --- REST/WS OMS

``` text
1 connect User WS
2 wait ~1s
3 public/auth
4 subscribe user.order
5 subscribe user.trade
6 subscribe user.balance
7 subscribe user.positions
8 reconcile open orders/trades/positions
9 accept trading commands
10 create client_oid
11 validate order
12 POST private/create-order
13 mark PENDING_NEW
14 receive user.order ACTIVE
15 mark WORKING
16 receive user.trade
17 persist fill
18 update CumQty
19 receive order status FILLED
20 mark FILLED
21 periodically reconcile
```

------------------------------------------------------------------------

# 49. End-to-end example --- FIX OMS

``` text
1 establish PrivateLink/TCP
2 Logon 35=A
3 validate sequence state
4 receive Logon ack
5 begin heartbeat supervision
6 startup reconciliation
7 send NewOrderSingle 35=D
8 persist outbound request + sequence
9 receive ExecutionReport 35=8 / 150=A
10 bind ClOrdID -> OrderID
11 receive 150=0 / working state as applicable
12 receive 150=F fills
13 persist ExecID idempotently
14 update CumQty/LeavesQty
15 receive terminal state
16 maintain FIX seq state durably
17 on gap send ResendRequest
18 on reconnect restore session sequence
```

------------------------------------------------------------------------

# 50. Endpoint / channel checklist

## REST/public

-   [x] public/get-instruments
-   [x] public/get-book
-   [x] public/get-candlestick
-   [x] public/get-trades
-   [x] public/get-tickers
-   [x] public/get-valuations
-   [x] public/get-expired-settlement-price
-   [x] public/get-insurance

## Account

-   [x] private/user-balance
-   [x] private/user-balance-history
-   [x] private/get-accounts
-   [x] private/create-subaccount-transfer
-   [x] private/get-subaccount-balances
-   [x] private/get-positions

## Trading

-   [x] private/create-order
-   [x] private/cancel-order
-   [x] private/cancel-all-orders
-   [x] private/close-position
-   [x] private/get-open-orders
-   [x] private/get-order-detail
-   [x] private/change-account-leverage
-   [x] private/change-account-settings
-   [x] private/get-account-settings

## Advanced

-   [x] private/create-order conditional
-   [x] private/create-order-list LIST
-   [x] private/cancel-order-list LIST
-   [x] private/create-order-list OCO
-   [x] private/cancel-order-list OCO
-   [x] private/get-order-list OCO

## Market maker

-   [x] public/mm/get-ivm-instruments
-   [x] private/mm/get-kpis
-   [x] private/mm/get-instrument-kpis

## History / fees / export

-   [x] private/get-order-history
-   [x] private/get-trades
-   [x] private/get-transactions
-   [x] private/get-fee-rate
-   [x] private/get-instrument-fee-rate
-   [x] private/export/get-daily-trade-archive
-   [x] private/export/get-daily-transaction-archive
-   [x] private/export/get-daily-order-archive

## Wallet

-   [x] private/create-withdrawal
-   [x] private/get-currency-networks
-   [x] private/get-deposit-address

## WebSocket

-   [x] public/auth
-   [x] heartbeat/respond-heartbeat
-   [x] user.order
-   [x] user.trade
-   [x] user.balance
-   [x] user.positions
-   [x] user.account_risk
-   [x] user.position_balance
-   [x] book
-   [x] book.depth
-   [x] ticker
-   [x] trade
-   [x] candlestick
-   [x] index
-   [x] mark
-   [x] settlement
-   [x] funding
-   [x] estimatedfunding
-   [x] set/get cancel-on-disconnect

## FIX

-   [x] Logon A
-   [x] Logout 5
-   [x] Heartbeat 0
-   [x] TestRequest 1
-   [x] ResendRequest 2
-   [x] SequenceReset 4
-   [x] NewOrderSingle D
-   [x] OrderCancelReplaceRequest G
-   [x] OrderCancelRequest F
-   [x] OrderCancelReject 9
-   [x] OrderMassCancelRequest q
-   [x] OrderMassCancelReport r
-   [x] MassOrder DJ
-   [x] ExecutionReport 8
-   [x] OrderStatusRequest H
-   [x] MarketDataRequest V
-   [x] MarketDataIncrementalRefresh X
-   [x] MarketDataRequestReject Y
-   [x] MarketDataSnapshotFullRefresh W
-   [x] SecurityDefinitionRequest c
-   [x] SecurityDefinition d
-   [x] SecurityListRequest x
-   [x] SecurityList y
-   [x] BusinessMessageReject j

------------------------------------------------------------------------

# 51. Production-readiness checklist

Before PROD:

``` text
[ ] API keys scoped by service
[ ] IP whitelist
[ ] secrets in vault
[ ] NTP/PTP monitored
[ ] decimal arithmetic
[ ] instrument/tick validation
[ ] rate limiter
[ ] client_oid uniqueness
[ ] idempotent fill handling
[ ] order state machine
[ ] reconnect recovery
[ ] startup reconciliation
[ ] REST recovery windows overlap
[ ] FIX seq persistence
[ ] FIX resend/gap-fill tested
[ ] heartbeat timeout tested
[ ] stale market-data guard
[ ] cancel-on-disconnect configured
[ ] independent kill switch
[ ] UAT chaos/disconnect tests
[ ] partial fill + cancel race tested
[ ] timeout-after-submit ambiguity tested
[ ] batch partial rejection tested
[ ] metrics/alerts
[ ] raw protocol capture with secret redaction
```

------------------------------------------------------------------------

# 52. Recommended test scenarios

### Market data

``` text
normal snapshot
rapid book updates
empty book
WS disconnect
reconnect
malformed message
duplicate trade
out-of-order/gap where detectable
stale feed
FIX resend
FIX sequence gap
market-data request reject
```

### OMS

``` text
limit accepted
market accepted
post-only reject
invalid tick
insufficient balance
partial fill
multiple partial fills
fill then cancel
cancel then fill race
cancel reject
full fill
IOC partial + cancel remainder
FOK
duplicate client_oid
request timeout before response
disconnect immediately after submit
disconnect immediately after cancel
mass cancel
batch partial reject
restart with live orders
restart with missing fills
FIX replay/PossDup
```

------------------------------------------------------------------------

# 53. Official sources

REST / WebSocket Institutional API:

``` text
https://exchange-docs.crypto.com/exchange/v1/rest-ws/index-insto-8556ea5c-4dbb-44d4-beb0-20a4d31f63a7.html
```

FIX 4.4:

``` text
https://exchange-docs.crypto.com/exchange/index-fix-f18-2a5a30f4-9177-4c97-aff6-923291d24255.html
```

Public Exchange developer entry point:

``` text
https://exchange-developer.crypto.com/exchange/v1
```

For FIX engine implementation, obtain the official Crypto.com QuickFIX
XML dictionary linked from the FIX documentation and treat it as the
machine-readable source of truth for tags, required fields, repeating
groups and message definitions.

------------------------------------------------------------------------

# 54. Final implementation guidance

If the objective is two production services, a sensible split is:

``` text
crypto-com-reference
    REST instrument metadata

crypto-com-marketdata
    WS or FIX MD
    book builders
    trades
    mark/index/funding
    normalized publishing

crypto-com-oms
    REST/WS or FIX order gateway
    order state machine
    fill journal
    balances/positions
    reconciliation

crypto-com-fix-session
    optional shared FIX session library
    seq persistence
    resend/gap fill
    heartbeat
```

For a first implementation, **WS market data + WS/REST OMS** is
substantially simpler and is good for functional integration. For
institutional/high-throughput execution, migrate the critical path to
**FIX Order Management + FIX Drop Copy**, and use FIX MD where
latency/throughput justify it.

The OMS must never depend on a single response path. The durable truth
is reconstructed from:

``` text
submission acknowledgements
+ order lifecycle events
+ fill events
+ open-order snapshots
+ trade recovery
+ positions/balances
```

That reconciliation model is what makes the integration safe under
disconnects, timeouts, partial fills and duplicate/replayed messages.
