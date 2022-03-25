import { useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Divider, Heading } from "@chakra-ui/react";

import { useStream } from "../hooks/forum";
import CommentBox from "../components/CommentBox";
import Post from "../components/Post";

export default function ViewPost() {
  const { postId } = useParams();
  const [composeId, setCompose] = useState("");

  const { data = {}, isLoading, error } = useStream(postId);
  return (
    <Box>
      <Heading as="h1" fontSize={"2xl"} mb={3}>
        {data?.title}
      </Heading>
      <Divider />
      <Post {...data} onEdit={setCompose} />

      {composeId ? (
        <CommentBox parent={composeId} onClose={() => setCompose("")} />
      ) : null}
    </Box>
  );
}
