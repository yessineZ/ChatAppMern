import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId } from "../socket/socket.js";
import { io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
    try {
        const receiverId  = req.params.id;
        
        const { message } = req.body;
        const senderId = req.user._id;
        console.log(req.user);
        console.log(receiverId, message, senderId);

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
            conversation = new Conversation({
                participants: [senderId, receiverId]
            });
        
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            message
        });


         
        
        if (newMessage) {
            conversation.messages.push(newMessage._id); // Assuming you store message IDs in the conversation
        }

        //SOCKT.IO

        const receiverSocketId = getReceiverSocketId(receiverId) ;
        if(receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }


        //Promise.all will do all the promises parallel 

        await Promise.all([conversation.save() , newMessage.save()]) ;

        res.status(201).json({ message: newMessage , conversation : conversation });

    } catch (error) {
        console.error("Error in sending message controller:", error.message);
        res.status(500).send({ error: "Failed to send message" });
    }
};



export const getMessages = async (req , res) => {
    
    try {
        const userToChatId = req.params.id;
        const senderId = req.user._id ; 
        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] }
        }).populate("messages") ;
        if(!conversation) {
            return res.status(200).json({ message: "No conversation found"}) ;  //404 Not Found  || 401 Unauthorized
        }
        const messages = conversation.messages ;
        res.status(200).json({conversation : messages}) ; 

 
    }catch(error) {
        console.error("Error in get messages controller:", error.message);
        res.status(500).send({ error: "Failed to get messages" });
    }
}