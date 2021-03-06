// Author : Rijul Luman
// Note : Miner will need wallet running, in order to have timely broadcast updates

'use strict';

require('rootpath')();
var path = require('path');
var async = require("async");
require("./AddMongoIndex.js");
/**
 * Required configs
 */
// config vars
global.Constants  =   require("config/constants.js");

// Extract from config
// Env mode
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
if (process.env.NODE_ENV == "production") {
  // require('newrelic');
}

var config                  =    require("config/config");
// listening port for Express/http server
const PORT                  =   config.express_port;
// mongo config
const MONGO_URL             = config.mongo_url;
const MONGO_COLL_TRANSACTION= config.mongo_coll_transaction;
const MONGO_COLL_BLOCK      = config.mongo_coll_block;
const MONGO_COLL_BALANCE    = config.mongo_coll_balance;
const MONGO_COLL_TARGET     = config.mongo_coll_target;

// redis config
const REDIS_MA_HOST        =   config.redis.MA.host;
const REDIS_MA_PORT        =   config.redis.MA.port;
const REDIS_SL_HOST        =   config.redis.SL.host;
const REDIS_SL_PORT        =   config.redis.SL.port;

/**
 * Express
 */
global.express        =   require('express');
global.app            =   express();

/**
 * Socket.io
 */
var server = require('http').Server(app);
global.BroadcastMaster = require('socket.io')(server);    // var io = 
global.OutgoingSockets = [];
server.listen(config.miner_io_port);

var blockController = require("app/controllers/block.server.controller");
var transactionController = require("app/controllers/transaction.server.controller");

// Assumption : We only connect to trusted nodes
// TODO : Remove untrusted nodes time-to-time via cron script
BroadcastMaster.on('connection', function (socket) {
  // socket.on(Constants.SOCKET_BROADCAST_BLOCK, blockController.acceptBroadcastBlock);
  // socket.on(Constants.SOCKET_BROADCAST_TRANSACTION, transactionController.acceptBroadcastTransaction);
  socket.on(Constants.SOCKET_GET_LATEST_BLOCK_HASHES, function(requestData){
    blockController.sendLatestBlocks(requestData, socket);
  });
  socket.on(Constants.SOCKET_GET_LATEST_BLOCK_REPLY, function(responseData){
    blockController.receiveLatestBlocks(responseData, socket);
  });
  // console.log("io.sockets.connected: ", Object.keys(BroadcastMaster.sockets.connected));
  // console.log("io.engine.clientsCount: ", BroadcastMaster.engine.clientsCount); // Works !
});

// Make connectiosn to some default nodes
var ioc = require('socket.io-client');
config.default_broadcast_sockets.forEach(function(url){
  var socket = ioc.connect(url);
  // socket.on(Constants.SOCKET_BROADCAST_BLOCK, blockController.acceptBroadcastBlock);
  // socket.on(Constants.SOCKET_BROADCAST_TRANSACTION, transactionController.acceptBroadcastTransaction);
  socket.on(Constants.SOCKET_GET_LATEST_BLOCK_HASHES, function(requestData){
    blockController.sendLatestBlocks(requestData, socket);
  });
  socket.on(Constants.SOCKET_GET_LATEST_BLOCK_REPLY, function(responseData){
    blockController.receiveLatestBlocks(responseData, socket);
  });
  OutgoingSockets.push(socket);
});


/**
 * Redis
 * Setting & Configurations
 */
var redis           =   require('redis');  
global.RedisStoreMA =   redis.createClient(REDIS_MA_PORT,REDIS_MA_HOST,{no_ready_check:true});
global.RedisStoreSL =   redis.createClient(REDIS_SL_PORT,REDIS_SL_HOST,{no_ready_check:true});

// on connection error
RedisStoreMA.on("error", function (err) {
  console.log("Redis Master Connection Error - ", err);
  throw err;
});
RedisStoreSL.on("error", function (err) {
  console.log("Redis Slave Connection Error - ", err);
  throw err;
});
//redis.debug_mode = true;

/**
 * Other Required Module
 */
// Common functions
global.CommonFunctions    =   require('app/controllers/common');
// For Handling Error Codes
global.ErrorCodeHandler   =   require('app/handler/errorCode');
// Redis Handler
global.RedisHandler       =   require('app/handler/redis');
// Mongo Handler
global.MongoHandler       =   require('app/handler/mongo');


/**
  * Mongo DB
*/

var MongoClient         =   require('mongodb').MongoClient;
global.ObjectId         =   require('mongodb').ObjectID;

global.mongoConnection        =   null;
global.BlockCollection        =   null;
global.BalanceCollection      =   null;
global.TargetCollection       =   null;

MongoClient.connect(MONGO_URL, function(err, db) {  
  // on error
  if(err) {
    console.log("Mongo Connection Error - ", err);
    throw err;
  }

  //console.log(db.serverConfig.connections().length);
  //console.log(db.serverConfig);
  
  // save mongo connection
  mongoConnection       =   db;
  
  // set collection
  BlockCollection          = mongoConnection.collection(MONGO_COLL_BLOCK);
  BalanceCollection        = mongoConnection.collection(MONGO_COLL_BALANCE);
  TargetCollection         = mongoConnection.collection(MONGO_COLL_TARGET);

  // mongo db started
  console.log('Mongo DB Started');
  setTimeout(function () {          // TODO : Need to handle in a better way (wait till blockchain update complete before proceeding, as blockchain update may take hours/days to update for a big blockchain)
    MongoHandler.updateBlockchain();
    // TODO : Handle Balance and Target Table maintainance effeciently
    BalanceCollection.remove({} );
    TargetCollection.remove( {} );
    setTimeout(function () {
      MongoHandler.setAllBlockTargets(function(){});
      MongoHandler.setAllBlockBalances(function(){})
    }, 2000);   
  }, 5000);
  // TODO : Add Validate existing blockchain function here
});

// Add Routes
// For APIs
// Globbing routing files
config.getGlobbedFiles('app/routes/**/*.js').forEach(function(routePath) {
    require(path.resolve(routePath))(app);
});


var loopArray = [];
for(var i = 0; i < 5000; i++){
    loopArray.push(i);
}

var mineBlocks = function(user){        // May fail in rare cases, create an auto restart instance while starting the miner
    async.eachSeries(loopArray, function(index, cb){
        blockController.createBlock(user, cb);
    }, function(err){
        mineBlocks(user);
    });
};

// Call the block creation function indefinitely
// Set time out : Allow Mongo and Redis establish connections
setTimeout(function () {
    RedisHandler.getUserDetails(function(err, userData){
        if(!userData){
            console.log("User for Miner not Logged in");
        }
        else{
            mineBlocks(userData);
        }
    });
    
}, 15000);
