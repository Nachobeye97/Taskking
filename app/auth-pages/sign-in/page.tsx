'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './SignIn.module.css'; // Importamos el CSS

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert('Error al iniciar sesión: ' + error.message);
    } else {
      router.push('/auth-pages/dashboard'); // Redirige a una página protegida o al home
    }
  };

  return (
    <div className={styles['page-container']}>
      <div className={styles['form-container']}>
        <h1 className={styles['title']}>Iniciar sesión</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full">
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
            Iniciar sesión
          </button>
        </form>

        <p className="mt-4 text-white">
          ¿No tienes cuenta?{' '}
          <Link href="/auth-pages/sign-up" className={styles['link']}>
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
