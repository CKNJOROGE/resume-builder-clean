// src/components/pdf/CoursesSectionPDF.js
import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  container: { marginBottom: 10 },
  title: { fontSize: 14, fontFamily: 'Times-Bold', marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#dddddd', paddingBottom: 2 },
  entryContainer: { marginBottom: 5 },
  courseTitle: { fontSize: 10, fontFamily: 'Times-Bold' },
  metaInfo: { fontSize: 9, fontFamily: 'Times-Italic', color: '#444444' },
});

const CoursesSectionPDF = ({ data }) => {
  if (!data || data.length === 0) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Courses & Certifications</Text>
      {data.map((course, index) => (
        <View key={index} style={styles.entryContainer} wrap={false}>
          <Text style={styles.courseTitle}>{course.title}</Text>
          <Text style={styles.metaInfo}>{course.provider} - {course.date}</Text>
        </View>
      ))}
    </View>
  );
};

export default CoursesSectionPDF;