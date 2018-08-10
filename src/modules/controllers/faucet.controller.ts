import { Controller, Get, Param } from "@nestjs/common";
import { EthereumWallet } from "altcoinio-wallet";
import { AppConfig } from "../../../bot/config/app";

@Controller("faucet")
export class FaucetController {
  @Get("fund/:address")
  public async faucet(@Param() params): Promise<any> {
    const walletAddress = AppConfig.faucetAddress;
    let ethWallet = new EthereumWallet("testnet");

    const balance = await ethWallet.getbalance(walletAddress);
    if (balance < 10) {
      return {err: "Not enough!"};
    }

    const fundedBalance = await ethWallet.getbalance(params.address);
    if (fundedBalance > 0) {
      return {err: "Address already has funds!"};
    }

    const acc = ethWallet.recover(AppConfig.faucetSeed);
    ethWallet.login(acc);
    const result = await ethWallet.sendEther(params.address, "0.02");
    ethWallet = null;
    return result;
  }
}
