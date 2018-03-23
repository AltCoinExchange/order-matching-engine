//
// export interface Request {
//   oneof value{
//     RequestEcho echo = 1;
//     RequestFlush flush = 2;
//     RequestInfo info = 3;
//     RequestSetOption set_option = 4;
//     RequestDeliverTx deliver_tx = 5;
//     RequestCheckTx check_tx = 6;
//     RequestCommit commit = 7;
//     RequestQuery query = 8;
//     RequestInitChain init_chain = 9;
//     RequestBeginBlock begin_block = 10;
//     RequestEndBlock end_block = 11;
//   }
// }
//
// message RequestEcho {
//   string message = 1;
// }
//
// message RequestFlush {
// }
//
// message RequestInfo {
// }
//
// message RequestSetOption{
//   string key = 1;
//   string value = 2;
// }
//
// message RequestDeliverTx{
//   bytes tx = 1;
// }
//
// message RequestCheckTx{
//   bytes tx = 1;
// }
//
// message RequestQuery{
//   bytes data = 1;
//   string path = 2;
//   uint64 height = 3;
//   bool prove = 4;
// }
//
// message RequestCommit{
// }
//
// message RequestInitChain{
//   repeated Validator validators = 1;
// }
//
// message RequestBeginBlock{
//   bytes hash = 1;
//   Header header = 2;
// }
//
// message RequestEndBlock{
//   uint64 height = 1;
// }
//
// //----------------------------------------
// // Response types
//
//
// message Response {
//   oneof value{
//     ResponseException exception = 1;
//     ResponseEcho echo = 2;
//     ResponseFlush flush = 3;
//     ResponseInfo info = 4;
//     ResponseSetOption set_option = 5;
//     ResponseDeliverTx deliver_tx = 6;
//     ResponseCheckTx check_tx = 7;
//     ResponseCommit commit = 8;
//     ResponseQuery query = 9;
//     ResponseInitChain init_chain = 10;
//     ResponseBeginBlock begin_block = 11;
//     ResponseEndBlock end_block = 12;
//   }
// }
//
// message ResponseException{
//   string error = 1;
// }
//
// message ResponseEcho {
//   string message = 1;
// }
//
// message ResponseFlush{
// }
//
// message ResponseInfo {
//   string data = 1;
//   string version = 2;
//   uint64 last_block_height = 3;
//   bytes last_block_app_hash = 4;
// }
//
// message ResponseSetOption{
//   string log = 1;
// }
//
// message ResponseDeliverTx{
//   CodeType          code        = 1;
//   bytes             data        = 2;
//   string            log         = 3;
// }
//
// message ResponseCheckTx{
//   CodeType          code        = 1;
//   bytes             data        = 2;
//   string            log         = 3;
// }
//
// message ResponseQuery{
//   CodeType          code        = 1;
//   int64             index       = 2;
//   bytes             key         = 3;
//   bytes             value       = 4;
//   bytes             proof       = 5;
//   uint64            height = 6;
//   string            log         = 7;
// }
//
// message ResponseCommit{
//   CodeType          code        = 1;
//   bytes             data        = 2;
//   string            log         = 3;
// }
//
//
// message ResponseInitChain{
// }
//
// message ResponseBeginBlock{
// }
//
// message ResponseEndBlock{
//   repeated Validator diffs = 4;
// }
//
// //----------------------------------------
// // Blockchain Types
//
// message Header {
//   string chain_id = 1;
//   uint64 height = 2;
//   uint64 time = 3;
//   uint64 num_txs = 4;
//   BlockID last_block_id = 5;
//   bytes last_commit_hash = 6;
//   bytes data_hash = 7;
//   bytes validators_hash = 8;
//   bytes app_hash = 9;
// }
//
// message BlockID {
//   bytes hash = 1;
//   PartSetHeader parts = 2;
// }
//
// message PartSetHeader {
//   uint64 total = 1;
//   bytes hash = 2;
// }
//
// message Validator {
//   bytes pubKey = 1;
//   uint64 power = 2;
// }
