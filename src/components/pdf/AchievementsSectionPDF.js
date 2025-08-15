// src/components/pdf/AchievementsSectionPDF.js
import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  container: { marginBottom: 10 },
  title: { fontSize: 14, fontFamily: 'Times-Bold', marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#dddddd', paddingBottom: 2 },
  entryContainer: { marginBottom: 8 },
  achievementTitle: { fontSize: 10, fontFamily: 'Times-Bold' },
  description: { fontSize: 10, fontFamily: 'Times-Roman', textAlign: 'justify' },
});

const AchievementsSectionPDF = ({ data }) => {
  if (!data || data.length === 0) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Achievements</Text>
      {data.map((ach, index) => (
        <View key={index} style={styles.entryContainer} wrap={false}>
          <Text style={styles.achievementTitle}>{ach.title}</Text>
          <Text style={styles.description}>{ach.description}</Text>
        </View>
      ))}
    </View>
  );
};

export default AchievementsSectionPDF;