import { useMutation, useQuery, useQueryClient } from "react-query";
import { useCore, useViewerConnection } from "@self.id/react";
import { TileDocument } from "@ceramicnetwork/stream-tile";

import { setIdentity, useOrbit } from "../providers/Orbit";

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
  const cache = useQueryClient();
  return useMutation(async (props: EntryInput) => {
    console.time("creating post");
    // Link OrbitDB and Ceramic identities
    await setIdentity(db, selfID.client);

    const now = getNow();
    const entity = {
      author: selfID.id,
      created_at: now,
      updated_at: now,
      ...props,
    };

    console.log("creating post", entity, selfID.id);
    const created = await core.dataModel
      // @ts-ignore
      .createTile("Post", entity)
      .then(mapId);

    console.log("adding to registry", created);
    await db.registry.put(toIndex(created));

    // Update UI - could possibly be more specific by passing a query
    await cache.invalidateQueries(["registry"]);
    console.timeEnd("creating post");
    return created.id;
  });
}

export function useUpdateEntry() {
  const core = useCore();
  const [{ selfID }]: any = useViewerConnection();
  const db: any = useOrbit();
  const client = useQueryClient();
  return useMutation(async (props: Entry) => {
    console.time("updating post");
    // Link OrbitDB and Ceramic identities
    await setIdentity(db, selfID.client);

    props.updated_at = getNow();
    const { id } = props;
    if (!id) {
      throw new Error("No id provided to update entry");
    }
    console.log("updating post", id, props);

    const updated = await TileDocument.load<Entry>(core.ceramic, id).then(
      async (doc) => {
        // Merge the new data with the existing data
        const patch = { ...doc.content, ...props };
        await doc?.update(patch);
        return patch;
      }
    );

    console.log("post updated", updated);

    // Update registry
    await db.registry.put(toIndex(updated));

    // Update the UI where these queries are used
    client.invalidateQueries(["registry"]);
    client.invalidateQueries([id]);

    console.timeEnd("updating post");
    return id;
  });
}

export function useStream(streamID) {
  const core = useCore();
  return useQuery(
    [streamID],
    async () => core.tileLoader.load(streamID).then(mapId) as Partial<Entry>,
    { enabled: !!streamID }
  );
}

const mapId = (doc) => ({ id: doc.id.toString(), ...doc.content });

// Define what data to be indexed (currently everything except the content)
const toIndex = ({ content, ...data }: Entry) => data;

export const getNow = () => new Date().toISOString();
