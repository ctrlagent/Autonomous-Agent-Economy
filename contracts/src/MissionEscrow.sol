// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title MissionEscrow
/// @notice Holds USDC bounties for CTRL agent missions on Base chain.
///         Commander deposits → Agent completes → Reviewer approves → Agent receives USDC
contract MissionEscrow is Ownable, ReentrancyGuard {

    struct Mission {
        address depositor;
        address agent;
        uint256 amount;
        uint256 deadline;
        bool completed;
        bool refunded;
        bytes32 proofHash;
    }

    IERC20 public immutable usdc;
    address public treasury;
    uint256 public feeBps = 250; // 2.5%
    uint256 public missionCount;

    mapping(uint256 => Mission) public missions;

    event MissionDeposited(uint256 indexed missionId, address indexed depositor, address indexed agent, uint256 amount);
    event ProofSubmitted(uint256 indexed missionId, bytes32 proofHash);
    event MissionApproved(uint256 indexed missionId, address indexed agent, uint256 agentAmount, uint256 feeAmount);
    event MissionRefunded(uint256 indexed missionId, address indexed depositor, uint256 amount);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event FeeBpsUpdated(uint256 oldFeeBps, uint256 newFeeBps);

    error InvalidAmount();
    error InvalidAddress();
    error MissionNotFound();
    error MissionAlreadyCompleted();
    error MissionAlreadyRefunded();
    error DeadlineNotReached();
    error DeadlineReached();
    error NotDepositor();
    error NotAgent();
    error ProofNotSubmitted();
    error TransferFailed();

    constructor(address _usdc, address _treasury) Ownable(msg.sender) {
        if (_usdc == address(0) || _treasury == address(0)) revert InvalidAddress();
        usdc = IERC20(_usdc);
        treasury = _treasury;
    }

    /// @notice Commander deposits USDC to fund a mission bounty
    /// @param agent Address of the AI agent wallet that will complete the mission
    /// @param deadline Unix timestamp after which depositor can claim a refund
    /// @return missionId The on-chain mission ID
    function deposit(address agent, uint256 deadline, uint256 amount) external nonReentrant returns (uint256 missionId) {
        if (amount == 0) revert InvalidAmount();
        if (agent == address(0)) revert InvalidAddress();
        if (deadline <= block.timestamp) revert DeadlineReached();

        missionId = ++missionCount;
        missions[missionId] = Mission({
            depositor: msg.sender,
            agent: agent,
            amount: amount,
            deadline: deadline,
            completed: false,
            refunded: false,
            proofHash: bytes32(0)
        });

        bool ok = usdc.transferFrom(msg.sender, address(this), amount);
        if (!ok) revert TransferFailed();

        emit MissionDeposited(missionId, msg.sender, agent, amount);
    }

    /// @notice Agent submits proof of completion (PR hash, IPFS hash, etc.)
    function submitProof(uint256 missionId, bytes32 proofHash) external {
        Mission storage m = missions[missionId];
        if (m.depositor == address(0)) revert MissionNotFound();
        if (m.completed) revert MissionAlreadyCompleted();
        if (m.refunded) revert MissionAlreadyRefunded();
        if (m.agent != msg.sender) revert NotAgent();

        m.proofHash = proofHash;
        emit ProofSubmitted(missionId, proofHash);
    }

    /// @notice Depositor (Commander) approves the mission, releasing USDC to agent minus protocol fee
    function approve(uint256 missionId) external nonReentrant {
        Mission storage m = missions[missionId];
        if (m.depositor == address(0)) revert MissionNotFound();
        if (m.completed) revert MissionAlreadyCompleted();
        if (m.refunded) revert MissionAlreadyRefunded();
        if (m.depositor != msg.sender) revert NotDepositor();
        if (m.proofHash == bytes32(0)) revert ProofNotSubmitted();

        m.completed = true;

        uint256 fee = (m.amount * feeBps) / 10_000;
        uint256 agentAmount = m.amount - fee;

        bool ok1 = usdc.transfer(m.agent, agentAmount);
        if (!ok1) revert TransferFailed();

        if (fee > 0) {
            bool ok2 = usdc.transfer(treasury, fee);
            if (!ok2) revert TransferFailed();
        }

        emit MissionApproved(missionId, m.agent, agentAmount, fee);
    }

    /// @notice Owner can approve any mission (reviewer role)
    function approveByOwner(uint256 missionId) external onlyOwner nonReentrant {
        Mission storage m = missions[missionId];
        if (m.depositor == address(0)) revert MissionNotFound();
        if (m.completed) revert MissionAlreadyCompleted();
        if (m.refunded) revert MissionAlreadyRefunded();

        m.completed = true;

        uint256 fee = (m.amount * feeBps) / 10_000;
        uint256 agentAmount = m.amount - fee;

        bool ok1 = usdc.transfer(m.agent, agentAmount);
        if (!ok1) revert TransferFailed();

        if (fee > 0) {
            bool ok2 = usdc.transfer(treasury, fee);
            if (!ok2) revert TransferFailed();
        }

        emit MissionApproved(missionId, m.agent, agentAmount, fee);
    }

    /// @notice Depositor can reclaim funds if deadline has passed and proof not approved
    function refund(uint256 missionId) external nonReentrant {
        Mission storage m = missions[missionId];
        if (m.depositor == address(0)) revert MissionNotFound();
        if (m.completed) revert MissionAlreadyCompleted();
        if (m.refunded) revert MissionAlreadyRefunded();
        if (m.depositor != msg.sender) revert NotDepositor();
        if (block.timestamp < m.deadline) revert DeadlineNotReached();

        m.refunded = true;

        bool ok = usdc.transfer(m.depositor, m.amount);
        if (!ok) revert TransferFailed();

        emit MissionRefunded(missionId, m.depositor, m.amount);
    }

    /// @notice Update treasury address
    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert InvalidAddress();
        emit TreasuryUpdated(treasury, _treasury);
        treasury = _treasury;
    }

    /// @notice Update protocol fee (max 10%)
    function setFeeBps(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 1000, "Fee too high");
        emit FeeBpsUpdated(feeBps, _feeBps);
        feeBps = _feeBps;
    }

    /// @notice View mission details
    function getMission(uint256 missionId) external view returns (Mission memory) {
        return missions[missionId];
    }

    /// @notice Check USDC balance held in escrow
    function escrowBalance() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }
}
