// src/components/pdf/IndustrialExpertiseSectionPDF.js
import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  container: { marginBottom: 10 },
  title: { fontSize: 14, fontFamily: 'Times-Bold', marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#dddddd', paddingBottom: 2 },
  entryContainer: { marginBottom: 8 },
  skillName: { fontSize: 10, fontFamily: 'Times-Roman', marginBottom: 2 },
  barContainer: {
    height: 6,
    width: '100%',
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#333333',
    borderRadius: 3,
  }
});

const IndustrialExpertiseSectionPDF = ({ data }) => {
  if (!data || data.length === 0) return null;
  // NOTE: Industrial Expertise sliders are based on a 1-10 scale.
  const MAX_LEVEL = 10; 

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Industrial Expertise</Text>
      {data.map((item, index) => (
        <View key={index} style={styles.entryContainer} wrap={false}>
          <Text style={styles.skillName}>{item.skill}</Text>
          {item.showSlider && (
            <View style={styles.barContainer}>
              <View style={[styles.barFill, { width: `${(item.level / MAX_LEVEL) * 100}%` }]} />
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

export default IndustrialExpertiseSectionPDF;