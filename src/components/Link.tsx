import { Link as ChakraLink } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

export default function Link({ href, ...props }) {
  return <ChakraLink as={RouterLink} to={href} {...props} />;
}
