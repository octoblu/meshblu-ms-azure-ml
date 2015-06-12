'use strict';
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('meshblu-microsoft-ml');
var request = require('request');

var MESSAGE_SCHEMA = {
  type: 'object',
  properties: {
    Inputs: {
      type: 'object',
      required: true
    }
  }
};

var OPTIONS_SCHEMA = {
  type: 'object',
  properties: {
      endpointUrl: {
      type: 'string',
      required: true
    },
    apiKey : {
      type : 'string',
      required: true,
      format: 'password'
    }
  }
};

function Plugin(){
  this.options = {
    endPointUrl : 'http://www.example.com',
    apiKey : ''
  };
  this.messageSchema = MESSAGE_SCHEMA;
  this.optionsSchema = OPTIONS_SCHEMA;
  return this;
}
util.inherits(Plugin, EventEmitter);

Plugin.prototype.onMessage = function(message){
  var self = this;
  var payload = message.payload;
  if(payload && payload.Inputs){
    request({
      method : 'POST',
      uri : self.options.endpointUrl,
      json: true,
      auth : {
        bearer : self.options.apiKey
      },
      header: {
        "Content-Type": "application/json",
        "Content-Length": JSON.stringify(payload.Inputs).length,
        "Accept": "application/json"
      },
      body: payload.Inputs
    }, function(error, response, body){
      debug('After web service');
      debug(response);
      debug(body);

      if(error){
         self.emit('error', error);
      }
      self.emit('data', body);
    });
  }
};

Plugin.prototype.onConfig = function(device){
  this.setOptions(device.options||{});
};

Plugin.prototype.setOptions = function(options){
  this.options = options;
};

module.exports = {
  messageSchema: MESSAGE_SCHEMA,
  optionsSchema: OPTIONS_SCHEMA,
  Plugin: Plugin
};
