import { GAS_OPT, KEYSTORE, TEST } from "configuration";
import * as HRE from "hardhat";
import { step } from "mocha-steps";
import { expect } from "chai";
import { ContractReceipt, Wallet } from "ethers";
import { TransactionReceipt, Block, JsonRpcProvider } from "@ethersproject/providers";
import { Mnemonic, isAddress } from "ethers/lib/utils";
import { generateWallets } from "scripts/wallets";
import { ProxyAdmin, SimpleToken } from "typechain-types";
import { ADDR_ZERO, getContractInstance, setGlobalHRE } from "scripts/utils";
import { INetwork } from "models/Configuration";
import { deploy, deployUpgradeable } from "scripts/deploy";

// -- Revert messages
const REVERT = {
  accessControl: {
    // Don't know why it is not working with regex all of the sudden
    // missing: /AccessControl: account .* is missing role .*/,
    missing: 'AccessControl: account 0x6c727013303f1ed42f2aaeca9e7a2dcdda0e5ae0 is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6'
  },
  simpleToken: {},
};

// Specific Constants
const CONTRACT_NAME = "SimpleToken";
const STORAGE_DEPLOYED_AT = undefined;
// const INIT_VALUE = 12;

// General Variables
let provider: JsonRpcProvider;
let network: INetwork;
let accounts: Wallet[];
let lastReceipt: ContractReceipt | TransactionReceipt;
let lastBlock: Block;
// Specific Variables
// -- wallets | accounts
let admin: Wallet;
let users: Wallet[];
// -- contracts
let proxyAdmin: ProxyAdmin;
let simpleToken: SimpleToken;
describe(`${CONTRACT_NAME}`, () => {
  before("Generate test Accounts", async () => {
    ({ gProvider: provider, gNetwork: network } = await setGlobalHRE(HRE));
    lastBlock = await provider.getBlock("latest");
    console.log(`Connected to network: ${network.name} (latest block: ${lastBlock.number})`);
    // Generate TEST.accountNumber wallets
    accounts = await generateWallets(
      undefined,
      undefined,
      TEST.accountNumber,
      undefined,
      {
        phrase: KEYSTORE.default.mnemonic.phrase,
        path: KEYSTORE.default.mnemonic.basePath,
        locale: KEYSTORE.default.mnemonic.locale,
      } as Mnemonic,
      true
    );
    // set specific roles
    [admin, ...users] = accounts;
  });

  describe("Deployment and Initialization", () => {
    if (STORAGE_DEPLOYED_AT) {
      step("Should create contract instance", async () => {
        simpleToken = (await getContractInstance(CONTRACT_NAME, admin)) as SimpleToken;
        expect(isAddress(simpleToken.address)).to.be.true;
        expect(simpleToken.address).to.equal(STORAGE_DEPLOYED_AT);
        console.log(`${CONTRACT_NAME} recovered at: ${simpleToken.address}`);
      });
    } else {
      step("Should deploy contract", async () => {
        // deploy and "store" ProxyAdmin
        const proxyAdminDeployResult = await deploy(
          "ProxyAdmin",
          admin,
          undefined,
          undefined,
          GAS_OPT.max,
          false
        );
        proxyAdmin = proxyAdminDeployResult.contractInstance as ProxyAdmin;
        // deploy SimpleToken
        const deployResult = await deployUpgradeable(
          CONTRACT_NAME,
          admin,
          [],
          undefined,
          GAS_OPT.max,
          proxyAdmin,
          true,
          false
        );
        // get the upgradeable instance as IStorage
        simpleToken = deployResult.contractInstance as SimpleToken;
        expect(isAddress(simpleToken.address)).to.be.true;
        expect(simpleToken.address).not.to.equal(ADDR_ZERO);
        console.log(`NEW ${CONTRACT_NAME} deployed at: ${simpleToken.address}`);
      });
    }
    step("Should check if correct initialization", async () => {
      const result = await simpleToken.decimals();
      expect(result).to.equal(18);
    });
  });

  describe("Main", () => {
    before("Set the correct signer", async () => {
      simpleToken = simpleToken.connect(admin);
    });
    step("Should mint some tokens", async () => {
      // check initial state
      const previous = await simpleToken.balanceOf(users[0].address);
      expect(previous).equal(0);
      // change stored value
      const newValue = 50;
      lastReceipt = await (await simpleToken.mint(users[0].address, newValue, GAS_OPT.max)).wait();
      expect(lastReceipt).not.to.be.undefined;
      const events = await simpleToken.queryFilter(
        simpleToken.filters.Transfer(ADDR_ZERO, users[0].address),
        lastReceipt.blockNumber,
        lastReceipt.blockNumber
      );
      expect(events.length).to.equal(1);
      // check final state
      const final = await simpleToken.balanceOf(users[0].address);
      expect(final).equal(newValue);
    });
    step("Should transfer some tokens", async () => {
      // check initial state
      const previous = await simpleToken.balanceOf(users[1].address);
      expect(previous).equal(0);
      // change stored value
      const newValue = 25;
      lastReceipt = await (
        await simpleToken.connect(users[0]).transfer(users[1].address, newValue, GAS_OPT.max)
      ).wait();
      expect(lastReceipt).not.to.be.undefined;
      const events = await simpleToken.queryFilter(
        simpleToken.filters.Transfer(users[0].address, users[1].address),
        lastReceipt.blockNumber,
        lastReceipt.blockNumber
      );
      expect(events.length).to.equal(1);
      // check final state
      const final = await simpleToken.balanceOf(users[1].address);
      expect(final).equal(newValue);
    });
    step("Should NOT be able to mint if no MINTER", async () => {
      // Check that the oracle is not registered yet
      const previous = await simpleToken.balanceOf(users[1].address);
      expect(previous).to.equal(25);
      await expect(
        simpleToken.connect(users[0]).mint(users[1].address, 2000, GAS_OPT.max)
      ).to.be.revertedWith(REVERT.accessControl.missing);
      // check final state
      const final = await simpleToken.balanceOf(users[1].address);
      expect(final).to.equal(25);
    });
  });
});
