# Guideline: Apresentação 1
## Modelo Horizontal + Frontend Moderno como Ativo Demonstrativo

---

## Instruções para a AI que irá montar esta apresentação

Este documento é um guideline completo para produzir uma apresentação executiva destinada à superintendência. Ele contém o objetivo de cada slide e o conteúdo sugerido. Os espaços indicados com `[INSERIR]` devem ser preenchidos com os ativos disponíveis localmente.

**Tom geral:** executivo, objetivo, orientado a negócio. A horizontalização já está decidida — esta apresentação não precisa convencer sobre o caminho, precisa apresentar o modelo concreto e os ativos que o suportam. O esforço de convencimento está concentrado na proposta do modelo de funcionamento, não na justificativa de por que horizontalizar.

**Audiência:** superintendente e, potencialmente, diretor.

**Duração estimada:** 20–30 minutos de apresentação + discussão.

**Nota sobre a demo ao vivo:** o frontend deve ser demonstrado ao vivo após o slide que o introduz. A apresentação serve de âncora antes e depois da demo.

---

## Estrutura de Slides

---

### SLIDE 1 — Capa

**Título:** a escolher. Sugestões:
- *"Modelo horizontal: proposta de funcionamento e primeiro ativo"*
- *"Da vertical à mesa: como o modelo funciona na prática"*

---

### SLIDE 2 — O Problema do Modelo Atual

**Objetivo:** nomear rapidamente o problema estrutural que motivou a decisão de horizontalizar — sem gastar tempo justificando a decisão, apenas contextualizando de onde ela vem.

**Conteúdo:**
- A estrutura atual organiza-se em torno de verticais técnicas, não das necessidades das mesas — o que gera soluções genéricas demais que não servem perfeitamente a nenhuma mesa
- A interface entre técnico e mesa passa por múltiplas camadas intermediárias, o que dilui o entendimento das necessidades reais e atrasa a entrega
- Decisões de infraestrutura e arquitetura são tomadas com base no legado, não nas necessidades do negócio atual

**Nota:** este slide é breve por intenção. O modelo atual já foi avaliado — não é necessário desenvolver o argumento. O slide existe para criar contraste com o que vem a seguir.

---

### SLIDE 3 — O Modelo Proposto: Visão Geral

**Objetivo:** apresentar a estrutura do modelo de forma clara antes de aprofundar cada componente.

**Conteúdo:**
- Um profissional com perfil híbrido (técnico + mercado) alocado diretamente à mesa, com responsabilidade sobre o ferramental que a mesa usa para operar
- Prioridades e iniciativas são definidas em conjunto com a mesa — sem intermediação sobre o mérito do que está sendo feito
- A execução que envolve outras verticais é coordenada pelo gerente de execução, que atua como orquestrador entre o que foi definido com a mesa e o que cada vertical entrega
- O recurso dedicado tem autonomia técnica sobre decisões de infraestrutura, stack e arquitetura dentro do escopo do seu business — sem necessidade de aprovação das verticais
- Precedente de mercado: esse modelo — *embedded specialist* com autoridade funcional — é o que grandes tesourarias globais adotaram, conforme mapeado pela consultoria externa

**Visual sugerido:** diagrama do modelo. Mesa no centro com conexão direta ao recurso dedicado. Gerente de execução como coordenador das verticais de suporte. Este diagrama é o elemento visual mais importante da apresentação — investir na clareza dele.

---

### SLIDE 4 — O Modelo Proposto: Como Funciona o Reporte

**Objetivo:** detalhar a estrutura de reporte sem ambiguidade — este é o ponto mais sensível politicamente e precisa estar claro.

**Conteúdo:**
- **Reporte funcional à mesa:** o head da mesa define prioridades e valida entregas. O que fazer e para quê vem da mesa.
- **Reporte administrativo ao gerente de execução:** gestão de carreira, avaliação de desempenho e coordenação de execução com as verticais. O gerente não arbitra prioridades de negócio — coordena como elas são executadas.
- **Autonomia técnica do recurso:** decisões de infraestrutura, stack e arquitetura dentro do escopo do business são do recurso dedicado, em alinhamento com a mesa. Essa autonomia não é sobre poder — é sobre velocidade. Um recurso que precisa de aprovação de quem não está próximo do negócio para decidir infraestrutura não consegue operar no ritmo que o modelo exige.
- O gerente de execução deixa de ser árbitro informal de prioridades de negócio e passa a ter um papel mais claro e menos exposto a conflitos entre demanda de mesa e capacidade de vertical.

**Nota:** o ponto da autonomia técnica precisa estar nomeado explicitamente neste slide — é o que garante que o modelo funcione na prática e não seja gradualmente reinterpretado de volta para o formato anterior.

---

### SLIDE 5 — O Modelo Proposto: Interfaces com as Verticais

**Objetivo:** mostrar como o recurso dedicado se relaciona com cada vertical — deixando claro que as verticais continuam relevantes, mas com papel diferente.

**Conteúdo:**
- O recurso dedicado tem interface direta com quatro verticais:
  - **Execução e automatização** — desenvolvimento e manutenção do ferramental de execução
  - **Precificação e publicação** — interface com modelos de preço e publicação de dados
  - **Captura de operações (Drop Copy)** — consumo das operações para controle interno
  - **Risco intradiário** — consumo de posições e cálculo de resultado
- As verticais continuam operando sua arquitetura — o recurso dedicado não substitui nenhuma delas, mas define como elas se integram ao ferramental da mesa
- A coordenação dessas interfaces é feita pelo gerente de execução (para as verticais de pré-trade e trade) e pelo gerente de pós-trade (para captura e risco)
- O que muda: as verticais passam de definidores da agenda técnica para executores de uma agenda definida pela mesa

---

### SLIDE 6 — O Modelo Proposto: Visão de Longo Prazo

**Objetivo:** mostrar que o piloto não é o destino — é o primeiro passo de uma arquitetura maior. Posicionar o superintendente como parceiro de uma agenda estratégica, não apenas aprovador de uma reorganização pontual.

**Conteúdo:**
- O modelo por mesa, se o piloto for bem-sucedido, pode ser expandido para outras mesas da tesouraria
- A visão de longo prazo é uma **arquitetura unificada**: em vez de múltiplas verticais com feudos técnicos independentes, uma cadeia integrada de pré-trade, trade e pós-trade com ferramental coordenado e aderente a cada mesa
- Hoje cada vertical desenvolveu sua própria arquitetura de forma independente — o que gera duplicação, desalinhamento e atrito. A arquitetura unificada não elimina as verticais, mas cria uma camada de coerência que hoje não existe
- As verticais existentes continuam relevantes como especialização técnica — mas dentro de uma arquitetura compartilhada, não como silos independentes
- O piloto de cripto é o laboratório: aprende-se o modelo, ajusta-se, e depois se expande

---

### SLIDE 7 — O Ativo: Frontend Moderno

**Objetivo:** apresentar o frontend como prova de conceito viva do modelo — não como produto técnico.

**Conteúdo:**
- O frontend moderno é o primeiro experimento concreto da lógica do modelo por mesa: foi construído com foco nas necessidades específicas da mesa, não como solução genérica
- Foi desenhado desde o início com arquitetura que permite expansão para outras mesas — sem reescrever, apenas adicionando
- Substitui um ambiente legado construído originalmente para outro contexto e adaptado ao longo do tempo
- Resolve problemas reais de operação: `[INSERIR 2–3 problemas concretos que o frontend resolve]`
- Foi produzido com uso sistemático de AI — o que demonstra o modelo de trabalho que o recurso dedicado vai operar

**`[INSERIR screenshot do frontend — de preferência uma tela em uso, com dados reais ou mock]`**

**Nota:** este slide é a transição para a demo ao vivo. Após apresentar o slide, abrir o sistema e fazer a demonstração. A apresentação retoma após a demo no slide seguinte.

---

### [DEMO AO VIVO]

Roteiro sugerido:
1. Tela principal — posicionamento geral da mesa
2. Funcionalidade que não existia antes ou que resolve problema real
3. Lógica arquitetural expansível — como uma segunda mesa poderia ser adicionada

Duração sugerida: 5–8 minutos.

---

### SLIDE 8 — O Problema da Infraestrutura Legada

**Objetivo:** apresentar a questão de infraestrutura como argumento de negócio e como síntoma de um problema arquitetural mais amplo.

**Conteúdo — parte 1: o custo direto de PnL**
- O sistema atual está hospedado em ambiente de colocation construído para operações de renda fixa e câmbio (B3)
- Para operar cripto, a aplicação precisa rotear por proxy corporativo para chegar aos servidores das contrapartes: Bloomberg/CME (EUA), Coinbase, Galaxy, Gate.io (EUA e Ásia-Pacífico)
- Esse caminho introduz latência estrutural que se traduz diretamente em slippage na execução
- A solução: hospedar em cloud (ex: AWS EC2) em regiões próximas às contrapartes — eliminando o roteamento desnecessário
- `[INSERIR se disponível: dado ou estimativa de latência atual vs. esperada pós-migração]`

**Conteúdo — parte 2: o problema mais profundo**
- A infraestrutura é o sintoma mais visível de um problema arquitetural maior: o sistema foi originalmente desenhado para B3 e foi crescendo por adaptação — câmbio, commodities, cripto foram se encaixando no que já existia, não num modelo pensado para todos
- Isso não afeta só a infraestrutura: afeta a arquitetura interna do sistema de formas que não são visíveis externamente, mas geram custo alto de desenvolvimento — cada nova integração ou funcionalidade precisa contornar decisões que foram tomadas para outro contexto
- Existem dois caminhos para resolver:
  - **Modelo genérico unificado:** reescrever a base com uma arquitetura que funcione para todos os mercados desde a origem — sem "puxadinhos"
  - **Modelo segregado por mercado:** ambientes independentes por mesa ou mercado, cada um otimizado para seu contexto, sem herança de decisões de outro

- O frontend moderno em desenvolvimento segue a lógica do segundo caminho: nasceu para cripto, mas foi arquitetado para ser replicado — não para ser estendido sobre uma base de outro contexto

**Nota:** os dois caminhos não são mutuamente excludentes no longo prazo — mas para o piloto, o modelo segregado é o mais viável. O modelo genérico unificado exigiria reescrever toda a base antes de entregar qualquer resultado.

---

### SLIDE 9 — A Questão da Sustentação

**Objetivo:** antecipar e responder a objeção previsível sobre risco operacional pós-segregação.

**Conteúdo:**
- A preocupação natural: se o business for segregado, quem dará suporte?
- A realidade verificável hoje: o conhecimento do stack de cripto já está concentrado em poucos profissionais — o modelo atual já tem esse risco, ele apenas não está explícito
- O modelo proposto torna o risco **visível e gerenciável**:
  - O piloto inclui plano de sustentação estruturado: documentação, runbooks, cobertura definida
  - A segregação cria incentivo para formalizar o conhecimento — o que o modelo atual não faz
- A pergunta correta não é "o modelo novo tem risco de sustentação?" — é "o modelo atual garante sustentação real ou apenas aparência dela?"

**Nota:** o objetivo deste slide é neutralizar a objeção, não prometer solução completa. A mensagem é que o risco é real nos dois modelos — e o modelo proposto pelo menos o torna explícito e endereçável.

---

### SLIDE 10 — Encerramento

**Conteúdo:** uma frase de encerramento em destaque tipográfico. Sugestão:
*"O modelo está definido. O ativo existe. O experimento está pronto para começar."*

---

## Checklist antes de apresentar

- [ ] Frontend funcionando e testado no ambiente onde será apresentado
- [ ] Demo roteirizada e ensaiada (5–8 min)
- [ ] Screenshots do frontend inseridos no Slide 7
- [ ] Diagrama do modelo (Slides 3–5) claro o suficiente para ser entendido em 10 segundos
- [ ] Dado ou estimativa de latência inserido no Slide 8 (se disponível)
- [ ] Notas do apresentador revisadas, especialmente nos Slides 4 e 9
