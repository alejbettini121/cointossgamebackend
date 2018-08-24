'use strict'

const mongoose = require('../../../config/dbConnection')
const mongoosePaginate = require('mongoose-paginate')
const Schema = mongoose.Schema

const wagerSchema = new Schema({
  ticketID: {
    required: true,
    type: String
  },
  betAmount: {
    required: true,
    type: String
  },
  betBlockNumber: {
    required: true,
    type: String
  },
  betMask: {
    required: true,
    type: Boolean
  },
  betPlayer: {
    required: true,
    type: String
  }
},
{
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

wagerSchema.plugin(mongoosePaginate)
module.exports = mongoose.db.model('wagerEvent', wagerSchema)
