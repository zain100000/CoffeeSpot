import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {theme} from '../../styles/theme';
import socketManager from '../../utils/customSocket/SocketManager';
import * as socketActions from '../../utils/customSocket/socketActions/SocketActions';

const Chat = ({route}) => {
  const {userId} = route.params;
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef(null);

  // Handle new chat creation
  const handleNewChat = data => {
    console.log('NEW_CHAT event:', data);
    if (data?.chatId) {
      setCurrentChatId(data.chatId);
      setMessages([data.initialMessage]);
      setIsLoading(false);
      // Get history for this new chat
      socketActions.getChatHistory({chatId: data.chatId});
    }
  };

  // Handle incoming messages
  const handleNewMessage = data => {
    console.log('NEW_MESSAGE event:', data);
    setMessages(prev => [...prev, data.message]);
  };

  // Handle chat history response
  const handleChatHistory = data => {
    console.log('CHAT_HISTORY event:', data);
    if (data?.messages) {
      setMessages(data.messages);
    }
    setIsLoading(false);
  };

  // Handle socket errors
  const handleError = error => {
    console.error('SOCKET_ERROR:', error);
    setIsLoading(false);
  };

  // Handle successful operations
  const handleSuccess = successData => {
    console.log('SOCKET_SUCCESS:', successData);
    if (successData.data?.chatId) {
      setCurrentChatId(successData.data.chatId);
      // Get history for existing chat
      socketActions.getChatHistory({chatId: successData.data.chatId});
    }
  };

  useEffect(() => {
    console.log('Initializing chat for user:', userId);

    const initializeSocket = () => {
      if (!socketManager.isConnected()) {
        console.log('Initializing socket connection...');
        socketManager.initialize();
      }

      socketRef.current = socketManager.socket;

      if (socketRef.current) {
        console.log('Socket connected, setting up listeners...');
        setIsConnected(true);

        // Setup all event listeners
        socketActions.listenToNewChat(handleNewChat);
        socketActions.listenToNewMessage(handleNewMessage);
        socketActions.listenToChatHistory(handleChatHistory);
        socketActions.listenToError(handleError);
        socketActions.listenToSuccess(handleSuccess);

        // Start chat session
        startChatSession();
      } else {
        console.error('Socket initialization failed');
        setIsLoading(false);
      }
    };

    const startChatSession = () => {
      console.log('Starting chat session...');
      socketActions.startChat({
        userId,
        initialMessage: 'Hello, I need help'
      });
    };

    initializeSocket();

    return () => {
      console.log('Cleaning up chat component...');
      // Remove all listeners
      socketActions.removeNewChatListener();
      socketActions.removeNewMessageListener();
      socketActions.removeChatHistoryListener();
      socketActions.removeErrorListener();
      socketActions.removeSuccessListener();
    };
  }, [userId]);

  const onSendMessage = () => {
    if (messageText.trim() && currentChatId && isConnected) {
      console.log('Sending message:', messageText);
      socketActions.sendMessage({
        chatId: currentChatId,
        text: messageText.trim(),
      });
      setMessageText('');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  if (!isConnected) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>Connection lost</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => window.location.reload()}>
          <Text style={styles.retryButtonText}>Reconnect</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Connection status bar */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {currentChatId ? `Chat ID: ${currentChatId}` : 'Starting new chat...'}
        </Text>
      </View>

      {/* Messages list */}
      <FlatList
        data={messages}
        keyExtractor={(item, index) => `${index}-${item.sentAt}`}
        renderItem={({item}) => (
          <View
            style={[
              styles.messageBubble,
              item.sender === 'USER' ? styles.userMessage : styles.adminMessage,
            ]}>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.messageTime}>
              {new Date(item.sentAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.messagesContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
          </View>
        }
      />

      {/* Message input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type your message..."
          placeholderTextColor="#999"
          editable={isConnected}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!isConnected || !messageText.trim()) && styles.disabledButton,
          ]}
          onPress={onSendMessage}
          disabled={!isConnected || !messageText.trim()}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statusBar: {
    padding: 10,
    backgroundColor: '#e0e0e0',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: theme.colors.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
  },
  messagesContainer: {
    padding: 10,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  adminMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECECEC',
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    paddingHorizontal: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Chat;