# Resolução BCB 520/2025 --- Funcionamento das prestadoras de serviços de ativos virtuais

## 1. Função

A Resolução BCB 520 é uma das peças operacionais centrais do regime
brasileiro. Ela disciplina quem pode prestar serviços de ativos virtuais
e estabelece regras de constituição e funcionamento das SPSAVs.

## 2. Categorias

O regime diferencia atividades como intermediação e custódia e prevê
categorias de SPSAV. A classificação importa porque determina o conjunto
de atividades e responsabilidades aplicáveis.

## 3. O salto regulatório

A mudança conceitual é importante: uma operação cripto deixa de ser
vista apenas como uma empresa de tecnologia que mantém wallets e APIs e
passa a ser tratada como infraestrutura financeira regulada. Isso traz
expectativas de governança, controles internos, segurança,
transparência, relacionamento com clientes, gestão de riscos e PLD/FT.

## 4. Custódia

Custódia é particularmente sensível porque "ter a chave" equivale,
economicamente, a deter capacidade de movimentação do ativo. Uma
arquitetura institucional precisa tratar segregação, controle de chaves,
autorização de transações, recuperação, continuidade, reconciliação e
responsabilidades.

## 5. Intermediação

Na intermediação, tornam-se importantes execução, conflitos de
interesse, transparência, documentação das ordens, registros,
relacionamento com venues e proteção dos recursos/ativos do cliente.

## 6. Terceirização e tecnologia

Uso de cloud, custodiante externo, blockchain analytics, provedores de
wallet ou exchanges estrangeiras não elimina a responsabilidade da
instituição regulada. Third-party risk passa a ser parte do desenho do
produto.

## 7. PLD/FT

A natureza pseudônima e global das blockchains exige controles que
combinem KYC tradicional com monitoramento transacional e, quando
aplicável, análise on-chain. O objetivo não é apenas identificar o
cliente na entrada, mas compreender origem/destino e padrões de risco.

## 8. Implicação para arquitetura de sistemas

Um stack institucional tende a precisar de trilhas auditáveis para
cliente, ordem, execução, wallet, blockchain transaction hash,
contraparte, reconciliação, controles de limites e evidências de
compliance. Isso muda profundamente o desenho de OMS, custody layer e
settlement.

## 9. Exemplo

Cliente compra USDC contra BRL. A instituição precisa conseguir
reconstruir o fluxo: quem era o cliente, qual preço foi oferecido, onde
foi executado o hedge, de onde veio o USDC, qual wallet recebeu, qual
transação on-chain ocorreu e quais controles foram aplicados.

## 10. Como memorizar

**520 = como a PSAV funciona depois de entrar no perímetro.**

## 11. Fonte primária

-   Banco Central --- comunicado e acesso à regulamentação:
    https://www.bcb.gov.br/detalhenoticia/20918/nota

> Material educacional; não constitui parecer jurídico.
