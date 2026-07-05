// server.mjs
import dgram from "node:dgram";

const PORT = 7359;

const ADDRESS = process.env.JELLYFIN_ADDRESS; // e.g. https://jellyfin.example.com

if (!ADDRESS) {
  console.error("Missing JELLYFIN_ADDRESS");
  process.exit(1);
}

async function getPublicSystemInfo() {
  const infoUrl = new URL("/System/Info/Public", ADDRESS);
  const response = await fetch(infoUrl);

  if (!response.ok) {
    throw new Error(
      `Jellyfin public info request failed: ${response.status} ${response.statusText}`
    );
  }

  const info = await response.json();

  if (!info.ServerName || !info.Id) {
    throw new Error("Jellyfin public info response is missing ServerName or Id");
  }

  return {
    name: info.ServerName,
    id: info.Id,
  };
}

const socket = dgram.createSocket({
  type: "udp4",
  reuseAddr: true,
});

socket.on("error", (err) => {
  console.error("Socket error:", err);
  process.exit(1);
});

async function main() {
  const { name, id } = await getPublicSystemInfo();

  socket.on("message", (msg, rinfo) => {
    const text = msg.toString("utf8");

    if (!text.toLowerCase().includes("who is jellyfinserver?")) {
      return;
    }

    const response = {
      Address: ADDRESS,
      Id: id,
      Name: name,
      EndpointAddress: null,
    };

    const payload = Buffer.from(JSON.stringify(response), "utf8");

    socket.send(payload, rinfo.port, rinfo.address, (err) => {
      if (err) {
        console.error("Failed to send discovery reply:", err);
        return;
      }

      console.log(
        `Replied to ${rinfo.address}:${rinfo.port} with ${response.Address}`
      );
    });
  });

  socket.bind(PORT, "0.0.0.0", () => {
    console.log(`Jellyfin discovery shim listening on UDP ${PORT}`);
    console.log(`Node version: ${process.version}`);
    console.log(`Advertising: ${ADDRESS}`);
    console.log(`Name: ${name}`);
    console.log(`Id: ${id}`);
  });
}

main().catch((err) => {
  console.error("Failed to start Jellyfin discovery shim:", err);
  process.exit(1);
});
