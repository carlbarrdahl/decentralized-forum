// @ts-nocheck
"use strict";

import Store from "orbit-db-store";
import DocumentIndex from "./CustomIndex";

class CustomStore extends Store {
  constructor(ipfs, id, dbname, options) {
    if (!options) options = {};
    if (!options.indexBy) Object.assign(options, { indexBy: "_id" });
    if (!options.Index) Object.assign(options, { Index: DocumentIndex });

    super(ipfs, id, dbname, options);

    this._type = "custom";
  }

  query(mapper, options = {}) {
    // Whether we return the full operation data or just the db value
    const fullOp = options.fullOp || false;

    return Object.keys(this._index._index)
      .map((e) => this._index.get(e, fullOp))
      .filter(mapper);
  }

  put(doc, options = {}) {
    if (!doc[this.options.indexBy]) {
      throw new Error(
        `The provided document doesn't contain field '${this.options.indexBy}'`
      );
    }

    return this._addOperation(
      {
        op: "PUT",
        key: doc[this.options.indexBy],
        value: doc,
      },
      options
    );
  }
}

export default CustomStore;
