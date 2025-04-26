-- Insérer la vidéo dans la base de données
-- Remplacez property_id (premier paramètre) par l'ID de la propriété concernée
INSERT INTO property_media (property_id, media_type, media_url) 
VALUES (1, 'Vidéo', '/storage/property_request_media/15/Créer.mp4');

-- Pour vérifier que la vidéo a bien été insérée
SELECT * FROM property_media WHERE media_type = 'Vidéo'; 