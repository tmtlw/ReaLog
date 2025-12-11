
import { Category, Question, AppData, Entry } from './types';

export const SUB_CATEGORIES = [
    'general', // Napomról
    'health', // Egészség
    'friends', // Barátság
    'business', // Üzleti fejlődés
    'finance', // Anyagi függetlenség
    'family', // Család
    'personal', // Személyes fejlődés
    'goals', // Célok
    'dreams', // Tervek álmok
    'achieved' // Elért célok
];

// Raw data for generating 400 questions. 
// Format: [Period][SubCategory] = Array of 10 strings
const RAW_QUESTIONS_DATA: Record<string, Record<string, string[]>> = {
    [Category.DAILY]: {
        general: [
            "Mi volt a mai nap fénypontja?", "Miért vagyok ma hálás?", "Mi volt a legnehezebb pillanat?", "Hogyan éreztem magam általánosságban?", "Mi lepett meg ma?", "Milyen volt az energiaszintem?", "Mennyire voltam jelen a pillanatban?", "Mi az az egy szó, ami leírja a mai napot?", "Min változtatnék a mai napon?", "Vártam a mai napot?"
        ],
        health: [
            "Hogyan éreztem magam fizikailag?", "Ittam elég vizet (min 2L)?", "Ettem ma friss zöldséget/gyümölcsöt?", "Mozogtam ma legalább 30 percet?", "Hogyan aludtam az éjjel?", "Volt ma káros szenvedélyem?", "Mennyire voltam stresszes?", "Tettem ma a hosszú távú egészségemért?", "Fájt valamim ma?", "Mennyi koffeint fogyasztottam?"
        ],
        friends: [
            "Kivel beszéltem ma?", "Kinek segítettem ma?", "Kit hívtam fel csak úgy?", "Kivel nevettem ma?", "Éreztem ma magányt?", "Kivel találkoztam személyesen?", "Kinek csaltam mosolyt az arcára?", "Volt ma konfliktusom baráttal?", "Kire gondoltam ma sokat?", "Ápoltam ma a kapcsolataimat?"
        ],
        business: [
            "Tettem ma valamit az üzleti céljaimért?", "Mi volt a mai legfontosabb elvégzett feladat?", "Tanultam ma valami szakmait?", "Mennyire voltam produktív (1-10)?", "Delegáltam ma feladatot?", "Mi hátráltatott a munkában?", "Jött ma új üzleti ötletem?", "Bővült ma a szakmai hálózatom?", "Megoldottam egy komplex problémát?", "Elégedett vagyok a mai teljesítményemmel?"
        ],
        finance: [
            "Mennyit költöttem ma feleslegesen?", "Félretettem ma valamennyit?", "Vettem ma impulzusból valamit?", "Áttekintettem a mai kiadásokat?", "Kerestem ma extra pénzt?", "Olvastam pénzügyi híreket?", "Közelebb kerültem a pénzügyi szabadsághoz?", "Volt ma váratlan kiadásom?", "Hogyan értékelem a mai pénzügyi döntéseimet?", "Spóroltam ma valamin?"
        ],
        family: [
            "Beszéltem ma a családommal?", "Türelmes voltam a családtagjaimmal?", "Milyen minőségi időt töltöttünk együtt?", "Segítettem valamit otthon?", "Mondtam nekik, hogy szeretem őket?", "Volt ma családi vita?", "Mi volt a legjobb családi pillanat?", "Vacsora közösen telt?", "Tudtam figyelni rájuk?", "Hálás vagyok a családomért ma?"
        ],
        personal: [
            "Mit tanultam ma?", "Miben léptem ki a komfortzónámból?", "Olvastam ma könyvet (min 10p)?", "Halogattam ma valamit?", "Hogyan kezeltem a negatív érzelmeket?", "Voltam ma csendben/meditáltam?", "Milyen új felismerésem volt?", "Gyakoroltam ma egy idegen nyelvet?", "Hű voltam az elveimhez?", "Fejlődött ma a jellemem?"
        ],
        goals: [
            "Közelebb kerültem a fő célomhoz?", "Mi volt a mai 'békám' (legnehezebb feladat)?", "Tettem ma egy kis lépést előre?", "Vizualizáltam a céljaimat?", "Eltértem ma a terveimtől?", "Mi motivált ma a legjobban?", "Látom a haladást?", "Írtam ma teendőlistát?", "Priorizáltam a feladataimat?", "Mi a holnapi legfontosabb célom?"
        ],
        dreams: [
            "Milyen álom foglalkoztatott ma?", "Álmodoztam ma napközben?", "Láttam ma valami inspirálót?", "Felírtam egy új bakancslistás tételt?", "Elhittem ma, hogy lehetséges?", "Tettem lépést az áloméletem felé?", "Mi inspirált ma?", "Hallgattam ma motivációs anyagot?", "Milyen lenne az ideális napom, ha ez az volt?", "Közelebb érzem az álmaimat?"
        ],
        achieved: [
            "Mi volt a mai legnagyobb sikerem?", "Mire vagyok ma a legbüszkébb?", "Mit pipáltam ki a listámról?", "Kaptam ma dicséretet?", "Legyőztem ma egy félelmemet?", "Megoldottam egy régi problémát?", "Befejeztem valamit, amit elkezdtem?", "Sikerült nemet mondanom valamire?", "Túlléptem ma önmagamon?", "Jól kezeltem egy nehéz helyzetet?"
        ]
    },
    [Category.WEEKLY]: {
        general: ["Hogy értékelem a hetemet 1-10 skálán?", "Mi volt a hét legjobb napja?", "Mi volt a mélypont?", "Gyorsan elrepült a hét?", "Milyen hangulat jellemezte a hetet?", "Mennyire voltam kiegyensúlyozott?", "Miért vagyok hálás ezen a héten?", "Mi az az egy dolog, amit máshogy csinálnék?", "Kipihentem magam a hétvégén?", "Várom a következő hetet?"],
        health: ["Hányszor sportoltam ezen a héten?", "Hogyan étkeztem a héten?", "Eleget aludtam átlagosan?", "Volt betegség vagy fájdalom?", "Mennyi alkoholt/cukrot fogyasztottam?", "Törődtem a mentális egészségemmel?", "Voltam friss levegőn eleget?", "Sikerült tartanom a diétát?", "Milyen volt az erőnlétem?", "Mit teszek jövő héten az egészségemért?"],
        friends: ["Találkoztam barátokkal?", "Kivel mélyült el a kapcsolatom?", "Keresett valaki, akire nem számítottam?", "Szerveztem közös programot?", "Tudtam segíteni egy barátnak?", "Éreztem támogatást a barátaimtól?", "Volt közösségi élményem?", "Megismertem új embert?", "Elhanyagoltam valakit?", "Kivel szeretnék jövő héten találkozni?"],
        business: ["Milyen üzleti mérföldkövet értem el?", "Teljesítettem a heti KPI-okat?", "Mi volt a legnagyobb szakmai kihívás?", "Kaptam pozitív visszajelzést?", "Tanultam új piaci trendről?", "Mennyire voltam hatékony?", "Sikerült lezárni a projekteket?", "Volt felesleges meeting?", "Fejlődött a vállalkozás/karrier?", "Mi a jövő hét fő üzleti fókusza?"],
        finance: ["Mennyit sikerült félretenni a héten?", "Tartottam a heti keretet?", "Volt váratlan nagy kiadás?", "Nőtt a vagyonom ezen a héten?", "Hoztam jó befektetési döntést?", "Mennyit költöttem szórakozásra?", "Elemeztem a heti költéseket?", "Találtam új bevételi forrást?", "Kifizettem minden számlát?", "Elégedett vagyok a heti pénzügyeimmel?"],
        family: ["Minőségi időt töltöttem a családdal?", "Volt közös családi program?", "Mindenkivel tudtam beszélni?", "Volt konfliktus a héten?", "Hogyan segítettem otthon?", "Meglátogattam a távolabbi rokonokat?", "Volt közös étkezés?", "Tudtam türelmes lenni?", "Mi volt a hét családi sztorija?", "Terveztünk valamit a jövőre?"],
        personal: ["Milyen új készséget gyakoroltam?", "Olvastam legalább egy könyv felét?", "Mennyi időt töltöttem a képernyő előtt?", "Sikerült a hobbimmal foglalkozni?", "Kiléptem a komfortzónámból?", "Milyen rossz szokást hagytam el?", "Milyen jó szokást építettem?", "Voltam önreflektív?", "Mennyit fejlődtem a héten?", "Mi a jövő hét személyes mottója?"],
        goals: ["Hogyan alakulnak a jövő heti terveim?", "Elértem a heti céljaimat?", "Melyik célom maradt el?", "Újra kellett terveznem valamit?", "Mennyit haladtam a havi cél felé?", "Fókuszált maradtam?", "Mi volt a legnagyobb akadály?", "Jól osztottam be az időmet?", "Használtam a naptáramat?", "Reálisak voltak a céljaim?"],
        dreams: ["Mi inspirált a héten?", "Láttam példát az áloméletemre?", "Tettem valamit a bakancslistámért?", "Álmodoztam a jövőről?", "Éreztem a bőséget?", "Milyen vizuális inspiráció ért?", "Beszéltem valakivel az álmaimról?", "Elhittem, hogy megérdemlem?", "Motivált voltam?", "Mi a következő nagy álmom lépése?"],
        achieved: ["Melyik heti célomat pipáltam ki?", "Mire vagyok a legbüszkébb a héten?", "Mi volt a legnagyobb győzelem?", "Kaptam elismerést?", "Sikerült befejezni egy nehéz feladatot?", "Legyőztem a lustaságot?", "Megoldottam egy konfliktust?", "Segítettem valakinek elérni a célját?", "Túlszárnyaltam az elvárásokat?", "Ünnepeltem a sikereimet?"]
    },
    [Category.MONTHLY]: {
        general: ["Mi volt a hónap legemlékezetesebb pillanata?", "Hogyan jellemezném ezt a hónapot egy szóval?", "Mi volt a legnagyobb tanulság?", "Milyen volt az általános hangulatom?", "Gyorsan elment a hónap?", "Miért vagyok hálás ebben a hónapban?", "Mi volt a mélypont?", "Min változtatnék utólag?", "Kiegyensúlyozott hónap volt?", "Várom a következő hónapot?"],
        health: ["Hogy szolgált az egészségem ebben a hónapban?", "Hány edzést csináltam a hónapban?", "Változott a súlyom/alakom?", "Milyen új egészséges ételt próbáltam?", "Voltam orvosi szűrésen?", "Mennyit aludtam átlagosan?", "Sikerült csökkenteni a stresszt?", "Hány napot voltam beteg?", "Javult az állóképességem?", "Mi a jövő havi egészség célom?"],
        friends: ["Kivel mélyült el a kapcsolatom?", "Hány baráttal találkoztam?", "Szereztem új barátot?", "Szerveztem nagyobb összejövetelt?", "Kinek segítettem komolyabb dologban?", "Ért csalódás barátban?", "Ki inspirált a barátaim közül?", "Volt közös utazás/kaland?", "Ápoltam a régi kapcsolatokat?", "Kire kellene több időt szánnom?"],
        business: ["Nőtt a bevételem vagy az üzleti értékem?", "Mi volt a hónap projektje?", "Elértem a havi KPI-okat?", "Milyen visszajelzéseket kaptam?", "Tanultam új szakmai skillt?", "Bővült az ügyfélköröm?", "Voltam szakmai rendezvényen?", "Hatékonyabb lettem?", "Mi volt a legnagyobb üzleti siker?", "Mi a következő hónap stratégiája?"],
        finance: ["Hogy áll a vagyonmérlegem?", "Mennyit sikerült megtakarítani?", "Túlteljesítettem a büdzsét?", "Volt nagy beruházás?", "Nőtt a passzív jövedelmem?", "Olvastam pénzügyi könyvet?", "Hogyan alakultak a befektetéseim?", "Csökkentettem a kiadásokat?", "Volt felesleges vásárlás?", "Elégedett vagyok az anyagi helyzetemmel?"],
        family: ["Milyen családi esemény történt?", "Hányszor láttam a szüleimet/gyerekeimet?", "Volt közös ünneplés?", "Megoldottunk egy családi problémát?", "Erősödött a családi kötelék?", "Milyen élményt adtam nekik?", "Támogattak a céljaimban?", "Volt közös kirándulás?", "Türelmes voltam velük?", "Mi a terv a következő hónapra velük?"],
        personal: ["Milyen könyvet/kurzust fejeztem be?", "Milyen új szokást rögzítettem?", "Jártam új helyen?", "Foglalkoztam a hobbimmal?", "Mennyit fejlődött az önismeretem?", "Voltam kulturális eseményen?", "Kevesebbet telefonoztam?", "Kiléptem a komfortzónámból?", "Büszke vagyok a személyiségemre?", "Miben szeretnék fejlődni jövőre?"],
        goals: ["Mi a fókusz a következő hónapra?", "Elértem a havi céljaimat?", "Hol tartok az éves célokban?", "Kell korrigálni az irányon?", "Mi volt a legnagyobb akadály?", "Motivált maradtam végig?", "Használtam a tervezőmet?", "Melyik célom haladt a legjobban?", "Melyik célom ragadt be?", "Reálisak a jövő havi tervek?"],
        dreams: ["Változott a jövőképem?", "Tettem nagy lépést az álmomért?", "Mi inspirált a legjobban?", "Találtam új példaképet?", "Bővült a bakancslistám?", "Jártam álom-helyszínen?", "Megéltem a bőséget?", "Voltam vizualizálni?", "Érzem, hogy közeledik?", "Milyen álmot szeretnék valóra váltani hamarosan?"],
        achieved: ["Melyik havi cél teljesült maradéktalanul?", "Mi volt a hónap győzelme?", "Milyen nehézséget győztem le?", "Kaptam elismerést/díjat?", "Befejeztem egy nagy projektet?", "Sikerült spórolni?", "Megjavítottam valamit?", "Segítettem valakin?", "Tartottam a szavamat?", "Megünnepeltem a hónapot?"]
    },
    [Category.YEARLY]: {
        general: ["Milyen emberré váltam idén?", "Hogyan jellemezném ezt az évet 3 szóval?", "Mi volt az év csúcspontja?", "Mi volt az év mélypontja?", "Gyorsan elszaladt az év?", "Milyen leckét tanított ez az év?", "Boldogabb vagyok, mint tavaly?", "Miért vagyok a leghálásabb?", "Mit bántam meg?", "Ez volt életem legjobb éve?"],
        health: ["Milyen egészségügyi szokást vettem fel?", "Voltam minden szűrésen?", "Változott a testem?", "Mennyit sportoltam összesen?", "Egészségesebben eszem?", "Letettem káros szokást?", "Hogyan kezeltem a stresszt?", "Volt komolyabb betegség?", "Jobb a kondícióm?", "Mi az új évi egészségcél?"],
        friends: ["Kik voltak a legfontosabb emberek idén?", "Kik koptak ki az életemből?", "Szereztem életre szóló barátot?", "Milyen közös élmények voltak?", "Kinek segítettem a legtöbbet?", "Ki segített nekem?", "Rendeztem a konfliktusokat?", "Elég időt szántam rájuk?", "Volt nagy közös utazás?", "Kivel szeretnék szorosabbra fűzni?"],
        business: ["Mennyit fejlődött a vállalkozásom/karrierem?", "Elértem az éves bevételi célt?", "Kaptam előléptetést/emelést?", "Milyen új projektet indítottam?", "Tanultam új szakmát?", "Bővült a szakmai kapcsolati háló?", "Élveztem a munkámat?", "Voltam kiégve?", "Mi volt a legnagyobb szakmai siker?", "Mi a jövő évi nagy dobás?"],
        finance: ["Elértem az anyagi függetlenség kitűzött szintjét?", "Mennyivel nőtt a nettó vagyonom?", "Sikerült a megtakarítási cél?", "Mi volt a legjobb befektetés?", "Mi volt a legrosszabb pénzügyi döntés?", "Vettem ingatlant/nagy értékű eszközt?", "Tudtam adakozni?", "Van vésztartalékom?", "Hogyan változott a pénzügyi intelligenciám?", "Mi a jövő évi pénzügyi cél?"],
        family: ["Hogyan támogattam a családomat?", "Bővült a család?", "Elveszítettünk valakit?", "Milyen volt a karácsony/ünnepek?", "Sikerült megoldani a családi vitákat?", "Volt nagy családi nyaralás?", "Elég időt töltöttem a szüleimmel/gyerekeimmel?", "Jobb családtag lettem?", "Mi a legszebb családi emlék?", "Mit tervezünk jövőre közösen?"],
        personal: ["Miben fejlődtem a legtöbbet mentálisan?", "Hány könyvet olvastam el?", "Megtanultam egy új nyelvet?", "Utaztam új országba?", "Foglalkoztam a lelkemmel?", "Voltam bátor?", "Ismerem jobban önmagam?", "Megvalósítottam egy hobbit?", "Kiegyensúlyozottabb lettem?", "Milyen ember szeretnék lenni jövőre?"],
        goals: ["Mi a legfontosabb célom a következő évre?", "Hány %-át teljesítettem az idei terveknek?", "Melyik célom hiúsult meg?", "Változtak a prioritások?", "Jól tűztem ki a célokat?", "Kitartó voltam?", "Mi akadályozott leginkább?", "Írtam le a céljaimat?", "Van 5 éves tervem?", "Motiváltan vágok neki az új évnek?"],
        dreams: ["Hol látom magam 5 év múlva?", "Teljesült egy nagy álmom idén?", "Pipáltam ki bakancslistás tételt?", "Mertem nagyot álmodni?", "Látom az utat az álmaim felé?", "Inspiráló környezetben élek?", "Tettem valami őrültséget?", "Hű maradtam az álmaimhoz?", "Milyen új álmom született?", "Mit teszek jövőre az álmaimért?"],
        achieved: ["Mi volt az év legnagyobb győzelme?", "Milyen díjat/elismerést kaptam?", "Milyen nehézséget küzdöttem le?", "Sikerült lefutni/megemelni/megcsinálni?", "Befejeztem az iskolát/projektet?", "Megvettem, amire vágytam?", "Segítettem másokon?", "Túléltem a nehéz időszakokat?", "Büszke vagyok erre az évre?", "Megünnepeltem az évet?"]
    }
};

const generateQuestions = (): Question[] => {
    const questions: Question[] = [];
    const categories = [Category.DAILY, Category.WEEKLY, Category.MONTHLY, Category.YEARLY];
    
    categories.forEach(cat => {
        const subCats = RAW_QUESTIONS_DATA[cat];
        if (subCats) {
            Object.entries(subCats).forEach(([subCatKey, texts]) => {
                texts.forEach((text, index) => {
                    questions.push({
                        id: `q_${cat.toLowerCase()[0]}_${subCatKey}_${index}`,
                        text: text,
                        category: cat,
                        subCategory: subCatKey,
                        isActive: index < 3 // Activate first 3 by default per subcat
                    });
                });
            });
        }
    });
    return questions;
};

export const DEFAULT_QUESTIONS: Question[] = generateQuestions();

const now = Date.now();
const day = 86400000;

const SAMPLE_ENTRIES: Entry[] = [
    {
        id: 'sample-1',
        timestamp: now,
        dateLabel: new Date(now).toISOString().split('T')[0],
        title: 'Reggeli lendület',
        category: Category.DAILY,
        mood: '🚀',
        weather: { temp: 22, condition: 'Clear', location: 'Budapest', icon: '01d' },
        location: 'Margitsziget, Budapest',
        gps: { lat: 47.52, lon: 19.05 },
        tags: ['futas', 'egeszseg', 'reggel'],
        photo: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=600&q=80',
        photos: ['https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=600&q=80'],
        entryMode: 'free',
        freeTextContent: 'Ma sikerült 5km-t futni <b>rekord idő</b> alatt! <br/> Nagyon friss volt a levegő, és a nap is sütött.',
        responses: {},
        isPrivate: false
    },
    {
        id: 'sample-2',
        timestamp: now - day,
        dateLabel: new Date(now - day).toISOString().split('T')[0],
        title: 'Deep Work Session',
        category: Category.DAILY,
        mood: '🔥',
        weather: { temp: 18, condition: 'Clouds', location: 'Budapest', icon: '04d' },
        location: 'Otthon',
        tags: ['munka', 'coding', 'projekt'],
        entryMode: 'structured',
        responses: {
            'q_d_business_0': 'Befejeztem a refactoringot.',
            'q_d_personal_0': 'Megértettem a React Context mélyebb működését.',
            'q_d_business_5': 'Túl sok volt a meeting.'
        },
        isPrivate: true
    },
    {
        id: 'sample-3',
        timestamp: now - (day * 3),
        dateLabel: new Date(now - (day * 3)).toISOString().split('T')[0],
        title: 'Kirándulás a hegyekben',
        category: Category.DAILY,
        mood: '🙂',
        weather: { temp: 15, condition: 'Rain', location: 'Dobogókő', icon: '10d' },
        location: 'Dobogókő',
        gps: { lat: 47.71, lon: 18.91 },
        tags: ['kirandulas', 'termeszet', 'pihenes'],
        photo: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=600&q=80',
        photos: ['https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=600&q=80'],
        entryMode: 'free',
        freeTextContent: 'Csodás kilátás, bár kicsit esett az eső.',
        responses: {},
        isPrivate: false
    },
    {
        id: 'sample-4',
        timestamp: now - (day * 7),
        dateLabel: '2023 W42', // Example
        title: 'Heti Összefoglaló',
        category: Category.WEEKLY,
        mood: '🙂',
        tags: ['review', 'tervezes'],
        entryMode: 'structured',
        responses: {
            'q_w_general_0': 'Fontos a pihenés is a munka mellett.',
            'q_w_business_1': 'Igen, minden tervet tartottam.'
        },
        isPrivate: false
    },
    {
        id: 'sample-5',
        timestamp: now - (day * 30),
        dateLabel: '2023-09',
        title: 'Szeptemberi Zárás',
        category: Category.MONTHLY,
        mood: '😐',
        tags: ['havi', 'penzugyek'],
        entryMode: 'free',
        freeTextContent: 'Ez a hónap kicsit nehezebb volt anyagilag, de sokat tanultam belőle.',
        responses: {},
        isPrivate: true
    },
    {
        id: 'sample-6',
        timestamp: now - (day * 20),
        dateLabel: new Date(now - (day * 20)).toISOString().split('T')[0],
        title: 'Balatoni Hétvége',
        category: Category.DAILY,
        mood: '🤩',
        weather: { temp: 28, condition: 'Clear', location: 'Tihany', icon: '01d' },
        location: 'Tihany',
        gps: { lat: 46.91, lon: 17.89 },
        tags: ['utazas', 'balaton', 'nyar'],
        photo: 'https://images.unsplash.com/photo-1565118531796-7a30127b4171?auto=format&fit=crop&w=600&q=80',
        photos: ['https://images.unsplash.com/photo-1565118531796-7a30127b4171?auto=format&fit=crop&w=600&q=80'],
        entryMode: 'free',
        freeTextContent: 'Levendulás fagyit ettünk és sétáltunk az apátságnál.',
        responses: {},
        isPrivate: false
    }
];

export const INITIAL_DATA: AppData = {
  questions: DEFAULT_QUESTIONS,
  entries: SAMPLE_ENTRIES,
  settings: {
    categoryConfigs: {
        [Category.DAILY]: { viewMode: 'grid' },
        [Category.WEEKLY]: { viewMode: 'grid', includeDaily: false },
        [Category.MONTHLY]: { viewMode: 'grid', includeDaily: false, includeWeekly: false },
        [Category.YEARLY]: { viewMode: 'grid', includeDaily: false, includeWeekly: false, includeMonthly: false },
    }
  }
};

export const CATEGORY_LABELS: Record<Category, string> = {
  [Category.DAILY]: 'Napi',
  [Category.WEEKLY]: 'Heti',
  [Category.MONTHLY]: 'Havi',
  [Category.YEARLY]: 'Éves',
};

export const CATEGORY_COLORS: Record<Category, string> = {
    [Category.DAILY]: 'bg-emerald-500',
    [Category.WEEKLY]: 'bg-blue-500',
    [Category.MONTHLY]: 'bg-purple-500',
    [Category.YEARLY]: 'bg-amber-500',
};

export const CATEGORY_BORDER_COLORS: Record<Category, string> = {
    [Category.DAILY]: 'border-l-emerald-500',
    [Category.WEEKLY]: 'border-l-blue-500',
    [Category.MONTHLY]: 'border-l-purple-500',
    [Category.YEARLY]: 'border-l-amber-500',
};

export const CATEGORY_TEXT_COLORS: Record<Category, string> = {
    [Category.DAILY]: 'text-emerald-500',
    [Category.WEEKLY]: 'text-blue-500',
    [Category.MONTHLY]: 'text-purple-500',
    [Category.YEARLY]: 'text-amber-500',
};

export const CATEGORY_HOVER_BORDERS: Record<Category, string> = {
    [Category.DAILY]: 'hover:border-emerald-500',
    [Category.WEEKLY]: 'hover:border-blue-500',
    [Category.MONTHLY]: 'hover:border-purple-500',
    [Category.YEARLY]: 'hover:border-amber-500',
};

export const DEFAULT_MOODS = ['🔥', '🚀', '🙂', '😐', '😫'];

export const DEMO_PASSWORD = "grind";
