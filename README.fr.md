<div align="center">

![make-api-private](/web/default/public/logo.png)

# Make API Private

馃崶 **Passerelle de mod猫les 茅tendus de nouvelle g茅n茅ration et syst猫me de gestion d'actifs d'IA**

<p align="center">
  <a href="./README.zh_CN.md">绠€浣撲腑鏂?/a> |
  <a href="./README.zh_TW.md">绻侀珨涓枃</a> |
  <a href="./README.md">English</a> |
  <strong>Fran莽ais</strong> |
  <a href="./README.ja.md">鏃ユ湰瑾?/a>
</p>

<p align="center">
  <a href="https://raw.githubusercontent.com/Calcium-Ion/make-api-private/main/LICENSE">
    <img src="https://img.shields.io/github/license/Calcium-Ion/make-api-private?color=brightgreen" alt="licence">
  </a><!--
  --><a href="https://github.com/Calcium-Ion/make-api-private/releases/latest">
    <img src="https://img.shields.io/github/v/release/Calcium-Ion/make-api-private?color=brightgreen&include_prereleases" alt="version">
  </a><!--
  --><a href="https://hub.docker.com/r/CalciumIon/make-api-private">
    <img src="https://img.shields.io/badge/docker-dockerHub-blue" alt="docker">
  </a><!--
  --><a href="https://goreportcard.com/report/github.com/Calcium-Ion/make-api-private">
    <img src="https://goreportcard.com/badge/github.com/Calcium-Ion/make-api-private" alt="GoReportCard">
  </a>
</p>

<p align="center">
  <a href="https://trendshift.io/repositories/20180" target="_blank">
    <img src="https://trendshift.io/api/badge/repositories/20180" alt="QuantumNous%2Fmake-api-private | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/>
  </a>
  <br>
  <a href="https://hellogithub.com/repository/QuantumNous/make-api-private" target="_blank">
    <img src="https://api.hellogithub.com/v1/widgets/recommend.svg?rid=539ac4217e69431684ad4a0bab768811&claim_uid=tbFPfKIDHpc4TzR" alt="Featured锝淗elloGitHub" style="width: 250px; height: 54px;" width="250" height="54" />
  </a><!--
  --><a href="https://www.producthunt.com/products/make-api-private/launches/make-api-private?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-make-api-private" target="_blank" rel="noopener noreferrer">
    <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1047693&theme=light&t=1769577875005" alt="Make API Private - All-in-one AI asset management gateway. | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" />
  </a>
</p>

<p align="center">
  <a href="#-d茅marrage-rapide">D茅marrage rapide</a> 鈥?  <a href="#-fonctionnalit茅s-cl茅s">Fonctionnalit茅s cl茅s</a> 鈥?  <a href="#-d茅ploiement">D茅ploiement</a> 鈥?  <a href="#-documentation">Documentation</a> 鈥?  <a href="#-aide-support">Aide</a>
</p>

</div>

## 馃摑 Description du projet

> [!IMPORTANT]
> - Ce projet est uniquement destin茅 脿 des fins d'apprentissage personnel, sans garantie de stabilit茅 ni de support technique.
> - Les utilisateurs doivent se conformer aux [Conditions d'utilisation](https://openai.com/policies/terms-of-use) d'OpenAI et aux **lois et r茅glementations applicables**, et ne doivent pas l'utiliser 脿 des fins ill茅gales.
> - Conform茅ment aux [銆奙esures provisoires pour la gestion des services d'intelligence artificielle g茅n茅rative銆媇(http://www.cac.gov.cn/2023-07/13/c_1690898327029107.htm), veuillez ne fournir aucun service d'IA g茅n茅rative non enregistr茅 au public en Chine.

---

## 馃 Partenaires de confiance

<p align="center">
  <em>Sans ordre particulier</em>
</p>

<p align="center">
  <a href="https://www.cherry-ai.com/" target="_blank">
    <img src="./docs/images/cherry-studio.png" alt="Cherry Studio" height="80" />
  </a><!--
  --><a href="https://github.com/iOfficeAI/AionUi/" target="_blank">
    <img src="./docs/images/aionui.png" alt="Aion UI" height="80" />
  </a><!--
  --><a href="https://bda.pku.edu.cn/" target="_blank">
    <img src="./docs/images/pku.png" alt="Universit茅 de P茅kin" height="80" />
  </a><!--
  --><a href="https://www.compshare.cn/?ytag=GPU_yy_gh_make-api-private" target="_blank">
    <img src="./docs/images/ucloud.png" alt="UCloud" height="80" />
  </a><!--
  --><a href="https://www.aliyun.com/" target="_blank">
    <img src="./docs/images/aliyun.png" alt="Alibaba Cloud" height="80" />
  </a><!--
  --><a href="https://io.net/" target="_blank">
    <img src="./docs/images/io-net.png" alt="IO.NET" height="80" />
  </a>
</p>

---

## 馃檹 Remerciements sp茅ciaux

<p align="center">
  <a href="https://www.jetbrains.com/?from=make-api-private" target="_blank">
    <img src="https://resources.jetbrains.com/storage/products/company/brand/logos/jb_beam.png" alt="JetBrains Logo" width="120" />
  </a>
</p>

<p align="center">
  <strong>Merci 脿 <a href="https://www.jetbrains.com/?from=make-api-private">JetBrains</a> pour avoir fourni une licence de d茅veloppement open-source gratuite pour ce projet</strong>
</p>

---

## 馃殌 D茅marrage rapide

### Utilisation de Docker Compose (recommand茅)

```bash
# Cloner le projet
git clone https://github.com/QuantumNous/make-api-private.git
cd make-api-private

# Modifier la configuration docker-compose.yml
nano docker-compose.yml

# D茅marrer le service
docker-compose up -d
```

<details>
<summary><strong>Utilisation des commandes Docker</strong></summary>

```bash
# Tirer la derni猫re image
docker pull calciumion/make-api-private:latest

# Utilisation de SQLite (par d茅faut)
docker run --name make-api-private -d --restart always \
  -p 3000:3000 \
  -e TZ=Asia/Shanghai \
  -v ./data:/data \
  calciumion/make-api-private:latest

# Utilisation de MySQL
docker run --name make-api-private -d --restart always \
  -p 3000:3000 \
  -e SQL_DSN="root:123456@tcp(localhost:3306)/oneapi" \
  -e TZ=Asia/Shanghai \
  -v ./data:/data \
  calciumion/make-api-private:latest
```

> **馃挕 Astuce:** `-v ./data:/data` sauvegardera les donn茅es dans le dossier `data` du r茅pertoire actuel, vous pouvez 茅galement le changer en chemin absolu comme `-v /your/custom/path:/data`

</details>

---

馃帀 Apr猫s le d茅ploiement, visitez `http://localhost:3000` pour commencer 脿 utiliser!

馃摉 Pour plus de m茅thodes de d茅ploiement, veuillez vous r茅f茅rer 脿 [Guide de d茅ploiement](https://docs.make-api-private.pro/en/docs/installation)

---

## 馃摎 Documentation

<div align="center">

### 馃摉 [Documentation officielle](https://docs.make-api-private.pro/en/docs) | [![Demander 脿 DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/QuantumNous/make-api-private)

</div>

**Navigation rapide:**

| Cat茅gorie | Lien |
|------|------|
| 馃殌 Guide de d茅ploiement | [Documentation d'installation](https://docs.make-api-private.pro/en/docs/installation) |
| 鈿欙笍 Configuration de l'environnement | [Variables d'environnement](https://docs.make-api-private.pro/en/docs/installation/config-maintenance/environment-variables) |
| 馃摗 Documentation de l'API | [Documentation de l'API](https://docs.make-api-private.pro/en/docs/api) |
| 鉂?FAQ | [FAQ](https://docs.make-api-private.pro/en/docs/support/faq) |
| 馃挰 Interaction avec la communaut茅 | [Canaux de communication](https://docs.make-api-private.pro/en/docs/support/community-interaction) |

---

## 鉁?Fonctionnalit茅s cl茅s

> Pour les fonctionnalit茅s d茅taill茅es, veuillez vous r茅f茅rer 脿 [Pr茅sentation des fonctionnalit茅s](https://docs.make-api-private.pro/en/docs/guide/wiki/basic-concepts/features-introduction) |

### 馃帹 Fonctions principales

| Fonctionnalit茅 | Description |
|------|------|
| 馃帹 Nouvelle interface utilisateur | Conception d'interface utilisateur moderne |
| 馃實 Multilingue | Prend en charge le chinois simplifi茅, le chinois traditionnel, l'anglais, le fran莽ais et le japonais |
| 馃攧 Compatibilit茅 des donn茅es | Compl猫tement compatible avec la base de donn茅es originale de One API |
| 馃搱 Tableau de bord des donn茅es | Console visuelle et analyse statistique |
| 馃敀 Gestion des permissions | Regroupement de jetons, restrictions de mod猫les, gestion des utilisateurs |

### 馃挵 Paiement et facturation

- 鉁?Recharge en ligne (EPay, Stripe)
- 鉁?Tarification des mod猫les de paiement 脿 l'utilisation
- 鉁?Prise en charge de la facturation du cache (OpenAI, Azure, DeepSeek, Claude, Qwen et tous les mod猫les pris en charge)
- 鉁?Configuration flexible des politiques de facturation

### 馃攼 Autorisation et s茅curit茅

- 馃槇 Connexion par autorisation Discord
- 馃 Connexion par autorisation LinuxDO
- 馃摫 Connexion par autorisation Telegram
- 馃攽 Authentification unifi茅e OIDC
- 馃攳 Requ锚te de quota d'utilisation de cl茅 (avec [neko-api-key-tool](https://github.com/Calcium-Ion/neko-api-key-tool))

### 馃殌 Fonctionnalit茅s avanc茅es

**Prise en charge des formats d'API:**
- 鈿?[OpenAI Responses](https://docs.make-api-private.pro/en/docs/api/ai-model/chat/openai/create-response)
- 鈿?[OpenAI Realtime API](https://docs.make-api-private.pro/en/docs/api/ai-model/realtime/create-realtime-session) (y compris Azure)
- 鈿?[Claude Messages](https://docs.make-api-private.pro/en/docs/api/ai-model/chat/create-message)
- 鈿?[Google Gemini](https://doc.make-api-private.pro/en/api/google-gemini-chat)
- 馃攧 [Mod猫les Rerank](https://docs.make-api-private.pro/en/docs/api/ai-model/rerank/create-rerank) (Cohere, Jina)

**Routage intelligent:**
- 鈿栵笍 S茅lection al茅atoire pond茅r茅e des canaux
- 馃攧 Nouvelle tentative automatique en cas d'茅chec
- 馃殾 Limitation du d茅bit du mod猫le pour les utilisateurs

**Conversion de format:**
- 馃攧 **OpenAI Compatible 鈬?Claude Messages**
- 馃攧 **OpenAI Compatible 鈫?Google Gemini**
- 馃攧 **Google Gemini 鈫?OpenAI Compatible** - Texte uniquement, les appels de fonction ne sont pas encore pris en charge
- 馃毀 **OpenAI Compatible 鈬?OpenAI Responses** - En d茅veloppement
- 馃攧 **Fonctionnalit茅 de la pens茅e au contenu**

**Prise en charge de l'effort de raisonnement:**

<details>
<summary>Voir la configuration d茅taill茅e</summary>

**Mod猫les de la s茅rie OpenAI :**
- `o3-mini-high` - Effort de raisonnement 茅lev茅
- `o3-mini-medium` - Effort de raisonnement moyen
- `o3-mini-low` - Effort de raisonnement faible
- `gpt-5-high` - Effort de raisonnement 茅lev茅
- `gpt-5-medium` - Effort de raisonnement moyen
- `gpt-5-low` - Effort de raisonnement faible

**Mod猫les de pens茅e de Claude:**
- `claude-3-7-sonnet-20250219-thinking` - Activer le mode de pens茅e

**Mod猫les de la s茅rie Google Gemini:**
- `gemini-2.5-flash-thinking` - Activer le mode de pens茅e
- `gemini-2.5-flash-nothinking` - D茅sactiver le mode de pens茅e
- `gemini-2.5-pro-thinking` - Activer le mode de pens茅e
- `gemini-2.5-pro-thinking-128` - Activer le mode de pens茅e avec budget de pens茅e de 128 tokens
- Vous pouvez 茅galement ajouter les suffixes `-low`, `-medium` ou `-high` aux mod猫les Gemini pour fixer le niveau d鈥檈ffort de raisonnement (sans suffixe de budget suppl茅mentaire).

</details>

---

## 馃 Prise en charge des mod猫les

> Pour les d茅tails, veuillez vous r茅f茅rer 脿 [Documentation de l'API - Interface de relais](https://docs.make-api-private.pro/en/docs/api)

| Type de mod猫le | Description | Documentation |
|---------|------|------|
| 馃 OpenAI-Compatible | Mod猫les compatibles OpenAI | [Documentation](https://docs.make-api-private.pro/en/docs/api/ai-model/chat/openai/createchatcompletion) |
| 馃 OpenAI Responses | Format OpenAI Responses | [Documentation](https://docs.make-api-private.pro/en/docs/api/ai-model/chat/openai/createresponse) |
| 馃帹 Midjourney-Proxy | [Midjourney-Proxy(Plus)](https://github.com/novicezk/midjourney-proxy) | [Documentation](https://doc.make-api-private.pro/api/midjourney-proxy-image) |
| 馃幍 Suno-API | [Suno API](https://github.com/Suno-API/Suno-API) | [Documentation](https://doc.make-api-private.pro/api/suno-music) |
| 馃攧 Rerank | Cohere, Jina | [Documentation](https://docs.make-api-private.pro/en/docs/api/ai-model/rerank/creatererank) |
| 馃挰 Claude | Format Messages | [Documentation](https://docs.make-api-private.pro/en/docs/api/ai-model/chat/createmessage) |
| 馃寪 Gemini | Format Google Gemini | [Documentation](https://docs.make-api-private.pro/en/docs/api/ai-model/chat/gemini/geminirelayv1beta) |
| 馃敡 Dify | Mode ChatFlow | - |
| 馃幆 Personnalis茅 | Prise en charge de l'adresse d'appel compl猫te | - |

### 馃摗 Interfaces prises en charge

<details>
<summary>Voir la liste compl猫te des interfaces</summary>

- [Interface de discussion (Chat Completions)](https://docs.make-api-private.pro/en/docs/api/ai-model/chat/openai/createchatcompletion)
- [Interface de r茅ponse (Responses)](https://docs.make-api-private.pro/en/docs/api/ai-model/chat/openai/createresponse)
- [Interface d'image (Image)](https://docs.make-api-private.pro/en/docs/api/ai-model/images/openai/post-v1-images-generations)
- [Interface audio (Audio)](https://docs.make-api-private.pro/en/docs/api/ai-model/audio/openai/create-transcription)
- [Interface vid茅o (Video)](https://docs.make-api-private.pro/en/docs/api/ai-model/audio/openai/createspeech)
- [Interface d'incorporation (Embeddings)](https://docs.make-api-private.pro/en/docs/api/ai-model/embeddings/createembedding)
- [Interface de rerank (Rerank)](https://docs.make-api-private.pro/en/docs/api/ai-model/rerank/creatererank)
- [Conversation en temps r茅el (Realtime)](https://docs.make-api-private.pro/en/docs/api/ai-model/realtime/createrealtimesession)
- [Discussion Claude](https://docs.make-api-private.pro/en/docs/api/ai-model/chat/createmessage)
- [Discussion Google Gemini](https://docs.make-api-private.pro/en/docs/api/ai-model/chat/gemini/geminirelayv1beta)

</details>

---

## 馃殺 D茅ploiement

> [!TIP]
> **Derni猫re image Docker:** `calciumion/make-api-private:latest`

### 馃搵 Exigences de d茅ploiement

| Composant | Exigence |
|------|------|
| **Base de donn茅es locale** | SQLite (Docker doit monter le r茅pertoire `/data`)|
| **Base de donn茅es distante | MySQL 鈮?5.7.8 ou PostgreSQL 鈮?9.6 |
| **Moteur de conteneur** | Docker / Docker Compose |

### 鈿欙笍 Configuration des variables d'environnement

<details>
<summary>Configuration courante des variables d'environnement</summary>

| Nom de variable | Description | Valeur par d茅faut |
|--------|------|--------|
| `SESSION_SECRET` | Secret de session (requis pour le d茅ploiement multi-machines) |
| `CRYPTO_SECRET` | Secret de chiffrement (requis pour Redis) | - |
| `SQL_DSN` | Chaine de connexion 脿 la base de donn茅es | - |
| `REDIS_CONN_STRING` | Chaine de connexion Redis | - |
| `STREAMING_TIMEOUT` | D茅lai d'expiration du streaming (secondes) | `300` |
| `STREAM_SCANNER_MAX_BUFFER_MB` | Taille max du buffer par ligne (Mo) pour le scanner SSE ; 脿 augmenter quand les sorties image/base64 sont tr猫s volumineuses (ex. images 4K) | `64` |
| `MAX_REQUEST_BODY_MB` | Taille maximale du corps de requ锚te (Mo, compt茅e **apr猫s d茅compression** ; 茅vite les requ锚tes 茅normes/zip bombs qui saturent la m茅moire). D茅passement 鈬?`413` | `32` |
| `AZURE_DEFAULT_API_VERSION` | Version de l'API Azure | `2025-04-01-preview` |
| `ERROR_LOG_ENABLED` | Interrupteur du journal d'erreurs | `false` |
| `PYROSCOPE_URL` | Adresse du serveur Pyroscope | - |
| `PYROSCOPE_APP_NAME` | Nom de l'application Pyroscope | `make-api-private` |
| `PYROSCOPE_BASIC_AUTH_USER` | Utilisateur Basic Auth Pyroscope | - |
| `PYROSCOPE_BASIC_AUTH_PASSWORD` | Mot de passe Basic Auth Pyroscope | - |
| `PYROSCOPE_MUTEX_RATE` | Taux d'茅chantillonnage mutex Pyroscope | `5` |
| `PYROSCOPE_BLOCK_RATE` | Taux d'茅chantillonnage block Pyroscope | `5` |
| `HOSTNAME` | Nom d'h么te tagu茅 pour Pyroscope | `make-api-private` |

馃摉 **Configuration compl猫te:** [Documentation des variables d'environnement](https://docs.make-api-private.pro/en/docs/installation/config-maintenance/environment-variables)

</details>

### 馃敡 M茅thodes de d茅ploiement

<details>
<summary><strong>M茅thode 1: Docker Compose (recommand茅)</strong></summary>

```bash
# Cloner le projet
git clone https://github.com/QuantumNous/make-api-private.git
cd make-api-private

# Modifier la configuration
nano docker-compose.yml

# D茅marrer le service
docker-compose up -d
```

</details>

<details>
<summary><strong>M茅thode 2: Commandes Docker</strong></summary>

**Utilisation de SQLite:**
```bash
docker run --name make-api-private -d --restart always \
  -p 3000:3000 \
  -e TZ=Asia/Shanghai \
  -v ./data:/data \
  calciumion/make-api-private:latest
```

**Utilisation de MySQL:**
```bash
docker run --name make-api-private -d --restart always \
  -p 3000:3000 \
  -e SQL_DSN="root:123456@tcp(localhost:3306)/oneapi" \
  -e TZ=Asia/Shanghai \
  -v ./data:/data \
  calciumion/make-api-private:latest
```

> **馃挕 Explication du chemin:**
> - `./data:/data` - Chemin relatif, donn茅es sauvegard茅es dans le dossier data du r茅pertoire actuel
> - Vous pouvez 茅galement utiliser un chemin absolu, par exemple : `/your/custom/path:/data`

</details>

<details>
<summary><strong>M茅thode 3: Panneau BaoTa</strong></summary>

1. Installez le panneau BaoTa (version 鈮?9.2.0)
2. Recherchez **New-API** dans le magasin d'applications
3. Installation en un clic

馃摉 [Tutoriel avec des images](./docs/BT.md)

</details>

### 鈿狅笍 Consid茅rations sur le d茅ploiement multi-machines

> [!WARNING]
> - **Doit d茅finir** `SESSION_SECRET` - Sinon l'茅tat de connexion sera incoh茅rent sur plusieurs machines
> - **Redis partag茅 doit d茅finir** `CRYPTO_SECRET` - Sinon les donn茅es ne pourront pas 锚tre d茅chiffr茅es

### 馃攧 Nouvelle tentative de canal et cache

**Configuration de la nouvelle tentative:** `Param猫tres 鈫?Param猫tres de fonctionnement 鈫?Param猫tres g茅n茅raux 鈫?Nombre de tentatives en cas d'茅chec`

**Configuration du cache:**
- `REDIS_CONN_STRING`: Cache Redis (recommand茅)
- `MEMORY_CACHE_ENABLED`: Cache m茅moire

---

## 馃敆 Projets connexes

### Projets en amont

| Projet | Description |
|------|------|
| [One API](https://github.com/songquanpeng/one-api) | Base du projet original |
| [Midjourney-Proxy](https://github.com/novicezk/midjourney-proxy) | Prise en charge de l'interface Midjourney |

### Outils d'accompagnement

| Projet | Description |
|------|------|
| [neko-api-key-tool](https://github.com/Calcium-Ion/neko-api-key-tool) | Outil de recherche de quota d'utilisation avec une cl茅 |
| [make-api-private-horizon](https://github.com/Calcium-Ion/make-api-private-horizon) | Version optimis茅e haute performance de Make API Private |

---

## 馃挰 Aide et support

### 馃摉 Ressources de documentation

| Ressource | Lien |
|------|------|
| 馃摌 FAQ | [FAQ](https://docs.make-api-private.pro/en/docs/support/faq) |
| 馃挰 Interaction avec la communaut茅 | [Canaux de communication](https://docs.make-api-private.pro/en/docs/support/community-interaction) |
| 馃悰 Commentaires sur les probl猫mes | [Commentaires sur les probl猫mes](https://docs.make-api-private.pro/en/docs/support/feedback-issues) |
| 馃摎 Documentation compl猫te | [Documentation officielle](https://docs.make-api-private.pro/en/docs) |

### 馃 Guide de contribution

Bienvenue 脿 toutes les formes de contribution!

- 馃悰 Signaler des bogues
- 馃挕 Proposer de nouvelles fonctionnalit茅s
- 馃摑 Am茅liorer la documentation
- 馃敡 Soumettre du code

---

## 馃摐 Licence

Ce projet est sous licence [GNU Affero General Public License v3.0 (AGPLv3)](./LICENSE).

Il s'agit d'un projet open-source d茅velopp茅 sur la base de [One API](https://github.com/songquanpeng/one-api) (licence MIT).

Si les politiques de votre organisation ne permettent pas l'utilisation de logiciels sous licence AGPLv3, ou si vous souhaitez 茅viter les obligations open-source de l'AGPLv3, veuillez nous contacter 脿 : [support@quantumnous.com](mailto:support@quantumnous.com)

---

## 馃専 Historique des 茅toiles

<div align="center">

[![Graphique de l'historique des 茅toiles](https://api.star-history.com/svg?repos=Calcium-Ion/make-api-private&type=Date)](https://star-history.com/#Calcium-Ion/make-api-private&Date)

</div>

---

<div align="center">

### 馃挅 Merci d'utiliser Make API Private

Si ce projet vous est utile, bienvenue 脿 nous donner une 猸愶笍 脡toile锛?
**[Documentation officielle](https://docs.make-api-private.pro/en/docs)** 鈥?**[Commentaires sur les probl猫mes](https://github.com/Calcium-Ion/make-api-private/issues)** 鈥?**[Derni猫re version](https://github.com/Calcium-Ion/make-api-private/releases)**

<sub>Construit avec 鉂わ笍 par QuantumNous</sub>

</div>

