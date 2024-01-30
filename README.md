
# PACMAN

## Instruction

This is a sample project of Artela Aspect. 

## Files

```bash
.
├── README.md
├── asconfig.json
├── aspect                 <-- Your aspect code resides here
│   └── index.ts
├── contracts                  <-- Place your smart contracts here
├── scripts                    <-- Utility scripts, including deploying, binding and etc.
│   ├── aspect-deploy.cjs
│   ├── bind.cjs
│   ├── contract-call.cjs
│   └── contract-deploy.cjs
...
```
# Functional Logic
In this project demonstration, there are two characters in the maze map: the player character and the ghost character. The goal of the ghost character is solely to capture the player character, while the goal of the player character is to navigate through the maze and avoid being caught by the ghost. The pathfinding algorithm used in this project is the A-star algorithm. The player character's target point dynamically changes with the position of the ghost. Specifically, the target point is determined as the farthest point among the four non-wall vertices of the maze rectangle from the ghost's current position. As the ghost moves, this target point also continuously changes. The player character needs to both move towards the latest target point and navigate around the ghost within the maze.

# Overview
This project is a blockchain-based application that allows users to deploy and interact with smart contracts using the Aspect language. It provides a streamlined process for building, deploying, and testing smart contracts.

Follow the instructions below to set up your environment, deploy your smart contracts, and interact with them either via command line or a provided HTML interface.

# Prerequisites
Before proceeding, ensure you have Node.js and npm (Node Package Manager) installed on your system. You can download and install them from nodejs.org.

# Setup Instructions
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
# Useful links

* [@artela/aspect-tools](https://docs.artela.network/develop/reference/aspect-tool/overview)

