import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme/theme';
import AppHeader from '../components/AppHeader';
import CardTile from '../components/CardTile';

const HelpScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const helpSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: 'play-circle-outline',
      items: [
        'Setting up your voice profile',
        'Choosing your language',
        'Understanding the interface'
      ]
    },
    {
      id: 'voice-commands',
      title: 'Voice Commands',
      icon: 'mic-outline',
      items: [
        'How to use voice commands',
        'Supported voice actions',
        'Troubleshooting voice issues'
      ]
    },
    {
      id: 'document-scanning',
      title: 'Document Scanning',
      icon: 'camera-outline',
      items: [
        'How to scan documents',
        'Improving scan quality',
        'Supported document types'
      ]
    },
    {
      id: 'applications',
      title: 'Government Applications',
      icon: 'document-text-outline',
      items: [
        'Available services',
        'Application process',
        'Tracking your applications'
      ]
    }
  ];

  const faqItems = [
    {
      question: 'How do I change the app language?',
      answer: 'Go to Settings > Language and select your preferred language from the available options.'
    },
    {
      question: 'Can I use the app without internet?',
      answer: 'Yes, most features work offline. Your data will be saved and synced when you connect to the internet.'
    },
    {
      question: 'How do I improve voice recognition?',
      answer: 'Speak clearly, reduce background noise, and ensure your microphone permissions are enabled.'
    },
    {
      question: 'What documents can I scan?',
      answer: 'You can scan Aadhaar cards, PAN cards, passports, driving licenses, and other government documents.'
    },
    {
      question: 'How do I track my application status?',
      answer: 'Use the reference number provided after submission to track your application status.'
    }
  ];

  const renderHelpSection = (section) => (
    <View key={section.id} style={styles.helpSection}>
      <View style={styles.sectionHeader}>
        <Ionicons name={section.icon} size={24} color={colors.primary} />
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
      
      {section.items.map((item, index) => (
        <TouchableOpacity key={index} style={styles.helpItem}>
          <Text style={styles.helpItemText}>{item}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderFAQItem = (item, index) => (
    <View key={index} style={styles.faqItem}>
      <Text style={styles.faqQuestion}>{item.question}</Text>
      <Text style={styles.faqAnswer}>{item.answer}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader 
        title="Help & Support"
        showBack={true}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>How can we help you?</Text>
          <Text style={styles.subtitle}>
            Find answers to common questions and learn how to use Sahayak
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionLabel}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <CardTile
              title="Voice Tutorial"
              iconName="microphone"
              color={colors.secondary}
              size="small"
              style={styles.quickActionCard}
            />
            <CardTile
              title="Scan Tutorial"
              iconName="camera"
              color={colors.primary}
              size="small"
              style={styles.quickActionCard}
            />
          </View>
        </View>

        {/* Help Sections */}
        <View style={styles.helpSectionsContainer}>
          <Text style={styles.sectionLabel}>Help Topics</Text>
          {helpSections.map(renderHelpSection)}
        </View>

        {/* FAQ */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionLabel}>Frequently Asked Questions</Text>
          {faqItems.map(renderFAQItem)}
        </View>

        {/* Contact Support */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionLabel}>Still need help?</Text>
          
          <View style={styles.contactOptions}>
            <TouchableOpacity style={styles.contactOption}>
              <Ionicons name="call-outline" size={24} color={colors.primary} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Call Support</Text>
                <Text style={styles.contactSubtitle}>1800-XXX-XXXX</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactOption}>
              <Ionicons name="mail-outline" size={24} color={colors.primary} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Email Support</Text>
                <Text style={styles.contactSubtitle}>support@sahayak.gov.in</Text>
              </View>
            </TouchableOpacity>
          </View>
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
  sectionLabel: {
    ...typography.h3,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  quickActionsSection: {
    marginBottom: spacing.xl,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
  },
  helpSectionsContainer: {
    marginBottom: spacing.xl,
  },
  helpSection: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.disabled,
  },
  helpItemText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  faqSection: {
    marginBottom: spacing.xl,
  },
  faqItem: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  faqQuestion: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  faqAnswer: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  contactSection: {
    marginBottom: spacing.xl,
  },
  contactOptions: {
    paddingHorizontal: spacing.lg,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contactInfo: {
    marginLeft: spacing.md,
  },
  contactTitle: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  contactSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default HelpScreen;