import {Observable} from 'rxjs/Observable';
import {InitiateData, InitiateParams} from 'altcoinio-wallet';

export interface IAtomicSwap {
  waitForInitiate(link): Observable<InitiateData>;
  informInitiate(link, data: InitiateParams);
  waitForParticipate(link): Observable<InitiateData>;
  informParticipate(link, data: InitiateParams);
  waitForBRedeem(link): Observable<InitiateData>;
  informBRedeem(link, data: InitiateParams);
}
