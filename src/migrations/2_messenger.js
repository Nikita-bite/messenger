const Messenger = artifacts.require("Messenger");

module.exports = function (deployer) {
    deployer.deploy(Messenger);
};