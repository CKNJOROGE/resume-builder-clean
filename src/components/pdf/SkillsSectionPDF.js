// src/components/pdf/SkillsSectionPDF.js
import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  container: { marginBottom: 10 },
  title: { fontSize: 14, fontFamily: 'Times-Bold', marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#dddddd', paddingBottom: 2 },
  skill: { fontSize: 10, fontFamily: 'Times-Roman', marginBottom: 3 },
});

const SkillsSectionPDF = ({ data }) => {
  if (!data || data.length === 0) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Skills</Text>
      {data.map((skill, index) => (
        <Text key={index} style={styles.skill}>• {skill}</Text>
      ))}
    </View>
  );
};

export default SkillsSectionPDF;