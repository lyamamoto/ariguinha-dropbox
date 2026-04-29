# Candlestick Chart Component — Modelo Genérico

> **Documento de referência** descrevendo, de forma agnóstica de domínio, os requisitos e
> as soluções adotadas no componente de gráfico de candles do `trader-web`.
> O objetivo é permitir que os mesmos comportamentos sejam replicados em outros contextos
> (outros desks, retail-web, sales-web, etc.) sem precisar reverter-engenheirar a implementação atual.

A implementação concreta está em
[apps/trader-web/src/desks/crypto/panels/CandlestickPanel.tsx](apps/trader-web/src/desks/crypto/panels/CandlestickPanel.tsx),
com hooks de suporte em [apps/trader-web/src/features/candlestick/](apps/trader-web/src/features/candlestick/).

---

## 1. Visão geral

Um painel de gráfico de candles é composto por **três blocos lógicos**:

1. **Camada de dados** — fonte da verdade do conjunto de barras OHLCV exibidas.
2. **Camada de transporte** — REST para histórico (lote inicial + páginas mais antigas) e
   WebSocket para streaming da barra atual.
3. **Camada de renderização** — biblioteca de gráficos (no nosso caso `lightweight-charts`)
   que recebe arrays de candles + volume, expõe eventos de crosshair e de range visível,
   e cuida do desenho.

Esses blocos são desacoplados via um **store reativo** (Zustand). O painel apenas observa
o store e o store é alimentado por dois adapters (REST e WS).

```
                     ┌────────────────────┐
                     │ History REST API   │  ← histórico inicial e páginas antigas
                     └────────┬───────────┘
                              │ fetchHistory()
                              ▼
  ┌──────────────────┐   setBars / prependBars   ┌────────────────────┐
  │ useCandlestick   │◀──────────────────────────│ Candlestick Store  │
  │ Data (effect)    │                           │  (Zustand)         │
  └──────────────────┘                           │  bars[],            │
                                                 │  timeframe,         │
  ┌──────────────────┐    updateLastBar          │  loading,           │
  │ useCandle        │──────────────────────────▶│  dataVersion,       │
  │ WebSocket        │                           │  lastLoadType       │
  └──────────────────┘                           └─────────┬──────────┘
        ▲                                                  │
        │ candle frames                                    │ subscribe
  ┌─────┴────────────┐                                     ▼
  │ History.Feeder   │                          ┌────────────────────┐
  │ /ws/candles      │                          │ CandlestickPanel   │
  └──────────────────┘                          │ (lightweight-      │
                                                │  charts renderer)  │
                                                └────────────────────┘
```

---

## 2. Requisitos funcionais

### R1 — Histórico inicial sob demanda
Ao focar um instrumento ou trocar de timeframe, o painel **deve** carregar os últimos N
candles do histórico (default: 200). Enquanto a requisição estiver em andamento, deve
ser exibido um indicador "Loading…" e o gráfico anterior deve ser limpo.

### R2 — Streaming da barra atual
A barra mais recente deve ser atualizada em tempo real via WebSocket:
- Se a mensagem recebida tem o **mesmo `time`** da última barra → substitui.
- Se a mensagem tem **`time` posterior** → faz append como nova barra.

A barra "open" (ainda não fechada) e a barra "closed" usam o mesmo formato — apenas o
flag `isClosed` muda no protocolo.

### R3 — Lazy load de candles antigos
Quando o usuário arrasta o gráfico para a esquerda e o **range visível chega perto do início**
do array de barras (limiar default: 10 candles da borda), o painel deve buscar
automaticamente uma página mais antiga (default: 200 candles), prefixando-a no array.

A operação deve ser **idempotente** (deduplicação por `time`) e **single-flight**
(novas requisições são bloqueadas enquanto uma estiver pendente).

### R4 — Hover OHLCV header
Ao passar o mouse sobre o gráfico, o painel deve exibir, em uma linha de header acima
da área de plot, os valores `O`, `H`, `L`, `C` e `V` do candle sob o cursor.
- O valor de `C` é colorido de verde se `C ≥ O` e vermelho se `C < O`.
- Quando o cursor sai da área de plot, o header volta a esconder os valores.

### R5 — Linha de preço (last price marker)
Uma linha tracejada horizontal deve marcar o preço de fechamento da última barra.
- A cor segue a regra `C ≥ O ⇒ verde`, senão vermelho.
- A linha **só fica visível quando a última barra está fora do range visível**
  (caso contrário, é redundante e poluiria o gráfico).
- O label no eixo Y é exibido junto com a linha (mesma regra de visibilidade).

### R6 — Auto-scroll no nascimento de uma nova barra
Quando uma **nova** barra entra no array (não apenas update da barra atual) **e** a barra
imediatamente anterior estava no range visível, o range deve avançar exatamente 1 barra
para a direita, mantendo a sensação de "live tail". Se o usuário rolou para o passado
(barra anterior fora do range visível), o auto-scroll é suprimido — não roubamos o foco.

### R7 — Troca de timeframe
Botões de timeframe (`1m`, `5m`, `15m`, `1h`, `4h`, `1d`) trocam a granularidade.
Ao clicar:
- O array de barras é **limpo**.
- `loading = true` é setado.
- Uma nova requisição é disparada.
- A subscrição do WebSocket é trocada (unsubscribe da granularidade antiga + subscribe
  da nova) sem fechar a conexão.

### R8 — Troca de instrumento
Mudar o instrumento focado tem o mesmo comportamento de R7, exceto que o WS faz
unsubscribe/subscribe no par `(symbol, quotingSymbol, feedCode, interval)` completo.

### R9 — Resize
Quando o container muda de tamanho (resize de janela ou de painel em layout splittable),
o gráfico deve se ajustar via `ResizeObserver`. A escala visível **não é** resetada.

### R10 — Memory bound
O array de barras é capeado em `MAX_BARS` (default: 500). Updates de streaming que
ultrapassem esse limite descartam as barras mais antigas. Lazy load **não** está sujeito
ao cap (é o usuário pedindo histórico).

---

## 3. Requisitos não-funcionais

| Requisito | Decisão |
|---|---|
| **Latência percebida no streaming** | Usar `series.update(bar)` da lib (não `setData`). Evita rebuild do array interno. |
| **Estabilidade da conexão WS** | Conexão única, **estável**, durante o ciclo de vida do hook. Trocas de instrumento/timeframe via mensagens `subscribe`/`unsubscribe`, **nunca** reconectando. |
| **Reconexão** | Em `onclose`, agendar reconexão com backoff fixo (`RECONNECT_DELAY = 3000ms`). Cancelar timer no unmount. |
| **Não vazar listeners** | Todos os `subscribeXxx` da lib são desinscritos no cleanup do `useEffect`. |
| **Refs vs state** | Valores que mudam mas **não** devem disparar re-render do effect (ex.: `focused`, `timeframe`, `bars` dentro do handler de range) são lidos via ref atualizada a cada render. |
| **Mistura REST + WS** | A mensagem inicial do WS pode ser uma `snapshot`. O store trata snapshot e candleUpdate de forma idêntica via `updateLastBar`, então não há lógica de merge complexa. |
| **Idempotência de prepend** | `prependBars` deduplica por `time` antes de concatenar. Defesa contra race entre lazy load e snapshot WS. |

---

## 4. Modelo de dados

### Barra OHLCV (interna)
```ts
interface OhlcvBar {
  time: number   // Unix timestamp em segundos (UTC)
  open: number
  high: number
  low: number
  close: number
  volume: number
}
```

> **Convenção**: `time` em **segundos**, não milissegundos. A maioria das libs de
> charting financeiro usa segundos, e os timestamps de candles são naturalmente alinhados
> a granularidades grossas — milissegundo é precisão desnecessária.

### Mensagem normalizada do WS
```ts
interface NormalizedCandleMsg {
  symbol: string
  quotingSymbol?: string
  feedCode: string
  interval: string         // "1m" | "5m" | ...
  openTime: string         // ISO 8601 — convertido para epoch segundos
  open / high / low / close / volume: number
  isClosed: boolean        // false = barra em formação; true = barra fechada
}
```

### Store
```ts
interface CandlestickStore {
  bars: OhlcvBar[]                 // ordem cronológica crescente
  timeframe: Timeframe
  loading: boolean
  dataVersion: number              // incrementado em set/prepend; usado para diferenciar
                                   // "load completo" de "tick de streaming"
  lastLoadType: "set" | "prepend"  // diferencia carga inicial de lazy load

  setBars(bars): void              // substitui tudo (carga inicial / troca de tf/instrumento)
  prependBars(bars): void          // adiciona ao início (lazy load); deduplica por time
  updateLastBar(bar): void         // streaming: replace-if-same-time, append-otherwise
  setTimeframe(tf): void           // limpa bars + seta loading
  setLoading(b): void
  clear(): void
}
```

**Por que `dataVersion`?** O effect de "build completo" e o de "streaming tick" leem o
mesmo array `bars`. `dataVersion` identifica univocamente quando a mudança veio de
`setBars`/`prependBars` (precisa rebuild) vs. `updateLastBar` (apenas tick).

**Por que `lastLoadType`?** Após `setBars` queremos resetar o zoom para mostrar as últimas
N barras. Após `prependBars` queremos preservar o range visível atual (a lib faz isso
automaticamente quando chamamos `setData` com array maior).

---

## 5. Soluções adotadas

### 5.1 Carga inicial (R1)
Hook `useCandlestickData` observa `(focused, timeframe)`. Em qualquer mudança:
1. Marca `loading = true`.
2. Cancela qualquer requisição pendente via flag `cancelled`.
3. Chama `fetchHistory(symbol, quotingSymbol, timeframe, HISTORY_COUNT)`.
4. No `.then`: `setBars(result)` (que também limpa `loading`).
5. No cleanup: `cancelled = true` + `clear()`.

### 5.2 Streaming (R2)
Hook `useCandleWebSocket`:
- **Conexão única e estável**. Trocas de focused/timeframe disparam mensagens
  `unsubscribe`/`subscribe` na conexão existente.
- `currentSubRef` guarda a chave atual `symbol:quoting:feed:interval`. Mensagens com
  chave diferente são ignoradas (defesa contra race entre subscribe e ack).
- Toda mensagem (`snapshot` ou `candleUpdate`) é convertida para `OhlcvBar` e passada
  para `updateLastBar`. Não há lógica especial para `isClosed` no front — barra aberta
  e fechada usam o mesmo path.

### 5.3 Lazy load (R3)
No painel, listener de `subscribeVisibleLogicalRangeChange`:
```
if (range.from <= LAZY_LOAD_THRESHOLD && !loadingMoreRef.current) {
  loadingMoreRef.current = true
  fetchHistory(..., endTime = oldestBar.time - 1)
    .then(prependBars)
    .finally(() => loadingMoreRef.current = false)
}
```
- `range.from` é o **índice lógico** (pode ser negativo se o usuário rolou além do início).
- `endTime` é exclusivo: passamos `oldestBar.time - 1` (segundos) para evitar overlap
  com a barra mais antiga já em memória.
- O backend espera `endTime` em **milissegundos** (multiplicação por 1000 no service).
- `prependBars` deduplica por `time` antes de concatenar — defesa contra duplo trigger.

### 5.4 Hover OHLCV (R4)
Listener de `subscribeCrosshairMove`:
- Se `param.time` for `null` (cursor fora) → `setCrosshairData(null)`.
- Senão, lê `param.seriesData.get(candleSeries)` e `.get(volumeSeries)` e popula um state
  local `crosshairData`.

O header renderiza `O / H / L / C / V` quando `crosshairData != null`. O `C` recebe
classe `text-trade-positive` ou `text-trade-negative` conforme `c >= o`. O volume usa
`toLocaleString()` para separadores de milhar.

> **Detalhe de UX**: usar máscara CSS (`maskImage: linear-gradient`) para fade-out na
> direita previne quebra de layout em viewports estreitos.

### 5.5 Price line (R5)
- Criada uma vez por carga completa (`dataVersion` muda).
- Listener de `subscribeVisibleTimeRangeChange` recalcula visibilidade:
  - Se `latestTime ∈ [range.from, range.to]` → linha **escondida** (latest está no plot).
  - Caso contrário → linha **visível** + label do eixo visível.
- Em cada tick de streaming, `priceLine.applyOptions({ price, color })` atualiza valor e
  cor. Não recriamos a linha (custo desnecessário).

### 5.6 Auto-scroll (R6)
Dentro do effect de streaming, ao detectar `isNewBar` (novo `time`):
```
visibleLogical = chart.timeScale().getVisibleLogicalRange()
prevLatestIndex = bars.length - 2
if (prevLatestIndex ∈ [floor(from), ceil(to)]) {
  setVisibleLogicalRange({ from: from + 1, to: to + 1 })
}
```
Se o usuário não estava acompanhando o tail, o range fica parado e o lazy load eventualmente
preserva a posição.

### 5.7 Troca de timeframe (R7) e instrumento (R8)
- `setTimeframe(tf)` no store limpa `bars` e seta `loading = true` imediatamente —
  evita "flash" do gráfico anterior enquanto a nova requisição vai e volta.
- O effect de `useCandlestickData` reage a `(focused, timeframe)` e dispara fetch.
- O hook do WS reage a `(focused, timeframe)` e envia mensagens `unsubscribe` + `subscribe`
  (a conexão TCP/WS continua aberta).

### 5.8 Resize (R9)
`ResizeObserver` no container chama `chart.applyOptions({ width, height })`.
Não tocamos no `timeScale` — o range visível atual é preservado pela lib.

### 5.9 Memory bound (R10)
`updateLastBar` faz `bars.slice(-MAX_BARS)` quando o append faria a array exceder o cap.
`prependBars` propositadamente **não** aplica cap — é o usuário solicitando histórico.

---

## 6. Pontos de atenção / armadilhas conhecidas

1. **Não use `setData` em ticks de streaming.** Use `series.update(bar)`. `setData`
   reconstrói o estado interno e quebra a animação suave do tick.
2. **Desinscreva todo listener no cleanup.** Lib charting com listeners pendurados em
   componentes desmontados → vaza tudo (chart, séries, dados).
3. **Refs para valores frescos dentro de listeners.** Listeners da lib são registrados
   uma única vez (no mount) — não capture `bars` ou `focused` por closure, ou usará
   sempre os valores do mount. Prefira `barsRef.current`.
4. **Cuidado com unidades de tempo.** Lib usa **segundos** (Unix). REST do nosso backend
   usa **milissegundos**. WebSocket entrega ISO 8601. Centralizar conversão em um único
   ponto (`toOhlcvBar` no WS, `params.endTime * 1000` no service REST).
5. **Snapshot vs candleUpdate.** Tratar identicamente. A única diferença é que `snapshot`
   pode chegar como array; o código já normaliza com `Array.isArray(msg.data)`.
6. **Race entre lazy load e snapshot WS.** Em conexões reabertas durante um lazy load
   pendente, o snapshot pode trazer barras já presentes. A deduplicação por `time` no
   `prependBars` cobre isso. Não confiar em ordem de chegada.
7. **`dataVersion` é o único gatilho confiável** para distinguir "recarregou tudo" de
   "streamou tick". Comparar `bars.length` ou `bars[0].time` é frágil.
8. **Loading flash.** Sempre limpar `bars` antes da requisição (e setar `loading`),
   nunca depois — caso contrário o usuário vê o gráfico antigo + spinner por 1 frame.

---

## 7. Checklist para reaproveitar em outro contexto

Para implementar o mesmo painel em outro app (`retail-web`, `sales-web`, outro desk):

- [ ] Definir endpoint REST `GET /candles?symbol&quotingSymbol&interval&limit&endTime?`
      retornando `OhlcvBar[]` em ordem crescente.
- [ ] Definir WS `/ws/candles` aceitando `{action: "subscribe"|"unsubscribe", ...}` e
      emitindo `{type: "snapshot"|"candleUpdate", data: NormalizedCandleMsg | NormalizedCandleMsg[]}`.
- [ ] Copiar/adaptar o trio de hooks: `useCandlestickStore`, `useCandlestickData`, `useCandleWebSocket`.
- [ ] Decidir a fonte de "instrumento focado" (no `trader-web` é `useFocusedInstrument`;
      em outro contexto pode ser parâmetro de URL, ticket aberto, etc.) e injetá-la no
      hook `useCandlestickData`.
- [ ] No componente de painel:
  - [ ] Inicializar `createChart` com tema (cores up/down, fundo, grid, escalas).
  - [ ] Adicionar `CandlestickSeries` + `HistogramSeries` (volume com `priceScaleId: "volume"`
        e margens `top: 0.8, bottom: 0`).
  - [ ] Effect "carga completa" disparado por `dataVersion` (R1, R5 inicial, R7 zoom-to-tail).
  - [ ] Effect "streaming tick" para `bars` quando `dataVersion` é o mesmo (R2, R5 update, R6).
  - [ ] Effect de `subscribeVisibleTimeRangeChange` (R5 visibilidade da linha).
  - [ ] Effect de `subscribeCrosshairMove` (R4 header OHLCV).
  - [ ] Effect de `subscribeVisibleLogicalRangeChange` (R3 lazy load).
  - [ ] Effect de `ResizeObserver` (R9).
- [ ] Header do painel: símbolo + loading + OHLCV hover + botões de timeframe.
- [ ] Validar manualmente:
  - [ ] Carregamento inicial mostra últimas 80 barras.
  - [ ] Hover atualiza header em tempo real.
  - [ ] Rolagem para a esquerda traz mais histórico (sem duplicatas).
  - [ ] Nova barra entra com auto-scroll quando tail está visível, **não** rouba foco quando
        usuário está no passado.
  - [ ] Linha de preço aparece quando rolamos para o passado e some quando voltamos ao tail.
  - [ ] Trocar timeframe limpa o gráfico, mostra loading e recarrega.
  - [ ] Resize do painel ajusta sem alterar o range visível.
  - [ ] Reconexão WS após queda restaura o stream sem reload da página.

---

## 8. Constantes recomendadas (defaults)

| Constante | Valor | Onde |
|---|---|---|
| `HISTORY_COUNT` | 200 | carga inicial |
| `LAZY_LOAD_COUNT` | 200 | cada página de lazy load |
| `LAZY_LOAD_THRESHOLD` | 10 | barras da borda esquerda para disparar lazy load |
| `DEFAULT_VISIBLE_BARS` | 80 | janela inicial após `setBars` |
| `MAX_BARS` | 500 | cap do array para streaming |
| `RECONNECT_DELAY` | 3000 ms | backoff fixo do WS |
| `UP_COLOR` | `#22c55e` (trade-positive) | candle/wick/volume verde |
| `DOWN_COLOR` | `#ef4444` (trade-negative) | candle/wick/volume vermelho |
| Volume opacity | `40` (hex alpha ~25%) | `${UP_COLOR}40` para histograma menos saturado |

Esses valores foram calibrados para o caso cripto desk (timeframes `1m`–`1d`,
volume típico de exchange centralizada). Para domínios diferentes (FX intraday,
equity diário com poucas barras, etc.), revisar `HISTORY_COUNT` e `MAX_BARS`.
