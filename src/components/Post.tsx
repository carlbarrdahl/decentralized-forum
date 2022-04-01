import React, { useState } from "react";

import {
  Box,
  Heading,
  Divider,
  Flex,
  Text,
  ButtonGroup,
  IconButton,
  SkeletonText,
  Textarea,
} from "@chakra-ui/react";

import Link from "../components/Link";
import Button from "../components/Button";
import {
  useCreateEntry,
  useUpdateEntry,
  useRegistry,
  useStream,
} from "../hooks/forum";
import { FiHeart, FiLink, FiMessageCircle, FiEdit2, FiX } from "react-icons/fi";
import Avatar from "boring-avatars";

import { usePublicRecord, useViewerConnection } from "@self.id/react";
import { formatTime } from "../utils/date";
import { useForm } from "react-hook-form";
import ProfileName from "./ProfileName";

const LikeButton = ({ id }) => {
  const [{ selfID }]: any = useViewerConnection();
  const { data: likes = [] } = useRegistry({
    parent: id,
    type: "like",
  });

  const create = useCreateEntry();
  const update = useUpdateEntry();
  const liked = likes.find((i) => i.author === selfID?.id);

  return (
    <Button
      aria-label="like"
      rightIcon={
        <FiHeart
          {...{
            fill: liked ? "red" : "none",
            stroke: liked ? "red" : "currentColor",
          }}
        />
      }
      onClick={() =>
        liked
          ? update.mutate({ id: liked.id, ...liked, content: "" })
          : create.mutate({
              parent: id,
              content: ":thumbsup:",
              type: "like",
            })
      }
    >
      {likes.length}
    </Button>
  );
};

function EditPost({ id, content, onSuccess }) {
  const update = useUpdateEntry();
  const { register, handleSubmit } = useForm({
    defaultValues: { id, content },
  });

  return (
    <form onSubmit={handleSubmit((form) => update.mutate(form, { onSuccess }))}>
      <Textarea mb={3} autoFocus {...register("content")} />
      <ButtonGroup>
        <Button type="submit" isLoading={update.isLoading}>
          Save
        </Button>
        <Button variant="ghost" onClick={onSuccess}>
          Cancel
        </Button>
      </ButtonGroup>
    </form>
  );
}

function PostHeader({ author, created_at, onEdit }) {
  const [{ selfID }]: any = useViewerConnection();
  return (
    <Flex justify={"space-between"} alignItems={"center"} mb={3}>
      <Link href={`/u/${author}`}>
        <ProfileName did={author} />
      </Link>
      <Flex alignItems={"center"}>
        {selfID?.id === author ? (
          <IconButton
            variant="ghost"
            aria-label="edit"
            icon={<FiEdit2 />}
            mr={2}
            onClick={onEdit}
          />
        ) : null}
        <Text title={created_at} py={2}>
          {formatTime(created_at)}
        </Text>
      </Flex>
    </Flex>
  );
}

function PostFooter({ id, onEdit }) {
  return (
    <Flex justify={"flex-end"}>
      <ButtonGroup variant={"ghost"}>
        <LikeButton id={id} />
        <Link href={`#${id}`}>
          <IconButton aria-label="link" icon={<FiLink />} />
        </Link>
        {/* <IconButton aria-label="bookmark" icon={<FiBookmark />} /> */}
        <Button leftIcon={<FiMessageCircle />} onClick={onEdit}>
          Reply
        </Button>
      </ButtonGroup>
    </Flex>
  );
}

export default function Post({ id, onEdit }) {
  const [isEditing, setEditing] = useState("");

  const { data: comments = [] } = useRegistry({
    parent: id,
    type: "comment",
    sortBy: "created_at",
    sortDirection: "asc",
  });

  const {
    data: { author, title, content, created_at, parent } = {},
    isLoading,
    error,
  } = useStream(id);

  return (
    <>
      {title ? (
        <>
          <Heading as="h1" fontSize={"2xl"} mb={3}>
            {title}
          </Heading>
          <Divider />
        </>
      ) : null}
      <Flex id={`${id}`} py={4}>
        <Avatar variant="beam" name={author}></Avatar>
        <Box ml={4} flex={1}>
          <PostHeader
            author={author}
            created_at={created_at}
            onEdit={() => setEditing(id)}
          />
          <SkeletonText isLoaded={!isLoading}>
            {isEditing ? (
              <EditPost
                id={id}
                content={content}
                onSuccess={() => setEditing("")}
              />
            ) : (
              <Text whiteSpace={"pre-wrap"}>{content}</Text>
            )}
          </SkeletonText>
          <PostFooter id={id} onEdit={() => onEdit(id)} />
        </Box>
      </Flex>
      <Divider mb={3} />
      {comments.map((comment) => (
        <Box key={comment.id} ml={12}>
          <Post id={comment.id} onEdit={() => onEdit(comment.id)} />
        </Box>
      ))}
    </>
  );
}
