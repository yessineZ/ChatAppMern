

import React, { useState } from 'react'
import useConversation from '../../zustand/useConversation';
import { toast } from 'react-hot-toast';
import axios from 'axios';
const useSendMessage = () => {
    const [loading,setLoading] = useState(false) ;
    const {messages,setMessages,selectedConversation}  = useConversation() ; 

    const sendMessage = async (message) => {
        setLoading(true) ;
        try {
            const res = await axios.post(`/api/messages/send/${selectedConversation._id}`, {message}) ;
            const data = res.data ;
            if(data.error) {
                throw new Error(data.error) ;
            }
            setMessages([...messages,data.message]) ;
            setLoading(false) ;
            console.log(messages) ; 
            console.log(data,res) ;
        } catch (error) {
            toast.error(error.message) ;
            setLoading(false) ;
        }
    }
    return {loading,sendMessage};

}

export default useSendMessage
