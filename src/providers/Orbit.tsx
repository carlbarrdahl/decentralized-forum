import { createContext, useContext, useEffect, useState } from "react";

async function createOrbitDB() {
  const ipfsConfig = {
    preload: { enabled: false }, // Prevents large data transfers
    repo: "/orbitdb/dxdao/forum/registry/0.0.1",
    EXPERIMENTAL: {
      pubsub: true,
    },
    config: {
      Addresses: {
        Swarm: [
          // Use IPFS dev signal server
          // Websocket:
          // '/dns4/ws-star-signal-1.servep2p.com/tcp/443/wss/p2p-websocket-star',
          // '/dns4/ws-star-signal-2.servep2p.com/tcp/443/wss/p2p-websocket-star',
          // '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
          // WebRTC:
          // '/dns4/star-signal.cloud.ipfs.team/wss/p2p-webrtc-star',
          "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/",
          "/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star/",
          "/dns4/webrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star/",
          // Use local signal server
          // '/ip4/0.0.0.0/tcp/9090/wss/p2p-webrtc-star',
        ],
      },
    },
  };
  const dbConfig = {
    create: true,
    sync: false,
    indexBy: "id",
    accessController: {
      write: ["*"],
    },
  };

  // @ts-ignore
  const ipfs = await window.Ipfs.create(ipfsConfig);
  // @ts-ignore
  const orbitdb = await window.OrbitDB.createInstance(ipfs);

  const posts = await orbitdb.docstore("posts", dbConfig);
  const comments = await orbitdb.docstore("comments", dbConfig);
  const registry = await orbitdb.docstore("registry", dbConfig);

  await posts.load();
  await comments.load();
  await registry.load();
  // @ts-ignore
  window.orbitdb = orbitdb;
  return {
    orbitdb,
    posts,
    comments,
    registry,
  };
}

const OrbitContext = createContext({});

export const useOrbit = () => useContext(OrbitContext);

export default function OrbitProvider(props) {
  const [{ isLoading, error, data }, setState] = useState({
    isLoading: true,
    error: null,
    data: {},
  });
  useEffect(() => {
    createOrbitDB().then((data) =>
      setState({ isLoading: false, error: null, data })
    );
  }, []);
  return (
    <OrbitContext.Provider value={data}>{props.children}</OrbitContext.Provider>
  );
}
