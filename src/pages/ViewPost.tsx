import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Box } from "@chakra-ui/react";

import CommentBox from "../components/CommentBox";
import Post from "../components/Post";

export default function ViewPost() {
  const { postId } = useParams();
  const [composeId, setCompose] = useState("");

  return (
    <Box>
      <Post id={postId} onEdit={setCompose} />

      {composeId ? (
        <CommentBox parent={composeId} onClose={() => setCompose("")} />
      ) : null}
    </Box>
  );
}
