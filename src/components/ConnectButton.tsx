import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Flex,
  Link,
  Spinner,
} from "@chakra-ui/react";
import { useViewerConnection } from "@self.id/react";
import Avatar from "boring-avatars";
import { useQueries, useQueryClient, useIsFetching } from "react-query";
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
  const [did, setDid, removeDid] = useLocalStorage("did");

  const [{ refetch: _connect }, { refetch: _disconnect }] = useQueries([
    {
      queryKey: "connect",
      queryFn: async () => {
        createAuthProvider()
          .then(connect)
          .then((user) => setDid(user?.id || ""));
      },
      enabled: !!did,
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

const ConnectButton: React.FC = () => {
  const isGlobalLoading = useIsFetching();
  const { connection, connect, disconnect } = useConnect();

  return connection.status === "connected" ? (
    <>
      <Menu>
        <MenuButton>
          {isGlobalLoading ? (
            <Flex
              width={"40px"}
              height="40px"
              alignItems="center"
              justifyContent="center"
            >
              <Spinner size={"md"} />
            </Flex>
          ) : (
            <Avatar variant="beam" name={connection.selfID.id} />
          )}
        </MenuButton>
        <MenuList>
          <MenuItem>Profile</MenuItem>
          <MenuItem onClick={() => disconnect()}>Sign out</MenuItem>
        </MenuList>
      </Menu>
    </>
  ) : "ethereum" in global ? (
    <Button
      loadingText="Connecting"
      isLoading={connection.status === "connecting"}
      onClick={() => connect()}
    >
      Connect
    </Button>
  ) : (
    <Text fontSize="sm">
      Get{" "}
      <Link
        as="a"
        color="blue.600"
        href="https://metamask.io/"
        target="_blank"
        rel="noreferrer"
      >
        MetaMask
      </Link>{" "}
      to authenticate.
    </Text>
  );
};

export default ConnectButton;
