# Como operar: descrição analítica da estratégia

> Documento didático de operação. Descreve passo-a-passo o que o sistema faz, do dado bruto à decisão de abrir posição, com exemplos numéricos concretos. Leitor-alvo: comitê de investimento, mesa de risco e qualquer interlocutor que precise entender *o que efetivamente acontece* na estratégia.
>
> Este documento é complementar ao ensaio crítico sobre o modelo. Toda a notação usada aqui é coerente com a reformulação proposta naquele ensaio (carry relativo, decomposição em sete componentes, máquina de estados simétrica).

---

## 1. Em uma frase

O sistema identifica, em janelas de 8 horas, se o custo de manter exposição a BTC (ou outro ativo líquido) via perpetual é materialmente diferente do custo de manter a mesma exposição via veículo alternativo (spot financiado ou futuro CME), e abre posição delta-neutra para capturar o diferencial quando o retorno esperado justifica os custos, os riscos de contraparte e a probabilidade de reversão antecipada.

---

## 2. O ciclo operacional completo

A cada janela de funding (8 horas, nas referências UTC 00:00, 08:00, 16:00), o sistema executa o mesmo ciclo de oito passos. Abaixo, cada passo é descrito analiticamente e, em seguida, ilustrado com um exemplo numérico concreto usando BTC.

### Passo 1 — Coleta dos observáveis de mercado

Para cada par `(venue, símbolo)` sob monitoramento, o sistema coleta:

- `funding_rate` da próxima janela (valor "predicted" publicado pela venue)
- `mark_price` atual e `index_price` atual
- `basis` = (mark_price − index_price) / index_price
- `open_interest` do contrato
- `ls_ratio` (long/short), `taker_buy_ratio`, volume 8h
- Profundidade de book nos primeiros níveis (para estimar slippage)
- IV implícita 30d (quando disponível via Deribit) e 25d risk reversal

Paralelamente, coleta dados de referência interna:
- Custo de funding interno do banco em USD para o horizonte relevante
- Taxa CME nearest futures e basis CME (para comparação cross-venue regulada)

**Exemplo numérico (hipotético, BTC em Binance, janela UTC 08:00):**
- `funding_rate` predicted = +0,015% (por janela de 8h) = +16,4% anualizado
- `mark_price` = 102.450 USD, `index_price` = 102.380 USD, `basis` = +0,068%
- `open_interest` = USD 8,2 bilhões
- `ls_ratio` = 1,4; `taker_buy_ratio` = 0,56
- IV 30d = 48%; risk reversal 25d = −1,8
- Custo funding interno do banco (USD, 90d) = SOFR + 50bps ≈ 5,1% a.a.

### Passo 2 — Cálculo do r_funding (retorno bruto do perp como veículo)

```
r_funding = funding_rate_periódico × (24 / horas_janela) × 365 × 100
```

Esse é o retorno anualizado que uma posição *short perp* capturaria (se `r_funding` > 0, short perp recebe) ou que uma posição *long perp* pagaria (em módulo). O sinal preserva a direção.

**Exemplo**: `r_funding` = 0,015% × 3 × 365 = **16,4% a.a.**

### Passo 3 — Cálculo do carry relativo

```
carry_relativo = r_funding − r_base
```

onde `r_base` é o custo de financiamento alternativo (do banco) para uma posição equivalente. O `carry_relativo` é o prêmio bruto (antes de custos e riscos) que a estratégia pode capturar.

**Exemplo**: `carry_relativo_bruto` = 16,4% − 5,1% = **+11,3% a.a.**

Interpretação: um short perp pagaria ao banco o equivalente a 16,4% a.a. em funding recebido, enquanto o custo de financiar a posição spot oposta (long spot) é de 5,1% a.a. O prêmio bruto da arbitragem é 11,3% a.a.

### Passo 4 — Cálculo dos custos de fricção

```
r_friction = (fee_spot + fee_perp + spread_bps/100 × 2) × n_giros_esperados × 2 × 100 + margin_cost
```

Três componentes:

- **Fees diretos**: taker fee no spot + taker fee no perp, duas vezes (abrir e fechar). Tipicamente 4–8 bps por perna em Binance tier institucional.
- **Spread cruzado**: a posição paga metade do spread ao entrar e metade ao sair, em ambos os mercados. Estimativa conservadora 2–5 bps por cruzamento de book, dependendo do nível de agressividade da execução.
- **Margin cost**: custo de oportunidade do capital imobilizado como margem no perp (a margem fica na exchange, não rende ao banco).

O `n_giros_esperados` é estimado pelo modelo de Ornstein-Uhlenbeck do `carry_relativo` (ver seção 5).

**Exemplo numérico (parâmetros conservadores, operação BTC, `n_giros_esperados` = 4/ano)**:
- Fee spot taker Binance institucional: 4 bps
- Fee perp taker Binance institucional: 3 bps
- Spread cruzado efetivo: 3 bps por cruzamento × 2 cruzamentos = 6 bps
- Custo por giro redondo: (4 + 3 + 6) × 2 = 26 bps = 0,26%
- `r_friction_transacional` = 0,26% × 4 giros/ano = 1,04% a.a.
- Margem imobilizada: 25% do notional × 5,1% a.a. custo interno = 1,28% a.a. sobre notional
- **`r_friction` total ≈ 2,3% a.a.**

### Passo 5 — Cálculo do r_counterparty

No MVP, haircut determinístico por tier de venue:

```
r_counterparty = exposição_na_venue × PD_anual × LGD
```

**Exemplo (Binance, tier 1)**:
- PD anual estimada: 1%
- LGD histórica: 60%
- Exposição máxima permitida por policy: 40% do capital total
- `r_counterparty` = 1 × 1% × 60% = **0,6% a.a.** por unidade de exposição

Esse é o haircut que se aplica ao carry esperado como desconto pelo risco de default da venue. Na Fase 2–3, este componente evolui para um proxy contínuo de stress, mas no MVP a versão determinística é suficiente e defensável em comitê.

### Passo 6 — Cálculo do r_reversal

```
r_reversal = P(reversão_antes_da_janela) × custo_esperado_exit_forçado
```

Este é o componente crítico descoberto na literatura (Zhivkov 2026a): nas simulações delta-neutras do autor, 95% das oportunidades resultam em saída forçada antes da maturação completa. No MVP, antes de ter estatística própria, usa-se estimativa conservadora baseada no paper:

**Exemplo**:
- P(reversão antes da janela) ≈ 25% (calibrado no MVP a partir dos primeiros 30 dias; ajusta-se com dados próprios)
- Custo esperado de exit forçado: slippage de saída emergencial (≈ 10 bps) + funding não recebido (estimativa de metade da janela, 0,0075%)
- `custo_exit_forçado` ≈ 10 + 7,5 = 17,5 bps por ocorrência
- `r_reversal` = 25% × 17,5 bps × n_oportunidades_por_ano. Para um ativo com ~40 oportunidades/ano, isso dá ~1,75% a.a. de desconto.

### Passo 7 — Cálculo do r_risk_mkt e r_sentiment como flag

```
r_risk_mkt = iv_30d × 0,08 + max(risk_reversal_25d_negativo, 0) × 0,5 + max(oi_concentration − 50, 0)/100 × 3
```

O `r_sentiment` não é mais um componente aditivo (como no modelo original) — é tratado como **flag de WAIT**. Se `ls_ratio` ou `taker_buy_ratio` indicarem posicionamento extremo, o sistema não abre posição mesmo que o carry seja atraente, porque posicionamento extremo é preditor de reversão iminente.

**Exemplo**:
- IV 30d = 48% → contribuição: 48 × 0,08 = 3,84% a.a.
- Risk reversal = −1,8 (downside mais caro que upside) → contribuição: 1,8 × 0,5 = 0,9% a.a.
- OI concentration ~45% → sem contribuição (abaixo do threshold de 50%)
- `r_risk_mkt` ≈ **4,7% a.a.**

- `ls_ratio` = 1,4 → dentro de faixa normal (não dispara flag)
- `taker_buy_ratio` = 0,56 → ligeiramente acima de neutro, mas longe de extremo (threshold sugerido: 0,65)
- Decisão: **sem flag WAIT**

### Passo 8 — Cálculo do carry relativo líquido e decisão

```
carry_líquido = carry_relativo_bruto − r_friction − r_counterparty − r_reversal − r_risk_mkt
```

**Exemplo consolidado**:

```
carry_líquido = 11,3% − 2,3% − 0,6% − 1,75% − 4,7%
carry_líquido = +1,95% a.a.
```

Com `open_threshold` = 2% a.a. (calibrado pela regra 1,5× r_friction_por_giro, ajustado para a escala anualizada), a decisão é **WAIT** — o carry líquido está positivo mas abaixo do threshold de abertura. O sistema aguarda próxima janela.

Se o `carry_líquido` tivesse ficado, por exemplo, em 3,5% a.a. (carry bruto mais alto, mercado menos volátil), a decisão seria **OPEN**: abrir long spot + short perp em Binance, com sizing conforme seção 4.

---

## 3. A máquina de estados em detalhe

O sistema opera quatro estados por ativo:

| Estado | Condição | Ação |
|---|---|---|
| **OPEN** | `|carry_líquido|` ≥ `open_threshold` E nenhum flag WAIT ativo | Abrir posição na direção de `carry_líquido` |
| **WAIT** | `|carry_líquido|` ≥ `open_threshold` MAS flag WAIT ativo | Não abrir; reavaliar próxima janela |
| **HOLD** | `close_threshold` ≤ `|carry_líquido|` < `open_threshold` E posição aberta | Manter posição |
| **CLOSE** | `|carry_líquido|` < `close_threshold` OU flag de stress disparada | Encerrar posição |

**Direção da operação** (só aplica no OPEN):
- `carry_líquido > 0`: long spot + short perp (cash-and-carry clássico)
- `carry_líquido < 0`: short spot + long perp (carry reverso) — sujeito a disponibilidade de short no spot; alternativamente, usar CME como perna oposta

**Flags que disparam WAIT ou CLOSE**:
- Posicionamento extremo: `ls_ratio` > 2 ou < 0,5; `taker_buy_ratio` > 0,65 ou < 0,35
- Stress de venue: stress score > 70 (Fase 2+); saída anormal de stablecoins
- Concentração excessiva de OI: > 60% (proxy de unwind coordenado iminente)
- Macro stress: VIX > 30 e risk reversal < −4 simultâneos (Fase 3+)

**Histéresis**: `open_threshold` é estritamente maior que `close_threshold`. No MVP, sugestão inicial:
- `open_threshold` = 1,5 × r_friction_por_giro anualizado
- `close_threshold` = 0,5 × r_friction_por_giro anualizado

Isso evita entrada e saída por ruído em torno de um único threshold.

---

## 4. Sizing — como alocar os USD 25M de margem

Com capital de margem total de USD 25M e alavancagem máxima de 3× por posição, o notional agregado máximo é USD 75M. A alocação segue três regras hierárquicas:

**Regra 1 — Limite por venue**: no máximo 40% do capital total (USD 10M de margem) em uma única exchange. Com duas venues operadas (Binance + Gate.io), a distribuição natural é 40%/40%, com 20% de buffer não alocado como reserva de liquidez.

**Regra 2 — Limite por ativo**: o notional por ativo não pode exceder 1–2% do Open Interest do contrato naquela venue. Em BTC e ETH na Binance, isso é sempre absorvível (OI na casa de bilhões). Em SOL/BNB/XRP, o teto se torna efetivo em momentos de baixa liquidez.

**Regra 3 — Distribuição entre oportunidades ativas**: equal-weight entre os ativos que estão em estado OPEN. Se 4 ativos estão em OPEN e 1 está em HOLD, a margem disponível é dividida em 4 partes iguais entre os que estão em OPEN (os que estão em HOLD já consumiram sua parcela anterior).

**Exemplo numérico de alocação em regime normal**:

Suponha que em uma janela de funding, o sistema identifique:
- BTC Binance: OPEN, carry líquido +3,5% a.a.
- ETH Binance: OPEN, carry líquido +2,8% a.a.
- SOL Binance: WAIT (ls_ratio extremo)
- BNB Gate.io: OPEN, carry líquido +4,1% a.a.

Margem disponível total: USD 25M. Aloca USD 10M em Binance e USD 10M em Gate.io (buffer de USD 5M). Em Binance, 2 ativos em OPEN → USD 5M em BTC e USD 5M em ETH. Em Gate.io, 1 ativo em OPEN → USD 10M em BNB.

Com alavancagem 3×, o notional resultante:
- BTC Binance: USD 15M notional em long spot, USD 15M em short perp
- ETH Binance: USD 15M long spot + USD 15M short perp
- BNB Gate.io: USD 30M long spot + USD 30M short perp

Antes de executar, o sistema verifica a Regra 2: o notional de BNB em Gate.io é USD 30M; o OI do contrato BNB perp em Gate.io precisa ser ≥ USD 1,5B–3B para não violar o limite de 1–2%. Se for menor, o notional é limitado proporcionalmente.

---

## 5. O modelo de giros — como o sistema estima quantas vezes vai entrar e sair

O número de giros por ano é função direta da volatilidade do `carry_relativo` e da distância entre thresholds. Matematicamente, se modelamos `carry_relativo(t)` como processo de Ornstein-Uhlenbeck:

```
d(carry) = θ(μ − carry)dt + σ·dW
```

onde θ é a velocidade de reversão à média, μ é a média de longo prazo e σ é a volatilidade, então o número esperado de cruzamentos de um nível por unidade de tempo tem fórmula fechada.

**Na prática**, o sistema não calcula isso analiticamente. Ele:
1. Estima (θ, μ, σ) empiricamente a partir do histórico de `carry_relativo` por ativo
2. Simula Monte Carlo sob diferentes escolhas de (open_threshold, close_threshold)
3. Conta os giros esperados em cada configuração
4. Otimiza a escolha de thresholds maximizando E[P&L]

**Regra prática para o MVP** (antes de ter dados suficientes):
- Assume `n_giros_esperados` = 4–6 por ano por ativo em BTC/ETH (ativos com carry mais persistente)
- Assume `n_giros_esperados` = 8–12 por ano em SOL/BNB/XRP (ativos com carry mais volátil)
- Revisa a estimativa mensalmente com dados coletados

**Métrica de calibração em produção**: `giros_reais / giros_esperados_modelo`. Se estiver consistentemente acima de 1, os thresholds estão apertados demais; se abaixo de 1, estão folgados demais (ou o modelo OU está subestimando θ).

---

## 6. O que acontece entre janelas de funding

Nem toda a ação do sistema ocorre no instante da janela. Entre janelas (nas ~7h59m entre funding events), o sistema continua:

- **Monitorando spread em tempo real**: se o spread entre funding observado e funding predicted diverge materialmente, o sistema recalcula o `carry_líquido` antecipado e pode disparar CLOSE antes do fim da janela.
- **Verificando flags de stress de venue**: se o stress score da venue salta acima do threshold (saída brusca de stablecoins, spread do token nativo, etc.), o sistema dispara CLOSE defensivo mesmo com o carry ainda positivo.
- **Monitorando margem**: se o movimento de preço do ativo aproxima a posição do nível de margem de manutenção, o sistema alerta o humano no loop (e, na Fase 4, pode adicionar margem automaticamente dentro de limites pré-aprovados).
- **Atualizando estimativas de `r_reversal`**: cada evento de reversão observado entra na base para recalibrar P(reversão) por ativo.

---

## 7. Exemplo de dia completo de operação

Para tornar concreto: um dia típico na Fase 2 do projeto, operando BTC e ETH em Binance e Gate.io.

**UTC 08:00 — Janela de funding**. Sistema coleta dados, calcula carry líquido:
- BTC Binance: +2,8% a.a. → abre 1,5× HOLD threshold; como estava em NONE, vai para OPEN. Aloca USD 5M de margem, abre long 15M BTC spot + short 15M BTC perp.
- ETH Binance: +1,2% a.a. → abaixo de open_threshold. Permanece em NONE.
- BTC Gate.io: +2,1% a.a. → acima de open_threshold. Abre long 15M BTC spot + short 15M BTC perp em Gate.io.
- ETH Gate.io: +3,1% a.a. → acima de threshold, mas `ls_ratio` = 2,3 (extremo). Flag WAIT.

**UTC 10:30 — Monitoramento intra-janela**. Sistema observa que BTC subiu 2,5%, spread BTC perp/spot se ampliou momentaneamente. Posição BTC está neutra em termos de preço (long spot + short perp), então P&L de preço é ≈ 0. O carry continua acruando.

**UTC 14:00 — Atualização de flags**. `ls_ratio` ETH em Gate.io caiu para 1,6 (normalização). Flag WAIT é removida. Mas como ainda não é janela de funding, sistema aguarda UTC 16:00 para reavaliar.

**UTC 16:00 — Janela de funding**.
- BTC Binance: carry líquido caiu para 1,6% a.a. (funding predicted menor para próxima janela). Ainda acima de `close_threshold` (0,8%). **HOLD**.
- BTC Gate.io: carry caiu para 1,3% a.a. **HOLD**.
- ETH Gate.io: carry em 2,8% a.a., sem flag. **OPEN**. Aloca USD 10M (único em OPEN em Gate.io agora).

**UTC 18:30 — Stress alert**. Stablecoin supply em Gate.io cai 8% em 4 horas (sinal anormal). Stress score salta para 75. Sistema dispara CLOSE defensivo em todas as posições Gate.io. Margem retorna, posições BTC e ETH em Gate.io encerradas. Notifica operador humano.

**UTC 00:00 do dia seguinte — Janela de funding**. Reavaliação completa. Sistema só considera oportunidades em Binance enquanto stress em Gate.io persistir acima do threshold.

---

## 8. O que o operador humano faz

Na Fase 1–2, o humano faz tudo: vê o dashboard, verifica as oportunidades identificadas e executa manualmente as ordens. O sistema é um gerador de sinais, não um executor.

Na Fase 3, o humano valida periodicamente o modelo (recalibração mensal de parâmetros, análise de divergências entre P&L realizado e esperado) e toma decisões de expansão de escopo (novos ativos, revisão de thresholds).

Na Fase 4, o humano aprova ordens uma-a-uma em interface dedicada. O sistema propõe a ordem completa (ativo, venue, sizing, direção); o humano verifica e clica em "aprovar". O executor roda, e o P&L é rastreado. Para eventos de stress ou sinais contra-intuitivos, o humano pode recusar a ordem ou ajustar manualmente.

Este "humano no loop" não é uma limitação que se pretende remover. É uma *feature arquitetural* em estratégia com risco de liquidação e exposição a contraparte — a aprovação humana é a última barreira contra erro do modelo, mudança de regime não detectada ou sinais contraditórios que escapam à lógica automática.

---

## 9. Checklist de verificação antes de cada abertura de posição

Antes de o sistema (ou o humano) abrir uma nova posição, este checklist precisa passar:

1. `|carry_líquido|` ≥ `open_threshold` para o ativo-venue
2. Nenhum flag de WAIT ativo (posicionamento, sentimento, concentração)
3. Stress score da venue < 70
4. Liquidez suficiente: notional planejado ≤ 1–2% do OI do contrato
5. Exposição total na venue após a abertura ≤ 40% do capital total
6. Margem de manutenção com buffer de ≥ 50% em relação à margem inicial
7. `r_counterparty` atualizado e dentro do policy
8. `r_reversal` com dados de pelo menos 30 dias (Fase 1), 90 dias (Fase 2+)
9. Horário fora de janela de anúncio macro conhecido (FOMC, NFP) — Fase 3+
10. Se `carry_líquido` < 0 (operação na direção reversa), disponibilidade confirmada de short no spot OU perna CME disponível

Se qualquer item falhar, o sistema não abre a posição. Transparência do checklist é parte da auditabilidade do sistema.

---

*Abril 2026 — documento operacional complementar ao ensaio crítico do modelo.*
