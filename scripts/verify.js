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
		address: "0x5539bbe1457ddC7A7C3d9d09e43c306c1Aa9D996",
		args: [],
	},
];

verifyContracts(contractsToVerify);
