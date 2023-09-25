import {
  ContractName,
  CONTRACT_NAMES,
  CONTRACT_OZ_NAMES,
  Hardfork,
  IContract,
  INetwork,
  NetworkName,
} from "models/Configuration";

/**
 * The KEYSTORE environment constant group is used to agrupate the constants related to the Encryped JSON wallets
 * @param root the root directory
 * @param default default constants if no specific ones defined
 * @param default.password to be used to symetric encryption & decryption of the Encryped JSON wallets
 * @param default.batchSize the number of Encryped JSON wallets to generate in batch mode
 * @param test constants related to tests
 * @param test.userNumber number of users to create in tests
 */
export const KEYSTORE = {
  root: "keystore",
  default: {
    accountNumber: 10, // Ganache server default account number
    balance: "0x2710", // infinite balance
    password: "PaSs_W0Rd", // should use another password for real things
    privateKey: "0x0c4542eabd9717977a50d9a67c043a12baaeafca856076f2e499f61401a9789d",
    mnemonic: {
      phrase: "base proof defy damp ceiling cigar museum wink surface auto method banner",
      path: "m/44'/60'/0'/0/0",
      basePath: "m/44'/60'/0'/0",
      locale: "en",
    },
    batchSize: 2, // hardhat task default wallets to add to the keystore in batch mode
  },
};

/**
 * The BLOCKCHAIN environment constant group is used to agrupate the constants related to the blockchain network
 */
export const BLOCKCHAIN = {
  default: {
    solVersion: "0.8.19",
    evm: "berlin" as Hardfork,
    gasLimit: 8000000,
    gasPrice: 0,
    maxFeePerGas: 900000000,
    maxPriorityFeePerGas: 100,
    initialBaseFeePerGas: 7,
  },
  networks: new Map<NetworkName | undefined, INetwork>([
    [
      undefined,
      {
        chainId: 31337,
        name: "hardhat",
        protocol: "http",
        hostname: "127.0.0.1",
        port: 8545,
      },
    ],
    [
      "hardhat",
      {
        chainId: 31337,
        name: "hardhat",
        protocol: "http",
        hostname: "localhost",
        port: 8545,
      },
    ],
    [
      "ganache",
      {
        chainId: 1337,
        name: "ganache",
        protocol: "http",
        hostname: "localhost",
        port: 8545,
        dbPath: ".ganache-db",
      },
    ],
    [
      "mainTest",
      {
        chainId: 6660,
        name: "mainTest",
        protocol: "http",
        hostname: "192.168.12.32",
        port: 8545,
      },
    ],
  ]),
};

// default gas options to be used when sending Tx. It aims to zero gas price networks
export const GAS_OPT = {
  max: {
    gasLimit: BLOCKCHAIN.default.gasLimit,
    gasPrice: BLOCKCHAIN.default.gasPrice,
    // maxPriorityFeePerGas: BLOCKCHAIN.default.maxPriorityFeePerGas,
    // maxFeePerGas: BLOCKCHAIN.default.maxFeePerGas,
  },
};

export const DEPLOY = {
  deploymentsPath: "deployments.json",
};

export const CONTRACTS = new Map<ContractName, IContract>([
  [
    CONTRACT_OZ_NAMES[0],
    {
      name: CONTRACT_OZ_NAMES[0],
      artifact: `node_modules/@openzeppelin/contracts/build/contracts/${CONTRACT_OZ_NAMES[0]}.json`,
      address: new Map([
        ["hardhat", ""],
        ["ganache", ""],
        ["mainTest", ""],
      ]),
    },
  ],
  [
    CONTRACT_OZ_NAMES[1],
    {
      name: CONTRACT_OZ_NAMES[1],
      artifact: `node_modules/@openzeppelin/contracts/build/contracts/${CONTRACT_OZ_NAMES[1]}.json`,
      address: new Map([
        ["hardhat", ""],
        ["ganache", ""],
        ["mainTest", ""],
      ]),
    },
  ],
  [
    CONTRACT_NAMES[0],
    {
      name: CONTRACT_NAMES[0],
      artifact: `artifacts/contracts/${CONTRACT_NAMES[0]}.sol/${CONTRACT_NAMES[0]}.json`,
      address: new Map([
        ["hardhat", ""],
        ["ganache", ""],
        ["mainTest", ""],
      ]),
    },
  ]
]);

export const TEST = {
  accountNumber: 3,
};
