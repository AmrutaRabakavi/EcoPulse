import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { COLORS } from '../theme/colors';

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Gentle fade-in and scale animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Automatically navigate to Login after ~2.5 seconds
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, scaleAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo Image */}
        <View style={styles.logoWrapper}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Brand Header */}
        <View style={styles.titleRow}>
          <Text style={styles.leafIcon}>🌱</Text>
          <Text style={styles.brandTitle}>EcoPulse</Text>
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>
          Turning Green Intentions into Verified Reality
        </Text>

        {/* STEM Sustainability Subtitle Badge */}
        <View style={styles.stemBadge}>
          <Text style={styles.stemBadgeText}>
            SMART STEM SUSTAINABILITY ECOSYSTEM
          </Text>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerVersion}>EcoPulse Mobile • Phase 1</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  leafIcon: {
    fontSize: 28,
    marginRight: 8,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.secondaryText,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  stemBadge: {
    marginTop: 24,
    backgroundColor: COLORS.lightGreen,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  stemBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
  },
  footerVersion: {
    fontSize: 12,
    color: COLORS.secondaryText,
    fontWeight: '500',
  },
});
