import {
  Box,
  Flex,
  Input,
  IconButton,
  FormControl,
  Textarea,
} from "@chakra-ui/react";
import Button from "../components/Button";
import { Entry, useCreateEntry } from "../hooks/forum";
import { FiX } from "react-icons/fi";
import { useForm } from "react-hook-form";

export default function CommentBox({ parent, onClose }) {
  const create = useCreateEntry();
  const { register, reset, handleSubmit } = useForm<Entry>({
    defaultValues: { content: "", parent, type: "comment" },
  });

  return (
    <Box
      position={"sticky"}
      bg="white"
      bottom={0}
      as="form"
      pb={4}
      onSubmit={handleSubmit((form) => {
        create.mutate(form, {
          onSuccess: (comment) => {
            console.log("comment created", comment);
            reset();
            onClose();
          },
        });
      })}
    >
      <Flex justify={"space-between"}>
        <FormControl mb={3}>
          <Input value={parent} />
        </FormControl>
        <IconButton
          variant={"ghost"}
          aria-label="close"
          icon={<FiX />}
          onClick={onClose}
        />
      </Flex>
      <FormControl mb={3}>
        <Textarea autoFocus rows={7} {...register("content")}></Textarea>
      </FormControl>

      <Flex>
        <Button isLoading={create.isLoading} colorScheme="purple" type="submit">
          Comment
        </Button>
      </Flex>
    </Box>
  );
}
