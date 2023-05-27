import { Alchemy, Network } from 'alchemy-sdk';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom';

import Transaction from './components/transaction';

import './App.css';

const settings = {
  apiKey: 'qZlg7QfdqOwt7R60eOLj0gIyNpXV9kan',
  network: Network.ETH_MAINNET,
};

export const alchemy = new Alchemy(settings);

function App() {
  const [blockNumber, setBlockNumber] = useState();
  const [transactions, setTransactions] = useState([]);
  const [address, setAddress] = useState('');
  const [addressInfo, setAddressInfo] = useState([]);
  const [nftInfo, setNftInfo] = useState([]);

  async function getBlockNumber() {
    const number = await alchemy.core.getBlockNumber();
    setBlockNumber(number);
  }

  async function getTransactionReceipts() {
    const params = {
      blockNumber: "0x" + blockNumber?.toString(16)
    };
    setTransactions(await alchemy.core.getTransactionReceipts(params));
  }

  function TransactionList() {
    // console.log(transactions);
    const listItems = transactions?.receipts?.map((tx, index) => (
      <div key={index} style={{ border: '1px solid black', padding: '5px'}}>
        <Link to={`/transaction/${tx.transactionHash}`}>
          {tx.transactionHash}
        </Link>
      </div>
    ));
    return (
      <>
        <h3>Transaction :</h3>
        <ul>{listItems}</ul>
      </>
    );
  }

  async function searchAddress() {
    let addrNftInfo = await alchemy.nft.getNftsForOwner(address)
    // console.log(addrNftInfo);
    setImageNft(addrNftInfo)
    let addrInfo = await alchemy.core.getTokenBalances(address)
    // console.log(addrInfo);
    let addressInfoTemp = []
    for (const token of addrInfo.tokenBalances) {
      let balance = parseInt(token.tokenBalance, 16) * 10 ** -18;
      // console.log(balance);

      if (balance > 0.1) {
        const symbol = await getTokenMetadata(token.contractAddress);
        addressInfoTemp.push({ symbol: symbol, balance: balance });
      }
    }
    // console.log(addressInfoTemp);
    setAddressInfo(addressInfoTemp)
    // console.log(addressInfo);
  }

  async function getTokenMetadata(contractAddress) {
    try {
      let data = await alchemy.core.getTokenMetadata(contractAddress);
      // console.log(data.symbol);
      return data.symbol;
    } catch (error) {
      console.error(error);
      // Handle the error or throw a more specific error message
    }
  }

  async function setImageNft(addrNftInfo) {
    let nftImage = []
    for (const nfts of addrNftInfo.ownedNfts) {
      if (nfts.contract.name)
        nftImage.push(nfts.contract.name)
    }
    setNftInfo(nftImage)
    // console.log(nftImage);
  }


  useEffect(() => {
    getBlockNumber();
    if (blockNumber !== undefined) {
      getTransactionReceipts();
    }
  }, [blockNumber]);

  function Home() {
    return (
      <>
        <div>
          <TransactionList />
        </div>
      </>
    )
  }

  function AddressInfo() {
    const listToken = addressInfo?.map((token, i) => (
      <div key={i}>
        <h4>Symbol: {token.symbol}</h4>
        <h4 style={{ marginLeft: '5px' }}>Balance: {token.balance}</h4>
      </div>
    ))
    const listNft = nftInfo?.map((nft, i) => (
      <div key={i}>
        <h4>Name: {nft}</h4>
      </div>
    ))
    return (<>
      <h2>address info: {address}</h2>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {/* <div style={{ display: 'flex', flexDirection: 'row', width: '50%'}} >
          {listToken}
        </div> */}
        <div style={{ width: '50%', overflowY: 'scroll', height: '100px' }}>
          {addressInfo.length > 0 && (
            <>
              <div>Token :</div>
              {listToken}
            </>
          )}
        </div>
        <div style={{ width: '50%', overflowY: 'scroll', height: '100px' }}>
          {nftInfo.length > 0 && (
            <>
              <div>Nft :</div>
              {listNft}
            </>
          )}
        </div>
      </div>

    </>)
  }

  return (
    <Router>
      <div className="App">
        <Route exact path="/">
          <Redirect to="/home" />
        </Route>
        <h1>Block Number: {blockNumber}</h1>
        <input placeholder='address' value={address} onChange={(event) => { setAddress(event.target.value) }}></input>
        <button style={{ height: '20px', width: '50px', marginLeft: '5px' }} onClick={searchAddress}>search</button>
        <AddressInfo></AddressInfo>
        <Route path="/home" component={Home} />
        <Route path="/transaction/:transactionHash" component={Transaction} />
      </div>
    </Router>
  );
}

export default App;
