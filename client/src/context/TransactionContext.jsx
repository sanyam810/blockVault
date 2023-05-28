import React,{useEffect,useState} from "react";

import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';


import { ethers } from 'ethers';

import {contractABI,contractAddress} from '../utils/constants';

export const TransactionContext=React.createContext();


//destructing ethereum from window
const {ethereum}=window;

const getEthereumContract=()=>{
    console.log("Getting contract");
    const provider=new Web3Provider(window.ethereum);
    const signer=provider.getSigner();
    const transactionContract=new Contract(contractAddress,contractABI,signer);

    console.log({
        provider,
        signer,
        transactionContract
    });

    return transactionContract;
}


export const TransactionProvider=({children})=>{
    const [currentAccount, setCurrentAccount] = useState('');
    const [formData,setFormData]=useState({addressTo: '',amount: '',keyword: '',message: ''});
    const [isLoading,setisLoading]=useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));
    const [transactions, setTransactions] = useState([]);

    const handleChange=(e,name)=>{
        setFormData((prevState)=>({...prevState,[name]: e.target.value }));
    }

    const getAllTransactions=async()=>{
        try{
            if(!ethereum)return alert("Please alert Metamask");
            const transactionContract=getEthereumContract();
            const availableTransactions=await transactionContract.getAllTransactions();
            

            const structuredTransactions=availableTransactions.map((transaction)=>({
                addressTo: transaction.receiver,
                addressFrom: transaction.sender,
                timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                keyword: transaction.keyword,
                amount: parseInt(transaction.amount._hex) / (10**18)
            }));

            setTransactions(structuredTransactions);
            console.log(structuredTransactions);
        }
        catch(error){
            console.log(error);
        }
    }

    const checkIfWalletIsConnected=async()=>{
        try{
            if(!ethereum)return alert("Please alert Metamask");

            const accounts=await ethereum.request({method:'eth_accounts'});

            if(accounts.length){
                setCurrentAccount(accounts[0]);
                getAllTransactions();
            }
            else{
                console.log('No accounts found');
            }

            console.log(accounts);
            }catch(error){
                console.log("Error");
                throw new Error("No ethereum object.")
            }
    } 



    const checkIfTransactionsExist=async()=>{
        try {
            const transactionContract=getEthereumContract();
            const transactionCount=await transactionContract.getTransactionCount();

            window.localStorage.setItem("transactionCount",transactionCount);
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object.");
        }
    }

    const connectWallet=async()=>{
        try{
            if(!ethereum)return alert("Please alert Metamask");
            const accounts=await ethereum.request({method:'eth_requestAccounts'});
            setCurrentAccount(accounts[0]);
        }catch(error){
            console.log("Error");
            throw new Error("No ethereum object.")
        }
    }

    const sendTransaction=async()=>{
        console.log("Sending transaction");
        try{
            if(!ethereum) return alert("Please install Metamask");
            const { addressTo, amount , keyword, message}= formData;
            const transactionContract=getEthereumContract();
            
            const parsedAmount=  ethers.utils.parseEther(amount);

            await ethereum.request({
                method:'eth_sendTransaction',
                params:[{
                    from: currentAccount,
                    to: addressTo,
                    gas: '0x5208',
                    value: parsedAmount._hex,
                }]
            });

            const transactionHash= await transactionContract.addToBlockchain(addressTo,parsedAmount,message,keyword);

            setisLoading(true);
            console.log(`Loading -${transactionHash.hash}`);
            await transactionHash.wait();
            setisLoading(false);
            console.log(`Succues -${transactionHash.hash}`);
            
            const transactionCount=await transactionContract.getTransactionCount();
            setTransactionCount(transactionCount.toNumber());

        }catch(error){
            console.log(error);
            
            throw new Error("No ethereum object.")
        }
    }

    useEffect(()=>{
        checkIfWalletIsConnected();
        checkIfTransactionsExist();
    },[]);

    return(
        <TransactionContext.Provider value={{connectWallet,currentAccount,formData,setFormData,handleChange,sendTransaction,transactions,isLoading}}>
            {children}
        </TransactionContext.Provider>
    );
}