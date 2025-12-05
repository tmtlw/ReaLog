import { Category, Question, AppData } from './types';

export const DEFAULT_QUESTIONS: Question[] = [
  // --- DAILY (Napi) ---
  { id: 'q_d_1', text: 'Mi volt a mai legfontosabb győzelem?', category: Category.DAILY, isActive: true },
  { id: 'q_d_2', text: 'Miben fejlődtem ma 1%-ot?', category: Category.DAILY, isActive: true },
  { id: 'q_d_3', text: 'Mi akadályozott ma?', category: Category.DAILY, isActive: true },
  { id: 'q_d_4', text: 'Miért vagyok ma hálás?', category: Category.DAILY, isActive: false },
  { id: 'q_d_5', text: 'Hogyan léptem ki ma a komfortzónámból?', category: Category.DAILY, isActive: false },
  { id: 'q_d_6', text: 'Mennyire voltam fókuszált (1-10)?', category: Category.DAILY, isActive: false },
  { id: 'q_d_7', text: 'Mit tanultam ma a hibáimból?', category: Category.DAILY, isActive: false },
  { id: 'q_d_8', text: 'Kinek segítettem ma?', category: Category.DAILY, isActive: false },
  { id: 'q_d_9', text: 'Milyen szokást sikerült ma megtartanom?', category: Category.DAILY, isActive: false },
  { id: 'q_d_10', text: 'Mi az az egy dolog, amit holnap jobban akarok csinálni?', category: Category.DAILY, isActive: false },
  { id: 'q_d_11', text: 'Hogyan kezeltem ma a stresszt?', category: Category.DAILY, isActive: false },
  { id: 'q_d_12', text: 'Mennyi időt pazaroltam el ma, és mire?', category: Category.DAILY, isActive: false },
  { id: 'q_d_13', text: 'Közelebb kerültem ma a fő célomhoz?', category: Category.DAILY, isActive: false },
  { id: 'q_d_14', text: 'Milyen volt az energiaszintem a nap folyamán?', category: Category.DAILY, isActive: false },
  { id: 'q_d_15', text: 'Mit üzennék a holnapi énemnek?', category: Category.DAILY, isActive: false },

  // --- WEEKLY (Heti) ---
  { id: 'q_w_1', text: 'Mi volt a hét legnagyobb tanulsága?', category: Category.WEEKLY, isActive: true },
  { id: 'q_w_2', text: 'Teljesítettem a heti KPI-okat?', category: Category.WEEKLY, isActive: true },
  { id: 'q_w_3', text: 'Mi volt a hét fénypontja?', category: Category.WEEKLY, isActive: true },
  { id: 'q_w_4', text: 'Melyik nap volt a legproduktívabb és miért?', category: Category.WEEKLY, isActive: false },
  { id: 'q_w_5', text: 'Hol vesztettem a legtöbb időt ezen a héten?', category: Category.WEEKLY, isActive: false },
  { id: 'q_w_6', text: 'Hogyan pihentem és töltődtem fel?', category: Category.WEEKLY, isActive: false },
  { id: 'q_w_7', text: 'Milyen kapcsolatokat építettem ezen a héten?', category: Category.WEEKLY, isActive: false },
  { id: 'q_w_8', text: 'Mi az a dolog, amit jövő héten el kell engednem?', category: Category.WEEKLY, isActive: false },
  { id: 'q_w_9', text: 'Mennyire voltam hű az elveimhez?', category: Category.WEEKLY, isActive: false },
  { id: 'q_w_10', text: 'Milyen pénzügyi döntéseket hoztam?', category: Category.WEEKLY, isActive: false },
  { id: 'q_w_11', text: 'Mit tettem a testi egészségemért?', category: Category.WEEKLY, isActive: false },
  { id: 'q_w_12', text: 'Olvastam vagy tanultam valami újat?', category: Category.WEEKLY, isActive: false },
  { id: 'q_w_13', text: 'Hogyan értékelném a hetemet 1-től 10-ig?', category: Category.WEEKLY, isActive: false },
  { id: 'q_w_14', text: 'Mi a jövő hét legfontosabb célja (The One Thing)?', category: Category.WEEKLY, isActive: false },
  { id: 'q_w_15', text: 'Kinek tartozom köszönettel ezen a héten?', category: Category.WEEKLY, isActive: false },

  // --- MONTHLY (Havi) ---
  { id: 'q_m_1', text: 'Hogyan állok az éves céljaimmal?', category: Category.MONTHLY, isActive: true },
  { id: 'q_m_2', text: 'Mi volt a hónap legnagyobb áttörése?', category: Category.MONTHLY, isActive: true },
  { id: 'q_m_3', text: 'Milyen új készséget sajátítottam el?', category: Category.MONTHLY, isActive: true },
  { id: 'q_m_4', text: 'Melyik szokásom hátráltatott a legjobban?', category: Category.MONTHLY, isActive: false },
  { id: 'q_m_5', text: 'Hogyan alakult a pénzügyi mérlegem?', category: Category.MONTHLY, isActive: false },
  { id: 'q_m_6', text: 'Milyen könyveket/podcastokat fogyasztottam?', category: Category.MONTHLY, isActive: false },
  { id: 'q_m_7', text: 'Kikkel töltöttem a legtöbb időt, és ez épített-e?', category: Category.MONTHLY, isActive: false },
  { id: 'q_m_8', text: 'Mi volt a legnehezebb döntés, amit meg kellett hoznom?', category: Category.MONTHLY, isActive: false },
  { id: 'q_m_9', text: 'Mennyire voltam jelen a magánéletemben?', category: Category.MONTHLY, isActive: false },
  { id: 'q_m_10', text: 'Mi az, amit a következő hónapban másképp fogok csinálni?', category: Category.MONTHLY, isActive: false },
  { id: 'q_m_11', text: 'Milyen félelmekkel néztem szembe?', category: Category.MONTHLY, isActive: false },
  { id: 'q_m_12', text: 'Mennyit haladtam a hosszú távú projektekkel?', category: Category.MONTHLY, isActive: false },
  { id: 'q_m_13', text: 'Volt-e olyan pillanat, amikor fel akartam adni?', category: Category.MONTHLY, isActive: false },
  { id: 'q_m_14', text: 'Mivel jutalmaztam meg magam?', category: Category.MONTHLY, isActive: false },
  { id: 'q_m_15', text: 'Mi a következő hónap mottója?', category: Category.MONTHLY, isActive: false },

  // --- YEARLY (Éves) ---
  { id: 'q_y_1', text: 'Milyen emberré váltam idén?', category: Category.YEARLY, isActive: true },
  { id: 'q_y_2', text: 'Mi volt az év legmeghatározóbb pillanata?', category: Category.YEARLY, isActive: true },
  { id: 'q_y_3', text: 'Melyik 3 célomat sikerült maradéktalanul teljesíteni?', category: Category.YEARLY, isActive: true },
  { id: 'q_y_4', text: 'Mi volt a legnagyobb csalódás, és mit tanultam belőle?', category: Category.YEARLY, isActive: false },
  { id: 'q_y_5', text: 'Hogyan változott a gondolkodásmódom tavalyhoz képest?', category: Category.YEARLY, isActive: false },
  { id: 'q_y_6', text: 'Kik azok az emberek, akik elkísértek az úton?', category: Category.YEARLY, isActive: false },
  { id: 'q_y_7', text: 'Milyen új helyeken jártam?', category: Category.YEARLY, isActive: false },
  { id: 'q_y_8', text: 'Mennyit adakoztam vagy segítettem másokon?', category: Category.YEARLY, isActive: false },
  { id: 'q_y_9', text: 'Milyen egészségügyi mérföldköveket értem el?', category: Category.YEARLY, isActive: false },
  { id: 'q_y_10', text: 'Melyik volt a legjobb befektetésem (időben vagy pénzben)?', category: Category.YEARLY, isActive: false },
  { id: 'q_y_11', text: 'Mit bántam meg, és hogyan léptem túl rajta?', category: Category.YEARLY, isActive: false },
  { id: 'q_y_12', text: 'Hogyan definiálnám újra a sikert a következő évre?', category: Category.YEARLY, isActive: false },
  { id: 'q_y_13', text: 'Milyen "bakancslistás" tételt pipáltam ki?', category: Category.YEARLY, isActive: false },
  { id: 'q_y_14', text: 'Ha egy szóval kellene leírni ezt az évet, mi lenne az?', category: Category.YEARLY, isActive: false },
  { id: 'q_y_15', text: 'Mi a legmerészebb álmom a következő évre?', category: Category.YEARLY, isActive: false },
];

export const INITIAL_DATA: AppData = {
  questions: DEFAULT_QUESTIONS,
  entries: []
};

export const CATEGORY_LABELS: Record<Category, string> = {
  [Category.DAILY]: 'Napi',
  [Category.WEEKLY]: 'Heti',
  [Category.MONTHLY]: 'Havi',
  [Category.YEARLY]: 'Éves',
};

// Simple hardcoded password for demo purposes. 
// In a real app, use a secure backend or hash.
export const DEMO_PASSWORD = "grind";