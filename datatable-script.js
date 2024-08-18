let stakeTable;
let remainingSeatsData = [];

function calculateTier(amountInHex) {
    // Convert Hex to Hearts (multiply by 1e8)
    const amountInHearts = BigInt(Math.floor(amountInHex * 1e8));

    if (amountInHearts < 1000n * 100000000n) {
        return 9; // Invalid tier
    } else if (amountInHearts < 10000n * 100000000n) {
        return 0; // Tier 0
    } else if (amountInHearts < 100000n * 100000000n) {
        return 1; // Tier 1
    } else if (amountInHearts < 1000000n * 100000000n) {
        return 2; // Tier 2
    } else if (amountInHearts < 10000000n * 100000000n) {
        return 3; // Tier 3
    } else if (amountInHearts < 100000000n * 100000000n) {
        return 4; // Tier 4
    } else if (amountInHearts < 1000000000n * 100000000n) {
        return 5; // Tier 5
    } else if (amountInHearts < 10000000000n * 100000000n) {
        return 6; // Tier 6
    } else if (amountInHearts < 100000000000n * 100000000n) {
        return 7; // Tier 7
    } else {
        return 8; // Tier 8, the final tier
    }
}


async function initializeStakeListTable() {
    await updateRemainingSeatsData();

    const stakeData = await getStakeData();

    if ($.fn.DataTable.isDataTable('#stakeList')) {
        stakeTable.clear().rows.add(stakeData).draw();
    } else {
        stakeTable = $('#stakeList').DataTable({
            data: stakeData,
            columns: [
                { data: 'index', title: 'Stake Index' },
                { data: 'stakeId', title: 'Stake ID' },
                { data: 'stakedHex', title: 'Staked HEX' },
                { data: 'lockedDay', title: 'Locked Day' },
                { data: 'stakedDays', title: 'Staked Days' },
                { data: 'consumedDays', title: 'Consumed Days' },
                { data: 'earlyReward', title: 'Early Reward' },
                { data: 'finishedReward', title: 'Finished Reward' },
                {
                    data: null,
                    title: 'Register',
                    render: function(data, type, row) {
                        const stakedHex = Number(row.stakedHex);
                        const stakeId = Number(row.stakeId);

                        if (stakedHex < 1000) {
                            return 'Not Allowed';
                        } else if (stakeId < 819820) {
                            return 'Not Needed';
                        } else {
                            const tier = calculateTier(stakedHex);
                            const seatsAvailable = remainingSeatsData[tier] > 0;

                            if (row.isRegistered) {
                                return 'Registered';
                            } else if (!seatsAvailable) {
                                return 'No Seats Available';
                            } else {
                                return '<button class="register-btn" data-stake-index="' + row.index + '">Register</button>';
                            }
                        }
                    }
                },
                {
                    data: null,
                    title: 'Claim Reward',
                    render: function(data, type, row) {
                        const stakedHex = Number(row.stakedHex);
                        const stakeId = Number(row.stakeId);

                        if (stakedHex < 1000) {
                            return 'Not allowed';
                        } else if (stakeId < 819820 && row.isClaimed === false) {                            
                            return '<button class="claim-btn" data-stake-index="' + row.index + '">Claim</button>';
                        } else if (stakeId < 819820 && row.isClaimed === true) {
                            const claimedAmount = (Number(row.claimedAmount)).toFixed(8);

                            return 'Claimed' +
                            '<div class="return-amount">' + claimedAmount + '</div>';
                        } else if (row.isClaimed === true) {
                            const claimedAmount = (Number(row.claimedAmount)).toFixed(8);
                            
                            return 'Claimed' +
                            '<div class="return-amount">' + claimedAmount + '</div>';
                        } else {
                            return row.isRegistered ? '<button class="claim-btn" data-stake-index="' + row.index + '">Claim</button>' : 'Not Registered';
                        }
                    }
                },
                {
                    data: null,
                    title: 'Return Reward',
                    render: function(data, type, row) {
                        const claimedAmount = Number(row.claimedAmount);
                        const finishedReward = Number(row.finishedReward);
                        
                        if (row.isClaimed && claimedAmount < finishedReward) {
                            const requiredAmount = (claimedAmount * 1.3).toFixed(8);
                            return '<button class="return-btn" data-stake-id="' + row.stakeId + '">Return</button>' +
                                   '<div class="return-amount">Required: ' + requiredAmount + '</div>';
                        } else if (row.isClaimed) {
                            return 'Max Reward Claimed';
                        } else {
                            return 'Not Claimed';
                        }
                    }
                },
                {
                    data: null,
                    title: 'End Stake',
                    render: function(data, type, row) {
                        return '<button class="end-stake-btn" data-stake-index="' + row.index + '" data-stake-id="' + row.stakeId + '">End Stake</button>';
                    }
                }
            ],
            pageLength: 5,
            lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]],
            responsive: true,
            language: {
                search: "Filter Hex stakes:",
                lengthMenu: "Show _MENU_ Hex stakes per page",
                info: "Displaying _START_ to _END_ of _TOTAL_ stakes",
                paginate: {
                    first: "First",
                    last: "Last",
                    next: "Next",
                    previous: "Previous"
                }
            }
        });
    }

    // Event listeners for buttons
    $('#stakeList').off('click', '.register-btn').on('click', '.register-btn', async function() {
        const stakeIndex = $(this).data('stake-index');
        await savantContract.methods.claimStake(stakeIndex).send({from: accounts[0]});
        updateStakeTable();
    });

    $('#stakeList').off('click', '.claim-btn').on('click', '.claim-btn', async function() {
        const stakeIndex = $(this).data('stake-index');
        await savantContract.methods.claimReward(stakeIndex).send({from: accounts[0]});
        updateStakeTable();
    });

    $('#stakeList').off('click', '.return-btn').on('click', '.return-btn', async function() {
        const stakeId = $(this).data('stake-id');
        await savantContract.methods.returnReward(stakeId).send({from: accounts[0]});
        updateStakeTable();
    });

    $('#stakeList').off('click', '.end-stake-btn').on('click', '.end-stake-btn', async function() {
        const stakeIndex = $(this).data('stake-index');
        const stakeId = $(this).data('stake-id');
        await hexContract.methods.stakeEnd(stakeIndex, stakeId).send({from: accounts[0]});
        updateStakeTable();        
    });
}

async function getStakeData() {
    const stakeCount = await hexContract.methods.stakeCount(accounts[0]).call();
    const stakeData = [];

    for (let i = 0; i < stakeCount; i++) {
        const stake = await hexContract.methods.stakeLists(accounts[0], i).call();
        
        const lockedDay = Number(stake.lockedDay);
        const stakedDays = Number(stake.stakedDays);
        
        const consumedDays = await savantContract.methods.calculateConsumedDays(lockedDay, stakedDays).call();
        const earlyReward = await savantContract.methods.calculateReward(consumedDays, stakedDays, stake.unlockedDay).call();
        const finishedReward = await savantContract.methods.calculateReward(stakedDays, stakedDays, stake.unlockedDay).call();
               
        const formattedStakedHex = formatHexBalance(stake.stakedHearts);
        const claimedAmount = await savantContract.methods.getClaimedReward(accounts[0], stake.stakeId).call();


        stakeData.push({
            index: i,
            stakeId: stake.stakeId.toString(),
            stakedHex: formattedStakedHex,
            lockedDay: lockedDay,
            stakedDays: stakedDays,
            consumedDays: Number(consumedDays),
            earlyReward: web3.utils.fromWei(earlyReward, 'ether'),
            finishedReward: web3.utils.fromWei(finishedReward, 'ether'),
            isRegistered: await savantContract.methods.isStakeRegistered(stake.stakeId).call(),
            isClaimed: claimedAmount > 0,
            claimedAmount: web3.utils.fromWei(claimedAmount, 'ether')
        });
    }

    return stakeData;
}


async function updateRemainingSeatsData() {
    remainingSeatsData = [];
    for (let i = 0; i < 9; i++) {
        const count = await savantContract.methods.tierStakesCount(i).call();
        const remaining = BigInt(MAX_STAKES_PER_TIER) - BigInt(count);
        remainingSeatsData[i] = Number(remaining);
    }
}



async function updateStakeTable() {
    await updateRemainingSeatsData();
    const newData = await getStakeData();
    stakeTable.clear().rows.add(newData).draw();

    await getSavantBalance();
    await getHexBalance();
    await displayRemainingSeats();
}

// Helper function to convert HEX balance from contract (with 8 decimals) to a readable format
function formatHexBalance(balance) {
    // Ensure balance is treated as a BigInt
    const balanceBigInt = BigInt(balance);
    // Divide by 10^8 to get the correct decimal place
    return (Number(balanceBigInt) / 1e8).toFixed(2);
}

// Call this function after connecting to MetaMask and loading contract data
async function updateUI() {    
    await initializeStakeListTable();
    await getSavantBalance();
    await getHexBalance();
    await displayRemainingSeats();
}