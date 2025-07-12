import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

import {theme} from '../../styles/theme';
import socketManager from '../../utils/customSocket/SocketManager';
import * as socketActions from '../../utils/customSocket/socketActions/SocketActions';
import Header from '../../utils/customComponents/customHeader/Header';
import LeftIcon from '../../assets/icons/chevron-left.png';
import {globalStyles} from '../../styles/globalStyles';
import InputField from '../../utils/customComponents/customInputField/InputField';
import Loader from '../../utils/customComponents/customLoader/Loader';

const {width, height} = Dimensions.get('screen');

const Chat = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {userId} = route.params;

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const socketRef = useRef(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Animate "No messages" view when empty
  useEffect(() => {
    if (!isLoading && messages.length === 0) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: -10,
              duration: 500,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 500,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      bounceAnim.setValue(0);
    }
  }, [messages, isLoading]);

  // Handles NEW_CHAT event
  const handleNewChat = data => {
    if (data?.chatId) {
      setCurrentChatId(data.chatId);

      const initial = data.initialMessage;
      if (initial?.sender === 'SUPERADMIN') {
        setMessages([initial]);
      } else {
        setMessages([]);
      }

      setIsLoading(false);
      socketActions.getChatHistory({chatId: data.chatId});
    }
  };

  // Handles NEW_MESSAGE event
  const handleNewMessage = data => {
    setMessages(prev => [...prev, data.message]);
  };

  // Handles CHAT_HISTORY event
  const handleChatHistory = data => {
    if (data?.messages) {
      const filteredMessages = data.messages.filter(
        (msg, index) => !(index === 0 && msg.sender === 'USER'),
      );
      setMessages(filteredMessages);
    }
    setIsLoading(false);
  };

  const handleError = () => setIsLoading(false);

  const handleSuccess = successData => {
    if (successData.data?.chatId) {
      setCurrentChatId(successData.data.chatId);
      socketActions.getChatHistory({chatId: successData.data.chatId});
    }
  };

  useEffect(() => {
    const initializeSocket = () => {
      if (!socketManager.isConnected()) {
        socketManager.initialize();
      }

      socketRef.current = socketManager.socket;

      if (socketRef.current) {
        setIsConnected(true);
        socketActions.listenToNewChat(handleNewChat);
        socketActions.listenToNewMessage(handleNewMessage);
        socketActions.listenToChatHistory(handleChatHistory);
        socketActions.listenToError(handleError);
        socketActions.listenToSuccess(handleSuccess);
        startChatSession();
      } else {
        setIsLoading(false);
      }
    };

    const startChatSession = () => {
      socketActions.startChat({
        userId,
        initialMessage: 'Hello, I need help',
      });
    };

    initializeSocket();

    return () => {
      socketActions.removeNewChatListener();
      socketActions.removeNewMessageListener();
      socketActions.removeChatHistoryListener();
      socketActions.removeErrorListener();
      socketActions.removeSuccessListener();
    };
  }, [userId]);

  const onSendMessage = () => {
    if (messageText.trim() && currentChatId && isConnected) {
      socketActions.sendMessage({
        chatId: currentChatId,
        text: messageText.trim(),
      });
      setMessageText('');
    }
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.tertiary]}
      style={styles.gradientContainer}>
      <View style={globalStyles.container}>
        <Header
          logo={require('../../assets/splashScreen/splash-logo.png')}
          title="Customer Care"
          leftIcon={LeftIcon}
          onPressLeft={() => navigation.goBack()}
        />

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <Loader />
          </View>
        ) : messages.length > 0 ? (
          <FlatList
            data={messages}
            keyExtractor={(item, index) => `${index}-${item.sentAt}`}
            renderItem={({item}) => (
              <View
                style={[
                  styles.messageBubble,
                  item.sender === 'USER'
                    ? styles.userMessage
                    : styles.adminMessage,
                ]}>
                <Text
                  style={
                    item.sender === 'USER'
                      ? styles.userMessageText
                      : styles.adminMessageText
                  }>
                  {item.text}
                </Text>

                <Text style={styles.messageTime}>
                  {new Date(item.sentAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            )}
            contentContainerStyle={styles.messagesContainer}
          />
        ) : (
          <Animated.View
            style={[
              styles.emptyContainer,
              {
                opacity: fadeAnim,
                transform: [{translateY: bounceAnim}],
              },
            ]}>
            <Feather
              name="message-circle"
              size={width * 0.24}
              color={theme.colors.tertiary}
            />
            <Text style={styles.emptyText}>No messages yet</Text>
          </Animated.View>
        )}

        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <InputField
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Type a message"
              placeholderTextColor={theme.colors.gray}
              editable={isConnected}
              leftIcon={
                <Feather
                  name={'message-circle'}
                  size={width * 0.044}
                  color={theme.colors.primary}
                />
              }
            />
          </View>

          <TouchableOpacity
            style={[styles.sendButton, !isConnected || !messageText.trim()]}
            onPress={onSendMessage}
            disabled={!isConnected || !messageText.trim()}>
            <FontAwesome6
              name="paper-plane"
              size={width * 0.06}
              color={theme.colors.white}
            />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

export default Chat;

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },

  messagesContainer: {
    flexGrow: 1,
    padding: height * 0.02,
  },

  messageBubble: {
    maxWidth: width * 0.8,
    padding: height * 0.02,
    borderRadius: theme.borderRadius.large,
    marginBottom: height * 0.02,
  },

  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 0,
  },

  adminMessage: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.white,
    borderBottomLeftRadius: 0,
  },

  userMessageText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.poppins.regular,
    color: theme.colors.white,
  },

  adminMessageText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.poppins.regular,
    color: theme.colors.dark,
  },

  messageTime: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.poppins.bold,
    color: theme.colors.gray,
    alignSelf: 'flex-end',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.gap(1),
  },

  emptyText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.poppins.semiBold,
    color: theme.colors.tertiary,
    marginTop: height * 0.02,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: height * 0.01,
    borderTopWidth: 2,
    borderTopColor: 'rgba(219, 166, 96, 1)',
    backgroundColor: 'rgba(236, 193, 136, 0.8)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  inputContainer: {
    flex: 1,
    marginRight: width * 0.02,
  },

  input: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.poppins.semiBold,
    color: theme.colors.dark,
    borderRadius: theme.borderRadius.circle,
  },

  sendButton: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: theme.borderRadius.circle,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
