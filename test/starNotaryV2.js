const StarNotaryV2 = artifacts.require("StarNotaryV2");

let accounts;
let owner;

contract("StarNotaryV2", (accs) => {
  accounts = accs;
  owner = accounts[0];
});

it("can create a star", async () => {
  let tokenId = 1;
  let instance = await StarNotaryV2.deployed();
  await instance.createStar("Awesome Star", tokenId, { from: accounts[0] });
  assert.equal(await instance.tokenIdToStarInfo.call(tokenId), "Awesome Star");
});

it("lets user put up their star for sale", async () => {
  let instance = await StarNotaryV2.deployed();
  let usr1 = accounts[1];
  let starId = 2;
  let starPrice = web3.utils.toWei("0.01", "ether");
  await instance.createStar("awesome star", starId, { from: usr1 });
  await instance.putStarUpForSale(starId, starPrice, { from: usr1 });
  assert.equal(await instance.starForSale.call(starId), starPrice);
});

it("lets user1 get the funds after the sale", async () => {
  let instance = await StarNotaryV2.deployed();
  let usr1 = accounts[1];
  let usr2 = accounts[2];
  let starId = 3;
  let starPrice = web3.utils.toWei("0.01", "ether");
  let balance = web3.utils.toWei("0.05", "ether");
  await instance.createStar("awesome star", starId, { from: usr1 });
  await instance.putStarUpForSale(starId, starPrice, { from: usr1 });
  let balanceOfUser1BT = await web3.eth.getBalance(usr1);
  await instance.buyStar(starId, { from: usr2, value: balance });
  let balanceOfUser1AT = await web3.eth.getBalance(usr1);
  let v1 = Number(balanceOfUser1BT) + Number(starPrice);
  let v2 = Number(balanceOfUser1AT);
  assert.equal(v1, v2);
});

it("lets user buy a star, if it is put up for sale", async () => {
  let instance = await StarNotaryV2.deployed();
  let u1 = accounts[1];
  let u2 = accounts[2];
  let starId = 4;
  let starPrice = web3.utils.toWei("0.01", "ether");
  let balance = web3.utils.toWei("0.05", "ether");
  await instance.createStar("awesome star", starId, { from: u1 });
  await instance.putStarUpForSale(starId, starPrice, { from: u1 });
  await instance.buyStar(starId, { from: u2, value: balance });
  assert.equal(await instance.ownerOf.call(starId), u2);
});

it("lets user2 buy a star and decreases its balance in ether", async () => {
  let instance = await StarNotaryV2.deployed();
  let u1 = accounts[1];
  let u2 = accounts[2];
  let starId = 5;
  let starPrice = web3.utils.toWei("0.01", "ether");
  let balance = web3.utils.toWei("0.05", "ether");
  await instance.createStar("awesome star", starId, { from: u1 });
  await instance.putStarUpForSale(starId, starPrice, { from: u1 });
  let balanceOfUser2BT = await web3.eth.getBalance(u2);
  await instance.buyStar(starId, { from: u2, value: balance, gasPrice: 0 });
  const balanceAfterUser2BuysStar = await web3.eth.getBalance(u2);
  let val = Number(balanceOfUser2BT) - Number(balanceAfterUser2BuysStar);
  assert.equal(val, starPrice);
});

it("token names and token symbol are added properly", async () => {
  let instance = await StarNotaryV2.deployed();
  assert.equal(await instance.name(), "Stars");
  assert.equal(await instance.symbol(), "ST");
});

it("can exchange stars between two users", async () => {
  let instance = await StarNotaryV2.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let user1StarId = 6;
  let user2StarId = 7;
  await instance.createStar("User 1 star", user1StarId, { from: user1 });
  await instance.createStar("User 2 star", user2StarId, { from: user2 });
  const ownerOfStar1BeforeExchange = await instance.ownerOf(user1StarId);
  const ownerOfStar2BeforeExchange = await instance.ownerOf(user2StarId);
  assert.equal(ownerOfStar1BeforeExchange, user1);
  assert.equal(ownerOfStar2BeforeExchange, user2);
  await instance.exchangeStars(user1StarId, user2StarId, { from: user1 });
  const ownerOfStar1AfterExchange = await instance.ownerOf(user1StarId);
  const ownerOfStar2AfterExchange = await instance.ownerOf(user2StarId);
  assert.equal(ownerOfStar1AfterExchange, user2);
  assert.equal(ownerOfStar2AfterExchange, user1);
});

it("can transfer star tokens", async () => {
  let instance = await StarNotaryV2.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let user1StarId = 8;
  await instance.createStar("User Transfer Star", user1StarId, { from: user1 });
  const ownerOfStar1BeforeTransfer = await instance.ownerOf(user1StarId);
  assert.equal(ownerOfStar1BeforeTransfer, user1);
  await instance.transferStar(user2, user1StarId, { from: user1 });
  const ownerOfStar1AfterTransfer = await instance.ownerOf(user1StarId);
  assert.equal(ownerOfStar1AfterTransfer, user2);
});
