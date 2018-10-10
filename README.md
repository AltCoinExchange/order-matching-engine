# Order Matching Engine

### Version 0.1


##### Application to support atomic swap UI providing following features:

    - REST interface and WebSocket support
    - Based on the NestJS TypeScript framework (https://docs.nestjs.com/)
    - Faucet for eth
    - Simple order matching for swap initiation
    - Ethereum transaction feeder (separate service)
    - Bitcoin transaction feeder (Not finished, good thing to have)
    - Library: Set of the useful classes for dapps (/library, /dsrc)
    - Bot: Synchronous automatic swapping engine
    - AsyncBot: Asynchronous automatic swapping engine using the BeeQueue for horizontal scalling

##### Requirements
    - MongoDB up to the v3.4.10
    - Nodejs up to the v8.12.0
    - Full Bitcoin Node (Testnet)
    - Full Ethereum node (Testnet) 
    
##### Running
 
 ###### Order matching engine
   
 - node index.js
 
 ###### Eth feeder service
 
 - node services/index.js 
 
 ###### Synchronous Bot
  
 - node bot/index.js

 ###### Asynchronous Bot
  
 - node asyncbot/index.js


