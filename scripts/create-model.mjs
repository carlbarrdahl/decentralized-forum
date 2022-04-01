import { writeFile } from "node:fs/promises";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { model as profileModel } from "@datamodels/identity-profile-basic";
import { ModelManager } from "@glazed/devtools";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import { fromString } from "uint8arrays";

import { config } from "dotenv";
config();

if (!process.env.SEED) {
  throw new Error("Missing SEED environment variable");
}

const CERAMIC_URL =
  process.env.CERAMIC_URL || "https://ceramic-clay.3boxlabs.com";

// The seed must be provided as an environment variable
const seed = fromString(process.env.SEED, "base16");
// Create and authenticate the DID
const did = new DID({
  provider: new Ed25519Provider(seed),
  resolver: getResolver(),
});

console.log(seed);

await did.authenticate();

// Connect to the Ceramic node
const ceramic = new CeramicClient(CERAMIC_URL);
ceramic.did = did;

// Create a manager for the model
const manager = new ModelManager(ceramic);

// Add basicProfile to the model
manager.addJSONModel(profileModel);

// Create the schemas
const threadSchemaID = await manager.createSchema("Post", {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Post",
  type: "object",
  properties: {
    title: {
      type: "string",
      title: "Title",
    },
    content: {
      type: "string",
      title: "Content",
    },
    author: {
      type: "string",
      title: "Author",
    },
    type: {
      // post || comment || like || ...
      type: "string",
      title: "Type",
    },
    created_at: {
      type: "string",
      format: "date-time",
      title: "Created",
      maxLength: 30,
    },
    updated_at: {
      type: "string",
      format: "date-time",
      title: "Updated",
      maxLength: 30,
    },
  },
});

// Write model to JSON file
await writeFile(
  new URL("model.json", import.meta.url),
  JSON.stringify(manager.toJSON())
);
console.log("Encoded model written to scripts/model.json file");
