/* =============================================================================
   ELLE Bouskoura — Black Friday 2026
   Backend Google Apps Script (lié au Google Sheet)

   Rôle :
     1. Reçoit les leads du formulaire  → onglet "Leads"
     2. Reçoit les événements de visite → onglet "Evenements" (stats de l'admin)
     3. Sert les données à l'espace admin (protégé par mot de passe)
     4. Met à jour le statut d'un lead depuis l'admin
     5. (option) Envoie un email à chaque nouveau lead

   Installation : voir README.md (étapes 1 à 4).
   ⚠️ Après CHAQUE modification de ce fichier :
      Déployer > Gérer les déploiements > ✏️ > Version : Nouvelle version > Déployer
   ============================================================================= */

/* ------------------------------ RÉGLAGES ---------------------------------- */
const SHEET_ID       = '1fymJL35t6xOYD3e1HINf2V8C2roq0eHsnQk2kr3-Nu0'; // Google Sheet ELLE
const ADMIN_PASSWORD = 'ElleDuo-3699';      // mot de passe de l'espace /admin
const NOTIFY_EMAIL   = '';                  // ex. 'contact@ellebouskoura.com' — vide = pas d'email
const TIMEZONE       = 'Africa/Casablanca';
const STATUTS        = ['Nouveau', 'Contacté', 'Intéressé', 'Inscrit', 'Pas intéressé', 'Injoignable'];
const EVENT_TYPES    = ['page_view', 'cta_click', 'form_start', 'whatsapp_click'];

const SHEET_LEADS  = 'Leads';
const SHEET_EVENTS = 'Evenements';

const LEAD_HEADERS = [
  'ID', 'Date', 'Nom complet', 'Téléphone', 'Statut', 'Doublon', 'Note',
  'Offre', 'Source', 'Campagne',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'Page', 'Référent', 'Event ID (Meta)', 'Visitor ID', 'Navigateur', 'Horodatage ISO'
];
const EVENT_HEADERS = ['Horodatage', 'Jour', 'Type', 'CTA', 'Visitor ID', 'Session ID', 'utm_source', 'utm_campaign', 'Page', 'Référent'];

/* --------------------------- POINTS D'ENTRÉE ------------------------------ */
function doGet() {
  return json_({ ok: true, service: 'ELLE Bouskoura — Black Friday', time: new Date().toISOString() });
}

function doPost(e) {
  let body = {};
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return json_({ ok: false, error: 'JSON invalide' });
  }
  try {
    switch (body.action) {
      case 'lead':   return json_(saveLead_(body));
      case 'event':  return json_(saveEvent_(body));
      case 'admin':  return json_(adminData_(body));
      case 'update': return json_(updateLead_(body));
      default:       return json_({ ok: false, error: 'Action inconnue' });
    }
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'Erreur serveur' });
  }
}

/* -------------------------------- LEADS ----------------------------------- */
function saveLead_(b) {
  // Anti-spam : champ invisible rempli = robot → on répond OK sans rien enregistrer
  if (b.website) return { ok: true };

  const nom = clean_(b.full_name, 80);
  const tel = normaliserTel_(b.phone);
  if (nom.length < 2) return { ok: false, error: 'Nom manquant' };
  if (!tel)           return { ok: false, error: 'Téléphone invalide' };

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sh = sheet_(SHEET_LEADS, LEAD_HEADERS);
    const last = sh.getLastRow();
    let doublon = '';
    if (last > 1) {
      const tels = sh.getRange(2, 4, last - 1, 1).getValues().map(r => String(r[0]));
      if (tels.indexOf(tel) !== -1) doublon = 'Oui';
    }
    const now = new Date();
    const id = 'L' + Utilities.formatDate(now, TIMEZONE, 'yyMMddHHmmss') + Math.floor(Math.random() * 90 + 10);
    sh.appendRow([
      id,
      Utilities.formatDate(now, TIMEZONE, 'yyyy-MM-dd HH:mm:ss'),
      safe_(nom),
      "'" + tel,
      'Nouveau',
      doublon,
      '',
      safe_(clean_(b.offre, 60)),
      safe_(clean_(b.source, 80)),
      safe_(clean_(b.campaign, 80)),
      safe_(clean_(b.utm_source, 100)),
      safe_(clean_(b.utm_medium, 100)),
      safe_(clean_(b.utm_campaign, 150)),
      safe_(clean_(b.utm_content, 150)),
      safe_(clean_(b.utm_term, 150)),
      safe_(clean_(b.page_url, 300)),
      safe_(clean_(b.referrer, 200)),
      clean_(b.event_id, 80),
      clean_(b.visitor_id, 60),
      safe_(clean_(b.user_agent, 200)),
      now.toISOString()
    ]);
    // Le lead compte aussi comme événement (pour le tunnel)
    appendEvent_('lead', '', b);

    if (NOTIFY_EMAIL) {
      try {
        MailApp.sendEmail(NOTIFY_EMAIL,
          'Nouveau lead Black Friday — ' + nom,
          'Nom : ' + nom + '\nTéléphone : ' + tel + '\nSource : ' + (b.utm_source || 'direct') +
          (doublon ? '\n⚠️ Ce numéro existe déjà dans la liste.' : '') +
          '\n\nWhatsApp : https://wa.me/' + tel.replace('+', ''));
      } catch (mailErr) { console.warn(mailErr); }
    }
    return { ok: true, id: id };
  } finally {
    lock.releaseLock();
  }
}

/* ------------------------------ ÉVÉNEMENTS -------------------------------- */
function saveEvent_(b) {
  const type = String(b.type || '');
  if (EVENT_TYPES.indexOf(type) === -1) return { ok: false, error: 'Type inconnu' };
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    appendEvent_(type, clean_(b.cta, 30), b);
  } finally {
    lock.releaseLock();
  }
  return { ok: true };
}

function appendEvent_(type, cta, b) {
  const sh = sheet_(SHEET_EVENTS, EVENT_HEADERS);
  const now = new Date();
  sh.appendRow([
    now.toISOString(),
    Utilities.formatDate(now, TIMEZONE, 'yyyy-MM-dd'),
    type,
    safe_(cta || ''),
    clean_(b.visitor_id, 60),
    clean_(b.session_id, 60),
    safe_(clean_(b.utm_source, 100)),
    safe_(clean_(b.utm_campaign, 150)),
    safe_(clean_(b.page, 80)),
    safe_(clean_(b.referrer, 200))
  ]);
}

/* -------------------------------- ADMIN ----------------------------------- */
function checkPassword_(pw) {
  // petite temporisation contre les essais en boucle
  if (String(pw || '') !== ADMIN_PASSWORD) { Utilities.sleep(800); return false; }
  return true;
}

function adminData_(b) {
  if (!checkPassword_(b.password)) return { ok: false, error: 'Mot de passe incorrect' };

  // Leads
  const shL = sheet_(SHEET_LEADS, LEAD_HEADERS);
  const leads = [];
  if (shL.getLastRow() > 1) {
    const rows = shL.getRange(2, 1, shL.getLastRow() - 1, LEAD_HEADERS.length).getDisplayValues();
    rows.forEach(r => {
      if (!r[0]) return;
      leads.push({
        id: r[0], date: r[1], nom: r[2], tel: r[3], statut: r[4] || 'Nouveau', doublon: r[5], note: r[6],
        offre: r[7], source: r[8], campagne: r[9],
        utm_source: r[10], utm_medium: r[11], utm_campaign: r[12], utm_content: r[13], utm_term: r[14],
        page: r[15], referrer: r[16]
      });
    });
  }

  // Événements agrégés par jour (léger à transférer)
  const shE = sheet_(SHEET_EVENTS, EVENT_HEADERS);
  const jours = {};            // jour -> {page_view, visiteurs:Set, cta_click, form_start, lead, whatsapp_click}
  const ctas = {};             // emplacement -> nb clics
  const visiteursTotal = {};
  const sourcesVisites = {};   // utm_source -> visiteurs uniques
  if (shE.getLastRow() > 1) {
    const ev = shE.getRange(2, 1, shE.getLastRow() - 1, 7).getValues();
    ev.forEach(r => {
      const jour = typeof r[1] === 'object' && r[1] instanceof Date
        ? Utilities.formatDate(r[1], TIMEZONE, 'yyyy-MM-dd') : String(r[1]);
      const type = String(r[2]); const cta = String(r[3]); const v = String(r[4]); const src = String(r[6] || '') || 'direct';
      if (!jour) return;
      const j = jours[jour] || (jours[jour] = { page_view: 0, visiteurs: {}, cta_click: 0, form_start: 0, lead: 0, whatsapp_click: 0 });
      if (j[type] !== undefined) j[type]++;
      if (type === 'page_view' && v) {
        j.visiteurs[v] = 1;
        if (!visiteursTotal[v]) { visiteursTotal[v] = 1; sourcesVisites[src] = (sourcesVisites[src] || 0) + 1; }
      }
      if (type === 'cta_click' && cta) ctas[cta] = (ctas[cta] || 0) + 1;
    });
  }
  const parJour = Object.keys(jours).sort().map(k => {
    const j = jours[k];
    return { jour: k, vues: j.page_view, visiteurs: Object.keys(j.visiteurs).length, cta: j.cta_click, form: j.form_start, leads: j.lead, whatsapp: j.whatsapp_click };
  });

  return {
    ok: true,
    genere: new Date().toISOString(),
    statuts: STATUTS,
    leads: leads.reverse(),          // plus récent en premier
    parJour: parJour,
    ctas: ctas,
    visiteursUniques: Object.keys(visiteursTotal).length,
    sourcesVisites: sourcesVisites
  };
}

function updateLead_(b) {
  if (!checkPassword_(b.password)) return { ok: false, error: 'Mot de passe incorrect' };
  const id = String(b.id || '');
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_(SHEET_LEADS, LEAD_HEADERS);
    const last = sh.getLastRow();
    if (last < 2) return { ok: false, error: 'Lead introuvable' };
    const ids = sh.getRange(2, 1, last - 1, 1).getValues().map(r => String(r[0]));
    const i = ids.indexOf(id);
    if (i === -1) return { ok: false, error: 'Lead introuvable' };
    const row = i + 2;
    if (b.statut !== undefined) {
      if (STATUTS.indexOf(b.statut) === -1) return { ok: false, error: 'Statut invalide' };
      sh.getRange(row, 5).setValue(b.statut);
    }
    if (b.note !== undefined) sh.getRange(row, 7).setValue(safe_(clean_(b.note, 500)));
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

/* ------------------------------- OUTILS ----------------------------------- */
function sheet_(name, headers) {
  const ss = ss_();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers])
      .setFontWeight('bold').setBackground('#050505').setFontColor('#FF00B9');
    sh.setFrozenRows(1);
  }
  return sh;
}

function ss_() { return SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet(); }

function normaliserTel_(brut) {
  const n = String(brut || '').replace(/[\s.\-()]/g, '');
  const m = n.match(/^0([67]\d{8})$/) || n.match(/^\+212([67]\d{8})$/) || n.match(/^00212([67]\d{8})$/) || n.match(/^212([67]\d{8})$/);
  return m ? '+212' + m[1] : null;
}

function clean_(v, max) { return String(v == null ? '' : v).replace(/[\u0000-\u001F]/g, ' ').trim().slice(0, max || 200); }

// Empêche l'injection de formules dans le Sheet (=, +, -, @ en début de cellule)
function safe_(v) { return /^[=+\-@]/.test(v) ? "'" + v : v; }

function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* ---------------------- À LANCER UNE FOIS (étape 2) ----------------------- */
function installer() {
  const shL = sheet_(SHEET_LEADS, LEAD_HEADERS);
  sheet_(SHEET_EVENTS, EVENT_HEADERS);
  shL.getRange('D:D').setNumberFormat('@');                  // téléphones en texte
  const regle = SpreadsheetApp.newDataValidation().requireValueInList(STATUTS, true).setAllowInvalid(false).build();
  shL.getRange(2, 5, 2000, 1).setDataValidation(regle);      // menu déroulant Statut
  shL.setColumnWidth(1, 130); shL.setColumnWidth(2, 150); shL.setColumnWidth(3, 190); shL.setColumnWidth(4, 140);
  const def = ss_().getSheetByName('Feuille 1') || ss_().getSheetByName('Sheet1');
  if (def && def.getLastRow() === 0 && ss_().getSheets().length > 2) ss_().deleteSheet(def);
  try { ss_().toast('Onglets Leads et Evenements prêts ✔', 'ELLE Black Friday'); } catch (e) {}
  console.log('Onglets Leads et Evenements prêts');
}

/* Test rapide depuis l'éditeur : ajoute un faux lead */
function testLead() {
  const r = saveLead_({ full_name: 'Test ELLE', phone: '0612345678', offre: 'Offre Duo 10 500 DH', source: 'test', campaign: 'Black Friday 2026', utm_source: 'test' });
  console.log(r);
}
