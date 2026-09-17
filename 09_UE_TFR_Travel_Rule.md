# TFR --- Regulation (EU) 2023/1113 e Travel Rule

## Resumo executivo

O TFR estende a transferências de cripto a lógica de que **informação
sobre quem envia e recebe acompanha o valor**. Blockchain registra
`address A → address B`, mas não identidade civil. Travel Rule cria a
camada de identidade/compliance. As Guidelines da EBA são aplicáveis
desde 30/12/2024.

## 1. Problema

Banco: `João/Banco A → Maria/Banco B`.\
Blockchain: `0xABC → 0xDEF`.

A segunda prova movimentação entre endereços, não quem são as pessoas.

## 2. O que viaja

Informações exigidas sobre originador/beneficiário são obtidas e
transmitidas/associadas à transferência conforme o regime.

## 3. PII não vai para a blockchain

Travel Rule não significa gravar passaporte em Ethereum. Dados são
trocados por canais adequados entre participantes.

## 4. CASP originador

Obtém informações, verifica quando aplicável e assegura que a
transferência tenha os elementos necessários.

## 5. CASP beneficiário

Detecta dados ausentes/incompletos e possui procedimentos para executar,
suspender, rejeitar ou pedir informação adicional conforme risco/regras.

## 6. Intermediários

Fluxos com múltiplos participantes precisam preservar associação entre
mensagem regulatória e transferência.

## 7. Self-hosted wallets

Não há outro CASP do outro lado. Isso exige tratamento próprio e, em
certas condições, medidas adicionais para verificar ownership/control.

## 8. Verificação

Técnicas podem incluir assinatura de mensagem, micro-transfer ou outras
evidências apropriadas. Método precisa ser compatível com risco e
requisitos.

## 9. Travel Rule × KYT

Travel Rule: **quem?**\
Blockchain analytics: **qual histórico/risco on-chain?**

São complementares.

## 10. Sanções

O regime também se conecta a restrictive measures. Sanctions screening
pode exigir ações específicas além de AML probabilístico.

## 11. Interoperabilidade

Vários protocolos/vendors precisam descobrir VASP contraparte,
autenticar, trocar dados e casar mensagem off-chain com tx on-chain.

## 12. GDPR

É preciso equilibrar obrigação AML com minimização, segurança, retenção,
acesso e transferências internacionais de dados.

## 13. Exemplo CASP→CASP

On-chain: `wallet X → wallet Y`.\
Travel Rule: identidade de A → identidade de B.\
KYT: risk analysis.

## 14. CASP→self-hosted

Withdrawal para MetaMask própria não tem Exchange Y. O CASP aplica
política de self-hosted, verifica informações necessárias e avalia
risco.

## 15. Falha operacional

Trade executado mas Travel Rule message falha. O state machine de
settlement deve saber segurar, retransmitir, pedir dados, rejeitar ou
escalar.

## 16. Modelo de dados

Originator; beneficiary; VASP IDs; addresses; network; asset; amount; tx
hash; Travel Rule message ID; verification; sanctions/KYT; exception
reason.

## 17. Como memorizar

**Blockchain transfere valor; Travel Rule transfere contexto de
identidade.**

## Fontes

-   https://eur-lex.europa.eu/eli/reg/2023/1113/oj
-   https://www.eba.europa.eu/activities/single-rulebook/regulatory-activities/anti-money-laundering-and-countering-financing-terrorism/guidelines-information-requirements-relation-transfers-funds-and-certain-crypto-assets-transfers
