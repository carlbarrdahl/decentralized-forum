import React, { useState } from "react";

import {
  Box,
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

const ProfileName = ({ did }) => {
  const { content, isLoading, error } = usePublicRecord("basicProfile", did);

  return <span>{content?.name || did}</span>;
};

const Comments = ({ parent, onEdit }) => {
  const { data: comments } = useRegistry({
    parent,
    type: "comment",
    sortBy: "created_at",
    sortDirection: "asc",
  });

  return (
    <>
      {(comments || []).map((comment: any) => (
        <Box key={comment.id} ml={12}>
          <Post
            id={comment.id}
            {...comment}
            onEdit={() => onEdit(comment.id)}
          />
        </Box>
      ))}
    </>
  );
};

function EditPost({ id, content, onSuccess }) {
  const update = useUpdateEntry();
  const [value, setValue] = useState(content);

  return (
    <>
      <Textarea
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button
        isLoading={update.isLoading}
        onClick={() => update.mutate({ id, content: value }, { onSuccess })}
      >
        Save
      </Button>
    </>
  );
}

export default function Post({ id, parent, author, created_at, onEdit }) {
  const [{ selfID }]: any = useViewerConnection();
  const [isEditing, setEditing] = useState("");

  const { data: { content } = {}, isLoading, error } = useStream(id);
  return (
    <>
      <Flex py={4}>
        <Avatar variant="beam" name={author}></Avatar>
        <Box ml={4} flex={1}>
          <Flex justify={"space-between"} alignItems={"center"} mb={3}>
            <Link href={`/u/${author}`}>
              <ProfileName did={author} />
            </Link>
            <Flex alignItems={"center"}>
              {/* {selfID?.id === author ? ( */}
              <IconButton
                variant="ghost"
                aria-label="edit"
                icon={<FiEdit2 />}
                mr={2}
                onClick={() => setEditing(id)}
              />
              {/* ) : null} */}
              <Text title={created_at} py={2}>
                {formatTime(created_at)}
              </Text>
            </Flex>
          </Flex>
          <SkeletonText isLoaded={!!content}>
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

          <Flex justify={"flex-end"}>
            <ButtonGroup variant={"ghost"}>
              <LikeButton id={id} />
              <Link href={`/${parent}#${id}`}>
                <IconButton aria-label="link" icon={<FiLink />} />
              </Link>
              {/* <IconButton aria-label="bookmark" icon={<FiBookmark />} /> */}
              <Button leftIcon={<FiMessageCircle />} onClick={() => onEdit(id)}>
                Reply
              </Button>
            </ButtonGroup>
          </Flex>
        </Box>
      </Flex>
      <Divider mb={3} />
      <Comments parent={id} onEdit={onEdit} />
    </>
  );
}
