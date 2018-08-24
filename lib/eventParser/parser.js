'use strict'

const _ = require('underscore')
const Promise = require('bluebird')
const logger = require('../../config/logger')
const config = require('../../config/main')
const contractHelper = require('./contract/helper')
const ContractType = require('../models/contract/Types')
const AppParser = require('./appParser/AppParser')
// const FishTokenParser = require('./fishTokenParser/FishTokenParser')

async function createParsers () {
  const contracts = await contractHelper.getContracts([ContractType.App])

  const promises = _.map(contracts, (obj) => {
    return createParser(obj._doc)
  })

  return Promise.all(promises)
}

async function createParser (contract) {
  switch (contract.contract_type) {
    case ContractType.App:
      return new AppParser(contract.address, config.contract_included_block)
    default:
      logger.error('Not a valid contract type!')
      throw new Error('Not a valid contract type!')
  }
}

async function runInitialParser (){
  const parsers = await createParsers()

  const parseBlockPromises = _.map(parsers, (parser) => {
    console.log("run Parsers, parser=", parser.contractAddress);
    if (parser.contractAddress == config.app_contract_address)
      return parser.parseInitialBlocks()
    else
      return
  })

  await Promise.all(parseBlockPromises)
}

async function runParser () {
  // init script
  const parsers = await createParsers()

  const parseBlockPromises = _.map(parsers, (parser) => {
    console.log("run Parsers, parser=", parser.contractAddress);
    if (parser.contractAddress == config.app_contract_address)
      return parser.parseBlocks()
    else
      return
  })

  await Promise.all(parseBlockPromises)
}

module.exports = {
  runParser,
  runInitialParser
}
