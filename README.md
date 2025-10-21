# YouTube.lol

YouTube.lol est une réplique locale de YouTube Premium fonctionnant entièrement sur fichiers. Aucune base de données : comptes, vidéos, métadonnées et commentaires sont stockés dans des fichiers JSON et des médias sur disque. L'objectif est de proposer une expérience fluide, sombre et moderne, inspirée de YouTube Premium, tout en restant 100% hors ligne et auto-hébergée.

## Fonctionnalités clés

- 🔐 **Authentification locale** : inscription et connexion avec stockage des utilisateurs dans `/users/*.json`.
- 📼 **Upload de vidéos** : envoi de fichiers `.mp4`, `.mov`, `.webm` jusqu'à 500 Mo, validation MIME et taille, thumbnails dédiés.
- 🛡️ **Validation administrateur** : approbation, rejet, renommage et suppression des vidéos en attente (`/data/pending`).
- ✅ **Badges vérifiés** : attribuez le badge officiel aux créateurs depuis le panel admin.
- 💬 **Engagement** : likes, dislikes et commentaires stockés dans les fichiers de métadonnées (`/data/meta/*.json`).
- 🔍 **Recherche locale** : par titre, tags, créateur ou description.
- 🧭 **Pages publiques** :
  - `/home` – flux des dernières vidéos publiées,
  - `/watch/<id>` – lecteur vidéo premium avec mini player, vitesse, volume et PiP,
  - `/channel/<username>` – page chaîne avec bannière, compteur d'abonnés, badge.
- 🧰 **Scripts utilitaires** :
  - `npm run seed` pour créer des comptes/vidéos de démonstration,
  - `npm run backup` pour archiver `data/` et `users/`,
  - `npm run prune` pour nettoyer les uploads en attente trop anciens.
- 🐳 **Docker Compose** : orchestration API + frontend avec persistance des données (`./data -> /data/youtube`).

## Structure du projet

```
.
├── server.js             # API Express (upload, validation, commentaires…)
├── package.json          # scripts backend (seed, backup, prune)
├── docker-compose.yml    # stack Node + React + volume de données
├── data/                 # vidéos approuvées, pending & métadonnées JSON
├── users/                # comptes utilisateurs JSON
├── public/uploads/       # avatars et bannières
└── frontend/             # Application React + Tailwind + Framer Motion
```

## Prérequis

- Node.js 20+
- npm
- Docker (optionnel mais recommandé pour la stack complète)

## Démarrage rapide (sans Docker)

1. **Installer les dépendances backend**
   ```bash
   npm install
   ```
2. **Installer les dépendances frontend**
   ```bash
   cd frontend
   npm install
   cd ..
   ```
3. **Générer les données de démonstration (optionnel)**
   ```bash
   npm run seed
   ```
4. **Lancer l'API Express**
   ```bash
   npm run dev
   ```
   Le backend est disponible sur http://localhost:4000
5. **Lancer le frontend**
   ```bash
   cd frontend
   npm run dev -- --host 0.0.0.0 --port 5173
   ```
   L'interface est accessible sur http://localhost:5173

### Identifiants de test

- Admin : `admin / admin123`
- Créateur vérifié : `creator / creator123`
- Créateur standard : `explorer / explorer123`

## Utilisation avec Docker Compose

```bash
docker compose up --build
```

- `http://localhost:4000` – API Express avec stockage dans le volume `youtube_data`
- `http://localhost:5173` – Interface React Tailwind
- Les données persistantes sont montées dans `./data` côté hôte

> **Astuce** : définissez `JWT_SECRET` et `DATA_ROOT` dans un fichier `.env` pour personnaliser le chemin de stockage ou renforcer la sécurité.

## Scripts utilitaires

| Commande             | Description |
|----------------------|-------------|
| `npm run seed`       | Crée 1 admin + 2 créateurs et une vidéo de démonstration |
| `npm run backup`     | Archive `data/` et `users/` dans `backups/` |
| `npm run prune`      | Supprime les uploads en attente de plus de 30 jours |

## Sécurité & bonnes pratiques

- Validation systématique des MIME types et de la taille des vidéos.
- Sanitation des chaînes et validation via `express-validator`.
- Rate-limiting pour éviter le spam sur les routes publiques & auth.
- JWT signé (12h) et stockage en `localStorage` côté client.
- Stockage des fichiers pending dans `/data/pending/<username>/` jusqu'à validation.

## Personnalisation

- Thème Tailwind sombre inspiré de YouTube Premium.
- Animations Framer Motion pour cartes, lecteur et modales.
- API extensible : ajoutez vos propres champs dans les JSON utilisateurs ou vidéos.

## Licence

Projet fourni tel quel dans le cadre de la mission de reproduction locale de YouTube. Utilisation libre en environnement hors ligne.
