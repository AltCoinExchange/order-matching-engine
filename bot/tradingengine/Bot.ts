import {OrderMatchingClient} from "../common/clients/OrderMatchingClient";
import {MoscaService} from "../common/clients/Mqtt";

export class Bot {

  private orderMatchingClient: OrderMatchingClient;
  private mqtt: MoscaService;

  constructor() {
    this.orderMatchingClient = new OrderMatchingClient();
    this.mqtt = new MoscaService();
  }

  public async Start() {
  }

  /**
   * Wait for order initiation
   */
  private waitForOrder() {
  }

  private initiateOrder() {
  }

  private redeemOrder() {
  }

}
