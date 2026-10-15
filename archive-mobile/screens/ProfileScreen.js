import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { user } from '../data/mockData';
import StatCard from '../components/StatCard';

export default function ProfileScreen({ navigation }) {
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out of EcoPulse?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // Local logout: navigate back to Login and reset stack
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Title */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>👤 Profile</Text>
        </View>

        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AR</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>🌿 Eco Explorer • Level {user.level}</Text>
          </View>
        </View>

        {/* Statistics Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sustainability Statistics</Text>
        </View>

        <View style={styles.statsGrid}>
          {/* Stat 1: Eco Points */}
          <View style={styles.statBox}>
            <View style={styles.statIconCircle}>
              <Text style={styles.statEmoji}>🌱</Text>
            </View>
            <Text style={styles.statValue}>{user.ecoPoints.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Eco Points</Text>
          </View>

          {/* Stat 2: Current Level */}
          <View style={styles.statBox}>
            <View style={styles.statIconCircle}>
              <Text style={styles.statEmoji}>⭐</Text>
            </View>
            <Text style={styles.statValue}>Level {user.level}</Text>
            <Text style={styles.statLabel}>Current Level</Text>
          </View>

          {/* Stat 3: Completed Challenges */}
          <View style={styles.statBox}>
            <View style={styles.statIconCircle}>
              <Text style={styles.statEmoji}>✅</Text>
            </View>
            <Text style={styles.statValue}>{user.completedChallenges}</Text>
            <Text style={styles.statLabel}>Completed Challenges</Text>
          </View>

          {/* Stat 4: Carbon Saved */}
          <View style={styles.statBox}>
            <View style={styles.statIconCircle}>
              <Text style={styles.statEmoji}>🌍</Text>
            </View>
            <Text style={styles.statValue}>{user.carbonSaved} kg</Text>
            <Text style={styles.statLabel}>Carbon Saved</Text>
          </View>
        </View>

        {/* App Info Box */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="school-outline" size={20} color={COLORS.primary} />
            <Text style={styles.infoTitle}>Campus Ecosystem</Text>
            <Text style={styles.infoValue}>STEM Sustainability</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Ionicons name="cube-outline" size={20} color={COLORS.primary} />
            <Text style={styles.infoTitle}>Version</Text>
            <Text style={styles.infoValue}>EcoPulse Phase 1 Foundation</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} style={styles.logoutIcon} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.lightGreen,
    borderWidth: 3,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.secondaryText,
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: COLORS.lightGreen,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statEmoji: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.secondaryText,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 10,
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.secondaryText,
  },
  infoDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: '700',
  },
});
