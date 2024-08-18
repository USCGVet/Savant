// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

//import "./IHex.sol";
interface IHEX {
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
    event Claim(
        uint256 data0,
        uint256 data1,
        bytes20 indexed btcAddr,
        address indexed claimToAddr,
        address indexed referrerAddr
    );
    event ClaimAssist(
        uint256 data0,
        uint256 data1,
        uint256 data2,
        address indexed senderAddr
    );
    event DailyDataUpdate(uint256 data0, address indexed updaterAddr);
    event ShareRateChange(uint256 data0, uint40 indexed stakeId);
    event StakeEnd(
        uint256 data0,
        uint256 data1,
        address indexed stakerAddr,
        uint40 indexed stakeId
    );
    event StakeGoodAccounting(
        uint256 data0,
        uint256 data1,
        address indexed stakerAddr,
        uint40 indexed stakeId,
        address indexed senderAddr
    );
    event StakeStart(
        uint256 data0,
        address indexed stakerAddr,
        uint40 indexed stakeId
    );
    event Transfer(address indexed from, address indexed to, uint256 value);
    event XfLobbyEnter(
        uint256 data0,
        address indexed memberAddr,
        uint256 indexed entryId,
        address indexed referrerAddr
    );
    event XfLobbyExit(
        uint256 data0,
        address indexed memberAddr,
        uint256 indexed entryId,
        address indexed referrerAddr
    );

    //fallback() external payable;

    function allocatedSupply() external view returns (uint256);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function balanceOf(address account) external view returns (uint256);

    function btcAddressClaim(
        uint256 rawSatoshis,
        bytes32[] memory proof,
        address claimToAddr,
        bytes32 pubKeyX,
        bytes32 pubKeyY,
        uint8 claimFlags,
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 autoStakeDays,
        address referrerAddr
    ) external returns (uint256);

    function btcAddressClaims(bytes20) external view returns (bool);

    function btcAddressIsClaimable(
        bytes20 btcAddr,
        uint256 rawSatoshis,
        bytes32[] memory proof
    ) external view returns (bool);

    function btcAddressIsValid(
        bytes20 btcAddr,
        uint256 rawSatoshis,
        bytes32[] memory proof
    ) external pure returns (bool);

    function claimMessageMatchesSignature(
        address claimToAddr,
        bytes32 claimParamHash,
        bytes32 pubKeyX,
        bytes32 pubKeyY,
        uint8 claimFlags,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external pure returns (bool);

    function currentDay() external view returns (uint256);

    function dailyData(uint256)
        external
        view
        returns (
            uint72 dayPayoutTotal,
            uint72 dayStakeSharesTotal,
            uint56 dayUnclaimedSatoshisTotal
        );

    function dailyDataRange(uint256 beginDay, uint256 endDay)
        external
        view
        returns (uint256[] memory list);

    function dailyDataUpdate(uint256 beforeDay) external;

    function decimals() external view returns (uint8);

    function decreaseAllowance(address spender, uint256 subtractedValue)
        external
        returns (bool);

    function globalInfo() external view returns (uint256[13] memory);

    function globals()
        external
        view
        returns (
            uint72 lockedHeartsTotal,
            uint72 nextStakeSharesTotal,
            uint40 shareRate,
            uint72 stakePenaltyTotal,
            uint16 dailyDataCount,
            uint72 stakeSharesTotal,
            uint40 latestStakeId,
            uint128 claimStats
        );

    function increaseAllowance(address spender, uint256 addedValue)
        external
        returns (bool);

    function merkleProofIsValid(bytes32 merkleLeaf, bytes32[] memory proof)
        external
        pure
        returns (bool);

    function name() external view returns (string memory);

    function pubKeyToBtcAddress(
        bytes32 pubKeyX,
        bytes32 pubKeyY,
        uint8 claimFlags
    ) external pure returns (bytes20);

    function pubKeyToEthAddress(bytes32 pubKeyX, bytes32 pubKeyY)
        external
        pure
        returns (address);

    function stakeCount(address stakerAddr) external view returns (uint256);

    function stakeEnd(uint256 stakeIndex, uint40 stakeIdParam) external;

    function stakeGoodAccounting(
        address stakerAddr,
        uint256 stakeIndex,
        uint40 stakeIdParam
    ) external;

    function stakeLists(address, uint256)
        external
        view
        returns (
            uint40 stakeId,
            uint72 stakedHearts,
            uint72 stakeShares,
            uint16 lockedDay,
            uint16 stakedDays,
            uint16 unlockedDay,
            bool isAutoStake
        );

    function stakeStart(uint256 newStakedHearts, uint256 newStakedDays)
        external;

    function symbol() external view returns (string memory);

    function totalSupply() external view returns (uint256);

    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    function xfLobby(uint256) external view returns (uint256);

    function xfLobbyEnter(address referrerAddr) external payable;

    function xfLobbyEntry(address memberAddr, uint256 entryId)
        external
        view
        returns (uint256 rawAmount, address referrerAddr);

    function xfLobbyExit(uint256 enterDay, uint256 count) external;

    function xfLobbyFlush() external;

    function xfLobbyMembers(uint256, address)
        external
        view
        returns (uint40 headIndex, uint40 tailIndex);

    function xfLobbyPendingDays(address memberAddr)
        external
        view
        returns (uint256[2] memory words);

    function xfLobbyRange(uint256 beginDay, uint256 endDay)
        external
        view
        returns (uint256[] memory list);
}



struct HEXDailyData {
    uint72 dayPayoutTotal;
    uint72 dayStakeSharesTotal;
    uint56 dayUnclaimedSatoshisTotal;
}

struct HEXGlobals {
    uint72 lockedHeartsTotal;
    uint72 nextStakeSharesTotal;
    uint40 shareRate;
    uint72 stakePenaltyTotal;
    uint16 dailyDataCount;
    uint72 stakeSharesTotal;
    uint40 latestStakeId;
    uint128 claimStats;
}

struct HEXStake {
    uint40 stakeId;
    uint72 stakedHearts;
    uint72 stakeShares;
    uint16 lockedDay;
    uint16 stakedDays;
    uint16 unlockedDay;
    bool   isAutoStake;
}
         
struct HEXStakeMinimal {
    uint40 stakeId;
    uint72 stakeShares;
    uint16 lockedDay;
    uint16 stakedDays;
}

contract Savant is ERC20, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IHEX private _hexContract;
    IERC20 public hxrToken;  // HexRewards token contract

    uint256 public constant MAX_STAKE_DAYS = 5555;
    uint256 public constant REWARD_PER_DAY = 1e13; // 0.00001
    
   
    address internal constant ZERO_IQ_ADDR = 0xe46334e08525CFF61EFdFe8c43CC4F27DBE068aF;  /* 0 IQ address */

    address internal constant BURN_ADDRESS = address(0); // Burn Address
    
    uint256 public constant STAKEID_PROTECTION = 817340; // the stake ID where new stakes require an increasing amount of Hex per stakeID
    uint256[9] public tierStakesCount = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    uint256 public constant MAX_STAKES_PER_TIER = 369;

    mapping(uint40 => uint256) public stakeTierIndex;  // Maps stake ID to the tier index
    mapping(uint40 => bool) public isStakeRegistered;
    mapping(address => mapping(uint40 => uint256)) private claimed; // changed to uint40 for stakeId

    event StakeClaimed(uint40 indexed stakeId, address indexed user, uint256 amount, uint256 tierIndex);
    event RewardClaimed(address indexed user, uint40 indexed stakeId, uint256 reward);  // changed to use stakeId
    event RewardReturned(address indexed user, uint40 indexed stakeId, uint256 returnAmount, uint256 fee);  // changed to use stakeId
    event TokensExchanged(address indexed user, uint256 hxrAmount, uint256 savantAmount); // event that HXR tokens have been converted to Savant tokens

 
    constructor(string memory _name, string memory _symbol, uint256 _supply, address _hxrTokenAddress) ERC20(_name, _symbol) 
    {
        _mint(msg.sender, _supply * 1e18);
        _hexContract = IHEX(payable(address(0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39)));
        hxrToken = IERC20(_hxrTokenAddress);
    }

    function exchangeHXRForSavant(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(hxrToken.balanceOf(msg.sender) >= _amount, "Insufficient HXR balance");

        // Transfer HXR tokens from user to burn address
        hxrToken.safeTransferFrom(msg.sender, BURN_ADDRESS, _amount);

        // Mint equivalent amount of Savant tokens to the user
        _mint(msg.sender, _amount);

        emit TokensExchanged(msg.sender, _amount, _amount);
    }

    
    function claimStake(uint40 stakeIndex) external nonReentrant {
        (uint40 stakeId, uint72 stakedHearts, , , , , ) = _hexContract.stakeLists(msg.sender, stakeIndex);
        
        
        require(stakeId > STAKEID_PROTECTION, "Savant: Stake ID must be beyond protection ID");     
        require(!isStakeRegistered[stakeId], "Savant: Stake has already been claimed");
    
        uint256 tierIndex = determineTier(stakedHearts);
        
        require(tierIndex < 9, "Savant: Stake amount doesn't meet tier requirements.");
        require(tierStakesCount[tierIndex] < MAX_STAKES_PER_TIER, "Savant: This tier is fully subscribed");

        tierStakesCount[tierIndex]++;
        stakeTierIndex[stakeId] = tierIndex;
        isStakeRegistered[stakeId] = true;

        emit StakeClaimed(stakeId, msg.sender, stakedHearts, tierIndex);
    }

    function determineTier(uint256 amount) public pure returns (uint256) {
        if (amount < 1000e8) {  // 1,000 Hex in Hearts
            return 9; // Invalid tier
        } else if (amount < 10000e8) {  // 10,000 Hex in Hearts
            return 0; // Tier 0
        } else if (amount < 100000e8) {  // 100,000 Hex in Hearts
            return 1; // Tier 1
        } else if (amount < 1000000e8) {  // 1,000,000 Hex in Hearts
            return 2; // Tier 2
        } else if (amount < 10000000e8) {  // 10,000,000 Hex in Hearts
            return 3; // Tier 3
        } else if (amount < 100000000e8) {  // 100,000,000 Hex in Hearts
            return 4; // Tier 4
        } else if (amount < 1000000000e8) {  // 1,000,000,000 Hex in Hearts
            return 5; // Tier 5
        } else if (amount < 10000000000e8) {  // 10,000,000,000 Hex in Hearts
            return 6; // Tier 6
        } else if (amount < 100000000000e8) {  // 100,000,000,000 Hex in Hearts
            return 7; // Tier 7
        } else {
            return 8; // Tier 8, the final tier
        }
    }



    function calculateReward(uint256 consumedDays, uint256 stakedDays, uint256 unlockedDay) public pure returns (uint256) {
        uint256 rewardPerDay;
              
        if (stakedDays == MAX_STAKE_DAYS) { // If it is a 5555-day stake
            if (unlockedDay == 0){
                rewardPerDay = REWARD_PER_DAY * 10;
            }
            else if (consumedDays < stakedDays) { // did the stake finish all days
                rewardPerDay = REWARD_PER_DAY * 10;
            } else {
                rewardPerDay = REWARD_PER_DAY * 100;
            }
        } else { // For stakes fewer than 5555 days
            if (unlockedDay == 0){
                rewardPerDay = REWARD_PER_DAY;
            }
            else if (consumedDays < stakedDays) {// did the stake finish all days
                rewardPerDay = REWARD_PER_DAY;
            } else {
                rewardPerDay = REWARD_PER_DAY * 10;
            }
        }
        
        return consumedDays * rewardPerDay;       
    }


    function getClaimedReward(address account, uint40 stakeId) public view returns (uint256) {  // changed to uint40 for stakeId
        return claimed[account][stakeId];  // changed to uint40 for stakeId
    }

    function stakeDataFetch(
    ) 
        public
        view
        returns(HEXStake memory)
    {
        uint40 stakeId;
        uint72 stakedHearts;
        uint72 stakeShares;
        uint16 lockedDay;
        uint16 stakedDays;
        uint16 unlockedDay;
        bool   isAutoStake;
        
        (stakeId,
         stakedHearts,
         stakeShares,
         lockedDay,
         stakedDays,
         unlockedDay,
         isAutoStake
        ) = _hexContract.stakeLists(address(this), 0);

        return HEXStake(
            stakeId,
            stakedHearts,
            stakeShares,
            lockedDay,
            stakedDays,
            unlockedDay,
            isAutoStake
        );
    }

    function claimReward(uint256 stakeIndex) external nonReentrant {
        (uint40 stakeId, , , uint16 lockedDay, uint16 stakedDays, uint16 unlockedDay, ) = _hexContract.stakeLists(msg.sender, stakeIndex);

        require(claimed[msg.sender][stakeId] == 0, "Reward already claimed for this stake"); // changed to use stakeId
                
        // Check if the stake ID is for an older, pre-protection stake
        if (stakeId > STAKEID_PROTECTION) {
           // For new stakes post-STAKEID_PROTECTION, check if the stake is registered in a tier
           require(isStakeRegistered[stakeId], "New stakes must be registered to claim rewards");    
           
        }         
        uint256 consumedDays = calculateConsumedDays( lockedDay, stakedDays);

        uint256 reward = calculateReward(consumedDays, stakedDays, unlockedDay);
        claimed[msg.sender][stakeId] = reward; // changed to use stakeId
        _mint(msg.sender, reward);
        emit RewardClaimed(msg.sender, stakeId, reward);
    }
    

    function returnReward(uint40 stakeId) external nonReentrant {  // changed to use stakeId
        uint256 claimedAmount = claimed[msg.sender][stakeId];
        require(claimedAmount > 0, "No reward claimed for this stake");
        
        uint256 returnAmount = (claimedAmount * 130) / 100; // 30% more than claimed
        require(balanceOf(msg.sender) >= returnAmount, "Insufficient balance to return reward");

        claimed[msg.sender][stakeId] = 0;
        uint256 fee = returnAmount - claimedAmount;
        
        _burn(msg.sender, returnAmount);
        _mint(ZERO_IQ_ADDR, fee);
        emit RewardReturned(msg.sender, stakeId, returnAmount, fee);
    }

      

    function calculateReturnAmount(uint40 stakeId) public view returns (uint256) {
        uint256 claimedAmount = claimed[msg.sender][stakeId];
        return (claimedAmount * 130) / 100; // 30% more than claimed
    }
       
    function getCurrentDay() public view returns (uint256) {
        return _hexContract.currentDay();
    }

    function getStakeList(address account) public view returns (HEXStake[] memory) {
        uint256 stakeCount = _hexContract.stakeCount(account);
        HEXStake[] memory stakeList = new HEXStake[](stakeCount);

        for (uint256 i = 0; i < stakeCount; i++) {
            (uint40 stakeId, uint72 stakedHearts, uint72 stakeShares, uint16 lockedDay, uint16 stakedDays, uint16 unlockedDay, bool isAutoStake) = _hexContract.stakeLists(account, i);

            stakeList[i] = HEXStake({
                stakeId: stakeId,
                stakedHearts: stakedHearts,
                stakeShares: stakeShares,
                lockedDay: lockedDay,
                stakedDays: stakedDays,
                unlockedDay: unlockedDay,
                isAutoStake: isAutoStake
            });
        }

        return stakeList;
    }

    function calculateConsumedDays(uint16 lockedDay, uint16 stakedDays) public view returns (uint256) {
        uint256 currentDay = _hexContract.currentDay();
        if (currentDay >= lockedDay + stakedDays) {
            return stakedDays;
        } else if (currentDay > lockedDay) {
            return currentDay - lockedDay;
        } else {
            return 0;
        }
    }

    

}


