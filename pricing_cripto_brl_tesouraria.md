# Pricing de Cripto em BRL com Hedge em Perpétuos e Dólar Futuro

## 1. Objetivo e contexto

Este documento consolida a discussão sobre como uma tesouraria de um
grande banco pode construir um **fair price de cripto spot em BRL** para
clientes quando:

-   a entidade brasileira enfrenta o cliente;
-   a liquidez de cripto é provida por uma entidade do grupo no
    exterior;
-   a entidade offshore opera cripto em USD;
-   o hedge de risco de cripto é feito, quando necessário, em
    **perpétuos de BTC, ETH, SOL etc.**;
-   o hedge cambial é feito na B3 via **DOL e/ou WDO**;
-   o sistema dispõe, em tempo real, de:
    -   preço spot de BTC/USD;
    -   preço perpétuo de BTC/USD;
    -   primeiro futuro de dólar (DOL);
    -   casado de dólar.

A ideia central é separar claramente:

1.  **fair mid**: quanto o ativo spot vale economicamente em BRL;
2.  **hedge cost**: quanto custa neutralizar os riscos gerados pelo
    trade;
3.  **inventory skew**: como a posição atual da mesa deve deslocar o
    preço;
4.  **spread comercial e de risco**: quanto cobrar para remunerar
    execução, risco, capital e margem.

------------------------------------------------------------------------

## 2. Os instrumentos relevantes

### 2.1 Dólar futuro --- DOL

O primeiro futuro de dólar é o principal instrumento de descoberta de
preço de USD/BRL no mercado brasileiro. Ele representa USD/BRL para uma
data futura específica e, portanto, **não é diretamente um spot**.

O preço futuro contém o carrego entre BRL e USD:

\[ F `\approx `{=tex}S `\times `{=tex}`\frac{FV_{BRL}}{FV_{USD}}`{=tex}
\]

onde:

-   \(F\) = dólar futuro;
-   \(S\) = dólar spot;
-   (FV\_{BRL}) = fator de capitalização em BRL;
-   (FV\_{USD}) = fator de capitalização em USD.

Logo, usar diretamente o primeiro DOL como USD/BRL spot introduziria os
forward points.

### 2.2 Casado de dólar

O casado é uma **operação estruturada** que negocia o diferencial entre
o primeiro futuro de dólar e o dólar pronto. Economicamente:

\[ C `\approx `{=tex}F-S \]

na convenção em que o casado é futuro menos spot.

Ele não deve ser pensado como um terceiro ativo independente. Os três
preços estão ligados por arbitragem:

\[ F `\leftrightarrow `{=tex}S `\leftrightarrow `{=tex}C \]

Assim:

\[ S=F-C \]

ou:

\[ C=F-S \]

A direção da inferência depende de qual mercado fornece a melhor
informação naquele instante.

### 2.3 Por que às vezes calcular spot a partir de DOL + casado?

Não existe uma regra financeira universal dizendo que o casado deve
sempre precificar o spot.

Se a mesa possui um spot D2 executável, fresco, profundo e confiável,
esse spot pode ser a melhor observação. Nesse caso:

\[ C\_{fair}=F-S \]

faz todo sentido.

A construção:

\[ S=F-C \]

é particularmente útil quando se deseja um **spot sintético sincronizado
ao futuro**, ou quando o spot disponível é fragmentado, stale ou menos
adequado para a finalidade específica.

Portanto, para um pricing engine profissional, os três mercados devem
ser vistos como **fontes redundantes de informação**, e a escolha deve
considerar:

-   timestamp;
-   bid/ask;
-   profundidade;
-   executabilidade;
-   staleness;
-   venue;
-   tamanho do RFQ.

### 2.4 BTC/USD spot

Para um produto que será vendido ao cliente como **BTC spot em BRL**, o
BTC/USD spot é a referência natural para o valor econômico do ativo.

### 2.5 BTC/USD perpétuo

O perpétuo é principalmente:

-   instrumento de hedge;
-   fonte de informação sobre basis;
-   fonte de custo de execução;
-   fonte de funding;
-   indicador de stress/liquidez do mercado.

Defina:

\[ b\_{perp}=`\frac{P_{perp}}{P_{spot}}`{=tex}-1 \]

O basis não deve, por padrão, ser simplesmente somado ao fair spot do
cliente. Ele deve alimentar o custo e o risco do hedge.

------------------------------------------------------------------------

## 3. D0/D0, D2/D2 e o spot de USD/BRL

### 3.1 Spot D2/D2

Com primeiro DOL e casado, usando a convenção adequada do feed:

\[ `\boxed{
S_{FX,D2}=\frac{F_{DOL}-C}{1000}
}`{=tex} \]

quando DOL e casado são cotados em BRL por USD 1.000.

Exemplo:

\[ F\_{DOL}=5.250 \]

\[ C=35 \]

então:

\[ S\_{FX,D2}=`\frac{5250-35}{1000}`{=tex}=5,2150 \]

### 3.2 De D2 para D0

Para trazer o spot D2 para D0:

\[ S\_{D0} = S\_{D2} `\times`{=tex} `\frac{FV_{USD}(D0,D2)}`{=tex}
{FV\_{BRL}(D0,D2)} \]

Para BRL, uma aproximação de curtíssimo prazo usa CDI:

\[ FV\_{BRL}=(1+CDI)\^{DU/252} \]

Para USD, usa-se hoje SOFR, e não LIBOR:

\[ FV\_{USD}`\approx1`{=tex}+SOFR`\times`{=tex}`\frac{DC}{360}`{=tex} \]

Logo:

\[ `\boxed{
S_{D0}
=
S_{D2}
\frac{1+SOFR\times DC/360}
{(1+CDI)^{DU/252}}
}`{=tex} \]

É importante distinguir:

-   **DU**: dias úteis relevantes para CDI;
-   **DC**: dias corridos relevantes para a convenção USD.

Para um problema puramente D0--D2, o primeiro DI futuro não é
normalmente o melhor insumo: o CDI de curtíssimo prazo é mais direto. A
curva DI torna-se relevante para forwards de prazos maiores.

Para um pricing executável de tesouraria, o funding USD econômico da
instituição pode ser mais apropriado do que SOFR puro:

\[ r\_{USD}=SOFR+FundingSpread \]

------------------------------------------------------------------------

## 4. Fair mid de BTC/BRL

Com os dados disponíveis, a construção básica é:

\[ `\boxed{
FairMid_{BTCBRL}
=
BTCUSD_{spot}
\times
USDBRL_{spot}
}`{=tex} \]

Se o USD/BRL spot for inferido de DOL e casado:

\[ `\boxed{
FairMid_{BTCBRL}
=
BTCUSD_{spot}
\times
\frac{DOL_1-Casado}{1000}
}`{=tex} \]

Exemplo:

\[ BTCUSD=100.000 \]

\[ USDBRL=5,2150 \]

então:

\[ `\boxed{
BTCBRL_{fair}=R\$521.500/BTC
}`{=tex} \]

Esse número deve ser interpretado como **reference fair mid**, e não
automaticamente como preço executável ao cliente.

A mesma lógica vale para ETH, SOL etc.:

\[ CryptoBRL\_{fair} = CryptoUSD\_{spot} `\times`{=tex} USDBRL\_{spot}
\]

------------------------------------------------------------------------

## 5. Por que não usar diretamente perp × DOL?

A expressão:

\[ BTCPerp`\times `{=tex}DOL_1 \]

mistura dois instrumentos que possuem bases diferentes:

-   o perp tem basis/funding em relação ao BTC spot;
-   o DOL tem forward points em relação ao USD/BRL spot.

Logo:

\[ BTCPerp`\times `{=tex}DOL_1 \]

não é, em geral, o fair spot de BTC/BRL.

Para valuation:

\[ BTCUSD\_{spot}`\times `{=tex}USDBRL\_{spot} \]

é conceitualmente mais limpo.

Já perp e DOL são fundamentais para responder a outra pergunta:

> Quanto custa assumir o trade do cliente e hedgear os riscos nos
> instrumentos que a mesa realmente utiliza?

------------------------------------------------------------------------

## 6. Decomposição do risco do trade

Considere (Q) BTC.

O valor em BRL é:

\[ V=QXY \]

onde:

\[ X=BTCUSD \]

e:

\[ Y=USDBRL \]

### 6.1 Delta de cripto

\[ `\frac{\partial V}{\partial X}`{=tex}=QY \]

A quantidade natural de hedge em BTC é aproximadamente (Q), ajustada
pelas especificações do instrumento.

### 6.2 Delta cambial

\[ `\frac{\partial V}{\partial Y}`{=tex}=QX \]

Logo, o notional USD a hedgear é aproximadamente:

\[ `\boxed{
USDDelta=Q\times BTCUSD
}`{=tex} \]

Exemplo:

\[ Q=10 BTC \]

\[ BTCUSD=100.000 \]

então:

\[ USDDelta=USD1.000.000 \]

Esse delta pode ser hedgeado em DOL/WDO.

### 6.3 Cross effect

Como:

\[ V=QXY \]

temos:

\[ dV=QY,dX+QX,dY+Q,dX,dY \]

O último termo:

\[ Q,dX,dY \]

é o efeito cruzado entre BTC/USD e USD/BRL. Em pequenos movimentos ele
tende a ser secundário, mas pode se tornar relevante em movimentos
grandes, especialmente quando o hedge FX não pode ser reajustado
continuamente.

------------------------------------------------------------------------

## 7. Fair, hedge-adjusted fair e client quote

É útil manter três conceitos separados no sistema.

### 7.1 Reference fair

\[ `\boxed{
Fair=
CryptoUSD_{spot}
\times
USDBRL_{spot}
}`{=tex} \]

Responde:

> Quanto o ativo vale economicamente agora?

### 7.2 Hedge-adjusted fair

Considera o custo marginal para neutralizar os riscos:

\[ HAF(Q) = Fair + CryptoHedgeCost(Q) + FXHedgeCost(Q) + FundingCost +
OtherDirectCosts \]

Responde:

> Quanto custa economicamente assumir e hedgear este RFQ?

### 7.3 Client quote

\[ `\boxed{
ClientQuote(Q)
=
HAF(Q)
+
RiskCharge
+
CapitalCharge
+
CommercialMargin
+
InventoryAdjustment
}`{=tex} \]

Responde:

> A que preço a mesa quer negociar com o cliente?

------------------------------------------------------------------------

## 8. Construção do bid/ask

Comece por:

\[ M=FairMid \]

Depois aplique o inventory skew ao mid:

\[ `\boxed{
M'=M(1+Skew_{crypto}+Skew_{FX})
}`{=tex} \]

Então:

\[ `\boxed{
Ask=M'(1+HalfSpread_{ask})
}`{=tex} \]

\[ `\boxed{
Bid=M'(1-HalfSpread_{bid})
}`{=tex} \]

Não há necessidade de:

\[ HalfSpread\_{ask}=HalfSpread\_{bid} \]

A assimetria é desejável quando os custos ou riscos são assimétricos.

------------------------------------------------------------------------

## 9. Componentes do spread

Uma decomposição útil é:

\[ `\boxed{
Spread=
BaseMargin
+CryptoExecution
+FXExecution
+BasisRisk
+Funding
+VolLatency
+MarketHours
+Capital
+OtherCosts
}`{=tex} \]

### 9.1 Base margin

Margem comercial mínima desejada pela mesa.

Parâmetros possíveis:

-   bps mínimo por produto;
-   bps por segmento de cliente;
-   margem mínima absoluta;
-   tiers por notional;
-   margem diferenciada por BTC/ETH/SOL.

### 9.2 Crypto execution cost

Não use apenas o top-of-book do perp.

Para RFQ de tamanho (Q), calcule o VWAP executável:

\[ CryptoExecutionCost(Q) =
`\frac{|VWAP_{perp}(Q)-Mid_{perp}|}{Mid_{perp}}`{=tex} +Fees \]

Cliente compra cripto da mesa → a mesa precisa considerar o custo do
lado de compra do hedge.

Cliente vende cripto → usar o lado de venda correspondente.

Parâmetros:

-   depth do book;
-   exchange fees;
-   maker/taker;
-   slippage;
-   market impact;
-   hedge venue;
-   tamanho máximo por venue.

### 9.3 FX execution cost

Calcule:

\[ USDNotional=Q`\times `{=tex}CryptoUSD \]

e estime o custo de hedgear esse notional em DOL/WDO.

Parâmetros:

-   bid/ask de DOL;
-   depth;
-   slippage;
-   fees B3;
-   granularidade dos contratos;
-   residual não hedgeado;
-   escolha ótima entre DOL e WDO.

### 9.4 Perp basis risk

Monitore:

\[ Basis=`\frac{Perp-Spot}{Spot}`{=tex} \]

e também:

-   nível do basis;
-   volatilidade do basis;
-   velocidade de abertura/fechamento;
-   funding rate;
-   expectativa de holding period.

Uma função conceitual:

\[ BasisCharge=f(\|Basis\|,BasisVol,Funding,HoldingPeriod) \]

O nível absoluto do basis não deve ser automaticamente cobrado
integralmente do cliente.

### 9.5 Funding

Se o hedge em perp puder permanecer aberto:

\[ FundingCost `\approx`{=tex} ExpectedFundingRate `\times`{=tex}
ExpectedHoldingPeriod \]

O custo depende fortemente do tempo esperado de permanência do hedge.

Também podem existir:

-   custo de funding USD offshore;
-   custo de collateral;
-   custo de margem na B3;
-   custo de caixa BRL.

### 9.6 Volatilidade e latency

Para uma quote válida por (`\tau`{=tex}), existe adverse-selection risk.

Uma aproximação é:

\[ RiskCharge`\propto`{=tex}`\sigma`{=tex}`\sqrt{\tau}`{=tex} \]

Para o cross:

\[ `\sigma`{=tex}*{CryptoBRL}\^{2} `\approx`{=tex}
`\sigma`{=tex}*{Crypto}\^{2} + `\sigma`{=tex}*{FX}\^{2} +
2`\rho`{=tex}`\sigma`{=tex}*{Crypto}`\sigma`{=tex}\_{FX} \]

Logo:

\[ `\boxed{
LatencyCharge
=
k\sigma_{CryptoBRL}\sqrt{\tau}
}`{=tex} \]

Parâmetros:

-   realized vol curta;
-   implied vol, se útil;
-   EWMA;
-   correlação crypto/FX;
-   TTL da RFQ;
-   latência do hedge;
-   latência do market data.

### 9.7 Market-hours risk

Cripto negocia 24/7; DOL/WDO não.

Portanto, o regime de pricing deve mudar quando o hedge cambial não está
disponível.

Exemplo de estados:

-   B3 aberta e líquida;
-   B3 perto do fechamento;
-   B3 fechada em dia útil;
-   overnight;
-   fim de semana;
-   feriado brasileiro;
-   feriado/condição anormal no mercado USD.

Parâmetros:

-   multiplicador de spread por regime;
-   redução de max RFQ;
-   redução de FX inventory limit;
-   charge específico de gap risk;
-   hard stop para certos tamanhos.

------------------------------------------------------------------------

## 10. Inventory skew

Inventory risk não deve ser tratado apenas abrindo simetricamente o
spread.

Se a mesa deseja comprar um ativo, deve melhorar o bid e/ou piorar o
ask. Isso desloca o centro econômico da cotação.

### 10.1 Inventory normalizado

Para cripto:

\[ z\_{crypto} = `\frac{Inventory_{crypto}-Target_{crypto}}`{=tex}
{Limit\_{crypto}} \]

Para FX:

\[ z\_{FX} = `\frac{Inventory_{USD}-Target_{USD}}`{=tex} {Limit\_{USD}}
\]

Então:

\[ `\boxed{
Skew=
\alpha z_{crypto}
+
\beta z_{FX}
}`{=tex} \]

com caps e, idealmente, função não linear próxima aos limites.

### 10.2 Parâmetros de inventory

Para cada cripto:

-   target;
-   soft limit;
-   hard limit;
-   skew coefficient;
-   max skew;
-   hedge threshold;
-   emergency hedge threshold.

Para FX agregado:

-   target USD delta;
-   soft limit;
-   hard limit;
-   skew coefficient;
-   max skew;
-   hedge threshold.

### 10.3 Agregação de FX

BTC, ETH e SOL possuem inventories de cripto diferentes, mas todos geram
exposição cambial em USD.

Logo:

\[ `\boxed{
USDInventory
=
\sum_i Q_iP_{i,USD}
}`{=tex} \]

Isso permite internalizar fluxos entre produtos.

Um cliente comprando BTC e outro vendendo ETH podem gerar deltas FX
parcialmente compensatórios mesmo que os riscos crypto sejam distintos.

------------------------------------------------------------------------

## 11. Staleness e market-data quality

O engine não deve assumir que qualquer preço recebido é igualmente
válido.

Para cada fonte, mantenha:

-   timestamp;
-   age;
-   bid;
-   ask;
-   mid;
-   depth;
-   last trade;
-   venue;
-   feed health.

Hard guards possíveis:

-   spot BTC stale → widen/stop;
-   perp stale → widen/stop;
-   DOL stale → widen/stop;
-   casado stale → usar alternativa ou widen;
-   divergência spot vs sintético acima de limite → alert/widen;
-   market data inconsistente → kill switch.

A relação:

\[ S\_{FX}`\approx `{=tex}F-C \]

pode ser usada como teste de consistência, não apenas como fórmula de
valuation.

------------------------------------------------------------------------

## 12. Uso conjunto de spot, DOL e casado

Uma arquitetura robusta não precisa escolher dogmaticamente uma única
fonte.

Pode-se manter:

\[ S\_{direct} \]

e:

\[ S\_{synthetic}=`\frac{DOL-Casado}{1000}`{=tex} \]

e comparar:

\[ Deviation = `\frac{S_{direct}-S_{synthetic}}{S_{synthetic}}`{=tex} \]

O engine pode usar:

-   direct spot quando mais fresco/executável;
-   sintético quando o spot estiver stale;
-   combinação ponderada;
-   regras de fallback;
-   thresholds de divergência.

Para marcação oficial ou processos que exigem sincronismo com DOL, a
construção DOL + casado pode ter vantagem metodológica. Para execução
intraday, a melhor fonte depende da qualidade observável dos mercados.

------------------------------------------------------------------------

## 13. DOL versus WDO no hedge

A exposição FX é:

\[ USDDelta=Q`\times `{=tex}CryptoUSD \]

O hedge pode usar DOL como instrumento principal e WDO para
granularidade/residual, dependendo de liquidez e custo.

O algoritmo deve minimizar:

\[ TotalHedgeCost = ExecutionCost + Fees + ResidualRisk \]

e não simplesmente minimizar o residual nominal.

Às vezes é economicamente melhor aceitar pequeno residual do que pagar
spread/fees para zerá-lo.

------------------------------------------------------------------------

## 14. Internalização versus hedge imediato

Nem todo trade precisa ser imediatamente hedgeado.

A decisão pode depender de:

-   inventory atual;
-   expected client flow;
-   hedge cost;
-   volatilidade;
-   limites;
-   horário;
-   tamanho;
-   concentração.

Um trade que reduz uma posição existente tem valor econômico para a mesa
e pode receber preço melhor.

Assim, o pricing deve reconhecer:

\[ ValueOfInternalization \]

e permitir que parte desse valor seja compartilhada com o cliente para
aumentar a competitividade da quote.

------------------------------------------------------------------------

## 15. Entidade offshore e transfer price

No desenho societário descrito existem, economicamente:

\[ ExternalMarket `\rightarrow`{=tex} OffshoreCryptoDesk
`\rightarrow`{=tex} BrazilEntity `\rightarrow`{=tex} Client \]

É recomendável separar:

1.  preço externo de hedge;
2.  transfer price offshore → Brasil;
3.  custo/risco FX da entidade brasileira;
4.  margem comercial final.

Conceitualmente:

\[ `\boxed{
ClientCryptoBRL
=
OffshoreCryptoUSDTransferPrice
\times
BrazilFXTransferPrice
+
Adjustments
}`{=tex} \]

Isso ajuda a atribuir P&L corretamente entre:

-   crypto execution;
-   FX execution;
-   basis;
-   funding;
-   internalization;
-   client spread.

A metodologia de transfer pricing deve naturalmente ser alinhada às
exigências jurídicas, tributárias, contábeis e de governança aplicáveis
ao grupo.

------------------------------------------------------------------------

## 16. P&L explain

Separar fair, skew e spread permite decompor o resultado:

\[ `\boxed{
ClientPnL
=
CommercialSpread
+
InternalizationPnL
+
CryptoHedgePnL
+
FXHedgePnL
+
BasisPnL
+
FundingPnL
-
Fees
-
CapitalCosts
}`{=tex} \]

Essa decomposição é essencial para responder:

-   a mesa está ganhando dinheiro por bom pricing ou por risco
    direcional?
-   quanto se perde em hedge?
-   quanto se ganha internalizando?
-   o spread comercial é suficiente?
-   o basis spot/perp está consumindo margem?
-   DOL/WDO estão gerando slippage excessivo?
-   quais clientes têm markout ruim?

------------------------------------------------------------------------

## 17. Parâmetros recomendados para a mesa

### Fair-value parameters

-   fonte de BTC/USD spot;
-   fonte de ETH/USD spot;
-   fonte de SOL/USD spot;
-   fonte de USD/BRL;
-   regra direct spot vs DOL-casado;
-   staleness thresholds;
-   outlier thresholds.

### Crypto hedge parameters

-   perp venue;
-   max hedge size;
-   depth levels;
-   fee schedule;
-   expected slippage;
-   funding;
-   basis threshold;
-   basis-vol threshold;
-   expected holding period.

### FX hedge parameters

-   DOL/WDO preference;
-   depth;
-   fees;
-   max order size;
-   residual tolerance;
-   hedge threshold;
-   roll policy;
-   market-hours regime.

### Inventory parameters

-   target por cripto;
-   soft/hard limits;
-   target USD delta;
-   soft/hard FX limits;
-   skew curves;
-   max skew;
-   emergency hedge thresholds.

### Risk parameters

-   crypto vol;
-   FX vol;
-   crypto/FX correlation;
-   RFQ TTL;
-   hedge latency;
-   weekend multiplier;
-   holiday multiplier;
-   gap-risk charge;
-   concentration charge.

### Commercial parameters

-   base spread;
-   minimum margin;
-   client tier;
-   product tier;
-   notional tier;
-   max discount;
-   minimum absolute revenue;
-   relationship pricing override.

------------------------------------------------------------------------

## 18. Fluxo operacional sugerido

Para cada RFQ:

### Passo 1 --- validar market data

Verifique spot, perp, DOL e casado.

### Passo 2 --- calcular USD/BRL fair

\[ FXFair=`\frac{DOL-Casado}{1000}`{=tex} \]

ou utilize o spot direto quando a política de market-data indicar que
ele é superior.

### Passo 3 --- calcular Crypto/BRL fair

\[ Fair=CryptoUSD\_{spot}`\times `{=tex}FXFair \]

### Passo 4 --- calcular deltas

\[ CryptoDelta=Q \]

\[ USDDelta=Q`\times `{=tex}CryptoUSD \]

### Passo 5 --- calcular custo marginal de hedge

Walk do book do perp e do DOL/WDO para o tamanho relevante.

### Passo 6 --- calcular basis/funding

Use spot-perp basis, funding esperado e holding period.

### Passo 7 --- calcular inventory skew

Considere separadamente crypto inventory e FX inventory.

### Passo 8 --- calcular risk charges

Volatilidade, TTL, market hours, gap risk, concentração e capital.

### Passo 9 --- adicionar margem comercial

Aplicar parâmetros do cliente/produto.

### Passo 10 --- gerar bid/ask

\[ M'=Fair(1+Skew) \]

\[ Bid=M'(1-HalfSpread\_{bid}) \]

\[ Ask=M'(1+HalfSpread\_{ask}) \]

------------------------------------------------------------------------

## 19. Exemplo simplificado

Suponha:

\[ BTCSpot=100.000 \]

\[ BTCPerp=100.050 \]

\[ DOL=5.250 \]

\[ Casado=35 \]

Então:

\[ USDBRL=5,2150 \]

e:

\[ FairMid=100.000`\times5`{=tex},2150=521.500 \]

O basis do perp é:

\[ Basis=`\frac{100.050}{100.000}`{=tex}-1=5bps \]

Agora suponha que, para determinado RFQ, os custos/charges sejam:

-   crypto execution: 4 bps;
-   FX execution: 1 bp;
-   funding/basis risk: 2 bps;
-   latency/vol: 3 bps;
-   capital/operacional: 1 bp;
-   commercial margin: 10 bps.

Half-spread bruto:

\[ 4+1+2+3+1+10=21bps \]

Se inventory skew for zero:

\[ Ask`\approx521.500`{=tex}`\times1`{=tex},0021 \]

\[ Bid`\approx521.500`{=tex}`\times0`{=tex},9979 \]

Se o inventory da mesa tornar compras de BTC de clientes desejáveis, o
skew deve deslocar o mid para favorecer esse fluxo, em vez de
simplesmente aumentar ou reduzir os dois spreads de maneira simétrica.

Os números acima são meramente ilustrativos; os parâmetros reais devem
ser calibrados com execução, markouts, hedge P&L e limites reais da
mesa.

------------------------------------------------------------------------

## 20. Princípios de desenho

### Princípio 1 --- o produto spot deve ter um fair spot

\[ CryptoBRL\_{fair} = CryptoUSD\_{spot} `\times`{=tex} USDBRL\_{spot}
\]

### Princípio 2 --- os instrumentos de hedge determinam o custo de execução

Perp e DOL/WDO não precisam definir o mid spot, mas devem influenciar
fortemente o bid/ask.

### Princípio 3 --- não confundir basis com spread comercial

Spot/perp basis e spot/futuro FX são fenômenos econômicos específicos,
não margem de cliente.

### Princípio 4 --- separar spread de skew

-   **spread** remunera custo, risco e lucro;
-   **skew** direciona fluxo para melhorar inventory.

### Princípio 5 --- calcular custos em função do tamanho

O spread deve depender de (Q), pois market impact e depth não são
lineares.

### Princípio 6 --- tratar crypto e FX inventory separadamente

BTC, ETH e SOL têm riscos próprios, mas compartilham um FX delta
agregado em USD.

### Princípio 7 --- reconhecer o problema 24/7 × B3

O risco cambial fora do horário de hedge deve aparecer explicitamente no
pricing e nos limites.

### Princípio 8 --- medir P&L por componente

Sem P&L explain, fica difícil calibrar corretamente spread, skew e hedge
policy.

------------------------------------------------------------------------

## 21. Fórmulas-resumo

### USD/BRL D2 sintético

\[ `\boxed{
USDBRL_{D2}=\frac{DOL_1-Casado}{1000}
}`{=tex} \]

### USD/BRL D0

\[ `\boxed{
USDBRL_{D0}
=
USDBRL_{D2}
\frac{FV_{USD}}{FV_{BRL}}
}`{=tex} \]

### Crypto/BRL fair

\[ `\boxed{
CryptoBRL_{fair}
=
CryptoUSD_{spot}
\times
USDBRL_{spot}
}`{=tex} \]

### Perp basis

\[ `\boxed{
Basis_{perp}
=
\frac{Perp}{Spot}-1
}`{=tex} \]

### FX delta

\[ `\boxed{
USDDelta
=
Q_{crypto}\times CryptoUSD
}`{=tex} \]

### Aggregate FX inventory

\[ `\boxed{
USDInventory
=
\sum_iQ_iP_{i,USD}
}`{=tex} \]

### Inventory skew

\[ `\boxed{
Skew
=
\alpha z_{crypto}
+
\beta z_{FX}
}`{=tex} \]

### Skewed mid

\[ `\boxed{
M'=M(1+Skew)
}`{=tex} \]

### Client prices

\[ `\boxed{
Bid=M'(1-HalfSpread_{bid})
}`{=tex} \]

\[ `\boxed{
Ask=M'(1+HalfSpread_{ask})
}`{=tex} \]

### Spread decomposition

\[ `\boxed{
HalfSpread
=
BaseMargin
+CryptoExecution
+FXExecution
+BasisRisk
+Funding
+VolLatency
+MarketHours
+Capital
}`{=tex} \]

------------------------------------------------------------------------

## 22. Conclusão

Para o setup discutido, a arquitetura conceitualmente mais limpa é:

\[ `\boxed{
CryptoUSD_{spot}
\times
USDBRL_{spot}
\rightarrow FairMid
}`{=tex} \]

e, separadamente:

\[ `\boxed{
Perp + DOL/WDO
\rightarrow HedgeCost
}`{=tex} \]

Depois:

\[ `\boxed{
FairMid
\rightarrow InventorySkew
\rightarrow Risk/ExecutionSpread
\rightarrow CommercialMargin
\rightarrow ClientBid/Ask
}`{=tex} \]

Em outras palavras:

**o spot determina quanto o ativo vale; os mercados de hedge ajudam a
determinar quanto custa negociar esse valor com segurança; o inventory
skew determina quais fluxos a mesa quer atrair; e a margem comercial
determina quanto a mesa pretende ganhar.**

Essa separação é a base para um pricing engine que possa ser calibrado,
auditado e explicado por P&L, em vez de um único spread arbitrário
aplicado sobre `BTCUSD × USDBRL`.
