import {EthConfiguration} from "../../services/config/eth";
import {OrbitDbProvider} from '../../library/db/OrbitDbProvider';

async function bootstrap() {
  const db = new OrbitDbProvider();
}

bootstrap();