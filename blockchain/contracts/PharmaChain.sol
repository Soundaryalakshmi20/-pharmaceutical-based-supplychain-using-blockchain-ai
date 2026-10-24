// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * PharmaChain — immutable supply-chain ledger for medicine serial numbers.
 *
 * The Postgres database stays the system of record for the app; this contract
 * only appends an tamper-evident trail of custody events for every serial
 * number so that any party can audit the journey of a pack of medicine.
 */
contract PharmaChain {
    struct SupplyEvent {
        string serialNumber;
        string eventType; // REGISTER | TRANSFER | RECEIVE | DISPENSE | BLOCK | UNBLOCK
        address actor;
        uint256 timestamp;
        string context; // free-form context, e.g. "org#1 -> org#2"
    }

    address public owner;

    SupplyEvent[] private events;
    mapping(string => uint256[]) private serialIndex;
    mapping(string => bool) public registeredBatches;
    mapping(string => bool) public blockedSerials;

    event BatchRegistered(string batchNumber, string medicineCode, uint256 timestamp);
    event SerialEventRecorded(string serialNumber, string eventType, address actor, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "PharmaChain: caller is not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerBatch(string calldata batchNumber, string calldata medicineCode)
        external
        onlyOwner
        returns (bool)
    {
        registeredBatches[batchNumber] = true;
        emit BatchRegistered(batchNumber, medicineCode, block.timestamp);
        return true;
    }

    function recordEvent(
        string calldata serialNumber,
        string calldata eventType,
        string calldata eventContext
    ) external onlyOwner returns (uint256) {
        uint256 index = events.length;
        events.push(
            SupplyEvent(serialNumber, eventType, msg.sender, block.timestamp, eventContext)
        );
        serialIndex[serialNumber].push(index);

        bytes32 kind = keccak256(bytes(eventType));
        if (kind == keccak256(bytes("BLOCK"))) {
            blockedSerials[serialNumber] = true;
        } else if (kind == keccak256(bytes("UNBLOCK"))) {
            blockedSerials[serialNumber] = false;
        }

        emit SerialEventRecorded(serialNumber, eventType, msg.sender, block.timestamp);
        return index;
    }

    function setBlocked(string calldata serialNumber, bool blocked) external onlyOwner returns (bool) {
        blockedSerials[serialNumber] = blocked;
        return true;
    }

    function getBatchHistory(string calldata serialNumber)
        external
        view
        returns (SupplyEvent[] memory)
    {
        uint256[] storage indexes = serialIndex[serialNumber];
        SupplyEvent[] memory result = new SupplyEvent[](indexes.length);
        for (uint256 i = 0; i < indexes.length; i++) {
            result[i] = events[indexes[i]];
        }
        return result;
    }

    function isBlocked(string calldata serialNumber) external view returns (bool) {
        return blockedSerials[serialNumber];
    }

    function totalEvents() external view returns (uint256) {
        return events.length;
    }
}
