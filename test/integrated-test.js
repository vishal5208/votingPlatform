const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

const ZEROADDRESS = ethers.constants.AddressZero;

describe("VotingPlatform", function () {
	let votingPlatform, topicOwner, voters;

	beforeEach(async () => {
		accounts = await ethers.getSigners();

		// roles
		topicOwner = accounts[0];
		voters = [accounts[1], accounts[2], accounts[3]];

		// deploy votingPlatform
		const VotingPlatform = await hre.ethers.getContractFactory(
			"VotingPlatform"
		);
		votingPlatform = await VotingPlatform.deploy();

		await votingPlatform.deployed();
	});

	it("integrated testing", async function () {
		// create topic
		const expiryTime =
			(await ethers.provider.getBlock(await ethers.provider.getBlockNumber()))
				.timestamp + 3600;

		const createTopicTx = await votingPlatform.createTopic(
			"want to watch movie?",
			expiryTime
		);

		// expect TopicCreated event
		await expect(createTopicTx)
			.to.emit(votingPlatform, "TopicCreated")
			.withArgs("1", "want to watch movie?", expiryTime, topicOwner.address);

		// crete voting options for above topic as yes or no
		await votingPlatform.createVotingOption("0", "yes");
		await votingPlatform.createVotingOption("0", "no");

		// get the optionCount for current topic and it should be 2 ("yes" and "no")
		let topic = await votingPlatform.topics("0");
		assert.equal(topic.optionCount.toString(), "2");

		// voter1, voter2, voter3 will register themselves as voters for current topic
		for (let i = 0; i < voters.length; i++) {
			const registerAsVoterTx = await votingPlatform
				.connect(voters[i])
				.registerAsVoter("0");

			// expect for VoterRegistered event
			await expect(registerAsVoterTx)
				.to.emit(votingPlatform, "VoterRegistered")
				.withArgs("0", voters[i].address);
		}

		// topicOwner doesn't want voter3 to be voter
		await votingPlatform.rejectVoter("0", voters[2].address);

		// voter1 will vote "yes"
		const voteTx1 = await votingPlatform.connect(voters[0]).vote("0", "0");
		await expect(voteTx1)
			.to.emit(votingPlatform, "VoteCasted")
			.withArgs("0", voters[0].address, "0");

		// voter1 will vote "no"
		const voteTx2 = await votingPlatform.connect(voters[1]).vote("0", "1");
		await expect(voteTx2)
			.to.emit(votingPlatform, "VoteCasted")
			.withArgs("0", voters[1].address, "1");

		// now get the total count for each option
		// first increas evm time so that voting gets ended
		await network.provider.send("evm_increaseTime", [3600 + 1]);
		await network.provider.send("evm_mine", []);

		// for yes
		const yesVoteCount = await votingPlatform.getVoteCount("0", "0");
		assert.equal(yesVoteCount.toString(), "1");

		// for no
		const noVoteCount = await votingPlatform.getVoteCount("0", "1");
		assert.equal(noVoteCount.toString(), "1");
	});
});
