import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";

import {
  injected,
  useEagerConnect,
  useInactiveListener,
} from "../providers/Web3";

import Link from "./Link";
import Button from "./Button";
import Avatar from "boring-avatars";

const ConnectWallet = () => {
  const context = useWeb3React<Web3Provider>();
  const { connector, account, activate, deactivate, active, error } = context;

  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = useState<any>();
  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, connector]);

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect();

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || !!activatingConnector);

  return account ? (
    <Menu>
      <MenuButton>
        <Avatar name={account} />
      </MenuButton>
      <MenuList>
        <MenuItem onClick={() => deactivate()}>Sign out</MenuItem>
      </MenuList>
    </Menu>
  ) : (
    <Button onClick={() => activate(injected)}>Connect</Button>
  );
};

export default function Layout(props) {
  return (
    <Container maxWidth={"4xl"}>
      <Flex as="nav" justify={"space-between"}>
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/new">New post</Link>
          </li>
        </ul>
        <ConnectWallet />
      </Flex>
      <Box pt={6}>{props.children}</Box>
    </Container>
  );
}
