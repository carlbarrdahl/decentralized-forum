import React from "react";

import { Provider } from "@self.id/react";
import type { ModelTypeAliases, ModelTypesToAliases } from "@glazed/types";

import publishedModel from "../model.json";

const model: ModelTypesToAliases<ModelTypeAliases<{}, {}>> = publishedModel;

const client = {
  ceramic: "testnet-clay",
  connectNetwork: "testnet-clay",
  model,
};
function CeramicProvider({ children }) {
  return <Provider client={client}>{children}</Provider>;
}

export default CeramicProvider;
