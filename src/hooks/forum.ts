import { useMutation, useQuery, useQueryClient } from "react-query";
import { useCore, useViewerConnection } from "@self.id/react";
import { TileDocument } from "@ceramicnetwork/stream-tile";

import { setIdentity, useOrbit } from "../providers/Orbit";

type Query = {
  id?: string;
  type?: string;
  parent?: string;
  limit?: number;
  sortBy?: string;
  sortDirection?: string;
};

export function useRegistry(query: Query) {
  const db: any = useOrbit();

  const {
    sortBy = "created_at",
    sortDirection = "asc",
    limit = 100,
    ...where
  } = query;
  const orderDir = { asc: 1, desc: -1 };

  return useQuery(
    ["registry", query],
    async () => {
      return db.registry
        .query((item) =>
          Object.entries(where).every(([key, val]) => item[key] === val)
        )
        .sort((a, b) =>
          a[sortBy] > b[sortBy]
            ? orderDir[sortDirection] || 1
            : -orderDir[sortDirection] || -1
        )
        .slice(0, limit);
    },
    { enabled: !!db?.registry?.query }
  );
}

export type EntryInput = {
  title?: string;
  author?: string;
  content?: string;
  parent?: string;
  type?: "post" | "comment" | "like";
};

export type Entry = Partial<EntryInput> & {
  id: string;
  author: string;
  created_at: string;
  updated_at: string;
};

export function useCreateEntry() {
  const core = useCore();
  const [{ selfID }]: any = useViewerConnection();

  const db: any = useOrbit();
  const client = useQueryClient();
  return useMutation(async (props: EntryInput) => {
    // Link OrbitDB and Ceramic identities
    await setIdentity(db.orbitdb, selfID.client);

    const now = getNow();
    const entity = {
      author: selfID.id,
      created_at: now,
      updated_at: now,
      ...props,
    };

    console.log("creating post", entity, selfID.id);
    const id = await core.dataModel
      // @ts-ignore
      .createTile("Post", entity)
      .then((doc) => doc.id.toString());

    console.log("post created", id);
    console.log("adding to registry");

    // @ts-ignore
    await db.registry.put(buildRegistryData({ id, ...entity }));

    await client.invalidateQueries(["registry"]);
    return id;
  });
}

export function useUpdateEntry() {
  const core = useCore();
  const [{ selfID }]: any = useViewerConnection();
  const db: any = useOrbit();
  const client = useQueryClient();
  return useMutation(async (update: Entry) => {
    // Link OrbitDB and Ceramic identities
    await setIdentity(db.orbitdb, selfID.client);

    update.updated_at = getNow();
    const { id } = update;
    console.log("updating post", id, update, selfID.id);

    const merged = await TileDocument.load(core.ceramic, id).then(
      async (doc) => {
        // @ts-ignore
        const patch = { ...doc.content, ...update };
        await doc?.update(patch);
        return patch;
      }
    );

    // Remove content from data to index
    console.log("post updated", id);
    console.log("updating registry");
    await db.registry.put(buildRegistryData(merged));

    client.invalidateQueries(["registry"]);
    client.invalidateQueries([id]);
    return id;
  });
}

function buildRegistryData({ content, ...data }) {
  return data;
}

export function useStream(streamID) {
  const core = useCore();
  return useQuery(
    [streamID],
    async () => {
      return core.tileLoader.load(streamID).then((doc) => ({
        id: doc.id.toString(),
        ...doc.content,
      })) as Partial<Entry>;
    },
    { enabled: !!streamID }
  );
}

export const getNow = () => new Date().toISOString();
