/**
 * OdontoTrade — Seed Script
 * Cria categorias, usuários e anúncios de teste via API.
 * Uso: node scripts/seed.mjs
 */

const API = "http://localhost:8080/api/v1"

// ── Usuários falsos ───────────────────────────────────────────────────────────
const USERS = [
  { name: "Ana Paula Ferreira", email: "ana@unifio.edu.br",    password: "senha123" },
  { name: "Carlos Eduardo Lima", email: "carlos@unifio.edu.br", password: "senha123" },
  { name: "Beatriz Campos",      email: "bia@unifio.edu.br",   password: "senha123" },
  { name: "Rafael Oliveira",     email: "rafael@unifio.edu.br", password: "senha123" },
  { name: "Mariana Costa",       email: "mari@unifio.edu.br",  password: "senha123" },
]

// ── Categorias odontológicas ──────────────────────────────────────────────────
const CATEGORIES = [
  { name: "Cirurgia",            slug: "cirurgia"       },
  { name: "Endodontia (Canal)",  slug: "endodontia"     },
  { name: "Dentística",          slug: "dentistica"     },
  { name: "Periodontia",         slug: "periodontia"    },
  { name: "Odontopediatria",     slug: "pediatria"      },
  { name: "Estética Dental",     slug: "estetica"       },
  { name: "Prótese",             slug: "protese"        },
  { name: "Ortodontia",          slug: "ortodontia"     },
  { name: "Radiologia",          slug: "radiologia"     },
  { name: "Anestesiologia",      slug: "anestesiologia" },
  { name: "Materiais Gerais",    slug: "materiais"      },
  { name: "Equipamentos",        slug: "equipamentos"   },
]

// Imagens públicas de produtos odontológicos (Unsplash/Pexels — sem auth)
const IMGS = {
  kit_cirurgia:    "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=600",
  fórceps:        "https://images.unsplash.com/photo-1588776814546-1ffedaf72aa2?w=600",
  resina:          "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600",
  fotopolimerizador: "https://images.unsplash.com/photo-1629909615184-74f495363b67?w=600",
  espelho:         "https://images.unsplash.com/photo-1584515933487-779824d29309?w=600",
  sonda:           "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600",
  gesso:           "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=600",
  braquete:        "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=600",
  radiografia:     "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600",
  turbina:         "https://images.unsplash.com/photo-1629909615184-74f495363b67?w=600",
  luva:            "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600",
  cadeira:         "https://images.unsplash.com/photo-1581595219315-a187dd40c322?w=600",
}

// ── Anúncios falsos ───────────────────────────────────────────────────────────
// Cada listing referencia: categorySlug, user index, e dados do produto
const LISTINGS_TEMPLATE = [
  // Cirurgia
  {
    categorySlug: "cirurgia",
    userIndex: 0,
    title: "Kit de Cirurgia Básica — Completo",
    description: "Quantidade: 1 kit completo\n\nKit completo para cirurgia básica da disciplina de Cirurgia I. Inclui: bisturi cabo nº 3 e 4, afastadores Minnesota, curetas de Lucas, porta-agulha Mayo-Hegar e tesouras cirúrgicas. Todos os instrumentais esterilizados e em perfeito estado. Usado apenas em 2 semestres.",
    price: 280.00,
    imageUrls: [IMGS.kit_cirurgia],
  },
  {
    categorySlug: "cirurgia",
    userIndex: 2,
    title: "Fórceps #150 e #151 — Par Superior e Inferior",
    description: "Quantidade: 2 peças (par)\n\nFórceps para extração de dentes superiores (#150) e inferiores (#151). Marca Duflex. Excelente estado de conservação. Vendo pois já concluí a disciplina de Cirurgia.",
    price: 95.00,
    imageUrls: [IMGS.fórceps],
  },
  {
    categorySlug: "cirurgia",
    userIndex: 4,
    title: "Bisturi Cabo nº 3 — Inox Cirúrgico",
    description: "Quantidade: 1 unidade\n\nBisturi cirúrgico cabo nº 3, aço inox de alta qualidade. Compatível com lâminas 10, 11, 12 e 15. Nunca usado em paciente real, apenas em simulações. Esterilizado.",
    price: 38.00,
    imageUrls: [IMGS.kit_cirurgia],
  },

  // Endodontia
  {
    categorySlug: "endodontia",
    userIndex: 1,
    title: "Kit Endodontia — Limas, Régua e Espaçadores",
    description: "Quantidade: 1 kit\n\nKit completo de Endodontia: limas K-file nº 15 ao 40 (2 caixas cada), limas Hedstroem, espaçadores digitais, régua endodôntica e localizador apical Foramatron. Estado: bom uso. Já concluí Canal II.",
    price: 190.00,
    imageUrls: [IMGS.sonda],
  },
  {
    categorySlug: "endodontia",
    userIndex: 3,
    title: "Localizador Apical Propex Pixi — Dentsply",
    description: "Quantidade: 1 unidade\n\nLocalizador apical eletrônico Propex Pixi da Dentsply. Funcionando perfeitamente. Acompanha cabos e ponteiras. Troco por material de Dentística + diferença.",
    price: 450.00,
    imageUrls: [IMGS.fotopolimerizador],
  },

  // Dentística
  {
    categorySlug: "dentistica",
    userIndex: 0,
    title: "Resina Filtek Z350 XT — Kit 5 Cores",
    description: "Quantidade: 5 seringas (1 kit)\n\nKit Filtek Z350 XT da 3M com 5 seringas de resina: A1, A2, A3, A3.5 e C2. Seringas com cerca de 60% do conteúdo original. Prazo de validade ok. Ideal para toda a disciplina de Dentística.",
    price: 120.00,
    imageUrls: [IMGS.resina],
  },
  {
    categorySlug: "dentistica",
    userIndex: 2,
    title: "Fotopolimerizador LED Radii Plus — SDI",
    description: "Quantidade: 1 unidade\n\nFotopolimerizador Radii Plus da SDI. Intensidade de luz excelente, >1200 mW/cm². Bateria dura cerca de 40min contínuos. Acompanha protetor ocular e carregador. Pequeno arranhão na carcaça, sem afetar funcionamento.",
    price: 380.00,
    imageUrls: [IMGS.fotopolimerizador],
  },
  {
    categorySlug: "dentistica",
    userIndex: 4,
    title: "Sistema Matriz Tofflemire + Bandas — Completo",
    description: "Quantidade: 1 porta-matriz + 10 bandas\n\nPorta-matriz Tofflemire com 10 bandas metálicas de diferentes tamanhos. Marca Maquira. Perfeito para restaurações classe II. Higienizado e em bom estado.",
    price: 45.00,
    imageUrls: [IMGS.espelho],
  },

  // Periodontia
  {
    categorySlug: "periodontia",
    userIndex: 1,
    title: "Curetas Gracey — Kit Completo 7 Peças",
    description: "Quantidade: 7 peças (kit)\n\nKit Curetas Gracey 1/2, 3/4, 5/6, 7/8, 11/12, 13/14 e 15/16. Marca Quinelato. Afiadas e em ótimo estado. Usadas por 1 semestre na disciplina de Periodontia I. Acompanha estojo.",
    price: 165.00,
    imageUrls: [IMGS.sonda],
  },
  {
    categorySlug: "periodontia",
    userIndex: 3,
    title: "Sonda OMS Periodontal — Hu-Friedy",
    description: "Quantidade: 2 unidades\n\nSondas periodontais OMS da Hu-Friedy. Graduação milimétrica nítida. Pontas em excelente estado. Vendo pois tenho par sobressalente.",
    price: 55.00,
    imageUrls: [IMGS.sonda],
  },

  // Odontopediatria
  {
    categorySlug: "pediatria",
    userIndex: 0,
    title: "Kit Pedo — Instrumentais Pediátricos Completo",
    description: "Quantidade: 1 kit\n\nKit completo de instrumentais pediátricos: espelho nº 4 cabo fino, sonda exploradora, pinça clínica, brunidor, espátula, porta-amálgama pequeno e colhedores de dentina. Todos em aço inox de qualidade. Nunca usado em paciente.",
    price: 98.00,
    imageUrls: [IMGS.espelho],
  },
  {
    categorySlug: "pediatria",
    userIndex: 4,
    title: "Coroas de Aço Inox Pediátricas — Kit 24 Peças",
    description: "Quantidade: 24 coroas (kit)\n\nKit com 24 coroas de aço inox para dentes decíduos. Tamanhos variados para molares superiores e inferiores. 3M ESPE. Nunca utilizadas. Comprei extra e não precisei.",
    price: 75.00,
    imageUrls: [IMGS.espelho],
  },

  // Estética
  {
    categorySlug: "estetica",
    userIndex: 2,
    title: "Kit Clareamento — Moldeiras + Géis 10%",
    description: "Quantidade: 1 kit completo\n\nKit de clareamento caseiro: 2 moldeiras termoplásticas + 6 seringas de gel Whiteness Perfect 10% FGM. Seringas lacradas, nunca abertas. Acompanha protetor labial e seringa de saliva.",
    price: 85.00,
    imageUrls: [IMGS.resina],
  },
  {
    categorySlug: "estetica",
    userIndex: 1,
    title: "Guia de Cores Vita Classical — Original",
    description: "Quantidade: 1 guia completo\n\nGuia de cores Vita Classical original com todos os matizes (A1-D4). Perfeito para seleção de cor em restaurações e próteses. Estado impecável.",
    price: 130.00,
    imageUrls: [IMGS.resina],
  },

  // Prótese
  {
    categorySlug: "protese",
    userIndex: 3,
    title: "Articulador Semi-Ajustável Bioart A7 Plus",
    description: "Quantidade: 1 unidade\n\nArticulador semi-ajustável Bioart A7 Plus. Excelente para montagem de modelos e planejamento protético. Acompanha arco facial e valores de referência. Usado em 2 semestres de Prótese Total.",
    price: 320.00,
    imageUrls: [IMGS.gesso],
  },
  {
    categorySlug: "protese",
    userIndex: 0,
    title: "Gesso Especial Tipo IV Herostone — 5kg",
    description: "Quantidade: 2 embalagens de 5kg\n\nGesso especial tipo IV Herostone para modelos de precisão. 2 embalagens de 5kg, sendo uma lacrada e outra com ~70% do conteúdo. Excelente para trabalhos de Prótese.",
    price: 110.00,
    imageUrls: [IMGS.gesso],
  },

  // Ortodontia
  {
    categorySlug: "ortodontia",
    userIndex: 4,
    title: "Kit Braquetes Metálicos MBT .022 — Dentsply",
    description: "Quantidade: 80 braquetes (kit completo)\n\nKit de braquetes metálicos Roth/MBT slot .022 da Dentsply. Superiores e inferiores completo + tubos molares. Embalagem original, nunca utilizado em paciente.",
    price: 145.00,
    imageUrls: [IMGS.braquete],
  },
  {
    categorySlug: "ortodontia",
    userIndex: 2,
    title: "Alicate 139 + Alicate Weingart — Ortho",
    description: "Quantidade: 2 peças\n\nDupla de alicates essenciais para Ortodontia: alicate 139 (dobras de terceira ordem) e alicate Weingart para inserção de arcos. Marca Morelli. Bom estado, pontas sem desgaste.",
    price: 88.00,
    imageUrls: [IMGS.kit_cirurgia],
  },

  // Radiologia
  {
    categorySlug: "radiologia",
    userIndex: 1,
    title: "Posicionadores Radiográficos — Kit 3 Peças",
    description: "Quantidade: 3 posicionadores (kit)\n\nKit posicionadores radiográficos para técnica do paralelismo: anterior, posterior superior e posterior inferior. Marca DENTSPLY Rinn XCP. Excelente estado.",
    price: 65.00,
    imageUrls: [IMGS.radiografia],
  },

  // Anestesiologia
  {
    categorySlug: "anestesiologia",
    userIndex: 3,
    title: "Seringa Carpule Aspirante — Inox Duflex",
    description: "Quantidade: 2 unidades\n\nSeringas carpule aspirantes de aço inox Duflex. Trava de segurança perfeita, anel de borracha novo. Limpas e esterilizadas. Vendo pois me formei e não usarei mais.",
    price: 70.00,
    imageUrls: [IMGS.sonda],
  },

  // Materiais Gerais
  {
    categorySlug: "materiais",
    userIndex: 0,
    title: "Alginato Jeltrate Plus — 2 Embalagens 450g",
    description: "Quantidade: 2 embalagens\n\nAlginato cromático Jeltrate Plus da Dentsply. 2 embalagens de 450g, uma lacrada e outra com metade do conteúdo. Excelente para moldagens diagnósticas.",
    price: 55.00,
    imageUrls: [IMGS.gesso],
  },
  {
    categorySlug: "materiais",
    userIndex: 4,
    title: "Cimento de Ionômero de Vidro Ketac Molar — 3M",
    description: "Quantidade: 1 kit (pó + líquido)\n\nCIV Ketac Molar Easymix da 3M. Kit completo com pó (15g) e líquido. Cerca de 50% de uso. Prazo de validade dentro do período. Ideal para restaurações ART.",
    price: 40.00,
    imageUrls: [IMGS.resina],
  },

  // Equipamentos
  {
    categorySlug: "equipamentos",
    userIndex: 2,
    title: "Turbina de Alta Rotação — Kavo 650B",
    description: "Quantidade: 1 unidade\n\nTurbina Kavo Intra 650B. Revisada recentemente, cabeça e rolamentos novos. Spray de água funcionando. Conexão borden de 2 furos. Excelente para uso clínico.",
    price: 550.00,
    imageUrls: [IMGS.turbina],
  },
  {
    categorySlug: "equipamentos",
    userIndex: 1,
    title: "Micromotor Elétrico BLM 600 — Bio Art",
    description: "Quantidade: 1 unidade + contra-ângulo\n\nMicromotor elétrico BLM 600 da Bio Art com contra-ângulo 1:5 com luz. Torque excepcional. Perfeito estado. Troco por material de Endodontia ou vendo.",
    price: 420.00,
    imageUrls: [IMGS.turbina],
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
async function post(path, body, token) {
  const headers = { "Content-Type": "application/json" }
  if (token) headers["Authorization"] = `Bearer ${token}`
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}: ${json.message ?? JSON.stringify(json)}`)
  return json.data ?? json
}

async function get(path, token) {
  const headers = {}
  if (token) headers["Authorization"] = `Bearer ${token}`
  const res = await fetch(`${API}${path}`, { headers })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`)
  return json.data ?? json
}

function log(emoji, msg) {
  console.log(`${emoji}  ${msg}`)
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n🦷  OdontoTrade Seed Script\n" + "─".repeat(50))

  // 1. Criar categorias
  log("📂", "Criando categorias...")
  const categoryMap = {} // slug → id
  let existingCategories = []
  try {
    existingCategories = await get("/categories")
    for (const cat of existingCategories) {
      categoryMap[cat.slug] = cat.id
    }
    log("✅", `${existingCategories.length} categorias já existem no banco`)
  } catch {
    log("⚠️", "Não foi possível buscar categorias existentes")
  }

  for (const cat of CATEGORIES) {
    if (categoryMap[cat.slug]) {
      log("⏭️", `Categoria '${cat.name}' já existe, pulando`)
      continue
    }
    try {
      const created = await post("/categories", cat)
      categoryMap[cat.slug] = created.id
      log("✅", `Categoria criada: ${cat.name}`)
    } catch (err) {
      log("⚠️", `Não foi possível criar '${cat.name}': ${err.message}`)
      // Tenta encontrar pelo nome nas existentes
      const found = existingCategories.find(c =>
        c.name.toLowerCase().includes(cat.slug) || c.slug === cat.slug
      )
      if (found) categoryMap[cat.slug] = found.id
    }
  }

  // 2. Registrar usuários
  log("\n👥", "Registrando usuários...")
  const tokens = []
  for (const user of USERS) {
    try {
      const data = await post("/auth/register", user)
      tokens.push(data.token)
      log("✅", `Usuário criado: ${user.name} (${user.email})`)
    } catch {
      try {
        const data = await post("/auth/login", { email: user.email, password: user.password })
        tokens.push(data.token)
        log("⏭️", `Usuário já existe, logado: ${user.name}`)
      } catch (err2) {
        log("❌", `Falha com ${user.name}: ${err2.message}`)
        tokens.push(null)
      }
    }
  }

  // 3. Criar anúncios
  log("\n📦", "Criando anúncios...")
  let created = 0
  for (const listing of LISTINGS_TEMPLATE) {
    const token = tokens[listing.userIndex]
    if (!token) {
      log("⏭️", `Token indisponível para o anúncio: ${listing.title}`)
      continue
    }
    const categoryId = categoryMap[listing.categorySlug]
    try {
      await post(
        "/listings",
        {
          title: listing.title,
          description: listing.description,
          price: listing.price,
          categoryId: categoryId ?? undefined,
          imageUrls: listing.imageUrls,
        },
        token
      )
      created++
      log("✅", `Anúncio: ${listing.title}`)
    } catch (err) {
      log("❌", `Falha: ${listing.title} — ${err.message}`)
    }
  }

  console.log("\n" + "─".repeat(50))
  console.log(`🎉  Seed concluído! ${created}/${LISTINGS_TEMPLATE.length} anúncios criados.\n`)
}

main().catch((err) => {
  console.error("❌ Erro fatal:", err)
  process.exit(1)
})
