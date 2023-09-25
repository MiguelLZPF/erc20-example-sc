import { GAS_OPT } from "configuration";
import { getContractInstance } from "scripts/utils";
import { Signer } from "ethers";
import { AccessControlUpgradeable, SimpleToken } from "typechain-types";
import { RoleHash, Role } from "models/AccessControl";

// Specific Constants
const CONTRACT_NAME = "SimpleToken";

export const grantRole = async (
  entity: string,
  role: Role,
  adminSigner: Signer,
  accessControl?: string | AccessControlUpgradeable
) => {
  // get address asynchronously
  const adminAddress = adminSigner.getAddress();
  // GET Smart Contract instance and connect
  //-- The signer should be the admin
  accessControl =
    accessControl && typeof accessControl !== "string"
      ? ((await getContractInstance(CONTRACT_NAME, adminSigner)) as AccessControlUpgradeable)
      : ((await getContractInstance(
          CONTRACT_NAME,
          adminSigner,
          accessControl
        )) as AccessControlUpgradeable);
  try {
    // Try to initialize the Smart Contract if not. The Smart Contract must be initialized.
    const receipt = await (await (accessControl as SimpleToken).initialize(GAS_OPT.max)).wait();
    if (receipt) {
      console.log("Smart Contract initialization: The Smart Contracts has been initialized");
    }
  } catch (error) {
    console.log(
      "Smart Contract initialization: An error has been received when trying to initialize the Smart Contract so, it is assummed that the Smart Contract is INITIALIZED"
    );
  }

  // Check if the Signer has Admin Role
  let signerIsAdmin = await accessControl.hasRole(
    RoleHash.get("ADMIN_ROLE")!,
    await adminAddress,
    GAS_OPT.max
  );
  if (!signerIsAdmin) {
    throw new Error(
      `Access Control: Signer ${await adminAddress} does NOT have the Admin Role assigned`
    );
  }
  // console.log("The Signer has admin_role: ", signerIsAdmin);
  // Grant the new role to the entity
  const receipt = await (
    await accessControl.grantRole(RoleHash.get(role)!, entity, GAS_OPT.max)
  ).wait();
  return {
    success: receipt ? true : false,
    txHash: receipt.transactionHash,
    blockNumber: receipt.blockNumber,
  };
};
