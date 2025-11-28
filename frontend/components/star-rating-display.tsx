import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  rating: number;
  size?: number;
  color?: string;
  emptyColor?: string;
  onChange?: (value: number) => void; // optional for interactive use
};

const StarRatingDisplay: React.FC<Props> = ({ rating, size = 18, color = '#FFB800', emptyColor = '#d3d3d3', onChange }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.row}>
      {stars.map((star) => {
        const iconName =
          rating >= star ? 'star' : rating >= star - 0.5 ? 'star-half' : 'star-outline';
        const content = (
          <Ionicons
            key={star}
            name={iconName as any}
            size={size}
            color={rating >= star ? color : rating >= star - 0.5 ? color : emptyColor}
          />
        );

        if (!onChange) return <View key={star}>{content}</View>;

        return (
          <View key={star} style={{ position: 'relative', width: size, height: size }}>
            {content}
            <Pressable style={[styles.hit, styles.left]} onPress={() => onChange(star - 0.5)} />
            <Pressable style={[styles.hit, styles.right]} onPress={() => onChange(star)} />
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hit: { position: 'absolute', top: 0, bottom: 0, width: '50%' },
  left: { left: 0 },
  right: { right: 0 },
});

export default StarRatingDisplay;
