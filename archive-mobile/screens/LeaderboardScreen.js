import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { leaderboard, user } from '../data/mockData';

export default function LeaderboardScreen() {
  const currentUserName = user.name.split(' ')[0]; // "Amruta"

  const getMedalOrRank = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🏆 EcoPulse Leaderboard</Text>
          <Text style={styles.headerSubtitle}>
            Top STEM sustainability champions across campus
          </Text>
        </View>

        {/* Podium Highlight */}
        <View style={styles.podiumContainer}>
          {/* Rank 2 */}
          <View style={[styles.podiumCol, styles.podiumSecond]}>
            <Text style={styles.podiumMedal}>🥈</Text>
            <View style={styles.podiumAvatar}>
              <Text style={styles.podiumAvatarText}>RA</Text>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>
              {leaderboard[1]?.name}
            </Text>
            <Text style={styles.podiumPoints}>{leaderboard[1]?.points} pts</Text>
            <View style={[styles.podiumPillar, { height: 60 }]} />
          </View>

          {/* Rank 1 */}
          <View style={[styles.podiumCol, styles.podiumFirst]}>
            <Text style={styles.podiumMedal}>🥇</Text>
            <View style={[styles.podiumAvatar, styles.firstAvatar]}>
              <Text style={styles.podiumAvatarText}>AN</Text>
            </View>
            <Text style={[styles.podiumName, styles.firstName]} numberOfLines={1}>
              {leaderboard[0]?.name}
            </Text>
            <Text style={styles.podiumPoints}>{leaderboard[0]?.points} pts</Text>
            <View style={[styles.podiumPillar, { height: 80, backgroundColor: COLORS.primary }]} />
          </View>

          {/* Rank 3 (Current User) */}
          <View style={[styles.podiumCol, styles.podiumThird]}>
            <Text style={styles.podiumMedal}>🥉</Text>
            <View style={[styles.podiumAvatar, styles.userAvatar]}>
              <Text style={[styles.podiumAvatarText, { color: COLORS.primary }]}>YOU</Text>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>
              {leaderboard[2]?.name}
            </Text>
            <Text style={styles.podiumPoints}>{leaderboard[2]?.points} pts</Text>
            <View style={[styles.podiumPillar, { height: 46 }]} />
          </View>
        </View>

        {/* Leaderboard Table List */}
        <View style={styles.listContainer}>
          <Text style={styles.listHeaderTitle}>Campus Rankings</Text>

          {leaderboard.map((item) => {
            const isCurrentUser =
              item.name.toLowerCase() === currentUserName.toLowerCase();

            return (
              <View
                key={item.rank}
                style={[
                  styles.rowCard,
                  isCurrentUser && styles.currentUserRow,
                ]}
              >
                {/* Rank */}
                <View style={styles.rankContainer}>
                  <Text
                    style={[
                      styles.rankText,
                      item.rank <= 3 && styles.medalText,
                      isCurrentUser && styles.currentUserRankText,
                    ]}
                  >
                    {getMedalOrRank(item.rank)}
                  </Text>
                </View>

                {/* Student Name */}
                <View style={styles.nameContainer}>
                  <View style={styles.nameRow}>
                    <Text
                      style={[
                        styles.studentName,
                        isCurrentUser && styles.currentUserNameText,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {isCurrentUser && (
                      <View style={styles.youBadge}>
                        <Text style={styles.youBadgeText}>YOU</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.rankSubtitle}>Rank #{item.rank} in STEM</Text>
                </View>

                {/* Eco Points */}
                <View style={styles.pointsContainer}>
                  <Text
                    style={[
                      styles.pointsValue,
                      isCurrentUser && styles.currentUserPoints,
                    ]}
                  >
                    {item.points.toLocaleString()}
                  </Text>
                  <Text style={styles.pointsLabel}>Eco Points</Text>
                </View>
              </View>
            );
          })}
        </View>
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
    marginBottom: 20,
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
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingTop: 18,
    paddingHorizontal: 12,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  podiumCol: {
    flex: 1,
    alignItems: 'center',
  },
  podiumSecond: {
    order: 1,
  },
  podiumFirst: {
    order: 2,
  },
  podiumThird: {
    order: 3,
  },
  podiumMedal: {
    fontSize: 22,
    marginBottom: 4,
  },
  podiumAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  firstAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightGreen,
  },
  userAvatar: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightGreen,
  },
  podiumAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  podiumName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  firstName: {
    fontSize: 14,
    color: COLORS.primary,
  },
  podiumPoints: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.secondaryText,
    marginBottom: 8,
  },
  podiumPillar: {
    width: '85%',
    backgroundColor: '#C8E6C9',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  listContainer: {
    marginTop: 4,
  },
  listHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  currentUserRow: {
    backgroundColor: '#F0FDF4',
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  rankContainer: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.secondaryText,
  },
  medalText: {
    fontSize: 20,
  },
  currentUserRankText: {
    color: COLORS.primary,
  },
  nameContainer: {
    flex: 1,
    marginLeft: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  currentUserNameText: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  youBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  youBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rankSubtitle: {
    fontSize: 11,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  currentUserPoints: {
    color: COLORS.primary,
  },
  pointsLabel: {
    fontSize: 11,
    color: COLORS.secondaryText,
    marginTop: 1,
  },
});
