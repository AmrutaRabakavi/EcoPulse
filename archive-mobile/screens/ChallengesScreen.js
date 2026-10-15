import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { challenges } from '../data/mockData';
import ChallengeCard from '../components/ChallengeCard';

export default function ChallengesScreen() {
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sustainability Challenges 🎯</Text>
          <Text style={styles.headerSubtitle}>
            Complete campus activities to earn verified Eco Points
          </Text>
        </View>

        {/* Stats Summary Bar */}
        <View style={styles.summaryBar}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNum}>{challenges.length}</Text>
            <Text style={styles.summaryLabel}>Available</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNum}>
              {challenges.reduce((sum, item) => sum + item.points, 0)}
            </Text>
            <Text style={styles.summaryLabel}>Total Pts</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNum}>Phase 1</Text>
            <Text style={styles.summaryLabel}>Mock Data</Text>
          </View>
        </View>

        {/* Challenge List */}
        <View style={styles.listSection}>
          {challenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              title={challenge.title}
              description={challenge.description}
              points={challenge.points}
              icon={challenge.icon}
              buttonText="View"
              onPress={() => setSelectedChallenge(challenge)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Challenge Detail Modal */}
      <Modal
        visible={!!selectedChallenge}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedChallenge(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedChallenge && (
              <>
                <View style={styles.modalIconCircle}>
                  <Text style={styles.modalEmoji}>{selectedChallenge.icon}</Text>
                </View>

                <Text style={styles.modalTitle}>{selectedChallenge.title}</Text>
                <Text style={styles.modalPoints}>
                  +{selectedChallenge.points} Eco Points Reward
                </Text>

                <Text style={styles.modalDesc}>{selectedChallenge.description}</Text>

                <View style={styles.noticeBox}>
                  <Text style={styles.noticeHeader}>Verified Action</Text>
                  <Text style={styles.noticeText}>
                    In Phase 2, this challenge will connect to STEM campus sensors,
                    computer vision waste detection, and GPS routing.
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedChallenge(null)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
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
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.secondaryText,
    marginTop: 4,
    fontWeight: '500',
    lineHeight: 20,
  },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNum: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.secondaryText,
    fontWeight: '600',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },
  listSection: {
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 6,
  },
  modalIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalEmoji: {
    fontSize: 34,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  modalPoints: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 12,
  },
  modalDesc: {
    fontSize: 14,
    color: COLORS.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  noticeBox: {
    backgroundColor: COLORS.lightGreen,
    borderRadius: 12,
    padding: 14,
    width: '100%',
    marginBottom: 20,
  },
  noticeHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noticeText: {
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 17,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
