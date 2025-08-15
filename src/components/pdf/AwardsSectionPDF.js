// src/components/pdf/AwardsSectionPDF.js
import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  container: { marginBottom: 10 },
  title: { fontSize: 14, fontFamily: 'Times-Bold', marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#dddddd', paddingBottom: 2 },
  entryContainer: { marginBottom: 8 },
  awardName: { fontSize: 10, fontFamily: 'Times-Bold' },
  description: { fontSize: 10, fontFamily: 'Times-Roman', textAlign: 'justify' },
});

const AwardsSectionPDF = ({ data }) => {
  if (!data || data.length === 0) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Awards</Text>
      {data.map((award, index) => (
        <View key={index} style={styles.entryContainer} wrap={false}>
          <Text style={styles.awardName}>{award.name}</Text>
          {award.showDescription && award.description && (
            <Text style={styles.description}>{award.description}</Text>
          )}
        </View>
      ))}
    </View>
  );
};

export default AwardsSectionPDF;