# Ensaio crítico: limites do modelo proposto e caminhos de reformulação

> Análise crítica do documento *Projeto: Sistema de Modelagem e Arbitragem de Funding Rate em Crypto Perpetuals* à luz de lacunas identificadas, contribuições do autor e descobertas bibliográficas complementares (Zhivkov 2026a, 2026b).
>
> O foco deste ensaio é o **modelo** — sua formulação matemática, suas premissas operacionais e sua validade metodológica. A seção final traduz as conclusões em ajustes de planejamento das fases.

---

## 1. Natureza da crítica

O documento original tem mérito estrutural relevante: a decomposição em cinco componentes, a arquitetura de dados em duas camadas e o roadmap incremental são coerentes. A crítica aqui é fundamentalmente construtiva — o modelo está *subespecificado* em dimensões operacionais críticas, e algumas de suas premissas não sobrevivem a um exame rigoroso da literatura recente ou do contexto institucional em que ele será operado (tesouraria de banco, sem acesso a DeFi, com USD 25M de margem).

O diagnóstico se divide em seis eixos:

1. A variável de decisão está mal definida (carry líquido vs. carry relativo)
2. O modelo ignora sistematicamente o regime de funding negativo e a dimensão de veículos alternativos
3. Dois componentes de risco estão ausentes: contraparte e reversão antecipada
4. O design do backtest, como especificado, está vulnerável a overestimation de performance
5. Os parâmetros do sinal de sentimento carecem de justificativa
6. O sizing e o modelo de giros não são tratados como variáveis endógenas

Cada eixo é desenvolvido abaixo, seguido por propostas concretas de reformulação.

---

## 2. Crítica ao modelo: seis eixos

### 2.1 A variável de decisão errada: carry líquido vs. carry relativo

O documento define `carry_líquido = r_base + r_carry + r_sentiment − r_friction − r_risk` e opera toda a máquina de estados (OPEN/WAIT/HOLD/CLOSE) sobre essa grandeza. Isso pressupõe implicitamente que a decisão é *fazer cash-and-carry (long spot + short perp)* quando o carry é suficientemente positivo, e *não operar* caso contrário. A especificação ignora dois fatos centrais:

**Primeiro**, o funding rate pode ser estruturalmente negativo em regimes baixistas — e, nesses regimes, a simetria da estratégia implica que a operação inversa (short spot + long perp) seria economicamente equivalente, apenas com sinal trocado. O documento atual não contempla essa direção.

**Segundo, e mais importante**, o objeto econômico que importa não é o sinal do funding em si, mas o *diferencial entre o custo de financiamento de exposição via perp e o custo de financiamento via veículos alternativos*. Para um banco, que tem acesso a funding próprio barato e a futuros regulados (CME), a pergunta operacional não é "o carry está positivo?". É: "o perp está oferecendo uma exposição long ou short a um custo menor (ou um prêmio maior) do que o veículo alternativo disponível?".

Essa redefinição muda a estratégia de uma posição estática (cash-and-carry clássico) para uma política de escolha de veículo sob três casos possíveis:

- **Caso A** — Funding positivo suficientemente alto: long spot + short perp (cash-and-carry clássico, cobrando o prêmio)
- **Caso B** — Funding negativo ou muito baixo, exposição long desejada: long perp como veículo preferencial (pagando funding abaixo do custo alternativo de financiamento spot)
- **Caso C** — Cash-and-carry com CME: long perp + short CME futures, capturando o diferencial entre funding recebido/pago e basis do futuro com vencimento fixo

A variável de decisão correta é, portanto:

```
carry_relativo = custo_financiamento_perp − custo_financiamento_alternativo
```

onde o custo alternativo é a taxa interna do banco (se a estratégia é delta-neutra via spot) ou o carry do futuro CME (se a estratégia usa o regulado como perna oposta). A máquina de estados OPEN/WAIT/HOLD/CLOSE permanece válida, mas os thresholds passam a ser simétricos em torno de zero, e o estado *qual perna operar* torna-se explícito na política.

### 2.2 A ausência do regime de funding negativo

Decorrente do ponto anterior, mas merece isolamento. A seção 3.3 do documento define os quatro estados apenas em termos de `carry_líq ≥ open_threshold`, implicitamente assumindo que o carry positivo é o caso de interesse. Um modelo robusto deve tratar simetricamente os dois regimes — e, mais importante, a transição entre eles. Momentos de inversão do sinal do funding (de positivo para negativo ou vice-versa) são precisamente os momentos de maior volatilidade e maior risco de reversão antecipada. Ignorá-los no desenho da máquina de estados não é simplificação válida; é lacuna de escopo.

A reformulação da seção 2.1 resolve isso parcialmente, mas é preciso ser explícito: o sinal opera sobre `|carry_relativo|`, e a direção da operação é determinada pelo signo. Thresholds são definidos em módulo.

### 2.3 Componentes de risco ausentes: contraparte e reversão

O documento decompõe o risco em apenas um componente (`r_risk`), que combina IV, risk reversal e concentração de OI. Essa formulação cobre razoavelmente o risco de movimento adverso do mercado (crash risk), mas omite dois riscos materiais para um banco operando em exchanges centralizadas.

**Risco de contraparte (r_counterparty)**. Em 2022, a falência da FTX zerou posições delta-neutras de dezenas de fundos que, operacionalmente, estavam "arbitrando funding rate com hedge perfeito". Do ponto de vista de P&L teórico, estavam neutros. Do ponto de vista realizado, perderam o colateral inteiro. Ignorar esse risco no modelo é equivalente a assumir que exchanges são default-free — premissa claramente violada pelos dados históricos.

Três abordagens, em ordem de complexidade:

- **Haircut determinístico**: `r_counterparty = exposição_exchange × PD_anual × LGD`, onde `PD_anual` é calibrado por tier (0,5–1% para Binance/Coinbase; 2–5% para venues de segundo tier) e `LGD` ≈ 50–70% com base em recoveries pós-falência observados (FTX, Celsius, BlockFi).
- **Proxy via mercado**: um *stress score* 0–100 construído a partir de fluxos líquidos de stablecoins saindo da exchange, spread do token nativo da venue vs. peers, desvio do funding da venue vs. mediana do mercado. Em condições normais, score baixo e haircut mínimo; em stress, score alto dispara derisking automático.
- **Policy de concentração**: limite hard de exposição por venue (sugestão conservadora para um banco: não mais que 40–50% do capital total em uma única exchange, com replicação em pelo menos duas venues do mesmo tier).

A recomendação é começar com haircut determinístico + policy de concentração no MVP e evoluir para o proxy de stress na Fase 2–3.

**Risco de reversão antecipada (r_reversal)**. Este é o achado mais material da revisão bibliográfica. Zhivkov (2026a) documenta, em dataset de 35,7 milhões de observações cobrindo 26 exchanges, que apenas 40% das oportunidades top geram retorno positivo após custos de transação e reversões de spread. O mecanismo econômico é limpo: posições de arbitragem são frequentemente forçadas a encerrar antes da janela de funding ser inteiramente capturada, porque o spread reverte antes do tempo suficiente de maturação. Nas simulações delta-neutras do autor, saídas forçadas ocorrem em 95% das oportunidades, e o sucesso exige tanto spreads altos quanto duração suficiente antes de reversões inevitáveis.

Isso não é um detalhe de execução. É uma característica estrutural do mercado que invalida modelos que assumem maturação automática da posição. O componente `r_reversal` precisa entrar explicitamente:

```
r_reversal = P(reversão_antes_da_janela) × custo_esperado_exit_forçado
```

onde `P(reversão)` é estimado empiricamente por ativo e regime, e `custo_esperado_exit_forçado` combina slippage de saída emergencial mais o funding *não recebido* pela janela incompleta. Um modelo que não incorpore esse termo sistematicamente superestima o retorno esperado e subestima a variância.

### 2.4 Fragilidade metodológica do backtest

O documento especifica, como critério de saída da Fase 3, "Sharpe ratio out-of-sample > 1.0" com "backtest walk-forward com custos reais". Na formulação atual, isso é insuficiente — e há literatura recente específica sobre o porquê.

Zhivkov (2026b) demonstra empiricamente que backtests de perpetuals crypto são frágeis quando ignoram fricções microestruturais e reutilizam janelas de avaliação durante a busca de parâmetros. Quatro elementos específicos precisam ser protocolo obrigatório do backtest, não opcional:

1. **Strict T+1 execution semantics**: decisões tomadas no timestamp `t` só podem ser executadas em `t+1`. Parece óbvio, mas a maioria dos backtests acadêmicos implicitamente assume execução instantânea no mesmo candle da decisão — o que é lookahead bias disfarçado.

2. **No-look-ahead funding alignment**: o funding rate pago/recebido em `t` é definido pelo regime de mercado em `t-1` (janela anterior). Alinhar funding com o timestamp de decisão é outra forma de lookahead. O paper é explícito: many strategies rely on manual, ad hoc parameter tuning, yielding configurations that appear profitable in-sample but fail to generalize to out-of-sample data or the unforgiving conditions of live markets.

3. **Two-stage double-screening**: a seleção de parâmetros não pode ser feita em uma única passada. Primeiro screen: janelas rolantes de validação holdout. Segundo screen: grid de sensibilidade a custos (fee, slippage, delay). Parâmetros que não sobrevivem aos dois screens são descartados.

4. **Cost-sensitivity grid**: o backtest precisa ser executado sob múltiplos cenários de custo (baseline, stress, pessimista). Zhivkov mostra que fee-only e zero-cost backtests podem materialmente superestimar retornos anualizados comparados a uma configuração completamente custeada.

Nada disso está especificado no documento atual. O critério "Sharpe > 1.0" é vazio sem o protocolo que o gera.

### 2.5 Parâmetros do r_sentiment sem justificativa

O modelo especifica:

```
r_sentiment = (ls_ratio − 1) × α + (taker_ratio − 0.5) × β + oi_change_pct × γ
```

com α=8, β=12, γ=0.3, e a nota "calibrados empiricamente". Isso é insuficiente para defesa em banca. As perguntas legítimas:

- Em qual universo de dados foi feita a calibração? Período, ativos, regimes?
- Qual o método? Regressão contra retorno realizado? Minimização de erro de sinal?
- Qual o intervalo de confiança em torno desses coeficientes?
- Como eles se comportam fora do período de treino?
- São constantes ou dependem do regime?

Sem resposta a essas perguntas, os três números parecem escolhidos a posteriori para produzir um sinal bonito no período histórico testado — precisamente o tipo de overfitting que o protocolo da seção 2.4 pretende capturar. A alternativa honesta é: ou (i) especificar o processo de calibração com rigor metodológico, ou (ii) reconhecer que o `r_sentiment` é um sinal exploratório da Fase 2 e que os coeficientes serão refinados na Fase 3 com protocolo proper.

### 2.6 Sizing e giros como variáveis ausentes

O documento é silencioso sobre duas dimensões operacionais que determinam o P&L realizado.

**Sizing**. Nenhuma menção a como alocar o capital entre oportunidades. Com o teto de USD 25M de margem informado pelo contexto da tesouraria, o problema passa de "quanto?" para "como distribuir?". Duas considerações não triviais:

- *Impacto de mercado*: USD 25M em margem com alavancagem conservadora de 3× implica notional agregado de ~USD 75M. Em BTC/ETH na Binance isso é absorvível. Em SOL/BNB/XRP, já começa a ser material em momentos de baixa liquidez. Uma convenção razoável: teto por ativo de 1–2% do Open Interest do contrato, para não mover o próprio funding rate (reflexividade — a posição empurra o funding para baixo e destrói o carry que pretende capturar).
- *Distribuição inicial*: equal-weight entre ativos elegíveis é o ponto de partida defensável. Risk-parity ponderado pela volatilidade do carry por ativo é a evolução natural uma vez que haja estatística suficiente (Fase 3).

**Giros**. O número de giros por unidade de tempo é função da volatilidade do `carry_relativo` relativa à distância entre thresholds. Modelando como processo de Ornstein-Uhlenbeck:

```
d(carry) = θ(μ − carry)dt + σ·dW
```

os parâmetros θ (velocidade de reversão), μ (média de longo prazo) e σ (volatilidade) podem ser estimados empiricamente por ativo. Com eles, o número esperado de cruzamentos de nível por unidade de tempo tem fórmula fechada (Rice formula), e o backtest pode simular cenários via Monte Carlo.

O insight operacional é que a *distância entre open_threshold e close_threshold* (a histéresis) é o knob principal de controle de giros. Isso transforma a escolha de thresholds em problema de otimização:

```
maximizar: E[P&L] = E[carry_capturado] − n_giros × r_friction_por_giro − P(reversão) × custo_reversão
sujeito a: thresholds parametrizam a política
```

Essa é a otimização que precisa ser feita na Fase 3 — e que, sem o modelo de giros explicitado, não pode ser feita de forma rigorosa.

Uma regra prática defensável para o MVP, antes de ter dados para a otimização formal:

- `open_threshold` = 1,5 × `r_friction_por_giro` anualizado (carry precisa cobrir 1,5 giros redondos com folga)
- `close_threshold` = 0,5 × `r_friction_por_giro` anualizado

A razão 3:1 entre open e close dá histéresis suficiente para filtrar ruído, e é calibrada pelo custo econômico real, não por intuição.

---

## 3. Críticas adicionais de contexto institucional

Duas observações transversais ao modelo, decorrentes do contexto bancário:

**Sem acesso a DeFi**. Toda a camada de "DeFi lending rates" e "on-chain signals" da seção 4.3 precisa ser substituída. O `r_base` não pode ser taxa de AAVE/Compound — precisa ser o custo interno de funding do banco em USD (OIS/SOFR + spread interno) ou um proxy de mercado tradicional equivalente. Isso *simplifica* o modelo e o torna mais defensável em comitê de risco — o benchmark passa a ser uma taxa que o próprio banco já usa em outras estratégias.

**Capital abundante e barato como vantagem estrutural**. Schmeling, Schrimpf e Todorov (2023) e Christin et al. argumentam que o carry crypto persiste precisamente porque *arbitrageurs têm capital escasso e caro*. Um banco com capital abundante e funding interno barato é o tipo de player que estruturalmente deveria capturar esse prêmio. A tese operacional, então, não é "ganhar dinheiro com funding rate". É: **capturar o prêmio estrutural de convenience yield nas venues CEX top-tier acessíveis, com vantagem de custo de capital sobre os arbitrageurs marginais do mercado, evitando as venues proibidas (DEX, segundo tier) onde o prêmio pode ser maior mas o risco operacional, de contraparte e regulatório também é**. Essa tese é defensável em comitê e coerente com a estrutura de dois tiers documentada por Zhivkov (2026a): começar apenas em CEX top-tier é alinhado com a segmentação natural do mercado, não uma limitação temporária.

---

## 4. Síntese do modelo reformulado

Consolidando as seções anteriores, o modelo reformulado tem a seguinte estrutura:

**Variável de decisão**:

```
carry_relativo = (funding_recebido ou pago) − custo_financiamento_alternativo
```

**Decomposição**:

```
carry_relativo = r_funding − r_base − r_friction − r_counterparty − r_reversal − r_risk_mkt + r_sentiment_ajuste
```

onde:

| Componente | Significado | Novo / Revisto |
|---|---|---|
| `r_funding` | Funding rate anualizado observado (sinal preserva direção) | Revisto (era r_carry) |
| `r_base` | Custo interno de funding do banco em USD | Revisto (era DeFi) |
| `r_friction` | Fees + spread + margin cost por giro × n_giros | Igual |
| `r_counterparty` | Haircut por risco de default de exchange | **Novo** |
| `r_reversal` | P(reversão antecipada) × custo exit forçado | **Novo** |
| `r_risk_mkt` | IV + risk reversal + OI concentration (proxy de crash risk) | Renomeado |
| `r_sentiment_ajuste` | Sinal de posicionamento, tratado como flag de WAIT, não componente aditivo | Revisto |

**Política operacional**: máquina de estados OPEN/WAIT/HOLD/CLOSE opera sobre `|carry_relativo|`, com thresholds simétricos em torno de zero. Direção da posição determinada pelo sinal de `carry_relativo`.

**Sizing**: capital de margem total USD 25M, alavancagem máxima 3×, teto por ativo = min(alocação equal-weight, 1–2% do OI), limite hard de 40–50% por venue.

**Protocolo de backtest obrigatório**: strict T+1 execution, no-look-ahead funding alignment, two-stage double-screening (janelas rolantes + cost-sensitivity grid), múltiplos cenários de custo (baseline, stress, pessimista).

**Modelo de giros**: processo OU calibrado por ativo, com otimização conjunta de thresholds e expectativa de giros maximizando E[P&L].

---

## 5. Sugestões de ajuste no planejamento das fases

Dado o modelo reformulado, as quatro fases do documento original permanecem válidas na estrutura incremental, mas os escopos precisam ser ajustados para incorporar os novos componentes, os protocolos metodológicos e o contexto institucional. As mudanças são as seguintes:

### Fase 1 — MVP reformulado

**Mudança de foco**: deixar de ser um monitor de carry líquido para ser um monitor de **carry relativo vs. custo interno de funding do banco**. A diferença não é apenas semântica — ela já permite identificar oportunidades em ambos os regimes (funding positivo e negativo) desde o primeiro dia.

**Componentes calculados**:
- `r_funding` observado (com sinal)
- `r_base` como custo interno informado manualmente (ou aproximado por SOFR + spread fixo até haver integração com tesouraria)
- `r_friction` simplificado (fee fixo × giros estimado)
- `carry_relativo` = diferença

**Componentes não calculados ainda**: `r_counterparty` (entra como policy de concentração, não como número), `r_reversal` (acumula-se dados para estimar na Fase 2), `r_risk_mkt` (idem).

**Critérios de saída revistos**:
- 30 dias de histórico sem gaps, para BTC e ETH, em Binance e Gate.io
- `carry_relativo` calculado e validado contra referência manual em janelas de funding positivo e negativo
- Pelo menos uma oportunidade identificada e documentada em cada regime (funding positivo e funding negativo/baixo)
- Fee schedules reais de cada venue mapeados e incorporados ao `r_friction`
- Limite hard de concentração por venue documentado e aprovado pelo comitê de risco

### Fase 2 — Pipeline + decomposição completa + dados de risco

**Escopo incremental** (além do que o documento original já previa):
- **Captura de dados para `r_reversal`**: séries de spread entre funding observado e funding realizado na janela seguinte, por ativo. Base empírica para estimar P(reversão).
- **Proxy de stress de exchange**: fluxos líquidos de stablecoins saindo da venue, spread do token nativo da exchange, desvio de funding vs. mediana do mercado. Entrada para o `r_counterparty` evoluído.
- **Séries para modelo OU**: funding rate em alta frequência suficiente para estimar θ, μ, σ por ativo.

**Componentes calculados**: todos os sete do modelo reformulado. `r_counterparty` ainda em versão haircut determinístico, mas com o proxy de stress já sendo acumulado para uso na Fase 3.

**Critérios de saída revistos**:
- Pipeline rodando sem intervenção manual
- Todos os componentes calculados e versionados, com `r_reversal` calibrado contra pelo menos 3 meses de observações
- Backtest simples **respeitando strict T+1 e no-look-ahead funding alignment** — Sharpe reportado com protocolo documentado
- Estimativas OU (θ, μ, σ) documentadas por ativo
- Relatório de sensibilidade do P&L a cada componente de risco (análise de contribuição marginal)

### Fase 3 — Modelo preditivo + backtest rigoroso

**Mudança central**: o foco não é "Sharpe > 1.0". É **Sharpe > 1.0 sob protocolo de two-stage double-screening com cost-sensitivity grid**. Essa distinção é o que separa um modelo defensável de um modelo que apenas parece bom no papel.

**Escopo incremental**:
- Implementação completa do protocolo AutoQuant-like: Bayesian optimization para busca de hiperparâmetros do modelo preditivo, double-screening em janelas holdout + grid de cenários de custo.
- Otimização conjunta de thresholds (open, close) e sizing por ativo, usando o modelo OU como gerador de cenários e `r_reversal` como penalização realista.
- Evolução do `r_counterparty` para o proxy de stress contínuo (não apenas haircut fixo).
- Detecção de regime (bull/bear/sideways) como *feature condicionante* dos parâmetros, não como lookahead sobre resultados.

**Critérios de saída revistos**:
- Modelo com Sharpe out-of-sample > 1.0 **sob cenário de custo pessimista** (não apenas baseline)
- Backtest com pelo menos 12 meses de dados (não 6 — dado que o mercado crypto tem ciclos de regime suficientemente longos que 6 meses capturam um único regime)
- Pipeline de retreino documentado com gatilhos de invalidação (mudança de regime, stress de venue, drift de parâmetros OU)
- Análise de contribuição de cada componente ao P&L realizado vs. esperado
- Relatório de comitê de risco aprovando limites de exposição por venue, por ativo e agregados

### Fase 4 — Execução, não expansão de venues

**Mudança de escopo**: a Fase 4 original previa expansão para DEX (HyperLiquid) e CME. À luz do contexto bancário (sem DeFi) e dos achados de Zhivkov sobre arbitragem CEX-DEX, a Fase 4 deve se concentrar em **execução semi-automática nas venues já operadas (CEX top-tier) + integração com CME como perna alternativa regulada**, não em expandir para DEX.

A justificativa é dupla: (i) DEX não é acessível institucionalmente para o banco, portanto não é escopo viável; (ii) a arbitragem cross-platform entre CEX e DEX é estruturalmente fragmentada, e apenas 40% das top oportunidades geram retorno positivo após custos e reversões — a relação risco-retorno não justifica o esforço operacional mesmo se o acesso existisse.

**Escopo revisto**:
- Execução semi-automática com aprovação humana obrigatória em Binance e Gate.io
- Integração com CME futures como perna regulada alternativa (reduz `r_counterparty` drasticamente quando usada)
- Expansão de ativos dentro do universo CEX (SOL, BNB, XRP adicionados conforme critérios de liquidez)
- Feedback loop entre P&L realizado e recalibração de parâmetros (θ, μ, σ do OU; `r_counterparty` por venue; thresholds)
- Dados macro (DXY, VIX, stablecoin supply) como features condicionantes, não como venues

**Critérios de saída revistos**:
- P&L realizado rastreado contra P&L esperado do modelo, com variance attribution por componente
- Tempo médio entre sinal e execução medido e dentro de SLA definido (janela de 8h permite folga, mas precisa ser explicitada)
- Integração CME funcional como perna alternativa, reduzindo `r_counterparty` agregado
- Ciclo de recalibração automatizado com aprovação humana para mudanças materiais de parâmetros

---

## 6. O que sobrevive do documento original

Para não perder o que está bem feito: o framework de decomposição em componentes, a arquitetura de data mesh + data lake, o princípio de schema-first, a imutabilidade de dados crus e o princípio de complexidade incremental são todos válidos e devem ser preservados. A crítica aqui é sobre o conteúdo dos componentes, os protocolos de validação e o escopo das fases — não sobre a estrutura geral, que é coerente.

O princípio de "dados limpos antes de modelo complexo" do slide de fechamento da apresentação original é, ironicamente, o que a crítica deste ensaio reforça: os componentes ausentes do modelo (contraparte, reversão) e os protocolos ausentes do backtest (T+1, double-screening) são precisamente os "dados limpos" que precisam estar em pé antes que qualquer modelo de forecasting seja construído sobre eles.

---

## 7. Referências complementares incorporadas

- Zhivkov, P. (2026a). *The Two-Tiered Structure of Cryptocurrency Funding Rate Markets*. Mathematics, 14(2), 346. https://doi.org/10.3390/math14020346
- Zhivkov, P. (2026b). *AutoQuant: An Auditable Expert-System Framework for Execution-Constrained Auto-Tuning in Cryptocurrency Perpetual Futures*. arXiv:2512.22476.

Os oito papers originais do documento permanecem na base; estes dois entram como reforço metodológico crítico para o desenho de `r_reversal` e do protocolo de backtest.

---

*Abril 2026 — ensaio crítico sobre o modelo, escrito como insumo para a reformulação do documento de projeto.*
