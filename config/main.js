module.exports = {
    environments: {
      test: 'test',
      ropsten: 'ropsten',
      mainnet: 'mainnet'
    },
    rpc_endpoint: {
      test: 'http://localhost:8545',
      ropsten: process.env.RPC_ENDPOINT || 'https://ropsten.infura.io/v3/18dfe3cb327e49aab39aa7fe0550337e',
      mainnet: process.env.RPC_ENDPOINT || 'https://mainnet.infura.io/Fi6gFcfwLWXX6YUOnke8'
    },
    contract_included_block: 6264663,
    parsing_active: true,
    db_connection: {
      test: 'mongodb://localhost:27017/coinflipdb',
      ropsten: process.env.DB_CONNECTION || 'mongodb://localhost:27017/coinflipdb_ropsten',
      mainnet: process.env.DB_CONNECTION || 'mongodb://localhost:27017/coinflipdb'
    },
    app_contract_address: process.env.CONTRACT || '0xE09B1AB8111C2729a76F16DE96bc86a7aF837928',
    domain: process.env.API_DOMAIN || 'http://localhost:3030',
    last_endpoint_version: '0.0.1',
    version: 'v1',
    port: process.env.PORT || 3030
  }
  