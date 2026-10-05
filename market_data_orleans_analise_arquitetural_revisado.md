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
comportamento sob burst, recovery e previsibilidade operacional**. ---

# 25. Atualização da análise a partir do diagrama arquitetural detalhado

O segundo diagrama acrescenta informações importantes que mudam a
interpretação de algumas decisões. Em particular, ele torna explícitos
componentes de **gerenciamento de sessão, notificação de configuração,
migração controlada, testes de aceitação e benchmark de capacidade** que
não apareciam claramente no primeiro desenho.

Consequentemente, algumas preocupações levantadas anteriormente são
**atenuadas**, enquanto outras passam a merecer prioridade maior.

A leitura atualizada do sistema é a de uma arquitetura distribuída com,
pelo menos, três planos conceituais:

``` text
                   CONTROL PLANE
                        │
          ConfigurationStore
          FeederCatalogWorker
          FeederControlGrain
          ConfigurationNotificationListener
          MigrationCoordinator

                        │
                        ▼

              SESSION / INGESTION PLANE
                        │
          FeederConnectionGrain
          SessionManagerGrain
          FeederAdapterRegistry
          Market Adapters
          NormalizationEngine

                        │
                        ▼

                DISTRIBUTION PLANE
                        │
          InstrumentGrain
          InstrumentListGrain
          PublicationAdapter
```

Essa divisão é mais precisa do que a separação inicial apenas entre
control plane e data plane.

------------------------------------------------------------------------

# 26. Componentes adicionais revelados pelo segundo diagrama

O novo desenho torna explícitos os seguintes elementos:

-   `ConfigurationNotificationListener`
-   `SessionManagerGrain`
-   `MigrationCoordinator`
-   `MarketDataFeederTaacSuite`
-   `InstrumentTaacSuite`
-   `AgencyEstadoCapacityBenchmark`

Também explicita novas relações importantes:

-   `catalog`
-   `configuration`
-   `projection`
-   `instrument config`
-   `list config`
-   `session`
-   `normalize`
-   `canonical updates`
-   `fan-out`
-   `publish`
-   `reconcile`
-   `acceptance`
-   `load`
-   `measure`

Essas relações ajudam a diferenciar responsabilidades que antes estavam
apenas implícitas.

------------------------------------------------------------------------

# 27. Leitura arquitetural atualizada do sistema

Com o segundo diagrama, o fluxo conceitual passa a ser aproximadamente:

``` text
ConfigurationStore
       ↓
FeederCatalogWorker
       ↓
FeederControlGrain(connectionId)
       ↓
FeederConnectionGrain(connectionId)
       ↓
FeederAdapterRegistry
       ↓
Provider Adapter
       ↓
SessionManagerGrain
       ↓
provider data
       ↓
NormalizationEngine
       ↓
CanonicalMarketUpdate
       ↓
InstrumentGrain(instrumentId)
       │
       ├──────────────→ PublicationAdapter
       │                   ↓
       │            individual publication
       │
       └── fan-out
             ↓
      InstrumentListGrain(listId)
             ↓
      PublicationAdapter
             ↓
       list publication
```

Em paralelo existe um fluxo de configuração e reconciliação:

``` text
                    ConfigurationStore
                      ↑           ↑
                      │           │
ConfigurationNotification     MigrationCoordinator
       Listener                    │
                                   │
                                reconcile
```

Essa representação mostra uma arquitetura mais deliberada do que era
possível concluir a partir do primeiro desenho.

------------------------------------------------------------------------

# 28. `SessionManagerGrain`: nova informação relevante

O novo desenho introduz explicitamente:

``` text
SessionManagerGrain
"Gerencia sessões dos adapters"
```

e uma relação `session` entre adapters e esse grain.

Isso sugere que o sistema diferencia, pelo menos conceitualmente,
**conexão física** de **sessão lógica/protocolar**.

Uma divisão possível é:

``` text
FeederControlGrain
        │
        │ lifecycle lógico
        ↓
FeederConnectionGrain
        │
        │ conexão física
        ↓
Adapter
        │
        │ sessão de protocolo
        ↓
SessionManagerGrain
```

Para um protocolo como FIX, por exemplo, existem conceitos diferentes:

``` text
TCP connection
FIX session
sequence numbers
logon/logout
heartbeat
reconnect
```

A existência de `SessionManagerGrain` torna mais plausível que essas
responsabilidades tenham sido deliberadamente separadas.

## Comentário / recomendação

Documentar explicitamente o ownership:

  Responsabilidade             Owner esperado
  ---------------------------- ---------------------------------------------
  Desired connection state     `FeederControlGrain`
  Physical connection          `FeederConnectionGrain` ou worker associado
  Protocol/session lifecycle   `SessionManagerGrain`
  Provider-specific decoding   Adapter
  Canonical normalization      `NormalizationEngine`

A preocupação anterior de que `FeederConnectionGrain` pudesse concentrar
socket, lifecycle lógico e sessão é, portanto, **reduzida**, mas ainda
precisa ser validada no código.

------------------------------------------------------------------------

# 29. Lifecycle físico versus lifecycle de Grain

Mesmo com `SessionManagerGrain`, permanece uma questão importante.

Uma conexão TCP/WebSocket/FIX é um recurso físico efêmero, enquanto um
Grain é uma entidade lógica virtual.

É necessário esclarecer o comportamento quando:

``` text
FeederConnectionGrain desativa
Silo morre
socket cai
session continua logicamente desejada
```

O sistema deveria possuir uma distinção clara entre:

``` text
Desired State
     ≠
Observed Physical State
```

Por exemplo:

``` text
desired = Connected
observed = Disconnected
```

deveria levar o control plane a reconciliar o estado até que:

``` text
desired = Connected
observed = Connected
```

Essa distinção é central para evitar que lifecycle de socket e lifecycle
Orleans fiquem acoplados de maneira acidental.

------------------------------------------------------------------------

# 30. `ConfigurationNotificationListener` reduz a preocupação com configuração no hot path

O novo diagrama mostra:

``` text
ConfigurationNotificationListener
"Escuta notificações de configuração"
```

Isso sugere uma arquitetura orientada a notificações, em vez de polling
ou consulta ao Valkey para cada market update.

O modelo desejável seria:

``` text
Valkey
  ↓
ConfigurationStore
  ↓
configuration notification
  ↓
ConfigurationNotificationListener
  ↓
local immutable configuration
  ↓
hot path
```

Se essa for a implementação, a preocupação anterior sobre
`ConfigurationStore`/Valkey estar no caminho crítico de cada atualização
diminui significativamente.

## Pergunta de validação

Depois de uma notificação, a configuração necessária ao processamento
permanece em memória local?

Se sim, o data plane pode continuar operando sem I/O externo por
atualização.

------------------------------------------------------------------------

# 31. `ConfigurationStore` como configuration control plane central

O segundo diagrama mostra que `ConfigurationStore` fornece ou recebe
diferentes categorias de informação:

``` text
catalog
configuration
projection
instrument config
list config
```

e também participa da migração.

Portanto, ele parece ser a fronteira central de configuração
autoritativa do sistema.

Isso traz uma vantagem importante:

``` text
                   ConfigurationStore
                  /        |          \
                 ↓         ↓           ↓
              Feeder    Instrument   Migration
```

Há uma fonte central e tipada para o desired state.

Por outro lado, isso aumenta seu blast radius.

## Comportamento desejável em indisponibilidade

``` text
ConfigurationStore / Valkey DOWN

existing feeds       → continuam
existing instruments → continuam
publication          → continua

new configuration    → indisponível
migration            → indisponível
new connections      → possivelmente indisponíveis
```

Se a perda do configuration plane interromper imediatamente o data plane
existente, isso seria uma preocupação arquitetural importante.

------------------------------------------------------------------------

# 32. `projection` e o padrão desired-state / observed-state

O novo desenho mostra explicitamente uma relação `projection` envolvendo
`FeederControlGrain` e `ConfigurationStore`.

Isso pode indicar que existe uma transformação de configuração
declarativa em uma representação operacional.

Conceitualmente:

``` text
Authoritative Configuration
          ↓
       Projection
          ↓
Runtime Representation
```

Exemplo:

``` text
Config declarativa

connection:
    provider: Gatelo
    instruments: [...]
    mode: spot

             ↓ projection

Runtime Plan

GateloSpotAdapter
connection X
instrument mappings
session configuration
```

Se for essa a intenção, a arquitetura se aproxima de um modelo de
**reconciliation** semelhante ao utilizado por controllers/operators.

O princípio é:

> configuração descreve o estado desejado; controladores observam o
> estado atual e executam ações idempotentes até convergir para o estado
> desejado.

Esse é um modelo particularmente adequado para control planes.

------------------------------------------------------------------------

# 33. Idempotência do reconciliation loop

A presença de:

``` text
FeederCatalogWorker
MigrationCoordinator
ConfigurationStore
FeederControlGrain
```

sugere algum tipo de reconciliation loop.

Uma propriedade fundamental deveria ser:

``` text
reconcile(reconcile(state)) = reconcile(state)
```

ou, em termos operacionais:

> executar novamente a reconciliação não deve criar conexões duplicadas,
> sessões duplicadas ou publicações inconsistentes.

Isso é especialmente importante após:

-   restart;
-   failover de Silo;
-   reprocessamento de notificação;
-   timeout;
-   retry;
-   migração parcialmente concluída.

------------------------------------------------------------------------

# 34. `MigrationCoordinator` e cutover controlado

O novo componente:

``` text
MigrationCoordinator
"Coordena migração de configuração
com cutover controlado."
```

é uma informação arquitetural muito relevante.

Ele mostra que o sistema trata mudanças de configuração como uma
operação coordenada, e não apenas como substituição imediata de valores.

Um fluxo provável:

``` text
Current Configuration
        ↓
       v17

New Configuration
        ↓
       v18

MigrationCoordinator
        ↓
     reconcile
        ↓
prepare new runtime state
        ↓
controlled cutover
        ↓
v18 active
```

Isso reduz a preocupação anterior sobre ausência de mecanismo de
migração dinâmica.

Entretanto, introduz uma nova questão crítica: **atomicidade semântica
do cutover**.

------------------------------------------------------------------------

# 35. Ordering durante migration/cutover

Considere:

``` text
t0 PETR4 → source A
t1 migration
t2 PETR4 → source B
```

As sequências podem ser completamente diferentes:

``` text
A sequence 100
A sequence 101

       CUTOVER

B sequence 783
B sequence 784
```

É necessário impedir:

-   duplicatas;
-   gaps não detectados;
-   mensagens antigas da sessão anterior;
-   reordenação através do cutover;
-   publicação simultânea pelas duas gerações.

O campo:

``` text
sessionGeneration
```

presente no `CanonicalMarketUpdate` pode estar relacionado justamente a
essa necessidade.

Uma ordem lógica possível continua sendo:

``` text
LogicalSequence =
(sessionGeneration, sequence)
```

Assim:

``` text
generation 17 / sequence 101
generation 18 / sequence 1
```

pode ser corretamente interpretado como mudança de geração, em vez de
regressão de sequência.

## Pergunta crítica

`MigrationCoordinator` controla explicitamente a transição de
`sessionGeneration`?

Se sim, essa relação deveria estar documentada como uma das invariantes
centrais da arquitetura.

------------------------------------------------------------------------

# 36. Dois `NormalizationEngine` no desenho

O segundo diagrama parece representar `NormalizationEngine` em duas
posições.

Ambos são descritos de forma semelhante:

> converte dados dos adapters para o contrato canônico.

Há duas possibilidades:

### Possibilidade A --- mesma entidade representada duas vezes

O desenho pode repetir visualmente o mesmo componente para reduzir
cruzamento de linhas.

Nesse caso, não existe problema arquitetural.

### Possibilidade B --- componentes distintos

Se forem efetivamente dois componentes, é necessário definir claramente
a diferença de responsabilidade.

O modelo preferível seria algo como:

``` text
Wire Format
    ↓
Protocol Adapter
    ↓
Provider Semantic Model
    ↓
NormalizationEngine
    ↓
Canonical Semantic Model
```

Se duas camadas distintas forem necessárias, deveriam receber nomes
diferentes, por exemplo:

``` text
ProtocolDecoder
ProviderNormalizer
CanonicalNormalizer
```

para evitar ownership ambíguo.

------------------------------------------------------------------------

# 37. Adapter Registry e adapters de mercado

O segundo desenho esclarece melhor a separação:

``` text
FeederAdapterRegistry
        ↓ register/resolve
Adaptadores de Mercado
        ↓
NormalizationEngine
```

Isso é positivo porque permite tratar os adapters como
plugins/capabilities específicas de provider.

A arquitetura deveria garantir que um adapter:

-   conheça o protocolo/provider;
-   não conheça detalhes do Instrument side;
-   não publique diretamente no modelo final;
-   produza uma representação que possa ser normalizada;
-   tenha lifecycle controlado externamente;
-   seja isolável em caso de falha.

------------------------------------------------------------------------

# 38. `InstrumentGrain` e configuração individual

Agora aparece explicitamente:

``` text
ConfigurationStore
        │
        └── instrument config
                ↓
         InstrumentGrain
```

Isso reforça a interpretação de que o `InstrumentGrain` representa uma
entidade individual configurável.

Uma key natural seria:

``` text
InstrumentGrain(instrumentId)
```

ou, caso múltiplas fontes precisem coexistir:

``` text
InstrumentGrain(sourceId, instrumentId)
```

A key exata continua sendo uma pergunta arquitetural importante porque
define:

-   ordering;
-   paralelismo;
-   distribuição;
-   hot spots;
-   state ownership.

------------------------------------------------------------------------

# 39. `InstrumentListGrain` e configuração de lista

O segundo desenho mostra:

``` text
ConfigurationStore
        │
        └── list config
                ↓
       InstrumentListGrain
```

Isso reduz a hipótese anterior de que exista necessariamente um único
`InstrumentListGrain` global.

É plausível que existam múltiplas instâncias:

``` text
InstrumentListGrain("BOVESPA")
InstrumentListGrain("FX")
InstrumentListGrain("CRYPTO")
InstrumentListGrain("CLIENT_X")
```

Isso pode distribuir melhor a carga.

Ainda assim, devem ser medidos:

-   número de instrumentos por lista;
-   updates/s por lista;
-   quantidade de listas;
-   sobreposição entre listas;
-   fan-in por `InstrumentListGrain`.

------------------------------------------------------------------------

# 40. Fan-out explícito de `InstrumentGrain` para `InstrumentListGrain`

O novo desenho mostra explicitamente:

``` text
InstrumentGrain
      │
      │ fan-out
      ↓
InstrumentListGrain
```

Isso é uma das informações novas mais importantes.

Um único market update pode produzir múltiplas chamadas:

``` text
Canonical Update
      ↓
InstrumentGrain(PETR4)
      ↓
     fan-out
      ↓
 ┌────┼────┬────┐
 ↓    ↓    ↓    ↓
L1   L2   L3   ... Ln
```

A amplificação é:

``` text
output grain calls
≈
input updates × lists per instrument
```

Exemplo:

``` text
100k updates/s
×
20 listas por instrumento
=
2M grain calls/s
```

Portanto, uma métrica crítica passa a ser:

``` text
fanout_factor
```

e devem ser conhecidos:

-   média;
-   p95;
-   p99;
-   máximo.

Essa preocupação passa a ter prioridade alta.

------------------------------------------------------------------------

# 41. Possíveis alternativas para fan-out excessivo

Se o fan-out for elevado, existem alternativas.

## 41.1 Particionar listas

``` text
InstrumentGrain
      ↓
ListPartitionGrain
      ↓
List publication
```

## 41.2 Agrupar notificações

Em vez de:

``` text
update 1 → call
update 2 → call
update 3 → call
```

usar micro-batches:

``` text
[update1, update2, update3]
          ↓
       one call
```

Trade-off:

-   menor overhead;
-   maior throughput;
-   pequena latência adicional.

## 41.3 Conflation

Quando semanticamente permitido:

``` text
PETR4 100
PETR4 101
PETR4 102
PETR4 103

lista ainda não processou

→ mantém apenas 103
```

## 41.4 Pub/sub interno

Se a relação instrumento → listas for extremamente dinâmica ou ampla,
pode ser considerado um mecanismo de subscription/fan-out diferente de
chamadas diretas entre grains.

A escolha depende da garantia de ordering e da latência exigida.

------------------------------------------------------------------------

# 42. Publicação individual e publicação de lista

O desenho agora mostra dois fluxos:

``` text
InstrumentGrain
      │
      └── publish
             ↓
      PublicationAdapter
```

e:

``` text
InstrumentListGrain
      │
      └── publish
             ↓
      PublicationAdapter
```

Isso explica melhor a separação entre os dois grains.

Temos:

``` text
Individual Publication
        ↑
InstrumentGrain
```

e:

``` text
List Publication
        ↑
InstrumentListGrain
```

Essa divisão é coerente.

------------------------------------------------------------------------

# 43. `PublicationAdapter` como boundary arquitetural

O novo desenho mostra explicitamente `publication contracts`.

Isso reforça a leitura de:

``` text
Domain
  ↓
Technical Publication Envelope
  ↓
PublicationAdapter
  ↓
External Publication Mechanism
```

A separação é boa porque impede que os grains conheçam detalhes do
mecanismo externo de distribuição.

Entretanto, permanece a preocupação com slow consumers.

------------------------------------------------------------------------

# 44. Publicação síncrona versus assíncrona

Se o Grain fizer:

``` csharp
await publicationAdapter.Publish(...)
```

e o destino ficar lento, o Grain pode ficar bloqueado.

Uma alternativa é:

``` text
InstrumentGrain
      ↓
bounded publication channel
      ↓
Publication Workers
      ↓
PublicationAdapter
```

Isso exige uma política explícita para fila cheia:

``` text
block
drop
conflate
reject
spill
```

A política pode variar conforme o tipo de dado.

Para market data, bloquear indefinidamente o producer normalmente é
perigoso porque converte lentidão downstream em crescimento de latência
upstream.

------------------------------------------------------------------------

# 45. Testes de aceitação arquiteturais

O segundo desenho introduz:

``` text
MarketDataFeederTaacSuite
"Testes de aceitação do lado Feeder"
```

e:

``` text
InstrumentTaacSuite
"Testes de aceitação do lado Instrument"
```

com relações `acceptance`.

Isso é uma informação positiva: existem mecanismos explícitos para
validar comportamento dos dois lados.

## Cobertura desejável

Os testes deveriam cobrir, entre outros:

``` text
connection lifecycle
configuration changes
reconnect
normalization
sequence gaps
duplicate messages
out-of-order messages
migration
controlled cutover
publication
slow consumer
Silo failover
ConfigurationStore outage
adapter failure
```

A simples existência dos suites reduz a preocupação com ausência de
testes, mas a **cobertura efetiva** é o que determina seu valor.

------------------------------------------------------------------------

# 46. `AgencyEstadoCapacityBenchmark`

O novo desenho mostra explicitamente:

``` text
AgencyEstadoCapacityBenchmark
"Testes de carga e capacidade."
```

com relações `load` e `measure`.

Isso muda uma das críticas anteriores.

A pergunta deixa de ser:

> existe benchmark?

e passa a ser:

> **o que exatamente o benchmark mede, em quais condições e quais SLOs
> ele valida?**

Métricas importantes:

``` text
updates/s
CPU
memory
allocations/update
GC pause
p50
p95
p99
p99.9
queue depth
grain activation count
fan-out amplification
source-to-publish latency
```

------------------------------------------------------------------------

# 47. Benchmark de carga constante não é suficiente

Market data possui bursts.

Um benchmark deveria testar algo como:

``` text
steady state:
100k msg/s

burst:
500k msg/s por 3 segundos

recovery:
retorno para 100k msg/s
```

O que interessa não é apenas se o sistema sobrevive ao burst, mas:

``` text
queue cresce quanto?
latência chega a quanto?
há drop?
quanto tempo demora para recuperar?
GC entra em espiral?
há reconnect?
```

Uma arquitetura pode apresentar excelente throughput médio e ainda ter
comportamento inadequado sob burst.

------------------------------------------------------------------------

# 48. Benchmark específico de AgencyEstado

O nome:

``` text
AgencyEstadoCapacityBenchmark
```

sugere que o benchmark pode estar ligado a um adapter/provider
específico.

Isso pode ser insuficiente caso os perfis sejam diferentes.

Exemplo hipotético:

``` text
AgencyEstado
10k updates/s

GateloSpot
150k updates/s

GateloFutures
500k updates/s
```

Nesse caso, validar capacidade usando apenas AgencyEstado não garante
capacidade para Gatelo.

## Alternativa

Criar um benchmark provider-independent:

``` text
MarketDataPipelineCapacityBenchmark
```

capaz de gerar:

``` text
10k
50k
100k
250k
500k
1M updates/s
```

e diferentes distribuições:

``` text
uniform instruments
hot instrument
high fan-out
low fan-out
burst
reconnect
migration
```

------------------------------------------------------------------------

# 49. Benchmark parcial versus end-to-end

É essencial saber se:

``` text
AgencyEstadoCapacityBenchmark
```

mede apenas:

``` text
Adapter
  ↓
Normalization
```

ou a pipeline completa:

``` text
Adapter
  ↓
Normalization
  ↓
CanonicalMarketUpdate
  ↓
InstrumentGrain
  ↓
fan-out
  ↓
InstrumentListGrain
  ↓
PublicationAdapter
```

O primeiro é um microbenchmark/capacity test local.

O segundo mede capacidade arquitetural end-to-end.

Os dois são úteis, mas respondem a perguntas diferentes.

------------------------------------------------------------------------

# 50. `MarketDataFeederContracts` ficou ainda mais central

O novo desenho mostra relações explícitas:

``` text
shared contracts
grain contracts
canonical contracts
adapter contracts
publication contracts
```

Isso confirma que `MarketDataFeederContracts` é uma peça central da
arquitetura.

Vantagem:

> boundaries e tipos compartilhados ficam explícitos.

Risco:

> o assembly/package pode virar um monólito de contratos.

------------------------------------------------------------------------

# 51. Possível decomposição dos contratos

Uma organização conceitualmente mais restrita poderia ser:

``` text
MarketData.Contracts.Grains
MarketData.Contracts.Canonical
MarketData.Contracts.Publication
MarketData.Contracts.Configuration
MarketData.Feeder.AdapterContracts
```

Não é obrigatório criar cinco assemblies físicos imediatamente.

O ponto principal é controlar dependências.

Por exemplo:

``` text
Instrument side
```

idealmente não deveria depender de:

``` text
Adapter Contracts
```

se adapters são detalhes exclusivos do Feeder.

------------------------------------------------------------------------

# 52. Adapter contracts no package compartilhado

A presença de `adapter contracts` em `MarketDataFeederContracts` merece
questionamento.

Se:

``` text
Adapter
```

é um detalhe do lado Feeder, o lado Instrument não deveria precisar
conhecê-lo.

Uma topologia mais restrita seria:

``` text
                Canonical Contracts
                Grain Contracts
                Publication Contracts
                      ↑
                      │
Feeder ───────────────┼──────────── Instrument


Adapter Contracts
      ↑
      │
    Feeder only
```

Isso reduz coupling acidental e facilita evolução independente.

------------------------------------------------------------------------

# 53. Reavaliação do uso de Orleans

A análise inicial levantava a hipótese de que Orleans talvez fosse mais
adequado apenas ao control plane.

O segundo diagrama torna essa conclusão menos evidente.

A modelagem:

``` text
connection → FeederControlGrain
session    → SessionManagerGrain
instrument → InstrumentGrain
list       → InstrumentListGrain
```

é bastante natural para Virtual Actors.

Portanto, a avaliação atualizada é:

> **Orleans parece uma escolha arquitetural defensável para o domínio
> apresentado. A questão decisiva é se o custo do actor model no
> data/distribution plane satisfaz os SLOs reais de latência e
> throughput.**

Isso é diferente de assumir que Orleans esteja sendo utilizado
excessivamente.

A decisão deve ser orientada por benchmark.

------------------------------------------------------------------------

# 54. Nova classificação das preocupações

Com as informações adicionais, as prioridades mudam.

  -----------------------------------------------------------------------
  Prioridade              Questão                 Evolução
  ----------------------- ----------------------- -----------------------
  🔴 Alta                 Ordering / sequence /   continua crítica
                          generation              

  🔴 Alta                 Gap detection +         continua crítica
                          snapshot/resync         

  🔴 Alta                 Fan-out Instrument →    **nova prioridade
                          Lists                   alta**

  🔴 Alta                 Backpressure / slow     continua crítica
                          publication             

  🔴 Alta                 Hot Grain / throughput  continua crítica
                          por Grain               

  🔴 Alta                 Atomicidade do          **nova prioridade
                          migration cutover       alta**

  🟠 Média-alta           Lifecycle físico vs     parcialmente
                          Grain lifecycle         esclarecido

  🟠 Média-alta           Failure/recovery de     continua relevante
                          Silo                    

  🟠 Média                ConfigurationStore      mais bem definido
                          blast radius            

  🟠 Média                Contract versioning     continua relevante

  🟠 Média                GC / allocations        continua relevante

  🟡 Menor agora          Configuração no hot     listener reduz
                          path                    preocupação

  🟡 Menor agora          Ausência de testes de   benchmark existe
                          capacidade              

  🟡 Menor agora          Ausência de             migration/reconcile
                          configuração dinâmica   existem
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 55. Perguntas atualizadas para a design review

À luz do segundo diagrama, as perguntas prioritárias passam a ser:

1.  **Qual é a key e cardinalidade de cada Grain?** Especialmente
    `InstrumentGrain`, `InstrumentListGrain`, `SessionManagerGrain`,
    `FeederControlGrain` e `FeederConnectionGrain`.
2.  **Qual é o lifecycle exato de `FeederConnectionGrain` versus
    `SessionManagerGrain`?** Quem possui socket, heartbeat, reconnect e
    sequence?
3.  **Os dois `NormalizationEngine` do desenho são o mesmo componente
    representado duas vezes ou componentes diferentes?**
4.  **Qual é a semântica exata de `sessionGeneration + sequence`?**
5.  **Como gap detection e resynchronization funcionam?**
6.  **Qual é o fan-out médio, p95 e p99 de um `InstrumentGrain` para
    `InstrumentListGrain`s?**
7.  **`PublicationAdapter` é síncrono em relação ao Grain? O que
    acontece com slow consumer?**
8.  **Como funciona o cutover do `MigrationCoordinator` sem produzir
    gap, duplicata ou overlap de gerações?**
9.  **O que continua funcionando se `ConfigurationStore`/Valkey ficar
    indisponível por dez minutos?**
10. **O que exatamente mede o `AgencyEstadoCapacityBenchmark`? Quais
    throughput máximo, p99 e p99.9 foram observados?**
11. **O benchmark mede a pipeline inteira, incluindo Instrument +
    fan-out + Publication, ou apenas ingestion/normalization?**
12. **Qual é a política quando um Grain não acompanha a taxa de entrada:
    queue, drop, conflation ou backpressure?**
13. **Qual estado é persistente e qual é deliberadamente reconstruível
    após morte de um Silo?**
14. **Por que adapter contracts pertencem ao package compartilhado?**
15. **Quais invariantes os TAAC suites garantem durante reconnect,
    migration e failover?**

------------------------------------------------------------------------

# 56. Invariantes que deveriam ser formalizados

O segundo desenho sugere que o sistema já possui maturidade suficiente
para documentar invariantes formais.

Exemplos:

## Invariante de conexão

``` text
para cada enabled connectionId
existe no máximo um runtime owner ativo
```

## Invariante de sessão

``` text
para uma connection/session generation
updates antigos nunca podem substituir updates da geração atual
```

## Invariante de ordering

``` text
dentro da mesma generation:
sequence(n+1) > sequence(n)
```

## Invariante de cutover

``` text
old generation deixa de publicar
antes ou atomicamente com
new generation tornar-se authoritative
```

## Invariante de publicação

``` text
um update stale nunca deve produzir publicação authoritative
```

## Invariante de configuração

``` text
configuração aplicada ao runtime possui versão identificável
```

## Invariante de recovery

``` text
estado efêmero perdido deve ser reconstruível
sem produzir estado silenciosamente incorreto
```

Formalizar essas regras torna testes, observabilidade e incident
response muito mais objetivos.

------------------------------------------------------------------------

# 57. Estado desejado, estado observado e estado publicado

Uma melhoria conceitual para a documentação seria distinguir três tipos
de estado.

## Desired State

Vem do `ConfigurationStore`.

Exemplo:

``` text
connection X enabled
provider Gatelo
instrument PETR4 subscribed
list Y contains PETR4
```

## Observed Runtime State

Vem do runtime:

``` text
connection X connected
session generation 18
last sequence 1042
PETR4 grain active
```

## Published State

É o que downstream recebeu:

``` text
PETR4 last published update = generation 18 / sequence 1041
```

Essa separação facilita responder:

> a configuração está correta, o runtime convergiu e o downstream
> recebeu o estado correto?

São três perguntas diferentes.

------------------------------------------------------------------------

# 58. Observabilidade atualizada

Com os novos componentes, a telemetria deveria ser organizada por plano.

## Control plane

``` text
config_version
reconcile_total
reconcile_failure_total
migration_total
migration_duration
cutover_total
configuration_notification_lag
```

## Session / ingestion plane

``` text
connection_state
session_generation
reconnect_total
heartbeat_failure_total
updates_received_total
sequence_gap_total
duplicate_total
normalization_latency
```

## Distribution plane

``` text
instrument_grain_processing_latency
instrument_list_grain_processing_latency
fanout_factor
fanout_calls_total
publication_queue_depth
updates_published_total
source_to_publish_latency
```

## Runtime Orleans

``` text
grain_activation_count
grain_queue_depth
silo_cpu
silo_memory
allocation_rate
GC_pause
cross_silo_call_rate
```

------------------------------------------------------------------------

# 59. Cross-Silo traffic como nova métrica importante

Com:

``` text
InstrumentGrain
      ↓ fan-out
InstrumentListGrain
```

a localização dos grains passa a importar.

Se `InstrumentGrain(PETR4)` está no Silo A e suas listas estão
espalhadas por B, C e D:

``` text
Silo A
InstrumentGrain(PETR4)
   │
   ├──→ Silo B / List 1
   ├──→ Silo C / List 2
   └──→ Silo D / List 3
```

o fan-out também vira tráfego de rede e serialização.

Portanto, além de `fanout_factor`, é útil medir:

``` text
cross_silo_calls / update
```

Se isso for elevado, placement/locality pode se tornar relevante.

------------------------------------------------------------------------

# 60. Hot Grain e Hot List são problemas diferentes

O primeiro desenho levava principalmente à preocupação com hot
instruments.

Agora existe também um possível **hot list**.

Exemplo:

``` text
InstrumentGrain("BTCUSD")
50k updates/s
```

é um hot instrument.

Mas:

``` text
InstrumentListGrain("ALL_MARKET")
```

pode receber updates de milhares de instrumentos e ser um hot list mesmo
que nenhum instrumento isolado seja extremamente ativo.

Portanto devem existir dois perfis de capacidade:

``` text
max updates / InstrumentGrain
max aggregate updates / InstrumentListGrain
```

------------------------------------------------------------------------

# 61. Testes de capacidade recomendados

Uma suíte de capacidade completa deveria testar ao menos:

## Cenário A --- muitos instrumentos uniformes

``` text
100k instruments
baixa taxa individual
alta taxa agregada
```

## Cenário B --- hot instrument

``` text
1 instrument = 50% do tráfego
```

## Cenário C --- hot list

``` text
1 list recebe grande parte dos instrumentos
```

## Cenário D --- alto fan-out

``` text
cada instrumento pertence a muitas listas
```

## Cenário E --- burst

``` text
5× steady-state por alguns segundos
```

## Cenário F --- reconnect

``` text
feed cai
reconecta
snapshot/resync
burst de recuperação
```

## Cenário G --- migration

``` text
mudança de configuração
cutover
tráfego contínuo durante transição
```

## Cenário H --- slow publication

``` text
downstream degrada
publication latency aumenta
```

## Cenário I --- Silo failure

``` text
Silo morre sob carga
grains reativam
pipeline recupera
```

------------------------------------------------------------------------

# 62. Reavaliação das alternativas arquiteturais

As cinco alternativas apresentadas anteriormente continuam válidas:

1.  Orleans end-to-end;
2.  pipeline stateless particionado;
3.  event streaming;
4.  pipeline in-process otimizado;
5.  arquitetura híbrida.

Entretanto, o segundo desenho aumenta a plausibilidade da opção Orleans
end-to-end porque revela que os grains correspondem a entidades de
domínio reais e que há infraestrutura explícita de controle, sessão e
migração.

A comparação deve agora considerar também:

-   complexidade de migration/cutover;
-   facilidade de reconciliation;
-   modelagem de sessões;
-   fan-out;
-   placement de grains;
-   capacidade dos TAAC suites;
-   benchmarks existentes.

------------------------------------------------------------------------

# 63. Arquitetura híbrida revisitada

A alternativa híbrida ainda merece atenção, mas agora deve ser tratada
como **possível otimização futura**, não como correção presumida da
arquitetura atual.

Ela seria:

``` text
                 CONTROL PLANE

                    Orleans
                      │
         ┌────────────┼────────────┐
         ↓            ↓            ↓
Configuration     Lifecycle     Migration
Reconciliation    Sessions      Coordination


                  DATA PLANE

Market Feed
    ↓
Physical Connection
    ↓
Protocol Adapter
    ↓
Normalizer
    ↓
Partitioned in-memory processing
    ↓
Publication
```

Ela faria sentido se benchmarks demonstrarem que:

``` text
Orleans routing
+
mailbox scheduling
+
cross-silo calls
+
fan-out
```

são responsáveis por uma parcela material do latency budget ou limitam
throughput.

Caso contrário, manter um modelo único Orleans pode ser mais simples e
mais robusto operacionalmente.

------------------------------------------------------------------------

# 64. Critério objetivo para considerar uma mudança de arquitetura

Não deveria haver migração arquitetural apenas porque uma solução
in-process ou particionada parece teoricamente mais rápida.

A mudança só deveria ser considerada se houver evidência como:

``` text
SLO p99.9 não atendido
ou
throughput sustentável insuficiente
ou
fan-out gera saturação
ou
cross-silo traffic domina CPU/rede
ou
GC/serialization domina latency budget
```

e benchmarks mostrarem que uma alternativa resolve o problema com
trade-offs aceitáveis.

Em outras palavras:

``` text
measurement
    ↓
bottleneck
    ↓
hypothesis
    ↓
prototype
    ↓
benchmark
    ↓
architectural decision
```

------------------------------------------------------------------------

# 65. Avaliação arquitetural consolidada

Com o primeiro desenho, a arquitetura podia ser interpretada como:

> um pipeline de market data construído sobre Orleans com configuração
> externa.

O segundo desenho revela algo mais elaborado:

> **um sistema distribuído orientado a desired state/reconciliation, com
> control plane de configuração, lifecycle de conexão, gerenciamento de
> sessões, normalização canônica, distribuição baseada em Virtual
> Actors, fan-out por listas, publicação desacoplada por contrato,
> migração controlada, testes de aceitação e benchmark de capacidade.**

Essa diferença é importante.

Vários elementos que antes pareciam ausentes agora estão explicitamente
representados:

-   configuração dinâmica;
-   notifications;
-   migration;
-   session management;
-   acceptance testing;
-   capacity testing.

Portanto, a avaliação geral da arquitetura melhora.

------------------------------------------------------------------------

# 66. Principais riscos remanescentes

Mesmo com essa avaliação mais positiva, permanecem cinco grupos de risco
prioritários.

## 66.1 Correção temporal

``` text
ordering
sequence
sessionGeneration
gap
duplicate
out-of-order
snapshot/resync
migration cutover
```

## 66.2 Capacidade

``` text
updates/s
hot instrument
hot list
fan-out amplification
cross-silo traffic
burst
```

## 66.3 Backpressure

``` text
slow publication
queue growth
conflation
drop policy
bounded buffers
```

## 66.4 Recovery

``` text
Silo failure
connection reconnect
session recreation
state reconstruction
configuration outage
```

## 66.5 Evolução

``` text
contract versioning
adapter contracts
rolling deployment
configuration migration
backward compatibility
```

------------------------------------------------------------------------

# 67. Nova conclusão

A pergunta central deixa de ser:

> **"Por que usaram Orleans?"**

e passa a ser:

> **"As garantias de ordering/recovery e os limites de throughput,
> fan-out e tail latency do data plane foram formalmente definidos e
> demonstrados pelos testes e benchmarks?"**

Se a resposta for positiva, Orleans pode ser uma escolha bastante sólida
para esse sistema.

Se a resposta for negativa, o trecho que merece investigação prioritária
continua sendo:

``` text
Provider Adapter
      ↓
NormalizationEngine
      ↓
CanonicalMarketUpdate
      ↓
InstrumentGrain
      ↓
fan-out
      ↓
InstrumentListGrain
      ↓
PublicationAdapter
```

É nessa região que se concentram:

-   ordering;
-   throughput;
-   fan-out;
-   cross-silo traffic;
-   backpressure;
-   tail latency;
-   recovery;
-   publicação.

------------------------------------------------------------------------

# 68. Sequência recomendada para aprofundamento

A próxima etapa de uma design review técnica deveria seguir
aproximadamente:

``` text
1. Confirmar key/cardinalidade dos Grains
              ↓
2. Confirmar ownership de connection/session state
              ↓
3. Formalizar sequence/sessionGeneration
              ↓
4. Documentar gap/resync
              ↓
5. Entender migration/cutover
              ↓
6. Medir fan-out
              ↓
7. Entender publication/backpressure
              ↓
8. Revisar TAAC coverage
              ↓
9. Revisar Capacity Benchmark
              ↓
10. Comparar resultados com SLOs
              ↓
11. Só então avaliar mudanças arquiteturais
```

Essa ordem evita otimização prematura e concentra a discussão primeiro
nas invariantes de correção e depois nos limites reais de performance.

------------------------------------------------------------------------

# 69. Síntese final revisada

A arquitetura apresenta uma separação conceitualmente forte entre:

1.  **contratos compartilhados**;
2.  **configuration/control plane**;
3.  **lifecycle de conexão**;
4.  **session management**;
5.  **adapters de mercado**;
6.  **normalização canônica**;
7.  **processamento individual por instrumento**;
8.  **fan-out e agregação por listas**;
9.  **publication boundary**;
10. **migration/reconciliation**;
11. **acceptance testing**;
12. **capacity benchmarking**.

O uso de Orleans possui fundamentos mais claros à luz do segundo
diagrama, pois várias entidades importantes do domínio possuem
identidade natural e lifecycle próprio.

A principal recomendação não é substituir a arquitetura, mas **tornar
explícitas e mensuráveis suas invariantes**.

Em especial:

``` text
Correctness
+
Ordering
+
Recovery
+
Backpressure
+
Capacity
+
Tail Latency
```

devem ser propriedades demonstráveis do sistema.

A arquitetura deve ser considerada adequada enquanto conseguir provar,
por testes e benchmarks, que:

``` text
correctness invariants são mantidas
AND
SLOs de latency são atendidos
AND
throughput sustentável atende o pico esperado
AND
recovery é previsível
AND
fan-out permanece controlável
```

Somente se uma dessas condições falhar de forma estrutural passa a fazer
sentido substituir partes do data plane por um modelo
particionado/in-memory, event streaming ou outra alternativa.
