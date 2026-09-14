// ============================================================
//  LES 73 LIVRES DE LA BIBLE CATHOLIQUE
//  Ordonnés « en spirale » : chaque étape tisse l'Ancien et le
//  Nouveau Testament, pour que l'AT soit toujours lu à la lumière
//  du Christ déjà rencontré (option B).
//  chapters = nombre de chapitres (base du dosage quotidien)
//  phase    = étape de la roadmap
//  level    = 1 accessible · 2 intermédiaire · 3 exigeant
//  note     = conseil de lecture pour les livres ardus
// ============================================================

const PHASES = [
  { id: 'p1', nom: 'I · Rencontrer le Christ',        teinte: '#c9a961',
    desc: "Marc ouvre la marche, puis Genèse et Exode : on lit l'origine du monde et l'Alliance en sachant déjà vers qui tout cela tend." },
  { id: 'p2', nom: 'II · La Loi accomplie',           teinte: '#b07d56',
    desc: "Matthieu présente le Christ nouveau Moïse ; on traverse alors la Loi (Lévitique, Nombres, Deutéronome) en la relisant avec lui." },
  { id: 'p3', nom: 'III · Grâce et liberté',          teinte: '#7a9b76',
    desc: "Luc et la conquête d'Israël (Josué, Juges, Ruth), éclairés par Paul : ni la Loi ni les armes ne sauvent, mais la grâce." },
  { id: 'p4', nom: 'IV · Le Roi et le Royaume',       teinte: '#6a8caf',
    desc: "Jean contemple le Christ-Roi ; en écho, l'histoire des rois d'Israël et les lettres où Paul chante la royauté du Christ." },
  { id: 'p5', nom: 'V · La Sagesse faite chair',      teinte: '#a86f8f',
    desc: "Les Actes lancent l'Église ; les livres de sagesse d'Israël rejoignent la sagesse pratique de Jacques et des premiers chrétiens." },
  { id: 'p6', nom: "VI · L'exil et la consolation",   teinte: '#8a7ca8',
    desc: "Isaïe, Jérémie, Ézéchiel : le peuple souffre et espère. Hébreux et Pierre relisent cette épreuve à la lumière de la Croix." },
  { id: 'p7', nom: "VII · Les prophètes et l'attente", teinte: '#c17b5c',
    desc: "Les douze petits prophètes et les derniers livres historiques, tissés aux dernières lettres et à la voix de Jean." },
  { id: 'p8', nom: 'VIII · Le dévoilement',           teinte: '#5f9ea0',
    desc: "Daniel et les Maccabées, l'apocalyptique juive, rejoignent l'Apocalypse de Jean : l'histoire s'ouvre sur l'éternité." },
];

// level 3 + skim:true → livre au dosage allégé (survol guidé)
// Le livre des Psaumes (150) est le FIL ROUGE, médité un par jour tout au long.
const LIVRES = [
  // ---- Phase I · Rencontrer le Christ ----
  { id: 'marc',        nom: 'Évangile selon Marc',        ch: 16, phase: 'p1', level: 1 },
  { id: 'genese',      nom: 'Genèse',                     ch: 50, phase: 'p1', level: 1 },
  { id: 'exode',       nom: 'Exode',                      ch: 40, phase: 'p1', level: 2,
    note: "Chapitres 25-31 et 35-40 (le Tabernacle) peuvent être survolés." },

  // ---- Phase II · La Loi accomplie ----
  { id: 'matthieu',    nom: 'Évangile selon Matthieu',    ch: 28, phase: 'p2', level: 1,
    note: "Le Sermon sur la montagne (ch. 5-7) relit toute la Loi : à lire lentement." },
  { id: 'levitique',   nom: 'Lévitique',                  ch: 27, phase: 'p2', level: 3, skim: true,
    note: "Livre rituel. Lire ch. 16, 19, 23, 25, 26 ; survoler le reste." },
  { id: 'nombres',     nom: 'Nombres',                    ch: 36, phase: 'p2', level: 3, skim: true,
    note: "Recensements et étapes. Retenir les récits (ch. 11-14, 20-24) ; survoler les listes." },
  { id: 'deuteronome', nom: 'Deutéronome',               ch: 34, phase: 'p2', level: 2,
    note: "Les grands discours de Moïse. Le Shema (ch. 6) est un sommet, cité par Jésus lui-même." },

  // ---- Phase III · Grâce et liberté ----
  { id: 'luc',         nom: 'Évangile selon Luc',         ch: 24, phase: 'p3', level: 1 },
  { id: 'josue',       nom: 'Josué',                      ch: 24, phase: 'p3', level: 2 },
  { id: 'juges',       nom: 'Juges',                      ch: 21, phase: 'p3', level: 2 },
  { id: 'ruth',        nom: 'Ruth',                       ch: 4,  phase: 'p3', level: 1,
    note: "Une aïeule du Christ (cf. Mt 1). Bref et lumineux après la violence des Juges." },
  { id: 'galates',     nom: 'Épître aux Galates',         ch: 6,  phase: 'p3', level: 2,
    note: "Le manifeste de la liberté chrétienne : la grâce, non la Loi, justifie." },
  { id: 'romains',     nom: 'Épître aux Romains',         ch: 16, phase: 'p3', level: 3,
    note: "Le sommet de la théologie paulinienne. Lire posément, c'est le cœur de l'Évangile de Paul." },

  // ---- Phase IV · Le Roi et le Royaume ----
  { id: 'jean',        nom: 'Évangile selon Jean',        ch: 21, phase: 'p4', level: 2,
    note: "Le plus théologique des quatre. Lire lentement, savourer." },
  { id: '1samuel',     nom: '1er livre de Samuel',        ch: 31, phase: 'p4', level: 2 },
  { id: '2samuel',     nom: '2e livre de Samuel',         ch: 24, phase: 'p4', level: 2 },
  { id: '1rois',       nom: '1er livre des Rois',         ch: 22, phase: 'p4', level: 2 },
  { id: '2rois',       nom: '2e livre des Rois',          ch: 25, phase: 'p4', level: 2 },
  { id: 'ephesiens',   nom: 'Épître aux Éphésiens',       ch: 6,  phase: 'p4', level: 2,
    note: "Le Christ, tête de l'Église : la royauté qu'attendaient les rois d'Israël." },
  { id: 'colossiens',  nom: 'Épître aux Colossiens',      ch: 4,  phase: 'p4', level: 1 },
  { id: 'philippiens', nom: 'Épître aux Philippiens',     ch: 4,  phase: 'p4', level: 1 },

  // ---- Phase V · La Sagesse faite chair ----
  { id: 'actes',       nom: 'Actes des Apôtres',          ch: 28, phase: 'p5', level: 1 },
  { id: 'proverbes',   nom: 'Proverbes',                  ch: 31, phase: 'p5', level: 1 },
  { id: 'qohelet',     nom: 'Qohélet (Ecclésiaste)',      ch: 12, phase: 'p5', level: 2 },
  { id: 'sagesse',     nom: 'Sagesse',                    ch: 19, phase: 'p5', level: 2 },
  { id: 'siracide',    nom: 'Siracide (Ecclésiastique)',  ch: 51, phase: 'p5', level: 2,
    note: "Long mais limpide : un chapitre se lit comme une lettre d'un sage." },
  { id: 'job',         nom: 'Job',                        ch: 42, phase: 'p5', level: 3,
    note: "Les longs discours (ch. 3-37) se lisent en survol ; garder le prologue et le final." },
  { id: 'cantique',    nom: 'Cantique des cantiques',     ch: 8,  phase: 'p5', level: 2 },
  { id: 'jacques',     nom: 'Épître de Jacques',          ch: 5,  phase: 'p5', level: 1,
    note: "La sagesse d'Israël devenue morale chrétienne : la foi sans les œuvres est morte." },

  // ---- Phase VI · L'exil et la consolation ----
  { id: 'isaie',       nom: 'Isaïe',                      ch: 66, phase: 'p6', level: 3,
    note: "Le prince des prophètes. Les chants du Serviteur (ch. 42, 49, 50, 52-53) annoncent la Passion." },
  { id: 'jeremie',     nom: 'Jérémie',                    ch: 52, phase: 'p6', level: 3, skim: true,
    note: "Long et non chronologique. Survol guidé ; garder les 'confessions' du prophète." },
  { id: 'lamentations',nom: 'Lamentations',               ch: 5,  phase: 'p6', level: 2 },
  { id: 'baruch',      nom: 'Baruch',                     ch: 6,  phase: 'p6', level: 2 },
  { id: 'ezechiel',    nom: 'Ézéchiel',                   ch: 48, phase: 'p6', level: 3, skim: true,
    note: "Visions déroutantes. Retenir ch. 1, 34, 36-37 ; survoler le Temple (40-48)." },
  { id: 'hebreux',     nom: 'Épître aux Hébreux',         ch: 13, phase: 'p6', level: 3,
    note: "Le Christ, grand prêtre : l'accomplissement du culte et de l'exil. Dense mais magnifique." },
  { id: '1pierre',     nom: '1re de Pierre',              ch: 5,  phase: 'p6', level: 1,
    note: "Lettre aux chrétiens éprouvés : la souffrance relue par l'espérance pascale." },
  { id: '2pierre',     nom: '2e de Pierre',               ch: 3,  phase: 'p6', level: 1 },

  // ---- Phase VII · Les prophètes et l'attente ----
  { id: 'osee',        nom: 'Osée',                       ch: 14, phase: 'p7', level: 2 },
  { id: 'joel',        nom: 'Joël',                       ch: 4,  phase: 'p7', level: 1 },
  { id: 'amos',        nom: 'Amos',                       ch: 9,  phase: 'p7', level: 1 },
  { id: 'abdias',      nom: 'Abdias',                     ch: 1,  phase: 'p7', level: 1 },
  { id: 'jonas',       nom: 'Jonas',                      ch: 4,  phase: 'p7', level: 1,
    note: "Signe de la résurrection selon Jésus lui-même (Mt 12, 40)." },
  { id: 'michee',      nom: 'Michée',                     ch: 7,  phase: 'p7', level: 1 },
  { id: 'nahum',       nom: 'Nahum',                      ch: 3,  phase: 'p7', level: 1 },
  { id: 'habaquq',     nom: 'Habaquq',                    ch: 3,  phase: 'p7', level: 1 },
  { id: 'sophonie',    nom: 'Sophonie',                   ch: 3,  phase: 'p7', level: 1 },
  { id: 'aggee',       nom: 'Aggée',                      ch: 2,  phase: 'p7', level: 1 },
  { id: 'zacharie',    nom: 'Zacharie',                   ch: 14, phase: 'p7', level: 2 },
  { id: 'malachie',    nom: 'Malachie',                   ch: 3,  phase: 'p7', level: 1 },
  { id: 'esdras',      nom: 'Esdras',                     ch: 10, phase: 'p7', level: 2 },
  { id: 'nehemie',     nom: 'Néhémie',                    ch: 13, phase: 'p7', level: 2 },
  { id: '1corinthiens',nom: '1re aux Corinthiens',        ch: 16, phase: 'p7', level: 2 },
  { id: '2corinthiens',nom: '2e aux Corinthiens',         ch: 13, phase: 'p7', level: 2 },
  { id: '1thess',      nom: '1re aux Thessaloniciens',    ch: 5,  phase: 'p7', level: 1 },
  { id: '2thess',      nom: '2e aux Thessaloniciens',     ch: 3,  phase: 'p7', level: 1 },
  { id: '1timothee',   nom: '1re à Timothée',             ch: 6,  phase: 'p7', level: 1 },
  { id: '2timothee',   nom: '2e à Timothée',             ch: 4,  phase: 'p7', level: 1 },
  { id: 'tite',        nom: 'Épître à Tite',              ch: 3,  phase: 'p7', level: 1 },
  { id: 'philemon',    nom: 'Épître à Philémon',          ch: 1,  phase: 'p7', level: 1 },
  { id: '1jean',       nom: '1re de Jean',                ch: 5,  phase: 'p7', level: 1 },
  { id: '2jean',       nom: '2e de Jean',                 ch: 1,  phase: 'p7', level: 1 },
  { id: '3jean',       nom: '3e de Jean',                 ch: 1,  phase: 'p7', level: 1 },
  { id: 'jude',        nom: 'Épître de Jude',             ch: 1,  phase: 'p7', level: 1 },

  // ---- Phase VIII · Le dévoilement ----
  { id: 'tobie',       nom: 'Tobie',                      ch: 14, phase: 'p8', level: 1 },
  { id: 'judith',      nom: 'Judith',                     ch: 16, phase: 'p8', level: 2 },
  { id: 'esther',      nom: 'Esther',                     ch: 10, phase: 'p8', level: 1 },
  { id: '1chroniques', nom: '1er livre des Chroniques',   ch: 29, phase: 'p8', level: 3, skim: true,
    note: "Reprend Samuel/Rois avec généalogies. Survoler les listes (ch. 1-9)." },
  { id: '2chroniques', nom: '2e livre des Chroniques',    ch: 36, phase: 'p8', level: 3, skim: true,
    note: "Parallèle aux Rois. Lecture en survol, sauf Salomon et les réformes." },
  { id: 'daniel',      nom: 'Daniel',                     ch: 14, phase: 'p8', level: 2,
    note: "L'apocalyptique de l'AT : ses visions préparent celles de Jean." },
  { id: '1maccabees',  nom: '1er livre des Maccabées',    ch: 16, phase: 'p8', level: 2 },
  { id: '2maccabees',  nom: '2e livre des Maccabées',     ch: 15, phase: 'p8', level: 3, skim: true,
    note: "Recoupe le 1er Maccabées. Retenir ch. 6-7 (les martyrs) ; survoler le reste." },
  { id: 'apocalypse',  nom: 'Apocalypse',                 ch: 22, phase: 'p8', level: 3,
    note: "Le dévoilement final. Lire comme une liturgie céleste, sans décoder à tout prix." },
];

// Le livre des Psaumes (150) est le FIL ROUGE : médité en parallèle,
// un psaume par jour, tout au long du parcours. C'est le 73e livre lu.
const PSAUMES_TOTAL = 150;

if (typeof module !== 'undefined') module.exports = { PHASES, LIVRES, PSAUMES_TOTAL };
