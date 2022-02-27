// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Messenger {

    struct Message {
        address account;
        string text;
        string time;
    }

    Message[] storageMessages;

    function send(string memory text, string memory time) public {
        storageMessages.push(Message({account: msg.sender, text: text, time: time}));
    }

    function read() public view returns (Message[] memory) {
        return storageMessages;
    }
}