import React, { useEffect, useRef, useState } from "react";
import { MdAttachFile, MdSend } from "react-icons/md";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import { baseURL } from "../config/AxiosHelper";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import toast from "react-hot-toast";
import { getMessages } from "../services/RoomService";
import { timeAgo } from "../config/helper";


const ChatPage = () => {

    const { roomId, currentUser, connected, setRoomId, setCurrentUser, setConnected } = useChatContext();

    // console.log(roomId);
    // console.log(currentUser);
    // console.log(connected);

    const navigate = useNavigate();
    useEffect(() => {
        if (!connected) {
            navigate('/');
        }
    }, [roomId, currentUser, connected]);


    // Dummy messages
    // const [messages, setMessages] = useState([
    //     {
    //         content: "Hello ?",
    //         sender: "Joker",
    //     },
    //     {
    //         content: "Hello ?",
    //         sender: "Batman",
    //     },
    //     {
    //         content: "Hello ?",
    //         sender: "Ironman",
    //     },
    // ]);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const inputRef = useRef(null);
    const chatBoxRef = useRef(null);
    const [stompClient, setStompClient] = useState(null);
    // const [roomId, setRoomId] = useState("");
    // const [currentUser] = useState("Joker"); 


    // Page init:
    // messages ko load karne honga
    useEffect(() => {
        async function loadMessages() {
            try {
                const messages = await getMessages(roomId);
                console.log(messages);
                setMessages(messages);
            } catch (error) {}
        }

        if (connected) {
            loadMessages();
        }
        
    }, []);

    // Scroll down
    useEffect(() => {
        // console.log("chaTboxFef value", chatBoxRef);
        if (chatBoxRef.current) {
            chatBoxRef.current.scroll({
                top: chatBoxRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    // stompClient ko init karne honga
    // Subscribe
    useEffect(() => {
        const connectWebSocket = () => {

            // SockJS
            const sock = new SockJS(`${baseURL}/chat`);

            // STOMP Client
            const client = Stomp.over(sock);

            client.connect({}, () => {  // Connection establish with the server "http:/localhost:8080/chat"
                console.log("Hello, Sir!");
                setStompClient(client);
                toast.success("connected");
                client.subscribe(`/topic/room/${roomId}`, (message) => {
                    console.log(message);
                    console.log("inside sbscribe");
                    const newMessage = JSON.parse(message.body);
                    setMessages((prev) => [...prev, newMessage]);
                    //rest of the work after success receiving the message
                });
            });
        }

        if (connected) {
            connectWebSocket();
        }

    }, [roomId]);


    // Send messsage handle
    const sendMessage = async () => {
        if (stompClient && connected && input.trim()) {
            console.log(input);

            const message = {
                sender: currentUser,
                content: input,
                roomId: roomId,
            }

            stompClient.send(`/app/sendMessage/${roomId}`, {}, JSON.stringify(message));
            setInput("");
        }
    }


    // Logout
    function handleLogout() {
        stompClient.disconnect();
        setConnected(false);
        setRoomId("");
        setCurrentUser("");
        navigate("/");
    }


    return (
        <div className="">
            {/* this is a header portion */}
            <header className="dark:border-gray-700 h-20 fixed w-full border dark:bg-gray-900 py-5 shadow flex justify-around items-center">
                {/* room name container */}
                <div>
                    <h1 className="text-xl font-semibold self-start">
                        Room: <span>{roomId}</span>
                    </h1>
                </div>
                {/* username container */}
                <div>
                    <h1 className="text-xl font-semibold">
                        User: <span>{currentUser}</span>
                    </h1>
                </div>
                {/* button: leave room */}
                <div>
                    <button onClick={handleLogout} className="dark:bg-red-500 dark:hover:bg-red-700 px-3 py-2 rounded-full">Leave Room</button>
                </div>
            </header>

            {/* message display area */}
            <main ref={chatBoxRef} className="py-20 px-20 w-2/3 dark:bg-slate-600 mx-auto h-screen overflow-auto">
                {/* <div className="message_container border">  <h1>Hello</h1>.....</div> */}

                {
                    messages.map((message, index) => (
                        // <div key={index} className={"flex " + (message.sender === currentUser ? 'justify-end' : 'justify-start')}> <--this using conctnatn,below using `${}` tmplt litrls
                        <div key={index} className={`flex ${message.sender === currentUser ? 'justify-end' : 'jsutify-start'}`}>
                            <div className={`my-2 ${message.sender === currentUser ? 'bg-green-800' : 'bg-gray-800'} p-2 max-w-xs rounded`}>
                                <div className="flex flex-row gap-2">
                                    <img className="h-10 w-10" src={"https://avatar.iran.liara.run/public/43"} alt="" />
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-bold">{message.sender}</p>
                                        <p>{message.content}</p>
                                        <p className="text-xs text-gray-400">{timeAgo(message.timeStamp)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </main>


            {/* input message container */}
            <div className="border fixed bottom-4 w-full h-16">
                <div className="h-full pr-10 gap-4 flex items-center justify-between rounded-full border w-1/2 mx-auto dark:bg-gray-900">
                    <input
                        value={input}
                        onChange={(e) => { setInput(e.target.value) }}
                        onKeyDown={(e) => {
                            console.log("keyDown", e);
                            if (e.key === "Enter") {
                                sendMessage();
                            }
                        }}
                        type="text"
                        placeholder="Type your message here..."
                        className="w-full dark:border-gray-600 dark:bg-gray-800 px-5 py-2 rounded-full h-full focus:outline-none" />
                    <div className="flex gap-1">
                        <button className="dark:bg-purple-600 h-10 w-10 flex justify-center items-center rounded-full">
                            <MdAttachFile size={20} />
                        </button>
                        <button onClick={sendMessage} className="dark:bg-green-600 h-10 w-10 flex justify-center items-center rounded-full">
                            <MdSend size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatPage;


// fixed w-full <--use together, fixed means "position: fixed"
// absolute/fixed bottom-0 <--to place in bottom
// right-0 <--to place in right side
// left-0 <--to place in left side

/*
two ways to make element center
1: margin: 200px auto; <--left/right auto
2: display: flex; justify-content: center; align-items: center; height: 100vh;
    always make 2 divs as the child will be centered, the parent one is flex 
*/


/*
use "border" in style to debug css 
*/

/*
setDetail({
    ...detail,
    [event.target.name]: event.target.value,
});

both are different

setMessages((prev) => [...prev, newMessage]);
*/