import * as Web3 from "web3/src";

export class EthScanner {
  protected web3: any;
  private maxThreads = 10;
  private firstBlockNumber = 1909000;

  constructor(public configuration) {
    const wsProvider = new (Web3 as any).providers.WebsocketProvider(configuration.wshost);
    this.web3 = new Web3(wsProvider);
    this.web3.defaultAccount = configuration.defaultWallet;
  }

  /**
   * Get block number
   * @returns {Promise<any>}
   */
  public async getBlockNumber() {
    return await this.web3.eth.getBlockNumber();
  }
  /**
   * Get the blocks from chain
   * Basically we could make full client out of this
   * @param startingBlock
   * @param stoppingBlock
   * @param callback
   * @param filter
   * @returns {Promise<any>}
   */
  public async scanBlockRange(startingBlock?, stoppingBlock?, callback?, filter: boolean = false): Promise<any> {

    // If they didn't provide an explicit stopping block, then read
    // ALL of the blocks up to the current one.
    const that = this;
    const results = [];
    return new Promise(async (resolve, reject) => {

      if (!stoppingBlock) {
        stoppingBlock = await that.web3.eth.getBlockNumber();
      }

      if (!startingBlock) {
        startingBlock = stoppingBlock - 1;
      }

      // If they asked for a starting block that's after the stopping block,
      // that is an error (or they're waiting for more blocks to appear,
      // which hasn't yet happened).

      if (startingBlock > stoppingBlock) {
        return -1;
      }

      let blockNumber = startingBlock;
      let gotError = false;
      let numThreads = 0;
      const startTime = new Date();

      function getPercentComplete(bn) {
        const t = stoppingBlock - startingBlock;
        const n = bn - startingBlock;
        return Math.floor(n / t * 100);
      }

      // function scanTransactionCallback(txn, block) {
      //
      //   // let ether = that.web3.utils.fromWei(txn.value, "ether");
      //   // let message = `\r${block.timestamp} +${ether} from ${txn.from}`;
      //   const chainData: any = {};
      //   chainData.block = block;
      //   chainData.txn = txn;
      //
      //   if (filter) {
      //     if (txn.to === that.web3.defaultAccount) {
      //       // A transaction credited ether into this wallet
      //       const ether = that.web3.utils.fromWei(txn.value, "ether");
      //       const message = `\r${block.timestamp} +${ether} from ${txn.from}`;
      //       chainData.msg = message;
      //     } else if (txn.from === that.web3.defaultAccount) {
      //       // A transaction debitted ether from this wallet
      //       const ether = that.web3.utils.fromWei(txn.value, "ether");
      //       const message = `\r${block.timestamp} -${ether} to ${txn.to}`;
      //       chainData.msg = message;
      //     }
      //   }
      //
      //   results.push(chainData);
      // }

      function exitThread() {
        if (--numThreads === 0) {
          const numBlocksScanned = 1 + stoppingBlock - startingBlock;
          const stopTime = new Date();
          const duration = (stopTime.getTime() - startTime.getTime()) / 1000;
          const blocksPerSec = Math.floor(numBlocksScanned / duration);
          // tslint:disable-next-line
          const msg = `Scanned to block ${stoppingBlock} (${numBlocksScanned} in ${duration} seconds; ${blocksPerSec} blocks/sec).`;
          const len = msg.length;
          const numSpaces = 80 - len; // process.stdout.columns - len;
          const spaces = Array(1 + numSpaces).join(" ");

          process.stdout.write("\r" + msg + spaces + "\n");
        }
        resolve(results);
        return numThreads;
      }

      function scanBlockCallback(block) {
        if (block.transactions) {
          // results.push(block);
          if (callback) {
            callback(block);
          }
          //   for (const i of block.transactions) {
          //     const txn = i;
          //     scanTransactionCallback(txn, block);
          //   }
        }
      }

      function asyncScanNextBlock() {

        // If we've encountered an error, stop scanning blocks
        if (gotError) {
          return exitThread();
        }

        // If we've reached the end, don't scan more blocks
        if (blockNumber > stoppingBlock) {
          return exitThread();
        }

        // Scan the next block and assign a callback to scan even more
        // once that is done.
        const myBlockNumber = blockNumber++;

        // Write periodic status update so we can tell something is happening
        if (myBlockNumber % that.maxThreads === 0 || myBlockNumber === stoppingBlock) {
          const pctDone = getPercentComplete(myBlockNumber);
          process.stdout.write(`\rScanning block ${myBlockNumber} - ${pctDone} %`);
        }

        // Async call to getBlock() means we can run more than 1 thread
        // at a time, which is MUCH faster for scanning.

        that.web3.eth.getBlock(myBlockNumber, true, (error, block) => {
          if (error) {
            // Error retrieving this block
            gotError = true;
            // console.error("Error:", error);
          } else {
            scanBlockCallback(block);
            asyncScanNextBlock();
          }
        });
      }

      let nt;
      for (nt = 0; nt < that.maxThreads && startingBlock + nt <= stoppingBlock; nt++) {
        numThreads++;
        asyncScanNextBlock();
      }

      return nt; // number of threads spawned (they'll continue processing)
    });
  }
}
