# Lei 14.478/2022 --- Marco Legal dos Ativos Virtuais no Brasil

## Resumo executivo

A Lei 14.478/2022 é a **lei-quadro brasileira dos serviços de ativos
virtuais**. Ela não tenta dizer como cada wallet deve funcionar ou como
cada transação deve ser reportada. Faz algo anterior: define o perímetro
jurídico básico, descreve o que é "ativo virtual" para seus fins,
identifica atividades de prestadores de serviços de ativos virtuais
(PSAV/VASP), exige autorização e estabelece princípios para a
regulamentação. O Decreto 11.563/2023 designou o Banco Central como
regulador principal das PSAVs, preservando a competência da CVM quando o
ativo for valor mobiliário.

A forma mais útil de memorizar é: **Lei 14.478 cria a fundação; BCB 519,
520 e 521 constroem grande parte do regime operacional.**

## 1. Por que a lei foi necessária

Antes dela, cripto não era "terra sem lei": já incidiam direito civil,
consumidor, tributação, legislação penal, PLD/FT e regras da CVM quando
houvesse valores mobiliários. Faltava, porém, um regime federal próprio
de autorização e supervisão da atividade profissional de exchange,
transferência e custódia de ativos virtuais.

A lei resolve três problemas: cria um gate regulatório; permite designar
autoridade supervisora; e constrói pontes com câmbio, capitais
internacionais e PLD/FT.

## 2. Conceito de ativo virtual

A definição é funcional: representação digital de valor negociável ou
transferível eletronicamente e utilizada para pagamentos ou
investimento, observadas exclusões legais.

A consequência é importante: **blockchain não é o teste jurídico**. Algo
não entra automaticamente porque usa DLT, nem sai porque usa banco de
dados tradicional.

A lei exclui categorias já tratadas por outros regimes, como moeda
nacional/estrangeira, moeda eletrônica nos termos próprios e valores
mobiliários. A finalidade é evitar dupla classificação automática.

## 3. Quem é PSAV

A lei olha especialmente para atividades realizadas **em nome de
terceiros**. Entre elas estão, em essência: - troca entre ativo virtual
e moeda; - troca entre ativos virtuais; - transferência; -
custódia/administração; - participação em serviços financeiros
relacionados à oferta ou venda de ativos virtuais.

Pense nos verbos: **converter, trocar, transferir, custodiar e
intermediar**.

Desenvolver software de wallet, isoladamente, não é igual a custodiar
ativos de clientes. Controlar chaves e executar transferências para
terceiros é economicamente outra atividade.

## 4. Autorização

A lei determina que prestadores somente podem funcionar no País mediante
autorização do órgão designado. O Decreto 11.563 atribuiu ao BCB a
competência para regular, autorizar e supervisionar PSAVs.

A pergunta de compliance muda de "há proibição?" para: 1. qual entidade
jurídica presta o serviço? 2. qual atividade exerce? 3. precisa de
autorização? 4. qual é seu status perante o BCB?

## 5. Princípios

A regulamentação deve observar livre iniciativa/concorrência,
governança, transparência, abordagem baseada em riscos, segurança da
informação, proteção de dados, proteção do consumidor, proteção da
poupança popular, solidez/eficiência e PLD/FT.

Esses princípios explicam por que normas posteriores tratam de controles
internos, segurança, segregação, registros e monitoramento.

## 6. BCB × CVM

A Lei 14.478 não substitui a Lei 6.385. Se um token for valor
mobiliário, a CVM continua competente.

Exemplos: - BTC spot não vira security apenas por estar em blockchain; -
ação tokenizada continua sendo ação; - token que represente contrato de
investimento coletivo pode ser valor mobiliário; - derivativo de cripto
pode acionar regime próprio.

A análise correta é **produto + direitos + atividade**, não a etiqueta
"crypto".

## 7. Câmbio

O art. 7º permite ao regulador determinar hipóteses em que operações com
ativos virtuais entram no mercado de câmbio ou nas regras de capitais
internacionais. Esse dispositivo é a base que depois ganha enorme
relevância na BCB 521.

Exemplo: `BRL → USDC → wallet no exterior`

Tecnologicamente é token transfer. Economicamente pode ser conversão e
transferência internacional de valor. O rail não necessariamente muda a
natureza financeira.

## 8. PLD/FT

A lei integra o setor ao ambiente de prevenção à lavagem. Na prática,
KYC de onboarding é só a primeira camada. Uma VASP institucional precisa
combinar identificação, beneficiário final, transaction monitoring,
sanções, análise de origem/destino e, quando apropriado, blockchain
analytics.

## 9. Dimensão penal

A lei também fortalece a resposta penal a fraudes envolvendo ativos
virtuais. É importante separar duas camadas: supervisão administrativa
da atividade e repressão criminal a fraude/lavagem.

## 10. O que a lei não resolve sozinha

Ela não detalha: - processo completo de autorização; - arquitetura de
custody; - funcionamento diário da SPSAV; - classificação cambial
detalhada; - tratamento prudencial bancário; - Travel Rule global; -
enquadramento de cada token como security.

Esses temas aparecem em BCB, CVM, Lei de Câmbio, PLD/FT e padrões
internacionais.

## 11. Fluxo mental para analisar um produto

1.  Qual é o ativo?
2.  Quais direitos ele dá?
3.  Qual serviço está sendo prestado?
4.  Quem é a entidade jurídica?
5.  Há autorização BCB?
6.  É valor mobiliário?
7.  Há transferência internacional/stablecoin referenciada a moeda?
8.  Quem controla custody/settlement?
9.  Quais obrigações de PLD/FT?
10. Há outras jurisdições?

## 12. Exemplo completo

Banco brasileiro vende USDC a empresa brasileira e envia a fornecedor em
Nova York. Há pelo menos quatro camadas: serviço de ativo virtual;
possível operação cambial/internacional; PLD/FT/sanções; e regime do
emissor/contraparte no exterior.

O hedge da mesa em USD/BRL e stablecoin/USD é outra camada. **Hedge
econômico não determina o enquadramento jurídico do cliente.**

## 13. Mapa normativo

`Lei 14.478` → cria o regime\
`Decreto 11.563` → designa BCB\
`BCB 519` → autorização\
`BCB 520` → funcionamento\
`BCB 521` → câmbio/capitais internacionais\
`CVM 40` → valores mobiliários

## 14. Cinco ideias para guardar

1.  É lei-quadro, não manual operacional.
2.  Serviços para terceiros são o núcleo.
3.  Autorização BCB é central.
4.  CVM preserva securities.
5.  Blockchain pode mudar o rail sem mudar a substância financeira.

## Fontes

-   Lei 14.478:
    https://www.planalto.gov.br/ccivil_03/\_ato2019-2022/2022/lei/l14478.htm
-   Decreto 11.563:
    https://www.planalto.gov.br/ccivil_03/\_ato2023-2026/2023/decreto/d11563.htm
