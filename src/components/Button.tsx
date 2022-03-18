import { Button as ChakraButton, ButtonProps } from "@chakra-ui/react";

const Button: React.FC<ButtonProps> = (props) => {
  return <ChakraButton {...props} />;
};

export default Button;
