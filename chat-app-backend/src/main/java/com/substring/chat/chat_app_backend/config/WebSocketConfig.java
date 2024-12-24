package com.substring.chat.chat_app_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker //routes messages to server
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/chat")   //client subscribe to "/chat" channel, connection establishment
                .setAllowedOrigins("http://localhost:5173")
                .withSockJS();
//        in client browser: http://localhost:8080/chat to access the channel/group
//        chat endpoint par connection apka establish hoga
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) { //routes messages
        config.enableSimpleBroker("/topic"); //server routes messages to address where "/topic" is prefix: /topic/messages

        config.setApplicationDestinationPrefixes("/app"); //the messages comes to "/app" prefix is handled by server using the method defined in ChatController.java
        //server-side: @messagingMapping("/sendMessage/{roomId}")
        //app/sendMessage/{roomId}
    }
}
