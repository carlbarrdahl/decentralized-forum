// @ts-nocheck
"use strict";

import Store from "orbit-db-store";
import DocumentIndex from "./CustomIndex";
import pMap from "p-map";

const replaceAll = (str, search, replacement) =>
  str.toString().split(search).join(replacement);

class CustomStore extends Store {
  constructor(ipfs, id, dbname, options) {
    if (!options) options = {};
    if (!options.indexBy) Object.assign(options, { indexBy: "_id" });
    if (!options.Index) Object.assign(options, { Index: DocumentIndex });

    super(ipfs, id, dbname, options);

    this._type = "custom";
  }

  get(key, caseSensitive = false) {
    key = key.toString();
    const terms = key.split(" ");
    key =
      terms.length > 1
        ? replaceAll(key, ".", " ").toLowerCase()
        : key.toLowerCase();

    const search = (e) => {
      if (terms.length > 1) {
        return replaceAll(e, ".", " ").toLowerCase().indexOf(key) !== -1;
      }
      return e.toLowerCase().indexOf(key) !== -1;
    };
    const mapper = (e) => this._index.get(e);
    const filter = (e) => (caseSensitive ? e.indexOf(key) !== -1 : search(e));

    return Object.keys(this._index._index).filter(filter).map(mapper);
  }

  query(mapper, options = {}) {
    // Whether we return the full operation data or just the db value
    const fullOp = options.fullOp || false;

    return Object.keys(this._index._index)
      .map((e) => this._index.get(e, fullOp))
      .filter(mapper);
  }

  batchPut(docs, onProgressCallback) {
    const mapper = (doc, idx) => {
      return this._addOperationBatch(
        {
          op: "PUT",
          key: doc[this.options.indexBy],
          value: doc,
        },
        true,
        idx === docs.length - 1,
        onProgressCallback
      );
    };

    return pMap(docs, mapper, { concurrency: 1 }).then(() =>
      this.saveSnapshot()
    );
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

  putAll(docs, options = {}) {
    if (!Array.isArray(docs)) {
      docs = [docs];
    }
    if (!docs.every((d) => d[this.options.indexBy])) {
      throw new Error(
        `The provided document doesn't contain field '${this.options.indexBy}'`
      );
    }
    return this._addOperation(
      {
        op: "PUTALL",
        docs: docs.map((value) => ({
          key: value[this.options.indexBy],
          value,
        })),
      },
      options
    );
  }
}

export default CustomStore;
