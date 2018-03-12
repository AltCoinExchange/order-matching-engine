import {WhisperService} from "../../bot/common/clients/Whisper";
import {EthConfiguration} from "../../services/config/eth";
import {OrbitDbProvider} from '../db/OrbitDbProvider';

async function bootstrap() {
  const db = new OrbitDbProvider();
}

bootstrap();