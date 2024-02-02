# Use Case Summary
This is an example project showcasing Artela Aspect technology called "pacman-aspect." It is a fully on-chain version of the classic game "Pac-Man," where players need to avoid being caught by ghosts and survive until the end of the round to achieve victory. The ghosts relentlessly chase the player, seeking to capture them.

"Pac-Man" is one of the most beloved and iconic games in the history of video games, with multiple versions available in arcade halls, home computers, and game consoles. Its simple yet addictive design, along with its characters and gameplay, has deeply embedded itself in popular culture and influenced the design of many subsequent video games. By utilizing Artela Aspect technology, we have brought the classic Pac-Man game into the realm of the blockchain, providing players with a fresh gaming experience and interactive approach. This project demonstrates the potential and innovation of Artela Aspect technology in the development of fully on-chain games, bringing forth new game ideas and possibilities to the public chain ecosystem.
# Team Members and Roles
Derrick developer  
Ceb developer
# Problem Addressed
The cellula team attempted to implement the A* pathfinding algorithm for the first version of Pac-Man using Solidity language. While they managed to write the Solidity contract successfully, they encountered issues with excessive computational complexity and high gas costs during actual execution, which hindered the smooth functioning of the Pac-Man game.
On Artela, Aspect operates within a wasm virtual machine. The execution efficiency of wasm virtual machine surpasses that of EVM by one to two orders of magnitude. By designing and leveraging the features of Aspect wasm runtime effectively, it can handle high-computational algorithms like the A* pathfinding algorithm, enabling batch computation and updates efficiently.
Now, utilizing Artela's Aspect technology, we have successfully implemented the pathfinding algorithm to assist the ghost characters in chasing the player character and help the player navigate through the maze, avoiding capture by the ghosts.

Currently, we have successfully achieved approximately 1000 rounds of continuous gameplay with each call. What used to be an off-chain Java system for AI-agent battle games can now be fully implemented on-chain. The gameplay experience is also quite immersive, with a typical battle lasting around 300 rounds. A single automated transaction can execute several complete game sessions.

![avatar](/img/img.png)

# The design process behind the project
By leveraging Artela's Aspect technology as the framework, we have successfully implemented the logic of the A* pathfinding algorithm in the smart contract. This implementation allows for configurable map parameters and obstacle parameters, making the pathfinding algorithm more flexible. It means that we have achieved a true fully on-chain game, where players can configure maps and obstacles based on their own needs and environment to find the optimal path. This on-chain gaming experience provides players with more freedom and creativity, making the game more enjoyable and personalized. We believe that through this innovative implementation, it will bring more game innovation and development to the public chain ecosystem.
# Value to the Artela Ecosystem
1. When a game character is capable of executing strategies on-chain, it transcends being just an NPC within the game. We can define them as prototypes of on-chain AI agents. In this demo, cellula has achieved more than just a static NPC for a fixed game mode. By combining character movement with gameplay strategies, we enable game characters to make decisions based on the current situation, becoming autonomous entities with decision-making abilities. We also aim to further refine this on-chain AI agent demo and implement more complex gameplay on the blockchain. We look forward to advancing together with the Artela ecosystem.
2. Cellula plans to implement the Pac-Man power-up system through Artela Aspect's Just-in-time call functionality. Based on the movement and current state of the game character on the map, the smart contract will automatically trigger the Pac-Man power-up system. For instance, every 100 blocks, the game map will generate various in-game power-ups, or a power-up will appear when the game character's score reaches 100. The entire game will progress automatically based on the player's status, without the need to modify the game contract.
# How to Use

1. **Install Dependencies**  
   Open your terminal and execute the following command to install the necessary npm packages:
```bash
npm install
```
2. **Install Aspect Tool**  
   Install the Aspect tool globally on your system using npm:
```bash
npm install -g @artela/aspect-tool
```
3. **Install Solidity Compiler**  
   Install the Solidity compiler globally:
```bash
npm install -g solc
```
4. **Configure Private Key**  
   In the project's root directory, create a file named privateKey.txt and add your private key to this file. Make sure not to share this key and keep it confidential.
5. **Build the Project**  
   Compile your Aspect contracts by running:
```bash
npm run aspect:build
```
6. **Deploy the Contracts**  
   Deploy your contracts to the blockchain with the following command:
```bash
npm run aspect:deploy -- --wasm ./build/release.wasm
```
# Interaction With Contracts

1. **Via Command Line**  
   To interact with your deployed contract via the command line, use the following command, replacing [Aspect address] with the actual address obtained after deployment:
```bash
node tests/test_op.cjs --aspect [Aspect address] call --op 0002 --param haha
```
2. **Via HTML Interface**  
   Alternatively, you can interact with your contract using the HTML file located in the root directory. Open this file in a web browser, fill in the required parameters, and click the "Execute" button to start the game or interact with the contract.
# Website Link
https://artela.cellula.fun/