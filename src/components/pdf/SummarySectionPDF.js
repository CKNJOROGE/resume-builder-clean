// src/components/pdf/SummarySectionPDF.js
import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

// Define the styles for this section
const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Times-Bold',
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd',
    paddingBottom: 2,
  },
  summaryText: {
    fontSize: 10,
    fontFamily: 'Times-Roman',
    // Default text alignment
    textAlign: 'justify',
  }
});

const SummarySectionPDF = ({ data, design }) => {
  // The summary data is a string. Return null if it's empty.
  if (!data) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Summary</Text>
      <Text style={[styles.summaryText, { textAlign: design?.summaryAlign || 'justify' }]}>
        {data}
      </Text>
    </View>
  );
};

export default SummarySectionPDF;