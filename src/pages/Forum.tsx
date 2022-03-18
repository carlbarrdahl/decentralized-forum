import { Table, Thead, Tr, Th, Td, Text, Tbody } from "@chakra-ui/react";
import Link from "../components/Link";
import { useListPosts } from "../hooks/posts";

const PostList = () => {
  const { data = [], isLoading, error } = useListPosts();
  console.log(data);
  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Topic</Th>
          <Th isNumeric>Replies</Th>
          <Th isNumeric>Activity</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((post) => (
          <Tr key={post.id}>
            <Td>
              <Link href={`/${post.id}`}>
                <Text fontSize={"md"}>{post.title}</Text>
              </Link>
            </Td>
            <Td isNumeric>{post.comments.length}</Td>
            <Td isNumeric>{post.last_activity}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default function Forum() {
  return (
    <div>
      <h3>Forum</h3>
      <PostList />
    </div>
  );
}
