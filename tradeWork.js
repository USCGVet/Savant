// tradeWork.js

const savantContractAddress = '0xf16e17e4a01bf99b0a03fd3ab697bc87906e1809'; // Replace with your Savant contract address
// DEV: 0x0dEC227f56AC4D342F041D486aa60742D4BdC483 Savant  | PROD 0xf16e17e4a01bf99b0a03fd3ab697bc87906e1809
// DEV: 0x645D817611E0CDaF9cD43332c4E369B9E333471d HexRewards | PROD 0xCfCb89f00576A775d9f81961A37ba7DCf12C7d9B

const hexContractAddress = '0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39'; // HEX contract address
const hxrContractAddress = '0xCfCb89f00576A775d9f81961A37ba7DCf12C7d9B'; // HexRewards contract address

let web3, savantContract, hexContract, accounts, savantAbi, hexAbi, hxrAbi;

async function loadABIs() {
    try {
        const savantResponse = await fetch('./Savant.json');
        const savantArtifact = await savantResponse.json();
        savantAbi = savantArtifact.abi;

        hexAbi = await loadHexABI();
        if (!hexAbi) {
            throw new Error('Failed to load Hex ABI.');
        }     
        
         // Load HXR ABI (you'll need to create this JSON file)
         const hxrResponse = await fetch('./HexRewards.json');
         const hxrArtifact = await hxrResponse.json();
         hxrAbi = hxrArtifact.abi;

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

async function connectToMetaMask() {
    await loadABIs();

    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        try {
            accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            savantContract = new web3.eth.Contract(savantAbi, savantContractAddress);
            hexContract = new web3.eth.Contract(hexAbi, hexContractAddress);
            hxrContract = new web3.eth.Contract(hxrAbi, hxrContractAddress);
            
            // Truncate the address
            const truncatedAddress = truncateAddress(accounts[0]);
            document.getElementById('accountInfo').innerHTML = `Connected: ${truncatedAddress}`;
            
            await getSavantBalance();
            await getHexBalance();
            document.getElementById('mainContent').style.display = 'block';
            document.getElementById('metamaskButton').style.display = 'none';
            document.getElementById('connectAddr').style.display = 'block';

            await getNetwork();            
            

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

    document.getElementById('dogBrain').style.display = 'none';
}

async function getHXRBalance() {
    const balance = await hxrContract.methods.balanceOf(accounts[0]).call();
    document.getElementById('hxrBalance').innerHTML = `HXR Balance: ${web3.utils.fromWei(balance, 'ether')}`;
}

/*
async function getContractHXRBalance() {
    try {
        const contractBalance = await savantContract.methods.getSavantContractHXRBalance().call();
        console.log('HXR balance at contract address:', web3.utils.fromWei(contractBalance, 'ether'));
        document.getElementById('depositStatus').textContent += ` Contract HXR balance: ${web3.utils.fromWei(contractBalance, 'ether')} HXR`;
    } catch (error) {
        console.error('Error fetching contract HXR balance:', error);
    }
}
*/

async function approveHXRSpend() {
    const amount = document.getElementById('hxrAmount').value;
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    const amountWei = web3.utils.toWei(amount, 'ether');

    try {
        document.getElementById('approvalStatus').textContent = 'Approving HXR...';
        console.log('Approving HXR spend...');
        
        const approvalTx = await hxrContract.methods.approve(savantContractAddress, amountWei).send({ from: accounts[0] });
        console.log('Approval transaction:', approvalTx);
        
        document.getElementById('approvalStatus').textContent = 'Approval successful!';
        document.getElementById('amountToDeposit').textContent = `Amount to Trade-in: ${amount} HXR`;
        
        // Hide Step 1 and show Step 2
        document.getElementById('step1').classList.remove('active');
        document.getElementById('step2').classList.add('active');

    } catch (error) {
        console.error('Error during approval:', error);
        document.getElementById('approvalStatus').textContent = 'Approval failed. Please try again.';
        alert('Error during approval. Please check the console for details.');
    }
}

async function confirmDepositHXR() {
    const amount = document.getElementById('hxrAmount').value;
    const amountWei = web3.utils.toWei(amount, 'ether');

    try {
        document.getElementById('depositStatus').textContent = 'Trading in HXR...';
        console.log('Trading-in HXR for Savant...');
        
        const depositTransaction = await savantContract.methods.exchangeHexRewardsForSavant(amountWei).send({ from: accounts[0] });
        console.log('Trade-in transaction:', depositTransaction);
        
        document.getElementById('depositStatus').textContent = 'Trade-in successful!';

        //alert('Trade-in successful!');

        // Update balances
        await getSavantBalance();
        await getHXRBalance();

        // Reset the form and go back to Step 1
        document.getElementById('hxrAmount').value = '';
        document.getElementById('approvalStatus').textContent = '';
        document.getElementById('depositStatus').textContent = '';
        document.getElementById('step2').classList.remove('active');
        document.getElementById('step1').classList.add('active');

    } catch (error) {
        console.error('Error during Trade-in:', error);
        document.getElementById('depositStatus').textContent = 'Trade-in failed. Please try again.';
        alert('Error during Trade-in. Please check the console for details.');
    }
}



async function updateUI() {
    await getSavantBalance();
    await getHexBalance();
    await getHXRBalance();    
    //await getContractHXRBalance();
}

// Event listeners
document.getElementById('metamaskButton').addEventListener('click', connectToMetaMask);
document.getElementById('approveButton').addEventListener('click', approveHXRSpend);

// Call the updateUI function after deposit
document.getElementById('confirmDepositButton').addEventListener('click', async () => {
    await confirmDepositHXR();
    await updateUI();
});




// Check for stored connection on page load
window.addEventListener('load', async () => {
    if (localStorage.getItem('isMetaMaskConnected') === 'true') {
        await connectToMetaMask();
    }
});
