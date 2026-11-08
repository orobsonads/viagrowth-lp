import { getCollection, type CollectionEntry } from 'astro:content';
import { CATEGORIAS } from '../content.config';

export type Post = CollectionEntry<'blog'>;

/** Posts publicados, mais novo primeiro. Rascunho e post com data futura ficam de fora. */
export async function getPosts(): Promise<Post[]> {
  const agora = Date.now();
  const todos = await getCollection('blog', ({ data }) => !data.rascunho && data.data.getTime() <= agora);
  return todos.sort((a, b) => b.data.data.getTime() - a.data.data.getTime());
}

export const nomeCategoria = (c: keyof typeof CATEGORIAS) => CATEGORIAS[c].nome;

const fmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'America/Sao_Paulo' });
export const dataBR = (d: Date) => fmt.format(d).replace('.', '');

/** Minutos de leitura (~200 palavras/min). */
export function leitura(body: string | undefined): number {
  const palavras = (body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palavras / 200));
}

export const urlPost = (p: Post) => `/blog/${p.id}/`;
