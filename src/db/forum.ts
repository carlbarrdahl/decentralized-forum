class Forum {
  private node: any;
  public reactions: any;

  private user: any;

  onready: any;
  onmessage: any;
  onpeerconnect: any;

  defaultOptions = {};

  constructor(public ipfs: any, public orbitdb: any) {}
  async create() {
    this.node = await this.ipfs.create({
      preload: { enabled: false },
      repo: "/orbitdb/dxdao/forum/ipfs/0.55.1",
      relay: { enabled: true, hop: { enabled: true, active: true } },
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
      indexBy: "id",
    };

    this.reactions = await this.orbitdb.docstore("pieces", docStoreOptions);
    this.reactions.events.on("ready", () => {
      console.log("READY");
    });
    // When a remote peer updated the todos, refresh our data model
    this.reactions.events.on("replicated", () => console.log("REPLICATED"));
    // Watch for load progress and update the model state with the progress
    this.reactions.events.on(
      "load.progress",
      (address, hash, entry, progress, total) => {
        console.log("LOAD.PROGRESS", address, hash, entry, progress, total);
      }
    );

    await this.reactions.load();

    console.log("peeeers", await this.getIpfsPeers());
    // this.reactions = await this.orbitdb.docstore(
    //   "threadId",
    //   this.defaultOptions
    // );

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
}

// @ts-ignore
export const forum = new Forum(window.Ipfs, window.OrbitDB);

forum.onready = async () => {
  console.log("onready", forum);

  setInterval(() => {
    // forum.reactions.put({
    //   id: Math.random().toString(),
    //   type: "LIKE",
    //   author: Math.random().toString(),
    // });
    const reactions = forum.reactions.query((item) => true);

    console.log("reactions", reactions);
  }, 2000);

  // const hash = "QmXG8yk8UJjMT6qtE2zSxzz3U7z5jSYRgVWLCUFqAVnByM";
  // console.log(await forum.getAllProfileFields());
  // await forum.sendMessage(hash, { data: "foo" }, console.log);
};
forum.onmessage = (msg) => console.log("onmessage", msg);
forum.onpeerconnect = (res) => console.log("onpeerconnect", res);

forum.create();
