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
import { Lock, Mail, User, Tag, ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { Image } from 'expo-image';
import { GoogleIcon } from '../../components/atoms/GoogleIcon';

export const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { signUp, signInWithGoogle } = useAuth();

  const [role, setRole] = useState<'customer' | 'business'>(
    route.params?.initialRole || 'customer'
  );
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSignUp = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      Alert.alert('Missing Fields', 'Please complete all required fields.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', "Passwords don't match.");
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
      let message = error.message;
      if (message.includes('already registered')) {
        message = 'This email is already registered. Please sign in instead.';
      }
      Alert.alert('Registration Failed', message);
    } else {
      Alert.alert(
        'Check Your Email',
        'A secure link has been sent to your mail for confirmation.',
        [{ text: 'Continue', onPress: () => navigation.navigate('Onboarding') }]
      );
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    const { error } = await signInWithGoogle();
    setIsGoogleLoading(false);

    if (error) {
      Alert.alert('Google Sign-In Failed', error.message || 'Failed to initialize Google login.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header Back Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ChevronLeft size={22} color={colors.text} />
          </TouchableOpacity>

          {/* Logo & Heading (Matching Web Auth.tsx) */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../assets/string-logo-icon.png')}
                style={styles.logo}
                contentFit="contain"
              />
            </View>
            <Text style={styles.title}>Join String</Text>
            <Text style={styles.subtitle}>Create your account and start connecting</Text>
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
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <User size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={colors.textPlaceholder}
                  value={fullName}
                  onChangeText={setFullName}
                  editable={!isSubmitting && !isGoogleLoading}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Mail size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textPlaceholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting && !isGoogleLoading}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textPlaceholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isSubmitting && !isGoogleLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={colors.textMuted} />
                  ) : (
                    <Eye size={18} color={colors.textMuted} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textPlaceholder}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  editable={!isSubmitting && !isGoogleLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} color={colors.textMuted} />
                  ) : (
                    <Eye size={18} color={colors.textMuted} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Referral Code (Optional, Matching Web) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Referral Code (optional)</Text>
              <View style={styles.inputWrapper}>
                <Tag size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="STR-XXXXXX"
                  placeholderTextColor={colors.textPlaceholder}
                  value={referralCode}
                  onChangeText={(val) => setReferralCode(val.toUpperCase())}
                  autoCapitalize="characters"
                  editable={!isSubmitting && !isGoogleLoading}
                />
              </View>
              <Text style={styles.helperText}>
                Have a friend on String? Enter their code to earn bonus points!
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSignUp}
              style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
              disabled={isSubmitting || isGoogleLoading}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text style={styles.submitButtonText}>Create account</Text>
              )}
            </TouchableOpacity>

            {/* Social Divider (Matching Web) */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Login Button */}
            <TouchableOpacity
              onPress={handleGoogleSignUp}
              style={[styles.googleButton, isGoogleLoading && styles.buttonDisabled]}
              disabled={isSubmitting || isGoogleLoading}
              activeOpacity={0.8}
            >
              {isGoogleLoading ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <>
                  <GoogleIcon size={20} />
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign in</Text>
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
    paddingTop: 8,
    paddingBottom: 40,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logo: {
    width: 42,
    height: 42,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  roleToggle: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 18,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 9,
  },
  roleOptionActive: {
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  roleOptionText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  roleOptionTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  form: {
    gap: 14,
  },
  inputGroup: {
    gap: 5,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  helperText: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
  eyeButton: {
    padding: 6,
  },
  submitButton: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.primaryForeground,
    fontSize: 15,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginHorizontal: 12,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    gap: 10,
  },
  googleButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  footerLink: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
