// src/components/pdf/MyTimeSectionPDF.js
import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  container: { marginBottom: 10 },
  title: { fontSize: 14, fontFamily: 'Times-Bold', marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#dddddd', paddingBottom: 2 },
  entryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  label: { fontSize: 10, fontFamily: 'Times-Roman' },
  value: { fontSize: 10, fontFamily: 'Times-Bold' },
});

const MyTimeSectionPDF = ({ data }) => {
  if (!data || data.length === 0) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Time</Text>
      {data.map((item, index) => (
        <View key={index} style={styles.entryContainer}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.value}>{item.value}%</Text>
        </View>
      ))}
    </View>
  );
};

export default MyTimeSectionPDF;