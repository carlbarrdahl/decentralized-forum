import { Box, Container, Flex } from "@chakra-ui/react";

import Link from "./Link";
import ConnectButton from "./ConnectButton";

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
        <ConnectButton />
      </Flex>
      <Box pt={6}>{props.children}</Box>
    </Container>
  );
}
