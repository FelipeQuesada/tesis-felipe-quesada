import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, ensureFirebaseClient } from '../lib/firebase';
import { getUserDoc, upsertUserDoc } from '../services/user.service';
import type { User, UserRegistrationProfile, UserRole } from '../types';

type SignUpRole = Extract<UserRole, 'student' | 'teacher'>;

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  /** Recarga el documento `users/{uid}` desde Firestore (p. ej. tras editar perfil). */
  refreshUser: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    role: SignUpRole,
    profile: UserRegistrationProfile
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ensureFirebaseClient();
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        let userDoc = await getUserDoc(fbUser.uid);
        if (!userDoc) {
          const providers = fbUser.providerData.map((p) => p.providerId);
          const isGoogle = providers.includes('google.com');
          if (isGoogle) {
            userDoc = await upsertUserDoc(fbUser.uid, {
              email: fbUser.email || '',
              displayName: fbUser.displayName,
              photoURL: fbUser.photoURL,
              role: 'student',
            });
          } else {
            console.warn(
              'Usuario autenticado sin documento en Firestore (email/password).'
            );
            setUser(null);
            setLoading(false);
            return;
          }
        }
        setUser(userDoc);
      } catch (e) {
        console.error('AuthContext – error cargando perfil:', e);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    ensureFirebaseClient();
    if (!auth) throw new Error('Firebase Auth no está inicializado');
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      role: SignUpRole,
      profile: UserRegistrationProfile
    ) => {
      ensureFirebaseClient();
      if (!auth) throw new Error('Firebase Auth no está inicializado');
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const displayName = `${profile.firstName} ${profile.lastName}`.trim();
      const userDoc = await upsertUserDoc(credential.user.uid, {
        email: credential.user.email || email.trim(),
        displayName: displayName || credential.user.displayName,
        photoURL: credential.user.photoURL,
        role,
        username: profile.username,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneCountryCode: profile.phoneCountryCode,
        phoneNumber: `${profile.phoneCountryCode}${profile.phoneNumber}`,
        documentType: profile.documentType,
        documentNumber: profile.documentNumber,
      });
      setUser(userDoc);
    },
    []
  );

  const signInWithGoogle = useCallback(async () => {
    throw new Error(
      'Inicio con Google en la app nativa: próximo paso (requiere configuración OAuth / expo-auth-session).'
    );
  }, []);

  const signOut = useCallback(async () => {
    ensureFirebaseClient();
    if (!auth) throw new Error('Firebase Auth no está inicializado');
    await firebaseSignOut(auth);
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    ensureFirebaseClient();
    if (!auth) throw new Error('Firebase Auth no está inicializado');
    await sendPasswordResetEmail(auth, email.trim());
  }, []);

  const refreshUser = useCallback(async () => {
    ensureFirebaseClient();
    if (!auth?.currentUser) return;
    try {
      const next = await getUserDoc(auth.currentUser.uid);
      setUser(next);
    } catch (e) {
      console.error('AuthContext refreshUser:', e);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      firebaseUser,
      loading,
      refreshUser,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      sendPasswordReset,
    }),
    [
      user,
      firebaseUser,
      loading,
      refreshUser,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      sendPasswordReset,
    ]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
}
