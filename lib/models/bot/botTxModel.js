'use strict'

const mongoose = require('../../../config/dbConnection')
const mongoosePaginate = require('mongoose-paginate')
const Schema = mongoose.Schema

const botTxModel = new Schema({
  txType: {
    required: true,
    type: String
  },
  txHash: {
    required: true,
    type: String
  }
},
{
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

botTxModel.plugin(mongoosePaginate)
module.exports = mongoose.db.model('botTx', botTxModel)
