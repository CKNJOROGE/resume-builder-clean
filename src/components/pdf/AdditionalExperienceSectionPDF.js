// src/components/pdf/AdditionalExperienceSectionPDF.js
import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  container: { marginBottom: 10 },
  title: { fontSize: 14, fontFamily: 'Times-Bold', marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#dddddd', paddingBottom: 2 },
  entryContainer: { marginBottom: 10 },
  jobTitle: { fontSize: 11, fontFamily: 'Times-Bold' },
  metaInfo: { flexDirection: 'row', justifyContent: 'space-between', fontSize: 9, fontFamily: 'Times-Italic', color: '#444444', marginBottom: 4 },
  description: { fontSize: 10, fontFamily: 'Times-Roman', textAlign: 'justify', marginBottom: 5 },
  bullet: { fontSize: 10, fontFamily: 'Times-Roman' },
});

const AdditionalExperienceSectionPDF = ({ data }) => {
  if (!data || data.length === 0) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Additional Experience</Text>
      {data.map((exp, index) => (
        <View key={index} style={styles.entryContainer} wrap={false}>
          <Text style={styles.jobTitle}>{exp.title}</Text>
          <View style={styles.metaInfo}>
            <Text>{exp.company}, {exp.location}</Text>
            <Text>{exp.dates}</Text>
          </View>
          {exp.description && <Text style={styles.description}>{exp.description}</Text>}
          {exp.bullets && exp.bullets.map((bullet, bIndex) => (
            <View key={bIndex} style={{ flexDirection: 'row' }}>
              <Text style={{ ...styles.bullet, marginHorizontal: 5 }}>•</Text>
              <Text style={{ ...styles.bullet, flex: 1 }}>{bullet}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

export default AdditionalExperienceSectionPDF;