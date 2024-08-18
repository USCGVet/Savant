// scriptWork.js

const savantContractAddress = '0xf16e17e4a01bf99b0a03fd3ab697bc87906e1809'; // Replace with your Savant contract address
// DEV: 0x1D87585dF4D48E52436e26521a3C5856E4553e3F Savant  |  PROD 0xf16e17e4a01bf99b0a03fd3ab697bc87906e1809

// DEV: 0x221416cfa5a3cd92035e537ded1dd12d4d587c03 HexRewards  |  PROD 0xCfCb89f00576A775d9f81961A37ba7DCf12C7d9B

const hexContractAddress = '0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39'; // HEX contract address
const MAX_STAKES_PER_TIER = 369;

let web3, savantContract, hexContract, accounts, savantAbi, hexAbi;

async function loadABIs() {
    try {
        const savantResponse = await fetch('./Savant.json');
        const savantArtifact = await savantResponse.json();
        savantAbi = savantArtifact.abi;

        hexAbi = await loadHexABI();
        if (!hexAbi) {
            throw new Error('Failed to load Hex ABI.');
        }        

    } catch (error) {
        console.error('Error loading ABIs:', error);
    }
}

async function loadHexABI() {
    try {
      const response = await fetch('./HexABI.json');
      const hexAbi = await response.json();
      return hexAbi;
    } catch (error) {
        console.error('Error loading Hex ABI:', error);
        return null;
    }
  }


  async function addSavantToMetaMask() {
    if (!web3 || !accounts || accounts.length === 0) {
        alert('Please connect to MetaMask first!');
        return;
    }

    try {
        // Request to add the token to MetaMask
        await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20',
                options: {
                    address: savantContractAddress,
                    symbol: 'SAVANT',
                    decimals: 18,
                    image: 'https://uscgvet.github.io/Savant/Savant.png' // Replace with the actual URL of your Savant logo
                },
            },
        });
        console.log('Savant token added to MetaMask');
    } catch (error) {
        console.error('Error adding Savant token to MetaMask:', error);
    }
}


async function connectToMetaMask() {
    await loadABIs();

    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        try {
            accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            savantContract = new web3.eth.Contract(savantAbi, savantContractAddress);
            hexContract = new web3.eth.Contract(hexAbi, hexContractAddress);
            
            // Truncate the address
            const truncatedAddress = truncateAddress(accounts[0]);
            document.getElementById('accountInfo').innerHTML = `Connected: ${truncatedAddress}`;
            
            await getSavantBalance();
            await getHexBalance();
            document.getElementById('mainContent').style.display = 'block';
            document.getElementById('metamaskButton').style.display = 'none';
            document.getElementById('connectAddr').style.display = 'block';

            await getNetwork();            
            await displayRemainingSeats();

            localStorage.setItem('isMetaMaskConnected', 'true');

            await updateUI();
            
            document.getElementById('dogBrain').style.display = 'none';

           

        } catch (error) {
            console.error(error);
        }
    } else {
        alert('Please install MetaMask to interact with this dApp!');
    }
}

// Function to truncate address
function truncateAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 5)}...${address.slice(-5)}`;
}


async function getNetwork() {
    const networkId = await web3.eth.net.getId();
    let networkName;
    switch(Number(networkId)) {
        case 1: networkName = "Ethereum Mainnet"; break;
        case 3: networkName = "Ropsten Testnet"; break;
        case 4: networkName = "Rinkeby Testnet"; break;
        case 5: networkName = "Goerli Testnet"; break;
        case 369: networkName = 'PulseChain Mainnet'; break;  
        case 943: networkName = 'PulseChain Testnet v4'; break;  
            
        default: networkName = "Unknown";
    }
    document.getElementById('networkInfo').innerHTML = `Network: ${networkName}`;
}

async function getSavantBalance() {
    const balance = await savantContract.methods.balanceOf(accounts[0]).call();
    document.getElementById('savantBalance').innerHTML = `Savant Balance: ${web3.utils.fromWei(balance, 'ether')}`;
}

// Helper function to convert HEX balance from contract (with 8 decimals) to a readable format
function formatHexBalance(balance) {
    // Divide by 10^8 to get the correct decimal place
    return (Number(balance) / 1e8).toFixed(2);
}

async function getHexBalance() {
    const balance = await hexContract.methods.balanceOf(accounts[0]).call();
    const formattedBalance = formatHexBalance(balance);
    document.getElementById('hexBalance').innerHTML = `HEX Balance: ${formattedBalance} `;
}


async function displayRemainingSeats() {
    const remainingSeats = document.getElementById('remainingSeats');
    remainingSeats.innerHTML = '';

    for (let i = 0; i < 9; i++) {
        const count = await savantContract.methods.tierStakesCount(i).call();
        const remaining = BigInt(MAX_STAKES_PER_TIER) - BigInt(count);
        const tierItem = document.createElement('div');
        tierItem.innerHTML = `Tier ${i}: ${Number(remaining)} seats remaining`;
        remainingSeats.appendChild(tierItem);
    }

    document.getElementById('dogBrain').style.display = 'none';
}


// Event listeners
document.getElementById('metamaskButton').addEventListener('click', connectToMetaMask);
document.getElementById('addTokenButton').addEventListener('click', addSavantToMetaMask);

// Check for stored connection on page load
window.addEventListener('load', async () => {
    if (localStorage.getItem('isMetaMaskConnected') === 'true') {
        await connectToMetaMask();
    }
});
