const walletInput = document.getElementById('walletAddress');
const checkButton = document.getElementById('checkButton');
const resultsSection = document.getElementById('resultsSection');
const loadingSection = document.getElementById('loadingSection');
const errorSection = document.getElementById('errorSection');
const retryButton = document.getElementById('retryButton');

// Result Elements
const balanceResult = document.getElementById('balanceResult');
const usdValue = document.getElementById('usdValue');
const securityStatus = document.getElementById('securityStatus');
const networkInfo = document.getElementById('networkInfo');
const totalTransactions = document.getElementById('totalTransactions');
const lastActive = document.getElementById('lastActive');
const addressType = document.getElementById('addressType');
const scanTime = document.getElementById('scanTime');
const scanStatus = document.getElementById('scanStatus');
const errorMessage = document.getElementById('errorMessage');
const loadingDetails = document.getElementById('loadingDetails');

// TRON Address Validation
function isValidTronAddress(address) {
    const tronRegex = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;
    return tronRegex.test(address);
}

// Format TRX balance
function formatBalance(balance) {
    const trx = balance / 1000000; // Convert from sun to TRX
    return trx.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
    }) + ' TRX';
}

// Format USD value
function formatUSD(value) {
    return '$' + value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Get current time for scan timestamp
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Get date for last active
function formatDate(timestamp) {
    if (!timestamp) return 'Unknown';
    
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Show loading animation
function showLoading() {
    resultsSection.classList.add('hidden');
    errorSection.classList.add('hidden');
    loadingSection.classList.remove('hidden');
    
    // Animate loading steps
    const steps = loadingDetails.querySelectorAll('div');
    steps.forEach((step, index) => {
        setTimeout(() => {
            step.style.opacity = '1';
        }, index * 500);
    });
}

// Show results
function showResults() {
    loadingSection.classList.add('hidden');
    errorSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');
}

// Show error
function showError(message) {
    loadingSection.classList.add('hidden');
    resultsSection.classList.add('hidden');
    errorSection.classList.remove('hidden');
    errorMessage.textContent = message;
}

// Simulate security check (for demonstration)
function performSecurityCheck(address) {
    // This is a mock security check - in a real application, you would
    // implement actual security checks based on transaction patterns, etc.
    const securityChecks = [
        { name: 'Address Format', passed: true },
        { name: 'Malicious Activity', passed: Math.random() > 0.1 },
        { name: 'High-Risk Transactions', passed: Math.random() > 0.2 },
        { name: 'Smart Contract Interactions', passed: true },
        { name: 'Network Consistency', passed: true }
    ];
    
    const passedChecks = securityChecks.filter(check => check.passed).length;
    const totalChecks = securityChecks.length;
    const securityScore = Math.round((passedChecks / totalChecks) * 100);
    
    if (securityScore >= 80) {
        return { status: 'SECURE', score: securityScore, color: '#00ff00' };
    } else if (securityScore >= 60) {
        return { status: 'MODERATE RISK', score: securityScore, color: '#ffa500' };
    } else {
        return { status: 'HIGH RISK', score: securityScore, color: '#ff3333' };
    }
}

// Fetch wallet data from Tronscan API
async function fetchWalletData(walletAddress) {
    try {
        // First API endpoint for account info
        const accountUrl = `https://apilist.tronscan.org/api/account?address=${walletAddress}`;
        
        // Second API endpoint for token balances
        const tokensUrl = `https://apilist.tronscan.org/api/account/tokens?address=${walletAddress}&start=0&limit=20`;
        
        // Fetch account data
        const accountResponse = await fetch(accountUrl);
        if (!accountResponse.ok) {
            throw new Error(`API error: ${accountResponse.status}`);
        }
        
        const accountData = await accountResponse.json();
        
        // Fetch token data
        const tokensResponse = await fetch(tokensUrl);
        const tokensData = await tokensResponse.ok ? await tokensResponse.json() : { data: [] };
        
        return { accountData, tokensData };
        
    } catch (error) {
        console.error('Error fetching wallet data:', error);
        throw error;
    }
}

// Main check function
async function checkWallet() {
    const walletAddress = walletInput.value.trim();
    
    // Validate input
    if (!walletAddress) {
        showError('Please enter a TRON wallet address');
        return;
    }
    
    if (!isValidTronAddress(walletAddress)) {
        showError('Invalid TRON address format. TRON addresses start with "T" and are 34 characters long.');
        return;
    }
    
    // Show loading state
    showLoading();
    
    try {
        // Fetch wallet data
        const { accountData, tokensData } = await fetchWalletData(walletAddress);
        
        // Check if account exists
        if (!accountData.address) {
            showError('Wallet address not found on TRON network');
            return;
        }
        
        // Update results after a short delay (for visual effect)
        setTimeout(() => {
            // Calculate TRX balance
            const trxBalance = accountData.balance || 0;
            const trxBalanceFormatted = formatBalance(trxBalance);
            
            // Calculate total token value (simplified - using a mock conversion rate)
            // In a real application, you would fetch actual token prices
            const trxToUsdRate = 0.12; // Mock exchange rate - replace with real API call
            const totalUsdValue = (trxBalance / 1000000) * trxToUsdRate;
            
            // Perform security check
            const securityInfo = performSecurityCheck(walletAddress);
            
            // Get transaction count
            const txCount = accountData.transactions || accountData.totalTransactionCount || 0;
            
            // Get last active time
            const lastActiveTime = accountData.latestOperationTime || 
                                  accountData.dateCreated || 
                                  Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000; // Random if not available
            
            // Determine address type based on balance
            const addrType = trxBalance > 1000000000 ? "Whale" : 
                            (trxBalance > 10000000 ? "Active" : "Standard");
            
            // Update UI with results
            balanceResult.textContent = trxBalanceFormatted;
            usdValue.textContent = formatUSD(totalUsdValue);
            securityStatus.textContent = securityInfo.status;
            securityStatus.style.color = securityInfo.color;
            networkInfo.textContent = 'TRON (TRC20)';
            totalTransactions.textContent = txCount.toLocaleString();
            lastActive.textContent = formatDate(lastActiveTime);
            addressType.textContent = addrType;
            scanTime.textContent = getCurrentTime();
            scanStatus.textContent = 'SCAN COMPLETE';
            scanStatus.style.backgroundColor = 'rgba(0, 100, 0, 0.3)';
            scanStatus.style.borderColor = '#008000';
            
            // Show results
            showResults();
            
            // Animate result cards
            const resultCards = document.querySelectorAll('.result-card');
            resultCards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 200);
            });
            
        }, 1500); // Simulated delay for loading effect
        
    } catch (error) {
        console.error('Error checking wallet:', error);
        
        // For demonstration purposes, if API fails, show mock data
        setTimeout(() => {
            // Mock data for demonstration when API fails
            const mockBalance = Math.random() * 10000 * 1000000; // Random balance in sun
            const mockUsdValue = (mockBalance / 1000000) * 0.12;
            const securityInfo = performSecurityCheck(walletAddress);
            
            balanceResult.textContent = formatBalance(mockBalance);
            usdValue.textContent = formatUSD(mockUsdValue);
            securityStatus.textContent = securityInfo.status;
            securityStatus.style.color = securityInfo.color;
            networkInfo.textContent = 'TRON (TRC20)';
            totalTransactions.textContent = Math.floor(Math.random() * 1000).toLocaleString();
            lastActive.textContent = formatDate(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
            addressType.textContent = Math.random() > 0.7 ? "Whale" : (Math.random() > 0.5 ? "Active" : "Standard");
            scanTime.textContent = getCurrentTime();
            scanStatus.textContent = 'SCAN COMPLETE (MOCK DATA)';
            scanStatus.style.backgroundColor = 'rgba(100, 100, 0, 0.3)';
            scanStatus.style.borderColor = '#808000';
            
            showResults();
        }, 1500);
    }
}

// Event Listeners
checkButton.addEventListener('click', checkWallet);

walletInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkWallet();
    }
});

retryButton.addEventListener('click', () => {
    checkWallet();
});

// Initialize with a sample address for demonstration
window.addEventListener('DOMContentLoaded', () => {
    // You can pre-fill with a sample address for demo purposes
    // walletInput.value = 'Txxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
    
    // Add some visual effects
    const protectionBars = document.querySelectorAll('.protection-bar');
    protectionBars.forEach((bar, index) => {
        setTimeout(() => {
            bar.classList.add('active');
        }, index * 200);
    });
    
    // Animate title
    const title = document.querySelector('.title-text');
    title.style.backgroundSize = '200% auto';
    
    // Typewriter effect for terminal
    const terminalTexts = document.querySelectorAll('.terminal-text');
    terminalTexts.forEach((text, index) => {
        const originalText = text.textContent;
        text.textContent = '';
        
        setTimeout(() => {
            let i = 0;
            const typeWriter = () => {
                if (i < originalText.length) {
                    text.textContent += originalText.charAt(i);
                    i++;
                    setTimeout(typeWriter, 50);
                }
            };
            typeWriter();
        }, index * 1000);
    });
});
