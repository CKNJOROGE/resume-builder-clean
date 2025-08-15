// src/components/pdf/ReferencesSectionPDF.js
import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  container: { marginBottom: 10 },
  title: { fontSize: 14, fontFamily: 'Times-Bold', marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#dddddd', paddingBottom: 2 },
  entryContainer: { marginBottom: 8 },
  name: { fontSize: 10, fontFamily: 'Times-Bold' },
  refTitle: { fontSize: 9, fontFamily: 'Times-Roman', color: '#444444' },
  contact: { fontSize: 9, fontFamily: 'Times-Roman', color: '#444444' },
});

const ReferencesSectionPDF = ({ data }) => {
  if (!data || data.length === 0) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>References</Text>
      {data.map((ref, index) => (
        <View key={index} style={styles.entryContainer} wrap={false}>
          <Text style={styles.name}>{ref.name}</Text>
          <Text style={styles.refTitle}>{ref.title}</Text>
          <Text style={styles.contact}>{ref.contact}</Text>
        </View>
      ))}
    </View>
  );
};

export default ReferencesSectionPDF;