import Web3 from 'web3';
import React from 'react'
import './App.css';
import Contract from 'web3-eth-contract'
import detectEthereumProvider from '@metamask/detect-provider'
import messengerArtifact from './abi/Messenger.json'


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {account: "Loading...",
      value: "",
      myContract: "",
      provider: "",
      result: [],
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  async handleSubmit(event) {
    event.preventDefault();
    await this.sendjs();
    await this.readjs();
    let elem = document.querySelector(".Messages");
    elem.scrollTop += elem.scrollHeight;
    this.setState({value: ""});
  }

  async componentDidMount() {
    try {
      let chainId = await window.ethereum.request({ method: 'eth_chainId' });
      this.chainIdValidator(chainId);
      let provider= await this.initWeb3();
      let account= await this.getAccount();
      window.ethereum.on('accountsChanged', (accounts) => {this.setState({account: accounts});});
      window.ethereum.on('chainChanged', (_chainId) => {this.chainIdValidator(_chainId)});
      let netId = "1280"
      let myContract= await this.initContractInstance(messengerArtifact, netId);
      await this.initMessages();
      let elem = document.getElementById('mesId');
      elem.scrollTop += elem.scrollHeight;
    } catch (error) {
      console.log('Smth went wrong:\n', error);
      alert("Установите или разблокируйте Metamask");
    }
  }

  async initWeb3(){
    try {
      let provider;
      if (typeof window.ethereum != 'undefined') {
        provider = await detectEthereumProvider();
        this.setState({provider: provider})
      } else {
        provider = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
        this.setState({provider: provider})
      }
      return provider;
    } catch (error) {
      alert("Установите или разблокируйте Metamask");
    }
  }

  async getAccount(){
    try {
      this.setState({account: await window.ethereum.request({method: "eth_requestAccounts"})});
    } catch (error) {
      if (error.code === 4001) {
        alert("Подключение к Metamask закрыто");
      } else {
        alert("Установите или разблокируйте Metamask");
      }
    }
  }

  async initContractInstance(artifact, netId) {
    Contract.setProvider(this.state.provider);
    let messengerContract = new Contract(artifact.abi, artifact.networks[netId].address);
    this.setState({myContract: messengerContract})
    await this.initMessages();
    return this.state.myContract;
  }

  chainIdValidator(_chainId){
    if (_chainId != 0x539){
      alert('Переключите сеть на MoonRabbit EVM');
    }
  }

  async initMessages(){
    let res = await this.state.myContract.methods.read().call({from: this.state.account[0]}, function(error, result){ console.log(error + ", " + result); return result;});
    this.setState({result: res})
  }

  async sendjs(){
    let date = new Date();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();
    if (date.getHours() < 10) {
      hour = "0" + date.getHours();
    }
    if (date.getMinutes() < 10) {
      minute = "0" + date.getMinutes();
    }
    if (date.getSeconds() < 10) {
      second = "0" + date.getSeconds();
    }
    let time = hour + ":" + minute + ":" + second;
    await this.state.myContract.methods.send(this.state.value, time).send({from: this.state.account[0]}, (error, transactionHash) => console.log(error, transactionHash))
  }

  async readjs(){
    let res = await this.state.myContract.methods.read().call({from: this.state.account[0]}, function(error, result){ console.log(error + ", " + result); return result;});
    this.setState({result: res})
  }

  render() {
    return (
        <div className="App">
          <h2>Messenger</h2>
          <h4>account: {this.state.account}</h4>
          <h3>Chat:</h3>
          <div className="Chat">
            <div className="Messages" id="mesId" onChange={this.handleChange}>
                {this.state.result.map(message =>
                    (message.account.toLowerCase() == this.state.account[0] ?
                    (<div className="messageText yourMsg">
                      <p className="acc">{message.account.slice(0,5)}...{message.account.slice(-4)}</p>
                      <p className="text">{message.text}</p>
                      <p className="time">{message.time}</p>
                    </div>) :
                    (<div className="messageText someoneMsg">
                      <p className="acc">{message.account.slice(0,5)}...{message.account.slice(-4)}</p>
                      <p className="text">{message.text}</p>
                      <p className="time">{message.time}</p>
                    </div>)
                ))}
            </div>
            <form className="SenderForm" onSubmit={this.handleSubmit}>
              <input type="text" placeholder="type..." className="msg" value={this.state.value} onChange={this.handleChange}/>
              <input type="submit" value="send" className="send"/>
            </form>
          </div>
        </div>);
  }
}

export default App;
