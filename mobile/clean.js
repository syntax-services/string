const fs = require('fs');
let content = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

// Remove WebBrowser and auth-session imports
content = content.replace(/import \* as WebBrowser from 'expo-web-browser';\r?\n/, '');
content = content.replace(/import \{ makeRedirectUri \} from 'expo-auth-session';\r?\n/, '');

// Remove the try/catch WebBrowser.maybeCompleteAuthSession block
content = content.replace(/try\s*\{\s*WebBrowser\.maybeCompleteAuthSession\(\);\s*\}\s*catch\s*\(_err\)\s*\{\s*[\s\S]*?\n\}\r?\n/, '');

// Replace the Google Sign in method with a mock
const googleRegex = /const signInWithGoogle = async \(\): Promise<\{ error: Error \| null \}> => \{[\s\S]*?return \{ error: err \};\s*\}\s*\};/;
const replacementGoogle = const signInWithGoogle = async (): Promise<{ error: Error | null }> => {\n    return { error: new Error('Google Sign-in temporarily disabled to fix native crashes. Coming back soon!') };\n  };;

content = content.replace(googleRegex, replacementGoogle);
fs.writeFileSync('src/contexts/AuthContext.tsx', content);
