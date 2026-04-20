'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, ensureFirebaseClient } from '@/lib/firebase';
import { getUserDoc, upsertUserDoc } from '@/services/user.service';
import type { User, UserRegistrationProfile, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    role: UserRole,
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
    // Only run on client side
    if (typeof window === 'undefined' || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        // Get user document
        let userDoc = await getUserDoc(firebaseUser.uid);
        if (!userDoc) {
          const isGoogleProvider = firebaseUser.providerData.some(
            (provider) => provider.providerId === 'google.com'
          );
          // Solo auto-crear para Google. Para email/password, lo crea signUp().
          if (isGoogleProvider) {
            userDoc = await upsertUserDoc(firebaseUser.uid, {
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: 'student',
            });
          } else {
            console.warn(
              'AuthContext - Usuario autenticado sin documento en Firestore (email/password).'
            );
            setUser(null);
            setLoading(false);
            return;
          }
        }
        console.log('AuthContext - Usuario cargado:', userDoc.email, 'Rol:', userDoc.role);
        setUser(userDoc);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    ensureFirebaseClient();
    if (!auth) throw new Error('Firebase Auth no está inicializado');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (
    email: string,
    password: string,
    role: UserRole,
    profile: UserRegistrationProfile
  ) => {
    ensureFirebaseClient();
    if (!auth) throw new Error('Firebase Auth no está inicializado');
    console.log('AuthContext - Registrando usuario con rol:', role);
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    // Create user document with selected role
    const displayName = `${profile.firstName} ${profile.lastName}`.trim();
    const userDoc = await upsertUserDoc(userCredential.user.uid, {
      email: userCredential.user.email || email,
      displayName: displayName || userCredential.user.displayName,
      photoURL: userCredential.user.photoURL,
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
    console.log('AuthContext - Usuario registrado:', userDoc.email, 'Rol guardado:', userDoc.role);
  };

  const signInWithGoogle = async () => {
    ensureFirebaseClient();
    if (!auth) throw new Error('Firebase Auth no está inicializado');
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    // User document creation is handled in onAuthStateChanged
  };

  const signOut = async () => {
    ensureFirebaseClient();
    if (!auth) throw new Error('Firebase Auth no está inicializado');
    await firebaseSignOut(auth);
  };

  const sendPasswordReset = async (email: string) => {
    ensureFirebaseClient();
    if (!auth) throw new Error('Firebase Auth no está inicializado');
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        sendPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
