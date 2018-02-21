import { Controller, Get, Param } from "@nestjs/common";
import { EthereumWallet } from "altcoinio-wallet";
import { WalletFactory } from "../../../bot/common/wallet/WalletFactory";
import { AppConfig } from "../../../bot/config/app";

@Controller("faucet")
export class FaucetController {
  @Get("fund/:address")
  public async faucet(@Param() params): Promise<any> {
    const walletAddress = AppConfig.faucetAddress;
    const ethWallet = new EthereumWallet("testnet");
    return ethWallet.getbalance(walletAddress).then((result) => {
      if (result < 10) {
        return {err: "Not enough!"};
      }

      return ethWallet.getbalance(params.address).then((addressBalance) => {
        if (addressBalance > 0) {
          return {err: "Address already has funds!"};
        }
        const acc = ethWallet.recover(AppConfig.faucetSeed);
        ethWallet.login(acc);
        return ethWallet.sendEther(params.address, "0.02");
      });
    });
  }
}
