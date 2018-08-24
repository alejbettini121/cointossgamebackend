module.exports = {
    environments: {
      test: 'test',
      ropsten: 'ropsten',
      mainnet: 'mainnet'
    },
    rpc_endpoint: {
      test: 'http://localhost:8545',
      ropsten: process.env.RPC_ENDPOINT || 'https://ropsten.infura.io/v3/18dfe3cb327e49aab39aa7fe0550337e',
      mainnet: process.env.RPC_ENDPOINT || 'https://mainnet.infura.io/v3/18dfe3cb327e49aab39aa7fe0550337e'
    },
    contract_included_block: 3871630,
    parsing_active: true,
    db_connection: {
      test: 'mongodb://localhost:27017/coinflipdb',
      ropsten: process.env.DB_CONNECTION || 'mongodb://localhost:27017/coinflipdb_ropsten',
      mainnet: process.env.DB_CONNECTION || 'mongodb://localhost:27017/coinflipdb'
    },
    app_contract_address: process.env.CONTRACT || '0x386a5e8a45147c9d1f9307e30087355c92df3c20',
    domain: process.env.API_DOMAIN || 'http://localhost:3030',
    last_endpoint_version: '0.0.1',
    version: 'v1',
    port: process.env.PORT || 3030
  }
  