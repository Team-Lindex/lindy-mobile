import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Image,
} from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Hi there! I'm Lindy, your personal style assistant. How can I help you today?",
    isUser: false,
    timestamp: new Date(),
  },
  {
    id: 2,
    text: "I'm looking for a casual outfit for a weekend brunch with friends.",
    isUser: true,
    timestamp: new Date(),
  },
  {
    id: 3,
    text: "Sure! How about a pair of high-waisted jeans, a flowy blouse, and some cute sandals? I can show you some options from Lindex if you'd like.",
    isUser: false,
    timestamp: new Date(),
  },
  {
    id: 4,
    text: "Yes, please! That sounds perfect.",
    isUser: true,
    timestamp: new Date(),
  },
];

export default function LindyAIScreen() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: inputText,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setInputText('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lindy - Your digital stylist</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
        {messages.map((message) => (
          <View key={message.id} style={styles.messageWrapper}>
            {!message.isUser && (
              <Text style={styles.senderName}>Lindy</Text>
            )}
            {message.isUser && (
              <Text style={styles.senderNameUser}>Sophia</Text>
            )}
            <View style={styles.messageRow}>
              {!message.isUser && (
                <View style={styles.avatarContainer}>
                  <Image
                    source={require('@/assets/images/avatar2.png')}
                    style={styles.avatar}
                  />
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userMessage : styles.aiMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.isUser ? styles.userMessageText : styles.aiMessageText,
                  ]}
                >
                  {message.text}
                </Text>
              </View>
              {message.isUser && (
                <View style={styles.avatarContainer}>
                  <Image
                    source={require('@/assets/images/react-logo.png')}
                    style={styles.avatar}
                  />
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask Lindy..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity style={styles.attachButton}>
            <IconSymbol name="photo" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <IconSymbol name="arrow.up" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messageWrapper: {
    marginVertical: 10,
  },
  senderName: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    marginLeft: 50,
  },
  senderNameUser: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    textAlign: 'right',
    marginRight: 50,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  messageBubble: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    maxWidth: '80%',
  },
  aiMessage: {
    backgroundColor: '#f0f0f0',
    marginRight: 40,
  },
  userMessage: {
    backgroundColor: '#e53e3e',
    marginLeft: 40,
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  aiMessageText: {
    color: '#000',
  },
  userMessageText: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'flex-end',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
  },
  attachButton: {
    marginLeft: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
