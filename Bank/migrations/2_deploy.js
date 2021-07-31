const Riba = artifacts.require("Riba");
const Bank = artifacts.require("Bank");

module.exports = async function(deployer) {
	
	await deployer.deploy(Riba);
	
	const riba =  await Riba.deployed();
	
	await deployer.deploy(Bank, riba.address);
	
	const bank = await Bank.deployed();
	
	await riba.passMinter(bank.address);
	
};