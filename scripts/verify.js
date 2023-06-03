const hre = require("hardhat");

async function verifyContracts(contractInfo) {
	for (const info of contractInfo) {
		await hre.run("verify:verify", {
			address: info.address,
			constructorArguments: info.args || [],
		});
	}
}

const contractsToVerify = [
	{
		address: "0x6D2388Cb9f354E49a012a3B3489943628cA9ACBb",
		args: [],
	},
];

verifyContracts(contractsToVerify);
