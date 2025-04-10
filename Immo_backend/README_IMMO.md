# IMMO - Application Immobilière

Cette application immobilière complète est destinée aux clients (acheteurs et propriétaires souhaitant louer ou vendre) ainsi qu'aux administrateurs d'agence. L'objectif est de proposer une plateforme simple d'utilisation tout en offrant des fonctionnalités avancées pour chaque profil d'utilisateur.

## Fonctionnalités

### Pour l'Agence (Admin)
- Insérer des données (Vidéos, Photos, Textes descriptifs, Documents)
- Suivre les statistiques via un tableau de bord
- Gérer les commandes et les demandes de prise en charge

### Pour les Clients (Acheteurs / Propriétaires)
- Visiter et rechercher des biens avec filtres selon leurs préférences
- Réserver et commander (Acheter, Prendre en location)
- Soumettre des demandes de prise en charge
- Suivre les statuts des immeubles (Tableau de bord et notifications)

## Structure de la Base de Données

L'application utilise 10 tables principales:
1. `roles` - Définit les types d'utilisateurs (Admin, Client)
2. `users` - Informations des utilisateurs
3. `properties` - Biens immobiliers
4. `property_media` - Médias associés aux biens
5. `property_requests` - Demandes de mise en ligne
6. `orders` - Commandes (achat ou location)
7. `appointments` - Rendez-vous pour les visites
8. `notifications` - Notifications pour les utilisateurs
9. `ratings` - Évaluations des biens
10. `ad_campaigns` - Campagnes publicitaires

## Installation

### Prérequis
- PHP 8.1 ou supérieur
- Composer
- MySQL ou MariaDB
- Node.js et NPM (pour le frontend)

### Étapes d'installation

1. Cloner le dépôt
```
git clone <url-du-depot>
cd Immo_backend
```

2. Installer les dépendances
```
composer install
```

3. Configurer l'environnement
```
cp .env.example .env
php artisan key:generate
```

4. Configurer la base de données dans le fichier `.env`
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=immo
DB_USERNAME=root
DB_PASSWORD=
```

5. Migrer la base de données
```
php artisan migrate
```

6. Lancer le serveur de développement
```
php artisan serve
```

## API Endpoints

L'application expose les endpoints API suivants:

### Authentification
- `POST /api/login` - Connexion utilisateur
- `POST /api/register` - Inscription utilisateur
- `POST /api/logout` - Déconnexion (protégé)

### Propriétés
- `GET /api/properties` - Liste des propriétés (public)
- `GET /api/properties/{id}` - Détails d'une propriété (public)
- `POST /api/properties` - Créer une propriété (protégé)
- `PUT /api/properties/{id}` - Mettre à jour une propriété (protégé)
- `DELETE /api/properties/{id}` - Supprimer une propriété (protégé)

### Médias
- `GET /api/properties/{id}/media` - Liste des médias d'une propriété (public)
- `POST /api/properties/{id}/media` - Ajouter un média (protégé)
- `DELETE /api/properties/{id}/media/{media_id}` - Supprimer un média (protégé)

### Demandes de propriété
- `GET /api/property-requests` - Liste des demandes (protégé)
- `POST /api/property-requests` - Créer une demande (protégé)
- `GET /api/property-requests/{id}` - Détails d'une demande (protégé)
- `PUT /api/property-requests/{id}` - Mettre à jour une demande (protégé)
- `DELETE /api/property-requests/{id}` - Supprimer une demande (protégé)

### Commandes
- `GET /api/orders` - Liste des commandes (protégé)
- `POST /api/orders` - Créer une commande (protégé)
- `GET /api/orders/{id}` - Détails d'une commande (protégé)
- `PUT /api/orders/{id}` - Mettre à jour une commande (protégé)
- `DELETE /api/orders/{id}` - Supprimer une commande (protégé)

### Rendez-vous
- `GET /api/appointments` - Liste des rendez-vous (protégé)
- `POST /api/appointments` - Créer un rendez-vous (protégé)
- `GET /api/appointments/{id}` - Détails d'un rendez-vous (protégé)
- `PUT /api/appointments/{id}` - Mettre à jour un rendez-vous (protégé)
- `DELETE /api/appointments/{id}` - Supprimer un rendez-vous (protégé)

### Notifications
- `GET /api/notifications` - Liste des notifications (protégé)
- `GET /api/users/{id}/notifications` - Notifications d'un utilisateur (protégé)
- `POST /api/users/{id}/notifications/mark-all-read` - Marquer toutes les notifications comme lues (protégé)

### Évaluations
- `GET /api/properties/{id}/ratings` - Évaluations d'une propriété (public)
- `POST /api/ratings` - Créer une évaluation (protégé)
- `PUT /api/ratings/{id}` - Mettre à jour une évaluation (protégé)
- `DELETE /api/ratings/{id}` - Supprimer une évaluation (protégé)

### Tableau de bord
- `GET /api/dashboard/stats` - Statistiques du tableau de bord (protégé, admin uniquement)

## Sécurité

L'API utilise Laravel Sanctum pour l'authentification par token. Tous les endpoints protégés nécessitent un token d'authentification valide dans l'en-tête de la requête:

```
Authorization: Bearer {token}
```

## Développement

Pour contribuer au projet:

1. Créer une branche pour votre fonctionnalité
```
git checkout -b feature/ma-fonctionnalite
```

2. Faire vos modifications et commiter
```
git commit -m "Description de ma fonctionnalité"
```

3. Pousser vers le dépôt
```
git push origin feature/ma-fonctionnalite
```

4. Créer une Pull Request
