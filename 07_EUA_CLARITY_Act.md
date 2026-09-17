# CLARITY Act --- Proposta de market structure nos EUA

> **Guia comentado e didático --- referência: 17 de setembro de 2026**

## Como ler este documento

Este arquivo foi escrito para ser autossuficiente como material de
estudo. O objetivo não é reproduzir o normativo artigo por artigo nem
substituir aconselhamento jurídico, mas permitir que o leitor compreenda
sua lógica, arquitetura e consequências práticas. Conceitos que só fazem
sentido em conjunto são tratados em conjunto; natureza jurídica, função
econômica, risco e implementação tecnológica são separados quando
necessário.

**Tese central:** O CLARITY Act procura organizar a estrutura de mercado
americana para digital assets, especialmente SEC/CFTC, digital
commodities, intermediários e proteção de clientes; em 16/09/2026 não é
lei federal vigente.

Os exemplos envolvendo bancos, exchanges, custodians, stablecoins,
wallets e mesas de tesouraria tornam a regra concreta. Eles não são
conclusões jurídicas automáticas para qualquer operação real. Em
implementação, é necessário conferir texto oficial vigente, atos
complementares, transições e fatos específicos.

## 1. Status legislativo

Projeto não deve ser tratado como obrigação vigente; versão, Casa,
votação e rulemaking importam. Esse ponto deve ser lido como parte da
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

## 2. SEC e CFTC

A proposta tenta reduzir incerteza sobre securities, commodities e spot
markets. Esse ponto deve ser lido como parte da mecânica do regime, e
não como detalhe isolado. Em ativos virtuais, uma única experiência de
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

## 3. Digital commodities

A categoria busca tratamento explícito sob arquitetura CFTC. Esse ponto
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

## 4. Securities offerings

Captações com tokens continuam exigindo análise de securities law. Esse
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

## 5. Emissão versus ativo

A proposta procura distinguir em certas circunstâncias a captação
inicial da negociação secundária. Esse ponto deve ser lido como parte da
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

## 6. Descentralização

Governance, ownership, upgrades e controle tornam análise factual. Esse
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

## 7. CFTC spot

A proposta organiza autoridade sobre spot markets de digital
commodities. Esse ponto deve ser lido como parte da mecânica do regime,
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

## 8. SEC perimeter

Securities e intermediários associados permanecem no núcleo SEC. Esse
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

## 9. Exchanges

Registro, listing, surveillance, custody e conflicts são temas centrais.
Esse ponto deve ser lido como parte da mecânica do regime, e não como
detalhe isolado. Em ativos virtuais, uma única experiência de usuário
pode combinar execução, custódia, transferência, conversão monetária e
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

## 10. Brokers dealers

Intermediários de digital commodities ganhariam regime mais claro. Esse
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

## 11. Customer assets

Segregação responde a falências que misturaram ativos de clientes. Esse
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

## 12. Conflitos

Exchange, custody, prop trading, market making e lending na mesma
estrutura exigem controles. Esse ponto deve ser lido como parte da
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

## 13. Surveillance

Manipulação e integridade de preço exigem dados de mercado. Esse ponto
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

## 14. Disclosure

Digital assets precisam de informação útil sem simplesmente copiar
equity disclosure. Esse ponto deve ser lido como parte da mecânica do
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

## 15. DeFi

Front-end, developers, DAO, admin keys e controle complicam o perímetro.
Esse ponto deve ser lido como parte da mecânica do regime, e não como
detalhe isolado. Em ativos virtuais, uma única experiência de usuário
pode combinar execução, custódia, transferência, conversão monetária e
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

## 16. Self custody

É preciso distinguir software e autocustódia de intermediação. Esse
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

## 17. CLARITY e GENIUS

GENIUS é lei de stablecoins; CLARITY é agenda ampla de market structure.
Esse ponto deve ser lido como parte da mecânica do regime, e não como
detalhe isolado. Em ativos virtuais, uma única experiência de usuário
pode combinar execução, custódia, transferência, conversão monetária e
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

## 18. Impacto institucional

Clareza pode melhorar due diligence de venues, custody e classificação.
Esse ponto deve ser lido como parte da mecânica do regime, e não como
detalhe isolado. Em ativos virtuais, uma única experiência de usuário
pode combinar execução, custódia, transferência, conversão monetária e
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

## 19. O que monitorar

Versões, emendas, votos, sanção e regulamentação posterior são parte do
status jurídico. Esse ponto deve ser lido como parte da mecânica do
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

## 20. Como as partes se conectam

A melhor maneira de não se perder nos detalhes é voltar à tese central:
O CLARITY Act procura organizar a estrutura de mercado americana para
digital assets, especialmente SEC/CFTC, digital commodities,
intermediários e proteção de clientes; em 16/09/2026 não é lei federal
vigente. Alguns capítulos definem o perímetro --- quem, qual ativo ou
qual atividade entra. Outros descrevem condições para operar dentro
dele. Outros tratam de controles, dados, supervisão ou consequências
quando a operação cruza fronteiras institucionais.

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

## 21. Roteiro de implementação

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

## 22. Checklist de leitura crítica

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

## 23. Conclusão

O CLARITY Act procura organizar a estrutura de mercado americana para
digital assets, especialmente SEC/CFTC, digital commodities,
intermediários e proteção de clientes; em 16/09/2026 não é lei federal
vigente.

A peça deve ser lida como arquitetura, não como coleção de frases. O
regulador procura ligar atividade econômica real a entidade responsável,
controles verificáveis e informação suficiente para supervisão. Quanto
mais complexa a cadeia --- banco brasileiro, afiliada offshore,
stablecoin estrangeira, venue em outra jurisdição, blockchain pública e
custodian terceirizado --- mais importante decompor o fluxo e depois
reconstruí-lo de ponta a ponta.

### Fontes primárias e oficiais

-   https://www.congress.gov/
