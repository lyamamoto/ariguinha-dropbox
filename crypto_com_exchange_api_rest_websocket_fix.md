# Crypto.com Exchange API --- REST, WebSocket e FIX 4.4

> **Referência consolidada para integração institucional**
>
> Atualizado a partir da documentação oficial disponível em
> **15/09/2026**.\
> Escopo principal: **Crypto.com Exchange Institutional API v1** (Spot,
> Derivatives, Margin), incluindo REST, WebSocket e FIX.
>
> Este arquivo é uma referência técnica consolidada e reorganizada ---
> não uma cópia literal da documentação oficial. Para detalhes que
> possam mudar, valide sempre na documentação oficial.

------------------------------------------------------------------------

## 1. Visão geral

A Crypto.com Exchange expõe três interfaces principais:

  -----------------------------------------------------------------------
  Interface               Uso típico              Característica
  ----------------------- ----------------------- -----------------------
  REST                    consultas, trading,     request/response HTTP
                          conta, histórico,       
                          wallet                  

  WebSocket               trading autenticado +   conexão persistente
                          streaming em tempo real 

  FIX 4.4                 order entry             baixa latência / alta
                          institucional, drop     vazão
                          copy e market data      
  -----------------------------------------------------------------------

A API Exchange v1 cobre Spot, Derivatives e Margin. REST e WebSocket
compartilham grande parte do modelo lógico de métodos, parâmetros e
respostas.

### Convenções

-   métodos/URLs: `dash-case`
-   parâmetros: `snake_case`
-   enums: `UPPER_SNAKE_CASE`
-   preços devem ser tratados como **strings** onde indicado
-   timestamps REST/WS são normalmente Unix epoch em ms; alguns campos
    históricos usam ns
-   FIX usa `FIX.4.4`, acrescido de campos de outras versões e tags
    proprietárias

------------------------------------------------------------------------

# 2. Endpoints e ambientes

## 2.1 REST

### Produção

``` text
https://api.crypto.com/exchange/v1/{method}
```

### UAT

``` text
https://uat-api.3ona.co/exchange/v1/{method}
```

REST usa `Content-Type: application/json`.

------------------------------------------------------------------------

## 2.2 WebSocket

### Produção

User API / authenticated:

``` text
wss://stream.crypto.com/exchange/v1/user
```

Market Data:

``` text
wss://stream.crypto.com/exchange/v1/market
```

### UAT

User API:

``` text
wss://uat-stream.3ona.co/exchange/v1/user
```

Market Data:

``` text
wss://uat-stream.3ona.co/exchange/v1/market
```

------------------------------------------------------------------------

## 2.3 FIX

O FIX institucional usa três fluxos independentes:

1.  **Order Management / User Data**
2.  **Drop Copy**
3.  **Market Data**

A conectividade exige **AWS PrivateLink**.

### Produção

  -----------------------------------------------------------------------------------------------------------------------
  Gateway           Endpoint                                          SenderCompID                      TargetCompID
  ----------------- ------------------------------------------------- --------------------------------- -----------------
  Order Management  `tcp://prd3-fix-ud-f18b.crypto.local:31301`       `PRD3.CLIENT_NAME.UD.00`          `PRD3.CDC.UD`

  Drop Copy         `tcp://prd3-fix-uc-f18b.crypto.local:30300`       `PRD3.CLIENT_NAME.UC.00`          `PRD3.CDC.UC`

  Market Data ---   `tcp://prd3-fix-md-f18b.crypto.local:34402`       `PRD3.CLIENT_NAME_BTC.MD.00`      `PRD3.CDC.MD`
  BTC                                                                                                   

  Market Data ---   `tcp://prd3-fix-md-f18b.crypto.local:34403`       `PRD3.CLIENT_NAME_ETH.MD.00`      `PRD3.CDC.MD`
  ETH                                                                                                   

  Market Data ---   `tcp://prd3-fix-md-f18b.crypto.local:3440[5-7]`   `PRD3.CLIENT_NAME_OTHERS.MD.00`   `PRD3.CDC.MD`
  outros                                                                                                
  -----------------------------------------------------------------------------------------------------------------------

Market-data partitioning:

-   BTC-related → `34402` (ETH/BTC não entra aqui)
-   ETH-related → `34403` (ETH/BTC entra aqui)
-   símbolos iniciando em `0-9` ou `A-D` → `34405`
-   `E-M` → `34406`
-   `N-Z` → `34407`

### UAT

  -------------------------------------------------------------------------------------
  Gateway                             Endpoint
  ----------------------------------- -------------------------------------------------
  Order Management                    `tcp://uat1-fix-ud-f18a.crypto.local:31301`

  Drop Copy                           `tcp://uat1-fix-uc-f18a.crypto.local:30300`

  Market Data --- BTC                 `tcp://uat1-fix-md-f18a.crypto.local:34402`

  Market Data --- ETH                 `tcp://uat1-fix-md-f18a.crypto.local:34403`

  Market Data --- outros              `tcp://uat1-fix-md-f18a.crypto.local:3440[5-7]`
  -------------------------------------------------------------------------------------

------------------------------------------------------------------------

# 3. Rate limits

## REST

Authenticated, por método/API key:

  Método                               Limite
  ----------------------------- -------------
  `private/create-order`          15 / 100 ms
  `private/cancel-order`          15 / 100 ms
  `private/cancel-all-orders`     15 / 100 ms
  `private/get-order-detail`      30 / 100 ms
  `private/get-trades`                    1/s
  `private/get-order-history`             1/s
  demais privados                  3 / 100 ms

Market data público, por método/IP: até **100 requests/s** para os
principais endpoints (`get-book`, tickers, trades, valuations,
candlesticks, insurance).

## WebSocket

  Socket                  Limite
  ------------- ----------------
  User API        150 requests/s
  Market Data     100 requests/s

Na documentação institucional, `private/get-trades` e
`private/get-order-history` têm limite de 5/s via WS.

**Prática recomendada:** após conectar o WS, aguardar \~1 segundo antes
de enviar requests, porque o rate limit é proporcional ao restante do
segundo-calendário no qual a conexão foi aberta.

## FIX

  Fluxo                              Limite
  ---------------------- ------------------
  Order Entry              2.500 requests/s
  Market Data requests        20 requests/s

------------------------------------------------------------------------

# 4. Autenticação REST / WebSocket

## 4.1 Envelope

``` json
{
  "id": 123,
  "method": "private/create-order",
  "params": {},
  "api_key": "API_KEY",
  "sig": "HEX_HMAC_SHA256",
  "nonce": 1690000000000
}
```

Campos:

-   `id`: identificador do request
-   `method`: método chamado
-   `params`: objeto de parâmetros
-   `api_key`: exigido em requests privados REST e no auth WS
-   `sig`: assinatura
-   `nonce`: Unix timestamp em ms

## 4.2 Assinatura

A assinatura é HMAC-SHA256.

Fluxo conceitual:

``` text
params_string = concatenação recursiva dos parâmetros,
                ordenados por chave

payload =
    method
  + id
  + api_key
  + params_string
  + nonce

sig = hex(HMAC_SHA256(secret_key, payload))
```

Não envie o API Secret no request.

### REST

Cada chamada privada inclui `api_key` e `sig`.

### WebSocket

Autentique uma vez por sessão com:

``` text
public/auth
```

Depois disso, os métodos privados daquele socket não precisam repetir
key/signature.

------------------------------------------------------------------------

# 5. Formato de resposta REST / WS

Modelo geral:

``` json
{
  "id": 123,
  "method": "private/...",
  "result": {},
  "code": 0,
  "message": "...",
  "original": "..."
}
```

-   `code = 0` → sucesso
-   `message` pode aparecer em erros
-   `original` pode conter a requisição original em casos de erro

Erros importantes incluem:

-   `DUPLICATE_CLORDID`
-   `INSTRUMENT_EXPIRED`
-   `INSTRUMENT_NOT_TRADABLE`
-   `INVALID_INSTRUMENT`
-   `INVALID_ORDERID`
-   `INVALID_ORDERQTY`
-   `INVALID_ORDTYPE`
-   `INVALID_SIDE`
-   `INVALID_TIF`
-   `REJ_BY_MATCHING_ENGINE`
-   `EXCEED_MAXIMUM_ENTRY_LEVERAGE`
-   `INVALID_LEVERAGE`
-   `ACCOUNT_IS_IN_MARGIN_CALL`
-   `EXCEEDS_ACCOUNT_RISK_LIMIT`
-   `INSUFFICIENT_AVAILABLE_BALANCE`
-   `TOO_MANY_REQUESTS`
-   `INVALID_NONCE`

------------------------------------------------------------------------

# 6. REST API --- inventário completo da API institucional

## 6.1 Reference / Market Data

  ---------------------------------------------------------------------------
  Método                                  Função
  --------------------------------------- -----------------------------------
  `public/get-instruments`                catálogo e metadados de
                                          instrumentos

  `public/get-book`                       snapshot do order book

  `public/get-candlestick`                OHLCV

  `public/get-trades`                     trades públicos

  `public/get-tickers`                    ticker/24h

  `public/get-valuations`                 mark/index/funding e valuations

  `public/get-expired-settlement-price`   settlement de contratos expirados

  `public/get-insurance`                  dados do insurance fund
  ---------------------------------------------------------------------------

### `public/get-instruments`

Retorna, entre outros:

-   `symbol`
-   `inst_type`
-   `display_name`
-   `base_ccy`
-   `quote_ccy`
-   `quote_decimals`
-   `quantity_decimals`
-   `price_tick_size`
-   `qty_tick_size`
-   `max_leverage`
-   `tradable`
-   expiry/underlying quando aplicável
-   `product_type` (campo adicionado em 2026)

### `public/get-book`

Parâmetros principais:

``` text
instrument_name
depth
```

Retorna `asks`, `bids`, profundidade e timestamp/metadata conforme o
instrumento.

### `public/get-candlestick`

Usa instrumento + período/timeframe. Timeframes suportados incluem
intervalos de minutos, horas, dias, semanas e mês.

### `public/get-trades`

Parâmetros de filtro incluem instrumento e paginação temporal. Trade
público inclui tipicamente:

``` text
s = taker side
p = price
q = quantity
t = timestamp ms
tn = timestamp ns (quando fornecido)
d = trade id
i = instrument
```

### `public/get-tickers`

Campos usuais:

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
```

------------------------------------------------------------------------

## 6.2 Account / Balance / Position

  Método                                 Função
  -------------------------------------- ----------------------------
  `private/user-balance`                 saldo e métricas de margem
  `private/user-balance-history`         histórico de saldo
  `private/get-accounts`                 contas/subcontas
  `private/create-subaccount-transfer`   transferência entre contas
  `private/get-subaccount-balances`      saldos de subcontas
  `private/get-positions`                posições abertas

### `private/user-balance`

Métricas importantes:

-   `total_available_balance`
-   `total_margin_balance`
-   `total_initial_margin`
-   `total_position_im`
-   `total_haircut`
-   `total_maintenance_margin`
-   `total_position_cost`
-   `total_cash_balance`
-   `total_collateral_value`
-   `total_session_unrealized_pnl`
-   `total_session_realized_pnl`
-   `is_liquidating`
-   `total_effective_leverage`
-   `position_limit`
-   `used_position_limit`
-   `position_balances`

### `private/get-positions`

Filtro opcional:

``` text
instrument_name
```

Resposta inclui:

``` text
instrument_name
type
quantity
cost
open_position_pnl
open_pos_cost
session_pnl
update_timestamp_ms
```

------------------------------------------------------------------------

# 7. Trading API

## `private/create-order`

Cria BUY/SELL. O aceite é **assíncrono**: o response confirma
recebimento, não necessariamente presença final no book. Para estado
real-time, use `user.order`.

### Parâmetros

  ------------------------------------------------------------------------
  Campo                   Obrigatório             Valores / uso
  ----------------------- ----------------------- ------------------------
  `instrument_name`       sim                     símbolo

  `side`                  sim                     `BUY`, `SELL`

  `type`                  sim                     `LIMIT`, `MARKET`,
                                                  `STOP_LOSS`,
                                                  `STOP_LIMIT`,
                                                  `TAKE_PROFIT`,
                                                  `TAKE_PROFIT_LIMIT`

  `price`                 depende                 preço

  `quantity`              depende                 quantidade

  `client_oid`            não                     client order id

  `exec_inst`             não                     ex. `POST_ONLY`

  `time_in_force`         não                     `GOOD_TILL_CANCEL`,
                                                  `IMMEDIATE_OR_CANCEL`,
                                                  `FILL_OR_KILL`

  `ref_price`             condicional             trigger

  `ref_price_type`        não                     `MARK_PRICE`,
                                                  `INDEX_PRICE`,
                                                  `LAST_PRICE`

  `spot_margin`           não                     `SPOT`, `MARGIN`

  `broker_id`             não                     broker

  `stp_scope`             não                     self-trade prevention
                                                  scope

  `stp_inst`              condicional             maker/taker/both cancel

  `stp_id`                não                     STP identifier
  ------------------------------------------------------------------------

Se `POST_ONLY`, TIF deve ser compatível com GTC.

### Exemplo mínimo

``` json
{
  "id": 1,
  "method": "private/create-order",
  "params": {
    "instrument_name": "BTCUSD-PERP",
    "side": "SELL",
    "type": "LIMIT",
    "price": "50000.5",
    "quantity": "1",
    "client_oid": "strategy-123",
    "time_in_force": "GOOD_TILL_CANCEL"
  },
  "nonce": 1690000000000
}
```

## Demais métodos de trading

  Método                              Função
  ----------------------------------- ------------------------
  `private/cancel-order`              cancela ordem
  `private/cancel-all-orders`         mass cancel
  `private/close-position`            fecha posição
  `private/get-open-orders`           ordens abertas
  `private/get-order-detail`          detalhe de ordem
  `private/change-account-leverage`   altera leverage
  `private/change-account-settings`   altera configurações
  `private/get-account-settings`      consulta configurações

------------------------------------------------------------------------

# 8. Advanced Order Management

  Método                                 Função
  -------------------------------------- -----------------------
  `private/create-order`                 conditional orders
  `private/create-order-list` + `LIST`   batch create
  `private/cancel-order-list` + `LIST`   batch cancel
  `private/create-order-list` + `OCO`    One-Cancels-the-Other
  `private/cancel-order-list` + `OCO`    cancela OCO
  `private/get-order-list` + `OCO`       consulta OCO

`LIST` permite múltiplas ordens independentes no mesmo request. O
resultado é por item, portanto uma ordem pode ser aceita e outra
rejeitada.

`OCO` agrupa ordens com contingência: a execução/trigger de uma perna
cancela a outra conforme a semântica do produto.

------------------------------------------------------------------------

# 9. Market Maker API

  -----------------------------------------------------------------------
  Método                              Função
  ----------------------------------- -----------------------------------
  `public/mm/get-ivm-instruments`     instrumentos relevantes ao programa
                                      MM

  `private/mm/get-kpis`               KPIs agregados

  `private/mm/get-instrument-kpis`    KPI por instrumento
  -----------------------------------------------------------------------

KPIs podem incluir volume rolling 30d, participação, altcoin score e
timestamps de atualização.

------------------------------------------------------------------------

# 10. Histórico / fees / exports

  ------------------------------------------------------------------------------------
  Método                                           Função
  ------------------------------------------------ -----------------------------------
  `private/get-order-history`                      histórico de ordens

  `private/get-trades`                             executions/fills

  `private/get-transactions`                       transações

  `private/get-fee-rate`                           fee tier/rates

  `private/get-instrument-fee-rate`                fee por instrumento

  `private/export/get-daily-trade-archive`         arquivo diário de trades

  `private/export/get-daily-transaction-archive`   arquivo diário de transações

  `private/export/get-daily-order-archive`         arquivo diário de ordens
  ------------------------------------------------------------------------------------

### Recuperação de fills

A recomendação operacional é:

``` text
real-time -> user.trade via WebSocket
recovery  -> private/get-trades
```

Ou seja, não trate polling de `get-trades` como feed primário de
execução.

------------------------------------------------------------------------

# 11. Wallet

  Método                            Função
  --------------------------------- ----------------------
  `private/create-withdrawal`       withdrawal
  `private/get-currency-networks`   redes disponíveis
  `private/get-deposit-address`     endereço de depósito

`create-withdrawal` pode usar:

``` text
client_wid
currency
amount
address
address_tag
network_id
```

Withdrawal address precisa obedecer às regras/whitelist da conta.

------------------------------------------------------------------------

# 12. WebSocket --- arquitetura

Há dois sockets:

``` text
USER SOCKET   -> auth, trading/private methods, user streams
MARKET SOCKET -> public market-data subscriptions
```

## Heartbeat

O servidor envia:

``` json
{
  "id": 123,
  "method": "public/heartbeat",
  "code": 0
}
```

O cliente deve responder, reutilizando o `id`:

``` json
{
  "id": 123,
  "method": "public/respond-heartbeat"
}
```

Heartbeat chega aproximadamente a cada 30 s e deve ser respondido
rapidamente (documentação indica janela de 5 s).

## Subscribe

``` json
{
  "id": 1,
  "method": "subscribe",
  "params": {
    "channels": ["ticker.BTCUSD-PERP"]
  }
}
```

Unsubscribe usa a mesma estrutura com `method = "unsubscribe"`.

------------------------------------------------------------------------

# 13. WebSocket --- user streams

  -----------------------------------------------------------------------
  Canal                               Conteúdo
  ----------------------------------- -----------------------------------
  `user.order.{instrument_name}` /    ciclo de vida das ordens
  `user.order`                        

  `user.trade.{instrument_name}` /    executions
  `user.trade`                        

  `user.balance`                      saldo/margem

  `user.positions`                    posições

  `user.account_risk`                 risco agregado

  `user.position_balance`             balance/position data
  -----------------------------------------------------------------------

## `user.order`

Campos importantes:

-   `account_id`
-   `order_id`
-   `client_oid`
-   `order_type`
-   `time_in_force`
-   `side`
-   `exec_inst`
-   `quantity`
-   `limit_price`
-   `order_value`
-   `maker_fee_rate`
-   `taker_fee_rate`
-   `avg_price`
-   `cumulative_quantity`
-   `cumulative_value`
-   `cumulative_fee`
-   `status`
-   `instrument_name`
-   `fee_instrument_name`
-   `create_time`
-   `create_time_ns`
-   `update_time`
-   `transaction_time_ns` quando aplicável

Status relevantes:

``` text
NEW
PENDING
REJECTED
ACTIVE
CANCELED
FILLED
EXPIRED
```

Parcialmente preenchida: normalmente `ACTIVE` com
`cumulative_quantity > 0`.

------------------------------------------------------------------------

# 14. WebSocket --- market data

  Canal                                          Conteúdo
  ---------------------------------------------- ------------------
  `book.{instrument_name}.{depth}`               order book
  `ticker.{instrument_name}`                     ticker
  `trade.{instrument_name}`                      public trades
  `candlestick.{time_frame}.{instrument_name}`   OHLCV
  `index.{instrument_name}`                      index
  `mark.{instrument_name}`                       mark price
  `settlement.{instrument_name}`                 settlement
  `funding.{instrument_name}`                    funding vigente
  `estimatedfunding.{instrument_name}`           funding estimado

## Order book

Para aplicações de trading, prefira o modelo de snapshot +
updates/deltas quando disponível, mantendo sequence handling e
resubscription/recovery.

A documentação descontinuou formatos antigos de snapshot de alta
frequência e enfatiza subscription explícita com depth.

## Ticker

Campos compactos:

``` text
h  high
l  low
a  last
i  instrument
v  volume
vv volume value
oi open interest
c  change
b  best bid
k  best ask
bs bid size
ks ask size
t  timestamp
```

## Trades

``` text
s  taker side
p  price
q  quantity
t  timestamp
d  trade id
i  instrument
```

## Mark / index / settlement

Formato conceitual:

``` json
{
  "v": "51279.77",
  "t": 1613582832000
}
```

Mark/settlement podem atualizar em frequência muito alta.

------------------------------------------------------------------------

# 15. WebSocket --- Cancel on Disconnect

Métodos:

``` text
private/set-cancel-on-disconnect
private/get-cancel-on-disconnect
```

Para uma stack de execução institucional, isso deve ser tratado como
mecanismo de proteção, não como substituto do seu próprio kill switch,
reconciliation e session-state management.

------------------------------------------------------------------------

# 16. FIX 4.4 --- arquitetura

A implementação é baseada em FIX 4.4, com extensões.

## Standard Header

Tags essenciais:

    Tag Campo
  ----- -------------------------
      8 BeginString = `FIX.4.4`
      9 BodyLength
     35 MsgType
     34 MsgSeqNum
     43 PossDupFlag
     49 SenderCompID
     56 TargetCompID
     52 SendingTime
     97 PossResend

Trailer:

    Tag Campo
  ----- ----------
     10 CheckSum

Separador real de campos = SOH (`0x01`), embora exemplos frequentemente
usem `|`.

------------------------------------------------------------------------

# 17. FIX --- autenticação / Logon

## Logon `35=A`

Tags principais:

      Tag Campo
  ------- ------------------------------
       95 RawDataLength
       96 RawData
       98 EncryptMethod = `0`
      108 HeartBtInt
      141 ResetSeqNumFlag
      553 Username = API key
      554 Password = digital signature
     6867 CancelOnDisconnect scope
    35002 CancelOnDisconnect type

### FIX signature

Order Management:

``` text
payload =
  "public/auth"
  + MsgSeqNum(34)
  + api_key
  + "system_labelONEEX"
  + RawData(96)
```

Market Data:

``` text
payload =
  "public/auth"
  + MsgSeqNum(34)
  + api_key
  + RawData(96)
```

Drop Copy:

``` text
payload =
  "public/auth"
  + MsgSeqNum(34)
  + api_key
  + "system_labelONEEX"
  + RawData(96)
```

Depois:

``` text
Password(554) = hex(HMAC_SHA256(secret, payload))
```

Mapeamento mental com REST/WS:

  FIX     REST/WS
  ------- ---------
  `35`    method
  `34`    id
  `553`   api_key
  `96`    nonce
  `554`   sig

Após receber o Logon acknowledgement, a documentação recomenda um
pequeno intervalo (\~50 ms) antes do primeiro request.

------------------------------------------------------------------------

# 18. FIX --- session management

## Sequence numbers

-   iniciam em 1
-   incrementam a cada mensagem
-   duplicatas/out-of-order exigem tratamento FIX padrão
-   o servidor não simplesmente zera sequence numbers no logon normal

## Recovery

Use `ResendRequest (35=2)`.

Fluxo:

``` text
gap detectado
 -> ResendRequest
 -> replay com PossDupFlag=Y
 -> deduplicação pelo receiver
 -> retomada
```

## Mensagens administrativas

  MsgType   Nome
  --------- ---------------
  `A`       Logon
  `5`       Logout
  `0`       Heartbeat
  `1`       TestRequest
  `2`       ResendRequest
  `4`       SequenceReset

### Heartbeat / TestRequest

`HeartBtInt(108)` controla heartbeat. TestRequest usa `112=TestReqID`; a
resposta Heartbeat deve ecoar esse ID.

### SequenceReset

Tags:

``` text
123 GapFillFlag
36  NewSeqNo
```

Gap Fill é o mecanismo normal para pular mensagens que não serão
reenviadas. Reset mode deve ser reservado a recovery excepcional.

------------------------------------------------------------------------

# 19. FIX --- Order Entry

## `NewOrderSingle (35=D)`

Tags centrais:

      Tag Campo                            Observação
  ------- -------------------------------- ----------------------------------------------
       11 ClOrdID                          único entre sessões
       15 Currency                         alguns fluxos/OTC
       18 ExecInst                         `6=POST_ONLY`, `8=SMART_POST_ONLY`
       38 OrderQty                         quantidade
       40 OrdType                          `1=MARKET`, `2=LIMIT`, `D=PREVIOUSLY_QUOTED`
       44 Price                            LIMIT
       54 Side                             `1=BUY`, `2=SELL`
       55 Symbol                           ex. `BTC_USDT`
       59 TimeInForce                      `1=GTC`, `3=IOC`, `4=FOK`
       60 TransactTime                     UTC
      117 QuoteID                          OTC quando aplicável
      152 CashOrderQty                     notional para market buy
      544 CashMargin                       spot/margin
     1107 TriggerPriceType                 last/index/mark
    12362 SelfMatchPreventionScope         STP
     2964 SelfMatchPreventionInstruction   STP action
     2362 SelfMatchPreventionID            STP id
     2643 CommissionCurrency               fee currency
     7933 BrokerId                         broker
    20100 ReceiveWindow                    latency guard, 100--5000 ms

### Quantidade obrigatória

``` text
MARKET BUY  -> CashOrderQty OU OrderQty
MARKET SELL -> OrderQty
LIMIT BUY   -> OrderQty + Price
LIMIT SELL  -> OrderQty + Price
```

`ReceiveWindow(20100)` protege contra ordens stale comparando o tempo de
chegada ao `SendingTime`. Default documentado: 5000 ms.

O acknowledgement inicial de uma ordem é assíncrono. Use
ExecutionReport/Drop Copy para o estado definitivo.

------------------------------------------------------------------------

# 20. FIX --- amend/cancel

  MsgType   Mensagem
  --------- ---------------------------
  `G`       OrderCancelReplaceRequest
  `F`       OrderCancelRequest
  `9`       OrderCancelReject
  `q`       OrderMassCancelRequest
  `r`       OrderMassCancelReport
  `DJ`      MassOrder

## Cancel individual `35=F`

Identificação usa combinação de:

``` text
55 Symbol
37 OrderID
11 ClOrdID
41 OrigClOrdID
```

O aceite pode aparecer primeiro como ExecutionReport `35=8` / pending
cancel; a confirmação final chega posteriormente.

## Mass Cancel `35=q`

Principais tags:

``` text
11  ClOrdID
530 MassCancelRequestType
55  Symbol
```

O fluxo é assíncrono. Cada ordem afetada ainda pode gerar
ExecutionReport/CancelReject.

## MassOrder `35=DJ`

Extensão inspirada em FIX 5.0 SP2 para adicionar/cancelar várias ordens
independentes numa única mensagem, otimizada para trading de alta
performance.

------------------------------------------------------------------------

# 21. FIX --- ExecutionReport `35=8`

É a mensagem central para lifecycle de ordens e executions.

Campos típicos relevantes incluem:

``` text
OrderID
ClOrdID
ExecID
ExecType
OrdStatus
Symbol
Side
OrderQty
OrdType
Price
TimeInForce
LeavesQty
CumQty
AvgPx
LastQty
LastPx
TransactTime
fees / commission-related fields
trade identifiers
liquidity / match metadata
```

### `ExecType(150)` documentados

  Valor   Significado
  ------- ---------------------------------------
  `0`     new order
  `4`     cancelled
  `A`     request NewOrderSingle aceito/pending
  `8`     NewOrderSingle rejeitado
  `6`     cancel request aceito/pending
  `I`     resposta de OrderStatusRequest
  `F`     trade

Campos de microestrutura adicionados incluem `MatchCount (20101)` e
`MatchIndex (20102)`; o segundo ajuda a indicar posição do maker na fila
para aquele match.

------------------------------------------------------------------------

# 22. FIX --- Order Status

## `OrderStatusRequest (35=H)`

Disponível no **Order Management Flow**, não no Drop Copy.

Identifique a ordem com:

``` text
55 Symbol
11 ClOrdID
ou
37 OrderID
```

Resposta:

``` text
ExecutionReport (35=8)
ExecType(150)=I
```

------------------------------------------------------------------------

# 23. FIX --- Market Data

## Request `35=V`

Usado para book e trades.

Tags:

    Tag Campo
  ----- -------------------------
    262 MDReqID
    263 SubscriptionRequestType
    264 MarketDepth
    265 MDUpdateType
    266 AggregatedBook
    547 MDImplicitDelete
    267 NoMDEntryTypes
    269 MDEntryType
    146 NoRelatedSym
     55 Symbol

`MDReqID` segue a semântica:

``` text
book.{Symbol}.{MarketDepth}
trade.{Symbol}
```

Subscription:

``` text
263=1 subscribe
263=2 unsubscribe
```

Book usa incremental refresh.

## Incremental Refresh `35=X`

Tags importantes:

      Tag Campo
  ------- ----------------
      262 MDReqID
      278 MDEntryID
      280 MDEntryRefID
       55 Symbol
    10273 MDEntryTimeMs
      268 NoMDEntries
      279 MDUpdateAction
      269 MDEntryType
      270 MDEntryPx
      271 MDEntrySize
      346 NumberOfOrders
    10851 TakerSide
      880 TrdMatchID

`MDUpdateAction`:

``` text
0 New
1 Update
2 Delete
```

`MDEntryType`:

``` text
0 Bid
1 Offer
2 Trade
J Empty Book
```

Ao receber `J`, limpe o book local.

## MarketDataRequestReject `35=Y`

Inclui `MDReqID`, motivo de rejeição e texto opcional.

## Snapshot / Full Refresh `35=W`

Usado como resposta/snapshot de market data, com estrutura semelhante de
entries.

------------------------------------------------------------------------

# 24. FIX --- Security Definition

## `SecurityDefinitionRequest (35=c)`

Consulta metadados de um instrumento.

Principais tags:

``` text
320 SecurityReqID
321 SecurityRequestType
55  Symbol
263 SubscriptionRequestType
```

## `SecurityDefinition (35=d)`

Retorna definição do instrumento. O repeating group de atributos pode
representar:

-   display name
-   base currency
-   quote currency
-   quantity decimals
-   quote decimals
-   price tick size
-   quantity tick size
-   max leverage
-   tradable
-   expiry
-   beta-product flag
-   margin buy enabled
-   margin sell enabled

## `SecurityListRequest (35=x)` / `SecurityList (35=y)`

Usado para obter várias definições de instrumentos de uma vez.

------------------------------------------------------------------------

# 25. FIX --- Business Reject

## `BusinessMessageReject (35=j)`

Mensagem de rejeição em nível de aplicação quando a mensagem não pode
ser processada normalmente. A aplicação deve registrar o request
original, sequence number, message type e reason/text para
reconciliation.

------------------------------------------------------------------------

# 26. FIX --- inventário completo de MsgTypes documentados

  MsgType   Nome
  --------- --------------------------------
  `A`       Logon
  `5`       Logout
  `0`       Heartbeat
  `1`       TestRequest
  `2`       ResendRequest
  `4`       SequenceReset
  `D`       NewOrderSingle
  `G`       OrderCancelReplaceRequest
  `F`       OrderCancelRequest
  `9`       OrderCancelReject
  `q`       OrderMassCancelRequest
  `r`       OrderMassCancelReport
  `DJ`      MassOrder
  `8`       ExecutionReport
  `H`       OrderStatusRequest
  `V`       MarketDataRequest
  `X`       MarketDataIncrementalRefresh
  `Y`       MarketDataRequestReject
  `c`       SecurityDefinitionRequest
  `d`       SecurityDefinition
  `W`       MarketDataSnapshot/FullRefresh
  `x`       SecurityListRequest
  `y`       SecurityList
  `j`       BusinessMessageReject

------------------------------------------------------------------------

# 27. Arquitetura recomendada para uma trading stack

Para uma mesa/tesouraria, uma arquitetura robusta seria:

``` text
                     +----------------------+
                     | Instrument Reference |
                     | REST / FIX Security  |
                     +----------+-----------+
                                |
                                v
+-------------+       +---------+---------+       +----------------+
| Market Data | ----> | Local Book / BBO | ----> | Pricing Engine |
| WS or FIX   |       | + sequence state |       | / Strategies   |
+-------------+       +-------------------+       +-------+--------+
                                                          |
                                                          v
                                                  +-------+--------+
                                                  | Order Manager  |
                                                  +-------+--------+
                                                          |
                                       +------------------+------------------+
                                       |                                     |
                                       v                                     v
                                  REST / WS                              FIX Order Entry
                                       |                                     |
                                       +------------------+------------------+
                                                          |
                                                          v
                                                  +-------+--------+
                                                  | Reconciliation |
                                                  | user.order /   |
                                                  | user.trade /   |
                                                  | Drop Copy      |
                                                  +-------+--------+
                                                          |
                                                          v
                                                  REST recovery APIs
```

### Para baixa latência

Preferência natural:

``` text
FIX Market Data
+ FIX Order Entry
+ FIX Drop Copy
```

### Para implementação mais simples

``` text
WS Market Data
+ WS User API
+ REST para recovery/reference
```

### Híbrido comum

``` text
WS/FIX market data
FIX execution
REST reference/recovery
```

------------------------------------------------------------------------

# 28. Reconciliation e recovery --- checklist

1.  Gere `client_oid` / `ClOrdID` globalmente únicos.
2.  Persista mapping `client id <-> exchange order id`.
3.  Trate create/cancel como operações assíncronas.
4.  Não confunda acknowledgement com estado definitivo.
5.  Consuma `user.order`/ExecutionReport.
6.  Consuma `user.trade`/Drop Copy para fills.
7.  Em reconnect, recupere open orders.
8.  Recupere fills com `private/get-trades`.
9.  Reconcile posições e balances.
10. No FIX, persista inbound/outbound sequence numbers.
11. Implemente ResendRequest e GapFill corretamente.
12. Deduplicate mensagens com `PossDupFlag`.
13. Rebuild do book deve respeitar snapshot/sequence/deltas.
14. Trate Cancel-on-Disconnect como proteção adicional.
15. Tenha kill switch independente.

------------------------------------------------------------------------

# 29. Diferenças práticas REST × WS × FIX

  ----------------------------------------------------------------------------
  Aspecto           REST                 WebSocket           FIX
  ----------------- -------------------- ------------------- -----------------
  facilidade        alta                 média               menor

  market data       limitado             excelente           excelente
  real-time                                                  

  order entry       sim                  sim                 sim

  throughput        moderado             alto                muito alto

  session state     não                  sim                 sim + seq nums

  recovery protocol aplicação            aplicação           FIX resend/gap
                                                             fill

  drop copy         não                  user streams        sim
  dedicado                                                   

  infra             simples              simples             PrivateLink/FIX
  institucional                                              engine

  melhor uso        reference/recovery   streaming/trading   execution
                                                             institucional
  ----------------------------------------------------------------------------

------------------------------------------------------------------------

# 30. Mudanças recentes relevantes

## REST / WS institucional

A documentação consultada registra, entre outras:

-   **2026-05-21** --- `public/get-instruments`: adição de
    `product_type`
-   **2025-10-16** --- atualização da seção Advanced Order Management
-   **2024-08-15** --- fee-rate APIs
-   **2024-07-30** --- daily archive export APIs
-   **2023-08-11** --- batch create/cancel
-   **2023-07-31** --- funding/estimated funding market data

## FIX

Entre as mudanças mais recentes documentadas:

-   **2025-11-13** --- `35=D`: `ReceiveWindow (20100)`
-   **2025-08-29** --- atualização de descrições de timestamps/tags
-   **2025-07-09** --- `SMART_POST_ONLY`
-   **2025-06-26** --- `35=G` OrderCancelReplaceRequest
-   **2025-05-29** --- market depth 1 em `35=V`
-   **2025-02-06** --- tag adicional em ExecutionReport

------------------------------------------------------------------------

# 31. Observações de implementação

## Clock synchronization

Sincronize servidores via NTP/PTP conforme sua exigência de latência.
`INVALID_NONCE`, ReceiveWindow e timestamps FIX tornam clock drift
operacionalmente relevante.

## Numeric representation

Evite `float` binário para price/quantity. Em Java/C#/Python:

``` text
BigDecimal / decimal / Decimal
```

Mantenha a representação string da exchange na camada de protocolo.

## Idempotência

`client_oid` / `ClOrdID` é peça central para:

-   retry seguro
-   deduplicação
-   reconciliation
-   recovery pós-disconnect

## Book

Seu book handler deve saber:

``` text
snapshot
sequence/update id
delta
delete
empty-book
gap detection
resubscribe/rebuild
```

## Fills

Nunca derive fill apenas de mudança de order status. Trate
execution/trade como evento próprio e idempotente.

------------------------------------------------------------------------

# 32. Fontes oficiais

Documentação REST/WS institucional:

``` text
https://exchange-docs.crypto.com/exchange/v1/rest-ws/index-insto-8556ea5c-4dbb-44d4-beb0-20a4d31f63a7.html
```

Documentação REST/WS pública Exchange v1:

``` text
https://exchange-developer.crypto.com/exchange/v1
```

Documentação FIX:

``` text
https://exchange-docs.crypto.com/exchange/index-fix-f18-2a5a30f4-9177-4c97-aff6-923291d24255.html
```

A página FIX oficial também oferece um **QuickFIX XML dictionary** para
Order Management / Market Data. Para implementação real com QuickFIX/J,
QuickFIX/n ou QuickFIX/C++, use o XML oficial como fonte de verdade para
tags e message definitions.

------------------------------------------------------------------------

# 33. Escopo desta consolidação

Incluído:

-   endpoints e ambientes
-   autenticação REST/WS
-   assinatura
-   rate limits
-   inventário REST institucional
-   trading/order management
-   balances/positions/history/wallet
-   WebSocket user streams
-   WebSocket market data
-   heartbeat
-   FIX connectivity
-   FIX authentication
-   session management
-   order entry
-   cancel/amend/mass order
-   execution reports
-   FIX market data
-   security definitions
-   recovery/reconciliation
-   mudanças recentes

A Crypto.com mantém documentação separada para alguns produtos, como
OTC/RFQ. Esses fluxos não foram misturados à API principal acima para
evitar confundir o protocolo de exchange/order-book com RFQ/OTC.

------------------------------------------------------------------------

## Fim
