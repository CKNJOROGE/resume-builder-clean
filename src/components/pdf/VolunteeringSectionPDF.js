// src/components/pdf/VolunteeringSectionPDF.js
import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  container: { marginBottom: 10 },
  title: { fontSize: 14, fontFamily: 'Times-Bold', marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#dddddd', paddingBottom: 2 },
  entryContainer: { marginBottom: 10 },
  roleTitle: { fontSize: 11, fontFamily: 'Times-Bold' },
  metaInfo: { flexDirection: 'row', justifyContent: 'space-between', fontSize: 9, fontFamily: 'Times-Italic', color: '#444444', marginBottom: 4 },
  description: { fontSize: 10, fontFamily: 'Times-Roman', textAlign: 'justify', marginBottom: 5 },
  bullet: { fontSize: 10, fontFamily: 'Times-Roman' },
});

const VolunteeringSectionPDF = ({ data }) => {
  if (!data || data.length === 0) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Volunteering Experience</Text>
      {data.map((item, index) => (
        <View key={index} style={styles.entryContainer} wrap={false}>
          <Text style={styles.roleTitle}>{item.title}</Text>
          <View style={styles.metaInfo}>
            <Text>{item.organization}, {item.location}</Text>
            <Text>{item.dates}</Text>
          </View>
          {item.description && <Text style={styles.description}>{item.description}</Text>}
          {item.bullets && item.bullets.map((bullet, bIndex) => (
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

export default VolunteeringSectionPDF;