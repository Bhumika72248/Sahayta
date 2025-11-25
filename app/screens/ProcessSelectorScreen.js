import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing } from '../theme/theme';
import { startWorkflow } from '../store/slices/workflowSlice';
import AppHeader from '../components/AppHeader';
import CardTile from '../components/CardTile';
import { getAvailableWorkflows } from '../api/workflowService';

const ProcessSelectorScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Services', icon: 'document' },
    { id: 'identity', name: 'Identity', icon: 'aadhaar' },
    { id: 'tax', name: 'Tax', icon: 'pan' },
    { id: 'travel', name: 'Travel', icon: 'passport' },
    { id: 'transport', name: 'Transport', icon: 'license' },
    { id: 'civic', name: 'Civic', icon: 'voter' },
    { id: 'welfare', name: 'Welfare', icon: 'ration' }
  ];

  useEffect(() => {
    loadWorkflows();
    
    // Handle direct navigation to specific process
    if (route.params?.selectedProcess) {
      handleProcessSelect(route.params.selectedProcess);
    }
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const result = await getAvailableWorkflows();
      
      if (result.success) {
        setWorkflows(result.data);
      }
    } catch (error) {
      console.error('Failed to load workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessSelect = async (workflowId) => {
    try {
      const selectedWorkflow = workflows.find(w => w.id === workflowId);
      
      if (selectedWorkflow) {
        dispatch(startWorkflow(selectedWorkflow));
        navigation.navigate('WorkflowStepper');
      }
    } catch (error) {
      console.error('Failed to start workflow:', error);
    }
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const getFilteredWorkflows = () => {
    if (selectedCategory === 'all') {
      return workflows;
    }
    return workflows.filter(workflow => workflow.category === selectedCategory);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return colors.success;
      case 'medium':
        return colors.secondary;
      case 'hard':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader 
        title={t('workflow.selectProcess')}
        showBack={true}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <CardTile
                key={category.id}
                title={category.name}
                iconName={category.icon}
                color={selectedCategory === category.id ? colors.primary : colors.textSecondary}
                onPress={() => handleCategorySelect(category.id)}
                size="small"
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.selectedCategoryCard
                ]}
              />
            ))}
          </ScrollView>
        </View>

        {/* Workflows */}
        <View style={styles.workflowsSection}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Services' : categories.find(c => c.id === selectedCategory)?.name}
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading services...</Text>
            </View>
          ) : (
            <View style={styles.workflowsGrid}>
              {getFilteredWorkflows().map((workflow) => (
                <View key={workflow.id} style={styles.workflowCard}>
                  <CardTile
                    title={workflow.name}
                    subtitle={workflow.estimatedTime}
                    iconName={workflow.icon}
                    color={colors.primary}
                    onPress={() => handleProcessSelect(workflow.id)}
                    size="medium"
                  />
                  
                  <View style={styles.workflowMeta}>
                    <View style={styles.difficultyBadge}>
                      <View 
                        style={[
                          styles.difficultyDot, 
                          { backgroundColor: getDifficultyColor(workflow.difficulty) }
                        ]} 
                      />
                      <Text style={styles.difficultyText}>
                        {workflow.difficulty}
                      </Text>
                    </View>
                    
                    <Text style={styles.descriptionText} numberOfLines={2}>
                      {workflow.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
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
  categoriesSection: {
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  categoriesScroll: {
    paddingLeft: spacing.lg,
  },
  categoryCard: {
    width: 100,
    marginRight: spacing.md,
  },
  selectedCategoryCard: {
    backgroundColor: colors.primary,
  },
  workflowsSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  workflowsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  workflowCard: {
    width: '48%',
    marginBottom: spacing.lg,
  },
  workflowMeta: {
    marginTop: spacing.sm,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  difficultyText: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  descriptionText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default ProcessSelectorScreen;