import User from "../models/usermodel.js";
import Message from "../models/messagemodel.js";
import { io } from "../lib/socket.js";
import { getReceiverSocketId } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";

export const getusersForSidebar = async(req, res) =>{
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id:{$ne: loggedInUserId}}).select("-password");

        res.status(200).json(filteredUsers);

    } catch (error) {
        console.log("Error in getusersForSidebar:", error.message);
        return res.status(500).json({message: "Server Error"});
        
    }

}

export const getmessages = async(req,res) =>{
    try {
        const {id:userToChatId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or:[
                {senderId: myId, receiverId: userToChatId},
                {senderId: userToChatId, receiverId: myId}
            ]
        });

        res.status(200).json(messages);

    } catch (error) {
        console.log("Error in getmessages:", error.message);
        return res.status(500).json({message: "Server Error"});
        
    }
}

export const sendMessages = async(req, res) => {
    try {
        const {name, message} = req.body;
        const {id: receiverId} = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            const uploadedResponse = await cloudinary.uploader.upload(image);// Upload image to Cloudinary and get the URL 
            imageUrl = uploadedResponse.secure_url;// Store the image URL in the database
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();
        
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessages:", error.message);
        return res.status(500).json({message: "Server Error"});
        
    }
 

}