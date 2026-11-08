import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Categorias do blog. Mudar aqui muda menu, filtro e URL /blog/categoria/<slug>/.
export const CATEGORIAS = {
  dicas: { nome: 'Dicas', desc: 'Uma dica prática por dia útil, pra aplicar no mesmo dia.' },
  mercado: { nome: 'Mercado', desc: 'O que mudou em Meta, Google, WhatsApp e IA, e o que isso muda pro seu negócio.' },
  resultados: { nome: 'Resultados', desc: 'Cases reais de clientes da VIA Growth, com número antes e depois.' },
} as const;

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    titulo: z.string().max(90),
    resumo: z.string().max(170), // vira meta description
    data: z.coerce.date(),
    categoria: z.enum(['dicas', 'mercado', 'resultados']),
    tags: z.array(z.string()).default([]),
    atualizado: z.coerce.date().optional(),
    rascunho: z.boolean().default(false), // true = não publica
  }),
});

export const collections = { blog };
