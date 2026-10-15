import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

export default function StatCard({
  icon = '🌍',
  title = 'Carbon Saved',
  value = '12.6 kg',
  caption = 'This month',
  containerStyle,
}) {
  return (
    <View style={[styles.card, containerStyle]}>
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  icon: {
    fontSize: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondaryText,
    flex: 1,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  caption: {
    fontSize: 12,
    color: COLORS.secondaryText,
    fontWeight: '500',
  },
});
