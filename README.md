# Company Lens

<div align="center">
  <img src="Demo_ressources/Capture%20d%E2%80%99%C3%A9cran%202025-08-05%20%C3%A0%2001.21.51.png" alt="Company Lens Dashboard" width="800"/>
  
  **Une plateforme intelligente pour l'analyse et le suivi des entreprises belges**
  
  [![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
  [![Python](https://img.shields.io/badge/Python-3.11-yellow.svg)](https://www.python.org/)
  [![Django](https://img.shields.io/badge/Django-4.2-green.svg)](https://www.djangoproject.com/)
</div>

## Table des matières

- [À propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Démo](#-démo)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Architecture](#-architecture)
- [Roadmap](#-roadmap)
- [Contribution](#-contribution)

## À propos

Company Lens est une plateforme web moderne qui révolutionne la recherche d'informations sur les entreprises belges. En utilisant l'intelligence artificielle et l'agrégation de données multi-sources, Company Lens permet aux professionnels de :

- **Rechercher instantanément** des entreprises par numéro de TVA
- **Visualiser** toutes les données publiques de manière claire et structurée
- **Suivre** l'évolution des entreprises qui vous intéressent
- **Organiser** vos entreprises en groupes thématiques
- **Analyser** les tendances et statistiques sectorielles

## Fonctionnalités

### Recherche Intelligente
- Recherche par numéro de TVA avec validation en temps réel
- Filtres avancés par type d'entreprise, statut et région
- Historique des recherches récentes
- Suggestions automatiques

### Tableau de Bord Personnalisé
- Vue d'ensemble de votre entreprise
- Statistiques clés en temps réel
- Notifications des changements importants
- Widgets personnalisables

### Fiches Entreprises Détaillées
- Informations générales (statut juridique, adresse, contacts)
- Données financières avec graphiques interactifs
- Liste des établissements
- Indicateurs de stabilité financière

### Gestion par Groupes
- Création de groupes thématiques (Clients, Fournisseurs, Concurrents...)
- Organisation flexible des entreprises
- Statistiques consolidées par groupe
- Export des données

### Suivi en Temps Réel
- Surveillance des entreprises favorites
- Alertes sur les changements importants
- Comparaisons historiques
- Tableaux de bord sectoriels

## Démo

### Landing Page
<img src="Demo_ressources/Capture%20d%E2%80%99%C3%A9cran%202025-08-05%20%C3%A0%2001.21.51.png" alt="Landing_page" width="800"/>

<br>

### Dashboard
<img src="Demo_ressources/Capture%20d%E2%80%99%C3%A9cran%202025-08-05%20%C3%A0%2001.22.18.png" alt="Dashboard" width="800"/>

*Le tableau de bord offre une vue d'ensemble claire avec accès rapide aux fonctionnalités principales*

<br>

### Gestion des groupes
<img src="Demo_ressources/Capture%20d%E2%80%99%C3%A9cran%202025-08-05%20%C3%A0%2001.22.28.png" alt="Groups" width="800"/>

*Organisez vos entreprises en groupes personnalisés avec icônes thématiques*

<br>

### Entreprises suivies
<img src="Demo_ressources/Capture%20d%E2%80%99%C3%A9cran%202025-08-05%20%C3%A0%2001.22.48.png" alt="Followed" width="800"/>

*Liste des entreprises suivies avec filtres et options de tri*

<br>

### Vues détaillées d'une société
<img src="Demo_ressources/Capture%20d%E2%80%99%C3%A9cran%202025-08-05%20%C3%A0%2001.23.14.png" alt="Company_Details" width="800"/>

<img src="Demo_ressources/Capture%20d%E2%80%99%C3%A9cran%202025-08-05%20%C3%A0%2001.23.28.png" alt="Company_Details" width="800"/>

*Toutes les informations d'une entreprise organisées en onglets*

<br>

### Vue détaillée d'un groupe
<img src="Demo_ressources/Capture%20d%E2%80%99%C3%A9cran%202025-08-05%20%C3%A0%2001.23.57.png" alt="Group" width="800"/>

*Vue détaillée d'un groupe avec statistiques et gestion des entreprises*


## 🛠️ Technologies

### Frontend
- **React 18.3** - Framework UI moderne et performant
- **TypeScript** - Typage statique pour un code plus robuste
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Framework CSS utility-first
- **React Router** - Navigation SPA
- **Lucide React** - Icônes modernes et cohérentes
- **Mock Service Worker** - API mocking pour le développement

### Backend (En développement)
- **Django 4.2** - Framework Python
- **Django REST Framework** - API RESTful
- **PostgreSQL** - Base de données
- **Redis** - Cache et file de messages
- **RabbitMq** - Communication IA / Backend (Système de messagerie)

### AI & Scraping
- **LangChain** - Framework pour applications LLM
- **BeautifulSoup** - Parsing HTML
- **Pydantic** - Validation des données
- **OpenAI API** - Traitement intelligent des données

##  Installation

### Prérequis
- Node.js 18+ et npm
- Python 3.11+
- Git

### Installation du Frontend

```bash
# Cloner le repository
git clone https://github.com/votre-username/company-lens.git
cd company-lens

# Installer les dépendances frontend
cd frontend
npm install

# Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Credentials de démo
Pour tester l'application en local :
- **Email** : user@example.com
- **Mot de passe** : password123

##  Utilisation

### Première connexion
1. Accédez à l'application et connectez-vous avec les credentials de démo
2. Vous arriverez sur le tableau de bord principal
3. Explorez les différentes sections via la sidebar

### Rechercher une entreprise
1. Cliquez sur "Recherche" dans la sidebar
2. Entrez un numéro de TVA belge (format : BE0XXX.XXX.XXX)
3. Utilisez les filtres pour affiner votre recherche
4. Cliquez sur une entreprise pour voir ses détails

### Créer un groupe
1. Allez dans "Groupes"
2. Cliquez sur "Nouveau groupe"
3. Choisissez un nom, une description et une icône
4. Ajoutez des entreprises au groupe depuis leurs fiches détaillées

### Suivre une entreprise
1. Depuis la fiche d'une entreprise, cliquez sur "Suivre"
2. Retrouvez toutes vos entreprises suivies dans "Suivi"
3. Recevez des notifications lors de changements importants

##  Architecture

```
company-lens/
├── frontend/               # Application React
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── pages/        # Pages de l'application
│   │   ├── services/     # Services API
│   │   ├── contexts/     # Contexts React
│   │   ├── types/        # Types TypeScript
│   │   └── mocks/        # Mocks MSW
│   └── public/           # Assets statiques
│
├── backend/              # API Django (en développement)
│   ├── api/
│   ├── core/
│   └── companies/
│
└── ai/                   # Système de scraping IA
    └── src/
        └── company_scraper/
```

## 📅 Roadmap

### Phase 1 - MVP (En cours)
- [x] Interface utilisateur complète
- [x] Système de recherche
- [x] Gestion des groupes
- [x] Fiches entreprises détaillées
- [x] Authentification basique
- [ ] API Backend Django
- [ ] Connexion avec l'AI de scraping

### Phase 2 - Fonctionnalités avancées
- [ ] Notifications en temps réel
- [ ] Export PDF/Excel des rapports
- [ ] Comparaison d'entreprises
- [ ] API publique
- [ ] Application mobile

### Phase 3 - Intelligence & Automatisation
- [ ] Prédictions IA sur la santé financière
- [ ] Alertes automatiques personnalisées
- [ ] Rapports sectoriels automatisés
- [ ] Intégrations tierces (CRM, ERP)

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez suivre ces étapes :

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📞 Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue sur GitHub.
