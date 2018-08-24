'use strict'

const config = require('../config/main')
const contractHelper = require('./eventParser/contract/helper')
const ContractType = require('./models/contract/Types')

const parser = require('./eventParser/parser')
const logger = require('../config/logger')

async function init () {
  try {
    await contractHelper.addContract(config.app_contract_address, ContractType.App, config.contract_included_block, false, Number.MAX_SAFE_INTEGER)
    parser.runInitialParser().then((result, error) => {
      if (error) {
        logger.error(error)
      } else {
        logger.info('Parsed data successfully ' + new Date().toTimeString())
      }
    })
    return 'Data initialized successfully!'
  } catch (err) {
    throw err
  }
}

module.exports = {
  init
}
