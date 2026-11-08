"""Gera a imagem de compartilhamento (1200x630) de cada post do blog.

E a imagem que aparece quando o link e mandado no WhatsApp, LinkedIn etc.
Foto de capa do post + escurecimento + titulo + logo branca.

Rodar na raiz do site sempre que entrar post novo (so gera o que falta):
    python scripts/gerar_og.py            # gera os que faltam
    python scripts/gerar_og.py --todos    # refaz todos
Saida: public/og/<slug>.png (vai pro git; o Netlify nao roda Python).
"""
import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

RAIZ = Path(__file__).resolve().parent.parent
POSTS = RAIZ / "src" / "content" / "blog"
SAIDA = RAIZ / "public" / "og"
LOGO = RAIZ / "public" / "embaixadores" / "logo-via-branca.png"
W, H = 1200, 630
ACENTO = (0, 128, 150)

FONTES = [r"C:\Windows\Fonts\segoeuib.ttf", r"C:\Windows\Fonts\arialbd.ttf"]
FONTES_REG = [r"C:\Windows\Fonts\segoeui.ttf", r"C:\Windows\Fonts\arial.ttf"]


def fonte(lista, tam):
    for f in lista:
        if Path(f).exists():
            return ImageFont.truetype(f, tam)
    return ImageFont.load_default(tam)


def frontmatter(md: Path) -> dict:
    txt = md.read_text(encoding="utf-8")
    bloco = txt.split("---", 2)[1]
    dados = {}
    for chave in ("titulo", "capa", "categoria"):
        m = re.search(rf'^{chave}:\s*"?(.*?)"?\s*$', bloco, re.M)
        dados[chave] = m.group(1) if m else ""
    return dados


def quebrar(draw, texto, f, largura):
    linhas, atual = [], ""
    for palavra in texto.split():
        teste = (atual + " " + palavra).strip()
        if draw.textlength(teste, font=f) <= largura:
            atual = teste
        else:
            linhas.append(atual)
            atual = palavra
    linhas.append(atual)
    return linhas


def capa_preenchida(caminho: Path) -> Image.Image:
    im = Image.open(caminho).convert("RGB")
    r = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
    x, y = (im.width - W) // 2, (im.height - H) // 2
    return im.crop((x, y, x + W, y + H))


def gerar(md: Path):
    d = frontmatter(md)
    base = capa_preenchida((md.parent / d["capa"]).resolve())
    # escurece de baixo pra cima pra o titulo ler bem em qualquer foto
    sombra = Image.new("L", (1, H))
    for y in range(H):
        sombra.putpixel((0, y), int(70 + 170 * (y / H) ** 1.2))
    escuro = Image.new("RGB", (W, H), (12, 14, 18))
    base = Image.composite(escuro, base, sombra.resize((W, H)))

    draw = ImageDraw.Draw(base)
    tam = 64
    while True:
        f = fonte(FONTES, tam)
        linhas = quebrar(draw, d["titulo"], f, W - 160)
        if len(linhas) <= 3 or tam <= 44:
            break
        tam -= 4
    alt = tam + 12
    y = H - 80 - alt * len(linhas)
    cat = {"dicas": "DICA", "mercado": "MERCADO", "resultados": "RESULTADO"}.get(d["categoria"], "BLOG")
    draw.rectangle([80, y - 52, 80 + 6, y - 30], fill=ACENTO)
    draw.text((96, y - 56), f"{cat}  ·  BLOG DA VIA GROWTH", font=fonte(FONTES_REG, 22), fill=(220, 225, 230))
    for i, linha in enumerate(linhas):
        draw.text((80, y + i * alt), linha, font=f, fill="white")

    if LOGO.exists():
        logo = Image.open(LOGO).convert("RGBA")
        r = 44 / logo.height
        logo = logo.resize((round(logo.width * r), 44), Image.LANCZOS)
        base.paste(logo, (80, 60), logo)
    draw.rectangle([0, H - 10, W, H], fill=ACENTO)

    SAIDA.mkdir(parents=True, exist_ok=True)
    destino = SAIDA / f"{md.stem}.png"
    base.save(destino, optimize=True)
    return destino


if __name__ == "__main__":
    todos = "--todos" in sys.argv
    for md in sorted(POSTS.glob("*.md")):
        if todos or not (SAIDA / f"{md.stem}.png").exists():
            print("gerado:", gerar(md).relative_to(RAIZ))
