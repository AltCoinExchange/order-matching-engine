// import {ReplaySubject} from 'rxjs/ReplaySubject';
// import {Observable} from "rxjs/Observable";
//
// const IPFS = require('ipfs');
// const OrbitDB = require('orbit-db');
//
// export class OrbitDbProvider {
//
//   /**
//    * IPFS Initiate options
//    * @type {{EXPERIMENTAL: {pubsub: boolean}}}
//    */
//   private ipfsOptions = {
//     EXPERIMENTAL: {
//       pubsub: true
//     },
//   };
//
//   /**
//    * Private variables
//    */
//   private ipfs;
//   private dbaddress;
//   private indexBy = "id";
//   private db;
//   private orbitdb = null;
//   private readySubject = new ReplaySubject<any>();
//
//   constructor(dbaddress, indexBy?) {
//     this.ipfs = new IPFS(this.ipfsOptions);
//     this.ipfs.on('error', this.ipfsOnError);
//     this.ipfs.on('ready', this.ipfsOnReady.bind(this));
//     this.dbaddress = dbaddress;
//     if (indexBy) {
//       this.indexBy = indexBy;
//     }
//   }
//
//   public Start(): Observable<any> {
//     return this.readySubject.asObservable();
//   }
//
//   private ipfsOnError(error) {
//     console.log("IPFS Init Error, ", error);
//   }
//
//   private async ipfsOnReady() {
//     const orbitdb = new OrbitDB(this.ipfs);
//     this.orbitdb = orbitdb;
//     const db = await orbitdb.docs(this.dbaddress, {indexBy: this.indexBy});
//     await db.load();
//     this.db = db;
//
//     // db.put({ test: "test2", id: 30 });
//     // const data = db.query((o) => o.id === 30);
//     // console.log(data);
//     this.readySubject.next(true);
//   }
//
//   /**
//    * Public event on ready to hook up
//    */
//   public onReady() {
//     // return this.readySubject.asObservable().toPromise();
//   }
//
//   /**
//    * Put the object at the DB
//    * @param obj
//    */
//   public async put(obj: any) {
//     return await this.db.put(obj);
//   }
//
//   /**
//    * Find object
//    */
//   public async find(query) {
//     return await this.db.query(query);
//   }
// }
