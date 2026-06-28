import net from "net";

const TARGET_PORT = 5000;
const PROXY_PORT = 8084;

net
  .createServer((socket) => {
    const target = net.connect(TARGET_PORT, "localhost");
    socket.pipe(target);
    target.pipe(socket);
    socket.on("error", () => target.destroy());
    target.on("error", () => socket.destroy());
  })
  .listen(PROXY_PORT, "0.0.0.0", () => {
    console.log(`[proxy] ${PROXY_PORT} → ${TARGET_PORT}`);
  });
