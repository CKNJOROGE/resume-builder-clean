// src/components/pdf/PassionsSectionPDF.js
import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  container: { marginBottom: 10 },
  title: { fontSize: 14, fontFamily: 'Times-Bold', marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#dddddd', paddingBottom: 2 },
  passion: { fontSize: 10, fontFamily: 'Times-Roman', marginBottom: 3 },
});

const PassionsSectionPDF = ({ data }) => {
  if (!data || data.length === 0) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Passions</Text>
      {data.map((passion, index) => (
        <Text key={index} style={styles.passion}>• {passion}</Text>
      ))}
    </View>
  );
};

export default PassionsSectionPDF;