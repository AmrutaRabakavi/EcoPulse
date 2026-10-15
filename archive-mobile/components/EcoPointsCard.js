import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

export default function EcoPointsCard({ points = 1250, weeklyGain = 80 }) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.labelContainer}>
          <Text style={styles.emoji}>🌱</Text>
          <Text style={styles.label}>Eco Points</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>+{weeklyGain} this week</Text>
        </View>
      </View>

      <Text style={styles.pointsValue}>{points.toLocaleString()}</Text>

      <View style={styles.divider} />

      <View style={styles.levelContainer}>
        <View style={styles.levelHeader}>
          <View>
            <Text style={styles.levelTitle}>Level 4</Text>
            <Text style={styles.levelSubtitle}>Eco Explorer 🌿</Text>
          </View>
          <Text style={styles.progressPercent}>80%</Text>
        </View>

        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: '80%' }]} />
        </View>
        <Text style={styles.progressCaption}>Progress to Level 5</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 20,
    marginRight: 6,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.secondaryText,
    letterSpacing: 0.3,
  },
  badge: {
    backgroundColor: COLORS.lightGreen,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  pointsValue: {
    fontSize: 38,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  levelContainer: {
    marginTop: 2,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  levelTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  levelSubtitle: {
    fontSize: 13,
    color: COLORS.secondaryText,
    marginTop: 1,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  progressBarBackground: {
    height: 9,
    backgroundColor: '#E8EFE8',
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  progressCaption: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginTop: 6,
    fontWeight: '500',
  },
});
