LECTIO — Roadmap catholique de lecture de la Bible (73 livres)
==============================================================

POUR LANCER
-----------
Ouvrez simplement « index.html » dans votre navigateur (double-clic).
Aucune installation, aucun serveur. Tout fonctionne hors-ligne.
Votre progression est sauvegardée automatiquement dans le navigateur.

CE QUE FAIT LE SITE
-------------------
• Un parcours des 73 livres dans un ORDRE PÉDAGOGIQUE (pas canonique) :
  on part de l'Évangile de Marc, on pose les fondations (Genèse, Exode),
  on complète le portrait du Christ, on traverse la sagesse, la Loi,
  l'histoire, les prophètes, puis les lettres et l'Apocalypse.

• Les PSAUMES en fil rouge : un psaume médité chaque jour, réparti sur
  toute la durée choisie (150 psaumes = le 73e livre).

• Un OBJECTIF réglable : 1 an, 6 mois, 3 mois, 2 mois, ou durée sur mesure.
  Le rythme quotidien (chapitres/jour) s'ajuste tout seul.

• « À LIRE AUJOURD'HUI » : la lecture du jour + le psaume, calculés depuis
  votre date de début. En retard ? Un bouton « rattraper N jours » apparaît
  pour valider plusieurs jours d'une traite.

• VUE D'ENSEMBLE : les 8 étapes dépliables, chaque livre cochable.

• LIVRES ARDUS (Lévitique, Chroniques, Jérémie…) : marqués « survol guidé »
  et dosés à charge réduite, avec un conseil de lecture ciblé.

• LECTURES DU JOUR DANS L'ÉGLISE : le site interroge l'API de l'AELF
  (api.aelf.org) pour afficher le psaume et l'évangile du jour de la
  liturgie. Si l'appel est bloqué (ex. ouverture en fichier local sans
  connexion), un lien vers aelf.org prend le relais.

FICHIERS
--------
index.html  — la page
app.js      — la logique (plan, objectif, rattrapage, AELF)
data.js     — les 73 livres, leur ordre, difficulté et conseils

« Ta parole est une lampe pour mes pas. » (Ps 118, 105)

SAUVEGARDE & PORTABILITÉ (nouveau)
----------------------------------
En bas de page, deux boutons :
• « Exporter ma progression » télécharge un fichier lectio-progression-AAAA-MM-JJ.json
  contenant vos livres cochés, votre objectif et votre date de début.
• « Importer » recharge un tel fichier — pratique pour changer de navigateur,
  d'ordinateur, ou vous prémunir contre un vidage du cache.
Rangez ce fichier où vous voulez (Drive, clé USB…). Import et export
fonctionnent entièrement hors-ligne.
