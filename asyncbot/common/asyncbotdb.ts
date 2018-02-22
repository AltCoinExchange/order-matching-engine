import {DbHelper} from "../../src/modules/helpers/db.helper";
import {IOrder} from "../../src/modules/helpers/long-poll.service";

export class AsyncBotDb {

  /**
   * Check if ws is disconnected
   * @param data
   * @returns {Promise<boolean>}
   */
  public static async isOrderActive(data) {
    const actOrder = {} as IOrder;
    actOrder.id = data.order_id;
    return await DbHelper.IsOrderActive(actOrder);
  }
}
