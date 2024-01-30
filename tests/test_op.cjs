const Web3 = require('@artela/web3');
const fs = require('fs');
const projectConfig = JSON.parse(fs.readFileSync('./project.config.json', 'utf-8'));
const argv = require('yargs')
  .string('aspect')
  .boolean('call')
  .string('op')
  .string('param')
  .argv;

async function op() {
  // prepare necessary data
  const web3 = new Web3(projectConfig.node);
  const gasPrice = await web3.eth.getGasPrice();
  const senderPriKey = fs.readFileSync("privateKey.txt", 'utf-8');
  const account = web3.eth.accounts.privateKeyToAccount(senderPriKey.trim());
  web3.eth.accounts.wallet.add(account.privateKey);

  // init aspect
  if (!argv.aspect) {
    console.error("'aspect' cannot be empty, please set by the parameter ' --aspect 0x...'")
    process.exit(0)
  }
  console.log(typeof argv.aspect)
  const aspect = new web3.atl.Aspect(argv.aspect);

  // init op
  let op = argv.op;
  let params = argv.param;

  // concat param and op
  let callData = '0x' + (params.startsWith('0x') ? op + params.substring(2) :  op + stringToHex(params));

  console.log("op: ", op);
  console.log("params: ", params);

  let aspectCore = web3.atl.aspectCore();

  if (argv.call) {
    console.log(`op call start with callData: ${ callData } to aspect: ${ argv.aspect }`);
    let result = await aspectCore.methods.entrypoint(
      argv.aspect,
      callData
    ).call();
    console.log('op call finished')
    console.log(hexToString(result));
  } else {
    const nonce = await web3.eth.getTransactionCount(account.address);
    let encodedData = aspect.operation(callData).encodeABI();

    tx = {
      from: account.address,
      nonce: nonce,
      gasPrice,
      gas: 8000000,
      data: encodedData,
      to: aspectCore.options.address,
    }

    const signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('op tx finished')
    console.log(receipt);
  }
}

function stringToHex(str) {
  let val = "";
  for (let i = 0; i < str.length; i++) {
    val += str.charCodeAt(i).toString(16);
  }
  return val;
}

function hexToString(hex) {
  let val = "";
  for (let i = 0; i < hex.length; i += 2) {
    val += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return val;
}

op().catch(console.error);
