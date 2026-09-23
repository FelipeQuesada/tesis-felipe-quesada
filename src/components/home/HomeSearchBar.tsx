'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function HomeSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    router.push(q ? `/workshops?q=${encodeURIComponent(q)}` : '/workshops');
  };

  return (
    <form className="home-search" onSubmit={submit} role="search">
      <input
        type="search"
        className="home-search-input"
        placeholder="¿Qué querés aprender?"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Buscar talleres"
      />
      <button type="submit" className="home-search-btn">
        Buscar
      </button>
    </form>
  );
}
