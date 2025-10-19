import http from "node:http";
import os from "node:os";

const probePort = Number.parseInt(process.env.PROBE_PORT ?? "", 10) || 3100;
const probeHost = process.env.PROBE_HOST ?? "0.0.0.0";

const interfaces = Object.entries(os.networkInterfaces())
  .flatMap(([name, infos = []]) =>
    infos
      .filter((info) => info.family === "IPv4")
      .map((info) => `${name} → http://${info.address}:${probePort}`)
  )
  .join("\n");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(
    [
      "WSL probe server OK",
      `Host: ${probeHost}`,
      `Port: ${probePort}`,
      `URL: ${req.headers.host ?? ""}`,
      `User-Agent: ${req.headers["user-agent"] ?? ""}`,
      "",
      "If you can read this in your browser from Windows, WSL networking is working.",
    ].join("\n")
  );
});

server.listen(probePort, probeHost, () => {
  console.log("[probe] Listening");
  console.log(`[probe]  ↳ Local:      http://localhost:${probePort}`);
  console.log(`[probe]  ↳ WSL:        http://${probeHost}:${probePort}`);
  if (interfaces) {
    console.log("[probe]  ↳ Interfaces:");
    console.log(interfaces);
  }
  console.log(
    "[probe] Use Ctrl+C to stop. Override defaults with PROBE_PORT or PROBE_HOST."
  );
});

const shutDown = () => {
  console.log("[probe] Shutting down…");
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutDown);
process.on("SIGTERM", shutDown);
