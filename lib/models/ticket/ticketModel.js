'use strict'

const mongoose = require('../../../config/dbConnection')
const mongoosePaginate = require('mongoose-paginate')
const Schema = mongoose.Schema

const ticketModel = new Schema({
  ticketID: {
    required: true,
    type: String
  },
  ticketReveal: {
    required: true,
    type: String 
  }
},
{
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

ticketModel.plugin(mongoosePaginate)
module.exports = mongoose.db.model('TicketNums', ticketModel)
