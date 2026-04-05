# Guideline: Apresentação 2
## Modelo Sistemático de Uso de AI para Desenvolvimento

---

## Instruções para a AI que irá montar esta apresentação

Este documento é um guideline completo para produzir uma apresentação executiva destinada à superintendência. Os espaços indicados com `[INSERIR]` devem ser preenchidos com os ativos disponíveis localmente — em especial: o modelo proposto com playbooks e knowledges para o Devin, e o histórico de desenvolvimento do modelo a partir de experimentação, erros, acertos e aprendizados.

**Tom geral:** concreto, demonstrável, orientado a resultado. Esta apresentação tem um caso real para mostrar — não é teoria sobre AI. O tom deve transmitir que isso já está funcionando e que o banco está deixando valor na mesa ao não adotar sistematicamente.

**Audiência:** superintendente e, potencialmente, diretor.

**Duração estimada:** 15–20 minutos de apresentação + discussão.

**Posicionamento em relação à Apresentação 1:** se ambas forem feitas na mesma reunião, esta vem depois. Nessa sequência, funciona como amplificador: o frontend não é apenas uma entrega técnica — é evidência de um método de trabalho que o banco quer replicar. Se forem em momentos separados, cada uma funciona de forma independente.

---

## Estrutura de Slides

---

### SLIDE 1 — Capa

**Título:** a escolher. Sugestões:
- *"AI como ferramenta de desenvolvimento: do experimento ao modelo"*
- *"Como multiplicamos produtividade com AI — e como isso pode escalar"*
- *"AI no desenvolvimento: caso real, resultado mensurável, modelo replicável"*

---

### SLIDE 2 — O Banco Já Decidiu — O Que Falta é o Modelo

**Objetivo:** estabelecer que esta apresentação responde a uma diretiva institucional já existente.

**Conteúdo:**
- O banco tem diretiva clara para que os funcionários explorem usos de AI para aumento de produtividade
- A maioria das iniciativas ainda acontece de forma ad hoc e individual — sem metodologia, sem compartilhamento de aprendizados, sem escala
- O resultado: cada pessoa que experimenta começa do zero; os que não experimentam ficam para trás; o banco como instituição não acumula vantagem
- Esta apresentação propõe mudar isso: de experimento individual para modelo sistemático e replicável

---

### SLIDE 3 — O Caso Real

**Objetivo:** ancorar toda a apresentação em evidência concreta antes de qualquer abstração. Este é o slide mais importante — sem dado real, a apresentação perde força.

**Conteúdo:**
- Durante o desenvolvimento do frontend moderno `[INSERIR referência ao projeto]`, AI foi usada de forma sistemática em todas as etapas
- `[INSERIR: descrição em 2–3 linhas do que foi feito — ex: geração de componentes, refatoração de código legado, documentação, testes]`
- Resultado: `[INSERIR métricas — ex: X horas economizadas, Y% de redução no tempo de implementação, Z componentes gerados em N horas vs. estimativa de M]`
- Qualidade: `[INSERIR avaliação — ex: código aprovado sem retrabalho significativo, resultado comparável ao manual em fração do tempo]`

**Nota:** se não houver número preciso, usar comparação relativa — "o que levaria X dias levou Y horas." A credibilidade da proposta inteira depende da concretude deste slide.

---

### SLIDE 4 — A Ferramenta: O Que é o Devin

**Objetivo:** apresentar o Devin para quem não conhece, antes de explicar como ele foi usado.

**Conteúdo:**
- `[INSERIR: descrição do Devin — o que é, como funciona, o que o diferencia de um assistente de código convencional]`
- O Devin não é um autocomplete — é um agente de desenvolvimento que consegue executar tarefas completas de forma autônoma, com capacidade de raciocinar sobre o problema, escrever código, testar e iterar
- A diferença prática: em vez de sugerir linhas de código para o desenvolvedor aceitar ou rejeitar, o Devin recebe uma tarefa e entrega um resultado — o desenvolvedor revisa e dirige, não digita
- `[INSERIR: qualquer dado ou benchmark relevante sobre o Devin que esteja disponível localmente]`

---

### SLIDE 5 — Knowledges e Playbooks: O Que São e Por Que Importam

**Objetivo:** explicar os dois conceitos que tornam o uso do Devin sistemático e replicável — este é o coração metodológico da apresentação.

**Conteúdo:**

**Knowledges:**
- `[INSERIR: definição de knowledge no contexto do Devin]`
- Funcionam como a memória do agente: informações sobre a arquitetura do sistema, padrões de código, decisões já tomadas, convenções do projeto
- Sem knowledge, o Devin começa do zero em cada sessão — com knowledge, ele opera com o contexto acumulado do projeto
- `[INSERIR: exemplo concreto de um knowledge usado no projeto — o que ele contém e como impactou o resultado]`

**Playbooks:**
- `[INSERIR: definição de playbook no contexto do Devin]`
- Funcionam como procedimentos padronizados: sequências de ações que o agente deve executar para tarefas recorrentes
- Sem playbook, cada tarefa similar precisa ser descrita do zero. Com playbook, o agente sabe exatamente como proceder
- `[INSERIR: exemplo concreto de um playbook usado no projeto — para que serve e o que padronizou]`

**A lógica do conjunto:**
- Knowledge + Playbook = contexto + procedimento. É o que transforma o Devin de ferramenta genérica em ferramenta especializada para um projeto específico
- Criar e refinar esses dois elementos é o principal investimento de tempo do modelo — e é o que torna o resultado replicável por outras pessoas além de quem os criou

---

### SLIDE 6 — Como o Modelo Foi Desenvolvido

**Objetivo:** mostrar que o modelo não surgiu pronto — foi construído por experimentação. Isso aumenta credibilidade e mostra o caminho para replicação.

**Conteúdo:**

`[INSERIR: narrativa do processo de desenvolvimento do modelo — usar o histórico disponível localmente. A estrutura sugerida é:]`

- **Ponto de partida:** como começou a experimentação, qual era a expectativa inicial
- **Primeiros erros e aprendizados:** o que não funcionou, por que não funcionou, o que isso ensinou
- **Ajustes no modelo:** como knowledges e playbooks foram refinados a partir dos erros
- **Estado atual:** o que o modelo faz hoje, o que ainda está sendo aprimorado

**Nota:** este slide pode ser mais narrativo do que os demais — uma história de como o modelo foi construído é mais convincente do que uma lista de funcionalidades. O histórico de experimentação disponível localmente é o ativo central deste slide.

---

### SLIDE 7 — O Gap Atual no Time

**Objetivo:** mostrar que há uma divisão real de adoção — sem apontar culpados, mas tornando visível o custo de não agir.

**Conteúdo:**
- Há entusiasmo genuíno por parte de parte do time — que já experimenta e aprende por conta própria
- Outra parte do time demonstra resistência ou baixa experimentação — por desconforto com a curva de aprendizado ou ceticismo sobre resultado
- Essa assimetria tem custo: os que adotam ficam mais rápidos; os que não adotam ficam relativamente mais lentos. Com o tempo, isso se traduz em diferença real de capacidade de entrega
- O banco tem a oportunidade de acelerar a curva dos que ainda não adotaram — antes que a distância fique grande demais
- Uma iniciativa estruturada não é sobre obrigar ninguém: é sobre remover as barreiras que impedem quem quer aprender de aprender mais rápido

**Nota:** nunca citar nomes ou cargos. A mensagem é sobre o time como coletivo.

---

### SLIDE 8 — A Proposta: Modelo Sistemático

**Objetivo:** apresentar o que está sendo proposto de forma clara e acionável.

**Conteúdo:**
A proposta tem três componentes:

**1. Documentação do modelo**
- Transformar o que foi aprendido no experimento em guia prático: knowledges e playbooks documentados e disponíveis para o time, não apenas para quem os criou
- Inclui o histórico de decisões e erros — para que outros não precisem repetir o mesmo caminho de aprendizado

**2. Sessões práticas de transferência**
- Não treinamento teórico — demonstrações práticas com casos reais do trabalho do time
- Formato: sessões curtas com problema real, resolução ao vivo com o Devin, discussão do método e dos knowledges/playbooks utilizados
- `[INSERIR frequência sugerida com base no que for viável]`

**3. Ambiente de experimentação estruturado**
- Definir espaço seguro para experimentar em tarefas reais sem pressão de entrega imediata
- Acelera a curva de quem está começando e gera novos knowledges e playbooks que enriquecem o modelo coletivo

---

### SLIDE 9 — Conexão com o Modelo Horizontal

**Objetivo:** conectar esta apresentação com a Apresentação 1.

**Conteúdo:**
- O recurso dedicado à mesa opera com proximidade ao negócio e pressão por velocidade de entrega — exatamente o contexto onde AI multiplica mais
- O frontend moderno demonstrado foi construído com este modelo de forma sistemática: é evidência de que funciona em condição real, não em ambiente controlado
- Um recurso dedicado que opera com AI sistematicamente entrega mais, em menos tempo, com qualidade verificável — e pode transferir o modelo para o restante do time
- A adoção de AI e o modelo horizontal se reforçam: um justifica e demonstra o outro

**Nota:** se esta apresentação for feita separadamente da Apresentação 1, adaptar o conteúdo para referenciar o frontend como caso demonstrável já apresentado anteriormente. Se for feita na mesma reunião, logo após a Apresentação 1, este slide pode ser condensado em uma frase de transição oral.

---

### SLIDE 10 — Encerramento

**Conteúdo:** uma frase de encerramento em destaque tipográfico. Sugestão:
*"O experimento provou que funciona. O modelo existe. O próximo passo é escalar."*

---

## Checklist antes de apresentar

- [ ] Métricas do caso real verificadas e inseridas no Slide 3
- [ ] Definição e exemplos concretos de knowledge e playbook inseridos no Slide 5
- [ ] Histórico de desenvolvimento do modelo inserido no Slide 6
- [ ] Slide 9 revisado — se apresentado junto com a Apresentação 1, verificar se o conteúdo precisa ser condensado
- [ ] Notas do apresentador revisadas, especialmente no Slide 7 (tom sobre o gap no time)
