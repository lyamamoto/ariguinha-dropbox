# GENIUS Act --- Payment stablecoins nos Estados Unidos

## Resumo executivo

O GENIUS Act (*Guiding and Establishing National Innovation for U.S.
Stablecoins Act*) foi sancionado em **18/07/2025** e criou framework
federal específico para **payment stablecoins**. O foco não é
BTC/ETH/DeFi em geral: é tornar a promessa "1 token ≈ 1 dólar
resgatável" atividade regulada, com emissores permitidos, reservas,
resgate, disclosure e supervisão.

## 1. Problema econômico

Emissor recebe \$1 e entrega token. O sistema depende da crença de que
token será resgatável por \$1. Risco aparece se reservas forem
inexistentes, ilíquidas, arriscadas, oneradas ou indisponíveis em
corrida.

## 2. Emissores permitidos

Emitir payment stablecoin passa a ser atividade permissionada. O
framework contempla estruturas bancárias e não bancárias qualificadas e
interação federal/estadual conforme requisitos legais.

## 3. Reserva 1:1

Núcleo do regime: backing pelo menos 1:1 com ativos permitidos e
líquidos. Entre os tipos destacados estão dólares, certos depósitos,
Treasuries curtos, repos/reverse repos elegíveis e determinados money
market funds.

## 4. Por que liquidez/duration importam

Reserva em ativo longo pode perder valor quando juros sobem. Se holders
resgatam em massa, venda forçada cristaliza perda. Reservas curtas
reduzem maturity transformation.

## 5. Disclosure

Emissores devem divulgar periodicamente composição das reservas.
Proof-of-reserves on-chain isolado é insuficiente porque passivos/ativos
podem existir fora da chain.

## 6. Redemption

Reserva só funciona se houver processo efetivo:
`token burn → validação → fiat payment`. E mint:
`fiat received → token issued`.

## 7. Yield

O regime proíbe emissor de oferecer juros/yield diretamente ao holder em
função da stablecoin. A intenção é separar instrumento de pagamento de
produto de investimento. Em 2026 continuavam debates sobre estruturas
via terceiros/afiliadas.

## 8. AML/sanções

Stablecoin regulada continua dentro de AML e sanctions. Isso ajuda a
explicar capacidades de freeze/burn de stablecoins centralizadas quando
há base legal.

## 9. Insolvência

Pergunta crítica: se emissor quebra, quem tem direito às reservas? O
regime procura dar maior clareza e proteção ao holder, reduzindo
ambiguidade.

## 10. Stablecoin ≠ depósito

Backing 1:1 não transforma token automaticamente em depósito FDIC.
Estrutura legal, proteção, settlement e direitos são diferentes.

## 11. Papel do dólar

Stablecoins USD podem expandir uso internacional do dólar e demanda por
ativos de reserva denominados em USD, especialmente Treasuries curtos.

## 12. Bancos

Podem atuar como emissores, custodians de reserva, cash-rail providers,
usuários de settlement e counterparties de VASPs. Cada papel tem risco
distinto.

## 13. GENIUS × MiCA

GENIUS é estreito: **payment stablecoin issuer regime**. MiCA é mais
amplo: emissão + stablecoins + CASPs + market conduct.

## 14. GENIUS × Brasil

Token emitido legalmente nos EUA não ganha autorização automática no
Brasil. EUA regulam emissor; Brasil regula serviço/fluxo local via Lei
14.478 e BCB 520/521.

## 15. Exemplo BRL → fornecedor EUA

1.  banco recebe BRL;
2.  precifica FX;
3.  obtém stablecoin;
4.  transfere on-chain;
5.  fornecedor recebe;
6.  stablecoin pode ser resgatada.

GENIUS é central nas etapas ligadas ao emissor/reserva/redemption; BCB
governa a perna brasileira.

## 16. Riscos residuais

Mesmo com GENIUS: congestion, smart contract, custody, sanctions,
outages, secondary liquidity, depeg intraday, bank concentration e
cross-border enforceability.

## 17. Como memorizar

**GENIUS = permitted issuer + 1:1 liquid reserves + redemption +
disclosure + supervision.**

## Fontes

-   https://www.whitehouse.gov/briefings-statements/2025/07/the-president-signed-into-law-s-1582/
-   https://www.whitehouse.gov/fact-sheets/2025/07/fact-sheet-president-donald-trump-signs-genius-act-into-law/
-   https://www.congress.gov/
