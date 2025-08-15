// src/components/pdf/LanguagesSectionPDF.js
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
  language: { fontSize: 10, fontFamily: 'Times-Roman' },
  level: { fontSize: 10, fontFamily: 'Times-Italic', color: '#444444' },
});

const LanguagesSectionPDF = ({ data }) => {
  if (!data || data.length === 0) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Languages</Text>
      {data.map((lang, index) => (
        <View key={index} style={styles.entryContainer}>
          <Text style={styles.language}>{lang.language}</Text>
          <Text style={styles.level}>{lang.level}</Text>
        </View>
      ))}
    </View>
  );
};

export default LanguagesSectionPDF;