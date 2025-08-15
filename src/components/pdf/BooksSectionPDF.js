// src/components/pdf/BooksSectionPDF.js
import React from 'react';
import { Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  container: { marginBottom: 10 },
  title: { fontSize: 14, fontFamily: 'Times-Bold', marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#dddddd', paddingBottom: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bookContainer: { width: 80, marginBottom: 5 },
  cover: { width: 80, height: 120, marginBottom: 3, backgroundColor: '#eeeeee' },
  bookTitle: { fontSize: 8, fontFamily: 'Times-Bold' },
  author: { fontSize: 8, fontFamily: 'Times-Italic' },
});

const BooksSectionPDF = ({ data }) => {
  if (!data || data.length === 0) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Books</Text>
      <View style={styles.grid}>
        {data.map((book, index) => (
          <View key={index} style={styles.bookContainer}>
            {book.cover && <Image style={styles.cover} src={book.cover} />}
            <Text style={styles.bookTitle}>{book.title}</Text>
            <Text style={styles.author}>{book.author}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default BooksSectionPDF;