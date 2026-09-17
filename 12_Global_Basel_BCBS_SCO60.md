# Basel Committee --- SCO60: tratamento prudencial de criptoativos

## Resumo executivo

SCO60 responde a pergunta diferente de MiCA/Lei 14.478: **quanto risco
prudencial um banco assume ao ter exposição a crypto e como isso entra
em capital/gestão?**

A versão corrente do Basel Framework é efetiva desde **01/01/2026**,
sujeita à implementação pelas jurisdições. Divide exposições em **Group
1a, 1b, 2a e 2b**.

## 1. Permissão × prudencial

"Posso fazer?" e "quanto capital custa?" são perguntas distintas.
Negócio legal pode ser economicamente inviável por consumo de capital.

## 2. Escopo

Private digital assets dependentes de criptografia/DLT, incluindo
tokenized traditional assets conforme definições.

## 3. Árvore

Atende todas as condições Group 1? - sim → 1a/1b; - não → Group 2.

No Group 2, passa hedge-recognition criteria? - sim → 2a; - não → 2b.

## 4. Group 1a

Tokenized traditional assets que cumprem condições. Um bond tokenizado
pode manter tratamento próximo ao tradicional se substância/direitos e
condições forem satisfeitos.

## 5. Group 1b

Cryptoassets com effective stabilisation mechanism que cumprem
condições. Stablecoin pode potencialmente entrar, mas "negocia a \$1"
não basta.

## 6. Stablecoin

Analise mecanismo, reserve assets, redemption, legal rights,
counterparties, governance e settlement. Peg histórico é evidência de
mercado, não classificação prudencial.

## 7. Group 2

Ativos que falham condições Group 1. Unbacked cryptoassets como BTC
entram tipicamente no universo que exige essa análise e tratamento mais
conservador.

## 8. Group 2a

Group 2 que passa critérios de reconhecimento de hedge. O framework
considera características de instrumentos, exchanges e clearing. É
crucial para trading desks.

## 9. Group 2b

Demais ativos Group 2, sujeitos ao tratamento mais conservador.

## 10. Hedge econômico ≠ prudencial

Mesa: long BTC spot + short perp = delta próximo de zero.\
Basel: o hedge satisfaz critérios prudenciais?

Venue, basis, clearing, instrumento, contraparte e liquidez importam.

## 11. Capital

Tratamentos diferem por grupo. Group 2b é deliberadamente conservador.
Spread deve remunerar não apenas execution/funding, mas consumo de
capital.

## 12. Limites

O framework contém limites/restrições relevantes para exposições Group 2
em relação ao Tier 1, evitando que banco transforme balanço em grande
carteira de unbacked crypto.

## 13. Infrastructure risk

DLT introduz riscos próprios. O framework prevê tratamento prudencial
para riscos de infraestrutura em determinadas condições. Tokenizar bond
não elimina smart-contract/node/settlement risk.

## 14. Credit risk em 1b

Stablecoin pode conter crédito ao emissor, custodian, bancos
depositários, securities issuers e redemption agents. O banco deve
decompor riscos.

## 15. Market risk

Trading-book positions recebem tratamento coerente com classificação;
volatilidade e hedge recognition são centrais.

## 16. Operational risk

Mesmo custody sem directional exposure pode sofrer key loss,
cyberattack, erroneous transfer, fork e vendor outage.

## 17. Disclosure --- DIS55

Há disclosure específico sobre natureza das exposições, grupos, capital,
accounting classification e liquidity information.

## 18. Caso market maker

Banco vende BTC e mantém inventory por 30 segundos. Ainda existem
exposure, classificação, hedge criteria, counterparty, custody e
operational risk. Horizonte curto reduz risco econômico, não elimina
prudencial.

## 19. Caso stablecoin

Pergunte: 1. atende Group 1b? 2. redemption? 3. reservas? 4. custody? 5.
riscos de crédito? 6. implementação local de Basel? 7. accounting?

## 20. Pricing

`spread – execution – slippage – funding – capital cost – liquidity – operational cost – counterparty risk – inventory risk`.

Basel pesa especialmente em capital cost/risk appetite.

## 21. Como memorizar

**SCO60 = classify first, then capitalize.** Classificação prudencial
não é a mesma que classificação jurídica.

## Fontes

-   https://www.bis.org/committees/bcbs/basel-framework/standard/sco/60/
-   https://www.bis.org/committees/bcbs/basel-framework/standard/dis/55/
