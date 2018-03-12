import {EthConfiguration} from "../../services/config/eth";
import {InitiateParams} from 'altcoinio-wallet';
import {WhisperService} from '../clients/Whisper';

async function bootstrap() {
  // Create whisper service
  const whisper = new WhisperService(EthConfiguration.hosts[2]);
  await whisper.Start();
  const link = {order_id: 454};

  // Wait for initiate
  await whisper.waitForInitiate(link).subscribe((data) => {
    console.log("Received initiate data: ", data);
  });

  await whisper.waitForParticipate(link).subscribe((data) => {
    console.log("Received participate data: ", data);
  });

  await whisper.waitForBRedeem(link).subscribe((data) => {
    console.log("Received redeem data: ", data);
  });

  const whisper2 = new WhisperService(EthConfiguration.hosts[2]);
  await whisper2.Start();
  // Send initiate
  const initiateParams = new InitiateParams();
  await whisper2.informInitiate(link, initiateParams);
  await whisper2.informParticipate(link, initiateParams);
  await whisper2.informBRedeem(link, initiateParams);
}

bootstrap();