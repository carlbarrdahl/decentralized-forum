import { createContext, useContext, useEffect, useState } from "react";

import * as IPFS from "ipfs";
import * as OrbitDB from "orbit-db";
import Identities from "orbit-db-identity-provider";
import { getResolver } from "@ceramicnetwork/3id-did-resolver";

import CustomStore from "../../orbitdb/CustomStore";

const env = process.env.NODE_ENV;
async function createOrbitDB() {
  const ipfsConfig = {
    preload: { enabled: false }, // Prevents large data transfers
    // repo: `dforum-0.1_${env}`,
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

  // @ts-ignore
  const ipfs = await IPFS.create(ipfsConfig);
  // @ts-ignore
  const orbitdb = await OrbitDB.createInstance(ipfs);

  // Add custom database (DocStore without delete)
  // TODO: Come up with a better name (AppendOnlyDocStore?)
  OrbitDB.addDatabaseType("custom", CustomStore);

  const dbName = `dforum-0.12_${env}`;
  const dbConfig = {
    create: true,
    sync: false,
    type: "custom",
    indexBy: "id",
    accessController: {
      write: ["*"],
    },
  };
  const registry = await orbitdb.open(dbName, dbConfig);

  await registry.load();
  // @ts-ignore
  window.orbitdb = orbitdb;
  // @ts-ignore
  window.logdb = registry;
  return {
    orbitdb,
    registry,
  };
}

// Connects the logged in Ceramic user to OrbitDB
export async function setIdentity({ orbitdb, registry }, { ceramic, threeId }) {
  if (orbitdb.identity.type !== "did") {
    Identities.DIDIdentityProvider.setDIDResolver(getResolver(ceramic));
    const identity = await Identities.createIdentity({
      type: "DID",
      didProvider: threeId.getDidProvider(),
    });
    orbitdb.identity = identity;
    registry.setIdentity(identity);
    console.log("OrbitDB: DID identity set!", identity);
  }
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
