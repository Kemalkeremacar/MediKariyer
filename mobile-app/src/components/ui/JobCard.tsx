import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface JobCardProps {
  title: string;
  company?: string;
  location?: string;
  salary?: string;
  onPress?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  title,
  company,
  location,
  salary,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>
      {company && <Text style={styles.company}>{company}</Text>}
      {location && <Text style={styles.location}>{location}</Text>}
      {salary && <Text style={styles.salary}>{salary}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  company: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    color: '#8E8E93',
  },
  salary: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginTop: 8,
  },
});
