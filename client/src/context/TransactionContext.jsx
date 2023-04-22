import React,{useEffect,useState} from "react";

import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';

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
}


export const TransactionProvider=({children})=>{
    const [currentAccount, setCurrentAccount] = useState('');
    const [formData,setFormData]=useState({addressTo: '',amount: '',keyword: '',message: ''});

    const handleChange=(e,name)=>{
        setFormData((prevState)=>({...prevState,[name]: e.target.value }));
    }

    const checkIfWalletIsConnected=async()=>{
        try{
            if(!ethereum)return alert("Please alert Metamask");

            const accounts=await ethereum.request({method:'eth_accounts'});

            if(accounts.length){
                setCurrentAccount(accounts[0]);
                //getAllTransactions();
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
            getEthereumContract();
        }catch(error){
            console.log(error);
            
            throw new Error("No ethereum object.")
        }
    }

    useEffect(()=>{
        checkIfWalletIsConnected();
    },[]);

    return(
        <TransactionContext.Provider value={{connectWallet,currentAccount,formData,setFormData,handleChange,sendTransaction}}>
            {children}
        </TransactionContext.Provider>
    );
}