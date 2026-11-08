import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Categorias do blog. Mudar aqui muda menu, filtro e URL /blog/categoria/<slug>/.
export const CATEGORIAS = {
  dicas: { nome: 'Dicas', desc: 'Uma dica prática por dia útil sobre vender mais: atendimento, time comercial, CRM e marketing.' },
  mercado: { nome: 'Mercado', desc: 'O que mudou no mercado e o que isso muda no caixa e no time da sua empresa.' },
  resultados: { nome: 'Resultados', desc: 'Cases reais de clientes da VIA Growth, com número antes e depois.' },
} as const;

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    titulo: z.string().max(90),
    capa: image(), // foto de capa, ao lado do .md (img/<slug>.jpg)
    capaAlt: z.string(),
    capaCredito: z.object({ autor: z.string(), url: z.string().url() }).optional(),
    resumo: z.string().max(170), // vira meta description
    data: z.coerce.date(),
    categoria: z.enum(['dicas', 'mercado', 'resultados']),
    tags: z.array(z.string()).default([]),
    atualizado: z.coerce.date().optional(),
    rascunho: z.boolean().default(false), // true = não publica
  }),
});

export const collections = { blog };
