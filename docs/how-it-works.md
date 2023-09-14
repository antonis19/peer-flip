
## How It Works

### PeerFlip protocol

PeerFlip is a decentralized method to simulate a coin toss among \(N\) participants. Except for the room server which participants use to join the same room and the STUN server that is needed for the participants to establish the initial P2P connections to each other, the protocol does not rely on any centralized party to calculate the coin flip outcome. 
#### Protocol Explanation

The core idea is for each participant to commit to a random value which is revealed later and used to calculate the coin flip outcome.


1. **Participant Identification**: 
   Each participant has a unique username (userId).

2. **Random Bit Generation**:
   Each participant computes a random bit value, \(v\). This value is either 0 or 1, representing the two possible outcomes of a coin toss (heads or tails).

3. **Nonce Generation**:
   Each participants generates a nonce, which is a random value that ensures the commitment (explained next) is unique, even if the user chooses the same \(v\) value in multiple runs. 
   This is necessary to prevent a replay attack.
   

4. **Commitment**:
   To prevent early disclosure of the \(v\) value and ensure honesty, participants don't directly share their \(v\) value. Instead, they compute a commitment value, \(c\), which is a hash of their userId, \(v\) value, and nonce. The formula for this is:

   $ c =  \tt{SHA256}( 	\tt{userId} || v || 	\tt{nonce} )$

   Here, \(||\) indicates string concatenation. This commitment value is then broadcasted to all other participants.

5. **Reveal Phase**:
   After everyone has shared their commitment values, each participant then reveals their chosen \(v\) value and nonce to everyone else.

6. **Verification**:
   This step ensures honesty. Each participant verifies that the \(v\) value and nonce revealed by every other participant correctly matches the previously received commitment value. If any of the values don't match, it means one of the participants wasn't honest, and the entire process is aborted.

7. **Determining the Outcome**:
   The outcome of the coin toss is determined by summing up all the \(v\) values from each participant and computing the modulus 2 of the result:

   $ r = \sum v_i \mod 2  $

   If \(r = 0\), the outcome is heads. If \(r = 1\), the outcome is tails.



The protocol can be visualized in the diagram below:


<img src="https://raw.githubusercontent.com/antonis19/peer-flip/main/docs/diagrams/sequence-diagram.png" alt="Sequence Diagram" width="600" />

#### Technical Implementation

- **Room Creation and Joining**:
  A participant can create a new "room", which essentially is a unique session for the coin toss. Upon creation, a unique URL for the room is generated. Other participants can use this URL to join the room and participate in the coin toss.

- **WebRTC and STUN servers**: 
  These technologies are employed to facilitate the peer-to-peer connections required for this protocol. WebRTC allows direct communication between users' browsers, while STUN servers help in traversing NATs and firewalls.

