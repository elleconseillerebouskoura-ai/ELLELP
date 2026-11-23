# ELLE Bouskoura — Landing Pink Friday (V3)

Pink Friday · offres Solo et Duo · places limitées · Tél. 07 09 68 05 32
Direction artistique : noir, rose du logo (#EE529B) en couleur principale, or rosé (#E2B48C) en détails, blanc.
Polices : Montserrat (texte, titres) + Allura (« Pink Friday » manuscrit). Logo : ELLE Ladies Fitness Club détouré.

## Liens publicitaires
Une seule landing pour les deux promos. Ajoutez `offre=solo` ou `offre=duo` au lien de chaque pub pour présélectionner le choix « Seule / À deux » du formulaire :
- Promo solo : `https://ellebouskoura.com/?offre=solo&utm_source=instagram&utm_campaign=pink-friday-solo`
- Promo duo : `https://ellebouskoura.com/?offre=duo&utm_source=instagram&utm_campaign=pink-friday-duo`
La colonne *Offre* du Google Sheet indique alors « Pink Friday — Solo » ou « Pink Friday — Duo ».

## Contenu (20 fichiers)

```
site/                       ← dossier publié par Netlify
  index.html                landing (formulaire en premier)
  merci.html                remerciement + redirection WhatsApp
  admin/index.html          admin : statistiques + leads
  politique-de-confidentialite.html
  config.js                 réglages : URL Apps Script, WhatsApp, Meta Pixel
  favicon.png · apple-touch-icon.png · robots.txt
  img/                      images WebP optimisées + logo + image de partage
apps-script/Code.gs         backend Google Sheet (à recoller dans Apps Script)
netlify.toml                config Netlify
```

Admin : https://ellebouskoura.com/admin/ — mot de passe `ElleDuo-3699`.

## Mise en ligne

1. **GitHub** : envoyer le contenu du zip à la racine du repo (`site`, `apps-script`, `netlify.toml`, `README.md`), en remplaçant les fichiers existants. Netlify republie tout seul.
2. **Apps Script (obligatoire pour les stats de clics)** : la V2 envoie les clics groupés en une seule requête par visite. Il faut donc mettre à jour le script :
   - Google Sheet > Extensions > Apps Script > remplacer tout le code par `apps-script/Code.gs` > Enregistrer
   - Déployer > Gérer les déploiements > ✏️ > Version : **Nouvelle version** > Déployer (l'URL ne change pas)
3. **Nettoyage conseillé sur GitHub** (facultatif) : supprimer les anciens fichiers inutilisés : dans `site/img/` tous les `.jpg` sauf `og-pink-friday.jpg`, plus `logo-elle.png` ; et `site/favicon.svg`.

## Optimisation

- Poids de la page : ~110 Ko au premier affichage (photo 33 Ko, logo 12 Ko en WebP), ~420 Ko page entière, photos du club chargées au défilement.
- Aucune librairie JavaScript, aucun framework.
- Stats : 1 requête Google à l'arrivée + 1 requête groupée pour les clics (au lieu d'une par clic).

## Suivi

Meta Pixel 1930646244551236 : PageView, ViewContent, LeadFormStart, ClicCTA, **Lead** (page merci, avec eventID et Solo/Duo), Contact (WhatsApp / appel).
