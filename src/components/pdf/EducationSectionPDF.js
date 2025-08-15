// src/components/pdf/EducationSectionPDF.js
import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  container: { marginBottom: 10 },
  title: { fontSize: 14, fontFamily: 'Times-Bold', marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#dddddd', paddingBottom: 2 },
  entryContainer: { marginBottom: 10 },
  degree: { fontSize: 11, fontFamily: 'Times-Bold' },
  metaInfo: { flexDirection: 'row', justifyContent: 'space-between', fontSize: 9, fontFamily: 'Times-Italic', color: '#444444', marginBottom: 3 },
});

const EducationSectionPDF = ({ data }) => {
  if (!data || data.length === 0) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Education</Text>
      {data.map((edu, index) => (
        <View key={index} style={styles.entryContainer} wrap={false}>
          <Text style={styles.degree}>{edu.degree}</Text>
          <View style={styles.metaInfo}>
            <Text>{edu.institution}, {edu.location}</Text>
            <Text>{edu.dates}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export default EducationSectionPDF;