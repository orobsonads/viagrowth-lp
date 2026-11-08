import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, urlPost } from '../lib/posts';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: 'Blog da VIA Growth',
    description: 'Dicas de tráfego, atendimento e vendas, mais o que mudou no mercado.',
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.titulo,
      description: p.data.resumo,
      pubDate: p.data.data,
      link: urlPost(p),
      categories: [p.data.categoria, ...p.data.tags],
    })),
    customData: '<language>pt-BR</language>',
  });
}
