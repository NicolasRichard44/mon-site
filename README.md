
# MonSite – Portfolio Personnel

**MonSite** est un site portfolio personnel moderne développé avec Angular, présentant une interface responsive et un mode sombre.


## Installation

### Développement local

1. Cloner le dépôt :
   ```bash
   git clone https://github.com/NicolasRichard44/mon-site.git
   cd mon-site
   ```
2. Installer les dépendances :
   ```bash
   npm install
   ```
3. Lancer le serveur de développement :
   ```bash
   npm start
   ```
4. Accéder à l'application : [http://localhost:4200](http://localhost:4200)

### Déploiement avec Docker

#### Option 1 : Utiliser l'image pré-construite (recommandé)

```bash
docker pull nicolasrichard44/mon-site:latest
docker run -p 3000:3000 nicolasrichard44/mon-site:latest
```

#### Option 2 : Construire l'image localement

Le projet inclut un `Dockerfile` multi-étapes pour un déploiement en production :

1. Construire l'image Docker :
   ```bash
   docker build -t mon-site .
   ```
2. Lancer le conteneur :
   ```bash
   docker run -p 3000:3000 mon-site
   ```

Accéder à l'application : [http://localhost:3000](http://localhost:3000)

L'image utilise :
- **Étape de build** : Node.js 22 pour compiler l'application Angular
- **Étape de production** : Nginx Alpine pour servir les fichiers statiques

## Structure du projet

- `src/app/header/` : composant de navigation
- `src/app/hero/` : section d'accueil
- `src/app/about/` : section à propos
- `src/app/projects/` : portfolio de projets
- `src/app/contact/` : formulaire de contact
- `src/app/footer/` : pied de page
- `src/app/theme-toggle/` : basculeur de thème

## Technologies

- Angular 20+
- TypeScript
- Tailwind CSS

## Auteur

Nicolas Richard
