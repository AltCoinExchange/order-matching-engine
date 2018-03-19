export enum CodeType {
  OK                    = 0,

  // General response codes, 0 ~ 99
  InternalError         = 1,
  EncodingError         = 2,
  BadNonce              = 3,
  Unauthorized          = 4,
  InsufficientFunds     = 5,
  UnknownRequest        = 6,

  // Reserved for basecoin, 100 ~ 199
  BaseDuplicateAddress  = 101,
  BaseEncodingError     = 102,
  BaseInsufficientFees  = 103,
  BaseInsufficientFunds = 104,
  BaseInsufficientGasPrice = 105,
  BaseInvalidInput      = 106,
  BaseInvalidOutput     = 107,
  BaseInvalidPubKey     = 108,
  BaseInvalidSequence   = 109,
  BaseInvalidSignature  = 110,
  BaseUnknownAddress    = 111,
  BaseUnknownPubKey     = 112,
  BaseUnknownPlugin     = 113,

  // Reserved for governance, 200 ~ 299
  GovUnknownEntity      = 201,
  GovUnknownGroup       = 202,
  GovUnknownProposal    = 203,
  GovDuplicateGroup     = 204,
  GovDuplicateMember    = 205,
  GovDuplicateProposal  = 206,
  GovDuplicateVote      = 207,
  GovInvalidMember      = 208,
  GovInvalidVote        = 209,
  GovInvalidVotingPower = 210,
}
