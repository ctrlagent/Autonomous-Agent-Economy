---
name: Week 2 WebSocket Event Bus
description: Architecture decisions for the SSE→WS upgrade and frontend hook pitfalls
---

## Rule: WS server needs raw HTTP server, not app.listen()

`app.listen()` returns an `http.Server` but it doesn't return a typed reference easily and Express 5 types differ. Always use:

```ts
const server = http.createServer(app);
initWsServer(server);
server.listen(port, callback);
```

**Why:** `ws.WebSocketServer({ noServer: true })` listens on `server.on('upgrade', ...)`. If you call `app.listen()` and don't capture the return value before `initWsServer`, the upgrade handler never attaches.

## Rule: useRealtimeEvents must have exactly 2 hooks

The hook must stay at exactly 2 hooks: `useQueryClient()` + one `useEffect`. Adding a `useRef` + extra `useEffect` for queryClient stabilization caused "Rendered more/fewer hooks" errors on Vite HMR because the old version was cached with 2 hooks and the new one had 4.

**Fix:** Keep `queryClient` in the effect closure (it's stable from React Query) or accept the eslint disable. Never add intermediate useRef wrappers.

## Rule: Client-side fan-out via module-level pub/sub

`useRealtimeEvents` lives in AppShell (called once). Dashboard and other pages need to react to WS events without a second connection. Use `agentEventEmitter.ts` (module singleton) — `subscribeAgentEvents / dispatchAgentEvent`. No React Context needed.

## Rule: Phaser triggerLevelUpByName maps by uppercase name

`stationScene.triggerLevelUpByName(name)` looks up `agents.find(a => a.name === name)`. DB agent names must be passed `.toUpperCase()` since Phaser stores names in uppercase (ARIA, STRAT, etc.).

**How to apply:** In any event handler that wants to fire the Phaser burst: `sceneRef.current?.triggerLevelUpByName(agentName.toUpperCase())`
