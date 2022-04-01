import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import Avatar from "boring-avatars";
import { useIsFetching } from "react-query";
import { useConnect } from "../hooks/auth";

import Link from "./Link";

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
          <MenuItem>
            <Link href={`/u/${connection.selfID.id}`}>Profile</Link>
          </MenuItem>
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
