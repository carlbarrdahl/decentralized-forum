# Decentralized Forum

### Background

Ceramic is excellent for user-centric data but to connect data from multiple users there needs to be some kind of registry or indexer to aggregate this data. One solution is to use a backend to which the clients push the created Ceramic StreamID's. However, this creates a single point of failure in a centralized server.

OrbitDB is a p2p database built on IPFS and IPFS pubsub. A shared database can be created to which any peer can push data. This data is then replicated between peers.

### How does it work?

- Ceramic + Self.ID is used to authenticate and create a DID for a user with a connected Ethereum wallet (see [`hooks/auth.ts`](https://github.com/carlbarrdahl/decentralized-forum/blob/master/src/hooks/auth.ts))
- DID is linked to OrbitDB as an Identity and each database entry has a signature and a publicKey ([`providers/Orbit.tsx#L71-L82`](https://github.com/carlbarrdahl/decentralized-forum/blob/master/src/providers/Orbit.tsx#L71))
- Posts, Comments, Likes etc are stored on Ceramic ([`hooks/forum.ts`](https://github.com/carlbarrdahl/decentralized-forum/blob/master/src/hooks/forum.ts#L22), schema in [`scripts/create-model.mjs`](https://github.com/carlbarrdahl/decentralized-forum/blob/master/src/scripts/create-model.mjs)
  )
- OrbitDB is used as a p2p registry to index data in a database based on `ipfs-log` (append-only log)
- Whever data is written to OrbitDB the access controller verifies access with: `(entry) => (entry.identity.publicKey === identity.publicKey)`
- The registry can be queried, searched and filtered with keys from the indexed data [`hooks/registry.ts#L15-L49`](https://github.com/carlbarrdahl/decentralized-forum/blob/master/src/hooks/registry.ts#L15)

A few examples:

```js
function ForumPosts() {
  const { data, isLoading, error } = useRegistry({
    type: "post",
    sortBy: "created_at",
    limit: 10,
  });
}

function CommentsForPost({ id }) {
  const { data, isLoading, error } = useRegistry({
    parent: id,
    type: "comment",
  });
}

function LikesForAuthor({ author }) {
  const { data, isLoading, error } = useRegistry({
    author,
    type: "likes",
  });
}

function Feed({ id }) {
  const { data, isLoading, error } = useRegistry({
    sortBy: "updated_at",
    sortDirection: "desc",
    limit: 20,
    skip: 0,
  });
}
```
