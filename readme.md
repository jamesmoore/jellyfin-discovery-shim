# Jellyfin Discovery Shim
Lightweight UDP discovery responder for Jellyfin.

## Use case
- Your Jellyfin container runs in bridge mode behind a proxy.
- Jellyfin discovery on UDP 7359 is not reachable to clients.
- Run this shim in host networking mode to answer discovery requests using your real Jellyfin server info.

## Usage
Use this compose service:

```yml
services:
  jellyfin-discovery:
    image: ghcr.io/jamesmoore/jellyfin-discovery-shim:main
    network_mode: host
    restart: unless-stopped
    environment:
      JELLYFIN_ADDRESS: "https://jellyfin.example.com"
```

Then start it with:

```sh
docker compose up -d
```

Notes:
- Set JELLYFIN_ADDRESS to your public Jellyfin URL.
- Requires UDP 7359 reachability on the host network.

