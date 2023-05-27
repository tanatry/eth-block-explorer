import { React, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { alchemy } from '../App'

const Transaction = () => {
    const { transactionHash } = useParams();
    const [txDetail, setTxDetail] = useState('')
    async function getBlockWithTransactions() {
        let response = await alchemy.core.getTransactionReceipt(transactionHash)
        setTxDetail(response)
    }

    useEffect(() => {
        getBlockWithTransactions()
    }, [transactionHash])

    return (
        <div>
            <h1>Transaction Details</h1>
            <p>Transaction Hash: {transactionHash}</p>
            {txDetail && (
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <h4 style={{width: '50%'}}>from: {txDetail.from}</h4>
                    <h4 style={{width: '50%'}}>to: {txDetail.to}</h4>
                </div>
            )}
        </div>
    );
};

export default Transaction;
