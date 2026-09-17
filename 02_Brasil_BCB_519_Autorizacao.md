# Resolução BCB 519/2025 --- Autorização das SPSAVs

## Resumo executivo

A BCB 519 transforma a exigência abstrata de autorização da Lei 14.478
em **processo administrativo concreto**. Ela disciplina processos de
autorização de SPSAVs e de determinadas corretoras/distribuidoras. Para
crypto, a pergunta é: o BCB considera entidade, controladores,
administradores, capital, infraestrutura, governança e projeto adequados
para entrar/permanecer no perímetro regulado?

Leia junto com a 520: **519 = gate de autorização; 520 =
funcionamento**.

## 1. Por que existe autorização

Empresas cripto podem receber recursos, ativos e ordens de terceiros,
controlar private keys e operar 24/7. Autorização não garante que nunca
quebrarão; cria filtro institucional, accountability e supervisão
contínua.

## 2. Âmbito

A norma disciplina autorização de sociedades corretoras de câmbio,
CTVMs, DTVMs e SPSAVs. Isso mostra que o BCB coloca crypto próximo à
arquitetura de intermediários financeiros, não de empresas de software
comuns.

## 3. O que o regulador precisa entender

O processo procura responder: - quem controla? - de onde vem o
capital? - controladores/administradores são adequados? - há capacidade
econômico-financeira? - governança é compatível? - modelo de negócio é
claro? - controles e infraestrutura suportam o negócio? - a instituição
consegue cumprir regras continuamente?

## 4. Controladores e grupo

Grupos crypto frequentemente têm entidade brasileira, exchange offshore,
custodiante externo e empresa de tecnologia. Due diligence deve mapear:
`marca → entidade contratante → controlador → afiliadas → venue/custodiante → fluxo de recursos`.

A marca comercial não é a contraparte jurídica.

## 5. Administradores

Infraestrutura que controla recursos de clientes precisa de pessoas
identificáveis e responsáveis. O modelo regulado é incompatível com
governança materialmente anônima ou informal.

## 6. Capital

Valuation, funding de venture capital e token próprio não equivalem
automaticamente a capital regulatório. A capacidade patrimonial deve ser
compatível com atividade e requisitos aplicáveis.

## 7. Plano de negócios

"Plataforma crypto" é descrição insuficiente. É necessário decompor
intermediação, custody, exchange, transfer, execution, fiat rails, redes
suportadas e terceiros críticos.

## 8. Tecnologia

Em SPSAV, tecnologia é controle financeiro. O processo precisa ser
compatível com segurança de wallets, autenticação, segregação de
funções, logs, reconciliação, continuidade e resposta a incidentes.

## 9. Mudanças posteriores

Autorização não é evento único. Mudanças societárias e outros eventos
definidos podem exigir autorização/comunicação. M&A de VASP não deve ser
tratado como simples aquisição de software.

## 10. Transição

Empresa que já operava antes do novo regime não deve ser classificada
simplesmente como "autorizada". Em 2026 é essencial distinguir: -
autorizada; - em processo válido de autorização; - coberta por
transição; - fora do perímetro permitido.

## 11. Conexão com BCB 520, art. 91

A partir de 30/10/2026, instituições autorizadas pelo BCB sofrem vedação
de realizar/viabilizar operações com VASPs que não estejam autorizadas
ou em processo de autorização no País, salvo exceções previstas.

Assim, o status na 519 vira atributo crítico também para **bancos que
mantêm rails para VASPs**.

## 12. Entidade autorizada não significa produto automaticamente permitido

Ainda é necessário perguntar: - atividade está no escopo? - há câmbio? -
há security/derivativo? - há entidade offshore? - quem faz custody? - o
produto exige outro regime?

## 13. Exemplo de onboarding

Exchange global quer conta BRL: 1. qual entidade recebe BRL? 2. quem
executa crypto? 3. quem custodia? 4. entidade brasileira está
autorizada/em processo? 5. offshore vira contraparte? 6. há câmbio? 7.
quais terceiros críticos? 8. como se reconcilia fiat ↔ crypto?

## 14. Arquitetura de dados

Cadastro institucional deveria guardar `legal_entity`,
`regulatory_status`, `authorization_process`, `permitted_activities`,
`jurisdiction`, `effective_dates`, `custody_provider`,
`execution_venues` e `review_date`.

Isso permite bloqueio sistêmico quando status muda.

## 15. Como memorizar

**519 = quem pode atravessar o portão regulatório e sob quais
processos.**

## Fonte

-   https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?numero=519&tipo=Resolu%C3%A7%C3%A3o+BCB
