import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://viagrowth.com.br',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      customPages: ['https://viagrowth.com.br/'], // a home é endpoint, o sitemap não acha sozinho
      // embaixadores é página de parceiro, não de busca
      filter: (page) => !page.includes('/embaixadores/'),
    }),
  ],
});
