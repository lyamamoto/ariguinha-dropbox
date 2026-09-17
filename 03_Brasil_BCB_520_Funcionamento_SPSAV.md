# Resolução BCB 520/2025 --- Funcionamento das prestadoras de ativos virtuais

## Resumo executivo

A BCB 520 é uma das peças operacionais centrais do regime brasileiro.
Ela disciplina constituição e funcionamento das prestadoras, atividades,
controles e transição. Para bancos, o art. 91 é especialmente
importante: a partir de **30/10/2026**, instituições autorizadas pelo
BCB não podem realizar ou viabilizar operações de ativos virtuais com
prestadores que não estejam autorizados ou em processo de autorização no
País, salvo hipóteses permitidas.

## 1. Mudança de paradigma

Custody, exchange e intermediação deixam de ser vistas apenas como
features de software. Quando prestadas profissionalmente a terceiros,
são serviços regulados com responsabilidades institucionais.

## 2. Decomposição de funções

Uma interface única pode esconder várias atividades:
`depósito fiat → ordem → execução → saldo → custody → withdrawal`.

Regulação precisa saber quem responde por cada função. É por isso que
categorias e atividades importam.

## 3. Intermediação

Riscos: execução, conflito de interesse, preço, uso indevido de
informação, registro, contraparte e settlement. A trilha institucional
deve preservar:
`order → quote → acceptance → execution → hedge → settlement → reconciliation`.

## 4. Custódia

Controle da private key pode equivaler ao poder de movimentar o ativo.
Controles relevantes: - segregação; - hot/warm/cold architecture; -
MPC/multisig; - whitelisting; - dual control; - limites; - key
recovery; - reconciliação on-chain × ledger; - forks/incidentes.

A norma não precisa escolher uma tecnologia para exigir accountability.

## 5. Ativos de clientes

Recursos próprios e de clientes precisam ser tratados de forma coerente
com o regime. Uma wallet omnibus não elimina a necessidade de ledger
interno preciso e reconciliação.

## 6. Governança

SPSAV precisa operar como instituição controlada: políticas, owners,
escalonamento, auditoria, risco, compliance e evidências. "O código faz
isso" não substitui governança.

## 7. Cyber e risco operacional

Superfícies típicas: - private keys; - API keys; - smart contracts; -
bridges; - signing infrastructure; - phishing; - withdrawal attacks.

Controles tradicionais são necessários, mas não suficientes.

## 8. Terceiros

Cloud, custody tech, exchange offshore, Travel Rule e blockchain
analytics podem ser críticos. Outsourcing transfere execução, não
necessariamente responsabilidade. É preciso mapear dados, localização,
SLA, monitoramento, continuidade e exit plan.

## 9. Cliente e transparência

Cliente que vê "saldo BTC" precisa entender a natureza do direito: ativo
segregado? saldo em ledger? quem custodia? quais riscos? Como ocorre
withdrawal?

## 10. PLD/FT

KYC deve ser combinado com sanctions screening, transaction monitoring,
wallet analytics, políticas para self-hosted wallets, investigação e
registros.

## 11. Reconciliação

Três verdades precisam bater: 1. ledger do cliente; 2. posição da
instituição; 3. blockchain/venue/custodiante.

Divergência pode ser atraso, bug, booking incorreto ou perda.

## 12. Art. 91 e 30/10/2026

A vedação alcança, entre outros, negociação, intermediação, custody,
câmbio, contas de pagamento e transações usadas para viabilizar
operações de ativos virtuais com prestadores fora do status permitido.

Isso afeta **banking rails**, não só trading direto.

## 13. Consequência para bancos

Não basta olhar um PIX isolado se ele é parte conhecida de serviço de
VASP. Onboarding e monitoring precisam compreender finalidade, entidade
e status regulatório.

## 14. Exemplo end-to-end

Cliente compra BTCBRL: 1. KYC/eligibility; 2. quote; 3. aceite; 4.
booking; 5. hedge BTC; 6. hedge FX se necessário; 7. custody/alocação;
8. reconciliação; 9. AML/KYT; 10. audit trail.

Cada etapa precisa de owner e controles.

## 15. Perguntas para produto institucional

-   quem é principal do trade?
-   quem controla inventory?
-   onde fica custody?
-   quais venues são permitidos?
-   entidade estrangeira pode ser usada?
-   como reconcilia?
-   quem bloqueia withdrawal?
-   como trata fork/airdrop?
-   como audita preço/hedge?
-   como monitora status regulatório?

## 16. Como memorizar

**520 = operating system regulatório das SPSAVs.**\
E **30/10/2026** é um marco operacional para relacionamento de
instituições BCB com prestadores de ativos virtuais.

## Fonte

-   https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?numero=520&tipo=Resolu%C3%A7%C3%A3o+BCB
