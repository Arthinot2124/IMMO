-- 1. Table des rôles (Admin, Client, etc.)
CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Insérer quelques rôles par défaut
INSERT INTO roles (role_name) VALUES ('Admin'), ('Client');

-- 2. Table des utilisateurs
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    address VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- Clé étrangère
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(role_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 3. Table des biens immobiliers (properties)
CREATE TABLE properties (
    property_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT, -- propriétaire ou utilisateur à l'origine de l'annonce
    title VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(15,2) NOT NULL,
    surface DECIMAL(10,2),
    location VARCHAR(255),
    category ENUM('LITE', 'ESSENTIEL', 'PREMIUM') DEFAULT 'LITE',
    status ENUM('Disponible', 'Réservé', 'Vendu', 'Loué') DEFAULT 'Disponible',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- Clé étrangère
    CONSTRAINT fk_property_user FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 4. Table pour stocker les médias liés aux propriétés
CREATE TABLE property_media (
    media_id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    media_type ENUM('Photo', 'Vidéo', 'Document') NOT NULL,
    media_url VARCHAR(255) NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_media_property FOREIGN KEY (property_id) REFERENCES properties(property_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 5. Table des demandes de mise en ligne de bien (prise en charge)
CREATE TABLE property_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, -- propriétaire qui soumet la demande
    title VARCHAR(150) NOT NULL,
    description TEXT,
    additional_details TEXT,
    status ENUM('En attente', 'Accepté', 'Refusé') DEFAULT 'En attente',
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_request_user FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 6. Table des commandes (achat ou location)
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    user_id INT NOT NULL,
    order_type ENUM('Achat', 'Location') NOT NULL,
    order_status ENUM('En attente', 'Confirmé', 'Annulé', 'Terminé') DEFAULT 'En attente',
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_property FOREIGN KEY (property_id) REFERENCES properties(property_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 7. Table des rendez-vous pour les visites
CREATE TABLE appointments (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    user_id INT NOT NULL,
    appointment_date DATETIME NOT NULL,
    confirmation_status ENUM('En attente', 'Confirmé', 'Annulé') DEFAULT 'En attente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_appointment_property FOREIGN KEY (property_id) REFERENCES properties(property_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_appointment_user FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 8. Table des notifications pour suivre l'état des biens et commandes
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message VARCHAR(255) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;


-- 9. Table des évaluations et réactions sur les propriétés
CREATE TABLE ratings (
    rating_id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    user_id INT NOT NULL,
    rating TINYINT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rating_property FOREIGN KEY (property_id) REFERENCES properties(property_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_rating_user FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 10. Table des campagnes publicitaires (marketing)
CREATE TABLE ad_campaigns (
    campaign_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    campaign_name VARCHAR(150) NOT NULL,
    platform VARCHAR(50) DEFAULT 'Facebook',
    start_date DATETIME,
    end_date DATETIME,
    budget DECIMAL(10,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_campaign_admin FOREIGN KEY (admin_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Table des favoris
CREATE TABLE favorites (
    favorite_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    property_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_favorite_user FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_favorite_property FOREIGN KEY (property_id) REFERENCES properties(property_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT unique_favorite UNIQUE (user_id, property_id)
) ENGINE=InnoDB;

-- Table des médias liés aux demandes de propriété
CREATE TABLE property_request_media (
    media_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    media_type ENUM('Photo', 'Vidéo', 'Document') NOT NULL DEFAULT 'Photo',
    media_url VARCHAR(255) NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_media_property_request FOREIGN KEY (request_id) REFERENCES property_requests(request_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Insertion d'utilisateurs
INSERT INTO users (role_id, full_name, email, phone, address, password_hash) VALUES
(1, 'Rakoto Admin', 'admin@tafoimmo.mg', '0341234567', 'Antananarivo, Madagascar', '$2a$10$N.zmdr9k7uOCQb376NoUnuTa.8tqrwBYg8n9zesdxhbXVccULX1kW'), -- mdp: admin123

