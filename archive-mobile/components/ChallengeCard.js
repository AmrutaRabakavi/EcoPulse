import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';

export default function ChallengeCard({
  title,
  description,
  points,
  icon,
  buttonText = 'View',
  onPress,
  isFeatured = false,
}) {
  return (
    <View style={[styles.card, isFeatured && styles.featuredCard]}>
      {isFeatured && (
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredBadgeText}>TODAY'S CHALLENGE</Text>
        </View>
      )}

      <View style={styles.contentRow}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{icon}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsText}>+{points} pts</Text>
            </View>
          </View>

          <Text style={styles.description}>{description}</Text>

          <TouchableOpacity
            style={[styles.button, isFeatured && styles.featuredButton]}
            onPress={onPress}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, isFeatured && styles.featuredButtonText]}>
              {buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  featuredCard: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    backgroundColor: '#F9FDF9',
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.lightGreen,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 10,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.8,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  detailsContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  pointsBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  description: {
    fontSize: 13,
    color: COLORS.secondaryText,
    lineHeight: 18,
    marginBottom: 12,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.lightGreen,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  featuredButton: {
    backgroundColor: COLORS.primary,
  },
  featuredButtonText: {
    color: COLORS.white,
  },
});
