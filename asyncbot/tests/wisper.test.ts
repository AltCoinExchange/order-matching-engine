import {WhisperService} from "../../bot/common/clients/Whisper";
import {EthConfiguration} from "../../services/config/eth";
import {InitiateParams} from 'altcoinio-wallet';

async function bootstrap() {
  // Create whisper service
  const whisper = new WhisperService(EthConfiguration.hosts[2]);
  await whisper.Start();
  const link = {order_id: 454};

  // Wait for initiate
  await whisper.waitForInitiate(link).subscribe((data) => {
    console.log("Received data: ", data);
  });

  const whisper2 = new WhisperService(EthConfiguration.hosts[2]);
  await whisper2.Start();
  // Send initiate
  const initiateParams = new InitiateParams();
  await whisper2.informInitiate(link, initiateParams);
}

bootstrap();