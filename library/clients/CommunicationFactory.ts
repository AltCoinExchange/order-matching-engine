import {WhisperService} from './WhisperService';
import {MoscaService} from './MoscaService';
import {LibraryConfig} from '../config/app';
import {IAtomicSwap} from './interfaces/IAtomicSwap';

export class CommunicationFactory {
  public static async GetCommunicationProvider(config?): Promise<IAtomicSwap> {
    if (!config) {
      config = LibraryConfig;
    }
    if (config.communication.type === "whisper") {
      const provider = new WhisperService(config.communication);
      await provider.Start();
      return provider;
    } else if (config.communication.type === "mqtt") {
      const provider = new MoscaService(config.communication);
      provider.Start();
      return provider;
    }
  }
}
