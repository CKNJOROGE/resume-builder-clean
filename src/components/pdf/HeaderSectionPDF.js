// src/components/pdf/HeaderSectionPDF.js
import React from 'react';
import { Text, View, StyleSheet, Link } from '@react-pdf/renderer';


// Define the styles for this section
const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd',
    paddingBottom: 10,
  },
  name: {
    fontSize: 28,
    fontFamily: 'Times-Bold',
  },
  title: {
    fontSize: 14,
    color: '#444444',
    marginBottom: 8,
  },
  contactContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    fontSize: 10,
    gap: 10,
  },
  link: {
    color: 'blue',
    textDecoration: 'none', // Underlines are default, 'none' removes them if desired
  }
});

// Create the component
const HeaderSectionPDF = ({ data }) => {
  // Return null if there's no data to prevent errors
  if (!data) return null;

  return (
    <View style={styles.container}>
      {data.name && <Text style={styles.name}>{data.name}</Text>}
      {data.title && <Text style={styles.title}>{data.title}</Text>}

      <View style={styles.contactContainer}>
        {data.phone && <Text>{data.phone}</Text>}
        {data.email && <Text>{data.email}</Text>}
        {data.location && <Text>{data.location}</Text>}
        {data.link && <Link style={styles.link} src={`https://www.${data.link}`}>{data.link}</Link>}
      </View>
    </View>
  );
};

export default HeaderSectionPDF;