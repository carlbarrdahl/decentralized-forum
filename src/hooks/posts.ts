import { useWeb3React } from "@web3-react/core";
import { useMutation, useQuery, useQueryClient } from "react-query";

import Identities from "orbit-db-identity-provider";
import { useOrbit } from "../providers/Orbit";

export function useCreatePost() {
  const db: any = useOrbit();
  const { library } = useWeb3React();
  const client = useQueryClient();
  return useMutation(async (post: { title: string; content: string }) => {
    await createEthereumIdentity(library, db.orbitdb);

    const id = uuid();
    await db.posts.put({
      id,
      created_at: new Date().toISOString(),
      author: db.orbitdb.identity.id,
      ...post,
    });
    await client.invalidateQueries(["posts"]);
    return { id };
  });
}

export function useListPosts() {
  const db: any = useOrbit();

  return useQuery(
    ["posts"],
    async () => {
      console.log("useListPosts", db);
      return db.posts
        .query(() => true)
        .map((post) => getPost(post.id, db))
        .sort((a, b) => (a.created_at > b.created_at ? -1 : 1));
    },
    { enabled: !!db }
  );
}

export function usePost(postId) {
  const db: any = useOrbit();

  return useQuery(
    ["post", postId],
    async () => {
      console.log("usePost", db);
      return getPost(postId, db);
    },
    { enabled: !!(db && postId) }
  );
}

async function createEthereumIdentity(provider, orbitdb) {
  const wallet = await provider.getSigner();
  if (orbitdb.identity.type !== "ethereum") {
    const identity = await Identities.createIdentity({
      type: "ethereum",
      wallet,
    });

    console.log(orbitdb);
    console.log(identity);
    orbitdb.identity = identity;
  }
}

export function useCreateComment(postId) {
  const db: any = useOrbit();
  const { library } = useWeb3React();
  const client = useQueryClient();

  return useMutation(
    async (comment: { id?: string; parent: string; content: string }) => {
      await createEthereumIdentity(library, db.orbitdb);

      const id = comment.id || uuid();
      await db.comments.put({
        id,
        ...(comment.id ? {} : { created_at: new Date().toISOString() }),
        updated_at: new Date().toISOString(),
        author: db.orbitdb.identity.id,
        ...comment,
      });
      await client.invalidateQueries(["post", postId]);
      return { id };
    }
  );
}

// export function useLike(parentId) {
//   const db: any = useOrbit();
//   const { library } = useWeb3React();
//   const client = useQueryClient();

//   return useMutation(async (comment: { parent: string; content: string }) => {
//     await createEthereumIdentity(library, db.orbitdb);

//     const id = uuid();
//     await db.likes.put({
//       id,
//       created_at: new Date().toISOString(),
//       author: db.orbitdb.identity.id,
//       ...comment,
//     });
//     await client.invalidateQueries(["likes", parentId]);
//     return { id };
//   });
// }

const uuid = () => Math.random().toString(16).substr(2);

function getPost(id, db) {
  const post = db.posts.get(id)[0];
  const comments = db.comments
    .query((comment) => comment.parent === id)
    .sort((a, b) => (a.created_at > b.created_at ? 1 : -1));
  return {
    ...post,
    last_activity: [post.created_at]
      .concat(comments.map((c) => c.created_at))
      .sort((a, b) => (a < b ? 1 : -1))[0],
    comments,
  };
}
