import {ERC20} from "../eth/tokens/ERC20";
/**
 * Augur token interface
 */
import {EthEngine} from "../eth/eth-engine";
import {TokenConfig} from "../config/tokens/tokenconfig";

export class AugurTokenTestnet extends ERC20 {
  constructor(ethEngine: EthEngine) {
    super(TokenConfig.Augur.contractAddress, ethEngine);
  }
}