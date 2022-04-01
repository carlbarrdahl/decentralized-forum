import {
  Table,
  Thead,
  Tr,
  Th,
  Td,
  Text,
  Tbody,
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react";
import Link from "../components/Link";
import { useRegistry } from "../hooks/registry";

const PostList = () => {
  const {
    data = [],
    isLoading,
    error,
  } = useRegistry({ type: "post", sortBy: "updated_at" });

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
        {isLoading ? (
          <Tr>
            <Td colSpan={3}>
              <SkeletonText noOfLines={1} />
            </Td>
          </Tr>
        ) : null}
        {data.map((post) => (
          <TopicRow key={post.id} {...post} />
        ))}
      </Tbody>
    </Table>
  );
};

export function getLastActivity(items) {
  return items.map((c) => c.updated_at).sort((a, b) => (a < b ? 1 : -1))[0];
}
const TopicRow = ({ id, title, updated_at }) => {
  const {
    data = [],
    isLoading,
    error,
  } = useRegistry({ parent: id, type: "comment" });

  const lastActivity = getLastActivity(data) || updated_at;
  return (
    <Tr>
      <Td>
        <Link href={`/${id}`}>
          <Text fontSize={"md"}>{title}</Text>
        </Link>
      </Td>
      <Skeleton as={Td} isNumeric isLoaded={!isLoading}>
        {data.length}
      </Skeleton>
      <Skeleton as={Td} isNumeric isLoaded={!isLoading}>
        {lastActivity}
      </Skeleton>
    </Tr>
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
