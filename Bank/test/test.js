const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';
const EVM_REVERT = 'VM Exception while processing transaction: revert';

const Riba = artifacts.require('Riba');
const Bank = artifacts.require('Bank');

const wait = s => {
  const milliseconds = s * 1000
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

require('chai').use(require('chai-as-promised')).should();

contract("Testing Bank", ([deployer, user]) => {
	
	beforeEach(async () => {
		riba = await Riba.new();
		bank = await Bank.new(riba.address);
		await riba.passMinter(bank.address, {from: deployer});
	})
	
	describe("Testing Riba functionality", async () => {
		it("Shouldn't be able to pass minter", async ()=> {
			await riba.passMinter(user, {from: deployer}).should.be.rejectedWith(EVM_REVERT);
		})
		it("Shouldn't be able to mint tokens", async ()=> {
			await riba.mint(user, '1', {from: deployer}).should.be.rejectedWith(EVM_REVERT);
		})
	})
	
	
	describe("Testing riba basic data", async () => {
		it("Testing name", async()=> {
			expect(await riba.name()).to.be.eq('Riba');
		})
		it("Testing name", async()=> {
			expect(await riba.symbol()).to.be.eq('RIB');
		})
		it("Testing supply", async()=> {
			expect(Number(await riba.totalSupply())).to.eq(0);
		})
		it("The minter should be the bank", async() => {
			expect(await riba.theMinter()).to.eq(bank.address);
		})
	})
	
	describe("Test deposits", () => {
    let balance
		describe('success', () => {
			beforeEach(async () => {
				await bank.deposit({value: 10**16, from: user}) 
			})

			it("The balance should increase", async () => {
				expect(Number(await bank.balancesEth(user))).to.eq(10**16)
			})

			it("Deposit time should be greater than 0", async () => {
				expect(Number(await bank.startTime(user))).to.be.above(0)
			})
			it("Can't deposit after making a deposit without a withdraw", async () => {
				await bank.deposit({value: 10**17, from: user}).should.be.rejectedWith(EVM_REVERT)
			})
		})
		describe("Test depositing with an amoun lesser than 0.01 Eth", () => {
			it("Deposit should be rejected", async () => {
				await bank.deposit({value: 10**15, from: user}).should.be.rejectedWith(EVM_REVERT) 
			})
	  
		})
	})
	
	
	describe("Test withdraw", () => {
    let balance
    describe('success', () => {
      beforeEach(async () => {
        await bank.deposit({value: 10**16, from: user}) //0.01 ETH

        await wait(2) //accruing interest

        balance = await web3.eth.getBalance(user)
        await bank.withdraw({from: user})
      })

      it("Eth balance should decrease", async () => {
        expect(Number(await web3.eth.getBalance(bank.address))).to.eq(0)
        expect(Number(await bank.balancesEth(user))).to.eq(0)
      })

      it("User should get his eth back", async () => {
        expect(Number(await web3.eth.getBalance(user))).to.be.above(Number(balance))
      })
	  
      it("The data from the user that deposited should reset", async () => {
        expect(Number(await bank.startTime(user))).to.eq(0)
        expect(Number(await bank.balancesEth(user))).to.eq(0)
      })
    })
	})
	
})
		