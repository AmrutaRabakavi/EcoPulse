import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

const TAB_CONFIG = {
  Home: {
    label: 'Home',
    iconFocused: 'home',
    iconOutline: 'home-outline',
    emoji: '🏠',
  },
  Challenges: {
    label: 'Challenges',
    iconFocused: 'trophy',
    iconOutline: 'trophy-outline',
    emoji: '🎯',
  },
  Leaderboard: {
    label: 'Leaderboard',
    iconFocused: 'podium',
    iconOutline: 'podium-outline',
    emoji: '🏆',
  },
  Profile: {
    label: 'Profile',
    iconFocused: 'person',
    iconOutline: 'person-outline',
    emoji: '👤',
  },
};

export default function BottomNav({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.navBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const config = TAB_CONFIG[route.name] || {
            label: route.name,
            iconFocused: 'ellipse',
            iconOutline: 'ellipse-outline',
            emoji: '🌱',
          };

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel || config.label}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrapper, isFocused && styles.activeIconWrapper]}>
                <Ionicons
                  name={isFocused ? config.iconFocused : config.iconOutline}
                  size={22}
                  color={isFocused ? COLORS.primary : COLORS.secondaryText}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? COLORS.primary : COLORS.secondaryText },
                  isFocused && styles.activeTabLabel,
                ]}
              >
                {config.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrapper: {
    width: 40,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  activeIconWrapper: {
    backgroundColor: COLORS.lightGreen,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  activeTabLabel: {
    fontWeight: '700',
  },
});
