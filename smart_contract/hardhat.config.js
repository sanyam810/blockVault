// https://eth-goerli.g.alchemy.com/v2/zFdXCdoIYPwPkPLSauUZhUQJ9y5rsfUz

require('@nomiclabs/hardhat-waffle');

module.exports={
  solidity:'0.8.0',
  networks:{
    sepolia:{
      url: 'https://eth-sepolia.g.alchemy.com/v2/FKhcheg2BnTO4wKSfXzaNWj6B1YyPmpA',
      accounts:['2b23be9c1bd64821e6d4ad7f208fd120ecafcab11001c0c530e16ce9730b2498']
    }
  }
}