# Resolução BCB 521/2025 --- Ativos virtuais, câmbio e capitais internacionais

## Resumo executivo

A BCB 521 é a norma brasileira central para entender **stablecoin como
rail de FX**. Ela altera as Resoluções BCB 277, 278 e 279, que
implementam o Marco Legal do Câmbio, para incluir determinadas
atividades/operações com ativos virtuais no mercado de câmbio e
disciplinar situações de capitais brasileiros no exterior e estrangeiros
no País.

A ideia-chave: **usar blockchain não muda necessariamente a substância
econômica de uma operação internacional**.

## 1. Duas leis se encontram

A Lei 14.286/2021 modernizou câmbio. A Lei 14.478/2022 criou o marco de
ativos virtuais e autorizou o BCB a definir quando operações com esses
ativos entram no perímetro cambial. A 521 conecta os dois.

## 2. Por que stablecoin desafia a taxonomia

Tradicional: `BRL → FX → USD → wire`

Stablecoin: `BRL → USDC → blockchain → wallet`

Não há necessariamente wire em USD, mas pode existir conversão econômica
e transferência internacional de valor.

## 3. Efeito conceitual

Determinadas atividades com ativos virtuais passam a integrar o regime
de câmbio/capitais internacionais. Uma SPSAV pode ter de cumprir
simultaneamente regime de ativos virtuais, câmbio, PLD/FT e reporting.

## 4. Stablecoin referenciada a fiat

Token de USD não é juridicamente idêntico a depósito USD, mas também não
deve ser presumido fora de FX. A moeda de referência, função econômica e
fluxo importam.

## 5. Transferência internacional

Exemplo: - pagador no Brasil; - BRL na origem; - USDC adquirido; -
beneficiário em wallet no exterior.

Pergunte: quem converte? quem transfere? onde estão as partes? qual
finalidade? quem registra? quais dados são exigidos?

## 6. Conversion leg × transfer leg

Um produto pode conter: - `BRL ↔ stablecoin`; -
`wallet Brasil ↔ wallet exterior`.

Sistemas não deveriam colapsar tudo em "crypto trade". As pernas podem
ter obrigações distintas.

## 7. Capitais internacionais

Posições/transferências cross-border podem também ser relevantes para
capitais brasileiros no exterior/estrangeiros no País, conforme
natureza, valores e regras aplicáveis. Wallet address sozinho não
informa residência ou finalidade.

## 8. Papel da SPSAV

Entrar em fluxo cambial não dá licença universal. Deve-se mapear
entidade e permissão para fiat conversion, crypto conversion, transfer,
custody, settlement e hedge.

## 9. Pricing ≠ classificação

Uma mesa pode precificar: `BTCBRL ≈ BTCUSD × USDBRL` e hedgear BTC em
perp e FX em DOL/WDO. Isso trata market risk; não define o enquadramento
jurídico do trade do cliente.

## 10. Modelo de dados

Campos úteis: cliente/residência; beneficiário; entidade; ativo; moeda
de referência; quantidade; preço; equivalente BRL/USD; wallets; rede; tx
hash; jurisdição; finalidade; timestamps; venue; custodiante; hedge;
status de compliance.

## 11. Caso A --- compra doméstica

Cliente compra USDC e mantém custody no Brasil. Existe serviço de ativo
virtual e deve-se analisar as hipóteses cambiais aplicáveis; não assuma
identidade jurídica USDC=USD nem exclusão automática.

## 12. Caso B --- remessa

Empresa paga fornecedor estrangeiro em USDC. Economicamente compete com
remessa tradicional. A infraestrutura deve tratar o fluxo internacional
completo, não só um withdrawal.

## 13. Caso C --- afiliada offshore

Entidade brasileira faceia cliente; afiliada offshore fornece liquidez.
Pergunte sobre intercompany, hedge, movimentação de ativo, capitais
internacionais e contraparte nos registros.

## 14. Riscos além do delta

Mesmo mesa economicamente flat pode sofrer: - depeg; - redemption
fechado; - congestion; - mismatch 24/7 × cut-off bancário; - settlement
failure; - contraparte regulatoriamente indisponível.

## 15. Perguntas de produto

-   stablecoin é investimento, pagamento ou rail?
-   quem converte?
-   há transferência internacional?
-   quem é beneficiário?
-   quem reporta?
-   como wallet data liga ao booking?
-   como falhas/reversões são tratadas?
-   como gas entra no preço?
-   como se comprova finalidade?

## 16. Como memorizar

**BCB 521 = crypto não é uma rota de fuga do câmbio.** O rail pode
mudar; a substância econômica continua relevante.

## Fontes

-   https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?numero=521&tipo=Resolu%C3%A7%C3%A3o+BCB
-   https://www.planalto.gov.br/ccivil_03/\_ato2019-2022/2021/lei/l14286.htm
