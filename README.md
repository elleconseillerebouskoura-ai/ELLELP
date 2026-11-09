# ELLE Bouskoura — Landing Black Friday 2026

Offre Duo 10 500 DH · jusqu'au 30 novembre 2026
Site 100 % statique (GitHub + Netlify) · Leads dans Google Sheet (Apps Script) · Meta Pixel · Admin stats + leads

## Contenu du dossier

```
LANDING BLACK FRIDAY/
├── site/                         ← ce que Netlify publie
│   ├── index.html                landing Black Friday
│   ├── merci.html                page de remerciement + redirection WhatsApp
│   ├── admin/index.html          espace admin (statistiques + leads)
│   ├── politique-de-confidentialite.html
│   ├── config.js                 ⚙️ LE seul fichier de réglages
│   ├── img/                      logo, bannière BF, photos du club, image de partage
│   ├── favicon.svg · robots.txt
├── apps-script/Code.gs           backend Google Sheet (à coller dans Apps Script)
├── netlify.toml                  config Netlify (dossier publié, redirections, sécurité)
├── prompts/                      prompt ChatGPT de la bannière
└── source-octobre-rose/          sauvegarde de l'ancienne landing (code + images)
```

**Mot de passe admin : `ElleDuo-3699`** (défini dans `apps-script/Code.gs`, ligne `ADMIN_PASSWORD`).

---

## Étape 1 — Créer le Google Sheet
1. Sur Google Drive (compte de l'agence ou du client) : **Nouveau > Google Sheets**, nomme-le `ELLE — Leads Black Friday 2026`.
2. Menu **Extensions > Apps Script**.
3. Efface le code présent, colle tout le contenu de `apps-script/Code.gs`, clique sur 💾 **Enregistrer**.

## Étape 2 — Initialiser
1. Dans la barre du haut d'Apps Script, choisis la fonction **`installer`** puis **Exécuter**.
2. Google demande l'autorisation : **Examiner les autorisations > ton compte > Paramètres avancés > Accéder au projet > Autoriser**.
3. Retourne sur le Sheet : les onglets **Leads** et **Evenements** sont créés.
   (Optionnel : exécute `testLead` pour voir une ligne test, puis supprime-la.)

## Étape 3 — Publier le script (Web App)
1. **Déployer > Nouveau déploiement** → icône ⚙️ → **Application Web**.
2. Exécuter en tant que : **Moi** · Qui a accès : **Tout le monde**.
3. **Déployer** → copie l'**URL de l'application Web** (elle finit par `/exec`).

> ⚠️ Si tu modifies `Code.gs` plus tard (mot de passe, email…) :
> **Déployer > Gérer les déploiements > ✏️ > Version : Nouvelle version > Déployer**. L'URL reste la même.

## Étape 4 — Brancher le site
Ouvre `site/config.js` et colle l'URL :
```js
appsScriptUrl: "https://script.google.com/macros/s/XXXXXXXX/exec",
```
Le numéro WhatsApp (212709680532) et le Meta Pixel (1930646244551236, le même que l'ancienne landing) sont déjà renseignés.

Notification email à chaque lead (optionnel) : dans `Code.gs`, `NOTIFY_EMAIL = 'adresse@...'` puis nouvelle version du déploiement.

## Étape 5 — GitHub
Avec GitHub Desktop : **File > Add local repository** → choisis le dossier `LANDING BLACK FRIDAY` → « create a repository » → **Publish repository** (coche *Keep this code private*).

## Étape 6 — Netlify
1. Netlify > **Add new site > Import an existing project > GitHub** → choisis le repo.
2. Netlify lit `netlify.toml` tout seul : dossier publié `site`, pas de commande de build. **Deploy**.
3. Teste sur l'adresse `xxx.netlify.app` (formulaire → ligne dans le Sheet → `/admin`).
4. Quand tout est validé : **Domain management > Add a domain > ellebouskoura.com**, puis change les DNS chez le registrar comme indiqué par Netlify.
   ⚠️ À ce moment-là, l'ancienne landing PHP n'est plus servie. Les anciennes URL (`/merci.php`, `/politique-de-confidentialite.php`) redirigent automatiquement.

Chaque modification poussée sur GitHub (Commit + Push dans GitHub Desktop) est mise en ligne automatiquement par Netlify.

---

## Comment ça marche

**Formulaire** — Prénom/nom + téléphone WhatsApp (06/07/+212, normalisé en +212…). Envoi vers Apps Script → ligne dans l'onglet *Leads* (statut « Nouveau », doublon signalé si le numéro existe déjà) → page merci → WhatsApp pré-rempli après 3 s.
Si l'envoi échoue : les infos sont gardées et la visiteuse peut réessayer ou passer directement par WhatsApp. Anti-spam par champ invisible.

**Meta Pixel**
| Événement | Quand |
|---|---|
| PageView, ViewContent | arrivée sur la landing (valeur 10 500 MAD) |
| LeadFormStart *(perso)* | 1er clic dans le formulaire |
| ClicCTA *(perso)* | clic sur un bouton « Je réserve » (avec l'emplacement) |
| **Lead** | page merci, une seule fois par demande, avec `eventID` = colonne *Event ID (Meta)* du Sheet (prêt pour une future API Conversions) |
| Contact | ouverture de WhatsApp |

→ Pour les campagnes, optimiser sur **Lead**.

**Statistiques (onglet Evenements)** — chaque visite, clic CTA, début de formulaire, lead et clic WhatsApp est enregistré avec un identifiant visiteur anonyme et la source UTM.

**Admin `/admin`** — mot de passe vérifié côté Google (aucune donnée n'est dans le code du site).
- *Statistiques* : visiteurs, clics CTA, formulaires commencés, leads, taux de conversion, inscrites · leads et visiteurs par jour · tunnel · leads par source UTM · par statut · par bouton. Filtre Aujourd'hui / 7 j / 30 j / campagne.
- *Leads* : recherche, filtres statut/source, statut modifiable (Nouveau, Contacté, Intéressé, Inscrit, Pas intéressé, Injoignable), note, bouton WhatsApp direct, export CSV (Excel).
- Tant que l'URL Apps Script n'est pas renseignée, un bouton « données de démo » permet de voir l'interface.

**Liens pubs** — utiliser des UTM, ex. :
`https://ellebouskoura.com/?utm_source=instagram&utm_medium=paid&utm_campaign=bf-duo&utm_content=story1`

---

## À valider avec le client avant la mise en ligne
- La durée de l'offre Duo (10 500 DH = combien de mois / 1 an ?) — à ajouter dans les textes si besoin.
- Le texte de la politique de confidentialité.
