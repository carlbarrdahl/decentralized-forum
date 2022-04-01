import { useViewerConnection } from "@self.id/react";
import { useQueries, useQueryClient } from "react-query";
import { useLocalStorage } from "react-use";

async function createAuthProvider() {
  return import("@self.id/web").then(async ({ EthereumAuthProvider }) => {
    // The following assumes there is an injected `window.ethereum` provider
    const addresses = await global?.ethereum.request({
      method: "eth_requestAccounts",
    });

    return new EthereumAuthProvider(global?.ethereum, addresses[0]);
  });
}

export function useConnect() {
  const queryClient = useQueryClient();
  const [connection, connect, disconnect] = useViewerConnection();
  const [storedDid, setDid, removeDid] = useLocalStorage("did");

  /*
  Create queries for connect and disconnect Web3.
  
  - Connect is automatically triggered if DID is stored from previous session.
  - Disconnect is lazily triggered when on button click (enabled: false + refetch)
  */
  const [{ refetch: _connect }, { refetch: _disconnect }] = useQueries([
    {
      queryKey: "connect",
      queryFn: async () => {
        createAuthProvider()
          .then(connect)
          .then((user) => setDid(user?.id || ""));
      },
      enabled: Boolean(storedDid),
    },
    {
      queryKey: "disconnect",
      queryFn: () => {
        disconnect();
        removeDid();
        queryClient.clear();
      },
      enabled: false,
    },
  ]);

  return { connection, connect: _connect, disconnect: _disconnect };
}
