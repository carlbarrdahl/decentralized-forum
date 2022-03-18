import { Buffer } from "buffer";

window.LOG = "orbit*";

class Forum {
  private node: any;
  private threads: any;

  private pieces: any;
  private user: any;

  onready: any;
  onmessage: any;
  onpeerconnect: any;

  defaultOptions = {};

  constructor(public ipfs: any, public orbitdb: any) {}
  async create() {
    this.node = await this.ipfs.create({
      preload: { enabled: false },
      relay: { enabled: true, hop: { enabled: true, active: true } },
      repo: "./ipfs", // not used in browser
      EXPERIMENTAL: { pubsub: true },
      // config: {
      //   Bootstrap: [],
      //   Addresses: { Swarm: [] },
      // },
    });

    // this.node.bootstrap.reset();
    // await this.node.bootstrap.add(undefined, { default: true });
    console.log("nodes", await this.node.bootstrap.list());

    this._init();
  }
  async _init() {
    const nodeInfo = await this.node.id();
    this.orbitdb = await this.orbitdb.createInstance(this.node);
    this.defaultOptions = {
      accessController: { write: [this.orbitdb.identity.id] },
    };

    const docStoreOptions = {
      ...this.defaultOptions,
      indexBy: "hash",
    };

    this.pieces = await this.orbitdb.docstore("pieces", docStoreOptions);
    await this.pieces.load();

    this.user = await this.orbitdb.kvstore("user", this.defaultOptions);
    await this.user.load();
    await this.user.set("pieces", this.pieces.id);

    await this.loadFixtureData({
      username: Math.floor(Math.random() * 1000000),
      pieces: this.pieces.id,
      nodeId: nodeInfo.id,
    });

    this.node.libp2p.connectionManager.on(
      "peer:connect",
      this.handlePeerConnected.bind(this)
    );
    await this.node.pubsub.subscribe(
      nodeInfo.id,
      this.handleMessageReceived.bind(this)
    );

    // when the OrbitDB docstore has loaded, intercept this method to
    // carry out further operations.
    this.onready();
  }

  async addNewPiece(hash, instrument = "Piano") {
    const existingPiece = this.pieces.get(hash);

    if (existingPiece.length > 0) {
      const cid = await this.updatePieceByHash(hash, instrument);
      return;
    }

    const dbName = "counter." + hash.substr(20, 20);
    const counter = await this.orbitdb.counter(dbName, this.defaultOptions);

    const cid = await this.pieces.put({
      hash: hash,
      instrument: instrument,
      counter: counter.id,
    });

    return cid;
  }

  getAllPieces() {
    const pieces = this.pieces.get("");
    return pieces;
  }

  getPieceByHash(hash) {
    const singlePiece = this.pieces.get(hash)[0];
    return singlePiece;
  }

  getByInstrument(instrument) {
    return this.pieces.query((piece) => piece.instrument === instrument);
  }

  async updatePieceByHash(hash, instrument = "Piano") {
    const piece = await this.getPieceByHash(hash);
    piece.instrument = instrument;
    const cid = await this.pieces.put(piece);
    return cid;
  }

  async deletePieceByHash(hash) {
    const cid = await this.pieces.del(hash);
    return cid;
  }

  async getPracticeCount(piece) {
    const counter = await this.orbitdb.counter(piece.counter);
    await counter.load();
    return counter.value;
  }

  async incrementPracticeCounter(piece) {
    const counter = await this.orbitdb.counter(piece.counter);
    const cid = await counter.inc();
    return cid;
  }

  async deleteProfileField(key) {
    const cid = await this.user.del(key);
    return cid;
  }

  getAllProfileFields() {
    return this.user.all;
  }

  getProfileField(key) {
    return this.user.get(key);
  }

  async updateProfileField(key, value) {
    const cid = await this.user.set(key, value);
    return cid;
  }

  async loadFixtureData(fixtureData) {
    const fixtureKeys = Object.keys(fixtureData);

    for (let i in fixtureKeys) {
      let key = fixtureKeys[i];

      if (!this.user.get(key)) await this.user.set(key, fixtureData[key]);
    }
  }

  async getIpfsPeers() {
    const peers = await this.node.swarm.peers();
    return peers;
  }

  async connectToPeer(multiaddr, protocol = "/p2p-circuit/ipfs/") {
    try {
      await this.node.swarm.connect(protocol + multiaddr);
    } catch (e) {
      throw e;
    }
  }

  handlePeerConnected(ipfsPeer) {
    const ipfsId = ipfsPeer.id._idB58String;
    if (this.onpeerconnect) this.onpeerconnect(ipfsId);
  }

  handleMessageReceived(msg) {
    if (this.onmessage) this.onmessage(msg);
  }

  async sendMessage(topic, message, callback) {
    try {
      const msgString = JSON.stringify(message);
      const messageBuffer = Buffer.from(msgString);
      await this.node.pubsub.publish(topic, messageBuffer);
    } catch (e) {
      throw e;
    }
  }

  async queryThreads() {
    return this.threads.get("");
  }

  async getThread(hash: string) {
    return this.threads.query(() => true);
  }

  async getThreadsByTag(tag: string) {
    return this.threads.query((thread) => thread.tags.includes(tag));
  }

  async createThread(
    hash: string,
    { title = "", tags = [] }: { title: string; tags: string[] }
  ) {
    console.log("Creating thread", title, tags, this.threads);
    // if (this.threads.get(hash).length) {
    //   console.log(this.threads.get(hash));
    //   return this.updateThread(hash, { title, tags });
    // }

    console.log("Creating reactions db");
    const reactions = await this.orbitdb.feed(
      `reactions.${hash}`,
      this.defaultOptions
    );

    console.log(reactions);
    return await this.threads.put({
      hash,
      title,
      tags,
      reactions: reactions.id,
    });
  }
  async updateThread(hash, props) {
    const thread = this.threads.get(hash);
    return this.threads.put({ ...thread, ...props });
  }
  async deleteThread(hash) {
    return this.threads.del(hash);
  }
  // async getReactions(thread) {
  //   console.log("Getting reactions");
  //   const reactions = this.orbitdb.feed(thread.reactions);
  //   await reactions.load();
  //   return reactions;
  // }
  async reactThread(
    thread,
    props: { comment?: string; author: string; type: "LIKE" | "COMMENT" }
  ) {
    console.log("Reacting to thread", thread, props);
    const reactions = await this.orbitdb.feed(thread.reactions);
    await reactions.load();
    return await reactions.add(props);
  }
}

// @ts-ignore
export const forum = new Forum(window.Ipfs, window.OrbitDB);

forum.onready = async () => {
  console.log("onready");

  const hash = "QmXG8yk8UJjMT6qtE2zSxzz3U7z5jSYRgVWLCUFqAVnByM";
  console.log(await forum.getAllProfileFields());
  await forum.sendMessage(hash, { data: "foo" }, console.log);
};
forum.onmessage = (msg) => console.log("onmessage", msg);
forum.onpeerconnect = (res) => console.log("onpeerconnect", res);
forum.create();
