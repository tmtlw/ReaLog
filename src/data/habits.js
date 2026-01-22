
import { Category, Habit } from '../types';

export const DEFAULT_HABITS = [
    // --- DAILY & Body ---
    { id: 'h_water', title: 'Vízivás (pohár)', type: 'value', target: 8, unit: 'pohár', category.DAILY, isActive: true, icon: 'Droplets' },
    { id: 'h_sleep', title: 'Alvás (óra)', type: 'value', target: 8, unit: 'óra', category.DAILY, isActive: true, icon: 'Moon' },
    { id: 'h_workout', title: 'Edzés', type: 'boolean', category.DAILY, isActive: true, icon: 'Dumbbell' },
    { id: 'h_walk', title: 'Séta (10k lépés)', type: 'boolean', category.DAILY, isActive: true, icon: 'Footprints' },
    { id: 'h_stretch', title: 'Nyújtás', type: 'boolean', category.DAILY, isActive: false, icon: 'PersonStanding' },
    { id: 'h_vitamins', title: 'Vitaminok', type: 'boolean', category.DAILY, isActive: true, icon: 'Pill' },
    { id: 'h_nosugar', title: 'Cukormentes nap', type: 'boolean', category.DAILY, isActive: false, icon: 'Cookie' },
    { id: 'h_veggies', title: 'Zöldség/Gyümölcs', type: 'boolean', category.DAILY, isActive: true, icon: 'Carrot' },
    { id: 'h_floss', title: 'Fogselyem', type: 'boolean', category.DAILY, isActive: false, icon: 'Smile' },
    { id: 'h_meditate', title: 'Meditáció', type: 'boolean', category.DAILY, isActive: true, icon: 'Brain' },
    { id: 'h_coldshower', title: 'Hideg zuhany', type: 'boolean', category.DAILY, isActive: false, icon: 'Snowflake' },

    // --- DAILY & Productivity ---
    { id: 'h_read', title: 'Olvasás (oldal)', type: 'value', target: 20, unit: 'oldal', category.DAILY, isActive: true, icon: 'Book' },
    { id: 'h_learn', title: 'Tanulás', type: 'boolean', category.DAILY, isActive: true, icon: 'GraduationCap' },
    { id: 'h_journal', title: 'Naplózás', type: 'boolean', category.DAILY, isActive: true, icon: 'PenTool' },
    { id: 'h_planning', title: 'Napi tervezés', type: 'boolean', category.DAILY, isActive: true, icon: 'List' },
    { id: 'h_inboxzero', title: 'Inbox Zero', type: 'boolean', category.DAILY, isActive: false, icon: 'Mail' },
    { id: 'h_deepwork', title: 'Deep Work (óra)', type: 'value', target: 4, unit: 'óra', category.DAILY, isActive: false, icon: 'Focus' },
    { id: 'h_nosocial', title: 'No Social Media', type: 'boolean', category.DAILY, isActive: false, icon: 'Smartphone' },
    { id: 'h_podcast', title: 'Podcast hallgatás', type: 'boolean', category.DAILY, isActive: false, icon: 'Headphones' },

    // --- DAILY & Household ---
    { id: 'h_bed', title: 'Beágyazás', type: 'boolean', category.DAILY, isActive: true, icon: 'Bed' },
    { id: 'h_clean', title: 'Rendrakás (15p)', type: 'boolean', category.DAILY, isActive: false, icon: 'Sparkles' },
    { id: 'h_cook', title: 'Főzés', type: 'boolean', category.DAILY, isActive: false, icon: 'ChefHat' },
    { id: 'h_skin', title: 'Bőrápolás', type: 'boolean', category.DAILY, isActive: false, icon: 'Sparkles' },
    { id: 'h_save', title: 'Nem költöttem', type: 'boolean', category.DAILY, isActive: false, icon: 'PiggyBank' },

    // --- WEEKLY ---
    { id: 'h_w_plan', title: 'Heti tervezés', type: 'boolean', category.WEEKLY, isActive: true, icon: 'Calendar' },
    { id: 'h_w_review', title: 'Heti értékelés', type: 'boolean', category.WEEKLY, isActive: true, icon: 'CheckCircle2' },
    { id: 'h_w_groceries', title: 'Nagybevásárlás', type: 'boolean', category.WEEKLY, isActive: true, icon: 'ShoppingCart' },
    { id: 'h_w_clean', title: 'Takarítás', type: 'boolean', category.WEEKLY, isActive: true, icon: 'Home' },
    { id: 'h_w_laundry', title: 'Mosás', type: 'boolean', category.WEEKLY, isActive: true, icon: 'Shirt' },
    { id: 'h_w_budget', title: 'Pénzügyek átnézése', type: 'boolean', category.WEEKLY, isActive: true, icon: 'DollarSign' },
    { id: 'h_w_family', title: 'Családi hívás', type: 'boolean', category.WEEKLY, isActive: true, icon: 'Phone' },
    { id: 'h_w_date', title: 'Randiest / Én-idő', type: 'boolean', category.WEEKLY, isActive: false, icon: 'Heart' },
    { id: 'h_w_backup', title: 'Adatmentés', type: 'boolean', category.WEEKLY, isActive: false, icon: 'HardDrive' },
    { id: 'h_w_plants', title: 'Növények locsolása', type: 'boolean', category.WEEKLY, isActive: false, icon: 'Sprout' },

    // --- MONTHLY ---
    { id: 'h_m_plan', title: 'Havi tervezés', type: 'boolean', category.MONTHLY, isActive: true, icon: 'Map' },
    { id: 'h_m_review', title: 'Havi értékelés', type: 'boolean', category.MONTHLY, isActive: true, icon: 'PieChart' },
    { id: 'h_m_bills', title: 'Számlák befizetése', type: 'boolean', category.MONTHLY, isActive: true, icon: 'Receipt' },
    { id: 'h_m_savings', title: 'Megtakarítás utalása', type: 'boolean', category.MONTHLY, isActive: true, icon: 'Banknote' },
    { id: 'h_m_doctor', title: 'Önvizsgálat / Orvos', type: 'boolean', category.MONTHLY, isActive: false, icon: 'Stethoscope' },
    { id: 'h_m_declutter', title: 'Lomtalanítás', type: 'boolean', category.MONTHLY, isActive: false, icon: 'Trash' },
    { id: 'h_m_backup', title: 'Teljes biztonsági mentés', type: 'boolean', category.MONTHLY, isActive: true, icon: 'Database' },
    { id: 'h_m_book', title: 'Könyv kiolvasása', type: 'boolean', category.MONTHLY, isActive: false, icon: 'BookOpen' },
    { id: 'h_m_social', title: 'Baráti találkozó', type: 'boolean', category.MONTHLY, isActive: false, icon: 'Users' },
    { id: 'h_m_car', title: 'Autó takarítás', type: 'boolean', category.MONTHLY, isActive: false, icon: 'Car' },

    // --- YEARLY ---
    { id: 'h_y_goals', title: 'Éves célok kitűzése', type: 'boolean', category.YEARLY, isActive: true, icon: 'Target' },
    { id: 'h_y_review', title: 'Év értékelése', type: 'boolean', category.YEARLY, isActive: true, icon: 'Award' },
    { id: 'h_y_checkup', title: 'Éves szűrővizsgálat', type: 'boolean', category.YEARLY, isActive: true, icon: 'Activity' },
    { id: 'h_y_dentist', title: 'Fogorvos', type: 'boolean', category.YEARLY, isActive: true, icon: 'Smile' },
    { id: 'h_y_vacation', title: 'Nyaralás', type: 'boolean', category.YEARLY, isActive: true, icon: 'Plane' },
    { id: 'h_y_charity', title: 'Adományozás', type: 'boolean', category.YEARLY, isActive: false, icon: 'Gift' },
    { id: 'h_y_learn', title: 'Új skill tanulása', type: 'boolean', category.YEARLY, isActive: false, icon: 'Brain' }
];
