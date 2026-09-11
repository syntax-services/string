import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Lock, Mail, User, Tag, ChevronLeft, CheckSquare, Square } from 'lucide-react-native';

export const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { signUp } = useAuth();

  const [role, setRole] = useState<'customer' | 'business'>(
    route.params?.initialRole || 'customer'
  );
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      Alert.alert('Missing Fields', 'Please complete all required fields.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    if (!acceptedTerms) {
      Alert.alert('Terms Required', 'Please accept the String Terms of Service.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await signUp(email, password, {
      full_name: fullName.trim(),
      account_type: role,
      referral_code: referralCode.trim() || undefined,
    });
    setIsSubmitting(false);

    if (error) {
      Alert.alert('Registration Failed', error.message || 'Could not register account.');
    } else {
      Alert.alert(
        'Account Created',
        'Verification link sent if required, or you can now sign in.',
        [{ text: 'Proceed to Onboarding', onPress: () => navigation.navigate('Onboarding') }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Join String</Text>
            <Text style={styles.subtitle}>Create your campus marketplace profile.</Text>
          </View>

          {/* Role Switcher Pill */}
          <View style={styles.roleToggle}>
            <TouchableOpacity
              onPress={() => setRole('customer')}
              style={[styles.roleOption, role === 'customer' && styles.roleOptionActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.roleOptionText, role === 'customer' && styles.roleOptionTextActive]}>
                Student Buyer
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setRole('business')}
              style={[styles.roleOption, role === 'business' && styles.roleOptionActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.roleOptionText, role === 'business' && styles.roleOptionTextActive]}>
                Campus Merchant
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name / Brand Name</Text>
              <View style={styles.inputWrapper}>
                <User size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. David Adeleke"
                  placeholderTextColor={colors.textPlaceholder}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Campus Email</Text>
              <View style={styles.inputWrapper}>
                <Mail size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@unilag.edu.ng"
                  placeholderTextColor={colors.textPlaceholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Create Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="At least 6 characters"
                  placeholderTextColor={colors.textPlaceholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            {/* Referral Code (Optional) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Referral Code (Optional)</Text>
              <View style={styles.inputWrapper}>
                <Tag size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. STRING2026"
                  placeholderTextColor={colors.textPlaceholder}
                  value={referralCode}
                  onChangeText={setReferralCode}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Terms Checkbox */}
            <TouchableOpacity
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              style={styles.termsRow}
              activeOpacity={0.8}
            >
              {acceptedTerms ? (
                <CheckSquare size={20} color={colors.accentCyan} />
              ) : (
                <Square size={20} color={colors.textMuted} />
              )}
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.termsHighlight}>String Escrow Terms</Text> and Campus Safety Code.
              </Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSignUp}
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text style={styles.submitButtonText}>
                  {role === 'business' ? 'Open Merchant Shop' : 'Create Student Account'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  roleToggle: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  roleOptionActive: {
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  roleOptionText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  roleOptionTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  termsText: {
    color: colors.textSecondary,
    fontSize: 12,
    flex: 1,
  },
  termsHighlight: {
    color: colors.accentCyan,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.primaryForeground,
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  footerLink: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
});
