
import { Category, Entry } from '../types';

// Dynamic Sample Data Generation
const now = new Date();
const todayTs = now.getTime();
const yesterdayTs = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime();
const twoDaysAgoTs = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2).getTime();
const lastWeekTs = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).getTime();
const lastMonthTs = new Date(now.getFullYear(), now.getMonth() - 1, 15).getTime();
const lastYearTs = new Date(now.getFullYear() - 1, 11, 31).getTime();

export const SAMPLE_ENTRIES = [
    {
        id: 'sample_1',
        notebookId: 'default',
        timestamp: todayTs,
        dateLabel: new Date(todayTs).toISOString().slice(0, 10),
        title: 'Mai produktív nap',
        category.DAILY,
        mood: '🚀',
        responses: {
            'q_d_1': 'Sikerült befejezni a projektet határidőre.',
            'q_d_2': 'Tanultam új React hookokat és optimalizálási technikákat.'
        },
        habitValues: { 'h_water': 8, 'h_read': true, 'h_workout': true },
        location: 'Budapest, Hungary',
        gps: { lat: 47.4979, lon: 19.0402 },
        weather: { temp: 22, condition: 'Clear', location: 'Budapest', icon: '01d' },
        tags: ['munka', 'siker', 'react'],
        isPrivate: false,
        entryMode: 'structured'
    },
    {
        id: 'sample_2',
        notebookId: 'default',
        timestamp: yesterdayTs,
        dateLabel: new Date(yesterdayTs).toISOString().slice(0, 10),
        title: 'Nyugodt vasárnap',
        category.DAILY,
        mood: '🙂',
        responses: {},
        freeTextContent: 'Egész nap csak pihentem és olvastam. Nagyon kellett ez a <b>feltöltődés</b> a jövő hét előtt. Sétáltam egy nagyot a parkban is.',
        habitValues: { 'h_water': 6, 'h_read': true },
        location: 'Debrecen, Hungary',
        gps: { lat: 47.5316, lon: 21.6273 },
        weather: { temp: 18, condition: 'Clouds', location: 'Debrecen', icon: '03d' },
        tags: ['pihenés', 'olvasás'],
        isPrivate: false,
        entryMode: 'free'
    },
    {
        id: 'sample_3',
        notebookId: 'default',
        timestamp: twoDaysAgoTs,
        dateLabel: new Date(twoDaysAgoTs).toISOString().slice(0, 10),
        title: 'Kicsit nehezebb nap',
        category.DAILY,
        mood: '😐',
        responses: { 'q_d_3': 'Sok volt a meeting és kevés idő jutott a tényleges munkára.' },
        habitValues: { 'h_water': 4 },
        tags: ['stressz', 'meeting'],
        isPrivate: true, // Private entry test
        entryMode: 'structured'
    },
    {
        id: 'sample_w_1',
        notebookId: 'default',
        timestamp: lastWeekTs,
        dateLabel: '2023 W42', // Static example, keeping simple
        title: 'Heti Összefoglaló',
        category.WEEKLY,
        mood: '🔥',
        responses: { 'q_w_1': 'A konzisztencia a kulcs. Minden nap edzettem.' },
        habitValues: { 'h_w_plan': true },
        tags: ['fókusz', 'edzés'],
        isPrivate: false,
        entryMode: 'structured'
    },
    {
        id: 'sample_m_1',
        notebookId: 'default',
        timestamp: lastMonthTs,
        dateLabel: new Date(lastMonthTs).toISOString().slice(0, 7),
        title: 'Havi Pénzügyek',
        category.MONTHLY,
        mood: '💰',
        responses: { 'q_m_5': 'Sikerült félretenni a fizetésem 20%-át.' },
        tags: ['pénzügy', 'megtakarítás'],
        isPrivate: true,
        entryMode: 'structured'
    },
    {
        id: 'sample_y_1',
        notebookId: 'default',
        timestamp: lastYearTs,
        dateLabel: (new Date().getFullYear() - 1).toString(),
        title: 'Az elmúlt év tanulságai',
        category.YEARLY,
        mood: '🏆',
        responses: {},
        freeTextContent: 'Ez az év a <i>változások</i> éve volt. Sokat utaztam, új embereket ismertem meg és elindítottam a vállalkozásomat.',
        tags: ['évértékelő', 'utazás', 'karrier'],
        location: 'Vienna, Austria', // Map test foreign
        gps: { lat: 48.2082, lon: 16.3738 },
        photos: ['https://images.unsplash.com/photo-1516550893923-42d28e5677af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], // Photo test
        isPrivate: false,
        entryMode: 'free'
    }
];
