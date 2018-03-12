const IPFS = require('ipfs');
const OrbitDB = require('orbit-db');

export class OrbitDbProvider {

  /**
   * IPFS Initiate options
   * @type {{EXPERIMENTAL: {pubsub: boolean}}}
   */
  private ipfsOptions = {
    EXPERIMENTAL: {
      pubsub: true
    },
  };

  /**
   * Private variables
   */
  private ipfs;

  constructor() {
    this.ipfs = new IPFS(this.ipfsOptions);
    this.ipfs.on('error', this.ipfsOnError);
    this.ipfs.on('ready', this.ipfsOnReady);
  }

  private ipfsOnError(error) {
    console.log("IPFS Init Error, ", error);
  }

  private async ipfsOnReady() {
    // console.log(this);
    const orbitdb = new OrbitDB(this);
    const db = await orbitdb.docs('/orbitdb/QmR9XEZwkq5GD79HxUV7n6QC71MGEyUpqVMWEj9nufjnYp/altcoinio/ordermatching', { indexBy: 'id' });
    await db.load();

    db.put({id: 2, test: "testtt"});
    const orders = db.query((o) => o.id > 0);

    console.log(orders);
  }
}
