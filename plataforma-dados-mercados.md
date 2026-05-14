# Plataforma Proprietária de Dados e Inteligência de Mercados

> Proposta arquitetural para uma plataforma de uso individual que unifica dados on-chain, off-chain e mercados tradicionais, tendo como benchmark de profundidade analítica a Glassnode — mas com escopo expandido para qualquer classe de ativo.

---

## Sumário

1. [Visão Geral e Tese Central](#1-visão-geral-e-tese-central)
2. [Princípios Arquiteturais Inegociáveis](#2-princípios-arquiteturais-inegociáveis)
3. [Arquitetura em Camadas](#3-arquitetura-em-camadas)
4. [As Duas Esteiras de Cripto: On-chain e Off-chain](#4-as-duas-esteiras-de-cripto-on-chain-e-off-chain)
5. [Encaixe do Escopo Cripto na Plataforma Maior](#5-encaixe-do-escopo-cripto-na-plataforma-maior)
6. [Métricas e Inteligência Cross-Domain](#6-métricas-e-inteligência-cross-domain)
7. [Roteiro de Construção (MVP até Plataforma)](#7-roteiro-de-construção-mvp-até-plataforma)
8. [Premissas Arquiteturais que Sobrevivem à Escala](#8-premissas-arquiteturais-que-sobrevivem-à-escala)
9. [Armadilhas Conhecidas](#9-armadilhas-conhecidas)
10. [Próximos Aprofundamentos Possíveis](#10-próximos-aprofundamentos-possíveis)

---

## 1. Visão Geral e Tese Central

### 1.1 O que a plataforma é

Uma plataforma proprietária de uso individual que **ingere, normaliza, deriva e serve dados de qualquer mercado** — começando por cripto (com profundidade analítica equivalente à Glassnode), mas projetada desde o dia 1 para acomodar renda variável (B3), renda fixa, FX, commodities, derivativos e indicadores macroeconômicos.

O valor não está nos dados brutos (que são públicos ou compráveis), está em:

- **A camada de derivação** — métricas customizadas, versionadas, reproduzíveis.
- **A latência de consulta** — serving otimizado para séries temporais.
- **A unificação cross-domain** — métricas que cruzam cripto, B3 e macro num mesmo plano analítico, algo que ferramentas siladas (Glassnode + TradingView + Status Invest) não conseguem oferecer.
- **A camada de inteligência** — alerting, backtesting, portfolio analytics rodando sobre o mesmo substrato.

### 1.2 A virada conceitual

> **Cripto não é "o sistema". Cripto é um domínio dentro do sistema.**

Mercados diferentes divergem em **fontes, microestrutura e regulação**, mas convergem em **três primitivas universais**:

1. **Instrumento** — algo identificável e negociável (BTC, PETR4, USDBRL, Treasury 10Y, contrato futuro de boi, IPCA como série).
2. **Evento** — algo que aconteceu em um tempo (trade, quote, dividendo, transferência on-chain, divulgação de balanço, decisão de juros).
3. **Observação derivada** — algo computado a partir de eventos (preço de fechamento, MVRV, P/L, beta, funding rate, IPCA mensal anualizado).

Se a plataforma modela essas três primitivas de forma genérica e estende por domínio via **adaptadores**, ela escala horizontalmente para qualquer mercado. Se ela acopla primitivas específicas de cripto (blocos, UTXOs) ou de B3 (leilão de abertura, after-market) no core, ela trava.

### 1.3 Benchmark Glassnode (e onde vamos além)

A Glassnode entrega: ingestão de blockchains → normalização → derivação de centenas de métricas on-chain → serving rápido via dashboards e API.

Nossa plataforma:

- Replica isso para cripto (on-chain + off-chain).
- Estende o mesmo motor para mercados tradicionais.
- Permite **métricas cross-domain** que a Glassnode (por escopo) não entrega: correlação BTC vs Ibovespa em regimes de DXY, fluxo cambial vs flows on-chain de stablecoins, etc.
- Trata **portfolio próprio** como mais um instrumento do sistema — risk decomposition unificado entre B3 + cripto + caixa.

---

## 2. Princípios Arquiteturais Inegociáveis

Mesmo que toda a stack seja trocada no futuro, estes princípios devem sobreviver:

1. **Separação rígida de camadas**: `raw → normalized → derived → served`. Cada camada tem contrato próprio e é construída sobre as anteriores, nunca pula.
2. **Idempotência e versionamento de métricas**: reprocessar a mesma janela de tempo deve produzir o mesmo resultado. Mudou a fórmula de uma métrica? Versione o output (`sopr_v2`).
3. **Particionamento temporal desde o dia 1**: storage particionado por data/height. Sem isso, reprocessamento histórico vira inviável.
4. **Storage analítico columnar** (Parquet, ClickHouse, Timescale, DuckDB) para tudo que é série temporal e métrica. **Nunca** rodar analytics em cima do banco transacional do node ou da ingestão.
5. **Imutabilidade do passado + recompute curto da ponta**: o histórico (acima de N blocos de profundidade ou N períodos consolidados) é cacheável agressivamente. A ponta é volátil.
6. **Append-only no raw, idempotente em todo lugar**: reingerir nunca corrompe estado.
7. **Adaptadores plugáveis com contrato comum**: toda fonte expõe a mesma interface. Cada novo provedor é um plugin, não um rewrite.
8. **Preservar o payload bruto sempre**: se o modelo canônico evoluir, você re-traduz. Se você jogou o bruto fora, ficou cego.
9. **Métrica é função pura, versionada, com lineage**: dado um input e uma versão de fórmula, o output é determinístico e rastreável.
10. **Modelo de domínio antes de pipelines**: identity registry, taxonomia de classes de ativo e calendários são pré-requisitos, não detalhes.

---

## 3. Arquitetura em Camadas

A arquitetura geral, da base para o topo:

```
┌──────────────────────────────────────────────────────────────┐
│  Camada 5 — Serving & Intelligence                           │
│  (Time-series API, Analytics, Alerting, Backtesting,         │
│   Portfolio, LLM-assisted exploration)                       │
├──────────────────────────────────────────────────────────────┤
│  Camada 4 — Derived / Gold                                   │
│  (Métricas e features versionadas, agnósticas de domínio     │
│   ou específicas via módulos)                                │
├──────────────────────────────────────────────────────────────┤
│  Camada 3 — Normalized / Silver                              │
│  (Fact tables canônicas: trades, quotes, ohlcv, transfers,   │
│   fundamentals, macro releases, sentiment...)                │
├──────────────────────────────────────────────────────────────┤
│  Camada 2 — Raw / Bronze                                     │
│  (Payloads brutos, append-only, particionados por            │
│   (source, date), imutáveis)                                 │
├──────────────────────────────────────────────────────────────┤
│  Camada 1 — Ingestion (Source Adapters)                      │
│  (Plugins com contrato comum: discover, fetch_incremental,   │
│   fetch_historical, schema, health)                          │
├──────────────────────────────────────────────────────────────┤
│  Camada 0 — Domain Model & Identity                          │
│  (Instrument Registry, Asset Class Taxonomy, Calendar &      │
│   Timezone Service, Hierarchies & Relationships)             │
└──────────────────────────────────────────────────────────────┘

  Atravessam tudo: Orquestração, Observabilidade, Data Quality,
  Lineage, Métricas Registry, Schema Registry, Secret Management
```

### 3.1 Camada 0 — Domain Model & Identity

A mais importante e a mais subestimada. Antes de qualquer pipeline existir, defina:

#### 3.1.1 Universal Instrument Registry

Cada coisa observável/negociável tem um **ID interno estável**, independente do símbolo do provedor.

- PETR4 na B3, na Bloomberg, no Yahoo e na corretora tem ticker diferente → precisa de chave própria + mapa de aliases.
- BTC tem CoinGecko ID, CoinMarketCap ID, símbolos diferentes por exchange (BTCUSDT na Binance, XBT na Kraken, BTC-USD na Coinbase).
- Mesma série macro pode vir do BCB, do IBGE e do FRED com IDs diferentes.

Modelo conceitual:

```
Instrument
  ├─ internal_id (UUID/slug estável)
  ├─ canonical_name
  ├─ asset_class (equity | crypto | fx | rates | commodity | macro_series | ...)
  ├─ subclass (common_stock | stablecoin | future | option | ...)
  ├─ attributes {específicos da classe}
  └─ aliases [{source, external_id, since, until}]
```

#### 3.1.2 Taxonomia de classes de ativo

Hierarquia com herança de atributos:

- **Equity** → atributos: issuer, sector, listing_venue, currency, ISIN, CNPJ.
- **Crypto-asset** → atributos: protocol, contract_address (se token), decimals, supply_model.
- **FX pair** → atributos: base, quote.
- **Future / Option** → atributos: underlying, expiry, strike, contract_size, exchange.
- **Bond** → atributos: issuer, coupon, maturity, frequency.
- **Macro indicator** → atributos: source_agency, frequency, unit, seasonality_adjusted.
- **On-chain entity** → atributos: address/contract, chain, cluster_id, labels.

Tudo herda de `Instrument` para que o serving e as métricas não precisem ramificar por classe quando a operação é genérica (ex: "calcular volatilidade 30d").

#### 3.1.3 Calendar & Timezone Service

Mercados diferentes têm regimes temporais radicalmente diferentes:

- B3 — pregão 10h-17h BRT, leilão de abertura/fechamento, feriados nacionais.
- NYSE/NASDAQ — horário americano, half-days, feriados americanos.
- Cripto — 24/7, sem feriado.
- FX — fechamento de sexta tarde, abertura de domingo à noite, rollover.
- Macro — releases agendados (FOMC, COPOM, payroll, IPCA, PIB).

Modelar isso como um **serviço próprio** desde o dia 1. Toda métrica que tem "fechamento diário", "última observação válida" ou "janela de N períodos" consulta esse serviço. Sem isso, você terá bugs eternos como "por que o dado de sexta da PETR4 aparece datado de sábado".

#### 3.1.4 Hierarquias e Relacionamentos

Onde a inteligência mora:

- PETR4 ↔ Petrobras (issuer) ↔ Setor Petróleo ↔ Ibovespa (índice) ↔ Brasil (jurisdição).
- BTC ↔ Bitcoin (protocolo) ↔ Asset Class Crypto ↔ Layer 1.
- ETH ↔ várias L2s (Arbitrum, Optimism, Base) ↔ tokens ERC-20.
- Endereço on-chain ↔ Cluster ↔ Entidade conhecida (Binance Cold Wallet) ↔ Categoria (CEX).

Esses relacionamentos viram **dimension tables** ou um **graph store** secundário. Permitem queries do tipo "soma de Exchange Net Flow agregado por categoria CEX vs DEX".

---

### 3.2 Camada 1 — Ingestion (Source Adapters)

Cada fonte é um **adaptador plugável** com contrato comum:

```
AdapterInterface:
  discover()           → quais instrumentos/eventos esta fonte expõe
  fetch_incremental(checkpoint) → eventos novos desde o último checkpoint
  fetch_historical(range)       → backfill de janela arbitrária
  schema()             → como o payload mapeia para o modelo canônico
  health()             → estou vivo? qual o lag? qual a taxa de erro?
  metadata()           → rate limits, custos, SLAs declarados
```

#### Exemplos de adaptadores por domínio

| Domínio | Fonte | Tipo |
|---|---|---|
| Cripto on-chain | Bitcoin Core (full node + indexer) | Push (ZMQ) + Pull histórico |
| Cripto on-chain | Erigon / Reth (Ethereum) | Push + Pull |
| Cripto on-chain | The Graph / Etherscan | Pull REST |
| Cripto off-chain | Binance / Coinbase / OKX WebSocket | Push WS |
| Cripto off-chain | Deribit (derivativos / options) | Push WS + Pull REST |
| Renda variável | Vendor de market data B3 (CEDRO, Cohen, etc) | Push / Pull |
| Renda variável | CVM / RAD (fatos relevantes, demonstrações) | Pull REST |
| Macro BR | BCB SGS (séries) | Pull REST agendado |
| Macro BR | IBGE SIDRA | Pull REST agendado |
| Macro global | FRED / World Bank | Pull REST |
| Notícias / sentiment | News APIs, Twitter/X, Reddit | Push / Pull (opcional) |
| Portfolio próprio | Corretora API / CSV / planilha | Pull agendado ou upload |

#### Premissas críticas da camada de ingestão

- O adaptador traduz para schema canônico **mas preserva o payload bruto** na camada Raw.
- Cada adaptador tem **checkpoint próprio** — onde ele parou da última vez. Reingerir é seguro (idempotente).
- **Falhas são esperadas, não excepcionais**: rate limit, schema mudou, fonte caiu. Retry com backoff, circuit breaker, deadletter.
- **Múltiplas instâncias do mesmo adaptador** (redundância) quando o dado é efêmero (orderbook WS) — dedupe a posteriori.
- Pool de credenciais (API keys) gerenciado fora do código.

---

### 3.3 Camada 2 — Raw / Bronze

Tudo que entra é gravado **bruto, imutável, append-only**, particionado por `(source, date)` ou `(source, date, instrument_class)`.

- Formato: idealmente columnar comprimido (Parquet + ZSTD) para histórico; pode ser JSON/Avro para landing inicial antes de compaction.
- TTL: nenhum no MVP. Custo de storage é baixo comparado ao custo de não poder reprocessar.
- Este é o seu **"right to replay"**. Sem ele, você não corrige bug histórico nem audita.

---

### 3.4 Camada 3 — Normalized / Silver (Canonical Event Model)

Tabelas-fato organizadas **por tipo de evento, não por fonte**. Star schema clássico — funciona há décadas por uma razão.

#### Fact tables principais

| Tabela | Conteúdo | Domínios |
|---|---|---|
| `fact_trades` | Cada trade individual | Cripto, B3, futuros |
| `fact_quotes` | Quotes / book snapshots | Cripto, B3, FX |
| `fact_ohlcv` | Barras agregadas (1m, 1h, 1d) | Todos |
| `fact_onchain_transfer` | Transferência de valor on-chain | Cripto on-chain |
| `fact_onchain_state` | Snapshots de estado (UTXO set, balances) | Cripto on-chain |
| `fact_derivatives` | Funding rate, OI, liquidations, basis | Cripto derivativos, futuros B3 |
| `fact_corporate_action` | Dividendo, split, JCP, recompra | Renda variável |
| `fact_macro_release` | IPCA, COPOM, FOMC, NFP, PIB | Macro |
| `fact_fundamentals` | DRE, balanço, métricas trimestrais | Renda variável |
| `fact_sentiment` | Score por instrumento/tempo | Opcional, todos |

#### Dimension tables

- `dim_instrument` — registry de instrumentos (Camada 0 materializada).
- `dim_time` — calendário, com flags por mercado (is_trading_day_b3, is_trading_day_nyse, etc).
- `dim_source` — providers, com SLAs e metadados.
- `dim_entity` — entidades on-chain conhecidas (clusters, labels).
- `dim_sector` / `dim_industry` — taxonomias setoriais.

#### Schema canônico das fact tables (esqueleto)

Toda fact table compartilha:

```
instrument_id   → FK dim_instrument
event_time      → timestamp UTC do evento
source_id       → FK dim_source
ingested_at     → quando entrou no sistema
version         → versão do schema/transform
... campos específicos do tipo de evento
```

---

### 3.5 Camada 4 — Derived / Gold

Aqui o produto vive. **Métrica = função pura sobre Silver, versionada, com lineage.**

#### 3.5.1 Métricas agnósticas de domínio

Funcionam para qualquer série de preços/retornos:

- Realized Volatility (várias janelas).
- Sharpe, Sortino, Calmar, Max Drawdown.
- Cross-asset correlation matrix.
- Momentum, Mean Reversion, RSI, MACD.
- Beta vs benchmark configurável.
- Rolling z-scores e percentiles.

#### 3.5.2 Métricas específicas de domínio

**Cripto on-chain** (depende de `fact_onchain_transfer` + `fact_ohlcv`):

- SOPR (Spent Output Profit Ratio)
- MVRV (Market Value to Realized Value)
- Realized Cap
- NUPL (Net Unrealized Profit/Loss)
- Active Addresses, New Addresses
- Exchange Net Flow
- HODL Waves
- Hash Ribbons (deriva de hash rate)
- Coin Days Destroyed

**Cripto derivativos** (depende de `fact_derivatives`):

- Funding Rate Z-score
- Open Interest dominance
- Liquidation heatmap
- Term structure / Basis

**Renda variável** (depende de `fact_fundamentals` + `fact_ohlcv`):

- P/L, P/VPA, EV/EBITDA
- Dividend Yield
- ROE, ROIC
- Earnings revisions

**Macro** (depende de `fact_macro_release`):

- Real interest rate
- Yield curve slope (2y10y, 3m10y)
- Inflation surprise index
- Real exchange rate

#### 3.5.3 Características obrigatórias de toda métrica

- **Determinística**: dado input X e versão Y, output é sempre o mesmo.
- **Versionada**: mudou a fórmula → cria `metric_name_v2`, mantém histórico do v1.
- **Particionada temporalmente**: escrita em storage columnar particionado.
- **Com lineage**: para cada valor, dá pra rastrear quais fatos contribuíram.
- **Declarativa de dependências**: a métrica declara o que lê (quais fact tables, outras métricas, dimensões).
- **Backfillável**: roda incremental (novo período) e histórico (recompute de 2009 a hoje) com a mesma lógica.

#### 3.5.4 Registry de métricas

Catálogo central com:

```
metric_id, name, version, formula_ref, domain, asset_class, frequency,
dependencies [...], owner, tags [...], description, validation_rules [...]
```

Permite descoberta, governança e filtros ("me dê todas as métricas de cripto on-chain semanais").

---

### 3.6 Camada 5 — Serving & Intelligence

Três modos de acesso, em ordem crescente de sofisticação:

#### 3.6.1 Time-series API

Endpoint único, agnóstico de domínio:

```
GET /metrics/{metric_name}?instrument={id}&from=...&to=...&resolution=1d
```

- Lê de storage otimizado para séries temporais (ClickHouse, Timescale, DuckDB+Parquet).
- Cache agressivo no histórico (imutável). Cache curto na ponta.
- **Nunca** consulta direto Bronze/Silver em runtime.

#### 3.6.2 Query / Analytics Layer

SQL ou DSL sobre Gold para análises ad-hoc:

- DuckDB local lendo Parquet (operador solo, custo zero).
- ClickHouse para escala.
- Query engine federado (Trino) se houver múltiplas storages.

#### 3.6.3 Intelligence Layer

Onde "dados" vira "inteligência":

- **Alerting declarativo**: `when MVRV > 3 AND funding_rate_zscore > 2 → alert`.
- **Backtesting framework**: consome métricas Gold como features, simula estratégias.
- **Cross-domain analytics**: correlações, regimes, copulas entre domínios.
- **Portfolio analytics**: carteira pessoal como "instrumento composto", risk decomposition, exposição setorial, atribuição de performance.
- **LLM-assisted exploration** (opcional, mas alto valor): linguagem natural → query sobre o catálogo de métricas e instruments.

#### 3.6.4 Frontend

Para MVP individual:

- Grafana lendo direto do storage de time-series (zero código de UI).
- Jupyter / Streamlit para exploração.
- Dashboard custom apenas quando o produto justificar.

---

## 4. As Duas Esteiras de Cripto: On-chain e Off-chain

Dentro do domínio cripto, há duas esteiras com características operacionais radicalmente diferentes. Elas **divergem na ingestão e na semântica** mas **convergem a partir da camada normalizada**.

### 4.1 O que é compartilhado

- Orquestrador de jobs.
- Storage analítico columnar.
- Camada de serving.
- Registry de métricas.
- Schema canônico (`instrument_id, event_time, source_id, version, ingested_at`).
- Data quality framework.
- Observabilidade.

### 4.2 Esteira On-chain

#### Característica fundamental

> Dado **determinístico, verificável e imutável** (módulo reorgs de poucos blocos). Reprocessar o passado chega exatamente no mesmo valor.

#### Ingestão

- **Full node + indexador** (bitcoind + Electrs; Erigon/Reth para ETH).
- Modo incremental (subscriber no tip via ZMQ/websocket) + modo histórico (varredura).
- Output bruto: blocos, transações, inputs, outputs, traces, logs, state diffs.

#### Particularidades

- **Reorg handling**: últimos ~6 blocos (BTC) ou ~64 (ETH pré-finality) são voláteis. Métricas precisam distinguir "confirmado" vs "preliminar". Solução: Gold só recebe dados com profundidade > threshold; o tip vai pra um cache separado marcado como `preliminary`.
- **Address clustering / labeling**: camada Silver pesada. Heurísticas (common-input-ownership) + datasets de labels (exchanges, miners, DeFi). É o que transforma "transferência genérica" em "Exchange Net Flow".
- **Join com preço (off-chain)**: cada UTXO/transfer precisa de "preço no momento de criação" para virar valor econômico (Realized Cap, MVRV, SOPR). **Já demanda integração entre esteiras desde cedo**.

#### Volume e storage

- Bronze gigante (BTC + ETH normalizados facilmente passam de 5TB).
- Particionar por height/data agressivamente.
- Parquet + ZSTD para histórico frio; ClickHouse com TTL para morno.

#### Latência aceitável

Da chain → métrica servida: **segundos a minutos**. Você não compete com HFT — gera análise, não execução.

### 4.3 Esteira Off-chain

#### Característica fundamental

> Dado **efêmero, não-determinístico e fornecedor-dependente**. Se você não capturou o snapshot às 14:32:07, ele **não existe mais**.

A **captura é o produto**, porque ninguém vai te dar o passado depois.

#### Categorias

- **Market data**: preço, volume, OHLCV, trades, orderbook (Binance, Coinbase, OKX, Bybit, etc).
- **Derivatives**: funding rates, open interest, basis, liquidations, options surface (Deribit).
- **Off-chain fundamentals**: stablecoin issuance/redemption, ETF flows, custodial balances reportados.
- **Sentiment / social / macro** (opcional).

#### Ingestão

- **WebSockets persistentes** para tempo real (trades, orderbook deltas). Connection management, reconnect com gap detection, sequence number tracking.
- **REST polling** para snapshots agendados (funding rate a cada 8h, OI a cada minuto).
- **Multi-source por design**: preço de BTC não vem de uma fonte — vem de N exchanges, agregados.

#### Particularidades

- **Schema heterogêneo**: cada exchange tem campos diferentes. Bronze guarda payload bruto; Silver normaliza.
- **Time alignment**: clock skew entre exchanges, latência de rede, granularidades diferentes (ms, μs, s). Normalizar para UTC monotônico é trabalho contínuo.
- **Gap detection e backfill é fraco**: se a conexão caiu, alguns dados estão *perdidos para sempre* — só recupera o que a API histórica devolve (trades geralmente sim, orderbook não). Obriga **redundância de captura** + dedupe.
- **Rate limiting e custódia de keys**: pool de API keys, circuit breakers, exponential backoff.
- **Agregação multi-exchange**: "Preço do BTC" vira série derivada — VWAP ponderado por liquidez com filtro de outliers, igual a um índice (CF Benchmarks, CCData).

#### Volume e storage

Variável. Orderbook L2 tick-by-tick é monstruoso; OHLCV diário é trivial. **Decidir granularidade pelo caso de uso** — para MVP, OHLCV 1m + funding/OI + liquidations cobre 80% do valor.

#### Latência aceitável

- Dashboards: segundos.
- Métricas derivadas: minutos OK.
- "Ao vivo": websocket → cache em memória → API (não passa pelo batch).

### 4.4 Comparativo direto

| Eixo | On-chain | Off-chain |
|---|---|---|
| Determinismo | Alto (reproduzível) | Baixo (snapshot perdido = perdido) |
| Modo de ingestão | Pull do node (eu controlo) | Push/Pull de terceiros (eles controlam) |
| Backfill histórico | Sempre possível | Limitado ao que a fonte expõe |
| Falha crítica | Reorg / bug no indexador | Conexão caiu / API mudou schema |
| Volume típico | Crescimento linear, previsível | Spiky, depende de granularidade |
| Confiança na fonte | Verificável (consenso) | Reputacional ("acredito na Binance") |
| Redundância | Não exigida (1 node = verdade) | Exigida para séries críticas |

### 4.5 Pontos de cruzamento (onde mora o valor)

Métricas que cruzam as duas esteiras:

- **Realized Cap, MVRV, SOPR** — on-chain enriquecido com preço (off-chain).
- **Exchange Net Flow vs Funding Rate** — fluxo on-chain correlacionado com derivativo off-chain.
- **Stablecoin supply on-chain vs reservas reportadas off-chain** — sinal de descolamento/risco.
- **ETF holdings reportados (off-chain) vs custody addresses (on-chain)** — verificação cruzada.

Por isso a Silver **não pode ser dois silos**. Modele como data warehouse comum com dimensões compartilhadas (`instrument`, `time`, `entity`) e facts vindos de qualquer esteira. Gold faz joins livremente.

---

## 5. Encaixe do Escopo Cripto na Plataforma Maior

Dentro da plataforma unificada, o "produto Glassnode-like" vira **um conjunto coordenado de**:

1. **Adaptadores** específicos: full node BTC, indexador ETH, WebSocket de exchanges, APIs de derivativos.
2. **Subtipos de fact** específicos: `fact_onchain_transfer`, `fact_onchain_state`, `fact_derivatives`.
3. **Enrichments** próprios: address clustering, labels de exchanges/protocolos, UTXO age.
4. **Catálogo de métricas Gold** marcadas com `domain=crypto`: SOPR, MVRV, NUPL, Exchange Net Flow, Hash Ribbons.
5. **Dashboards / API endpoints** que filtram o catálogo para esse domínio.

**Mas nada disso é uma plataforma separada.** É uma vertical dentro da plataforma.

O dia em que você quiser adicionar "análogo Glassnode para B3" (ex: fluxo de investidor estrangeiro, short interest, options skew na B3), o padrão é idêntico: novos adaptadores, novos facts, novas métricas. **A espinha dorsal não muda.**

### 5.1 Diagrama de encaixe

```
              PLATAFORMA UNIFICADA
              ─────────────────────
                       │
        ┌──────────────┼──────────────┬──────────────┐
        │              │              │              │
     DOMÍNIO        DOMÍNIO         DOMÍNIO      DOMÍNIO
     CRIPTO         B3 / RV         MACRO        PORTFOLIO
        │              │              │              │
   ┌────┴────┐    ┌────┴────┐    ┌────┴────┐    ┌────┴────┐
   │on-chain │    │market   │    │BCB SGS  │    │corretora│
   │off-chain│    │data B3  │    │IBGE     │    │csv/api  │
   │derivs   │    │CVM/RAD  │    │FRED     │    │         │
   └─────────┘    └─────────┘    └─────────┘    └─────────┘
        │              │              │              │
        └──────────────┴──────────────┴──────────────┘
                          │
                  ESPINHA DORSAL
                  (orquestração, storage,
                   métricas registry, serving)
```

### 5.2 O ganho competitivo: métricas cross-domain

Coisas que ferramentas siladas **não conseguem** entregar:

- Correlação BTC vs Ibovespa condicional a regimes de DXY.
- BTC dominance vs flight-to-quality em ações brasileiras.
- Funding rate cripto como leading indicator de risk-on/off em emergentes.
- Sua carteira pessoal (B3 + cripto + caixa) com risk decomposition unificado.
- Volatilidade implícita de opções (Deribit) vs volatilidade implícita de PETR4 (B3) como termômetro de risco global.
- Fluxo cambial BR vs flows de stablecoins (USDT/USDC) on-chain.

---

## 6. Métricas e Inteligência Cross-Domain

### 6.1 Estrutura do catálogo de métricas

Toda métrica é registrada com:

```yaml
metric_id: mvrv_btc
version: 2
name: "Market Value to Realized Value"
domain: crypto
asset_class: crypto-asset
frequency: 1d
formula_ref: "formulas/crypto/mvrv.py::compute"
dependencies:
  facts: [fact_ohlcv, fact_onchain_state]
  metrics: [realized_cap_btc_v1]
  dims: [dim_instrument, dim_time]
validation_rules:
  - mvrv > 0
  - no_gaps_above_1d
tags: [valuation, on-chain, cycle-indicator]
owner: self
```

Com isso você consegue:

- Descobrir métricas por filtro (`domain=crypto AND tags contains "cycle"`).
- Recalcular cadeia dependente quando uma upstream muda.
- Gerar documentação automaticamente.
- Auditar quem depende do quê.

### 6.2 Camada de inteligência

Construída sobre Gold + Registry:

#### Alerting

DSL declarativa:

```yaml
alert: btc_overheated
condition: |
  mvrv_btc > 3.5
  AND funding_rate_zscore_btc > 2
  AND realized_vol_btc_30d > percentile(realized_vol_btc_30d, 90, window=2y)
notify: [email, telegram]
cooldown: 7d
```

#### Backtesting

Framework que consome métricas Gold como features e simula estratégias:

- Walk-forward / point-in-time corretos (sem look-ahead bias).
- Mesmo motor para cripto, ações, multi-asset.
- Métricas de performance reaproveitam o que já existe em Gold (Sharpe, drawdown).

#### Portfolio analytics

Sua carteira é **um instrumento composto** no sistema:

- Pluga via adaptador (corretora API ou CSV upload).
- Vira `fact_position` no Silver.
- Métricas de P&L, exposição, risco, atribuição de performance — agnósticas de domínio.

#### LLM-assisted exploration

Camada opcional mas alto-valor:

- "Me mostre todas as métricas on-chain que historicamente lideram topos de ciclo do BTC" → consulta ao registry + análise.
- Traduz linguagem natural em queries sobre o catálogo.

---

## 7. Roteiro de Construção (MVP até Plataforma)

### Fase 0 — Fundação (antes de qualquer dado real)

1. **Modelar Camada 0** (Domain Model & Identity).
2. Definir schema canônico Silver com instâncias de teste cobrindo PETR4 + BTC + IPCA — provar que o modelo aguenta os três antes de escrever ingestão de verdade.
3. Stack mínima da espinha dorsal: orquestrador, raw store, observabilidade básica.

### Fase 1 — Primeiro domínio end-to-end (escolha tática)

**Sugestão:** começar com **cripto off-chain (preços de exchanges) + uma série macro brasileira (Selic ou IPCA do BCB)**.

Por quê:

- Cobre dois domínios totalmente diferentes com fontes triviais.
- Valida o desenho genérico antes de investir em on-chain (que é pesado).
- Te dá **preço** — sem o qual on-chain não vira métrica econômica.

### Fase 2 — Cripto on-chain (BTC)

1. Subir node BTC + indexador.
2. Adaptador on-chain → Bronze → Silver normalizada.
3. Métricas iniciais que não dependem de cluster labels: Active Addresses, Hash Rate, Realized Cap (usando preço da fase 1).
4. Reorg handling.

### Fase 3 — Cripto cross-esteira

1. Address clustering básico (heurística common-input-ownership).
2. Labels manuais para top exchanges.
3. Métricas que cruzam esteiras: SOPR, MVRV, NUPL, Exchange Net Flow.
4. Esteira de derivativos (funding, OI).

### Fase 4 — Renda variável (B3)

1. Adaptador de market data (cotações intraday e EoD).
2. Adaptador de fundamentals (CVM/RAD).
3. Métricas equity: P/L, P/VPA, Dividend Yield, retorno ajustado por proventos.
4. Validação de que o modelo escala para mercado tradicional regulado.

### Fase 5 — Inteligência

1. Alerting framework.
2. Backtesting framework.
3. Portfolio integration.
4. Primeiras métricas cross-domain (BTC × Ibovespa × DXY).
5. LLM exploration (opcional).

### Fase 6 — Endurecimento

1. Redundância de coletores off-chain.
2. Data quality automatizado em todas as métricas.
3. Lineage end-to-end.
4. Reconciliação contra fontes externas.
5. Documentação automática a partir do registry.

---

## 8. Premissas Arquiteturais que Sobrevivem à Escala

Mesmo trocando toda a stack, mantenha:

1. **Separação rígida**: `raw → normalized → derived → served`.
2. **Idempotência e versionamento** em cada métrica.
3. **Particionamento temporal** desde o primeiro byte.
4. **Storage analítico columnar** para tudo que é métrica.
5. **Imutabilidade do passado, recompute curto da ponta**.
6. **Adaptadores plugáveis** com contrato comum.
7. **Modelo de domínio antes de pipelines** (Camada 0 é pré-requisito).
8. **Métrica como função pura, versionada, com lineage**.
9. **Preservar payload bruto** sempre.
10. **Calendário e timezone como serviço de primeira classe**.

---

## 9. Armadilhas Conhecidas

Coisas que matam projetos como esse:

- **Acoplar primitivas de um domínio no core.** Modelar a Silver pensando só em cripto e depois tentar enfiar B3 → refator doloroso.
- **Subestimar identity/aliases.** Não ter `dim_instrument` desde o dia 1 → strings de symbol espalhadas pelo código.
- **Ignorar calendário.** "Por que o dado de sexta aparece sábado" vira bug crônico.
- **Não preservar payload bruto.** Schema do provedor muda, modelo evolui — sem raw você não retraduz.
- **Não versionar métricas.** Corrige bug numa fórmula → quebra todos os dashboards históricos.
- **Métricas não-determinísticas.** Depender de "agora" ou de estado mutável → impossível reproduzir.
- **Confundir dado efêmero com persistente.** Tratar orderbook off-chain como recuperável → perde dados pra sempre quando a conexão cai.
- **Não declarar dependências de métricas.** Mudou upstream, não sabe o que recalcular.
- **Construir UI antes de ter pipeline confiável.** UI bonita sobre dado errado é pior que dado certo sem UI.
- **Querer escalar antes de validar.** Operador solo tentando ClickHouse cluster + Kafka + Kubernetes no MVP → projeto morre. DuckDB + Parquet + cron já entrega 80% até ter massa crítica.

---

## 10. Próximos Aprofundamentos Possíveis

Direções naturais para detalhar a partir desta proposta:

1. **Modelo canônico de schema completo** — DDL de `dim_instrument` cobrindo equity + crypto + derivativo + macro, exemplos de `fact_*` com tipos, exemplos de relacionamentos.
2. **Camada de inteligência detalhada** — desenho de backtesting com point-in-time, alerting DSL, portfolio analytics matemática.
3. **Trade-offs para operador solo** — build vs buy vs ignore, estimativa de custos de infra, o que cortar do escopo sem comprometer a tese, stack mínima recomendada.
4. **Detalhamento de uma esteira** — escolha uma (on-chain BTC, off-chain market data, B3, macro) e descer ao nível de implementação concreta.
5. **Plano de testes e data quality** — quais checks, em que camada, como reconciliar contra fontes externas.
6. **Governança de métricas** — workflow de criação, revisão, deprecação, versionamento; documentação automática.

---

*Documento vivo. Toda decisão de stack, fonte ou métrica deve ser checada contra os princípios da Seção 2 e contra as armadilhas da Seção 9 antes de ser implementada.*
