// A home é a LP aprovada (src/lp/home.html), servida byte a byte.
// O build só troca o marcador <!--ULTIMOS_POSTS--> pelos 3 posts mais novos
// e, fora de produção, põe noindex. Formulário, rastreio e dataLayer ficam intactos.
import home from '../lp/home.html?raw';
import { getImage } from 'astro:assets';
import { getPosts, dataBR, nomeCategoria, urlPost } from '../lib/posts';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function GET() {
  const posts = (await getPosts()).slice(0, 3);
  const thumbs = await Promise.all(posts.map((p) => getImage({ src: p.data.capa, width: 700, format: 'webp' })));
  const bloco = posts.length === 0 ? '' : `
  <section class="bg-alt" id="blog">
    <div class="container">
      <div class="section-header">
        <div class="eyebrow">Do blog</div>
        <h2>Dica nova <span class="accent">todo dia útil.</span></h2>
        <p class="section-sub">Marketing e vendas explicados pra quem toca o negócio. Atendimento, time comercial, CRM e anúncios, sem enrolação.</p>
      </div>
      <div class="home-blog-grid">${posts.map((p, i) => `
        <a class="home-post" href="${urlPost(p)}">
          <img class="home-post-img" src="${thumbs[i].src}" alt="" width="700" height="394" loading="lazy" decoding="async">
          <span class="home-post-cat">${esc(nomeCategoria(p.data.categoria))} · ${dataBR(p.data.data)}</span>
          <h3>${esc(p.data.titulo)}</h3>
          <p>${esc(p.data.resumo)}</p>
        </a>`).join('')}
      </div>
      <div class="home-blog-more"><a href="/blog/" class="btn btn-ghost btn-lg">Ver todos os posts</a></div>
    </div>
  </section>`;

  let html = home.replace('<!--ULTIMOS_POSTS-->', bloco);
  if (process.env.CONTEXT && process.env.CONTEXT !== 'production') {
    html = html.replace('<meta charset="UTF-8" />', '<meta charset="UTF-8" />\n  <meta name="robots" content="noindex, nofollow" />');
  }
  if (!html.includes('rel="canonical"')) {
    html = html.replace('</title>', '</title>\n  <link rel="canonical" href="https://viagrowth.com.br/" />');
  }
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
