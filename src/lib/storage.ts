import type { Comment } from '../types';

const STORAGE_KEY = 'comments:v1';

const seedComments: Comment[] = [
  {
    id: crypto.randomUUID(),
    author: 'María González',
    text: 'Este artículo explica muy bien el tema, gracias por compartirlo.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    author: 'Carlos Ramírez',
    text: '¿Podrían agregar más ejemplos prácticos en la siguiente entrega?',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    author: 'Ana Torres',
    text: 'Excelente iniciativa para mejorar la accesibilidad del sitio.',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
];

export function loadComments(): Comment[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    saveComments(seedComments);
    return seedComments;
  }
  return JSON.parse(raw) as Comment[];
}

export function saveComments(comments: Comment[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
}
