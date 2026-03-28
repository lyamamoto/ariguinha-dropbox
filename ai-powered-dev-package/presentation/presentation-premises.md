# AI-Powered Development — Presentation Premises

## Objetivo
Apresentação corporativa interativa para a diretoria do Itaú, demonstrando como o time de Quant/Electronic Trading está adotando AI (Devin) de forma sistêmica para desenvolvimento de software, e os resultados concretos já obtidos.

## Público-alvo
- **Perfil**: Diretoria de banco com background em tecnologia e mercado financeiro
- **Conhecimento prévio**: Alto — já entendem agentes de AI, querem ver aplicação prática
- **Expectativa**: Ver resultados, entender o método, avaliar escalabilidade para outras áreas

## Tom & Narrativa
- **Report executivo com demonstração de resultado** — mostrar que funciona, não vender a ideia de AI
- **Auto-navegável** — texto suficiente para ser entendido sem narrador
- **Interativo e didático** — cada slide permite exploração
- **Pragmático** — foco em "como fazemos" e "o que conseguimos", não em teoria
- **20 minutos** de apresentação, apresentador solo

## Estrutura (10 slides)

### 1. Cover
- Título: **AI-Powered Development**
- Subtítulo: "Como o time de Electronic Trading está usando AI para construir software"
- Visual: dark + laranja Itaú, logo do banco
- Badges: `Quant & Technology` · `Electronic Trading` · `Devin AI`

### 2. Contexto & Oportunidade
- A diretiva do banco: adoção de AI em todas as áreas
- O desafio específico do time: operar na interseção de quant + tecnologia
  - Quants que precisam de ferramentas sofisticadas e rápidas
  - Time de tecnologia compacto que precisa entregar muito
- A oportunidade: usar AI não como assistente pontual, mas como membro produtivo do time
- Destaque: "AI não substitui engenheiros — ela multiplica a capacidade de um time compacto"

### 3. O Que É o Devin (visão rápida)
- Não é um autocomplete de código (Copilot). É um **agente autônomo de software**.
- Diferencial: planeja, executa, depura, testa, abre PRs — ciclo completo
- Analogia: "É como um desenvolvedor júnior que nunca dorme, é infinitamente paralelizável, e segue instruções à risca"
- Visual: diagrama simples mostrando o fluxo: Instrução → Planejamento → Implementação → Testes → PR
- Empresas que já usam: Goldman Sachs, Nubank, Citi (credibilidade)

### 4. O Problema: AI Sem Método = Caos
- O risco de usar agentes de código sem estrutura:
  - Código sem rastreabilidade ("quem pediu isso?")
  - Escopo que expande infinitamente
  - Arquitetura inconsistente
  - Nenhuma memória de decisões passadas
- Mensagem: "A AI é poderosa, mas sem método produz código — não projeto."
- Visual: dois lados — "AI sem método" (caótico) vs "AI com método" (estruturado)

### 5. Nossa Abordagem: Framework Sistêmico
- O que construímos: um framework de governança + padrões de código + workflow integrado
- **3 camadas complementares** (diagrama visual):
  1. **Governança de Projeto (PPM)**: Planejamento, backlog, priorização, sprints, rastreabilidade
  2. **Padrões de Código**: Regras de arquitetura por tipo de projeto (como o código deve ser escrito)
  3. **Workflow Git**: Branches por sprint, branches por task, PRs com rastreabilidade, revisão humana
- Mensagem: "Cada camada governa uma preocupação diferente. Juntas, transformam a AI de um gerador de código em um membro do time."

### 6. Como Funciona na Prática: Knowledge & Playbooks
- Dois mecanismos para "ensinar" o Devin:
  - **Knowledge** = O que o Devin precisa *saber* (regras permanentes, injetadas automaticamente por contexto)
  - **Playbooks** = O que o Devin precisa *seguir* (procedimentos passo-a-passo, invocados por comando)
- Visual interativo: mostrar exemplos de cada um
  - Knowledge: "Ao criar uma task, use o formato T-TEAM-NNN com campo Source obrigatório"
  - Playbook: "!ppm-planning → selecionar tasks → criar test plan → criar branch → aprovar"
- Diagrama: o ciclo de sprint com os playbooks marcados em cada fase
  - Assessment → Refinement → Planning → Execution → Close → (repete)
- Mensagem: "O Playbook diz O QUE fazer. O Knowledge diz COMO fazer. Os triggers conectam tudo automaticamente."

### 7. O Papel do Humano: Piloto, Não Passageiro
- O humano no loop:
  - Define requisitos e prioridades (o "quê" e o "porquê")
  - Revisa PRs em dois pontos: cada task individual + sprint consolidado
  - Toma decisões arquiteturais (o Devin sugere, o humano decide)
  - Escreve (ou valida) os Playbooks e Knowledge
- O Devin no loop:
  - Executa implementação seguindo os padrões
  - Mantém documentação atualizada automaticamente
  - Gerencia branches, PRs, status de tasks
  - Roda testes e reporta cobertura
- Visual: diagrama de responsabilidades lado a lado
- Mensagem: "O engenheiro vira um tech lead de AI — define o método, delega a execução, revisa o resultado."

### 8. Resultado Concreto: A PoC
- **PLACEHOLDER PARA DEMO / SCREENSHOTS DA POC**
- Contexto: reformulação de aplicação legada WinForms + DevExpress → WebView2 + React moderno
- É a tela que o trader usa para interagir com as ferramentas de electronic trading
- Resultados:
  - Várias partes da aplicação reformuladas em poucos dias
  - UX e UI significativamente melhorados
  - Arquitetura mais robusta e extensível
  - Padrões de código consistentes desde o primeiro dia
- Visual: antes/depois ou screenshots da aplicação (placeholder)
- Mensagem: "Em dias, não meses. Com qualidade, não com pressa."

### 9. Adoção Progressiva
- Não precisa adotar tudo de uma vez — 4 níveis:
  - **Nível 1** (essencial): 5 Knowledge + 2 Playbooks → disciplina básica em 15 min
  - **Nível 2** (completo): formatos consistentes, assessment/refinement
  - **Nível 3** (multi-projeto): governança consolidada, documentação de arquitetura
  - **Nível 4** (padrões de código): regras específicas por stack/projeto
- Visual: pirâmide ou escada com os 4 níveis
- Mensagem: "Comece pequeno. Escale quando sentir necessidade."

### 10. Encerramento
- Resumo em 3 pontos:
  1. AI é poderosa, mas precisa de método para produzir projeto, não só código
  2. Construímos um framework sistêmico que transforma o Devin em membro do time
  3. Os resultados da PoC demonstram que funciona na prática
- Próximos passos sugeridos:
  - Expandir uso no time de Electronic Trading
  - Documentar mais padrões de código para outros stacks
  - Compartilhar o framework com outras áreas interessadas
- Call to action: "O framework é replicável. Qualquer time com Devin pode adotar."
- Contato / agradecimento

## Identidade Visual
- **Tema**: Dark mode (background ~oklch(0.14 0.008 250))
- **Cor primária**: Laranja Itaú (oklch(0.68 0.21 40))
- **Fontes**: Itau Display (headlines) + Itau Text (corpo). Fallback: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Ícones**: Lucide React
- **Logo**: Usar `/public/itau.svg` no header
- **Efeitos**: Glassmorphism (glass-card, glass-card-strong), gradientes sutis, glow-primary, animações com Framer Motion
- **Cores de referência** (do CSS fornecido):
  - Primary: oklch(0.68 0.21 40) — laranja Itaú
  - Background: oklch(0.14 0.008 250) — dark
  - Card: oklch(0.19 0.012 250) — elevated dark
  - Foreground: oklch(0.94 0 0) — texto claro
  - Muted: oklch(0.60 0 0) — texto secundário
  - Positive/Buy: oklch(0.64 0.17 155) — verde
  - Negative/Sell: oklch(0.63 0.21 25) — vermelho

## Navegação
- Setas do teclado (← →) para navegar entre slides
- Barra de navegação inferior com indicador de progresso (auto-hide, aparece no hover/keypress)
- Transições suaves entre slides (Framer Motion)
- Cada slide tem animações de entrada (staggered)

## Stack Técnico
- **Base**: Usar o projeto template fornecido como ponto de partida
- **Stack**: React 19 + Vite + Tailwind CSS 4 + Framer Motion
- **Componentes reutilizáveis do template**: SlideTransition, BottomNav, FlowDiagram (FlowNode + FlowArrow), AnimatedCounter, useSlideNavigation
- **CSS base**: Manter index.css com as classes utilitárias (.slide, .glass-card, .glass-card-strong, .glow-primary, .text-gradient-primary, .bg-gradient-dark, .bg-gradient-radial, etc.)
- **Sem dependências externas de apresentação** (reveal.js, etc.)

## Instruções para Claude Code
1. Usar o projeto template como base (copiar estrutura, componentes, hooks, CSS)
2. Substituir os slides existentes pelos 10 slides definidos acima
3. Manter os componentes reutilizáveis (BottomNav, SlideTransition, FlowDiagram, AnimatedCounter)
4. Manter a identidade visual e os padrões de CSS do template
5. No slide 8 (PoC), criar um placeholder visual atraente com espaço para screenshots/demo — pode ser um glass-card grande com ícone de play e texto "Demo ao vivo" ou grid de placeholder para screenshots
6. Os diagramas nos slides 5, 6 e 7 devem ser interativos (hover revela detalhes) usando os componentes FlowNode/FlowArrow do template
7. O slide 9 (adoção progressiva) deve ter um visual de níveis interativo (click para expandir cada nível)
8. Colocar o itau.svg no /public/ e referenciá-lo no header do cover slide
9. Garantir que funciona em 1920x1080 (apresentação) e 1366x768 (laptop)
10. Todas as animações devem usar Framer Motion com staggered delays para entrada suave

## Restrições
- NÃO mencionar valores de contrato ou custos do Devin
- NÃO entrar em detalhes profundos de implementação (código, configs)
- NÃO fazer parecer que AI substitui desenvolvedores — mensagem é "multiplica capacidade"
- NÃO ser genérico sobre AI — foco é no método específico que construímos
- MANTER tom executivo e profissional — é apresentação para diretoria de banco
- O slide da PoC (8) deve ter placeholder — o apresentador vai fazer demo ao vivo ou inserir screenshots
