<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>Réinitialisation de mot de passe - {{ config('app.name') }}</title>
    <style>
        /* Styles de base */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            margin-top: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            max-width: 150px;
            height: auto;
            margin-bottom: 20px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #0066CC;
            color: white !important;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            text-align: center;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
            text-align: center;
        }
        .link {
            color: #0066CC;
            word-break: break-all;
        }
        @media only screen and (max-width: 600px) {
            .container {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{{ config('app.url') }}/public_login/logo_couleur.png" alt="{{ config('app.name') }}" class="logo">
            <h2>Réinitialisation de votre mot de passe</h2>
        </div>
        
        <p>Bonjour,</p>
        
        <p>Vous avez demandé la réinitialisation de votre mot de passe sur {{ config('app.name') }}. Pour procéder à la réinitialisation, veuillez cliquer sur le bouton ci-dessous :</p>
        
        <div style="text-align: center;">
            <a href="{{ $resetLink }}" class="button">Réinitialiser mon mot de passe</a>
        </div>
        
        <p><strong>Important :</strong> Ce lien expirera dans 1 heure pour des raisons de sécurité.</p>
        
        <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.</p>
        
        <div class="footer">
            <p>Cet email a été envoyé automatiquement par {{ config('app.name') }}.</p>
            <p>Pour toute question, veuillez contacter notre support.</p>
        </div>
    </div>
</body>
</html> 