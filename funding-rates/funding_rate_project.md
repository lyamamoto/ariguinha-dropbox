# Projeto: Sistema de Modelagem e Arbitragem de Funding Rate em Crypto Perpetuals

> Documento de premissas, arquitetura conceitual e planejamento de fases  
> Baseado em revisão da literatura acadêmica e design de sistema próprio

---

## 1. Contexto e motivação

Perpetual futures são os derivativos mais negociados em mercados de criptomoedas, com volume diário superior a US$ 100 bilhões. Diferentemente de futuros com vencimento fixo, eles não convergem automaticamente ao preço spot. Para forçar essa ancoragem, existe o **funding rate**: detentores de posições compradas pagam periodicamente aos vendidos uma taxa proporcional à diferença entre o preço do futuro e o preço spot.

Essa taxa não é ruído — ela é um sinal econômico rico, resultado da interação entre demanda por alavancagem, limites de arbitragem e regime de mercado. A literatura acadêmica já demonstrou que o carry de futuros crypto pode atingir até 60% ao ano e que seus desvios de preço justo persistem por razões estruturais — não por ineficiência trivial.

O objetivo deste projeto é construir uma infraestrutura sistemática para coletar, modelar e gerar sinais de arbitragem a partir do funding rate, evoluindo de um monitor simples até um sistema quantitativo completo de geração de sinais.

---

## 2. Embasamento acadêmico

O projeto é ancorado em oito papers centrais, organizados por camada conceitual:

### Teoria e precificação
- **He, Manela, Ross, von Wachter** — *Fundamentals of Perpetual Futures* (2022/2024): Derivam preços sem arbitragem via *random-maturity arbitrage*. Mostram que desvios em crypto são maiores que em FX tradicional e diminuem com a maturação do mercado.
- **Angeris, Chitra, Evans, Lorig** — *A primer on perpetuals*: Setup teórico em tempo contínuo com fórmulas model-free para funding rates e estratégias de replicação.
- **Ackerer, Hugonnier, Jermann** — *Perpetual Futures Pricing*: Expressões explícitas para futuros lineares, inversos e quantos. O preço é a expectativa risk-neutral do spot amostrada em tempo aleatório proporcional à intensidade de ancoragem.

### Economia do funding rate
- **Christin, Routledge, Soska, Zetlin-Jones** — *The Crypto Carry Trade*: O funding positivo crônico reflete desequilíbrio estrutural — investidores pagam persistentemente por exposição alavancada; arbitrageurs são limitados por margem e risco de liquidação.
- **Schmeling, Schrimpf, Todorov** — *Crypto Carry* (BIS, 2023): O carry crypto reflete um *convenience yield* negativo volátil. Duas forças: (i) varejo trend-chasing buscando alavancagem; (ii) escassez de capital de arbitragem. Carry alto prediz crashes futuros.

### Microestrutura e design
- **Gornall, Rinaldi, Xiao** e **Ruan, Streltsov**: Design de contrato, liquidez e microestrutura do ciclo de funding. O mecanismo de "clamp" e a janela de 8h têm impactos diretos na dinâmica de preços.

### Retornos e fatores
- **Cao, Zhai, Luo** — *Anatomy of cryptocurrency perpetual futures returns*: Dois fatores — basis e price-volume — explicam 48+ estratégias estatisticamente significativas no cross-section de perpetuals.

### Estrutura cross-venue
- **Zhivkov** — *The Two-Tiered Structure of Cryptocurrency Funding Rate Markets* (2026): CEX dominam price discovery (61% mais integração que DEX). Todo fluxo de informação relevante corre CEX→DEX. 17% das observações têm spreads ≥ 20bps, mas só 40% geram retorno positivo após custos.

---

## 3. Premissas do modelo

### 3.1 Decomposição do funding rate

O funding rate observado é decomposto em cinco componentes:

```
funding_observado = r_base + r_carry + r_sentiment − r_friction − r_risk
```

| Componente | Descrição | Sinal |
|---|---|---|
| **r_base** | Taxa de referência neutra (lending rate DeFi) | + |
| **r_carry** | Prêmio estrutural de convenience yield | + |
| **r_sentiment** | Desequilíbrio de posicionamento de curto prazo | + / − |
| **r_friction** | Custos de execução (fees, spread, margem) | − |
| **r_risk** | Prêmio de risco exigido (IV, crash risk, counterparty) | − |

O **carry líquido capturável** = soma algébrica dos cinco componentes.

### 3.2 Estimação de cada componente

**r_base**
```
r_base = lending_rate_usdc_apy
```
Fonte: AAVE v3, Compound. É o custo de oportunidade do capital — o funding precisa superar isso para haver carry real.

**r_carry**
```
r_carry = basis_anualizado − r_base − custody_discount
```
Onde `basis_anualizado = (futuro/spot − 1) × (365×24h / período_funding_h) × 100`. O `custody_discount` captura fricções de deter spot (seguro, risco de exchange, complexidade).

**r_sentiment**
```
r_sentiment = (ls_ratio − 1) × α + (taker_ratio − 0.5) × β + oi_change_pct × γ
```
Coeficientes (α=8, β=12, γ=0.3) calibrados empiricamente. Sentiment muito alto é sinal de alerta — o carry próximo de reversão, não oportunidade.

**r_friction**
```
r_friction = (fee_spot + fee_perp + spread_bps/100 × 2) × n_giros × 2 × 100 + margem_custo
```
Inclui: taker fees nos dois mercados (spot + perp), spread bid-ask cruzado nos dois lados por giro, e custo de oportunidade do capital de margem imobilizado.

**r_risk**
```
r_risk = iv_30d × 0.08 + max(risk_reversal_25d, 0) × 0.5 + max(oi_concentration − 50, 0) / 100 × 3
```
Proxy que combina: custo implícito de hedge via options (IV), skew de downside (risk reversal negativo sinaliza crash risk elevado), e concentração de OI como proxy de risco de unwind coordenado.

### 3.3 Lógica de sinal

O sistema opera quatro estados:

| Estado | Condição | Ação |
|---|---|---|
| **OPEN** | carry_liq ≥ open_threshold AND r_sentiment ≤ sent_max | Long spot + short perp |
| **WAIT** | carry_liq ≥ open_threshold BUT r_sentiment > sent_max | Aguardar normalização |
| **HOLD** | close_threshold ≤ carry_liq < open_threshold | Manter posição existente |
| **CLOSE** | carry_liq < close_threshold | Encerrar posição |

A histéresis (open_threshold > close_threshold) evita overtrading por ruído.

### 3.4 Premissas de mercado

- **Venues iniciais**: Binance e Gate.io (CEX)
- **Ativos**: BTC, ETH (MVP); expansão para SOL, BNB, XRP (Fase 2)
- **Janela de funding**: 8 horas (padrão Binance/Gate)
- **Tipo de contrato**: USDT-margined (linear) — elimina convexidade do coin-margined
- **Execução**: cash-and-carry delta-neutro (long spot + short perp)
- **Sem alavancagem adicional** nas posições de arbitragem — a alavancagem embutida no carry é suficiente

---

## 4. Arquitetura de dados

### 4.1 Camada 1 — Data Mesh (dados crus)

Schema canônico: `venue × symbol × timestamp`  
Imutável, particionado, sem transformações.

| Bloco | Campos principais |
|---|---|
| Funding & basis | funding_rate, mark_price, index_price, next_funding_time, predicted_rate |
| Order book & liquidações | L2 snapshot (bid/ask/qty), liquidation events, open interest, insurance fund |
| Trades & volume | tick-by-tick trades, taker buy/sell vol 8h, OHLCV (1m/5m/1h/8h/1d), long/short ratio |
| On-chain | staking yield, supply circulante, gas fees, whale flows, DeFi TVL |
| Options & sentiment | IV surface, 25d risk reversal, put/call ratio, fear & greed |
| Macro & cross-asset | DeFi lending rates, DXY, treasuries, stablecoin supply, VIX |

### 4.2 Pipeline de normalização

Entre o mesh e o lake: alinhamento temporal, schema canônico por asset, deduplicação e validação de qualidade.

### 4.3 Camada 2 — Data Lake (features tratadas)

| Bloco | Features |
|---|---|
| Funding dynamics | funding_rate_8h normalizado, rolling mean/std (1d/7d/30d), basis anualizado, z-score cross-venue, regime label, carry vs lending spread |
| Market pressure | OI change Δ%, OI × funding (pressão líquida), liquidation heatmap, taker ratio, depth imbalance, momentum (1h/4h/24h) |
| Limits to arbitrage | margin rate, cross-venue basis spread, CEX−DEX funding spread, insurance fund Δ, crash risk proxy, arb capital proxy |
| On-chain signals | staking yield vs funding spread, DeFi vs CeFi rate Δ, whale net flow 7d, supply shock ratio |
| Convenience yield | retail attention proxy, long/short ratio small vs inst., IV-implied carry adj., stablecoin dominance |
| Macro factors | USD rate differential, risk-on/off regime, BTC dominance, stablecoin supply growth, ETF flow proxy |

---

## 5. Roadmap por fases

### Fase 1 — MVP: monitor de funding e carry bruto
**Prazo estimado**: 2–3 semanas  
**Fontes**: Binance + Gate.io · REST polling · BTC e ETH

**Escopo de dados**: funding_rate (8h), mark_price, index_price, basis bruto, OHLCV 1h

**Arquitetura**:
```
Binance REST + Gate.io REST → script Python (cron 8h) → Parquet local/S3 → notebook/dashboard simples
```

**Componentes calculados**: funding observado (% a.a.), basis anualizado, r_friction simplificado (fee fixo × giros), r_base via AAVE API, carry bruto = funding − r_friction

**Valor entregue**: Visibilidade em tempo quase-real do carry bruto e diferencial de funding entre as duas venues. Primeiros dados históricos acumulando. Decisão manual de arbitragem baseada no carry líquido simplificado.

**Critérios de saída**:
- 30 dias de histórico coletado sem gaps
- Carry bruto validado contra referência manual
- Pelo menos 1 oportunidade identificada e documentada
- Fee schedules reais de cada venue mapeados

---

### Fase 2 — Data pipeline + decomposição completa
**Prazo estimado**: 4–6 semanas  
**Fontes**: Binance + Gate.io · WebSocket + REST · 5 ativos (BTC, ETH, SOL, BNB, XRP)

**Escopo incremental**: OI por contrato, taker buy/sell volume, long/short ratio, liquidation events, bid-ask spread snapshot

**Arquitetura**:
```
WebSocket streams → ingestor normalizado → Data Mesh (raw Parquet · S3)
→ job de transformação (dbt/Polars) → Data Lake (features · S3) → dashboard
```

**Componentes calculados**: todos os 5 (r_base, r_carry, r_sentiment, r_friction completo, r_risk proxy via OI concentração + spread)

**Valor entregue**: Decomposição completa com série histórica. Sinal de open/close automático com thresholds configuráveis. Primeiros backtests estáticos. Comparação de carry líquido cross-venue e cross-asset.

**Critérios de saída**:
- Pipeline rodando sem intervenção manual
- Todos os 5 componentes calculados e versionados
- Backtest simples com Sharpe ratio documentado
- r_risk proxy validado contra eventos históricos

---

### Fase 3 — Modelo preditivo + backtesting estruturado
**Prazo estimado**: 6–8 semanas  
**Fontes adicionais**: Deribit (IV + risk reversal), stablecoin lending rates, on-chain gas

**Escopo incremental**: IV surface (Deribit), 25d risk reversal, predicted funding rate, funding rolling stats (7d/30d)

**Arquitetura**:
```
Data Lake (fase 2) → feature store (rolling + lags)
→ modelo de forecasting (XGBoost/ARIMA) → engine de backtest → relatório de performance
```

**Capacidades novas**: forecasting de funding (t+1, t+3 períodos), r_risk via IV e risk reversal, backtest walk-forward com custos reais, otimização de thresholds open/close, detecção de regime (bull/bear/sideways)

**Valor entregue**: Modelo que prevê se o carry líquido estará acima do threshold nas próximas 1–3 janelas. Backtest estruturado com Sharpe, max drawdown e hit rate. Base quantitativa para sizing e timing.

**Critérios de saída**:
- Modelo com Sharpe out-of-sample > 1.0
- Backtest com pelo menos 6 meses de dados
- Pipeline de retreino documentado
- Análise de regime validada

---

### Fase 4 — Execução semi-automática + expansão de venues
**Prazo estimado**: 8–12 semanas  
**Fontes adicionais**: HyperLiquid (DEX perps), CME futures, dados macro (DXY, VIX)

**Escopo incremental**: L2 order book (profundidade real), trades tick-by-tick, DEX perps, CME basis cross-venue, macro factors

**Arquitetura**:
```
modelo fase 3 → gerador de ordens → risk manager (sizing + stop)
→ executor (API Binance/Gate) → monitor de P&L em tempo real
```

**Capacidades novas**: execução semi-automática com aprovação humana, sizing dinâmico por carry e volatilidade, arb cross-venue (CEX ↔ DEX), r_risk completo, alertas de margin call preventivos, relatório P&L realizado vs backtest

**Valor entregue**: Sistema completo de sinal + execução guiada com gestão de risco integrada. Capacidade de operar arb cross-venue. Feedback loop entre P&L realizado e recalibração do modelo.

---

## 6. Princípios de design do sistema

1. **Schema-first**: o schema canônico `venue × symbol × timestamp` é definido na Fase 1 e nunca quebrado nas fases seguintes.
2. **Dados crus são imutáveis**: o data mesh nunca é modificado retroativamente — correções entram como novas versões no data lake.
3. **Complexidade incremental**: cada fase adiciona capacidade sem invalidar a anterior. O MVP da Fase 1 continua rodando na Fase 4.
4. **Humano no loop**: a execução automatizada (Fase 4) mantém aprovação humana para eventos acima de threshold de risco — não é uma limitação temporária, é uma feature de gestão de risco.
5. **Simplicidade do modelo**: dois fatores (basis + price-volume) explicam a maioria dos retornos — complexidade adicional de modelo antes de dados limpos é antipadrão.
6. **r_friction é custo real**: todo backtest usa custos de execução reais (taker fee, spread, margin cost) — resultados sem fricção não são válidos para decisão.

---

## 7. O que não está no escopo (intencionalmente)

- **Market making ou execução HFT**: o projeto é de carry/arbitragem posicional, não de liquidez
- **Modelos de ML profundos (LSTMs, transformers)**: a literatura indica que o ganho marginal não justifica a complexidade antes de ter dados limpos e backtest robusto
- **DEX spot** (Uniswap, Curve): funding rate é um fenômeno de derivativos; DEX spot tem dinâmica diferente
- **Previsão de preço spot**: o modelo prevê carry líquido, não direção de preço

---

*Documento gerado a partir das discussões de design do projeto · Abril 2026*
