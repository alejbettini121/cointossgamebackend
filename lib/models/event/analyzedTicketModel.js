'use strict'

const mongoose = require('../../../config/dbConnection')
const mongoosePaginate = require('mongoose-paginate')
const Schema = mongoose.Schema

const analyzedTicketModel = new Schema({
  ticketID: {
    required: true,
    type: String
  },
  player: {
    required: true,
    type: String
  },
  betMask: {
    required: true,
    type: Boolean
  },
  betAmount: {
    required: true,
    type: String
  },
  winAmount: {
    required: true,
    type: String
  },
  betBlockNumber: {
    required: true,
    type: String
  },
  recordBlockNumber: {
    required: true,
    type: String
  },
  autoPlayed: {
    required: true,
    type: Boolean
  },
  autoRefunded: {
    required: true,
    type: Boolean
  },
  isPlayed: {
    required: true,
    type: Boolean
  },
  didRefund: {
    required: true,
    type: Boolean
  },
  isWinner: {
    required: true,
    type: Boolean
  },
  maskRes: {
    required: true,
    type: Boolean
  },
  jackpotRes: {
    required: true,
    type: String
  }
},
{
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

analyzedTicketModel.plugin(mongoosePaginate)
module.exports = mongoose.db.model('analyzedTicket', analyzedTicketModel)
