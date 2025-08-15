// src/components/pdf/HobbiesSectionPDF.js
import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  container: { marginBottom: 10 },
  title: { fontSize: 14, fontFamily: 'Times-Bold', marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#dddddd', paddingBottom: 2 },
  entryContainer: { marginBottom: 8 },
  hobbyTitle: { fontSize: 10, fontFamily: 'Times-Bold' },
  description: { fontSize: 10, fontFamily: 'Times-Roman' },
});

const HobbiesSectionPDF = ({ data }) => {
  if (!data || data.length === 0) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hobbies & Interests</Text>
      {data.map((hobby, index) => (
        <View key={index} style={styles.entryContainer} wrap={false}>
          <Text style={styles.hobbyTitle}>{hobby.title}</Text>
          <Text style={styles.description}>{hobby.description}</Text>
        </View>
      ))}
    </View>
  );
};

export default HobbiesSectionPDF;