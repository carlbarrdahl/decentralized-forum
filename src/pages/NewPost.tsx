import { Box, FormControl, Input, FormLabel, Textarea } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useCreatePost } from "../hooks/posts";

const CreatePost = () => {
  const create = useCreatePost();
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { title: "", content: "" },
  });

  return (
    <Box
      as="form"
      onSubmit={handleSubmit((form) => {
        console.log("create post", form);
        create.mutate(form, {
          onSuccess: ({ id }) => {
            reset();
            navigate(`/${id}`);
          },
        });
      })}
    >
      <FormControl mb={2}>
        <FormLabel htmlFor="title">Title</FormLabel>
        <Input id="title" {...register("title")} />
      </FormControl>
      <FormControl mb={2}>
        <FormLabel htmlFor="content">Content</FormLabel>
        <Textarea id="content" {...register("content")}></Textarea>
      </FormControl>
      <Button type="submit" isLoading={create.isLoading}>
        Create
      </Button>
    </Box>
  );
};

export default function NewPost() {
  return (
    <div>
      <h3>New Post</h3>
      <CreatePost />
    </div>
  );
}
