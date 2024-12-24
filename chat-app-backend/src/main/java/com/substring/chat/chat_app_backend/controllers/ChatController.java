package com.substring.chat.chat_app_backend.controllers;

import com.substring.chat.chat_app_backend.entities.Message;
import com.substring.chat.chat_app_backend.entities.Room;
import com.substring.chat.chat_app_backend.payload.MessageRequest;
import com.substring.chat.chat_app_backend.repositories.RoomRepository;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDateTime;

@Controller
@CrossOrigin("http://localhost:5173")
public class ChatController {

    private RoomRepository roomRepository;

    public ChatController(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    //for sending and receiving messages
    @MessageMapping("/sendMessage/{roomId}") //messages come to this "/sendMessage/{roomId}", @MessageMapping listens for incoming WebSocket messages
    @SendTo("/topic/room/{roomId}")     //@send used to broadcast, messages goes to "/topic/room/{roomId}", "/topic/room/{roomId}" listens on client side for messages
//    @DestinationVariable String roomId: This extracts the roomId from the WebSocket message URL (e.g., /sendMessage/{roomId}).
//    @RequestBody MessageRequest request: This is the actual message content received in the request body (e.g., content, sender, roomId).
//    MessageRequest model to keep received data from client, used just as receiving container then used Message object to broadcast it
    public Message sendMessage(
            @DestinationVariable String roomId,
            @RequestBody MessageRequest request     //MessageRequest as container to receive the message object from the client
    ) {
        Room room = roomRepository.findByRoomId(request.getRoomId());  //retrieving data (object) from room collection based on roomId
        Message message = new Message();  //Message model to set the data to message object so it can be broadcast to channel "/topic/room/{roomId}"
        message.setContent(request.getContent());   //retrieving data from MessageRequest and putting in Message model
        message.setSender(request.getSender());
        message.setTimeStamp(LocalDateTime.now());  //this is live due to which message time is updating on chat
        if(room != null) {
            room.getMessages().add(message); //adding message to existing message list of particular room
            roomRepository.save(room);
        }
        else {
               throw new RuntimeException("room not found!"); //if room not found throw error
        }
        return  message; //as return type is Message
    }
}

/* flow of messages
(client) http://localhost:3000/chat ---> (server) /app/sendMessage/{roomId} ---> /topic/room/{roomId} (listening on client side)
*/