'use strict';

var Message = require("../models/message");
var MessageConstants = require("../models/messageConstants");
const messageEvent = require('../event/messageEvent');
const messagePromiseEvent = require('../event/messagePromiseEvent');
var winston = require('../config/winston');

class MessageService {


   send(sender, senderFullname, recipient, text, id_project, createdBy, attributes, type, metadata, language) {
       return this.create(sender, senderFullname, recipient, text, id_project, createdBy, MessageConstants.CHAT_MESSAGE_STATUS.SENDING, attributes, type, metadata, language);
   }

   upsert(id, sender, senderFullname, recipient, text, id_project, createdBy, status, attributes, type, metadata, language) {
       if (!id) {
           return this.create(sender, senderFullname, recipient, text, id_project, createdBy, status, attributes, type, metadata, language);
       } else {
            winston.debug("Message changeStatus", status);
            return this.changeStatus(id, status);
       }
   }
  create(sender, senderFullname, recipient, text, id_project, createdBy, status, attributes, type, metadata, language) {

    var that = this;
    return new Promise(function (resolve, reject) {

        if (!createdBy) {
            createdBy = sender;
          }
    
          var beforeMessage = {sender:sender, senderFullname:senderFullname, recipient:recipient
            , text:text, id_project:id_project, createdBy:createdBy, status:status, attributes:attributes,
             type:type, metadata:metadata,language:language};

          var messageToCreate = beforeMessage;

        //   messageEvent.emit('message.create.simple.before', {beforeMessage:beforeMessage});

       

          messagePromiseEvent.emit('message.create.simple.before', {beforeMessage:beforeMessage}).then(results => {
            winston.debug('message.create.simple.before', results);

            if (results && results.beforeMessage) {
                messageToCreate =  results.beforeMessage;
            }

                 // if (id_project) {

                    var newMessage = new Message({
                        sender: messageToCreate.sender,
                        senderFullname: messageToCreate.senderFullname,
                        recipient: messageToCreate.recipient,
                        type: messageToCreate.type,
                        // recipientFullname: recipientFullname,
                        text: messageToCreate.text,
                        id_project: messageToCreate.id_project,
                        createdBy: messageToCreate.createdBy,
                        updatedBy: messageToCreate.createdBy,
                        status : messageToCreate.status,
                        metadata: messageToCreate.metadata,
                        attributes: messageToCreate.attributes,
                        language: messageToCreate.language && messageToCreate.language.toUpperCase()
                    });
                    
                    // winston.debug("create new message", newMessage);
        
                    return newMessage.save(function(err, savedMessage) {
                        if (err) {
                            winston.error(err);
                            return reject(err);
                        }
                        winston.info("Message created", savedMessage.toObject());
        
                        messageEvent.emit('message.create.simple', savedMessage);
        
                        that.emitMessage(savedMessage);
                        // if (savedMessage.status === MessageConstants.CHAT_MESSAGE_STATUS.RECEIVED) {
                        //     messageEvent.emit('message.received.simple', savedMessage);
                        // }
        
                        // if (savedMessage.status === MessageConstants.CHAT_MESSAGE_STATUS.SENDING) {
                        //     messageEvent.emit('message.sending.simple', savedMessage);
                        // }
                        
        
                        return resolve(savedMessage);
                    });
        
    
                                        
          });

   
       

    });

  };  



  emitMessage(message) {
    if (message.status === MessageConstants.CHAT_MESSAGE_STATUS.RECEIVED) {
        messageEvent.emit('message.received.simple', message);
    }

    if (message.status === MessageConstants.CHAT_MESSAGE_STATUS.SENDING) {
        messageEvent.emit('message.sending.simple', message);
    }

    if (message.status === MessageConstants.CHAT_MESSAGE_STATUS.SENT) {
        messageEvent.emit('message.sent.simple', message);
    }

    if (message.status === MessageConstants.CHAT_MESSAGE_STATUS.DELIVERED) {
        messageEvent.emit('message.delivered.simple', message);
    }
  }

//   TODO must update also message.attributes from chat21
  changeStatus(message_id, newstatus) {
    var that = this;
    return new Promise(function (resolve, reject) {
     // winston.debug("request_id", request_id);
     // winston.debug("newstatus", newstatus);

        return Message.findByIdAndUpdate(message_id, {status: newstatus}, {new: true, upsert:false}, function(err, updatedMessage) {
            if (err) {
              winston.error(err);
              return reject(err);
            }
            messageEvent.emit('message.update.simple',updatedMessage);
           // winston.debug("updatedMessage", updatedMessage);

           that.emitMessage(updatedMessage);

            return resolve(updatedMessage);
          });
    });

  }



  getTranscriptByRequestId(requestid, id_project) {
    winston.debug("requestid", requestid);
    winston.debug("id_project", id_project);
    var that = this;
    return new Promise(function (resolve, reject) {
        return Message.find({"recipient": requestid, id_project: id_project}).sort({updatedAt: 'asc'}).exec(function(err, messages) { 
            if (err) {
                winston.error("Error getting the transcript", err);
                return reject(err);
            }
    
            winston.debug("messages", messages);

            if(!messages){
                return resolve(messages); 
            }

            

            var transcript = '';
            // messages.forEach(message => {
                for (var i = 0; i < messages.length; i++) {
                    var message = messages[i];
                    // winston.debug("message", message);
                    // winston.debug("message.createdAt", message.createdAt);
                    

                    transcript = transcript  +
                        message.createdAt.toLocaleString('it', { timeZone: 'UTC' }) +
                        ' ' + message.senderFullname + 
                        ': ' + message.text;

                        //not add line break for last message
                        if (i<messages.length-1){
                            transcript = transcript  + '\r\n';
                        }

                        // winston.debug("transcript", transcript);
                }
            // });

            // winston.debug("final transcript", transcript);

            // each message in messages
            // p [#{message.createdAt.toLocaleString('it', { timeZone: 'UTC' })}] #{message.senderFullname}: #{message.text}
            resolve(transcript);
    
        });
    });
  }








 
}


var messageService = new MessageService();


module.exports = messageService;