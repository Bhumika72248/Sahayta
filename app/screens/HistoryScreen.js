import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme/theme';
import AppHeader from '../components/AppHeader';
import { getWorkflows } from '../database/database';

const HistoryScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkflowHistory();
  }, []);

  const loadWorkflowHistory = async () => {
    try {
      setLoading(true);
      const result = await getWorkflows();
      setWorkflows(result);
    } catch (error) {
      console.error('Failed to load workflow history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'pending':
        return 'time-outline';
      case 'failed':
        return 'close-circle';
      default:
        return 'document-outline';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'pending':
        return colors.secondary;
      case 'failed':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderWorkflowItem = (workflow) => {
    return (
      <TouchableOpacity
        key={workflow.id}
        style={styles.workflowItem}
        onPress={() => {
          // Navigate to workflow details or restart workflow
        }}
      >
        <View style={styles.workflowHeader}>
          <View style={styles.workflowInfo}>
            <Text style={styles.workflowTitle}>
              {workflow.workflowData?.name || workflow.workflowType}
            </Text>
            <Text style={styles.workflowDate}>
              {formatDate(workflow.createdAt)}
            </Text>
          </View>
          
          <View style={styles.statusContainer}>
            <Ionicons 
              name={getStatusIcon(workflow.status)} 
              size={24} 
              color={getStatusColor(workflow.status)} 
            />
          </View>
        </View>
        
        {workflow.workflowData && Object.keys(workflow.workflowData).length > 0 && (
          <View style={styles.workflowDetails}>
            {Object.entries(workflow.workflowData).slice(0, 3).map(([key, value]) => (
              <Text key={key} style={styles.workflowDetail}>
                {key}: {String(value).substring(0, 50)}
                {String(value).length > 50 ? '...' : ''}
              </Text>
            ))}
          </View>
        )}
        
        <View style={styles.workflowActions}>
          <Text style={[styles.statusText, { color: getStatusColor(workflow.status) }]}>
            {workflow.status.toUpperCase()}
          </Text>
          
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color={colors.textSecondary} 
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader 
        title={t('home.myTasks')}
        showBack={true}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Application History</Text>
          <Text style={styles.subtitle}>
            View your saved applications and their status
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading history...</Text>
          </View>
        ) : workflows.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons 
              name="document-outline" 
              size={64} 
              color={colors.disabled} 
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>No Applications Yet</Text>
            <Text style={styles.emptyMessage}>
              Your completed applications will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.workflowsList}>
            {workflows.map(renderWorkflowItem)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h3,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  workflowsList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  workflowItem: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  workflowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  workflowInfo: {
    flex: 1,
  },
  workflowTitle: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  workflowDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statusContainer: {
    marginLeft: spacing.md,
  },
  workflowDetails: {
    marginBottom: spacing.sm,
  },
  workflowDetail: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  workflowActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.disabled,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
});

export default HistoryScreen;