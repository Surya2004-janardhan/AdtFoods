import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CustomNotification = ({ message, type, visible }) => {
  if (!visible || !message) return null;

  const getNotificationStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#E8F5E8',
          borderColor: '#4CAF50',
          iconColor: '#4CAF50',
          textColor: '#2E7D32',
          icon: 'check-circle'
        };
      case 'error':
        return {
          backgroundColor: '#FFEBEE',
          borderColor: '#F44336',
          iconColor: '#F44336',
          textColor: '#C62828',
          icon: 'alert-circle'
        };
      case 'info':
        return {
          backgroundColor: '#E3F2FD',
          borderColor: '#2196F3',
          iconColor: '#2196F3',
          textColor: '#1565C0',
          icon: 'information'
        };
      case 'warning':
        return {
          backgroundColor: '#FFF3E0',
          borderColor: '#FF9800',
          iconColor: '#FF9800',
          textColor: '#E65100',
          icon: 'alert'
        };
      default:
        return {
          backgroundColor: '#F5F5F5',
          borderColor: '#9E9E9E',
          iconColor: '#9E9E9E',
          textColor: '#424242',
          icon: 'information'
        };
    }
  };

  const notificationStyle = getNotificationStyle();

  return (
    <View style={[styles.container, {
      backgroundColor: notificationStyle.backgroundColor,
      borderLeftColor: notificationStyle.borderColor
    }]}>
      <MaterialCommunityIcons 
        name={notificationStyle.icon} 
        size={20} 
        color={notificationStyle.iconColor}
        style={styles.icon}
      />
      <Text style={[styles.message, { color: notificationStyle.textColor }]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Poppins',
    flex: 1,
    lineHeight: 20,
  },
});

export default CustomNotification;
