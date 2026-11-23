# ELLE Bouskoura — Landing Black Friday (V2, nouvelle DA)

Offre Duo Black Friday : 2 personnes à 10 500 DH · Places limitées · Tél. 07 09 68 05 32
Direction artistique : noir pur, or, rose, blanc (inspirée de Passage Fitness et du visuel « Le sport, c'est mieux à deux »).
Polices : Montserrat (texte, titres) + Allura (« Black Friday » manuscrit).

## Contenu (18 fichiers)

```
site/                       ← dossier publié par Netlify
  index.html                landing (formulaire en premier)
  merci.html                remerciement + redirection WhatsApp
  admin/index.html          admin : statistiques + leads
  politique-de-confidentialite.html
  config.js                 réglages : URL Apps Script, WhatsApp, Meta Pixel
  favicon.svg · robots.txt
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
3. **Nettoyage conseillé sur GitHub** (facultatif) : supprimer les anciennes images inutilisées de `site/img/` (fichiers `.jpg` sauf `og-black-friday.jpg`, notamment `cover-black-friday.jpg` et `kaada-oriental.jpg`).

## Optimisation

- Poids de la page : ~120 Ko au premier affichage (photo hero 33 Ko en WebP), ~400 Ko page entière, images chargées seulement au défilement.
- Aucune librairie JavaScript, aucun framework.
- Stats : 1 requête Google à l'arrivée + 1 requête groupée pour les clics (au lieu d'une par clic).

## Suivi

Meta Pixel 1930646244551236 : PageView, ViewContent, LeadFormStart, ClicCTA, **Lead** (page merci, avec eventID), Contact (WhatsApp / appel).
