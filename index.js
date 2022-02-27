const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");
const {
  Connection,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
  SystemProgram,
  Keypair,
} = require("@solana/web3.js");
const fs = require("mz/fs");
const init = () => {
  console.log(
    chalk.green(
      figlet.textSync("SOL CAMPAIGN", {
        font: "Standard",
        horizontalLayout: "default",
        verticalLayout: "default",
      })
    )
  );
  console.log(chalk.yellow`The max bidding amount is 2.5 SOL here`);
};
async function establishConnection() {
  const rpcUrl = "http://localhost:8899";
  connection = new Connection(rpcUrl, "confirmed");
  const version = await connection.getVersion();
  console.log("Connection to cluster established:", rpcUrl, version);
}

async function createKeypairFromFile() {
  const secretKeyString = await fs.readFile("./program/private_key.json", {
    encoding: "utf8",
  });
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  return Keypair.fromSecretKey(secretKey);
}

async function createAccount() {
  const rpcUrl = "http://localhost:8899";
  connection = new Connection(rpcUrl, "confirmed");
  const signer = await createKeypairFromFile();
  const newAccountPubkey = await PublicKey.createWithSeed(
    signer.publicKey,
    "campaign1",
    new PublicKey("8KvzMQrEYCt8dUE8tVXXzZVxDSxM36erHnTMdJBCtTm4")
  );
  const lamports = await connection.getMinimumBalanceForRentExemption(1024);
  const instruction = SystemProgram.createAccountWithSeed({
    fromPubkey: signer.publicKey,
    basePubkey: signer.publicKey,
    seed: "campaign1",
    newAccountPubkey,
    lamports,
    space: 1024,
    programId: new PublicKey("8KvzMQrEYCt8dUE8tVXXzZVxDSxM36erHnTMdJBCtTm4"),
  });
  const transaction = new Transaction().add(instruction);

  console.log(
    `The address of campaign1 account is : ${newAccountPubkey.toBase58()}`
  );

  await sendAndConfirmTransaction(connection, transaction, [signer]);
}
 async function getProgramAccount() {
  const signer = await createKeypairFromFile();
  const newAccountPubkey = await PublicKey.createWithSeed(
    signer.publicKey,
    "campaign1",
    new PublicKey("8KvzMQrEYCt8dUE8tVXXzZVxDSxM36erHnTMdJBCtTm4")
  );
  return newAccountPubkey;
}

async function getWeb3AccInfo(acc) {
  return await connection.getAccountInfo(acc);
}

const askQuestions = () => {
  const options = [
    {
      type: "rawlist",
      name: "OPTION",
      message: "What do you want to do?",
      choices: [
        "1. Create a new campaign?",
        "2. Fund a campaign",
        "3. See Campaign details",
        "4. Withdrwal funds from campaign",
        "5. Dump campaign account",
      ],
    },
  ];
  return inquirer.prompt(options);
};
const askAmount = () => {
  const options = [
    {
      type: "number",
      name: "AMOUNT",
      message: "Enter the amount you want to fund in SOL",
    },
  ];
  return inquirer.prompt(options);
}
init();
establishConnection();
const startProgram = async () => {
  const answers = await askQuestions();
  const selcted = answers.OPTION.toString();
  console.log("answers = ", answers);
  switch (selcted[0]) {
    case "1":
      console.log("Option 1 ", selcted);
      createAccount();
      break;
    case "2":
      console.log("Option 2 ", selcted);
      const amountOption = await askAmount();
      const amount = amountOption.AMOUNT.toString();
      console.log("Amount = ", amount);
      break;
    case "3":
      console.log("Option 3 ", selcted);
      break;
    case "4":
      console.log("Option 4 ", selcted);
      break;
    case "5":
      console.log("Option 5 ", selcted);
      const programAccount = await getProgramAccount();
      console.log('campaign acc', programAccount.toBase58())
      const campaignAccInfo = await getWeb3AccInfo(programAccount);
      console.log("Campaign Account info = ", campaignAccInfo);
      break;
    default:
      console.log("default ", selcted);
      break;
  }
};
startProgram();
