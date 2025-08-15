// src/components/pdf/ProjectsSectionPDF.js
import React from 'react';
import { Text, View, StyleSheet, Link } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  container: { marginBottom: 10 },
  title: { fontSize: 14, fontFamily: 'Times-Bold', marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#dddddd', paddingBottom: 2 },
  entryContainer: { marginBottom: 10 },
  projectTitle: { fontSize: 11, fontFamily: 'Times-Bold' },
  description: { fontSize: 10, fontFamily: 'Times-Roman', textAlign: 'justify' },
  link: { fontSize: 9, color: 'blue', textDecoration: 'none' }
});

const ProjectsSectionPDF = ({ data }) => {
  if (!data || data.length === 0) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Projects</Text>
      {data.map((project, index) => (
        <View key={index} style={styles.entryContainer} wrap={false}>
          <Text style={styles.projectTitle}>{project.title}</Text>
          <Text style={styles.description}>{project.description}</Text>
          {project.link && <Link style={styles.link} src={project.link}>{project.link}</Link>}
        </View>
      ))}
    </View>
  );
};

export default ProjectsSectionPDF;