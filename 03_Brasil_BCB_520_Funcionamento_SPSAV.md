# Resolução BCB 520/2025 --- Constituição e funcionamento das SPSAVs

> **Guia comentado e didático --- referência: 17 de setembro de 2026**

## Como ler este documento

Este arquivo foi escrito para ser autossuficiente como material de
estudo. O objetivo não é reproduzir o normativo artigo por artigo nem
substituir aconselhamento jurídico, mas permitir que o leitor compreenda
sua lógica, arquitetura e consequências práticas. Conceitos que só fazem
sentido em conjunto são tratados em conjunto; natureza jurídica, função
econômica, risco e implementação tecnológica são separados quando
necessário.

**Tese central:** A BCB 520 é o núcleo operacional brasileiro: define
ativos regulados, modalidades de prestadoras, atividades, requisitos de
funcionamento, controles e transição, transformando exchange,
intermediação e custody em responsabilidades institucionais.

Os exemplos envolvendo bancos, exchanges, custodians, stablecoins,
wallets e mesas de tesouraria tornam a regra concreta. Eles não são
conclusões jurídicas automáticas para qualquer operação real. Em
implementação, é necessário conferir texto oficial vigente, atos
complementares, transições e fatos específicos.

## 1. Arquitetura geral

A norma parte da Lei 14.478 e organiza universo das SPSAVs, ativos e
modalidades. Esse ponto deve ser lido como parte da mecânica do regime,
e não como detalhe isolado. Em ativos virtuais, uma única experiência de
usuário pode combinar execução, custódia, transferência, conversão
monetária e serviços de terceiros em diferentes jurisdições; por isso, a
regra precisa ser aplicada à função econômica concreta e à entidade que
efetivamente a desempenha.

Do ponto de vista regulatório, a instituição precisa converter essa
ideia em classificação operacional verificável. Não basta uma política
afirmar que o tema foi considerado: produto, entidade jurídica, fluxo de
recursos e ativos, responsáveis e registros precisam demonstrar como a
regra foi aplicada. Isso exige separar o que é classificação do
instrumento, autorização da entidade, obrigação de conduta, controle
operacional e eventual obrigação de informação ou reporte.

Uma forma útil de testar a implementação é reconstruir uma operação
depois do fato. O revisor deveria conseguir identificar cliente e
contraparte, ativo, serviço, entidade que assumiu a obrigação, controles
executados, local de execução e settlement e exceções aprovadas. Se a
resposta depende de conhecimento informal da mesa ou de juntar
manualmente bases sem identificador comum, existe uma lacuna entre a
norma e o modelo operacional.

Também é importante não confundir equivalência econômica com identidade
jurídica. Dois fluxos podem produzir exposição financeira semelhante e
cair em regimes diferentes; inversamente, trocar o rail tecnológico pode
não mudar a substância regulatória. Blockchain, API, smart contract ou
stablecoin descrevem componentes técnicos. O enquadramento continua
dependendo de direitos, funções, participantes e fluxo econômico.

Para uma instituição financeira, o resultado esperado é uma cadeia de
evidências: regra aplicável → decisão de enquadramento → controle
preventivo → execução → registro → reconciliação → monitoramento e,
quando necessário, reporte. Essa cadeia torna a regra repetível e
auditável e permite adaptar o produto quando norma, interpretação
supervisora ou arquitetura tecnológica mudarem.

## 2. Ativos regulados

O art. 3º remete ao conceito legal e exclusões da Lei 14.478, de modo
que classificação do ativo continua sendo primeiro passo. Esse ponto
deve ser lido como parte da mecânica do regime, e não como detalhe
isolado. Em ativos virtuais, uma única experiência de usuário pode
combinar execução, custódia, transferência, conversão monetária e
serviços de terceiros em diferentes jurisdições; por isso, a regra
precisa ser aplicada à função econômica concreta e à entidade que
efetivamente a desempenha.

Do ponto de vista regulatório, a instituição precisa converter essa
ideia em classificação operacional verificável. Não basta uma política
afirmar que o tema foi considerado: produto, entidade jurídica, fluxo de
recursos e ativos, responsáveis e registros precisam demonstrar como a
regra foi aplicada. Isso exige separar o que é classificação do
instrumento, autorização da entidade, obrigação de conduta, controle
operacional e eventual obrigação de informação ou reporte.

Uma forma útil de testar a implementação é reconstruir uma operação
depois do fato. O revisor deveria conseguir identificar cliente e
contraparte, ativo, serviço, entidade que assumiu a obrigação, controles
executados, local de execução e settlement e exceções aprovadas. Se a
resposta depende de conhecimento informal da mesa ou de juntar
manualmente bases sem identificador comum, existe uma lacuna entre a
norma e o modelo operacional.

Também é importante não confundir equivalência econômica com identidade
jurídica. Dois fluxos podem produzir exposição financeira semelhante e
cair em regimes diferentes; inversamente, trocar o rail tecnológico pode
não mudar a substância regulatória. Blockchain, API, smart contract ou
stablecoin descrevem componentes técnicos. O enquadramento continua
dependendo de direitos, funções, participantes e fluxo econômico.

Para uma instituição financeira, o resultado esperado é uma cadeia de
evidências: regra aplicável → decisão de enquadramento → controle
preventivo → execução → registro → reconciliação → monitoramento e,
quando necessário, reporte. Essa cadeia torna a regra repetível e
auditável e permite adaptar o produto quando norma, interpretação
supervisora ou arquitetura tecnológica mudarem.

## 3. Três modalidades

Intermediárias, custodiantes e corretoras possuem escopos e regras de
combinação de atividades. Esse ponto deve ser lido como parte da
mecânica do regime, e não como detalhe isolado. Em ativos virtuais, uma
única experiência de usuário pode combinar execução, custódia,
transferência, conversão monetária e serviços de terceiros em diferentes
jurisdições; por isso, a regra precisa ser aplicada à função econômica
concreta e à entidade que efetivamente a desempenha.

Do ponto de vista regulatório, a instituição precisa converter essa
ideia em classificação operacional verificável. Não basta uma política
afirmar que o tema foi considerado: produto, entidade jurídica, fluxo de
recursos e ativos, responsáveis e registros precisam demonstrar como a
regra foi aplicada. Isso exige separar o que é classificação do
instrumento, autorização da entidade, obrigação de conduta, controle
operacional e eventual obrigação de informação ou reporte.

Uma forma útil de testar a implementação é reconstruir uma operação
depois do fato. O revisor deveria conseguir identificar cliente e
contraparte, ativo, serviço, entidade que assumiu a obrigação, controles
executados, local de execução e settlement e exceções aprovadas. Se a
resposta depende de conhecimento informal da mesa ou de juntar
manualmente bases sem identificador comum, existe uma lacuna entre a
norma e o modelo operacional.

Também é importante não confundir equivalência econômica com identidade
jurídica. Dois fluxos podem produzir exposição financeira semelhante e
cair em regimes diferentes; inversamente, trocar o rail tecnológico pode
não mudar a substância regulatória. Blockchain, API, smart contract ou
stablecoin descrevem componentes técnicos. O enquadramento continua
dependendo de direitos, funções, participantes e fluxo econômico.

Para uma instituição financeira, o resultado esperado é uma cadeia de
evidências: regra aplicável → decisão de enquadramento → controle
preventivo → execução → registro → reconciliação → monitoramento e,
quando necessário, reporte. Essa cadeia torna a regra repetível e
auditável e permite adaptar o produto quando norma, interpretação
supervisora ou arquitetura tecnológica mudarem.

## 4. Intermediação

Relacionar cliente e mercado traz riscos de execução, preço, conflitos,
registro, contraparte e settlement. Esse ponto deve ser lido como parte
da mecânica do regime, e não como detalhe isolado. Em ativos virtuais,
uma única experiência de usuário pode combinar execução, custódia,
transferência, conversão monetária e serviços de terceiros em diferentes
jurisdições; por isso, a regra precisa ser aplicada à função econômica
concreta e à entidade que efetivamente a desempenha.

Do ponto de vista regulatório, a instituição precisa converter essa
ideia em classificação operacional verificável. Não basta uma política
afirmar que o tema foi considerado: produto, entidade jurídica, fluxo de
recursos e ativos, responsáveis e registros precisam demonstrar como a
regra foi aplicada. Isso exige separar o que é classificação do
instrumento, autorização da entidade, obrigação de conduta, controle
operacional e eventual obrigação de informação ou reporte.

Uma forma útil de testar a implementação é reconstruir uma operação
depois do fato. O revisor deveria conseguir identificar cliente e
contraparte, ativo, serviço, entidade que assumiu a obrigação, controles
executados, local de execução e settlement e exceções aprovadas. Se a
resposta depende de conhecimento informal da mesa ou de juntar
manualmente bases sem identificador comum, existe uma lacuna entre a
norma e o modelo operacional.

Também é importante não confundir equivalência econômica com identidade
jurídica. Dois fluxos podem produzir exposição financeira semelhante e
cair em regimes diferentes; inversamente, trocar o rail tecnológico pode
não mudar a substância regulatória. Blockchain, API, smart contract ou
stablecoin descrevem componentes técnicos. O enquadramento continua
dependendo de direitos, funções, participantes e fluxo econômico.

Para uma instituição financeira, o resultado esperado é uma cadeia de
evidências: regra aplicável → decisão de enquadramento → controle
preventivo → execução → registro → reconciliação → monitoramento e,
quando necessário, reporte. Essa cadeia torna a regra repetível e
auditável e permite adaptar o produto quando norma, interpretação
supervisora ou arquitetura tecnológica mudarem.

## 5. Custódia

Controle e proteção de chaves e ativos exigem reconciliação, acesso,
continuidade e responsabilidade. Esse ponto deve ser lido como parte da
mecânica do regime, e não como detalhe isolado. Em ativos virtuais, uma
única experiência de usuário pode combinar execução, custódia,
transferência, conversão monetária e serviços de terceiros em diferentes
jurisdições; por isso, a regra precisa ser aplicada à função econômica
concreta e à entidade que efetivamente a desempenha.

Do ponto de vista regulatório, a instituição precisa converter essa
ideia em classificação operacional verificável. Não basta uma política
afirmar que o tema foi considerado: produto, entidade jurídica, fluxo de
recursos e ativos, responsáveis e registros precisam demonstrar como a
regra foi aplicada. Isso exige separar o que é classificação do
instrumento, autorização da entidade, obrigação de conduta, controle
operacional e eventual obrigação de informação ou reporte.

Uma forma útil de testar a implementação é reconstruir uma operação
depois do fato. O revisor deveria conseguir identificar cliente e
contraparte, ativo, serviço, entidade que assumiu a obrigação, controles
executados, local de execução e settlement e exceções aprovadas. Se a
resposta depende de conhecimento informal da mesa ou de juntar
manualmente bases sem identificador comum, existe uma lacuna entre a
norma e o modelo operacional.

Também é importante não confundir equivalência econômica com identidade
jurídica. Dois fluxos podem produzir exposição financeira semelhante e
cair em regimes diferentes; inversamente, trocar o rail tecnológico pode
não mudar a substância regulatória. Blockchain, API, smart contract ou
stablecoin descrevem componentes técnicos. O enquadramento continua
dependendo de direitos, funções, participantes e fluxo econômico.

Para uma instituição financeira, o resultado esperado é uma cadeia de
evidências: regra aplicável → decisão de enquadramento → controle
preventivo → execução → registro → reconciliação → monitoramento e,
quando necessário, reporte. Essa cadeia torna a regra repetível e
auditável e permite adaptar o produto quando norma, interpretação
supervisora ou arquitetura tecnológica mudarem.

## 6. Corretora

Combinação de funções aumenta conveniência e também conflitos que
precisam ser governados. Esse ponto deve ser lido como parte da mecânica
do regime, e não como detalhe isolado. Em ativos virtuais, uma única
experiência de usuário pode combinar execução, custódia, transferência,
conversão monetária e serviços de terceiros em diferentes jurisdições;
por isso, a regra precisa ser aplicada à função econômica concreta e à
entidade que efetivamente a desempenha.

Do ponto de vista regulatório, a instituição precisa converter essa
ideia em classificação operacional verificável. Não basta uma política
afirmar que o tema foi considerado: produto, entidade jurídica, fluxo de
recursos e ativos, responsáveis e registros precisam demonstrar como a
regra foi aplicada. Isso exige separar o que é classificação do
instrumento, autorização da entidade, obrigação de conduta, controle
operacional e eventual obrigação de informação ou reporte.

Uma forma útil de testar a implementação é reconstruir uma operação
depois do fato. O revisor deveria conseguir identificar cliente e
contraparte, ativo, serviço, entidade que assumiu a obrigação, controles
executados, local de execução e settlement e exceções aprovadas. Se a
resposta depende de conhecimento informal da mesa ou de juntar
manualmente bases sem identificador comum, existe uma lacuna entre a
norma e o modelo operacional.

Também é importante não confundir equivalência econômica com identidade
jurídica. Dois fluxos podem produzir exposição financeira semelhante e
cair em regimes diferentes; inversamente, trocar o rail tecnológico pode
não mudar a substância regulatória. Blockchain, API, smart contract ou
stablecoin descrevem componentes técnicos. O enquadramento continua
dependendo de direitos, funções, participantes e fluxo econômico.

Para uma instituição financeira, o resultado esperado é uma cadeia de
evidências: regra aplicável → decisão de enquadramento → controle
preventivo → execução → registro → reconciliação → monitoramento e,
quando necessário, reporte. Essa cadeia torna a regra repetível e
auditável e permite adaptar o produto quando norma, interpretação
supervisora ou arquitetura tecnológica mudarem.

## 7. Segregação de funções

Trading próprio, execução de cliente e custody precisam de controles
quando coexistem. Esse ponto deve ser lido como parte da mecânica do
regime, e não como detalhe isolado. Em ativos virtuais, uma única
experiência de usuário pode combinar execução, custódia, transferência,
conversão monetária e serviços de terceiros em diferentes jurisdições;
por isso, a regra precisa ser aplicada à função econômica concreta e à
entidade que efetivamente a desempenha.

Do ponto de vista regulatório, a instituição precisa converter essa
ideia em classificação operacional verificável. Não basta uma política
afirmar que o tema foi considerado: produto, entidade jurídica, fluxo de
recursos e ativos, responsáveis e registros precisam demonstrar como a
regra foi aplicada. Isso exige separar o que é classificação do
instrumento, autorização da entidade, obrigação de conduta, controle
operacional e eventual obrigação de informação ou reporte.

Uma forma útil de testar a implementação é reconstruir uma operação
depois do fato. O revisor deveria conseguir identificar cliente e
contraparte, ativo, serviço, entidade que assumiu a obrigação, controles
executados, local de execução e settlement e exceções aprovadas. Se a
resposta depende de conhecimento informal da mesa ou de juntar
manualmente bases sem identificador comum, existe uma lacuna entre a
norma e o modelo operacional.

Também é importante não confundir equivalência econômica com identidade
jurídica. Dois fluxos podem produzir exposição financeira semelhante e
cair em regimes diferentes; inversamente, trocar o rail tecnológico pode
não mudar a substância regulatória. Blockchain, API, smart contract ou
stablecoin descrevem componentes técnicos. O enquadramento continua
dependendo de direitos, funções, participantes e fluxo econômico.

Para uma instituição financeira, o resultado esperado é uma cadeia de
evidências: regra aplicável → decisão de enquadramento → controle
preventivo → execução → registro → reconciliação → monitoramento e,
quando necessário, reporte. Essa cadeia torna a regra repetível e
auditável e permite adaptar o produto quando norma, interpretação
supervisora ou arquitetura tecnológica mudarem.

## 8. Ativos de clientes

Wallet omnibus não elimina necessidade de ledger interno capaz de
atribuir direitos inequivocamente. Esse ponto deve ser lido como parte
da mecânica do regime, e não como detalhe isolado. Em ativos virtuais,
uma única experiência de usuário pode combinar execução, custódia,
transferência, conversão monetária e serviços de terceiros em diferentes
jurisdições; por isso, a regra precisa ser aplicada à função econômica
concreta e à entidade que efetivamente a desempenha.

Do ponto de vista regulatório, a instituição precisa converter essa
ideia em classificação operacional verificável. Não basta uma política
afirmar que o tema foi considerado: produto, entidade jurídica, fluxo de
recursos e ativos, responsáveis e registros precisam demonstrar como a
regra foi aplicada. Isso exige separar o que é classificação do
instrumento, autorização da entidade, obrigação de conduta, controle
operacional e eventual obrigação de informação ou reporte.

Uma forma útil de testar a implementação é reconstruir uma operação
depois do fato. O revisor deveria conseguir identificar cliente e
contraparte, ativo, serviço, entidade que assumiu a obrigação, controles
executados, local de execução e settlement e exceções aprovadas. Se a
resposta depende de conhecimento informal da mesa ou de juntar
manualmente bases sem identificador comum, existe uma lacuna entre a
norma e o modelo operacional.

Também é importante não confundir equivalência econômica com identidade
jurídica. Dois fluxos podem produzir exposição financeira semelhante e
cair em regimes diferentes; inversamente, trocar o rail tecnológico pode
não mudar a substância regulatória. Blockchain, API, smart contract ou
stablecoin descrevem componentes técnicos. O enquadramento continua
dependendo de direitos, funções, participantes e fluxo econômico.

Para uma instituição financeira, o resultado esperado é uma cadeia de
evidências: regra aplicável → decisão de enquadramento → controle
preventivo → execução → registro → reconciliação → monitoramento e,
quando necessário, reporte. Essa cadeia torna a regra repetível e
auditável e permite adaptar o produto quando norma, interpretação
supervisora ou arquitetura tecnológica mudarem.

## 9. Private keys

Hot/cold, MPC, multisig, allowlists, key recovery e dual control são
escolhas técnicas que precisam produzir segurança e auditabilidade. Esse
ponto deve ser lido como parte da mecânica do regime, e não como detalhe
isolado. Em ativos virtuais, uma única experiência de usuário pode
combinar execução, custódia, transferência, conversão monetária e
serviços de terceiros em diferentes jurisdições; por isso, a regra
precisa ser aplicada à função econômica concreta e à entidade que
efetivamente a desempenha.

Do ponto de vista regulatório, a instituição precisa converter essa
ideia em classificação operacional verificável. Não basta uma política
afirmar que o tema foi considerado: produto, entidade jurídica, fluxo de
recursos e ativos, responsáveis e registros precisam demonstrar como a
regra foi aplicada. Isso exige separar o que é classificação do
instrumento, autorização da entidade, obrigação de conduta, controle
operacional e eventual obrigação de informação ou reporte.

Uma forma útil de testar a implementação é reconstruir uma operação
depois do fato. O revisor deveria conseguir identificar cliente e
contraparte, ativo, serviço, entidade que assumiu a obrigação, controles
executados, local de execução e settlement e exceções aprovadas. Se a
resposta depende de conhecimento informal da mesa ou de juntar
manualmente bases sem identificador comum, existe uma lacuna entre a
norma e o modelo operacional.

Também é importante não confundir equivalência econômica com identidade
jurídica. Dois fluxos podem produzir exposição financeira semelhante e
cair em regimes diferentes; inversamente, trocar o rail tecnológico pode
não mudar a substância regulatória. Blockchain, API, smart contract ou
stablecoin descrevem componentes técnicos. O enquadramento continua
dependendo de direitos, funções, participantes e fluxo econômico.

Para uma instituição financeira, o resultado esperado é uma cadeia de
evidências: regra aplicável → decisão de enquadramento → controle
preventivo → execução → registro → reconciliação → monitoramento e,
quando necessário, reporte. Essa cadeia torna a regra repetível e
auditável e permite adaptar o produto quando norma, interpretação
supervisora ou arquitetura tecnológica mudarem.

## 10. Trilha de ordens

Order, quote, acceptance, execution, hedge, settlement e reconciliation
devem ser reconstruíveis. Esse ponto deve ser lido como parte da
mecânica do regime, e não como detalhe isolado. Em ativos virtuais, uma
única experiência de usuário pode combinar execução, custódia,
transferência, conversão monetária e serviços de terceiros em diferentes
jurisdições; por isso, a regra precisa ser aplicada à função econômica
concreta e à entidade que efetivamente a desempenha.

Do ponto de vista regulatório, a instituição precisa converter essa
ideia em classificação operacional verificável. Não basta uma política
afirmar que o tema foi considerado: produto, entidade jurídica, fluxo de
recursos e ativos, responsáveis e registros precisam demonstrar como a
regra foi aplicada. Isso exige separar o que é classificação do
instrumento, autorização da entidade, obrigação de conduta, controle
operacional e eventual obrigação de informação ou reporte.

Uma forma útil de testar a implementação é reconstruir uma operação
depois do fato. O revisor deveria conseguir identificar cliente e
contraparte, ativo, serviço, entidade que assumiu a obrigação, controles
executados, local de execução e settlement e exceções aprovadas. Se a
resposta depende de conhecimento informal da mesa ou de juntar
manualmente bases sem identificador comum, existe uma lacuna entre a
norma e o modelo operacional.

Também é importante não confundir equivalência econômica com identidade
jurídica. Dois fluxos podem produzir exposição financeira semelhante e
cair em regimes diferentes; inversamente, trocar o rail tecnológico pode
não mudar a substância regulatória. Blockchain, API, smart contract ou
stablecoin descrevem componentes técnicos. O enquadramento continua
dependendo de direitos, funções, participantes e fluxo econômico.

Para uma instituição financeira, o resultado esperado é uma cadeia de
evidências: regra aplicável → decisão de enquadramento → controle
preventivo → execução → registro → reconciliação → monitoramento e,
quando necessário, reporte. Essa cadeia torna a regra repetível e
auditável e permite adaptar o produto quando norma, interpretação
supervisora ou arquitetura tecnológica mudarem.

## 11. Governança

Políticas, owners, linhas de defesa, auditoria e escalonamento
transformam software em operação controlada. Esse ponto deve ser lido
como parte da mecânica do regime, e não como detalhe isolado. Em ativos
virtuais, uma única experiência de usuário pode combinar execução,
custódia, transferência, conversão monetária e serviços de terceiros em
diferentes jurisdições; por isso, a regra precisa ser aplicada à função
econômica concreta e à entidade que efetivamente a desempenha.

Do ponto de vista regulatório, a instituição precisa converter essa
ideia em classificação operacional verificável. Não basta uma política
afirmar que o tema foi considerado: produto, entidade jurídica, fluxo de
recursos e ativos, responsáveis e registros precisam demonstrar como a
regra foi aplicada. Isso exige separar o que é classificação do
instrumento, autorização da entidade, obrigação de conduta, controle
operacional e eventual obrigação de informação ou reporte.

Uma forma útil de testar a implementação é reconstruir uma operação
depois do fato. O revisor deveria conseguir identificar cliente e
contraparte, ativo, serviço, entidade que assumiu a obrigação, controles
executados, local de execução e settlement e exceções aprovadas. Se a
resposta depende de conhecimento informal da mesa ou de juntar
manualmente bases sem identificador comum, existe uma lacuna entre a
norma e o modelo operacional.

Também é importante não confundir equivalência econômica com identidade
jurídica. Dois fluxos podem produzir exposição financeira semelhante e
cair em regimes diferentes; inversamente, trocar o rail tecnológico pode
não mudar a substância regulatória. Blockchain, API, smart contract ou
stablecoin descrevem componentes técnicos. O enquadramento continua
dependendo de direitos, funções, participantes e fluxo econômico.

Para uma instituição financeira, o resultado esperado é uma cadeia de
evidências: regra aplicável → decisão de enquadramento → controle
preventivo → execução → registro → reconciliação → monitoramento e,
quando necessário, reporte. Essa cadeia torna a regra repetível e
auditável e permite adaptar o produto quando norma, interpretação
supervisora ou arquitetura tecnológica mudarem.

## 12. Cyber

Private keys, APIs, smart contracts, bridges e withdrawals criam
superfícies de ataque específicas. Esse ponto deve ser lido como parte
da mecânica do regime, e não como detalhe isolado. Em ativos virtuais,
uma única experiência de usuário pode combinar execução, custódia,
transferência, conversão monetária e serviços de terceiros em diferentes
jurisdições; por isso, a regra precisa ser aplicada à função econômica
concreta e à entidade que efetivamente a desempenha.

Do ponto de vista regulatório, a instituição precisa converter essa
ideia em classificação operacional verificável. Não basta uma política
afirmar que o tema foi considerado: produto, entidade jurídica, fluxo de
recursos e ativos, responsáveis e registros precisam demonstrar como a
regra foi aplicada. Isso exige separar o que é classificação do
instrumento, autorização da entidade, obrigação de conduta, controle
operacional e eventual obrigação de informação ou reporte.

Uma forma útil de testar a implementação é reconstruir uma operação
depois do fato. O revisor deveria conseguir identificar cliente e
contraparte, ativo, serviço, entidade que assumiu a obrigação, controles
executados, local de execução e settlement e exceções aprovadas. Se a
resposta depende de conhecimento informal da mesa ou de juntar
manualmente bases sem identificador comum, existe uma lacuna entre a
norma e o modelo operacional.

Também é importante não confundir equivalência econômica com identidade
jurídica. Dois fluxos podem produzir exposição financeira semelhante e
cair em regimes diferentes; inversamente, trocar o rail tecnológico pode
não mudar a substância regulatória. Blockchain, API, smart contract ou
stablecoin descrevem componentes técnicos. O enquadramento continua
dependendo de direitos, funções, participantes e fluxo econômico.

Para uma instituição financeira, o resultado esperado é uma cadeia de
evidências: regra aplicável → decisão de enquadramento → controle
preventivo → execução → registro → reconciliação → monitoramento e,
quando necessário, reporte. Essa cadeia torna a regra repetível e
auditável e permite adaptar o produto quando norma, interpretação
supervisora ou arquitetura tecnológica mudarem.

## 13. Terceirização

Cloud, custody tech, analytics e venues exigem seleção, monitoramento,
continuidade e exit plan. Esse ponto deve ser lido como parte da
mecânica do regime, e não como detalhe isolado. Em ativos virtuais, uma
única experiência de usuário pode combinar execução, custódia,
transferência, conversão monetária e serviços de terceiros em diferentes
jurisdições; por isso, a regra precisa ser aplicada à função econômica
concreta e à entidade que efetivamente a desempenha.

Do ponto de vista regulatório, a instituição precisa converter essa
ideia em classificação operacional verificável. Não basta uma política
afirmar que o tema foi considerado: produto, entidade jurídica, fluxo de
recursos e ativos, responsáveis e registros precisam demonstrar como a
regra foi aplicada. Isso exige separar o que é classificação do
instrumento, autorização da entidade, obrigação de conduta, controle
operacional e eventual obrigação de informação ou reporte.

Uma forma útil de testar a implementação é reconstruir uma operação
depois do fato. O revisor deveria conseguir identificar cliente e
contraparte, ativo, serviço, entidade que assumiu a obrigação, controles
executados, local de execução e settlement e exceções aprovadas. Se a
resposta depende de conhecimento informal da mesa ou de juntar
manualmente bases sem identificador comum, existe uma lacuna entre a
norma e o modelo operacional.

Também é importante não confundir equivalência econômica com identidade
jurídica. Dois fluxos podem produzir exposição financeira semelhante e
cair em regimes diferentes; inversamente, trocar o rail tecnológico pode
não mudar a substância regulatória. Blockchain, API, smart contract ou
stablecoin descrevem componentes técnicos. O enquadramento continua
dependendo de direitos, funções, participantes e fluxo econômico.

Para uma instituição financeira, o resultado esperado é uma cadeia de
evidências: regra aplicável → decisão de enquadramento → controle
preventivo → execução → registro → reconciliação → monitoramento e,
quando necessário, reporte. Essa cadeia torna a regra repetível e
auditável e permite adaptar o produto quando norma, interpretação
supervisora ou arquitetura tecnológica mudarem.

## 14. Transparência

Cliente precisa compreender natureza do serviço, riscos, custody,
execução, taxas e direitos. Esse ponto deve ser lido como parte da
mecânica do regime, e não como detalhe isolado. Em ativos virtuais, uma
única experiência de usuário pode combinar execução, custódia,
transferência, conversão monetária e serviços de terceiros em diferentes
jurisdições; por isso, a regra precisa ser aplicada à função econômica
concreta e à entidade que efetivamente a desempenha.

Do ponto de vista regulatório, a instituição precisa converter essa
ideia em classificação operacional verificável. Não basta uma política
afirmar que o tema foi considerado: produto, entidade jurídica, fluxo de
recursos e ativos, responsáveis e registros precisam demonstrar como a
regra foi aplicada. Isso exige separar o que é classificação do
instrumento, autorização da entidade, obrigação de conduta, controle
operacional e eventual obrigação de informação ou reporte.

Uma forma útil de testar a implementação é reconstruir uma operação
depois do fato. O revisor deveria conseguir identificar cliente e
contraparte, ativo, serviço, entidade que assumiu a obrigação, controles
executados, local de execução e settlement e exceções aprovadas. Se a
resposta depende de conhecimento informal da mesa ou de juntar
manualmente bases sem identificador comum, existe uma lacuna entre a
norma e o modelo operacional.

Também é importante não confundir equivalência econômica com identidade
jurídica. Dois fluxos podem produzir exposição financeira semelhante e
cair em regimes diferentes; inversamente, trocar o rail tecnológico pode
não mudar a substância regulatória. Blockchain, API, smart contract ou
stablecoin descrevem componentes técnicos. O enquadramento continua
dependendo de direitos, funções, participantes e fluxo econômico.

Para uma instituição financeira, o resultado esperado é uma cadeia de
evidências: regra aplicável → decisão de enquadramento → controle
preventivo → execução → registro → reconciliação → monitoramento e,
quando necessário, reporte. Essa cadeia torna a regra repetível e
auditável e permite adaptar o produto quando norma, interpretação
supervisora ou arquitetura tecnológica mudarem.

## 15. PLD e KYT

KYC, sanctions, transaction monitoring e blockchain analytics formam
cadeia única de decisão. Esse ponto deve ser lido como parte da mecânica
do regime, e não como detalhe isolado. Em ativos virtuais, uma única
experiência de usuário pode combinar execução, custódia, transferência,
conversão monetária e serviços de terceiros em diferentes jurisdições;
por isso, a regra precisa ser aplicada à função econômica concreta e à
entidade que efetivamente a desempenha.

Do ponto de vista regulatório, a instituição precisa converter essa
ideia em classificação operacional verificável. Não basta uma política
afirmar que o tema foi considerado: produto, entidade jurídica, fluxo de
recursos e ativos, responsáveis e registros precisam demonstrar como a
regra foi aplicada. Isso exige separar o que é classificação do
instrumento, autorização da entidade, obrigação de conduta, controle
operacional e eventual obrigação de informação ou reporte.

Uma forma útil de testar a implementação é reconstruir uma operação
depois do fato. O revisor deveria conseguir identificar cliente e
contraparte, ativo, serviço, entidade que assumiu a obrigação, controles
executados, local de execução e settlement e exceções aprovadas. Se a
resposta depende de conhecimento informal da mesa ou de juntar
manualmente bases sem identificador comum, existe uma lacuna entre a
norma e o modelo operacional.

Também é importante não confundir equivalência econômica com identidade
jurídica. Dois fluxos podem produzir exposição financeira semelhante e
cair em regimes diferentes; inversamente, trocar o rail tecnológico pode
não mudar a substância regulatória. Blockchain, API, smart contract ou
stablecoin descrevem componentes técnicos. O enquadramento continua
dependendo de direitos, funções, participantes e fluxo econômico.

Para uma instituição financeira, o resultado esperado é uma cadeia de
evidências: regra aplicável → decisão de enquadramento → controle
preventivo → execução → registro → reconciliação → monitoramento e,
quando necessário, reporte. Essa cadeia torna a regra repetível e
auditável e permite adaptar o produto quando norma, interpretação
supervisora ou arquitetura tecnológica mudarem.

## 16. Reconciliação

Ledger do cliente, posição da instituição e realidade on-chain ou no
venue devem bater. Esse ponto deve ser lido como parte da mecânica do
regime, e não como detalhe isolado. Em ativos virtuais, uma única
experiência de usuário pode combinar execução, custódia, transferência,
conversão monetária e serviços de terceiros em diferentes jurisdições;
por isso, a regra precisa ser aplicada à função econômica concreta e à
entidade que efetivamente a desempenha.

Do ponto de vista regulatório, a instituição precisa converter essa
ideia em classificação operacional verificável. Não basta uma política
afirmar que o tema foi considerado: produto, entidade jurídica, fluxo de
recursos e ativos, responsáveis e registros precisam demonstrar como a
regra foi aplicada. Isso exige separar o que é classificação do
instrumento, autorização da entidade, obrigação de conduta, controle
operacional e eventual obrigação de informação ou reporte.

Uma forma útil de testar a implementação é reconstruir uma operação
depois do fato. O revisor deveria conseguir identificar cliente e
contraparte, ativo, serviço, entidade que assumiu a obrigação, controles
executados, local de execução e settlement e exceções aprovadas. Se a
resposta depende de conhecimento informal da mesa ou de juntar
manualmente bases sem identificador comum, existe uma lacuna entre a
norma e o modelo operacional.

Também é importante não confundir equivalência econômica com identidade
jurídica. Dois fluxos podem produzir exposição financeira semelhante e
cair em regimes diferentes; inversamente, trocar o rail tecnológico pode
não mudar a substância regulatória. Blockchain, API, smart contract ou
stablecoin descrevem componentes técnicos. O enquadramento continua
dependendo de direitos, funções, participantes e fluxo econômico.

Para uma instituição financeira, o resultado esperado é uma cadeia de
evidências: regra aplicável → decisão de enquadramento → controle
preventivo → execução → registro → reconciliação → monitoramento e,
quando necessário, reporte. Essa cadeia torna a regra repetível e
auditável e permite adaptar o produto quando norma, interpretação
supervisora ou arquitetura tecnológica mudarem.

## 17. Artigo 91

A partir de 30/10/2026 há vedação relevante a operações com prestadores
fora do status permitido. Esse ponto deve ser lido como parte da
mecânica do regime, e não como detalhe isolado. Em ativos virtuais, uma
única experiência de usuário pode combinar execução, custódia,
transferência, conversão monetária e serviços de terceiros em diferentes
jurisdições; por isso, a regra precisa ser aplicada à função econômica
concreta e à entidade que efetivamente a desempenha.

Do ponto de vista regulatório, a instituição precisa converter essa
ideia em classificação operacional verificável. Não basta uma política
afirmar que o tema foi considerado: produto, entidade jurídica, fluxo de
recursos e ativos, responsáveis e registros precisam demonstrar como a
regra foi aplicada. Isso exige separar o que é classificação do
instrumento, autorização da entidade, obrigação de conduta, controle
operacional e eventual obrigação de informação ou reporte.

Uma forma útil de testar a implementação é reconstruir uma operação
depois do fato. O revisor deveria conseguir identificar cliente e
contraparte, ativo, serviço, entidade que assumiu a obrigação, controles
executados, local de execução e settlement e exceções aprovadas. Se a
resposta depende de conhecimento informal da mesa ou de juntar
manualmente bases sem identificador comum, existe uma lacuna entre a
norma e o modelo operacional.

Também é importante não confundir equivalência econômica com identidade
jurídica. Dois fluxos podem produzir exposição financeira semelhante e
cair em regimes diferentes; inversamente, trocar o rail tecnológico pode
não mudar a substância regulatória. Blockchain, API, smart contract ou
stablecoin descrevem componentes técnicos. O enquadramento continua
dependendo de direitos, funções, participantes e fluxo econômico.

Para uma instituição financeira, o resultado esperado é uma cadeia de
evidências: regra aplicável → decisão de enquadramento → controle
preventivo → execução → registro → reconciliação → monitoramento e,
quando necessário, reporte. Essa cadeia torna a regra repetível e
auditável e permite adaptar o produto quando norma, interpretação
supervisora ou arquitetura tecnológica mudarem.

## 18. Banking rails

Conta, PIX e pagamentos usados para viabilizar VASP precisam considerar
finalidade e status regulatório. Esse ponto deve ser lido como parte da
mecânica do regime, e não como detalhe isolado. Em ativos virtuais, uma
única experiência de usuário pode combinar execução, custódia,
transferência, conversão monetária e serviços de terceiros em diferentes
jurisdições; por isso, a regra precisa ser aplicada à função econômica
concreta e à entidade que efetivamente a desempenha.

Do ponto de vista regulatório, a instituição precisa converter essa
ideia em classificação operacional verificável. Não basta uma política
afirmar que o tema foi considerado: produto, entidade jurídica, fluxo de
recursos e ativos, responsáveis e registros precisam demonstrar como a
regra foi aplicada. Isso exige separar o que é classificação do
instrumento, autorização da entidade, obrigação de conduta, controle
operacional e eventual obrigação de informação ou reporte.

Uma forma útil de testar a implementação é reconstruir uma operação
depois do fato. O revisor deveria conseguir identificar cliente e
contraparte, ativo, serviço, entidade que assumiu a obrigação, controles
executados, local de execução e settlement e exceções aprovadas. Se a
resposta depende de conhecimento informal da mesa ou de juntar
manualmente bases sem identificador comum, existe uma lacuna entre a
norma e o modelo operacional.

Também é importante não confundir equivalência econômica com identidade
jurídica. Dois fluxos podem produzir exposição financeira semelhante e
cair em regimes diferentes; inversamente, trocar o rail tecnológico pode
não mudar a substância regulatória. Blockchain, API, smart contract ou
stablecoin descrevem componentes técnicos. O enquadramento continua
dependendo de direitos, funções, participantes e fluxo econômico.

Para uma instituição financeira, o resultado esperado é uma cadeia de
evidências: regra aplicável → decisão de enquadramento → controle
preventivo → execução → registro → reconciliação → monitoramento e,
quando necessário, reporte. Essa cadeia torna a regra repetível e
auditável e permite adaptar o produto quando norma, interpretação
supervisora ou arquitetura tecnológica mudarem.

## 19. Caso BTCBRL

Quote, booking, hedge BTC, hedge FX, custody, reconciliação e AML
precisam compartilhar a mesma operação econômica. Esse ponto deve ser
lido como parte da mecânica do regime, e não como detalhe isolado. Em
ativos virtuais, uma única experiência de usuário pode combinar
execução, custódia, transferência, conversão monetária e serviços de
terceiros em diferentes jurisdições; por isso, a regra precisa ser
aplicada à função econômica concreta e à entidade que efetivamente a
desempenha.

Do ponto de vista regulatório, a instituição precisa converter essa
ideia em classificação operacional verificável. Não basta uma política
afirmar que o tema foi considerado: produto, entidade jurídica, fluxo de
recursos e ativos, responsáveis e registros precisam demonstrar como a
regra foi aplicada. Isso exige separar o que é classificação do
instrumento, autorização da entidade, obrigação de conduta, controle
operacional e eventual obrigação de informação ou reporte.

Uma forma útil de testar a implementação é reconstruir uma operação
depois do fato. O revisor deveria conseguir identificar cliente e
contraparte, ativo, serviço, entidade que assumiu a obrigação, controles
executados, local de execução e settlement e exceções aprovadas. Se a
resposta depende de conhecimento informal da mesa ou de juntar
manualmente bases sem identificador comum, existe uma lacuna entre a
norma e o modelo operacional.

Também é importante não confundir equivalência econômica com identidade
jurídica. Dois fluxos podem produzir exposição financeira semelhante e
cair em regimes diferentes; inversamente, trocar o rail tecnológico pode
não mudar a substância regulatória. Blockchain, API, smart contract ou
stablecoin descrevem componentes técnicos. O enquadramento continua
dependendo de direitos, funções, participantes e fluxo econômico.

Para uma instituição financeira, o resultado esperado é uma cadeia de
evidências: regra aplicável → decisão de enquadramento → controle
preventivo → execução → registro → reconciliação → monitoramento e,
quando necessário, reporte. Essa cadeia torna a regra repetível e
auditável e permite adaptar o produto quando norma, interpretação
supervisora ou arquitetura tecnológica mudarem.

## 20. Withdrawal

Transferência externa exige fraude, sanctions, KYT, self-hosted-wallet
policy e registros. Esse ponto deve ser lido como parte da mecânica do
regime, e não como detalhe isolado. Em ativos virtuais, uma única
experiência de usuário pode combinar execução, custódia, transferência,
conversão monetária e serviços de terceiros em diferentes jurisdições;
por isso, a regra precisa ser aplicada à função econômica concreta e à
entidade que efetivamente a desempenha.

Do ponto de vista regulatório, a instituição precisa converter essa
ideia em classificação operacional verificável. Não basta uma política
afirmar que o tema foi considerado: produto, entidade jurídica, fluxo de
recursos e ativos, responsáveis e registros precisam demonstrar como a
regra foi aplicada. Isso exige separar o que é classificação do
instrumento, autorização da entidade, obrigação de conduta, controle
operacional e eventual obrigação de informação ou reporte.

Uma forma útil de testar a implementação é reconstruir uma operação
depois do fato. O revisor deveria conseguir identificar cliente e
contraparte, ativo, serviço, entidade que assumiu a obrigação, controles
executados, local de execução e settlement e exceções aprovadas. Se a
resposta depende de conhecimento informal da mesa ou de juntar
manualmente bases sem identificador comum, existe uma lacuna entre a
norma e o modelo operacional.

Também é importante não confundir equivalência econômica com identidade
jurídica. Dois fluxos podem produzir exposição financeira semelhante e
cair em regimes diferentes; inversamente, trocar o rail tecnológico pode
não mudar a substância regulatória. Blockchain, API, smart contract ou
stablecoin descrevem componentes técnicos. O enquadramento continua
dependendo de direitos, funções, participantes e fluxo econômico.

Para uma instituição financeira, o resultado esperado é uma cadeia de
evidências: regra aplicável → decisão de enquadramento → controle
preventivo → execução → registro → reconciliação → monitoramento e,
quando necessário, reporte. Essa cadeia torna a regra repetível e
auditável e permite adaptar o produto quando norma, interpretação
supervisora ou arquitetura tecnológica mudarem.

## 21. Implementação

Entitlements, limits, audit logs, settlement state machines e regulatory
master data são componentes centrais. Esse ponto deve ser lido como
parte da mecânica do regime, e não como detalhe isolado. Em ativos
virtuais, uma única experiência de usuário pode combinar execução,
custódia, transferência, conversão monetária e serviços de terceiros em
diferentes jurisdições; por isso, a regra precisa ser aplicada à função
econômica concreta e à entidade que efetivamente a desempenha.

Do ponto de vista regulatório, a instituição precisa converter essa
ideia em classificação operacional verificável. Não basta uma política
afirmar que o tema foi considerado: produto, entidade jurídica, fluxo de
recursos e ativos, responsáveis e registros precisam demonstrar como a
regra foi aplicada. Isso exige separar o que é classificação do
instrumento, autorização da entidade, obrigação de conduta, controle
operacional e eventual obrigação de informação ou reporte.

Uma forma útil de testar a implementação é reconstruir uma operação
depois do fato. O revisor deveria conseguir identificar cliente e
contraparte, ativo, serviço, entidade que assumiu a obrigação, controles
executados, local de execução e settlement e exceções aprovadas. Se a
resposta depende de conhecimento informal da mesa ou de juntar
manualmente bases sem identificador comum, existe uma lacuna entre a
norma e o modelo operacional.

Também é importante não confundir equivalência econômica com identidade
jurídica. Dois fluxos podem produzir exposição financeira semelhante e
cair em regimes diferentes; inversamente, trocar o rail tecnológico pode
não mudar a substância regulatória. Blockchain, API, smart contract ou
stablecoin descrevem componentes técnicos. O enquadramento continua
dependendo de direitos, funções, participantes e fluxo econômico.

Para uma instituição financeira, o resultado esperado é uma cadeia de
evidências: regra aplicável → decisão de enquadramento → controle
preventivo → execução → registro → reconciliação → monitoramento e,
quando necessário, reporte. Essa cadeia torna a regra repetível e
auditável e permite adaptar o produto quando norma, interpretação
supervisora ou arquitetura tecnológica mudarem.

## 22. Relação 519 e 521

519 responde quem entra, 520 como funciona e 521 quando o fluxo toca
câmbio e capitais internacionais. Esse ponto deve ser lido como parte da
mecânica do regime, e não como detalhe isolado. Em ativos virtuais, uma
única experiência de usuário pode combinar execução, custódia,
transferência, conversão monetária e serviços de terceiros em diferentes
jurisdições; por isso, a regra precisa ser aplicada à função econômica
concreta e à entidade que efetivamente a desempenha.

Do ponto de vista regulatório, a instituição precisa converter essa
ideia em classificação operacional verificável. Não basta uma política
afirmar que o tema foi considerado: produto, entidade jurídica, fluxo de
recursos e ativos, responsáveis e registros precisam demonstrar como a
regra foi aplicada. Isso exige separar o que é classificação do
instrumento, autorização da entidade, obrigação de conduta, controle
operacional e eventual obrigação de informação ou reporte.

Uma forma útil de testar a implementação é reconstruir uma operação
depois do fato. O revisor deveria conseguir identificar cliente e
contraparte, ativo, serviço, entidade que assumiu a obrigação, controles
executados, local de execução e settlement e exceções aprovadas. Se a
resposta depende de conhecimento informal da mesa ou de juntar
manualmente bases sem identificador comum, existe uma lacuna entre a
norma e o modelo operacional.

Também é importante não confundir equivalência econômica com identidade
jurídica. Dois fluxos podem produzir exposição financeira semelhante e
cair em regimes diferentes; inversamente, trocar o rail tecnológico pode
não mudar a substância regulatória. Blockchain, API, smart contract ou
stablecoin descrevem componentes técnicos. O enquadramento continua
dependendo de direitos, funções, participantes e fluxo econômico.

Para uma instituição financeira, o resultado esperado é uma cadeia de
evidências: regra aplicável → decisão de enquadramento → controle
preventivo → execução → registro → reconciliação → monitoramento e,
quando necessário, reporte. Essa cadeia torna a regra repetível e
auditável e permite adaptar o produto quando norma, interpretação
supervisora ou arquitetura tecnológica mudarem.

## 23. Como as partes se conectam

A melhor maneira de não se perder nos detalhes é voltar à tese central:
A BCB 520 é o núcleo operacional brasileiro: define ativos regulados,
modalidades de prestadoras, atividades, requisitos de funcionamento,
controles e transição, transformando exchange, intermediação e custody
em responsabilidades institucionais. Alguns capítulos definem o
perímetro --- quem, qual ativo ou qual atividade entra. Outros descrevem
condições para operar dentro dele. Outros tratam de controles, dados,
supervisão ou consequências quando a operação cruza fronteiras
institucionais.

Na prática, uma instituição não implementa uma norma por artigos
isolados. Ela cria um mapa de obrigações e liga cada obrigação a
produtos, entidades, processos e sistemas. O mesmo trade pode gerar
decisões em quatro camadas: classificação jurídica do ativo; autorização
da entidade; regras de conduta e operação; e obrigações de registro,
monitoramento ou reporte. Havendo componente internacional, surge ainda
a pergunta sobre qual jurisdição regula cada participante e cada perna.

Por isso, compliance, trading e settlement precisam compartilhar
identificadores. `client_id`, `legal_entity_id`, `trade_id`, `order_id`,
`wallet_id`, `transaction_hash`, `venue_id` e
`regulatory_classification` não deveriam viver em universos
desconectados. A operação regulatória deve ser reconstruível a partir
dos mesmos fatos econômicos que geraram risco e contabilidade.

## 24. Roteiro de implementação

Comece por legal-perimeter mapping: produtos, ativos, clientes,
entidades, jurisdições e atividades. Depois faça control mapping,
ligando cada requisito a controle e owner. Em seguida faça data mapping,
identificando campos que provam execução do controle e sistemas que são
fontes oficiais. Por fim, defina exceções, escalonamento, testes,
evidências e revisão periódica.

Em crypto isso precisa acontecer antes do go-live. Se o OMS nunca
capturou finalidade econômica, se wallets não possuem vínculo com
cliente/entidade ou se a arquitetura não distingue principal de agent,
produzir reporting correto depois pode exigir reconstrução manual. O
custo de compliance cresce quando dados regulatórios não nascem junto
com o trade.

A classificação também precisa de change management. Tokens mudam
direitos, venues mudam entidade contratante, emissores alteram reservas,
protocolos adicionam bridges e licenças mudam de status. Portanto,
classificação não pode ser um campo eterno preenchido no onboarding;
precisa de owner, fonte, data de revisão e gatilhos de reavaliação.

## 25. Checklist de leitura crítica

Pergunte: qual é o ativo e quais direitos representa? Quem presta o
serviço e para quem? A entidade está autorizada para essa atividade?
Quem controla o ativo em cada etapa? Onde ficam execução, custody e
settlement? Existe conversão fiat, pagamento ou transferência
internacional? Há security, derivativo ou outra categoria já regulada?
Quais dados de cliente, beneficiário e contraparte precisam ser
conhecidos? Quais riscos permanecem depois do hedge?

Confronte também desenho econômico e jurídico. Se o cliente acredita
comprar ativo segregado, contrato, ledger e custody sustentam isso? Se a
mesa diz fornecer apenas liquidez, a entidade também não custodia ou
intermedeia? Se o fluxo é chamado de withdrawal, ele economicamente
representa remessa? Se o hedge é perfeito em delta, é reconhecido
prudencialmente? Nomenclatura interna não pode substituir análise.

## 26. Conclusão

A BCB 520 é o núcleo operacional brasileiro: define ativos regulados,
modalidades de prestadoras, atividades, requisitos de funcionamento,
controles e transição, transformando exchange, intermediação e custody
em responsabilidades institucionais.

A peça deve ser lida como arquitetura, não como coleção de frases. O
regulador procura ligar atividade econômica real a entidade responsável,
controles verificáveis e informação suficiente para supervisão. Quanto
mais complexa a cadeia --- banco brasileiro, afiliada offshore,
stablecoin estrangeira, venue em outra jurisdição, blockchain pública e
custodian terceirizado --- mais importante decompor o fluxo e depois
reconstruí-lo de ponta a ponta.

### Fontes primárias e oficiais

-   https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?numero=520&tipo=Resolu%C3%A7%C3%A3o+BCB
