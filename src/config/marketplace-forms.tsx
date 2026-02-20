import { FormField } from '@/presentation/components/marketplace/dynamic-form-builder';

// ═══════════════════════════════════════════════════════════════
//  Types
// ═══════════════════════════════════════════════════════════════

interface SubType {
    fields: FormField[];
    hint?: string;
    placeholder?: string;
}

interface CategoryConfig {
    id: string;
    label: string;
    icon: string;
    sortOrder: number;
    typeSelector: {
        name: string;
        label: string;
        options: string[];
    };
    subTypes: Record<string, SubType>;
}

// ═══════════════════════════════════════════════════════════════
//  Field Builder — يلغي التكرار تماماً
// ═══════════════════════════════════════════════════════════════

const f = {
    text: (name: string, label: string, placeholder?: string, required?: boolean): FormField =>
        ({ name, label, type: 'text', placeholder, required }),
    number: (name: string, label: string, required?: boolean): FormField =>
        ({ name, label, type: 'number', required }),
    select: (name: string, label: string, options: (string | { label: string; value: string })[], required?: boolean): FormField =>
        ({ name, label, type: 'select', options, required }),
    checkbox: (name: string, label: string): FormField =>
        ({ name, label, type: 'checkbox' }),
    textarea: (name: string, label: string, placeholder?: string): FormField =>
        ({ name, label, type: 'textarea', placeholder }),
};

// ═══════════════════════════════════════════════════════════════
//  Shared Field Atoms — حقول مشتركة جاهزة
// ═══════════════════════════════════════════════════════════════

const COND_VEHICLE = f.select('condition', 'الحالة', [
    { label: 'زيرو', value: 'new' },
    { label: 'كسر زيرو', value: 'like_new' },
    { label: 'مستعمل ممتاز', value: 'good' },
    { label: 'مستعمل جيد', value: 'fair' },
    { label: 'محتاج مصاريف', value: 'for_parts' }
], true);

const COND_ELEC = f.select('condition', 'الحالة', [
    { label: 'جديد بالكرتونة', value: 'new' },
    { label: 'كسر زيرو', value: 'like_new' },
    { label: 'مستعمل كالجديد', value: 'good' },
    { label: 'مستعمل خدوش', value: 'fair' },
    { label: 'مش شغال / قطع غيار', value: 'for_parts' }
], true);

const COND_FURNITURE = f.select('condition', 'الحالة', [
    { label: 'جديد', value: 'new' },
    { label: 'مستعمل كالجديد', value: 'like_new' },
    { label: 'مستعمل جيد', value: 'good' },
    { label: 'محتاج تنجيد/دهان', value: 'fair' }
], true);

const COND_GENERAL = f.select('condition', 'الحالة', [
    { label: 'جديد', value: 'new' },
    { label: 'مستعمل', value: 'good' }
], true);

const YEAR = f.number('year', 'سنة الصنع');
const MODEL = f.text('model', 'الموديل');
const MODEL_R = f.text('model', 'الموديل', undefined, true);

// ═══════════════════════════════════════════════════════════════
//  Categories
// ═══════════════════════════════════════════════════════════════

export const MARKETPLACE_FORMS: Record<string, CategoryConfig> = {

    // ─── 1. سيارات ومركبات ───────────────────────────────────
    vehicles: {
        id: 'vehicles', label: 'سيارات ومركبات', icon: 'Car', sortOrder: 1,
        typeSelector: {
            name: 'vehicle_type', label: 'نوع المركبة', options: [
                'سيارات للبيع', 'سيارات للإيجار', 'موتوسيكلات', 'سكوتر',
                'توكتوك/تروسيكل', 'نقل / ميكروباص', 'قطع غيار سيارات',
                'إكسسوارات سيارات', 'جنوط وكاوتش', 'قوارب / جيت سكي', 'معدات ثقيلة'
            ]
        },
        subTypes: {
            'سيارات للبيع': {
                fields: [
                    f.select('brand', 'الماركة', ['هيونداي', 'تويوتا', 'نيسان', 'كيا', 'شيفروليه', 'فيات', 'سوزوكي', 'سكودا', 'بيجو', 'رينو', 'MG', 'شانجان', 'BYD', 'أخرى'], true), MODEL_R, YEAR,
                    f.select('transmission', 'ناقل الحركة', ['أوتوماتيك', 'مانيوال']),
                    f.select('fuel_type', 'نوع الوقود', ['بنزين', 'غاز طبيعي', 'ديزل', 'كهرباء', 'هايبرد']),
                    f.select('kilometers', 'الكيلومترات', ['0 - 10,000', '10,000 - 50,000', '50,000 - 100,000', '100,000 - 200,000', '200,000+']),
                    f.select('license_status', 'حالة الرخصة', ['سارية', 'منتهية', 'بدون لوحات']),
                    COND_VEHICLE
                ]
            },
            'سيارات للإيجار': {
                fields: [
                    f.select('brand', 'الماركة', ['هيونداي', 'تويوتا', 'نيسان', 'كيا', 'شيفروليه', 'فيات', 'سوزوكي', 'MG', 'أخرى'], true), MODEL, YEAR,
                    f.select('rental_period', 'نظام الإيجار', ['يومي', 'أسبوعي', 'شهري', 'سنوي']),
                    f.checkbox('driver_included', 'بالسائق؟')
                ]
            },
            'موتوسيكلات': {
                fields: [
                    f.select('brand', 'الماركة', ['هوجن', 'بوكسر', 'دايون', 'بينيلي', 'SYM', 'TVS', 'ياماها', 'BMW', 'أخرى']), YEAR,
                    f.text('engine_capacity', 'سعة المحرك (CC)'), COND_VEHICLE
                ]
            },
            'سكوتر': { fields: [f.select('brand', 'الماركة', ['SYM', 'بياجيو', 'ياماها', 'هوندا', 'بينيلي', 'أخرى']), YEAR, COND_VEHICLE] },
            'توكتوك/تروسيكل': {
                fields: [
                    f.select('brand', 'الماركة', ['باجاج', 'بياجيو (أبي)', 'TVS King', 'دايون', 'CMG', 'بينيلي', 'SYM', 'لوندا', 'نيو بوي', 'فورس', 'أخرى']), YEAR,
                    f.select('licensed', 'مرخص؟', ['مرخص', 'مش مرخص']), COND_VEHICLE
                ]
            },
            'نقل / ميكروباص': {
                fields: [
                    f.select('type', 'النوع', ['ربع نقل', 'نقل ثقيل', 'ميكروباص', 'ميني باص', 'أتوبيس']),
                    f.select('brand', 'الماركة', ['شيفروليه', 'هيونداي', 'تويوتا', 'ميتسوبيشي', 'مرسيدس', 'أخرى']), YEAR, COND_VEHICLE
                ]
            },
            'قطع غيار سيارات': {
                fields: [
                    f.text('part_name', 'اسم القطعة', undefined, true),
                    f.text('compatible_with', 'مناسبة لموديل', 'لانسر بومة، نيسان صني...'),
                    COND_GENERAL
                ]
            },
            'إكسسوارات سيارات': { fields: [f.text('accessory_type', 'نوع الإكسسوار'), COND_GENERAL] },
            'جنوط وكاوتش': {
                fields: [
                    f.select('type', 'النوع', ['جنوط', 'كاوتش', 'جنوط بالكاوتش']),
                    f.text('size', 'المقاس', '16، 17، R15...'), COND_GENERAL
                ]
            },
            'قوارب / جيت سكي': {
                fields: [
                    f.select('type', 'النوع', ['قارب صيد', 'يخت', 'جيت سكي', 'فلوكة']),
                    f.text('length', 'الطول'), COND_VEHICLE
                ]
            },
            'معدات ثقيلة': {
                fields: [
                    f.select('type', 'النوع', ['لودر', 'بلدوزر', 'حفار', 'ونش', 'كلارك']),
                    YEAR, COND_VEHICLE
                ]
            }
        }
    },

    // ─── 2. عقارات ────────────────────────────────────────────
    real_estate: {
        id: 'real_estate', label: 'عقارات', icon: 'Home', sortOrder: 2,
        typeSelector: {
            name: 'property_type', label: 'نوع العقار', options: [
                'شقق للبيع', 'شقق للإيجار', 'غرف للإيجار', 'فلل', 'دوبلكس', 'بنتهاوس',
                'شاليهات', 'أراضي', 'عقارات تجارية', 'مخازن'
            ]
        },
        subTypes: {
            'شقق للبيع': {
                fields: [
                    f.number('area', 'المساحة (م²)', true),
                    f.select('rooms', 'الغرف', ['1', '2', '3', '4', '5+']),
                    f.select('floor', 'الدور', ['أرضي', '1', '2', '3', '4', '5', 'أخير']),
                    f.select('finishing', 'التشطيب', ['طوب أحمر', 'محارة', 'نصف تشطيب', 'تشطيب كامل', 'سوبر لوكس']),
                    f.select('payment', 'طريقة الدفع', ['كاش', 'تقسيط'])
                ]
            },
            'شقق للإيجار': {
                fields: [
                    f.number('area', 'المساحة (م²)'),
                    f.select('rooms', 'الغرف', ['1', '2', '3', '4+']),
                    f.select('floor', 'الدور', ['أرضي', 'متكرر', 'أخير']),
                    f.checkbox('furnished', 'مفروشة؟'),
                    f.select('rental_period', 'مدة الإيجار', ['شهري', 'سنوي', 'مفتوح'])
                ]
            },
            'غرف للإيجار': {
                fields: [
                    f.select('room_type', 'النوع', ['غرفة خاصة', 'سرير مشاركة']),
                    f.select('gender', 'مطلوب', ['شباب فقط', 'بنات فقط', 'أي حد']),
                    f.checkbox('furnished', 'مفروشة؟')
                ]
            },
            'فلل': {
                fields: [
                    f.number('land_area', 'مساحة الأرض'), f.number('built_area', 'مساحة المباني'),
                    f.number('rooms', 'عدد الغرف'),
                    f.select('finishing', 'التشطيب', ['طوب أحمر', 'نصف تشطيب', 'تشطيب كامل']),
                    f.checkbox('has_pool', 'حمام سباحة / حديقة؟')
                ]
            },
            'دوبلكس': {
                fields: [
                    f.number('area', 'المساحة'), f.select('rooms', 'الغرف', ['3', '4', '5+']),
                    f.select('finishing', 'التشطيب', ['نصف تشطيب', 'تشطيب كامل']),
                    f.select('levels', 'عدد المستويات', ['2', '3'])
                ]
            },
            'بنتهاوس': {
                fields: [
                    f.number('area', 'المساحة'), f.number('rooms', 'الغرف'),
                    f.checkbox('has_terrace', 'يوجد تراس؟')
                ]
            },
            'شاليهات': {
                fields: [
                    f.text('village_name', 'اسم القرية / المنتجع', undefined, true),
                    f.number('area', 'المساحة'), f.number('rooms', 'الغرف'),
                    f.select('view', 'الإطلالة', ['عالبحر', 'حمام سباحة', 'حديقة', 'خلفي'])
                ]
            },
            'أراضي': {
                fields: [
                    f.number('area', 'المساحة', true),
                    f.select('land_type', 'النوع', ['أرض مباني', 'أرض زراعية', 'أرض صناعية']),
                    f.select('utilities', 'المرافق', ['واصل خدمات', 'بدون خدمات'])
                ]
            },
            'عقارات تجارية': {
                fields: [
                    f.select('type', 'النوع', ['محل تجاري', 'مكتب إداري', 'عيادة', 'مطعم', 'كافيه']),
                    f.number('area', 'المساحة'),
                    f.select('finishing', 'التشطيب', ['طوب أحمر', 'تشطيب كامل'])
                ]
            },
            'مخازن': {
                fields: [
                    f.number('area', 'المساحة'), f.number('ceiling_height', 'ارتفاع السقف (متر)')
                ]
            }
        }
    },

    // ─── 3. موبايلات وتابلت ──────────────────────────────────
    mobiles: {
        id: 'mobiles', label: 'موبايلات وتابلت', icon: 'Smartphone', sortOrder: 3,
        typeSelector: {
            name: 'mobile_type', label: 'نوع الجهاز', options: [
                'موبايلات', 'تابلت', 'ساعات ذكية', 'سماعات', 'باور بانك',
                'شواحن وكابلات', 'إكسسوارات موبايل'
            ]
        },
        subTypes: {
            'موبايلات': {
                fields: [
                    f.select('brand', 'الماركة', ['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'Realme', 'Infinix', 'Vivo', 'Honor', 'Huawei', 'أخرى'], true),
                    f.select('storage', 'مساحة التخزين', ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'], true),
                    f.select('ram', 'الرامات', ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB']),
                    f.number('battery_health', 'صحة البطارية % (أيفون)'),
                    f.checkbox('with_box', 'بالعلبة والشاحن؟'),
                    COND_ELEC
                ]
            },
            'تابلت': {
                fields: [
                    f.select('brand', 'الماركة', ['Apple iPad', 'Samsung', 'Lenovo', 'Huawei', 'أخرى']),
                    f.select('storage', 'مساحة التخزين', ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB']),
                    f.select('ram', 'الرامات', ['2GB', '3GB', '4GB', '6GB', '8GB']),
                    f.checkbox('sim_support', 'يدعم شريحة؟'), COND_ELEC
                ]
            },
            'ساعات ذكية': { fields: [f.select('brand', 'الماركة', ['Apple Watch', 'Samsung Galaxy Watch', 'Huawei', 'Xiaomi', 'أخرى']), COND_ELEC] },
            'سماعات': {
                fields: [
                    f.select('brand', 'الماركة', ['Apple AirPods', 'Samsung', 'Sony', 'JBL', 'Anker', 'أخرى']), COND_ELEC
                ]
            },
            'باور بانك': {
                fields: [
                    f.select('capacity', 'السعة', ['5000mAh', '10000mAh', '20000mAh', '30000mAh+']), f.select('brand', 'الماركة', ['Anker', 'Baseus', 'Samsung', 'Xiaomi', 'أخرى']),
                    COND_GENERAL
                ]
            },
            'شواحن وكابلات': {
                fields: [
                    f.select('connector', 'النوع', ['شاحن Type-C', 'شاحن Lightning (أيفون)', 'شاحن Micro USB', 'كابل Type-C', 'كابل Lightning', 'كابل Micro USB', 'شاحن سيارة', 'شاحن وايرلس', 'أخرى']), COND_GENERAL
                ]
            },
            'إكسسوارات موبايل': {
                fields: [
                    f.select('type', 'النوع', ['جراب', 'سكرينة', 'حامل موبايل', 'أخرى']), COND_GENERAL
                ]
            }
        }
    },

    // ─── 4. كمبيوتر ولابتوب ──────────────────────────────────
    computers: {
        id: 'computers', label: 'كمبيوتر ولابتوب', icon: 'Laptop', sortOrder: 4,
        typeSelector: {
            name: 'computer_type', label: 'نوع الجهاز', options: [
                'لابتوب', 'كمبيوتر مكتبي', 'شاشات كمبيوتر',
                'طابعات', 'هاردات وSSD', 'رامات', 'كروت شاشة', 'ماوس وكيبورد'
            ]
        },
        subTypes: {
            'لابتوب': {
                fields: [
                    f.select('brand', 'الماركة', ['Dell', 'HP', 'Lenovo', 'Apple', 'Asus', 'Acer', 'MSI', 'أخرى'], true),
                    f.select('ram', 'الرامات', ['4GB', '8GB', '16GB', '32GB']),
                    f.select('storage', 'مساحة التخزين', ['128GB', '256GB', '512GB', '1TB', '2TB+']),
                    COND_ELEC
                ]
            },
            'كمبيوتر مكتبي': {
                fields: [
                    f.select('brand', 'الماركة', ['Dell', 'HP', 'Lenovo', 'Apple', 'تجميع', 'أخرى']),
                    f.select('ram', 'الرامات', ['4GB', '8GB', '16GB', '32GB', '64GB']),
                    f.select('storage', 'مساحة التخزين', ['128GB', '256GB', '512GB', '1TB', '2TB+']),
                    COND_ELEC
                ]
            },
            'شاشات كمبيوتر': {
                fields: [
                    f.select('brand', 'الماركة', ['Samsung', 'LG', 'Dell', 'HP', 'BenQ', 'AOC', 'أخرى']),
                    f.select('size', 'الحجم (بوصة)', ['19"', '22"', '24"', '27"', '32"', '34"+', 'أخرى']), COND_ELEC
                ]
            },
            'طابعات': {
                fields: [
                    f.select('type', 'النوع', ['حبر (Ink)', 'ليزر (Laser)']),
                    f.select('color', 'الألوان', ['ألوان', 'أبيض وأسود']),
                    f.checkbox('has_scanner', 'فيها سكانر؟'), COND_ELEC
                ]
            },
            'هاردات وSSD': {
                fields: [
                    f.select('type', 'النوع', ['HDD', 'SSD SATA', 'M.2 NVMe', 'هارد خارجي']),
                    f.select('capacity', 'مساحة التخزين', ['128GB', '256GB', '512GB', '1TB', '2TB', '4TB+']), COND_GENERAL
                ]
            },
            'رامات': {
                fields: [
                    f.select('type', 'النوع', ['DDR3', 'DDR4', 'DDR5', 'Laptop RAM']),
                    f.select('capacity', 'الذاكرة', ['2GB', '4GB', '8GB', '16GB', '32GB']), COND_GENERAL
                ]
            },
            'كروت شاشة': {
                fields: [
                    f.select('chipset', 'النوع', ['Nvidia GTX', 'Nvidia RTX', 'AMD RX', 'Intel Arc', 'أخرى']),
                    f.select('vram', 'المساحة (VRAM)', ['2GB', '4GB', '6GB', '8GB', '12GB', '16GB', '24GB']), COND_GENERAL
                ]
            },
            'ماوس وكيبورد': {
                fields: [
                    f.select('type', 'النوع', ['عادي', 'وايرلس']), f.select('brand', 'الماركة', ['Logitech', 'Razer', 'Redragon', 'HyperX', 'HP', 'Dell', 'A4Tech', 'أخرى']), COND_GENERAL
                ]
            }
        }
    },

    // ─── 5. أجهزة منزلية ──────────────────────────────────────
    appliances: {
        id: 'appliances', label: 'أجهزة منزلية', icon: 'Tv', sortOrder: 5,
        typeSelector: {
            name: 'appliance_type', label: 'نوع الجهاز', options: [
                'تلفزيونات', 'ثلاجات', 'غسالات', 'بوتاجازات', 'ميكروويف',
                'تكييفات', 'سخانات', 'أجهزة صوت', 'كاميرات'
            ]
        },
        subTypes: {
            'تلفزيونات': {
                fields: [
                    f.select('brand', 'الماركة', ['Samsung', 'LG', 'Sony', 'Toshiba', 'TCL', 'Sharp', 'أخرى']),
                    f.select('size', 'المقاس (بوصة)', ['32"', '40"', '43"', '50"', '55"', '65"', '75"+']),
                    f.checkbox('is_smart', 'سمارت؟'),
                    f.select('resolution', 'الدقة', ['HD', 'Full HD', '4K']), COND_ELEC
                ]
            },
            'ثلاجات': {
                fields: [
                    f.select('brand', 'الماركة', ['Sharp', 'Toshiba', 'LG', 'Samsung', 'Kiriazi', 'Alaska', 'White Point', 'أخرى']),
                    f.select('capacity', 'السعة', ['12 قدم', '14 قدم', '16 قدم', '18 قدم', '20 قدم+']),
                    f.select('type', 'النوع', ['No Frost', 'Defrost']), COND_ELEC
                ]
            },
            'غسالات': {
                fields: [
                    f.select('brand', 'الماركة', ['LG', 'Samsung', 'Toshiba', 'Zanussi', 'White Point', 'Fresh', 'أخرى']),
                    f.select('capacity', 'السعة (كيلو)', ['5kg', '7kg', '8kg', '9kg', '10kg+']),
                    f.select('loading', 'التحميل', ['أمامي', 'علوي']), COND_ELEC
                ]
            },
            'بوتاجازات': {
                fields: [
                    f.select('brand', 'الماركة', ['Unionaire', 'Fresh', 'La Germania', 'Tecnogas', 'I-Cook', 'Universal', 'أخرى']),
                    f.select('burners', 'عدد الشعلات', ['4 شعلة', '5 شعلة']),
                    f.checkbox('builtin', 'بلت إن؟'), COND_ELEC
                ]
            },
            'ميكروويف': { fields: [f.select('brand', 'الماركة', ['Samsung', 'LG', 'Sharp', 'Black & Decker', 'أخرى']), f.text('capacity', 'السعة (لتر)'), COND_ELEC] },
            'تكييفات': {
                fields: [
                    f.select('brand', 'الماركة', ['Carrier', 'Sharp', 'LG', 'Samsung', 'Unionaire', 'Fresh', 'Gree', 'أخرى']),
                    f.select('power', 'القدرة (حصان)', ['1.5 حصان', '2.25 حصان', '3 حصان', '4 حصان+']),
                    f.select('type', 'النوع', ['سبليت', 'شباك', 'صحراوي']),
                    f.checkbox('inverter', 'انفرتر (موفر)؟'), COND_ELEC
                ]
            },
            'سخانات': {
                fields: [
                    f.select('type', 'النوع', ['غاز', 'كهرباء']),
                    f.select('capacity', 'السعة (لتر)', ['6 لتر', '10 لتر', '30 لتر', '50 لتر+']),
                    f.select('brand', 'الماركة', ['Olympic', 'Fresh', 'Tornado', 'White Point', 'Zanussi', 'أخرى']), COND_ELEC
                ]
            },
            'أجهزة صوت': {
                fields: [
                    f.select('brand', 'الماركة', ['JBL', 'Sony', 'Samsung', 'LG', 'Marshall', 'أخرى']),
                    f.select('type', 'النوع', ['ساوند بار', 'مسرح منزلي', 'سبيكر بلوتوث']), COND_ELEC
                ]
            },
            'كاميرات': {
                fields: [
                    f.select('brand', 'الماركة', ['Canon', 'Nikon', 'Sony', 'Fujifilm', 'GoPro', 'أخرى']),
                    f.select('type', 'النوع', ['DSLR', 'Mirrorless', 'كاميرا مدمجة', 'Action Cam']), COND_ELEC
                ]
            }
        }
    },

    // ─── 6. أثاث وديكور ──────────────────────────────────────
    furniture: {
        id: 'furniture', label: 'أثاث وديكور', icon: 'Armchair', sortOrder: 6,
        typeSelector: {
            name: 'furniture_type', label: 'النوع', options: [
                'أنتريهات', 'غرف نوم', 'سفرة', 'مطابخ', 'مكتبات',
                'مكاتب', 'سجاد', 'ستائر', 'نجف وإضاءة', 'ديكور منزلي'
            ]
        },
        subTypes: {
            'أنتريهات': {
                fields: [
                    f.select('type', 'النوع', ['طقم كامل', 'ركنة L-Shape', 'كنبة', 'كرسي']),
                    f.select('style', 'الستايل', ['مودرن', 'كلاسيك مدهب', 'ألترا مودرن']), COND_FURNITURE
                ]
            },
            'غرف نوم': {
                fields: [
                    f.select('bed_size', 'مقاس السرير', ['120cm', '150cm', '160cm', '180cm', '200cm']),
                    f.checkbox('with_mattress', 'بالمرتبة؟'), COND_FURNITURE
                ]
            },
            'سفرة': {
                fields: [
                    f.select('chairs', 'عدد الكراسي', ['4', '6', '8', '10+']),
                    f.select('material', 'خامة الطرابيزة', ['خشب', 'زجاج', 'رخام']), COND_FURNITURE
                ]
            },
            'مطابخ': {
                fields: [
                    f.number('length', 'الطول (متر)'),
                    f.select('material', 'الخامة', ['خشب', 'ألوميتال', 'خشمونيوم', 'بولي لاك']), COND_FURNITURE
                ]
            },
            'مكتبات': { fields: [f.text('dimensions', 'الأبعاد'), COND_FURNITURE] },
            'مكاتب': { fields: [f.text('size', 'المقاس'), COND_FURNITURE] },
            'سجاد': {
                fields: [
                    f.text('size', 'المقاس', '2x3 متر'),
                    f.select('material', 'الخامة', ['حرير', 'صوف', 'شاج', 'كيليم']), COND_FURNITURE
                ]
            },
            'ستائر': {
                fields: [
                    f.text('size', 'المقاس (العرض)'),
                    f.select('type', 'النوع', ['بلاك أوت', 'شيفون', 'قطيفة', 'عادية']), COND_FURNITURE
                ]
            },
            'نجف وإضاءة': {
                fields: [
                    f.select('type', 'النوع', ['نجفة', 'أباجورة', 'لمبادير', 'اسبوتات']), COND_GENERAL
                ]
            },
            'ديكور منزلي': {
                fields: [
                    f.select('item_type', 'نوع القطعة', ['تابلوه', 'فازة', 'ساعة حائط', 'مرايا', 'أخرى']), COND_GENERAL
                ]
            }
        }
    },

    // ─── 7. ملابس وموضة ──────────────────────────────────────
    fashion: {
        id: 'fashion', label: 'ملابس وموضة', icon: 'Shirt', sortOrder: 7,
        typeSelector: {
            name: 'fashion_type', label: 'النوع', options: [
                'ملابس رجالي', 'ملابس حريمي', 'ملابس أطفال', 'أحذية',
                'شنط', 'ساعات', 'نظارات', 'إكسسوارات'
            ]
        },
        subTypes: {
            'ملابس رجالي': {
                fields: [
                    f.select('type', 'القطعة', ['تيشرت', 'قميص', 'بنطلون', 'بدلة', 'جاكيت', 'شورت', 'أخرى']),
                    f.select('size', 'المقاس', ['S', 'M', 'L', 'XL', 'XXL', '3XL+']), f.select('brand', 'الماركة', ['Zara', 'H&M', 'LC Waikiki', 'Defacto', 'Nike', 'Adidas', 'أخرى']), COND_GENERAL
                ]
            },
            'ملابس حريمي': {
                fields: [
                    f.select('type', 'القطعة', ['فستان', 'عباية', 'بلوزة', 'بنطلون', 'تنورة', 'طرحة', 'أخرى']),
                    f.select('size', 'المقاس', ['S', 'M', 'L', 'XL', 'XXL', '3XL+']), f.select('brand', 'الماركة', ['Zara', 'H&M', 'LC Waikiki', 'Defacto', 'أخرى']), COND_GENERAL
                ]
            },
            'ملابس أطفال': {
                fields: [
                    f.select('gender', 'النوع', ['أولادي', 'بناتي', 'مواليد']),
                    f.select('age', 'السن', ['0-1 سنة', '1-3', '3-6', '6-10', '10+']), COND_GENERAL
                ]
            },
            'أحذية': {
                fields: [
                    f.select('type', 'النوع', ['كوتشي', 'كلاسيك', 'بوت', 'صندل', 'شبشب']),
                    f.number('size', 'المقاس (EU)'), f.select('brand', 'الماركة', ['Nike', 'Adidas', 'Puma', 'New Balance', 'Skechers', 'Converse', 'أخرى']), COND_GENERAL
                ]
            },
            'شنط': {
                fields: [
                    f.select('type', 'النوع', ['يد', 'ظهر', 'سفر', 'لابتوب']), f.select('brand', 'الماركة', ['Samsonite', 'American Tourister', 'Nike', 'أخرى']), COND_GENERAL
                ]
            },
            'ساعات': {
                fields: [
                    f.select('brand', 'الماركة', ['Casio', 'Rolex', 'Fossil', 'Swatch', 'Samsung', 'Apple', 'أخرى']), f.select('is_original', 'أصلي؟', ['أصلي', 'هاي كوبي', 'عادي']), COND_GENERAL
                ]
            },
            'نظارات': {
                fields: [
                    f.select('type', 'النوع', ['شمسية', 'طبية (إطار)']), f.select('brand', 'الماركة', ['Ray-Ban', 'Oakley', 'Cartier', 'Gucci', 'أخرى']), COND_GENERAL
                ]
            },
            'إكسسوارات': {
                fields: [
                    f.select('type', 'النوع', ['محفظة', 'حزام', 'مجوهرات', 'كاب/طاقية']), COND_GENERAL
                ]
            }
        }
    },

    // ─── 8. حيوانات أليفة ─────────────────────────────────────
    pets: {
        id: 'pets', label: 'حيوانات أليفة', icon: 'Dog', sortOrder: 8,
        typeSelector: {
            name: 'pet_type', label: 'النوع', options: [
                'كلاب', 'قطط', 'طيور', 'أسماك', 'أرانب', 'حيوانات مزرعة', 'مستلزمات حيوانات'
            ]
        },
        subTypes: {
            'كلاب': {
                fields: [
                    f.select('breed', 'السلالة', ['جيرمن', 'جولدن', 'هاسكي', 'بيتبول', 'روت فايلر', 'جريفون', 'بلدي', 'أخرى']),
                    f.select('gender', 'الجنس', ['ذكر', 'أنثى']),
                    f.text('age', 'العمر'), f.checkbox('vaccinated', 'مطعم؟'), f.checkbox('trained', 'مدرب؟')
                ]
            },
            'قطط': {
                fields: [
                    f.select('breed', 'السلالة', ['شيرازي', 'سيامي', 'رومي', 'اسكتلندي', 'بلدي', 'أخرى']),
                    f.text('age', 'العمر'), f.select('gender', 'الجنس', ['ذكر', 'أنثى']), f.checkbox('vaccinated', 'مطعم؟')
                ]
            },
            'طيور': {
                fields: [
                    f.select('type', 'النوع', ['عصافير زينة', 'ببغاء', 'حمام', 'دواجن']),
                    f.checkbox('with_cage', 'بالقفص؟')
                ]
            },
            'أسماك': { fields: [f.select('type', 'النوع', ['أسماك زينة', 'حوض كامل', 'مستلزمات حوض'])] },
            'أرانب': { fields: [f.text('type', 'النوع'), f.text('age', 'العمر')] },
            'حيوانات مزرعة': {
                fields: [
                    f.select('type', 'النوع', ['خروف', 'ماعز', 'عجل', 'جاموس', 'حصان', 'حمار']),
                    f.text('weight', 'الوزن تقريبي')
                ]
            },
            'مستلزمات حيوانات': {
                fields: [
                    f.select('type', 'النوع', ['أكل/دراي فود', 'قفص/بوكس', 'لعب', 'أدوية']), COND_GENERAL
                ]
            }
        }
    },

    // ─── 9. هوايات وترفيه ─────────────────────────────────────
    hobbies: {
        id: 'hobbies', label: 'هوايات وترفيه', icon: 'Gamepad2', sortOrder: 9,
        typeSelector: {
            name: 'hobby_type', label: 'النوع', options: [
                'ألعاب فيديو', 'كونسول', 'دراجات', 'رياضة ولياقة',
                'آلات موسيقية', 'كتب'
            ]
        },
        subTypes: {
            'ألعاب فيديو': {
                fields: [
                    f.select('platform', 'المنصة', ['PS4/PS5', 'Xbox', 'Nintendo', 'PC']),
                    f.text('game_name', 'اسم اللعبة', undefined, true), COND_GENERAL
                ]
            },
            'كونسول': {
                fields: [
                    f.select('type', 'الجهاز', ['PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One', 'Nintendo Switch']),
                    f.text('storage', 'المساحة'), f.number('controllers', 'عدد الدراعات'), COND_ELEC
                ]
            },
            'دراجات': {
                fields: [
                    f.select('type', 'النوع', ['جبلي', 'سباق', 'أطفال', 'BMX']),
                    f.text('size', 'المقاس'), COND_GENERAL
                ]
            },
            'رياضة ولياقة': {
                fields: [
                    f.select('equipment', 'الجهاز', ['مشاية', 'عجلة رياضية', 'أوزان', 'مالتي جيم']), COND_GENERAL
                ]
            },
            'آلات موسيقية': {
                fields: [
                    f.select('instrument', 'الآلة', ['جيتار', 'بيانو / أورج', 'عود', 'كمان', 'طبلة']),
                    f.select('brand', 'الماركة', ['Yamaha', 'Fender', 'Casio', 'Roland', 'أخرى']), COND_GENERAL
                ]
            },
            'كتب': {
                fields: [
                    f.select('genre', 'التصنيف', ['رواية', 'تعليمي', 'ديني', 'تنمية بشرية', 'تاريخ']),
                    f.select('language', 'اللغة', ['عربي', 'إنجليزي']), COND_GENERAL
                ]
            }
        }
    },

    // ─── 10. خدمات ────────────────────────────────────────────
    services: {
        id: 'services', label: 'خدمات', icon: 'Wrench', sortOrder: 10,
        typeSelector: {
            name: 'service_type', label: 'نوع الخدمة', options: [
                'صيانة منزلية', 'سباكة وكهرباء', 'نقل عفش', 'خدمات تنظيف',
                'تصميم جرافيك', 'برمجة', 'خدمات سيارات'
            ]
        },
        subTypes: {
            'صيانة منزلية': {
                fields: [
                    f.select('service', 'الخدمة', ['تصليح أجهزة', 'نجارة', 'ألوميتال', 'ستالايت (دش)'])
                ]
            },
            'سباكة وكهرباء': {
                fields: [
                    f.select('type', 'التخصص', ['سباك', 'كهربائي'])
                ]
            },
            'نقل عفش': {
                fields: [
                    f.select('vehicle', 'العربية', ['ربع نقل', 'صندوق مغلق', 'تريلا']),
                    f.checkbox('workers_included', 'شامل ونش وعمال؟')
                ]
            },
            'خدمات تنظيف': {
                fields: [
                    f.select('scope', 'النوع', ['تنظيف منازل', 'غسيل سيارات', 'غسيل سجاد', 'مكافحة حشرات'])
                ]
            },
            'تصميم جرافيك': {
                fields: [
                    f.select('service', 'الخدمة', ['لوجو وهويات', 'سوشيال ميديا', 'فيديو ومونتاج', 'طباعة'])
                ]
            },
            'برمجة': {
                fields: [
                    f.select('service', 'الخدمة', ['تصميم مواقع', 'تطبيقات موبايل', 'دعم فني'])
                ]
            },
            'خدمات سيارات': {
                fields: [
                    f.select('service', 'الخدمة', ['ميكانيكا', 'عفشة', 'سمكرة ودوكو', 'كهرباء سيارات', 'غسيل وتلميع'])
                ]
            }
        }
    },

    // ─── 11. وظائف ────────────────────────────────────────────
    jobs: {
        id: 'jobs', label: 'وظائف', icon: 'Briefcase', sortOrder: 11,
        typeSelector: {
            name: 'job_type', label: 'نوع الوظيفة', options: [
                'مطلوب موظفين', 'وظائف سائقين', 'وظائف مبيعات', 'وظائف مطاعم',
                'وظائف صناعية', 'وظائف IT', 'عمل من المنزل', 'سير ذاتية'
            ]
        },
        subTypes: {
            'مطلوب موظفين': {
                fields: [
                    f.text('role', 'المسمى الوظيفي', undefined, true),
                    f.text('salary_range', 'الراتب المتوقع'),
                    f.select('experience', 'الخبرة', ['بدون خبرة', '1-3 سنوات', '3-5 سنوات', '5+ سنوات']),
                    f.select('shift', 'الدوام', ['دوام كامل', 'دوام جزئي', 'شيفت مسائي'])
                ]
            },
            'وظائف سائقين': {
                fields: [
                    f.select('license_type', 'نوع الرخصة', ['خاصة', 'مهنية ثالثة', 'مهنية ثانية', 'مهنية أولى']),
                    f.checkbox('vehicle_provided', 'يوجد سيارة؟'), f.text('salary', 'الراتب')
                ]
            },
            'وظائف مبيعات': {
                fields: [
                    f.text('sector', 'المجال', 'عقارات، ملابس، أجهزة...'),
                    f.checkbox('commission', 'يوجد عمولة؟')
                ]
            },
            'وظائف مطاعم': {
                fields: [
                    f.select('role', 'الوظيفة', ['شيف', 'مساعد شيف', 'ويتر', 'كاشير', 'ديليفري']),
                    f.text('experience', 'الخبرة')
                ]
            },
            'وظائف صناعية': {
                fields: [
                    f.text('craft', 'الحرفة/المهنة'),
                    f.select('pay_type', 'نظام الدفع', ['يومية', 'إسبوعي', 'شهري'])
                ]
            },
            'وظائف IT': {
                fields: [
                    f.text('role', 'التخصص', 'Frontend, Backend, Design...'),
                    f.text('tech_stack', 'المهارات (Tech Stack)'),
                    f.checkbox('remote', 'عن بعد (Remote)؟')
                ]
            },
            'عمل من المنزل': { fields: [f.text('role', 'نوع العمل'), f.text('hours', 'عدد الساعات')] },
            'سير ذاتية': {
                fields: [
                    f.text('role_sought', 'أبحث عن وظيفة', undefined, true),
                    f.number('experience', 'الخبرة (سنوات)'),
                    f.textarea('skills', 'المهارات')
                ]
            }
        }
    },

    // ─── 12. تعليم ────────────────────────────────────────────
    education: {
        id: 'education', label: 'تعليم', icon: 'GraduationCap', sortOrder: 12,
        typeSelector: {
            name: 'education_type', label: 'نوع الإعلان', options: [
                'دروس خصوصية', 'كورسات لغات', 'كورسات برمجة',
                'تعليم موسيقى', 'تعليم قيادة', 'كتب دراسية'
            ]
        },
        subTypes: {
            'دروس خصوصية': {
                fields: [
                    f.text('subject', 'المادة', undefined, true),
                    f.select('stage', 'المرحلة', ['ابتدائي', 'إعدادي', 'ثانوي', 'جامعة']),
                    f.select('method', 'المكان', ['سنتر', 'منزل الطالب', 'منزل المدرس', 'أونلاين'])
                ]
            },
            'كورسات لغات': {
                fields: [
                    f.select('language', 'اللغة', ['إنجليزي', 'فرنسي', 'ألماني', 'إيطالي', 'أخرى']),
                    f.text('level', 'المستوى')
                ]
            },
            'كورسات برمجة': {
                fields: [
                    f.text('topic', 'مجال الكورس'), f.text('duration', 'المدة'),
                    f.checkbox('certification', 'شهادة معتمدة؟')
                ]
            },
            'تعليم موسيقى': {
                fields: [
                    f.text('instrument', 'الآلة'),
                    f.select('level', 'المستوى', ['مبتدئ', 'متوسط', 'متقدم'])
                ]
            },
            'تعليم قيادة': {
                fields: [
                    f.select('gear_type', 'نوع التعليم', ['مانيوال', 'أوتوماتيك', 'الاثنين'])
                ]
            },
            'كتب دراسية': {
                fields: [
                    f.text('subject', 'المادة'), f.text('grade', 'السنة الدراسية'), COND_GENERAL
                ]
            }
        }
    }
};

// ═══════════════════════════════════════════════════════════════
//  Helper — get the correct fields for a stored item
// ═══════════════════════════════════════════════════════════════

export function getFieldsForItem(category: string, attributes: Record<string, any>): FormField[] {
    const config = MARKETPLACE_FORMS[category];
    if (!config) return [];

    const subTypeKey = attributes?.[config.typeSelector?.name];
    if (subTypeKey && config.subTypes[subTypeKey]) {
        return config.subTypes[subTypeKey].fields;
    }

    // fallback: return first sub-type's fields
    const firstKey = Object.keys(config.subTypes)[0];
    return firstKey ? config.subTypes[firstKey].fields : [];
}