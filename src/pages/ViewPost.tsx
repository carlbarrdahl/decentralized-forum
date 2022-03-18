import {
  Avatar,
  Box,
  Divider,
  Flex,
  Heading,
  Text,
  Input,
  ButtonGroup,
  IconButton,
  FormControl,
  FormLabel,
  Textarea,
} from "@chakra-ui/react";
import { isValid } from "date-fns";
import format from "date-fns/format";
import { useParams } from "react-router-dom";
import Link from "../components/Link";
import Button from "../components/Button";
import { useCreateComment, usePost } from "../hooks/posts";

import {
  FiHeart,
  FiLink,
  FiBookmark,
  FiMessageCircle,
  FiEdit2,
  FiX,
} from "react-icons/fi";
import { useForm } from "react-hook-form";
import { useWeb3React } from "@web3-react/core";
import { useState } from "react";

const CommentBox = ({ parent, onClose }) => {
  const create = useCreateComment(parent);
  const { register, reset, handleSubmit } = useForm({
    defaultValues: { content: "", parent },
  });

  return (
    <Box
      position={"sticky"}
      bg="white"
      bottom={0}
      as="form"
      pb={4}
      onSubmit={handleSubmit((form) => {
        console.log("post comment", form);
        create.mutate(form, {
          onSuccess: (comment) => {
            console.log("comment created", comment);
            reset();
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
        <Textarea rows={7} {...register("content")}></Textarea>
      </FormControl>

      <Flex>
        <Button colorScheme="purple" type="submit">
          Comment
        </Button>
      </Flex>
    </Box>
  );
};

const Post = ({ id, parent, content, author, created_at, onEdit }) => {
  const { account } = useWeb3React();
  console.log("account", account, onEdit);
  return (
    <>
      <Flex py={4}>
        <Avatar name={"author"}></Avatar>
        <Box ml={4} flex={1}>
          <Flex justify={"space-between"} alignItems={"center"} mb={3}>
            <Link href={`/u/${author}`}>{author}</Link>
            <Flex alignItems={"center"}>
              {account === author ? (
                <IconButton
                  variant="ghost"
                  aria-label="edit"
                  icon={<FiEdit2 />}
                  mr={2}
                  onClick={() => onEdit(id)}
                />
              ) : null}
              <Text title={created_at} py={2}>
                {formatTime(created_at)}
              </Text>
            </Flex>
          </Flex>
          <Text>{content}</Text>

          <Flex justify={"flex-end"}>
            <ButtonGroup variant={"ghost"}>
              <Button aria-label="like" rightIcon={<FiHeart />}>
                11
              </Button>
              <IconButton aria-label="link" icon={<FiLink />} />
              <IconButton aria-label="bookmark" icon={<FiBookmark />} />
              <Button leftIcon={<FiMessageCircle />} onClick={() => onEdit(id)}>
                Reply
              </Button>
            </ButtonGroup>
          </Flex>
        </Box>
      </Flex>
      <Divider mb={3} />
    </>
  );
};
export default function ViewPost() {
  const { postId } = useParams();
  const [composeId, setCompose] = useState("");

  const { data = {}, isLoading, error } = usePost(postId);
  console.log("post", data);
  return (
    <Box>
      <Heading as="h1" fontSize={"2xl"} mb={3}>
        {data.title}
      </Heading>
      <Divider />
      <Post {...data} />

      {(data.comments || []).map((comment: any) => (
        <Post
          parent={parent}
          key={comment.id}
          {...comment}
          onEdit={(val) => setCompose(val)}
        />
      ))}
      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
      {composeId ? (
        <CommentBox parent={composeId} onClose={() => setCompose("")} />
      ) : null}
    </Box>
  );
}

const formatTime = (date) => {
  const d = new Date(date);
  return isValid(d) ? format(d, "MMM dd") : "";
};
