# PeerFlip

### PeerFlip protocol

PeerFlip is a decentralized method to simulate a coin toss among \(N\) participants. Except for the room server which participants use to join the same room and the STUN server that is needed for the participants to establish the initial P2P connections to each other, the protocol does not rely on any centralized party to calculate the coin flip outcome. 


### How to run

To run the frontend :

```bash
cd peer-flip-frontend
npm install
npm start
```

If you want to run the backend locally (for room management) :

Set `REACT_APP_SERVER_URL` to `'wss://localhost:9090'`  in the `.env` file inside `peer-flip-frontend` .

Then run:
```bash
cd peer-flip-backend
npm install
npx tsc *.ts 
node server.js
```
### [Read how it works](./docs/how-it-works.md)
