'use strict'

const mongoose = require('../../../config/dbConnection')
const mongoosePaginate = require('mongoose-paginate')
const Schema = mongoose.Schema

const finalResultSchema = new Schema({
  ticketID: {
    required: true,
    type: String
  },
  amount: {
    required: true,
    type: String
  },
  player: {
    required: true,
    type: String
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

finalResultSchema.plugin(mongoosePaginate)
module.exports = mongoose.db.model('finalResultEvent', finalResultSchema)
