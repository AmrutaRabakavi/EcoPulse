import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { user } from '../data/mockData';
import EcoPointsCard from '../components/EcoPointsCard';
import StatCard from '../components/StatCard';
import ChallengeCard from '../components/ChallengeCard';

export default function HomeScreen({ navigation }) {
  // Modal state for placeholder quick action popups
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const showPlaceholder = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const firstName = user.name.split(' ')[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Greeting */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {firstName}! 👋</Text>
            <Text style={styles.subGreeting}>Let's make today greener.</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarText}>AR</Text>
          </TouchableOpacity>
        </View>

        {/* Eco Points Card */}
        <EcoPointsCard points={user.ecoPoints} weeklyGain={80} />

        {/* Carbon Saved Card */}
        <StatCard
          icon="🌍"
          title="Carbon Saved"
          value={`${user.carbonSaved} kg`}
          caption="This month • Mock value"
          containerStyle={styles.carbonCard}
        />

        {/* Today's Challenge Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Challenge</Text>
        </View>

        <ChallengeCard
          title="Green Commute"
          description="Walk, cycle, or use public transport instead of a private vehicle today."
          points={50}
          icon="🚲"
          buttonText="View Challenge"
          isFeatured={true}
          onPress={() => navigation.navigate('Challenges')}
        />

        {/* Quick Actions Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={styles.quickActionsGrid}>
          {/* Action 1: Carbon Footprint */}
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() =>
              showPlaceholder(
                '🌍 Carbon Footprint',
                'Detailed STEM campus carbon footprint analytics and tracking will be available in a future phase.'
              )
            }
            activeOpacity={0.7}
          >
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionEmoji}>🌍</Text>
            </View>
            <Text style={styles.actionTitle}>Carbon Footprint</Text>
            <Text style={styles.actionSubtitle}>View impact</Text>
          </TouchableOpacity>

          {/* Action 2: Challenges */}
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('Challenges')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionEmoji}>🎯</Text>
            </View>
            <Text style={styles.actionTitle}>Challenges</Text>
            <Text style={styles.actionSubtitle}>Earn points</Text>
          </TouchableOpacity>

          {/* Action 3: Waste Verification */}
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() =>
              showPlaceholder(
                '♻️ Waste Verification',
                'Waste verification will be available in a future phase.'
              )
            }
            activeOpacity={0.7}
          >
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionEmoji}>♻️</Text>
            </View>
            <Text style={styles.actionTitle}>Waste Verification</Text>
            <Text style={styles.actionSubtitle}>Future phase</Text>
          </TouchableOpacity>

          {/* Action 4: Leaderboard */}
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('Leaderboard')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionEmoji}>🏆</Text>
            </View>
            <Text style={styles.actionTitle}>Leaderboard</Text>
            <Text style={styles.actionSubtitle}>Campus ranks</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modern Notice Modal for Quick Actions */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <View style={styles.phaseBadge}>
              <Text style={styles.phaseBadgeText}>EcoPulse Phase 1 Preview</Text>
            </View>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  subGreeting: {
    fontSize: 14,
    color: COLORS.secondaryText,
    marginTop: 2,
    fontWeight: '500',
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.lightGreen,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  carbonCard: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionEmoji: {
    fontSize: 22,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: COLORS.secondaryText,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: COLORS.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  phaseBadge: {
    backgroundColor: COLORS.lightGreen,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 20,
  },
  phaseBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  modalCloseButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  modalCloseText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
