'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './SignUp.module.css'; // Importamos el CSS

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      alert('Error al registrarse: ' + error.message);
    } else {
      alert('¡Registro exitoso! Revisa tu correo para verificar tu cuenta.');
      router.push('/auth-pages/sign-in'); // Redirige a la página de Sign In
    }
  };

  return (
    <div className={styles['page-container']}>
      <div className={styles['form-container']}>
        <h1 className={styles['title']}>Registrarse</h1>
        <form onSubmit={handleSignUp} className="flex flex-col gap-4 w-full">
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles['input-field']}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles['input-field']}
          />
          <button type="submit" className={styles['submit-button']}>
            Registrarse
          </button>
        </form>

        <p className="mt-4 text-white">
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth-pages/sign-in" className={styles['link']}>
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
