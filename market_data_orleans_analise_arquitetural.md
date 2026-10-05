# Análise Arquitetural --- Market Data Feeder, Microsoft Orleans e Grains

> Documento consolidado a partir da discussão sobre o diagrama
> arquitetural apresentado, incluindo descrição da arquitetura,
> introdução ao Microsoft Orleans/Virtual Actor Model, interpretação dos
> grains e revisão crítica com alternativas arquiteturais.
>
> **Nota:** algumas interpretações abaixo são inferidas a partir do
> diagrama. Pontos não visíveis no desenho podem já estar tratados na
> implementação.

------------------------------------------------------------------------

# 1. Visão geral da arquitetura

A solução implementa um pipeline de **ingestão, normalização e
publicação de market data**, separando explicitamente o domínio de
conectividade com provedores externos do domínio de instrumentos.

A comunicação entre esses dois lados ocorre por meio de um **contrato
canônico compartilhado**, enquanto configuração e estado operacional são
tratados separadamente.

A arquitetura está dividida em dois service hosts principais:

-   **FeederServiceHost** --- responsável por estabelecer e gerenciar
    conexões com provedores de market data e transformar seus formatos
    proprietários em uma representação canônica.
-   **InstrumentServiceHost** --- responsável por consumir essas
    atualizações canônicas e materializá-las/publicá-las no modelo de
    instrumentos.

Entre esses dois domínios existe o **MarketDataFeederContracts**, que
funciona como a fronteira contratual da solução.

Esse componente contém apenas interfaces Orleans, entidades, DTOs,
resultados e comandos de publicação compartilhados e retrocompatíveis.
Ele não contém lógica de protocolo nem dependências dos hosts.

O principal objeto de integração mostrado no desenho é o
`CanonicalMarketUpdate`, que representa uma atualização de mercado
independentemente da origem.

Em alto nível:

``` text
Source / Protocol
       ↓
     Adapter
       ↓
  Normalization
       ↓
Canonical Contract
       ↓
Instrument Processing
       ↓
   Publication
```

Enquanto a configuração segue um caminho ortogonal:

``` text
Components
    ↓
ConfigurationStore
    ↓
Valkey
```

------------------------------------------------------------------------

# 2. Lado Feeder

Dentro do `FeederServiceHost`, o `FeederCatalogWorker` descobre as
conexões habilitadas a partir da configuração e garante, de forma
idempotente, a existência dos respectivos control planes.

Cada conexão é representada por um `FeederControlGrain`, responsável
pelo ciclo de vida lógico daquela conexão e pela coordenação dos demais
componentes associados a ela.

A conexão física com o provedor é mantida pelo `FeederConnectionGrain`.

A abstração dos protocolos e formatos específicos de cada mercado fica a
cargo do `FeederAdapterRegistry`, que seleciona/gerencia adapters como:

-   `AgenciaEstadoAdapter`
-   `GateloSpotAdapter`
-   `GateloFuturesAdapter`

Dessa forma, particularidades dos provedores ficam confinadas à camada
de adapters.

As mensagens produzidas pelos adapters são entregues ao
`NormalizationEngine`, que aplica os mapeamentos necessários e converte
os diferentes modelos proprietários para o contrato canônico
`CanonicalMarketUpdate`.

------------------------------------------------------------------------

# 3. Configuração

O `ConfigurationStore` constitui a fronteira tipada de acesso à
configuração autoritativa.

Ele permite:

-   descobrir `connectionIds` habilitados;
-   ler configurações tipadas;
-   aplicar CAS/ETL nativo;
-   isolar dos componentes de domínio detalhes da persistência;
-   isolar decisões físicas como Hash versus JSON.

A persistência propriamente dita encontra-se no **Valkey 8.0.1**,
acessado através da infraestrutura indicada no desenho como
`itau-md4-dep-infra-cache`.

Assim, idealmente, os componentes de domínio não dependem diretamente do
mecanismo físico de armazenamento.

------------------------------------------------------------------------

# 4. Lado Instrument

Após a normalização, as atualizações `CanonicalMarketUpdate` atravessam
a fronteira entre os hosts e são recebidas pelo `InstrumentServiceHost`.

Nesse domínio existem duas granularidades de processamento Orleans:

### InstrumentListGrain

Responsável por receber atualizações e montar publicações relacionadas a
listas de instrumentos.

### InstrumentGrain

Responsável pelo processamento e publicação no nível de instrumento
individual.

Ambos produzem um envelope técnico de publicação, posteriormente
entregue ao `PublicationAdapter`, que encapsula a integração com o
mecanismo de publicação externo.

------------------------------------------------------------------------

# 5. Princípio arquitetural central

Um dos principais méritos conceituais da arquitetura é que **Feeder e
Instrument não precisam compartilhar conhecimento sobre os detalhes
internos um do outro**.

Eles compartilham contratos estáveis definidos em
`MarketDataFeederContracts`.

O Feeder conhece protocolos e formatos externos, mas entrega uma
representação canônica.

O Instrument conhece a semântica e publicação dos instrumentos, mas não
deveria precisar conhecer de qual provedor ou protocolo a informação se
originou.

Isso cria aproximadamente:

``` text
Source/Protocol
      ↓
    Adapter
      ↓
Normalization
      ↓
Canonical Contract
      ↓
Instrument Processing
      ↓
Publication
```

------------------------------------------------------------------------

# 6. O que é Microsoft Orleans?

**Microsoft Orleans** é um framework .NET para construção de sistemas
distribuídos baseado no chamado **Virtual Actor Model**.

A mudança mental principal é deixar de pensar primeiro em
servidores/processos e passar a pensar em **entidades lógicas
distribuídas**, chamadas **grains**.

Um grain pode representar, por exemplo:

-   uma conexão com uma exchange;
-   um instrumento financeiro;
-   uma conta;
-   um usuário;
-   uma ordem.

No sistema analisado, conceitualmente poderíamos ter:

``` text
InstrumentGrain("PETR4")
InstrumentGrain("VALE3")
InstrumentGrain("BTCUSD")

FeederConnectionGrain("GATELO-SPOT")
FeederConnectionGrain("GATELO-FUTURES")
```

O Orleans se encarrega de descobrir em qual processo/máquina determinado
grain está rodando, ativá-lo quando necessário e encaminhar chamadas até
ele.

------------------------------------------------------------------------

# 7. O que é um Grain?

Uma forma útil de pensar em um grain é:

> **objeto + identidade única + estado + mailbox de mensagens + execução
> controlada pelo Orleans**

Uma interface conceitual poderia ser:

``` csharp
public interface IInstrumentGrain : IGrainWithStringKey
{
    Task OnMarketUpdate(CanonicalMarketUpdate update);
}
```

E uma implementação simplificada:

``` csharp
public class InstrumentGrain : Grain, IInstrumentGrain
{
    private decimal _lastPrice;

    public Task OnMarketUpdate(CanonicalMarketUpdate update)
    {
        _lastPrice = update.Price;

        // Decide o que publicar...

        return Task.CompletedTask;
    }
}
```

O código cliente não instancia diretamente um `InstrumentGrain`.

Conceitualmente:

``` csharp
var petr4 = grainFactory.GetGrain<IInstrumentGrain>("PETR4");

await petr4.OnMarketUpdate(update);
```

O Orleans resolve algo como:

``` text
"Existe um InstrumentGrain de PETR4 ativo?"

             ↓

       não            sim
        ↓              ↓
     ativa-o       encontra-o
        \              /
         \            /
          ↓          ↓

     encaminha OnMarketUpdate()
```

Quem chamou não precisa saber em qual servidor, processo ou thread PETR4
está.

------------------------------------------------------------------------

# 8. Por que "Virtual Actor"?

Imagine que existam 50 mil instrumentos possíveis.

Conceitualmente:

``` text
InstrumentGrain("PETR4")
InstrumentGrain("VALE3")
InstrumentGrain("ITUB4")
...
InstrumentGrain("BTCUSD")
...
```

Isso não significa necessariamente que existam 50 mil objetos
permanentemente vivos em memória.

Eles são **atores virtuais**.

O Orleans pode ativar um grain quando ele é necessário e desativá-lo
posteriormente. A identidade lógica continua existindo.

Um bom modelo mental é:

> `InstrumentGrain("PETR4")` existe conceitualmente de maneira
> permanente. Onde e quando ele está materializado é responsabilidade do
> Orleans.

------------------------------------------------------------------------

# 9. Grains e concorrência

Essa característica é especialmente interessante em market data.

Imagine:

``` text
Update #101 PETR4 ────┐
                      ├──→ InstrumentGrain("PETR4")
Update #102 PETR4 ────┘
```

Em programação multithread tradicional, rapidamente surgem preocupações
como:

``` text
lock
mutex
ConcurrentDictionary
race condition
thread safety
```

O modelo de actors simplifica bastante isso.

Por padrão, um grain processa suas chamadas de forma
controlada/serializada, evitando que execuções arbitrárias alterem
simultaneamente o estado daquele actor.

Modelo mental:

``` text
InstrumentGrain("PETR4")

mailbox
┌───────────────┐
│ update #101   │
│ update #102   │
│ update #103   │
└───────────────┘
       ↓

processa #101
       ↓
processa #102
       ↓
processa #103
```

Enquanto isso, outro actor:

``` text
InstrumentGrain("VALE3")
```

pode processar em paralelo.

Assim:

``` text
PETR4: 101 → 102 → 103
                 sequencial

VALE3: 201 → 202 → 203
                 sequencial
```

mas diferentes instrumentos podem explorar paralelismo:

``` text
PETR4 ──────────────→
VALE3 ──────────────→
ITUB4 ──────────────→
BTC   ──────────────→

       paralelismo
```

Há nuances importantes sobre reentrância, ordering entre chamadas,
streams e scheduling, mas esse é um bom modelo mental inicial.

------------------------------------------------------------------------

# 10. O que é um Silo?

Um **Silo** é, simplificando, um processo/host Orleans que executa
grains.

Exemplo:

``` text
                Orleans Cluster

     ┌──────────────┐
     │    Silo A    │
     │              │
     │ PETR4 Grain  │
     │ VALE3 Grain  │
     └──────────────┘

     ┌──────────────┐
     │    Silo B    │
     │              │
     │ ITUB4 Grain  │
     │ BTCUSD Grain │
     └──────────────┘

     ┌──────────────┐
     │    Silo C    │
     │              │
     │ DOL Grain    │
     │ DI1 Grain    │
     └──────────────┘
```

Quem chama:

``` csharp
GetGrain<IInstrumentGrain>("PETR4")
```

não precisa saber que PETR4 está no Silo A.

O runtime do Orleans resolve isso.

Ao adicionar máquinas/containers ao cluster, o Orleans passa a ter mais
capacidade para distribuir ativações.

------------------------------------------------------------------------

# 11. Interpretando os grains do desenho

## FeederControlGrain

O desenho diz que ele:

> controla o ciclo de vida da conexão e coordena os componentes do
> feeder.

Uma interpretação provável seria:

``` text
FeederControlGrain(connectionId)
```

Por exemplo:

``` text
FeederControlGrain("GATELO-SPOT")
FeederControlGrain("GATELO-FUTURES")
FeederControlGrain("AGENCIA-ESTADO")
```

Cada um representa logicamente uma conexão configurada.

## FeederConnectionGrain

O desenho diz que ele:

> gerencia a conexão física e envia atualizações canônicas.

Isso sugere:

``` text
FeederControlGrain
       │
       │ controle/orquestração
       ↓
FeederConnectionGrain
       │
       │ conexão propriamente dita
       ↓
market data
```

É uma interpretação do desenho; o código é necessário para confirmar a
implementação exata.

## InstrumentGrain

Imagine uma atualização:

``` text
CanonicalMarketUpdate
instrumentId = "PETR4"
price = 42.37
sequence = 93722
```

A aplicação poderia conceitualmente fazer:

``` csharp
var instrument =
    grainFactory.GetGrain<IInstrumentGrain>("PETR4");

await instrument.Update(marketUpdate);
```

Fluxo:

``` text
                   Orleans

CanonicalMarketUpdate
        │
        │ instrumentId = PETR4
        ↓
InstrumentGrain("PETR4")
        │
        │ processa estado
        │ monta publicação
        ↓
PublicationAdapter
```

VALE3 poderia ir para:

``` text
InstrumentGrain("VALE3")
```

BTC para:

``` text
InstrumentGrain("BTCUSD")
```

A própria chave do domínio passa a ser uma unidade natural de
processamento e isolamento de concorrência.

------------------------------------------------------------------------

# 12. Analogia com uma estrutura convencional

Uma aproximação mental útil é imaginar:

``` csharp
Dictionary<InstrumentId, InstrumentProcessor>
```

onde cada `InstrumentProcessor`:

-   tem identidade;
-   guarda seu próprio estado;
-   recebe mensagens;
-   processa chamadas de forma controlada.

Agora imagine que esse dictionary é **distribuído entre vários
servidores** e existe infraestrutura que:

-   encontra onde está cada objeto;
-   cria/ativa quando necessário;
-   roteia chamadas;
-   gerencia o cluster;
-   recupera de falhas;
-   permite persistência de estado;
-   escala horizontalmente.

Isso começa a se aproximar do que Orleans oferece.

A mudança mental é:

> **não pense primeiro em servidores; pense em entidades.**

Em vez de perguntar:

``` text
Qual instância do InstrumentService processa PETR4?
```

o código pode pensar:

``` text
InstrumentGrain("PETR4").Process(update)
```

e deixar a infraestrutura resolver a localização.

------------------------------------------------------------------------

# 13. Por que Orleans parece conceitualmente adequado --- e o primeiro alerta

`connectionId` e `instrumentId` são candidatos naturais a actor
identities.

Serializar processamento por entidade também pode reduzir bastante a
complexidade de concorrência.

Entretanto, surge uma pergunta importante:

> **Qual é exatamente a granularidade escolhida para cada grain e qual é
> o throughput máximo esperado por grain?**

Se PETR4 recebe:

``` text
10 updates/s
```

provavelmente não há problema.

Mas se algum objeto recebe:

``` text
100.000 updates/s
```

e tudo precisa atravessar uma única unidade lógica sequencial, aquele
grain pode virar um **hotspot**.

------------------------------------------------------------------------

# 14. Revisão arquitetural detalhada

## 14.1 Granularidade dos Grains

### Preocupação

Qual entidade do domínio justifica cada Grain e qual é sua chave?

O desenho contém:

-   `FeederControlGrain`
-   `FeederConnectionGrain`
-   `InstrumentListGrain`
-   `InstrumentGrain`

mas não explicita completamente a cardinalidade.

Por exemplo:

``` text
InstrumentGrain
      ↓
1 por instrumentId?
1 por instrumentId + source?
1 por connectionId + instrumentId?
```

### Risco

Se houver um grain por instrumento:

``` text
PETR4 → Grain PETR4
VALE3 → Grain VALE3
BTCUSD → Grain BTCUSD
```

é uma granularidade bastante natural.

Porém, se houver algo como:

``` text
InstrumentListGrain("B3")
```

recebendo atualizações de milhares de instrumentos, ele pode virar um
**hot grain**.

Mesmo um cluster grande não necessariamente resolve:

``` text
100 silos
   ↓
InstrumentListGrain("B3")
   ↓
1 unidade lógica serializada
```

### Comentário / solução

Definir explicitamente a unidade de paralelismo:

``` text
connectionId
instrumentId
publicationGroupId
```

e medir:

``` text
updates/s por Grain
tempo médio de processamento
p99/p99.9
mailbox depth
```

Essa informação deveria fazer parte da validação da arquitetura.

------------------------------------------------------------------------

## 14.2 Orleans pode estar sendo usado onde Actor não é necessário

### Preocupação

Um erro possível com actor frameworks é transformar tudo em actor apenas
porque o framework está disponível.

`InstrumentGrain` parece um candidato natural.

`FeederControlGrain` também pode ser.

Já `FeederConnectionGrain` merece investigação, porque uma conexão
física TCP/WebSocket/FIX é diferente de uma entidade lógica virtual.

### Problema conceitual

Grains são muito bons para:

> "Existe logicamente uma entidade X com identidade X."

Uma conexão física é um **recurso efêmero**.

``` text
Grain
  ≠
socket
```

Se houver lifecycle, reconnect, socket state, heartbeat, sequence state
etc., misturar o lifecycle físico da conexão com o lifecycle de
ativação/desativação do Orleans pode introduzir complexidade.

### Alternativa

Separar:

``` text
FeederControlGrain
        ↓
ConnectionManager / Worker
        ↓
PhysicalConnection
```

O Grain mantém estado lógico:

``` text
desired state = connected
connectionId
generation
configuration
```

O worker mantém:

``` text
socket
buffers
heartbeat
reconnect
protocol state
```

Essa separação pode ser arquiteturalmente mais limpa.

------------------------------------------------------------------------

## 14.3 Ordering não está suficientemente definido no desenho

O contrato possui:

``` text
sessionGeneration
sequence
sourceTimestamp
```

Isso sugere preocupação com ordering/recovery, o que é positivo.

Mas o diagrama não define a semântica.

### Perguntas

Se chegam:

``` text
sequence 100
sequence 102
sequence 101
```

o que acontece?

E:

``` text
generation 7 / seq 999999
generation 8 / seq 1
```

Quem decide se uma mensagem é válida?

``` text
NormalizationEngine?
InstrumentGrain?
FeederConnectionGrain?
```

### Solução teórica

Formalizar uma ordem lógica:

``` text
LogicalSequence =
(sessionGeneration, sequence)
```

e definir:

``` text
duplicate       → discard
older           → discard
next sequence   → process
gap             → recovery/resync
new generation  → reset sequence state
```

Essa responsabilidade deveria possuir um owner claramente definido.

------------------------------------------------------------------------

## 14.4 Delivery semantics

### Preocupação

O desenho diz que atualizações canônicas são enviadas, mas não mostra
qual garantia de entrega existe.

Possibilidades:

``` text
at-most-once
at-least-once
effectively-once
```

### Cenário

``` text
Feeder
  ↓
InstrumentGrain recebe
  ↓
processa
  ↓
crash
  ↓
ACK?
```

A mensagem foi processada ou não?

### Solução / alternativa

Para market data, dependendo do caso, pode ser interessante:

``` text
at-least-once
+
idempotência
+
sequence
```

Em outros fluxos, **at-most-once** pode ser aceitável se perder um
update intermediário não for crítico e snapshots/resync reconstruírem o
estado.

O essencial é que seja uma decisão explícita.

------------------------------------------------------------------------

## 14.5 Snapshot e resynchronization

### Preocupação

Essa é uma lacuna importante no desenho.

Market data frequentemente não pode depender indefinidamente de:

``` text
delta
delta
delta
delta
...
```

### Cenário

Recebemos:

``` text
100
101
102
105
```

Faltaram:

``` text
103
104
```

### Solução

A arquitetura deveria prever algo semelhante a:

``` text
detect gap
   ↓
mark stale
   ↓
request snapshot
   ↓
apply snapshot
   ↓
resume deltas
```

ou replay, quando o protocolo suportar.

Um modelo explícito de estado poderia ser:

``` text
ConnectionState
    │
    ├── Live
    ├── Stale
    ├── Recovering
    └── Disconnected
```

------------------------------------------------------------------------

## 14.6 `CanonicalMarketUpdate` pode virar um "God DTO"

### Preocupação

O modelo canônico é uma boa abstração:

``` text
Provider A ─┐
Provider B ─┼→ CanonicalMarketUpdate
Provider C ─┘
```

Mas existe uma armadilha.

Com o tempo ele pode virar:

``` text
CanonicalMarketUpdate

Price?
Yield?
Bid?
Ask?
Depth?
Settlement?
Status?
Auction?
Greeks?
OpenInterest?
...
```

com muitos campos opcionais.

### Risco

O modelo canônico vira a união de todos os protocolos existentes e
começa a vazar peculiaridades dos adapters.

### Alternativa

Contratos semanticamente distintos:

``` text
MarketUpdate
 ├── TradeUpdate
 ├── TopOfBookUpdate
 ├── BookUpdate
 ├── InstrumentStatusUpdate
 ├── SettlementUpdate
 └── ReferenceDataUpdate
```

ou:

``` text
CanonicalMarketEvent
    header
    payload
```

com payload fortemente tipado.

------------------------------------------------------------------------

## 14.7 `updatedKind` merece atenção

Se `updatedKind` significa algo como:

``` text
Price
Book
Status
Trade
...
```

e o significado do restante do DTO varia em função desse campo, pode
existir um **union type informal**.

Exemplo conceitual problemático:

``` text
if updatedKind == Book
    field X significa A

if updatedKind == Trade
    field X significa B
```

### Alternativa

Utilizar tipos explicitamente discriminados.

Benefícios:

-   type safety;
-   clareza;
-   versionamento;
-   observabilidade.

------------------------------------------------------------------------

## 14.8 Contrato compartilhado e coupling de deployment

### Preocupação

O desenho enfatiza contratos compartilhados e retrocompatíveis, o que é
positivo.

Porém:

``` text
FeederServiceHost
        ↓
MarketDataFeederContracts
        ↑
InstrumentServiceHost
```

cria coupling semântico em torno do mesmo contrato/package.

### Pergunta

O que ocorre quando:

``` text
Feeder = Contracts v12
Instrument = Contracts v10
```

?

### Solução

Política formal de compatibilidade:

``` text
additive changes → compatible
field removal    → forbidden
semantic change  → new version/type
```

e testes automatizados de contract compatibility.

------------------------------------------------------------------------

## 14.9 Caminho crítico potencialmente longo

O fluxo contém várias abstrações:

``` text
Feed
 ↓
Adapter
 ↓
Normalization
 ↓
Canonical contract
 ↓
Orleans
 ↓
Instrument grain
 ↓
PublicationAdapter
 ↓
Consumer
```

Cada abstração isoladamente pode ser justificável, mas para market data
importa o latency budget total.

Exemplo meramente ilustrativo:

``` text
wire
 ↓
adapter             10 µs
 ↓
normalization       15 µs
 ↓
serialization       20 µs
 ↓
Orleans routing     80 µs
 ↓
grain scheduling    50 µs
 ↓
publication         30 µs
```

Esses **não são números medidos do sistema**; servem apenas para mostrar
a metodologia.

### Solução

Definir instrumentação por estágio:

``` text
source timestamp
      ↓
T1 decode
      ↓
T2 normalize
      ↓
T3 dispatch
      ↓
T4 grain
      ↓
T5 publication
      ↓
consumer
```

Medir:

-   p50;
-   p95;
-   p99;
-   p99.9.

A média isolada é insuficiente para um sistema sensível a tail latency.

------------------------------------------------------------------------

## 14.10 Backpressure

### Preocupação

Imagine:

``` text
Feeder = 500k updates/s
Instrument = 300k updates/s
```

O que acontece com os outros 200k/s?

Sem política explícita:

``` text
queues ↑
memory ↑
latency ↑
GC ↑
latency ↑↑
```

até potencialmente ocorrer uma cascata de falhas.

### Alternativas

Para book incremental:

``` text
buffer/replay
```

Para informações em que apenas o estado mais recente interessa:

``` text
100
101
102
103
104

consumer atrasado

→ descarta intermediários
→ entrega 104
```

Isso é **conflation/coalescing**.

A política deveria ser definida por tipo de evento.

------------------------------------------------------------------------

## 14.11 Hot instruments

### Preocupação

Um instrumento muito ativo pode monopolizar uma unidade serializada.

Exemplo:

``` text
BTCUSD  → 50k msg/s
PETR4   → 100 msg/s
ABEV3   → 20 msg/s
```

O `InstrumentGrain("BTCUSD")` pode ficar permanentemente saturado.

### Alternativas

Particionamento adicional:

``` text
BTCUSD:book
BTCUSD:trade
BTCUSD:stats
```

ou retirar determinados workloads extremamente quentes do actor model.

Nem toda entidade precisa necessariamente seguir a mesma arquitetura.

------------------------------------------------------------------------

## 14.12 `InstrumentListGrain` como possível hotspot

### Preocupação

O desenho indica que o `InstrumentListGrain` recebe atualizações e monta
publicação de lista.

Se um único grain agregar muitos instrumentos, pode criar:

``` text
fan-in enorme
+
estado grande
+
serialização
+
hotspot
```

### Alternativa

Utilizar agregadores particionados:

``` text
InstrumentGrain
       ↓
partitioned aggregator
       ↓
List publication
```

Por exemplo:

``` text
ListPartitionGrain(0)
ListPartitionGrain(1)
...
ListPartitionGrain(31)
```

e somente depois compor uma lista global, caso seja necessário.

------------------------------------------------------------------------

## 14.13 ConfigurationStore no hot path

### Preocupação

A separação:

``` text
Components
    ↓
ConfigurationStore
    ↓
Valkey
```

é conceitualmente boa.

Mas é importante saber se a configuração é lida apenas em startup/change
ou durante cada processamento de market data.

Um cenário como:

``` text
cada update
   ↓
ConfigurationStore
   ↓
Valkey
```

seria preocupante.

### Alternativa

``` text
Valkey
   ↓
ConfigurationStore
   ↓
local immutable snapshot
   ↓
hot path
```

Atualizações:

``` text
config changed
     ↓
atomic swap
     ↓
new snapshot
```

Idealmente, o hot path deveria ser praticamente **zero-I/O**.

------------------------------------------------------------------------

## 14.14 Valkey não deveria ser dependência de disponibilidade do data plane

### Preocupação

Se Valkey cair, o market data deveria parar?

Idealmente, não, desde que a configuração necessária já esteja
carregada.

### Modelo desejável

``` text
Valkey down

Existing connections → continuam
New configuration    → indisponível
```

Isso reduz o blast radius.

------------------------------------------------------------------------

## 14.15 Versionamento de configuração

O desenho menciona CAS/ETL/configuração.

Seria útil possuir algo como:

``` text
ConfigurationVersion
```

para cada configuração.

Assim:

``` text
connection X
config v17
```

e logs/traces podem registrar:

``` text
update processed
connection=X
configVersion=17
```

Isso facilita significativamente a investigação de incidentes.

------------------------------------------------------------------------

## 14.16 Ownership de estado

### Preocupação

Há estado potencial em:

``` text
FeederControlGrain
FeederConnectionGrain
Adapter
NormalizationEngine
InstrumentGrain
Valkey
```

É importante definir quem é a fonte da verdade de cada informação.

Por exemplo:

``` text
lastSequence
```

fica onde?

Duplicar ownership de estado torna recovery perigoso.

### Solução

Uma matriz de ownership poderia ser:

  Estado                     Owner
  -------------------------- ------------------------
  Desired connection state   FeederControl
  Physical connection        Connection Worker
  Protocol sequence          Connection/Adapter
  Canonical sequence         Normalization
  Last applied sequence      Instrument
  Configuration              ConfigurationStore
  Publication state          Instrument/Publication

Princípio:

> um estado importante deve possuir um owner claro.

------------------------------------------------------------------------

## 14.17 Recovery de Grain

### Cenário

``` text
InstrumentGrain("PETR4")
lastSequence = 1000

        💥 silo morre
```

Outro silo ativa PETR4.

Como ele sabe que estava em `1000`?

### Opções

Persistir:

``` text
lastSequence
```

Porém persistir a cada market update pode ser extremamente caro.

Outra opção é aceitar estado efêmero e recuperar por:

``` text
snapshot/resync
```

Para market data, estado reconstruível pode ser uma escolha bastante
interessante.

------------------------------------------------------------------------

## 14.18 Persistir cada update provavelmente seria caro

Se cada update causar persistência do estado do grain:

``` text
cada update → persist grain state
```

um fluxo originalmente in-memory passa a depender de armazenamento
distribuído no hot path.

### Alternativa

Tratar boa parte do estado como:

> **reconstructible ephemeral state**

Em caso de falha:

``` text
restart
 ↓
snapshot
 ↓
resume
```

------------------------------------------------------------------------

## 14.19 Isolamento de falha de adapters

Se:

``` text
GateloSpotAdapter
```

entra em loop de exceção, idealmente isso não deveria derrubar:

``` text
GateloFutures
AgenciaEstado
```

### Solução

Definir fault domains:

``` text
connection
adapter
provider
host
cluster
```

e garantir isolamento.

Feeds particularmente críticos podem até justificar processos separados.

------------------------------------------------------------------------

## 14.20 Reconnect storm

### Cenário

Existem 100 conexões.

O provedor fica indisponível por 30 segundos e retorna.

Todos tentam:

``` text
reconnect()
reconnect()
reconnect()
reconnect()
```

ao mesmo tempo.

### Solução

Exponential backoff + jitter:

``` text
1s
2s
4s
8s
...
```

com aleatoriedade.

Pode também haver rate limiting por provider.

------------------------------------------------------------------------

## 14.21 Slow consumer

### Preocupação

Se:

``` text
InstrumentGrain
     ↓ await
PublicationAdapter
     ↓
slow consumer
```

o consumidor lento pode bloquear o processamento do grain.

### Alternativa

``` text
InstrumentGrain
      ↓
bounded publication queue
      ↓
Publication Workers
```

com política explícita de overflow/backpressure.

------------------------------------------------------------------------

## 14.22 Observabilidade

A observabilidade deveria ser parte central da arquitetura.

Métricas úteis:

``` text
updates_received_total
updates_normalized_total
updates_published_total

sequence_gap_total
duplicate_total
stale_update_total

connection_reconnect_total

grain_queue_depth
grain_processing_latency

source_to_normalized_latency
source_to_publish_latency

publication_queue_depth
```

Especialmente:

``` text
sourceTimestamp
       ↓
publicationTimestamp
```

para medir **tick-to-publish latency**.

------------------------------------------------------------------------

## 14.23 Cardinalidade das métricas

Ao mesmo tempo, métricas como:

``` text
latency{instrumentId="PETR4"}
latency{instrumentId="VALE3"}
...
```

para centenas de milhares de instrumentos podem criar cardinalidade
excessiva.

### Alternativa

Usar métricas agregadas de baixa cardinalidade e colocar:

``` text
instrumentId
connectionId
sequence
```

em traces/logs amostrados ou mecanismos específicos de diagnóstico.

------------------------------------------------------------------------

## 14.24 Garbage Collection

Em .NET + market data, allocation rate pode ser relevante.

Se cada update cria:

``` text
DTO
envelope
message
normalized DTO
publication DTO
```

podem surgir milhões de short-lived allocations.

Resultado possível:

``` text
allocation rate ↑
GC ↑
tail latency ↑
```

### Alternativas

Medir allocations/update e avaliar:

-   `struct` quando apropriado;
-   pooling;
-   `Span<T>` / `Memory<T>`;
-   buffers reutilizáveis;
-   serialização binária;
-   evitar LINQ no hot path;
-   reduzir transformações de objetos.

**Allocations/update** deveria fazer parte dos benchmarks.

------------------------------------------------------------------------

## 14.25 Serialização

Se os hops Orleans serializam objetos, o formato pode importar.

Possibilidades:

``` text
MessagePack
Protobuf
Orleans serializers
custom binary
```

JSON provavelmente não seria a primeira opção para um hot path de market
data sensível a latência.

Mas a regra continua sendo:

> medir antes de otimizar.

Se serialização representa 3% da latência, talvez não valha aumentar a
complexidade.

Se representa 35%, pode valer bastante.

------------------------------------------------------------------------

## 14.26 Deployment compatibility

Durante rolling deployment pode existir:

``` text
Feeder v12
Instrument v11
```

por alguns minutos.

Isso precisa funcionar.

### Solução

Contract testing cobrindo:

``` text
N ↔ N
N ↔ N-1
N ↔ N+1
```

e schema evolution explícito.

------------------------------------------------------------------------

## 14.27 Replay

### Preocupação

Ausência de replay dificulta reprodução de incidentes.

Seria útil capturar:

``` text
raw market data
```

ou:

``` text
CanonicalMarketUpdate
```

e reproduzir posteriormente.

### Arquitetura

``` text
produção
  ↓ capture
arquivo/log
  ↓ replay
ambiente de teste
```

Um mecanismo opcional:

``` text
Capture → durable log → Replay
```

pode ficar fora do hot path principal.

------------------------------------------------------------------------

## 14.28 `NormalizationEngine` como possível hotspot

Se todos os adapters convergirem para uma única instância:

``` text
Provider A ─┐
Provider B ─┼→ NormalizationEngine
Provider C ─┘
```

ela pode se tornar gargalo.

### Alternativa

Normalização particionada:

``` text
Adapter A → Normalizer A
Adapter B → Normalizer B
Adapter C → Normalizer C
```

ou workers stateless horizontalmente escaláveis.

Se normalização for essencialmente:

``` text
output = normalize(input, config)
```

ela é candidata natural a paralelização.

------------------------------------------------------------------------

## 14.29 Separação entre protocol decoding e semantic normalization

É útil distinguir:

``` text
wire format
     ↓
protocol decoding
     ↓
provider semantic model
     ↓
canonical semantic model
```

Evitaria concentrar todas essas responsabilidades em um único
componente.

Exemplo:

``` text
GateloAdapter
"campo 17 significa BidPx"

        ↓

GateloMarketUpdate

        ↓

Normalization

        ↓

CanonicalTopOfBook
```

Isso facilita testes e separação de responsabilidades.

------------------------------------------------------------------------

## 14.30 Failure boundary entre hosts

O desenho separa:

``` text
FeederServiceHost
InstrumentServiceHost
```

Isso pode ser positivo, mas a razão deveria ser explícita.

Boas justificativas incluem:

``` text
fault isolation
independent scaling
deployment independence
security boundary
resource isolation
```

Se a separação existir apenas por organização lógica, talvez haja
complexidade operacional desnecessária.

------------------------------------------------------------------------

# 15. Pontos que deveriam ser explicitados na documentação arquitetural

Além da estrutura estática, uma documentação madura deveria explicar:

## Por que Orleans/Grains?

-   Qual estado pertence ao grain?
-   Qual é a chave?
-   Qual garantia de serialização/concorrência está sendo explorada?
-   Como ocorre reativação?
-   Como ocorre recovery?

## Semântica do `CanonicalMarketUpdate`

Especialmente:

-   `updateId`
-   `connectionId`
-   `instrumentId`
-   `updatedKind`
-   `sourceTimestamp`
-   `sessionGeneration`
-   `sequence`

E quais deles garantem:

-   ordering;
-   deduplicação;
-   detecção de gaps;
-   recuperação após reconnect.

## Delivery semantics

Definir:

-   at-most-once;
-   at-least-once;
-   effectively-once;
-   retry;
-   duplicatas;
-   out-of-order.

## Backpressure e throughput

O que ocorre se o Instrument consumir mais lentamente que o Feeder
produz?

## Fault isolation

Queda de um adapter/conexão deve comprometer outras conexões?

## Versionamento

Como `MarketDataFeederContracts` mantém retrocompatibilidade durante
deploy independente?

## Observabilidade

Métricas por:

-   conexão;
-   sequência;
-   lag;
-   reconnect;
-   gaps;
-   throughput;
-   erros de normalização.

## HA e recovery

O que ocorre quando:

-   `FeederServiceHost` reinicia;
-   `InstrumentServiceHost` reinicia;
-   um Silo Orleans morre;
-   Valkey fica indisponível.

------------------------------------------------------------------------

# 16. Alternativas arquiteturais para o sistema como um todo

## Arquitetura A --- Orleans end-to-end

Aproximadamente:

``` text
Feed
 ↓
Feeder Grains
 ↓
Adapters
 ↓
Normalization
 ↓
Instrument Grains
 ↓
Publication
```

### Vantagens

-   excelente modelo de domínio;
-   concorrência simplificada;
-   scaling transparente;
-   localização automática;
-   boa tolerância a falhas;
-   abstração forte sobre distribuição.

### Desvantagens

-   runtime/distributed-system overhead;
-   routing/serialization/scheduling adicionais;
-   risco de hot grains;
-   tail latency potencialmente menos previsível;
-   maior dependência das semânticas do Orleans.

### Quando escolher

Quando dezenas/centenas de microssegundos adicionais forem aceitáveis e
produtividade, modelagem e resiliência forem mais importantes do que
latência extrema.

------------------------------------------------------------------------

# 17. Arquitetura B --- Pipeline stateless particionado

Modelo:

``` text
                        ┌→ Worker partition 0
Feed → Normalize → Hash ┼→ Worker partition 1
                        ├→ Worker partition 2
                        └→ Worker partition N
```

Partição:

``` text
partition =
hash(instrumentId) % N
```

Assim:

``` text
PETR4 → partition 7
VALE3 → partition 2
PETR4 → partition 7
```

Ordering por instrumento pode ser preservado sem necessariamente usar
actors.

### Vantagens

-   latência excelente;
-   throughput excelente;
-   hot path simples;
-   comportamento previsível;
-   boa cache locality.

### Desvantagens

É necessário gerenciar explicitamente:

-   rebalanceamento;
-   partition ownership;
-   recovery;
-   distribuição;
-   scaling.

Para market data de baixa latência, é uma alternativa particularmente
interessante.

------------------------------------------------------------------------

# 18. Arquitetura C --- Event Streaming

Exemplo:

``` text
Feed
 ↓
Normalize
 ↓
Kafka / Redpanda
 ↓
partition by instrumentId
 ↓
Instrument processors
 ↓
Publication
```

### Vantagens

-   replay excelente;
-   durabilidade;
-   desacoplamento;
-   scaling claro;
-   recovery;
-   auditoria;
-   integração fácil com múltiplos consumidores.

### Desvantagens

-   latência adicional;
-   infraestrutura adicional;
-   I/O;
-   maior complexidade operacional.

Muito atraente para:

``` text
market data histórico
analytics
downstream distribution
```

Menos atraente como caminho crítico de:

``` text
ultra-low-latency pricing/RFQ
```

------------------------------------------------------------------------

# 19. Arquitetura D --- Pipeline in-process otimizado

Modelo:

``` text
Socket
 ↓
Protocol Decoder
 ↓
Normalizer
 ↓
Partitioned in-memory queue
 ↓
Instrument Processor
 ↓
Publisher
```

Tudo dentro do mesmo processo ou de poucos processos.

### Vantagens

-   latência mínima;
-   quase nenhuma serialização;
-   ótima cache locality;
-   controle fino de memória;
-   controle fino de GC;
-   throughput muito alto.

### Desvantagens

-   menor isolamento;
-   scaling mais manual;
-   recovery mais difícil;
-   mais engenharia especializada;
-   maior responsabilidade do time pela concorrência e lifecycle.

É uma direção típica quando cada microssegundo realmente importa.

------------------------------------------------------------------------

# 20. Arquitetura E --- Híbrida

Uma hipótese particularmente interessante seria separar **control
plane** de **data plane**.

``` text
                 CONTROL PLANE

             Orleans
                │
       ┌────────┴─────────┐
       ↓                  ↓
Connection Control    Configuration
Lifecycle             Coordination


                  DATA PLANE

Market Feed
    ↓
Physical Connection Worker
    ↓
Protocol Adapter
    ↓
Normalizer
    ↓
Partitioned in-memory pipeline
    ↓
Instrument Processor
    ↓
Publication
```

## Orleans no control plane

Aproveita Orleans onde ele é especialmente forte:

``` text
lifecycle
coordination
distributed identity
configuration
failover
```

## Pipeline otimizado no data plane

Evita obrigatoriamente colocar cada tick de market data através de:

``` text
grain lookup
routing
mailbox
serialization
grain scheduling
```

### Trade-off

É uma arquitetura sofisticada, pois combina dois modelos operacionais.

Em contrapartida, pode oferecer excelente equilíbrio entre:

-   latência;
-   throughput;
-   resiliência;
-   clareza de domínio;
-   escalabilidade.

------------------------------------------------------------------------

# 21. Matriz comparativa inicial

  ---------------------------------------------------------------------------------------------------------------
  Arquitetura             Latência      Throughput     Resiliência          Replay   Complexidade   Flexibilidade
                                                                                      operacional 
  ---------------- --------------- --------------- --------------- --------------- -------------- ---------------
  Orleans                      Boa             Boa   **Excelente**           Médio          Média   **Excelente**
  end-to-end                                                                                      

  Pipeline           **Excelente**   **Excelente**             Boa           Baixo          Média             Boa
  particionado                                                                                    

  Kafka/Redpanda             Média   **Excelente**   **Excelente**   **Excelente**           Alta   **Excelente**

  In-process            **Máxima**      **Máxima**           Média           Baixo           Alta           Média
  otimizado                                                                                       

  **Híbrida**        **Excelente**   **Excelente**   **Excelente**    Configurável           Alta   **Excelente**
  ---------------------------------------------------------------------------------------------------------------

Essa matriz é qualitativa e deve ser validada contra os requisitos e
benchmarks reais.

------------------------------------------------------------------------

# 22. Perguntas para uma design review

Antes de propor a troca de Orleans, seria melhor exigir que a
arquitetura demonstre suas premissas.

As dez perguntas prioritárias seriam:

1.  **Qual é a key e cardinalidade de cada Grain?**
2.  **Qual throughput máximo esperado por `InstrumentGrain` e
    `InstrumentListGrain`?**
3.  **Qual é o p99/p99.9 de source → publication?**
4.  **Como detectamos e recuperamos sequence gaps?**
5.  **Qual é nossa delivery semantic?**
6.  **O que acontece com o estado de um instrumento quando um Silo
    morre?**
7.  **Como funciona backpressure quando publication é mais lenta que
    ingestion?**
8.  **A configuração/Valkey aparece em algum ponto do hot path?**
9.  **Por que a conexão física foi modelada como Grain em vez de worker
    supervisionado por Grain?**
10. **Qual foi o benchmark que justificou Orleans também no data plane
    em vez de apenas no control plane?**

A pergunta 10 é particularmente importante porque não assume que a
decisão atual esteja errada. Ela exige que o custo do actor model no
caminho de cada market update seja justificado pelos benefícios obtidos.

------------------------------------------------------------------------

# 23. Região prioritária para investigação

O trecho que merece investigação prioritária no desenho é:

``` text
FeederConnectionGrain
        ↓
NormalizationEngine
        ↓
InstrumentListGrain / InstrumentGrain
```

É principalmente nesse caminho que as decisões arquiteturais
determinarão:

-   latência;
-   throughput;
-   ordering;
-   backpressure;
-   recovery;
-   escalabilidade;
-   tail latency;
-   comportamento diante de falhas.

------------------------------------------------------------------------

# 24. Síntese

O desenho apresenta uma separação conceitualmente interessante entre:

1.  conectividade/protocolos;
2.  normalização;
3.  contrato canônico;
4.  processamento por instrumento;
5.  publicação;
6.  configuração.

O uso de Orleans também possui fundamentos plausíveis, principalmente
quando `connectionId` e `instrumentId` são tratados como entidades
distribuídas com identidade própria.

A questão arquitetural mais importante não é simplesmente:

> "Orleans é bom ou ruim?"

A pergunta mais útil é:

> **Quais partes do problema realmente se beneficiam do Virtual Actor
> Model e quais partes pertencem a um data plane de alta frequência que
> poderia ser mais simples, previsível e eficiente utilizando
> processamento particionado/in-memory?**

Isso conduz naturalmente à hipótese de uma arquitetura híbrida:

``` text
Orleans
   ↓
Control Plane

+

Optimized Partitioned Pipeline
   ↓
Data Plane
```

Entretanto, essa hipótese só deve substituir a arquitetura atual se
medições reais demonstrarem benefício.

Portanto, a sequência correta de avaliação seria:

``` text
Entender requisitos
       ↓
Definir invariantes
       ↓
Definir semantics
       ↓
Instrumentar
       ↓
Benchmark
       ↓
Identificar gargalos
       ↓
Comparar arquiteturas
       ↓
Decidir
```

Em um sistema de market data, particularmente, decisões sobre abstração
distribuída deveriam ser fundamentadas não apenas em elegância
arquitetural, mas também em **latência de cauda, throughput sustentável,
comportamento sob burst, recovery e previsibilidade operacional**.
