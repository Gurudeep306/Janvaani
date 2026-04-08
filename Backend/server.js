require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const crypto  = require("crypto");
const https   = require("https");
const path    = require("path");
const Groq            = require("groq-sdk");
const { HfInference } = require("@huggingface/inference");
let franc;
(async () => {
    try {
        franc = require("franc");
        if (typeof franc !== "function") throw new Error("not a function");
    } catch {
        franc = (text) => "und"; // fallback: unknown
        console.warn("⚠️  franc could not be loaded — L4 layer disabled. Run: npm install franc@5 --legacy-peer-deps");
    }
})();
const Database = require("better-sqlite3");
const app = express();
app.use(cors());
app.use((req, res, next) => {
    if (req.path === '/tickets' || req.path === '/stats' || req.path === '/health') {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.set('Pragma', 'no-cache');
    }
    next();
});
app.use(express.json({ limit: "50mb" }));
const REQUIRED_KEYS = {
    GROQ_API_KEY      : process.env.GROQ_API_KEY,
    HUGGINGFACE_TOKEN : process.env.HUGGINGFACE_TOKEN,
};
const missing = Object.entries(REQUIRED_KEYS).filter(([, v]) => !v).map(([k]) => k);
if (missing.length) {
    console.error(`\n❌ Missing env vars: ${missing.join(", ")}\n`);
    process.exit(1);
}
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const hf   = new HfInference(process.env.HUGGINGFACE_TOKEN);
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || null;
console.log("✅ L12 Kimi-K2-Instruct (Groq free tier) — replaces Claude slot");
console.log("✅ L13 Qwen3-32B        (Groq free tier) — replaces Gemini slot");
if (MISTRAL_API_KEY) console.log("✅ Mistral API loaded");
else                 console.log("⚠️  MISTRAL_API_KEY not set — Mistral layer disabled");
const DB_PATH = path.join(__dirname, "janvaani.db");
const db      = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
        id                    INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id             TEXT    UNIQUE NOT NULL,
        created_at            TEXT    NOT NULL DEFAULT (datetime('now')),
        created_at_ist        TEXT    NOT NULL,
        citizen_name          TEXT,
        citizen_phone         TEXT,
        raw_text              TEXT    NOT NULL,
        token_count           INTEGER,
        latitude              REAL,
        longitude             REAL,
        full_address          TEXT,
        city                  TEXT,
        district              TEXT,
        state                 TEXT,
        pincode               TEXT,
        detected_language     TEXT    NOT NULL,
        language_confidence   INTEGER,
        detection_method      TEXT,
        active_layers         INTEGER,
        language_scores       TEXT,
        word_analysis         TEXT,
        department            TEXT    NOT NULL,
        official_dept_name    TEXT,
        severity              TEXT    NOT NULL,
        severity_reason       TEXT,
        nodal_officer         TEXT,
        portal_to_log         TEXT,
        reference_act         TEXT,
        inter_dept            TEXT,
        formal_grievance      TEXT,
        operator_script       TEXT,
        sla_deadline          TEXT,
        sla_status            TEXT    DEFAULT 'OPEN',
        last_updated_at       TEXT,
        last_updated_by       TEXT,
        processing_seconds    REAL,
        escalation_chain      TEXT
    );
    CREATE TABLE IF NOT EXISTS ticket_updates (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id   TEXT    NOT NULL REFERENCES tickets(ticket_id),
        updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),
        status      TEXT    NOT NULL,
        note        TEXT,
        updated_by  TEXT DEFAULT 'operator',
        is_public   INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS language_votes (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id    TEXT NOT NULL REFERENCES tickets(ticket_id),
        layer        TEXT NOT NULL,
        voted_lang   TEXT NOT NULL,
        confidence   INTEGER,
        weight       INTEGER
    );
    CREATE TABLE IF NOT EXISTS word_detections (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id   TEXT NOT NULL REFERENCES tickets(ticket_id),
        word        TEXT NOT NULL,
        matched_lang TEXT NOT NULL,
        match_type  TEXT NOT NULL,
        score       REAL
    );
    CREATE INDEX IF NOT EXISTS idx_tickets_created   ON tickets(created_at);
    CREATE INDEX IF NOT EXISTS idx_tickets_dept      ON tickets(department);
    CREATE INDEX IF NOT EXISTS idx_tickets_severity  ON tickets(severity);
    CREATE INDEX IF NOT EXISTS idx_tickets_state     ON tickets(state);
    CREATE INDEX IF NOT EXISTS idx_tickets_language  ON tickets(detected_language);
    CREATE INDEX IF NOT EXISTS idx_tickets_status    ON tickets(sla_status);
    CREATE INDEX IF NOT EXISTS idx_updates_ticket    ON ticket_updates(ticket_id);
    CREATE INDEX IF NOT EXISTS idx_word_ticket       ON word_detections(ticket_id);
`);
console.log(`✅ Database ready: ${DB_PATH}`);
const insertTicket = db.prepare(`
    INSERT INTO tickets (
        ticket_id, created_at_ist,
        citizen_name, citizen_phone, raw_text, token_count,
        latitude, longitude, full_address, city, district, state, pincode,
        detected_language, language_confidence, detection_method, active_layers,
        language_scores, word_analysis,
        department, official_dept_name, severity, severity_reason, nodal_officer,
        portal_to_log, reference_act, inter_dept,
        formal_grievance, operator_script,
        sla_deadline, processing_seconds, escalation_chain
    ) VALUES (
        @ticket_id, @created_at_ist,
        @citizen_name, @citizen_phone, @raw_text, @token_count,
        @latitude, @longitude, @full_address, @city, @district, @state, @pincode,
        @detected_language, @language_confidence, @detection_method, @active_layers,
        @language_scores, @word_analysis,
        @department, @official_dept_name, @severity, @severity_reason, @nodal_officer,
        @portal_to_log, @reference_act, @inter_dept,
        @formal_grievance, @operator_script,
        @sla_deadline, @processing_seconds, @escalation_chain
    )
`);
const insertUpdate = db.prepare(`
    INSERT INTO ticket_updates (ticket_id, status, note, updated_by, is_public)
    VALUES (@ticket_id, @status, @note, @updated_by, @is_public)
`);
const insertVote = db.prepare(`
    INSERT INTO language_votes (ticket_id, layer, voted_lang, confidence, weight)
    VALUES (@ticket_id, @layer, @voted_lang, @confidence, @weight)
`);
const insertWord = db.prepare(`
    INSERT INTO word_detections (ticket_id, word, matched_lang, match_type, score)
    VALUES (@ticket_id, @word, @matched_lang, @match_type, @score)
`);
function safeJSON(raw = "") {
    try { return JSON.parse(raw.replace(/```json|```/gi, "").trim()); }
    catch { return {}; }
}
function getIST() {
    return new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
}
function getSLADeadline(dept, severity) {
    const reg   = DEPARTMENT_REGISTRY[dept];
    const hours = reg?.slaHours?.[severity] || 72;
    const dead  = new Date(Date.now() + hours * 3600000);
    return `${dead.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} (within ${hours}h)`;
}
function withTimeout(promise, ms = 8000, label = "") {
    return Promise.race([
        promise,
        new Promise((_, rej) =>
            setTimeout(() => rej(new Error(`${label || "call"} timed out after ${ms}ms`)), ms)
        ),
    ]);
}
const UNICODE_RANGES = [
    { lang: "Telugu",    re: /^[\u0C00-\u0C7F]+$/  },
    { lang: "Hindi",     re: /^[\u0900-\u097F]+$/  },
    { lang: "Tamil",     re: /^[\u0B80-\u0BFF]+$/  },
    { lang: "Kannada",   re: /^[\u0C80-\u0CFF]+$/  },
    { lang: "Malayalam", re: /^[\u0D00-\u0D7F]+$/  },
    { lang: "Bengali",   re: /^[\u0980-\u09FF]+$/  },
    { lang: "Gujarati",  re: /^[\u0A80-\u0AFF]+$/  },
    { lang: "Punjabi",   re: /^[\u0A00-\u0A7F]+$/  },
    { lang: "Odia",      re: /^[\u0B00-\u0B7F]+$/  },
    { lang: "Urdu",      re: /^[\u0600-\u06FF]+$/  },
    { lang: "Santali",   re: /^[\u1C50-\u1C7F]+$/  },
    { lang: "Manipuri",  re: /^[\uABC0-\uABFF]+$/  },
    { lang: "Sinhala",   re: /^[\u0D80-\u0DFF]+$/  },
    { lang: "Thai",      re: /^[\u0E00-\u0E7F]+$/  },
    { lang: "Tibetan",   re: /^[\u0F00-\u0FFF]+$/  },
    { lang: "Myanmar",   re: /^[\u1000-\u109F]+$/  },
    { lang: "Khmer",     re: /^[\u1780-\u17FF]+$/  },
    { lang: "Lao",       re: /^[\u0E80-\u0EFF]+$/  },
    { lang: "Georgian",  re: /^[\u10A0-\u10FF]+$/  },
    { lang: "Armenian",  re: /^[\u0530-\u058F]+$/  },
    { lang: "Ethiopic",  re: /^[\u1200-\u137F]+$/  },
    { lang: "Chinese",   re: /^[\u4E00-\u9FFF\u3400-\u4DBF]+$/ },
    { lang: "Japanese",  re: /^[\u3040-\u309F\u30A0-\u30FF]+$/ },
    { lang: "Korean",    re: /^[\uAC00-\uD7AF\u1100-\u11FF]+$/ },
    { lang: "Russian",   re: /^[\u0400-\u04FF]+$/  },
    { lang: "Greek",     re: /^[\u0370-\u03FF]+$/  },
];
const WORD_DICT = {
    Telugu: { weight: 8, words: new Set(["neeru","neellu","neerupotu","neeruravvatledu","neeruprapti","neetipaarana","karrent","karanthu","viddyut","bijili","lightlu","currentu","road","raste","chettupoyindi","potalu","gundalu","hospital","aspathri","doctor","vaidyulu","rogulu","sathru","police","policevadu","theesukellandi","complaint","complaintivvandi","cheppandi","cheyandi","ivvandi","vastundi","padutundi","telusindi","avutundi","poindi","unnaru","chesaru","ivvaledu","kaddu","gurthu","parugettaledu","raavatamladu","kaluguladu","chesavadu","chusukovatamladu","meeru","memu","maa","naaku","nenu","meeku","vaallaki","vaallu","andukani","ledu","undi","kani","andi","tundi","ndi","indi","rojulu","nelalu","vaaram","gantalaku","nimishaalu","ippudu","munde","taruvata","ninna","nede","raatri","paggati","inti","illu","vittu","veedhi","parikara","samasya","samasyalu","prajasakti","prabhutva","dabbulu","phee","seva","shikayat","dayachesi","meeru","garu","ayya","amma","babu"]) },
    Hindi: { weight: 7, words: new Set(["paani","pani","jal","paanipurti","paanibandh","nalka","nali","bijli","bijlee","light","bijlikata","bijligul","katauti","sadak","rasta","raste","gaddha","toot","kharab","bandh","aspatal","dawakhana","dawa","doctor","bimari","ilaj","swasthya","police","thana","darj","shikayat","report","faryad","maamla","karo","kiya","gaya","raha","rahi","hain","hai","kar","de","lo","karke","jao","aao","bolo","suno","dekho","batao","lao","rakho","nahin","nahi","nai","mat","tha","thi","the","hoga","hogi","mujhe","mera","meri","hum","hamare","hamara","hamari","aap","aapka","aapki","woh","unka","unki","unhone","yahan","wahan","yeh","wo","voh","is","us","ek","do","teen","ghante","din","hafte","mahine","saal","kal","aaj","abhi","jaldi","der","kabse","kitne","kab","subah","sham","raat","ghar","makaan","mohalla","basti","gaon","sheher","zila","rajya","paisa","rupaye","fee","seva","vibhag","adhikari","kaamgar","bahut","thoda","zyada","bilkul","zaroor","shayad","lekin","aur","ya","par","mein","se","ko","ka","ki","ke","tha","ho","takleef","dikkat","museebat","pareshani","shikayat","arzee","nivaas","safai","kachra","suraksha","ration","batta"]) },
    Tamil: { weight: 8, words: new Set(["thanni","thaani","kudineer","neermangal","neerpirachane","minjsaram","minsal","current","lightpogattu","minsaram","vandal","vandalkal","tharaivettu","therkuzhi","paathai","maruthuvamanai","maaruthuvamanai","doctor","oosipodunga","marunthuvattam","kaval","thuraiyinar","pugatchi","sathingal","nerungal","piragu","kodunga","pannunga","seyyunga","varuvanga","poovanga","sonnanga","theriyavillai","mudiyadhu","vendum","venam","illai","irukku","mudiyala","varala","seyyala","theriyum","therium","neenga","naanga","avanga","avan","aval","naan","naam","nee","avar","ungaluku","engaluku","thanku","ungal","engal","avargal","naalkal","maadham","vaaram","nimidam","ippove","inniku","nethu","naale","iravu","kalai","maalai","saayankaalam","veedu","teru","graama","nagaraththil","polistanam","arivu","kaasu","seiva","thurai","adhikaari","thozhilalar","matram","romba","konjam","ellam","pochu","aagiduthu","sollunga","enna","eppo","enge","yaaru","epaddi","ethanai","yen"]) },
    Kannada: { weight: 8, words: new Set(["neeru","neeravari","neerugaagi","neershapurava","vidhyut","vidyut","bijli","light","currentu","lightilla","raste","rastheya","gundimege","tottilu","thothilu","aspatra","davaakhane","doctor","rasada","vidhaanavara","rogavadavarege","polisu","thane","dakhal","pugatchi","shikaytu","hanteyu","madbekku","kodbekku","helikodbekku","aagoythu","agalla","bandu","hogi","nodi","keli","heli","tago","kodo","bekilla","beku","neevu","naavu","avaru","avan","avaLu","nimma","namma","avara","avarige","nimage","namage","ivaru","ee","aa","adu","idu","dinagalu","maathu","vaara","nimisha","illi","aaga","irodu","ninne","naale","idu","ee","raatri","belage","saanje","mane","raste","hobi","grama","nagara","jilla","rajya","haana","seva","vibhaaga","adhikari","karmikaru","badalaavane","thumba","konjada","ellaa","aagide","aagtide","heeLri","enu","eshtu","yaake","yaaru","henge","ellu","yaavaga"]) },
    Malayalam: { weight: 8, words: new Set(["vellam","kudivellam","jalasechanam","nallavellam","vellamprasakti","karant","minsaram","kareant","lightpogayi","bidyut","raste","vaazhikal","chuzhikal","potuvizhuthal","thumbaadhanam","aarogyam","asupathri","doctor","marikunnu","chikithsa","rogam","polisu","sthanavu","parathu","pugatchi","sahayikkanam","venam","venda","kittunilla","cheyyunilla","parayunnu","cheyyum","varund","pokunna","irrikkunna","und","undo","illa","aanu","sahaayikkuka","kodukkuka","thedum","adiyunna","cheyvaan","njangal","ningal","avaru","avan","aval","njaan","naam","ningalude","avarkku","njangalku","ente","ninte","avante","divasam","maasam","azhcha","nimisham","ippol","ithu","innale","naale","raathri","ravile","vaikuntu","sammayam","veedu","nagar","gramam","jilla","samsthaanam","naadukal","panam","sevana","vibhagam","adhikaari","kaarmikan","maarutham","valare","konjam","ellaam","aayi","aakunna","paryaayanam","enthu","evidey","aaru","epaddi","ethra","enthukondu"]) },
    Bengali: { weight: 8, words: new Set(["jal","pani","khawaryogya","nalerjal","jalprapti","biddyut","bijli","loadshedding","lightchole","bidjut","rasta","raasta","gaddha","rastakhana","bhangapaaka","hapataal","hospital","daktar","rog","chikitsha","swasthya","police","thana","obhiyog","pulis","doshtu","hoyeche","korche","deyni","asheni","jacche","pabe","jabe","karo","kori","balo","suno","dekho","nao","diye","niye","amader","tader","apnar","apni","amra","tara","ami","aami","tumi","se","tar","aamader","taader","apnaader","din","mash","saptah","ghanta","akhon","kal","aaj","pore","age","raate","subhe","bikal","raat","shokal","sondha","bari","ghar","para","graam","shahar","jela","rajyo","taka","paisa","seva","vibhag","adhikari","karmi","poribarton","khub","ektu","shob","hoeche","hoiche","bolun","shunun","kothay","kobe","keno","ke","ki","koto","kokhon"]) },
    Marathi: { weight: 8, words: new Set(["paani","pani","jalasechan","nalache","jalpuravtha","vij","bijli","light","currentkapat","vidyut","lightkapat","rasta","khaddye","roadtoot","vaadhaaree","maargavighna","rugnalaya","davakhana","doctor","aushadhi","arog","swasthya","police","theene","takrar","faryaad","darj","sahaayya","aahe","nahi","amhi","tumhi","dyaa","karaa","sangaa","yenar","saang","bagh","ghe","de","ye","ja","thev","kelo","gelo","aaplyala","tumhala","tyala","tila","amhala","kunaala","aapan","tu","tum","to","ti","te","he","she","tya","divas","mahina","aThavda","taas","ata","kal","aaj","nantar","aadhi","raat","subahi","sandhyakali","velaa","wakhat","ghar","ghaav","parisar","gaav","shahar","jilla","rajya","paise","rupaye","seva","vibhag","adhikari","karmi","badal","khup","thoda","sagle","jhale","hoil","saanga","aika","kay","keva","ka","kiti","kuthe","koni","kadhi","takda"]) },
    Odia: { weight: 8, words: new Set(["pani","jala","khiapani","nalikapani","paniprapti","biddyut","bijuli","current","lightgala","biddyutbandha","rasta","rastaghata","pothara","rastagaddha","maarga","aspatal","daktar","oushada","rogi","swasthya","chikitsa","police","thana","obhiyog","dakhal","sahaayata","nirapatta","achi","deba","pariba","janila","asuni","kahuchi","thae","hela","kara","deka","suna","jaa","aa","rakha","chha","amaku","tumaku","tahaku","mo","tuma","sehi","ama","amo","apana","tahara","amanku","tamanku","ehi","sei","tahi","dina","masa","saptaha","ghanta","aaji","kali","ekhana","pare","agaru","raatri","subha","bihaana","bikal","samaya","ghara","para","gaon","sahar","jilla","rajya","thikana","taka","paisa","seva","vibhaga","adhikari","karmi","paribartana","khuba","kichu","sabi","heiachi","heiba","kahante","sunanti","kemiti","kete","kahare","asiba","kahiba","kana","bisare"]) },
    Gujarati: { weight: 7, words: new Set(["pani","jal","bijli","sadak","aspatal","police","phariyad","nathi","ame","tamne","aapjo","che","farayad","takleef","amaaraa","tamaaraa","aavo","javo","karo","bolo","suno","divas","mahino","pan","ne","thi","ma","nu","naa","shu","kyare","kyan","kem","kaon","ketlaa","kai","aavre"]) },
    Punjabi: { weight: 7, words: new Set(["paani","bijli","sadak","aspatal","pulis","shikayat","takleef","saanu","tenu","unnu","assi","tusi","oh","oho","kinne","kithe","kado","kyun","dasna","pata","janda","jana","aana","karo","suno","dasda","janda","kehna","akhna","labna"]) },
    Urdu: { weight: 7, words: new Set(["paani","bijli","sadak","aspatal","police","shikayat","arz","faryaad","huzoor","janab","sahib","maharaj","mujhe","hamara","unka","yahan","wahan","abhi","jaldi","zaroor","bilkul","takleef","pareshani","museebat","intizaam","haalat","masla"]) },
    English: { weight: 5, words: new Set(["water","supply","electricity","power","road","roads","pothole","drainage","sewage","garbage","waste","hospital","health","police","complaint","problem","issue","broken","damaged","not","working","please","help","fix","repair","resolve","request","urgent","street","light","pipe","leak","flood","blocked","dirty","no","available","since","days","months","weeks","hours","pending","office","department","officer","authorities","government"]) },
    Assamese: { weight: 7, words: new Set(["paani","pani","bijuli","bidyut","rasta","ghar","ghoror","hospital","daktar","doctor","police","complaint","samasya","nai","ase","hobo","kora","diya","lowa","koribole","lagibo","aamaar","aamar","amaar","apunar","apuni","aami","tumi","xi","kiman","kenekoi","kot","koboloi","dhoribo","goisil","ahise","xadhu","bhaal","bhal","biya","besi","olop","dheere","mohila","manuh","lokh","ghore","bazaar","office","sarkar","jiladhikari","jila","thana","pradhan","panchayat"]) },
    Nepali: { weight: 7, words: new Set(["paani","bijuli","batti","sadak","ghar","aspatal","prahari","samasya","ujaree","guna","kura","garnu","dinu","linu","cha","chha","chhaina","thiyo","thyo","huncha","bhayo","mero","timro","usko","hamro","tapai","tapaiko","ma","hami","kaha","kahile","kasari","kati","kina","ke","kun","gaau","sahar","jilla","ward","nagarpalika","gaupalika","sarkar","adhikari","karyalaya","nirdeshak"]) },
    Maithili: { weight: 7, words: new Set(["paani","bijli","sadak","ghar","aspatal","thana","samasya","karba","deba","leba","jaaib","aaib","acchi","achhi","nahi","hai","hain","rahi","chhau","achhi","hamar","tohar","ohkar","hamra","apne","hum","ahaan","katay","kahi","kahiye","kahe","kine","ki","kon","gaau","sahar","jila","panchayat","sarkar"]) },
    Konkani: { weight: 7, words: new Set(["udak","vij","rosto","ghor","hospital","police","samasya","kor","di","ghe","ye","voch","asa","naa","mhaka","tuka","amka","tumka","hanv","tum","amhi","khai","kedy","koso","kitlo","kiteak","kitem","konn","gaav","shahar","taluka","panchayat","sarkar"]) },
    Sanskrit: { weight: 6, words: new Set(["jalam","vidyut","maargah","gruham","chikitsalayam","aarakshakah","samasya","karoti","dadaati","gruhnaati","asti","naasti","bhavati","syaat","aaseet","bhavishyati","mama","tava","asya","asmaakam","yushmaakam","aham","tvam","kutra","kadaa","katham","kati","kasmaat","kim","kah","graamah","nagaram","janpadah","raajyam","sarkarah"]) },
    Dogri: { weight: 7, words: new Set(["paani","bijli","sadak","ghar","hospital","thana","takleef","karna","dena","lena","jaana","aana","ae","hai","nai","si","hoye","hona","kara","mera","tera","saada","tusaada","mai","tui","assi","kithe","kadun","kiven","kitna","kyun","ki","kon","pind","shahar","jila","panchayat","sarkar"]) },
    Kashmiri: { weight: 7, words: new Set(["aab","bijli","sadak","ghar","hospital","thana","mushkil","karnay","dyun","hyun","gatshun","yun","chhu","chhe","chhena","aas","os","gayi","banaav","myon","chhon","temis","saanis","boh","tse","aes","kati","kus","kemyah","kyazi","kyah","yeli","gaav","shahar","tehsil","panchayat","sarkar"]) },
    Sindhi: { weight: 7, words: new Set(["paani","bijli","rasto","ghar","hospital","thano","takleef","karan","dian","khan","wanjan","aachhan","aahe","naahe","huo","huee","ahyan","kando","muhinja","tuhinja","hunjo","asaanjo","maan","toon","hoo","kithe","kaday","kiyan","kitro","chho","chaee","kaun","gaoth","shahar","taluko","panchayat","sarkar"]) },
    Bodo: { weight: 6, words: new Set(["dui","electric","lambi","nogo","hospital","police","gwrbw","mwn","hwnba","hwnnanwi","nonga","ong","ang","nwng","bi","jwngnini","bai","abo","bele","mabe","gwnang","swnai","badw","mwnw","gaon","nagar","jilla","panchayat","sarkar"]) },
    Manipuri: { weight: 7, words: new Set(["ishing","meifam","lambi","yum","hospital","police","awaba","tou","pi","lou","chatlak","lak","lei","leite","natte","khari","oire","laklaba","eigi","nanggi","mahakki","eikhoigi","ei","nang","mahak","karamba","karamda","kanano","kaya","karigumba","khungan","sahar","jilla","panchayat","sarkar"]) },
    Santali: { weight: 7, words: new Set(["daa","bijli","hora","orak","hospital","police","sawta","ruwa","ema","nel","chal","hiju","menae","baan","kanae","inren","gea","taikena","ing","am","uni","aale","aling","aben","okare","okoe","chet","chetan","chetleka","ato","nagar","jilla","panchayat","sarkar"]) },
    French: { weight: 5, words: new Set(["eau","electricite","route","maison","hopital","police","probleme","faire","donner","prendre","aller","venir","est","sont","pas","etait","sera","avoir","etre","mon","ton","son","notre","votre","leur","je","tu","il","ou","quand","comment","combien","pourquoi","que","qui","ville","village","departement","gouvernement"]) },
    Spanish: { weight: 5, words: new Set(["agua","electricidad","camino","casa","hospital","policia","problema","hacer","dar","tomar","ir","venir","es","son","no","era","sera","haber","ser","estar","mi","tu","su","nuestro","yo","usted","el","ella","donde","cuando","como","cuanto","porque","que","quien","ciudad","pueblo","departamento","gobierno"]) },
    Portuguese: { weight: 5, words: new Set(["agua","eletricidade","estrada","casa","hospital","policia","problema","fazer","dar","tomar","ir","vir","nao","sim","esta","sao","foi","sera","ter","ser","meu","teu","seu","nosso","eu","voce","ele","ela","onde","quando","como","quanto","porque","que","quem","cidade","aldeia","governo","departamento"]) },
    German: { weight: 5, words: new Set(["wasser","strom","strasse","haus","krankenhaus","polizei","problem","machen","geben","nehmen","gehen","kommen","ist","sind","nicht","war","wird","haben","sein","mein","dein","sein","unser","ich","du","er","sie","wo","wann","wie","wieviel","warum","was","wer","stadt","dorf","regierung","amt"]) },
    Arabic: { weight: 5, words: new Set(["maa","kahraba","tariq","bait","mustashfa","shurta","mushkila","yafal","yuati","yakhud","yadhhab","yaati","huwa","hiya","nahnu","antum","ana","anta","anti","ayna","mata","kayfa","kam","limadha","madha","man","madinah","qaryah","hukuma","dawla"]) },
};
const MORPHEME_PATTERNS = {
    Telugu: { weight: 7, suffixes: ["andi","tundi","ndi","indi","meru","ledu","undi","garu","vadu","aaru","kani","chey","vundi","poyindi","ayindi","chestunnaru","chesaru","chesindi","chestundi","taru"], prefixes: [] },
    Hindi: { weight: 6, suffixes: ["nahi","wala","wali","wale","kar","karo","kiya","gaya","raha","rahi","rahe","hai","hain","tha","thi","the","hoga","hogi","honge","karna","jaana","aana","lena"], prefixes: ["har","kuch","sab","koi","mere","tera","aap","hum"] },
    Tamil: { weight: 7, suffixes: ["nga","inga","illa","enna","kku","thann","vantu","sollu","teru","paar","ndu","thal","pal","gal","kal","dal","undu","paduthu","seyyungo","varugo","poigo","sonnango"], prefixes: [] },
    Kannada: { weight: 7, suffixes: ["bekku","alla","illi","haagu","namma","nimma","avaru","neevu","adru","bidu","idhe","agidhe","madidhe","heli","thumba","agalla","kodbekku","helikodbekku","madtini"], prefixes: [] },
    Malayalam: { weight: 7, suffixes: ["kittunilla","cheyyunilla","njangal","ningal","parayunnu","evidey","undu","illa","aayi","aakum","pokum","varum","cheyyum","nalkunna","thanrna","ninnum","polum","kaanaam"], prefixes: [] },
    Bengali: { weight: 7, suffixes: ["hoyeche","korche","amader","jacche","asheni","deyni","kothay","apnar","bolun","thakbe","hobey","nebe","giyeche","pelam","paini","boro","choto","bhalo","kharap","ekhane"], prefixes: [] },
    Odia: { weight: 7, suffixes: ["achi","deba","amaku","tumaku","kahiba","pariba","janila","asuni","ghare","kahuchi","hela","thae","heichi","deinahin","paainchi","aasuchi","karuchhi","kahucha","thaauchi"], prefixes: [] },
    Marathi: { weight: 7, suffixes: ["aahe","nahi","amhi","tumhi","dyaa","karaa","sangaa","yenar","ganar","aaplyala","tumhala","kuthe","kiti","keva","takda","jhala","jhali","jhale","hote","hoti","hote","asaal"], prefixes: [] },
    Assamese: { weight: 7, suffixes: ["ase","nai","hobo","kora","diya","lowa","bole","lagibo","goisil","ahise","korise","gol","dile","lole","hol"], prefixes: [] },
    Nepali: { weight: 7, suffixes: ["cha","chha","chhaina","thiyo","thyo","huncha","bhayo","garnu","dinu","linu","janu","aunu","hune","garne"], prefixes: ["ma","hami","tapai","timro","mero","hamro"] },
    Maithili: { weight: 7, suffixes: ["acchi","achhi","chhau","hain","jhau","ahaan","aith","karba","deba","leba","jaaib","aaib","rahal","gelau"], prefixes: ["hamar","tohar","ohkar","hamra"] },
    Konkani: { weight: 7, suffixes: ["asa","naa","ghe","voch","zaunk","kelo","keli","korcho","korchi","ditam","ghetam","yetalem"], prefixes: ["hanv","tum","amhi","tumhi","mhaka","tuka"] },
    Dogri: { weight: 7, suffixes: ["ae","hai","nai","si","hoye","kara","ditta","litta","giaa","ayaa","karna","jaana","aana","lena"], prefixes: ["mai","tui","assi","tussi","mera","tera","saada"] },
    Kashmiri: { weight: 7, suffixes: ["chhu","chhe","chhena","gatshun","yun","karnay","dyun","hyun","gayi","banaav","koru","poru","govu"], prefixes: ["boh","tse","aes","myon","chhon"] },
    Manipuri: { weight: 7, suffixes: ["lei","leite","natte","khari","oire","laklaba","thoklaba","chatle","lakle","thokle","piraba","pibage"], prefixes: ["ei","nang","mahak","eigi","nanggi","mahakki"] },
};
const PHONETIC_HEURISTICS = {
    Telugu: { patterns: [/\b\w+(undi|tundi|wundi|wundi)\b/i,/\b(meeru|memu|meeku|vaallaki)\b/i,/\b\w+(andi|cheyandi|ivvandi)\b/i,/\b(neeru|neellu|neerupotu)\b/i,/\b(ledu|ledhu|leddu)\b/i,/\b(vachindi|poyindi|ayindi)\b/i,/cheppand/i,/chevand/i,/cheyand/i], weight: 9 },
    Hindi: { patterns: [/\b(nahi|nahin|nai)\b/i,/\b(paani|pani)\b/i,/\b(bijli|bijlee)\b/i,/\b(karke|karenge|karunga)\b/i,/\b(hain|nahi|bahut|wala)\b/i,/\b(mujhe|hamara|hamare|aapka)\b/i,/[aeiou]ke\b/i], weight: 8 },
    Tamil: { patterns: [/\b(illa|illai)\b/i,/\b\w+(nga|inga)\b/i,/\b(kodunga|pannunga|seyyunga)\b/i,/\b(thanni|thaan|thaani)\b/i,/\b(enna|eppo|enge|epaddi)\b/i,/sollunga|paarunga/i], weight: 9 },
    Kannada: { patterns: [/\b\w+bekku\b/i,/\b(illi|alla|haagu)\b/i,/\b(namma|nimma|avaru)\b/i,/\b(agalla|agidhe|madidhe)\b/i,/\b(thumba|konjada)\b/i], weight: 9 },
    Malayalam: { patterns: [/kittunilla/i,/cheyyunilla/i,/\b(njangal|ningal)\b/i,/\b(evidey|evidunde)\b/i,/\b(vellam|karant)\b/i], weight: 9 },
    Bengali: { patterns: [/hoyeche/i,/\b(amader|apnar|apni)\b/i,/korche|jacche/i,/\b(kothay|kobe|keno)\b/i,/\b(asheni|deyni)\b/i], weight: 9 },
    Odia: { patterns: [/\b(amo|ama)\b/i,/\b(amaku|tumaku)\b/i,/\bachi\b/i,/kahiba|pariba/i,/\b(ghare|asuni)\b/i], weight: 9 },
    Marathi: { patterns: [/\b(aahe|nahi)\b/i,/\b(amhi|tumhi)\b/i,/\b(aaplyala|tumhala)\b/i,/dyaa\b|karaa\b|sangaa\b/i,/\b(takda|zhale|zhali)\b/i], weight: 9 },
    Assamese: { patterns: [/\b(ase|nai|hobo)\b/i,/\b(aamaar|apunar|apuni)\b/i,/\b(kenekoi|koboloi)\b/i,/goisil|ahise|korise/i], weight: 9 },
    Nepali: { patterns: [/\b(cha|chha|chhaina)\b/i,/\b(mero|timro|hamro)\b/i,/\b(tapai|tapaiko)\b/i,/huncha|bhayo|thiyo/i,/\b(garnu|dinu|linu)\b/i], weight: 9 },
    Maithili: { patterns: [/\b(acchi|achhi|chhau)\b/i,/\b(hamar|tohar|ohkar)\b/i,/\b(ahaan|hamra|apne)\b/i,/karba|deba|leba/i], weight: 8 },
    Konkani: { patterns: [/\b(hanv|tum|amhi)\b/i,/\b(mhaka|tuka|amka)\b/i,/\b(asa|naa|zaunk)\b/i,/kelo|keli|korcho/i], weight: 8 },
    Dogri: { patterns: [/\b(ae|hai|nai|si)\b/i,/\b(mai|tui|assi|tussi)\b/i,/\b(kithe|kadun|kiven)\b/i,/ditta|litta|hoye/i], weight: 8 },
    Kashmiri: { patterns: [/\b(chhu|chhe|chhena)\b/i,/\b(boh|tse|aes)\b/i,/\b(myon|chhon|temis)\b/i,/gatshun|karnay|dyun/i], weight: 8 },
    Manipuri: { patterns: [/\b(lei|leite|natte)\b/i,/\b(ei|nang|mahak)\b/i,/\b(eigi|nanggi|eikhoigi)\b/i,/laklaba|thoklaba|chatle/i], weight: 8 },
};
function analyzeWordsDeep(text) {
    const results = {
        wordMatches    : [],
        langScores     : {},
        totalWords     : 0,
        coveredWords   : 0,
        dominantLang   : null,
        confidence     : 0,
        method         : "L5-word-analysis",
        weight         : 6,
    };
    const words = text.toLowerCase()
        .split(/[\s,।，。\n\r\t]+/)
        .map(w => w.replace(/[^\w\u0080-\uFFFF]/g, ""))
        .filter(w => w.length >= 2);
    results.totalWords = words.length;
    if (words.length === 0) return results;
    const devanagariLang = disambiguateDevanagari(text);
    const bengaliLang = disambiguateBengali(text);
    const add = (lang, score, word, method) => {
        results.langScores[lang] = (results.langScores[lang] || 0) + score;
        results.wordMatches.push({ word, lang, method, score });
        results.coveredWords++;
    };
    for (const word of words) {
        let matched = false;
        for (const { lang, re } of UNICODE_RANGES) {
            if (re.test(word)) {
                let resolvedLang = lang;
                if (lang === "Hindi") resolvedLang = devanagariLang;
                else if (lang === "Bengali") resolvedLang = bengaliLang;
                add(resolvedLang, 10, word, "unicode");
                matched = true;
                break;
            }
        }
        if (matched) continue;
        let dictMatch = false;
        for (const [lang, { weight, words: dictSet }] of Object.entries(WORD_DICT)) {
            if (dictSet.has(word)) {
                add(lang, weight, word, "dict");
                dictMatch = true;
                break;
            }
        }
        if (dictMatch) { matched = true; continue; }
        for (const [lang, { weight, suffixes, prefixes }] of Object.entries(MORPHEME_PATTERNS)) {
            for (const suf of suffixes) {
                if (word.endsWith(suf) && word.length > suf.length + 1) {
                    add(lang, weight * 0.7, word, `suffix:${suf}`);
                    matched = true;
                    break;
                }
            }
            if (matched) break;
            for (const pre of (prefixes || [])) {
                if (word.startsWith(pre) && word.length > pre.length + 1) {
                    add(lang, weight * 0.6, word, `prefix:${pre}`);
                    matched = true;
                    break;
                }
            }
            if (matched) break;
        }
        if (matched) continue;
    }
    const fullLower = " " + text.toLowerCase() + " ";
    for (const [lang, { patterns, weight }] of Object.entries(PHONETIC_HEURISTICS)) {
        let hits = 0;
        for (const pat of patterns) {
            if (pat.test(fullLower)) hits++;
        }
        if (hits > 0) {
            const score = hits * weight * 1.2;
            results.langScores[lang] = (results.langScores[lang] || 0) + score;
            results.wordMatches.push({ word: `[phonetic:${lang}]`, lang, method: "phonetic", score });
        }
    }
    const sorted = Object.entries(results.langScores).sort((a, b) => b[1] - a[1]);
    if (!sorted.length) return results;
    const [winner, winScore] = sorted[0];
    const second = sorted[1]?.[1] || 0;
    const totalScore = sorted.reduce((s, [, v]) => s + v, 0);
    const margin = winScore > 0 ? (winScore - second) / winScore : 0;
    results.dominantLang  = winner;
    results.confidence    = Math.min(97, Math.round(40 + margin * 45 + (winScore / totalScore) * 25));
    results.language      = winner;
    if ((winner === "Hindi" || winner === "Marathi") && sorted.length > 1) {
        const marathiWords = /\b(aahe|amhi|tumhi|dyaa|karaa|sangaa|takda|aaplyala)\b/i;
        if (marathiWords.test(text) && winner === "Hindi") {
            results.dominantLang = "Marathi";
            results.language     = "Marathi";
        } else if (!marathiWords.test(text) && winner === "Marathi") {
            results.dominantLang = "Hindi";
            results.language     = "Hindi";
        }
    }
    return results;
}
function detectUnicode(text) {
    const blockHits = {};
    for (const { lang, re } of UNICODE_RANGES) {
        const hits = (text.match(new RegExp(re.source.replace(/\^|\$|\+/g, ""), "g")) || []).length;
        if (hits > 0) blockHits[lang] = (blockHits[lang] || 0) + hits;
    }
    if (blockHits["Hindi"]) {
        const dLang = disambiguateDevanagari(text);
        if (dLang !== "Hindi") {
            blockHits[dLang] = blockHits["Hindi"];
            delete blockHits["Hindi"];
        }
    }
    if (blockHits["Bengali"]) {
        const bLang = disambiguateBengali(text);
        if (bLang !== "Bengali") {
            blockHits[bLang] = blockHits["Bengali"];
            delete blockHits["Bengali"];
        }
    }
    if (blockHits["Urdu"]) {
        const urduMarkers = /[\u0679\u0688\u0691\u06BA\u06BE\u06C1\u06C3\u06D2]/;
        if (!urduMarkers.test(text)) {
            const arabicWords = /\b(في|من|على|إلى|عن|هذا|ذلك|التي|الذي|هل|إن)\b/;
            if (arabicWords.test(text)) {
                blockHits["Arabic"] = blockHits["Urdu"];
                delete blockHits["Urdu"];
            }
        }
    }
    const sorted = Object.entries(blockHits).sort((a, b) => b[1] - a[1]);
    if (!sorted.length) return null;
    return { language: sorted[0][0], confidence: 100, method: "L1-unicode", weight: 10 };
}
const NGRAM_SIGS = {
    Telugu: ["tundi","undi ","ndi ","indi ","meru ","ledu ","andi ","garu ","vadu ","chey"],
    Hindi: ["nahi ","karo ","mein ","bijli","karke","raha ","rahi ","wala ","hain ","paani"],
    Tamil: ["nga ","inga ","illa ","enna ","kku ","thann","sollu","paar ","enge ","eppo"],
    Kannada: ["bekku","alla ","illi ","haagu","namma","nimma","avaru","neevu","adru ","bidu"],
    Marathi: ["aahe ","nahi ","amhi ","tumhi","dyaa ","karaa","sangaa","yenar","takda"],
    Bengali: ["hoyeche","korche","amader","jacche","asheni","deyni","kothay","apnar"],
    Odia: [" achi"," deba","amaku","tumaku","kahiba","pariba","janila"," amo "," ama ","asuni"],
    Gujarati: ["nathi ","ame ","tamne","aapjo","che ","farayad"],
    Punjabi: ["saanu","tenu ","janda","kithe","dasna"],
    Malayalam: ["kittunilla","cheyyunilla","njangal","ningal","parayunnu","evidey"],
    Assamese: ["ase ","nai ","hobo ","kora ","diya ","goisil","ahise","aamaar","apuni"],
    Nepali: ["cha ","chha ","chhaina","huncha","bhayo","thiyo","garnu","mero ","hamro"],
    Maithili: ["acchi","achhi","chhau","hamar","tohar","karba","deba ","ahaan"],
    Konkani: ["hanv ","mhaka","tuka ","amka ","zaunk","kelo ","korcho","asa "],
    Dogri: ["ae ","ditta","litta","hoye ","assi ","tussi","kithe","saada"],
    Kashmiri: ["chhu ","chhe ","chhena","gatshun","boh ","myon ","dyun "],
    Manipuri: ["lei ","leite","natte","laklaba","eigi ","nanggi","chatle"],
};
function detectNgram(text) {
    const lower  = " " + text.toLowerCase() + " ";
    const scores = {};
    for (const [lang, patterns] of Object.entries(NGRAM_SIGS)) {
        let hits = 0;
        for (const p of patterns) { if (lower.includes(p)) hits++; }
        if (hits > 0) scores[lang] = hits;
    }
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    if (!sorted.length) return { language: "English", confidence: 40, method: "L3-ngram", weight: 2 };
    const [lang, hits] = sorted[0];
    return { language: lang, confidence: Math.min(88, 38 + hits * 10), method: "L3-ngram", weight: 3 };
}
const FRANC_MAP = {
    hin: "Hindi",  tel: "Telugu",  tam: "Tamil",  kan: "Kannada",
    mal: "Malayalam", ben: "Bengali", guj: "Gujarati", pan: "Punjabi",
    ori: "Odia",   ory: "Odia",   urd: "Urdu",   mar: "Marathi",
    eng: "English", asm: "Assamese", nep: "Nepali", mai: "Maithili",
    kok: "Konkani", san: "Sanskrit", doi: "Dogri", kas: "Kashmiri",
    snd: "Sindhi",  mni: "Manipuri", sat: "Santali", bod: "Bodo",
    fra: "French",  spa: "Spanish",  por: "Portuguese", deu: "German",
    ara: "Arabic",  rus: "Russian",  zho: "Chinese", jpn: "Japanese",
    kor: "Korean",  tha: "Thai",     vie: "Vietnamese", tur: "Turkish",
    ita: "Italian", nld: "Dutch",    pol: "Polish",  swe: "Swedish",
    ind: "Indonesian", msa: "Malay", fil: "Filipino", heb: "Hebrew",
    fas: "Persian",
    hau:"Hindi",swh:"Hindi",som:"Hindi",bho:"Hindi",mwr:"Marathi",
    war:"Marathi",sco:"English",afr:"English",
};
function detectFranc(text) {
    try {
        if (typeof franc !== "function") return null;
        const code = franc(text, { minLength: 4 });
        const lang = FRANC_MAP[code];
        if (lang) return { language: lang, confidence: 52, method: `L4-franc(${code})`, weight: 2 };
        return { language: "English", confidence: 35, method: `L4-franc-unknown(${code})`, weight: 1 };
    } catch { return null; }
}
const GROQ_MODELS = [
    { id: "meta-llama/llama-4-scout-17b-16e-instruct", label: "L6-groq-llama4-scout", weight: 6 },
    { id: "llama-3.3-70b-versatile",                   label: "L7-groq-llama3.3-70b", weight: 6 },
    { id: "llama-3.1-8b-instant",                      label: "L8-groq-llama3.1-8b",  weight: 4 },
];
function buildLangPrompt(text) {
    return `Identify the PRIMARY language in this text. The text may be in ANY language worldwide, including code-mixed (multiple languages mixed together) and romanised/transliterated text.
Output ONLY valid JSON.
TEXT: "${text.slice(0, 500)}"
INDIAN LANGUAGES REFERENCE:
Telugu:    neeru/ledu/undi/meeru/cheppandi/andi/garu/tundi
Hindi:     paani/bijli/nahi/hai/mein/karo/ghar/wala/hain
Tamil:     thanni/illa/enna/kodunga/pannunga/nga
Kannada:   neeru/illi/alla/bekku/haagu/thumba/nimma
Marathi:   paani/aahe/nahi/amhi/tumhi/dyaa/takda
Bengali:   jal/amader/hoyeche/jacche/korche/asheni
Odia:      pani/amo/ama/ghare/asuni/achi/kahiba
Gujarati:  pani/ame/tamne/nathi/che/farayad
Punjabi:   paani/saanu/tenu/janda/kithe
Malayalam: vellam/njangal/ningal/illa/kittunilla
Assamese:  paani/ase/nai/hobo/aamaar/apunar
Nepali:    paani/cha/chha/chhaina/huncha/mero/hamro
Maithili:  paani/acchi/achhi/hamar/tohar/ahaan
Konkani:   udak/hanv/mhaka/tuka/asa/naa
Dogri:     paani/ae/hai/nai/assi/tussi
Kashmiri:  aab/chhu/chhe/boh/tse/myon
Manipuri:  ishing/lei/leite/natte/eigi/nanggi
Sanskrit:  jalam/asti/naasti/bhavati/mama/tava
Santali:   daa/menae/baan/kanae/ing/am
Bodo:      dui/mwn/ang/nwng/nonga
English:   plain English
INTERNATIONAL: Also detect French, Spanish, Portuguese, German, Arabic, Russian, Chinese, Japanese, Korean, Thai, Italian, Dutch, Turkish, Indonesian, Vietnamese, and any other language.
If the text mixes multiple languages, identify the DOMINANT one.
Return: {"language":"<Language>","confidence":<0-100>,"isCodeMixed":<true|false>,"secondaryLanguage":"<or null>"}`;
}
function parseAIResponse(raw = "") {
    const cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").replace(/```json|```/gi, "").trim();
    let parsed = safeJSON(cleaned);
    if (!parsed.language) {
        const lm = cleaned.match(/"language"\s*:\s*"([^"]+)"/i);
        const cm = cleaned.match(/"confidence"\s*:\s*(\d+)/i);
        if (lm) parsed = { language: lm[1], confidence: cm ? parseInt(cm[1]) : 68 };
    }
    if (!parsed.language) return null;
    parsed.language   = parsed.language.trim().replace(/^(\w)/, c => c.toUpperCase());
    parsed.confidence = Math.min(100, Math.max(0, Number(parsed.confidence) || 68));
    return parsed;
}
async function detectGroqModel(modelId, label, weight, text, delayMs = 0) {
    if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs));
    try {
        const res = await withTimeout(
            groq.chat.completions.create({
                model: modelId, response_format: { type: "json_object" },
                temperature: 0.05, max_tokens: 120,
                messages: [
                    { role: "system", content: "You are a multilingual language identification expert supporting all world languages including all 22 Indian scheduled languages, code-mixed text, and romanised/transliterated input. Output only valid JSON." },
                    { role: "user",   content: buildLangPrompt(text) },
                ],
            }),
            10000, label
        );
        const data = parseAIResponse(res.choices[0].message.content);
        if (data) {
            console.log(`    ${label} ✅ ${data.language} (${data.confidence}%)`);
            return { ...data, method: label, weight };
        }
    } catch (e) { console.log(`    ${label} ❌ ${e.message.slice(0, 70)}`); }
    return null;
}
const HF_LANG_MAP = {
    hi:"Hindi",te:"Telugu",ta:"Tamil",kn:"Kannada",ml:"Malayalam",
    bn:"Bengali",gu:"Gujarati",pa:"Punjabi",or:"Odia",ur:"Urdu",mr:"Marathi",
    as:"Assamese",ne:"Nepali",sa:"Sanskrit",sd:"Sindhi",ks:"Kashmiri",
    mni:"Manipuri",doi:"Dogri",mai:"Maithili",kok:"Konkani",sat:"Santali",
    brx:"Bodo",
    en:"English",
    hindi:"Hindi",telugu:"Telugu",tamil:"Tamil",kannada:"Kannada",
    malayalam:"Malayalam",bengali:"Bengali",gujarati:"Gujarati",punjabi:"Punjabi",
    odia:"Odia",urdu:"Urdu",marathi:"Marathi",english:"English",
    assamese:"Assamese",nepali:"Nepali",sanskrit:"Sanskrit",
    fr:"French",es:"Spanish",pt:"Portuguese",de:"German",
    it:"Italian",nl:"Dutch",pl:"Polish",sv:"Swedish",
    ru:"Russian",ar:"Arabic",fa:"Persian",he:"Hebrew",
    zh:"Chinese",ja:"Japanese",ko:"Korean",th:"Thai",
    vi:"Vietnamese",tr:"Turkish",id:"Indonesian",ms:"Malay",
    el:"Greek",ro:"Romanian",hu:"Hungarian",cs:"Czech",
    fi:"Finnish",da:"Danish",no:"Norwegian",uk:"Ukrainian",
    bg:"Bulgarian",hr:"Croatian",sk:"Slovak",sl:"Slovenian",
    et:"Estonian",lv:"Latvian",lt:"Lithuanian",
    sw:"Hindi",so:"Hindi",ha:"Hindi",zu:"Hindi",
};
async function detectHuggingFace(text) {
    try {
        const result = await withTimeout(
            hf.textClassification({ model: "papluca/xlm-roberta-base-language-detection", inputs: text.slice(0, 256) }),
            12000, "HuggingFace"
        );
        const top  = Array.isArray(result) ? result[0] : result;
        const code = (top?.label || "").toLowerCase().trim();
        const lang = HF_LANG_MAP[code] || HF_LANG_MAP[code.split("-")[0]];
        if (lang) {
            const conf = Math.min(99, Math.round((top.score || 0.7) * 100));
            console.log(`    HuggingFace XLM-RoBERTa ✅ ${lang} (${conf}%)`);
            return { language: lang, confidence: conf, method: "L11-hf-xlm-roberta", weight: 3 };
        }
    } catch (e) { console.log(`    HuggingFace ❌ ${e.message.slice(0, 70)}`); }
    return null;
}
async function detectClaude(text) {
    try {
        const res = await withTimeout(
            groq.chat.completions.create({
                model: "moonshotai/kimi-k2-instruct",
                response_format: { type: "json_object" },
                temperature: 0.05,
                max_tokens: 200,
                messages: [
                    { role: "system", content: "You are a multilingual language identification expert. Output only valid JSON." },
                    { role: "user",   content: buildLangPrompt(text) },
                ],
            }),
            15000, "Kimi-K2"
        );
        const raw = res.choices[0]?.message?.content || "";
        const data = parseAIResponse(raw);
        if (data) {
            console.log(`    L12 Kimi-K2     ✅ ${data.language} (${data.confidence}%)`);
            return { ...data, method: "L12-kimi-k2-instruct", weight: 9 };
        }
    } catch (e) { console.log(`    L12 Kimi-K2     ❌ ${e.message.slice(0, 70)}`); }
    return null;
}
async function detectGemini(text) {
    try {
        const res = await withTimeout(
            groq.chat.completions.create({
                model: "qwen/qwen3-32b",
                response_format: { type: "json_object" },
                temperature: 0.05,
                max_tokens: 200,
                messages: [
                    { role: "system", content: "You are a multilingual language identification expert. Output only valid JSON. /no_think" },
                    { role: "user",   content: buildLangPrompt(text) },
                ],
            }),
            15000, "Qwen3"
        );
        const raw = (res.choices[0]?.message?.content || "").replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
        const data = parseAIResponse(raw);
        if (data) {
            console.log(`    L13 Qwen3-32b   ✅ ${data.language} (${data.confidence}%)`);
            return { ...data, method: "L13-qwen3-32b", weight: 8 };
        }
    } catch (e) { console.log(`    L13 Qwen3-32b   ❌ ${e.message.slice(0, 70)}`); }
    return null;
}
async function detectMistral(text) {
    if (!MISTRAL_API_KEY) return null;
    try {
        const body = JSON.stringify({
            model: "mistral-large-latest",
            temperature: 0.05,
            max_tokens: 150,
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: "You are a multilingual language identification expert. Output only valid JSON." },
                { role: "user",   content: buildLangPrompt(text) },
            ],
        });
        const result = await withTimeout(new Promise((resolve, reject) => {
            const req = https.request({
                hostname: "api.mistral.ai",
                path: "/v1/chat/completions",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${MISTRAL_API_KEY}`,
                    "Content-Length": Buffer.byteLength(body),
                },
            }, (res) => {
                let raw = "";
                res.on("data", c => raw += c);
                res.on("end", () => {
                    try { resolve(JSON.parse(raw)); }
                    catch { reject(new Error("JSON parse failed")); }
                });
            });
            req.on("error", reject);
            req.write(body);
            req.end();
        }), 15000, "Mistral");
        const raw = result.choices?.[0]?.message?.content || "";
        const data = parseAIResponse(raw);
        if (data) {
            console.log(`    L14 Mistral     ✅ ${data.language} (${data.confidence}%)`);
            return { ...data, method: "L14-mistral-large", weight: 7 };
        }
    } catch (e) { console.log(`    L14 Mistral     ❌ ${e.message.slice(0, 70)}`); }
    return null;
}
const DEVANAGARI_DISAMBIG = {
    Marathi:  /\b(आहे|नाही|आणि|करणे|होते|मला|तुम्ही|आम्ही|द्यायला|घ्यायला|काही|कसे|कुठे|आपल्याला|झाले|खूप|लवकर|सोडवा|आमच्या|तुमच्या|पाण्याची|माझा|माझी|माझे|तुमचा|तुमची|भागात|हवे|हवी|नको|चांगले|केले|केली|बघा|सांगा|करा|घ्या|येतो|जातो|बोला|विचारा|कोण|कधी|कसा|म्हणजे|आम्हाला|तुम्हाला|त्याला|तिला|आमचा|आमची|तुमचे)\b/,
    Sanskrit: /\b(अस्ति|नास्ति|भवति|कुर्यात्|ददाति|गच्छति|आगच्छति|तत्र|अत्र|एव|यथा|तथा|इति)\b/,
    Nepali:   /\b(छ|छैन|हुन्छ|भयो|गर्नु|दिनु|लिनु|तपाईं|हाम्रो|तिम्रो|मेरो)\b/,
    Maithili: /\b(अछि|नहि|करब|देब|लेब|जाइब|आइब|अहाँ|हमर|तोहर)\b/,
    Konkani:  /\b(आसा|ना|कर|दी|घे|हांव|तूं|आमकां|तुमकां)\b/,
    Dogri:    /\b(ऐ|है|नेईं|करना|देना|लेना|मैं|तुई|असी|तुसी)\b/,
    Bodo:     /\b(मोन|गोनांग|सोनाय|नोंथांग|बयनिफ्राय)\b/,
};
const BENGALI_DISAMBIG = {
    Assamese: /[\u09F0\u09F1]|(\b(অসমীয়া|হয়|নহয়|কৰ|আছে|নাই|হ'ব|ক'ত)\b)/,
};
const _DEV_MARKERS = {
    Marathi:  new Set(["आहे","नाही","आणि","करणे","होते","मला","तुम्ही","आम्ही","द्यायला","घ्यायला","काही","कसे","कुठे","आपल्याला","झाले","खूप","लवकर","सोडवा","आमच्या","तुमच्या","पाण्याची","माझा","माझी","माझे","तुमचा","तुमची","भागात","हवे","हवी","नको","चांगले","केले","केली","झाली","बघा","सांगा","करा","घ्या","येतो","जातो","बोला","विचारा","कोण","कधी","कसा","म्हणजे","आम्हाला","तुम्हाला","त्याला","तिला","आमचा","आमची","तुमचे"]),
    Sanskrit: new Set(["अस्ति","नास्ति","भवति","कुर्यात्","ददाति","गच्छति","आगच्छति","तत्र","अत्र","एव","यथा","तथा","इति"]),
    Nepali:   new Set(["छ","छैन","हुन्छ","भयो","गर्नु","दिनु","लिनु","तपाईं","हाम्रो","तिम्रो","मेरो"]),
    Maithili: new Set(["अछि","नहि","करब","देब","लेब","जाइब","आइब","अहाँ","हमर","तोहर"]),
    Konkani:  new Set(["आसा","कर","घे","हांव","तूं","आमकां","तुमकां"]),
    Dogri:    new Set(["नेईं","तुई","असी","तुसी"]),
    Bodo:     new Set(["मोन","गोनांग","सोनाय","नोंथांग","बयनिफ्राय"]),
};
const _BEN_MARKERS = new Set(["অসমীয়া","হয়","নহয়","কৰ","আছে","নাই","হ'ব","ক'ত"]);
function disambiguateDevanagari(text) {
    const words = new Set(text.split(/[\s,।!?.;\-\n]+/).filter(Boolean));
    for (const [lang, markers] of Object.entries(_DEV_MARKERS)) {
        for (const m of markers) { if (words.has(m)) return lang; }
    }
    return "Hindi";
}
function disambiguateBengali(text) {
    if (/[\u09F0\u09F1]/.test(text)) return "Assamese";
    const words = new Set(text.split(/[\s,।!?.;\-\n]+/).filter(Boolean));
    for (const m of _BEN_MARKERS) { if (words.has(m)) return "Assamese"; }
    return "Bengali";
}
function detectCodeMixing(text) {
    const segments = text
        .split(/[।\.!\?\n]+/)
        .map(s => s.trim())
        .filter(s => s.length >= 3);
    if (segments.length === 0) return { isCodeMixed: false, segments: [] };
    const segmentResults = [];
    const langCounts = {};
    for (const seg of segments) {
        const analysis = analyzeWordsDeep(seg);
        const l1 = detectUnicode(seg);
        let lang = "Unknown";
        let conf = 0;
        let method = "none";
        if (l1 && l1.confidence > 70) {
            lang = l1.language;
            conf = l1.confidence;
            method = "unicode";
            if (lang === "Hindi") lang = disambiguateDevanagari(seg);
            if (lang === "Bengali") lang = disambiguateBengali(seg);
        } else if (analysis.dominantLang) {
            lang = analysis.language;
            conf = analysis.confidence;
            method = "word-analysis";
        }
        segmentResults.push({ text: seg.slice(0, 80), language: lang, confidence: conf, method });
        if (lang !== "Unknown") {
            langCounts[lang] = (langCounts[lang] || 0) + seg.length;
        }
    }
    const totalChars = Object.values(langCounts).reduce((a, b) => a + b, 0) || 1;
    const languages = Object.entries(langCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([lang, chars]) => ({
            language: lang,
            percentage: Math.round((chars / totalChars) * 100),
        }));
    const isCodeMixed = languages.length > 1 && languages[1]?.percentage >= 10;
    const mixPattern = languages.map(l => l.language).join("-");
    return {
        isCodeMixed,
        languages,
        mixPattern: isCodeMixed ? mixPattern : languages[0]?.language || "Unknown",
        dominantLanguage: languages[0]?.language || "Unknown",
        segments: segmentResults,
    };
}
async function detectLanguage(text) {
    console.log(`\n🔍 Language detection — all layers firing...`);
    const votes = [];
    const codeMix = detectCodeMixing(text);
    if (codeMix.isCodeMixed) {
        console.log(`  🔀 Code-mixing detected: ${codeMix.mixPattern} (${codeMix.languages.map(l => `${l.language}:${l.percentage}%`).join(", ")})`);
    }
    const l1 = detectUnicode(text);
    if (l1) { console.log(`  L1 Unicode        ✅ ${l1.language} (100%)`); votes.push(l1); }
    else       console.log(`  L1 Unicode        — no native script detected`);
    const l5 = analyzeWordsDeep(text);
    if (l5.dominantLang) {
        console.log(`  L5 WordAnalysis   ✅ ${l5.dominantLang} (${l5.confidence}%) — ${l5.coveredWords}/${l5.totalWords} words matched`);
        votes.push({ language: l5.language, confidence: l5.confidence, method: l5.method, weight: 2 });
    } else {
        console.log(`  L5 WordAnalysis   — insufficient matches`);
    }
    const l3 = detectNgram(text);
    if (l3) { l3.weight = 1; console.log(`  L3 N-gram         ✅ ${l3.language} (${l3.confidence}%)`); votes.push(l3); }
    const l4 = detectFranc(text);
    if (l4) { l4.weight = 1; console.log(`  L4 Franc          ✅ ${l4.language} (${l4.method})`); votes.push(l4); }
    const activeModels = [];
    console.log(`  Firing AI layers in parallel...`);
    const groqPromises = GROQ_MODELS.map(({ id, label, weight }, idx) =>
        detectGroqModel(id, label, weight, text, idx * 300)
    );
    activeModels.push(detectHuggingFace(text));
    activeModels.push(...groqPromises);
    activeModels.push(detectClaude(text));
    activeModels.push(detectGemini(text));
    if (MISTRAL_API_KEY) activeModels.push(detectMistral(text));
    const aiResults = await Promise.all(activeModels);
    for (const r of aiResults) { if (r) votes.push(r); }
    const hfResult = aiResults[0];
    const groqResults = aiResults.slice(1, 1 + GROQ_MODELS.length);
    if (!votes.length) return {
        language: "English", confidence: 0, method: "no-votes",
        scoreMap: {}, activeCount: 0, allVotes: [], wordAnalysis: l5,
        codeMixed: false, mixedLanguages: [], mixPattern: "Unknown",
    };
    const scoreMap = {}, countMap = {};
    for (const v of votes) {
        if (!v.language) continue;
        scoreMap[v.language] = (scoreMap[v.language] || 0) + (v.confidence / 100) * v.weight;
        countMap[v.language] = (countMap[v.language] || 0) + 1;
    }
    if (l1 && l5.dominantLang && l1.language === l5.dominantLang) {
        scoreMap[l1.language] = (scoreMap[l1.language] || 0) + 2;
        console.log(`  ⚡ L1+L5 consensus bonus → +2 for ${l1.language}`);
    }
    for (const r of aiResults) {
        if (r?.isCodeMixed) {
            codeMix.isCodeMixed = true;
            if (r.secondaryLanguage) {
                const found = codeMix.languages.find(l => l.language === r.secondaryLanguage);
                if (!found) codeMix.languages.push({ language: r.secondaryLanguage, percentage: 15 });
            }
        }
    }
    const sorted   = Object.entries(scoreMap).sort((a, b) => b[1] - a[1]);
    const winner   = sorted[0][0];
    const winScore = sorted[0][1];
    const totalScore = sorted.reduce((s, [, v]) => s + v, 0) || 1;
    const winVotes = countMap[winner];
    const totalVotes = votes.length;
    const voteRatio = winVotes / totalVotes;
    const scoreRatio = winScore / totalScore;
    const margin = sorted.length > 1 ? (winScore - sorted[1][1]) / winScore : 1;
    let finalConf = Math.round(40 + voteRatio * 28 + scoreRatio * 20 + margin * 12);
    if (voteRatio >= 0.60) finalConf += 3;
    if (voteRatio >= 0.75) finalConf += 3;
    if (voteRatio >= 0.85) finalConf += 2;
    if (l1 && l1.language === winner) finalConf += 2;
    const disambiguatedLangs = new Set([...Object.keys(DEVANAGARI_DISAMBIG), ...Object.keys(BENGALI_DISAMBIG)]);
    if (l1 && disambiguatedLangs.has(l1.language) && l1.language === winner) finalConf += 3;
    if (l1 && l5.language && l5.language === l1.language && l1.language === winner) finalConf += 2;
    finalConf = Math.min(99, finalConf);
    if (codeMix.isCodeMixed && sorted.length > 1) {
        finalConf = Math.max(finalConf - 2, Math.round(finalConf * 0.98));
        const aiVotes = votes.filter(v => v.method && /^L(6|7|8|11|12|13|14)/.test(v.method));
        const aiWinVotes = aiVotes.filter(v => v.language === winner).length;
        if (aiVotes.length >= 5 && aiWinVotes / aiVotes.length >= 0.75) {
            finalConf = Math.max(finalConf, 95);
        }
    }
    console.log(`\n  🏆 WINNER: ${winner} — ${countMap[winner]}/${votes.length} votes, confidence ${finalConf}%`);
    if (codeMix.isCodeMixed) {
        console.log(`  🔀 Mixed: ${codeMix.mixPattern}`);
    }
    return {
        language      : winner,
        confidence    : finalConf,
        method        : `${votes.length}-layer-fusion`,
        activeCount   : votes.length,
        codeMixed     : codeMix.isCodeMixed,
        mixedLanguages: codeMix.languages,
        mixPattern    : codeMix.mixPattern,
        codeSegments  : codeMix.isCodeMixed ? codeMix.segments : [],
        scoreMap      : Object.fromEntries(sorted.slice(0, 12)),
        voteCounts    : countMap,
        allVotes      : votes,
        wordAnalysis  : l5,
    };
}
const DEPARTMENT_REGISTRY = {
    "Water Supply & Sanitation": { officialName: "Department of Water Supply & Sanitation", nodalOfficer: "Executive Engineer, Water Works Division", escalationChain: ["Junior Engineer","Assistant Engineer","Executive Engineer","Superintending Engineer","Chief Engineer"], slaHours: {CRITICAL: 4, HIGH: 12, MEDIUM: 48, LOW: 120}, portalRef: "Jal Shakti Abhiyan Portal", referenceAct: "Water (Prevention & Control of Pollution) Act, 1974" },
    "Electricity & Power": { officialName: "State Electricity Distribution Company (DISCOM)", nodalOfficer: "Assistant Divisional Engineer, DISCOM", escalationChain: ["Lineman","Junior Engineer","ADE","Divisional Engineer","Superintending Engineer"], slaHours: {CRITICAL: 2, HIGH: 6, MEDIUM: 24, LOW: 72}, portalRef: "Vidyut Sahayogi Portal", referenceAct: "Electricity Act, 2003" },
    "Roads & Infrastructure": { officialName: "Public Works Department / Municipal Corporation", nodalOfficer: "Junior Engineer, Roads Division", escalationChain: ["Ward Engineer","Junior Engineer","Assistant Engineer","Executive Engineer"], slaHours: {CRITICAL: 6, HIGH: 24, MEDIUM: 72, LOW: 240}, portalRef: "PMGSY Portal", referenceAct: "National Highways Act, 1956" },
    "Public Health & Hospitals": { officialName: "District Health & Family Welfare Department", nodalOfficer: "Chief Medical Officer / District Health Officer", escalationChain: ["ASHA/ANM","PHC Medical Officer","CHC In-charge","Civil Surgeon","CMO"], slaHours: {CRITICAL: 1, HIGH: 4, MEDIUM: 24, LOW: 72}, portalRef: "NHM Grievance Portal", referenceAct: "Clinical Establishments Act, 2010" },
    "Police & Law Enforcement": { officialName: "District Police / State Police Department", nodalOfficer: "Station House Officer (SHO)", escalationChain: ["Beat Officer","SHO","Circle Inspector","DSP","SP"], slaHours: {CRITICAL: 1, HIGH: 2, MEDIUM: 12, LOW: 48}, portalRef: "Citizen Cop Portal", referenceAct: "Code of Criminal Procedure, 1973" },
    "Municipal Solid Waste": { officialName: "Urban Local Body / Municipal Corporation", nodalOfficer: "Sanitary Inspector / Health Officer", escalationChain: ["Safai Karmachari Supervisor","Sanitary Inspector","Health Officer","Commissioner"], slaHours: {CRITICAL: 6, HIGH: 12, MEDIUM: 48, LOW: 96}, portalRef: "Swachh Bharat Mission Portal", referenceAct: "Solid Waste Management Rules, 2016" },
    "Education": { officialName: "Department of School Education", nodalOfficer: "Block Education Officer (BEO)", escalationChain: ["School HM","BEO","DIET Principal","DEO","Joint Director"], slaHours: {CRITICAL: 12, HIGH: 48, MEDIUM: 120, LOW: 240}, portalRef: "Shaala Darpan Portal", referenceAct: "Right to Education Act, 2009" },
    "Revenue & Land Records": { officialName: "District Collectorate / Revenue Department", nodalOfficer: "Tehsildar / Revenue Inspector", escalationChain: ["Patwari","Revenue Inspector","Tehsildar","SDM","District Collector"], slaHours: {CRITICAL: 24, HIGH: 72, MEDIUM: 168, LOW: 336}, portalRef: "Bhu-Naksha Portal", referenceAct: "Land Acquisition Act, 2013" },
    "Transport & Traffic": { officialName: "State Transport Department / Traffic Police", nodalOfficer: "Regional Transport Officer (RTO) / Traffic DSP", escalationChain: ["Traffic Constable","Traffic SI","Traffic Inspector","Traffic DSP","SP Traffic"], slaHours: {CRITICAL: 2, HIGH: 6, MEDIUM: 24, LOW: 72}, portalRef: "Parivahan Sewa Portal", referenceAct: "Motor Vehicles Act, 1988" },
    "General Administration": { officialName: "District Collectorate / General Administration", nodalOfficer: "Revenue Divisional Officer / Tehsildar", escalationChain: ["Front Desk Officer","Section Officer","Deputy Collector","Additional Collector","District Collector"], slaHours: {CRITICAL: 12, HIGH: 48, MEDIUM: 120, LOW: 240}, portalRef: "CPGRAMS Portal", referenceAct: "Administrative Tribunals Act, 1985" },
};
async function reverseGeocode(lat, lon) {
    return new Promise((resolve) => {
        const options = {
            hostname : "nominatim.openstreetmap.org",
            path     : `/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
            headers  : { "User-Agent": "JanVaani_v11" },
        };
        https.get(options, (res) => {
            let raw = "";
            res.on("data", c => raw += c);
            res.on("end", () => {
                try {
                    const d = JSON.parse(raw);
                    resolve({
                        fullAddress : d.display_name || "Unknown",
                        city        : d.address?.city || d.address?.town || d.address?.village || "",
                        district    : d.address?.county || d.address?.state_district || "",
                        state       : d.address?.state || "",
                        pincode     : d.address?.postcode || "",
                    });
                } catch { resolve({ fullAddress: "Parse Failed", city: "", district: "", state: "", pincode: "" }); }
            });
        }).on("error", () => resolve({ fullAddress: "Network Error", city: "", district: "", state: "", pincode: "" }));
    });
}
async function operatorSynthesisAgent({ text, langResult, geoData, citizenName, citizenPhone, preDept }) {
    const deptList = Object.keys(DEPARTMENT_REGISTRY).join(", ");
    const locStr   = geoData
        ? `${geoData.city}${geoData.district ? ", " + geoData.district : ""}, ${geoData.state}`
        : "Location not captured";
    const citStr   = [
        citizenName  ? `Name: ${citizenName}`  : null,
        citizenPhone ? `Phone: ${citizenPhone}` : null,
    ].filter(Boolean).join(" | ") || "Not recorded";
    const wordSummary = langResult.wordAnalysis
        ? `Word analysis: ${langResult.wordAnalysis.coveredWords}/${langResult.wordAnalysis.totalWords} words matched (${langResult.wordAnalysis.language})`
        : "";
    const mixInfo = langResult.codeMixed
        ? `⚠️ Code-mixed text detected: ${langResult.mixPattern} (${langResult.mixedLanguages.map(l => `${l.language}:${l.percentage}%`).join(", ")})`
        : "";
    const scriptLang = langResult.codeMixed && langResult.mixedLanguages.length > 0
        ? langResult.mixedLanguages[0].language
        : langResult.language;
    const systemPrompt = `You are the AI core of JanVaani — a government operator grievance filing system.
Operators file grievances ON BEHALF of citizens. Output is INTERNAL.
NEVER tell the citizen to go anywhere or do anything.
The system supports ALL languages worldwide. The citizen may speak in any language or mix multiple languages.
DEPARTMENTS: ${deptList}
SEVERITY: CRITICAL=life danger, HIGH=major disruption, MEDIUM=inconvenience, LOW=minor.`;
    const userPrompt = `INTAKE:
Citizen: ${citStr}
Location: ${locStr}
Language: ${langResult.language} (${langResult.confidence}%)
${mixInfo}
${wordSummary}
Pre-assigned: ${preDept && preDept !== "Auto" ? preDept : "Auto-detect"}
Text: "${text}"
Return JSON:
{
  "department": "<exact name from list>",
  "nodalOfficerToNotify": "<officer title>",
  "severity": "<CRITICAL|HIGH|MEDIUM|LOW>",
  "severityReason": "<one sentence>",
  "formalGrievanceText": "<3-4 sentence formal English, third person, include location>",
  "operatorScript": "<2-3 sentences in ${scriptLang}, confirm filed, give ticket [TICKET_ID], promise resolution>",
  "portalToLog": "<portal name>",
  "referenceAct": "<relevant act>",
  "interDeptCoordination": "<other depts or None>",
  "logic": "<2 sentences explaining classification>",
  "suggestedFollowUpDate": "<ISO date 7 days from now>",
  "citizenActionNeeded": "<any document/info citizen must provide or None>"
}`;
    try {
        console.log(`  🧠 Synthesis: trying Kimi-K2...`);
        const res = await withTimeout(
            groq.chat.completions.create({
                model: "moonshotai/kimi-k2-instruct",
                response_format: { type: "json_object" },
                temperature: 0.2,
                max_tokens: 2500,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user",   content: userPrompt },
                ],
            }),
            25000, "Kimi-Synthesis"
        );
        const raw = (res.choices[0]?.message?.content || "").replace(/```json|```/gi, "").trim();
        const parsed = JSON.parse(raw);
        console.log(`  🧠 Synthesis: Kimi-K2 ✅`);
        parsed._synthesisModel = "kimi-k2-instruct";
        return parsed;
    } catch (e) { console.log(`  🧠 Synthesis: Kimi-K2 ❌ ${e.message.slice(0, 60)} — falling back`); }
    try {
        console.log(`  💡 Synthesis: trying Qwen3-32B...`);
        const res = await withTimeout(
            groq.chat.completions.create({
                model: "qwen/qwen3-32b",
                response_format: { type: "json_object" },
                temperature: 0.2,
                max_tokens: 2500,
                messages: [
                    { role: "system", content: systemPrompt + " /no_think" },
                    { role: "user",   content: userPrompt },
                ],
            }),
            25000, "Qwen3-Synthesis"
        );
        const raw = (res.choices[0]?.message?.content || "").replace(/<think>[\s\S]*?<\/think>/gi, "").replace(/```json|```/gi, "").trim();
        const parsed = JSON.parse(raw);
        console.log(`  💡 Synthesis: Qwen3-32B ✅`);
        parsed._synthesisModel = "qwen3-32b";
        return parsed;
    } catch (e) { console.log(`  💡 Synthesis: Qwen3-32B ❌ ${e.message.slice(0, 60)} — falling back`); }
    console.log(`  ⚡ Synthesis: using Groq Llama-4-Scout...`);
    const res = await groq.chat.completions.create({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens : 2000,
        messages   : [
            { role: "system", content: systemPrompt },
            { role: "user",   content: userPrompt },
        ],
    });
    const parsed = JSON.parse(res.choices[0].message.content);
    parsed._synthesisModel = "groq-llama4-scout";
    return parsed;
}
app.post("/analyze", async (req, res) => {
    const { text, location, citizenName, citizenPhone, department: preDept, evidence } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: "No grievance text provided." });
    const startTime = Date.now();
    const ticketId  = `JV-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    console.log(`\n${"─".repeat(65)}\n📋 [${ticketId}] "${text.slice(0, 70)}…"`);
    try {
        const langResult = await detectLanguage(text);
        let geoData = null, lat = null, lon = null;
        if (typeof location === "string" && location.includes(",")) {
            const parts = location.split(",").map(Number);
            if (!isNaN(parts[0]) && !isNaN(parts[1])) {
                lat = parts[0]; lon = parts[1];
                geoData = await reverseGeocode(lat, lon);
                console.log(`📍 ${geoData.city}, ${geoData.state}`);
            }
        }
        const ai = await operatorSynthesisAgent({ text, langResult, geoData, citizenName, citizenPhone, preDept });
        if (ai.operatorScript) ai.operatorScript = ai.operatorScript.replace(/\[TICKET_ID\]/g, ticketId);
        const deptReg         = DEPARTMENT_REGISTRY[ai.department] || {};
        const slaDeadline     = getSLADeadline(ai.department, ai.severity);
        const escalationChain = deptReg.escalationChain || [];
        const elapsed         = ((Date.now() - startTime) / 1000).toFixed(2);
        const istTimestamp    = getIST();
        const saveTransaction = db.transaction(() => {
            insertTicket.run({
                ticket_id           : ticketId,
                created_at_ist      : istTimestamp,
                citizen_name        : citizenName  || null,
                citizen_phone       : citizenPhone || null,
                raw_text            : text,
                token_count         : text.split(/\s+/).filter(Boolean).length,
                latitude            : lat,
                longitude           : lon,
                full_address        : geoData?.fullAddress || null,
                city                : geoData?.city     || null,
                district            : geoData?.district || null,
                state               : geoData?.state    || null,
                pincode             : geoData?.pincode  || null,
                detected_language   : langResult.language,
                language_confidence : langResult.confidence,
                detection_method    : langResult.method,
                active_layers       : langResult.activeCount,
                language_scores     : JSON.stringify(langResult.scoreMap || {}),
                word_analysis       : JSON.stringify({
                    totalWords   : langResult.wordAnalysis?.totalWords || 0,
                    coveredWords : langResult.wordAnalysis?.coveredWords || 0,
                    topLang      : langResult.wordAnalysis?.language || null,
                    topMatches   : (langResult.wordAnalysis?.wordMatches || []).slice(0, 20),
                }),
                department          : ai.department,
                official_dept_name  : deptReg.officialName || ai.department,
                severity            : ai.severity,
                severity_reason     : ai.severityReason    || null,
                nodal_officer       : ai.nodalOfficerToNotify || deptReg.nodalOfficer || null,
                portal_to_log       : ai.portalToLog       || deptReg.portalRef || null,
                reference_act       : ai.referenceAct      || deptReg.referenceAct || null,
                inter_dept          : ai.interDeptCoordination || null,
                formal_grievance    : ai.formalGrievanceText  || null,
                operator_script     : ai.operatorScript    || null,
                sla_deadline        : slaDeadline,
                processing_seconds  : parseFloat(elapsed),
                escalation_chain    : JSON.stringify(escalationChain),
            });
            insertUpdate.run({
                ticket_id  : ticketId,
                status     : "OPEN",
                note       : `Ticket filed via operator portal. Dept: ${ai.department}. Severity: ${ai.severity}.`,
                updated_by : "system",
                is_public  : 1,
            });
            for (const vote of (langResult.allVotes || [])) {
                if (vote.language) {
                    insertVote.run({
                        ticket_id  : ticketId,
                        layer      : vote.method || "unknown",
                        voted_lang : vote.language,
                        confidence : vote.confidence || 0,
                        weight     : vote.weight || 1,
                    });
                }
            }
            const topMatches = (langResult.wordAnalysis?.wordMatches || []).slice(0, 30);
            for (const wm of topMatches) {
                if (wm.word && !wm.word.startsWith("[")) {
                    insertWord.run({
                        ticket_id   : ticketId,
                        word        : wm.word,
                        matched_lang: wm.lang,
                        match_type  : wm.method,
                        score       : wm.score,
                    });
                }
            }
        });
        saveTransaction();
        console.log(`✅ [${ticketId}] ${elapsed}s | ${langResult.language} (${langResult.confidence}%) | ${ai.severity} | ${ai.department}`);
        console.log(`${"─".repeat(65)}\n`);
        return res.json({
            ticketId,
            timestamp              : istTimestamp,
            processingTimeSeconds  : elapsed,
            citizenName            : citizenName  || null,
            citizenPhone           : citizenPhone || null,
            humanReadableAddress   : geoData?.fullAddress || "Not captured",
            city: geoData?.city || "", district: geoData?.district || "",
            state: geoData?.state || "", pincode: geoData?.pincode || "",
            detectedLanguage       : langResult.language,
            languageConfidence     : langResult.confidence,
            detectionMethod        : langResult.method,
            activeDetectionLayers  : langResult.activeCount,
            codeMixed              : langResult.codeMixed || false,
            mixedLanguages         : langResult.mixedLanguages || [],
            mixPattern             : langResult.mixPattern || null,
            languageScores         : langResult.scoreMap || {},
            voteCounts             : langResult.voteCounts || {},
            wordAnalysis           : {
                totalWords   : langResult.wordAnalysis?.totalWords || 0,
                coveredWords : langResult.wordAnalysis?.coveredWords || 0,
                topLanguage  : langResult.wordAnalysis?.language || null,
                coverage     : langResult.wordAnalysis?.totalWords
                    ? Math.round((langResult.wordAnalysis.coveredWords / langResult.wordAnalysis.totalWords) * 100)
                    : 0,
            },
            tokenCount             : text.split(/\s+/).filter(Boolean).length,
            department             : ai.department,
            officialDeptName       : deptReg.officialName || ai.department,
            nodalOfficerToNotify   : ai.nodalOfficerToNotify || deptReg.nodalOfficer,
            severity               : ai.severity,
            severityReason         : ai.severityReason,
            formalGrievanceText    : ai.formalGrievanceText,
            operatorScript         : ai.operatorScript,
            portalToLog            : ai.portalToLog || deptReg.portalRef,
            referenceAct           : ai.referenceAct || deptReg.referenceAct,
            interDeptCoordination  : ai.interDeptCoordination,
            logic                  : ai.logic,
            suggestedFollowUpDate  : ai.suggestedFollowUpDate,
            citizenActionNeeded    : ai.citizenActionNeeded,
            synthesisModel         : ai._synthesisModel || "groq-llama4-scout",
            slaDeadline,
            escalationChain,
        });
    } catch (err) {
        console.error(`❌ [${ticketId}]:`, err.message);
        return res.status(500).json({ error: "Pipeline Failed", ticketId, detail: err.message });
    }
});
app.get("/tickets", (req, res) => {
    try {
        const {
            dept, severity, status, language, state, city,
            limit = 50, offset = 0, search,
            sort = "created_at", order = "DESC",
            from_date, to_date,
        } = req.query;
        const where = [], params = [];
        if (dept)      { where.push("department = ?");        params.push(dept); }
        if (severity)  { where.push("severity = ?");          params.push(severity); }
        if (status)    { where.push("sla_status = ?");        params.push(status); }
        if (language)  { where.push("detected_language = ?"); params.push(language); }
        if (state)     { where.push("state = ?");             params.push(state); }
        if (city)      { where.push("city LIKE ?");           params.push(`%${city}%`); }
        if (from_date) { where.push("date(created_at) >= ?"); params.push(from_date); }
        if (to_date)   { where.push("date(created_at) <= ?"); params.push(to_date); }
        if (search) {
            where.push("(raw_text LIKE ? OR citizen_name LIKE ? OR city LIKE ? OR ticket_id LIKE ?)");
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }
        const SAFE_SORT  = ["created_at","severity","sla_status","department","detected_language","processing_seconds"];
        const SAFE_ORDER = ["ASC","DESC"];
        const sortCol    = SAFE_SORT.includes(sort)  ? sort  : "created_at";
        const sortDir    = SAFE_ORDER.includes(order.toUpperCase()) ? order.toUpperCase() : "DESC";
        const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
        const total = db.prepare(`SELECT COUNT(*) as c FROM tickets ${whereClause}`).get(...params).c;
        const rows  = db.prepare(`
            SELECT ticket_id, created_at, created_at_ist, citizen_name, citizen_phone,
                   city, state, detected_language, language_confidence,
                   department, official_dept_name, severity, sla_status,
                   sla_deadline, processing_seconds, last_updated_at, last_updated_by
            FROM tickets ${whereClause}
            ORDER BY ${sortCol} ${sortDir}
            LIMIT ? OFFSET ?
        `).all(...params, parseInt(limit), parseInt(offset));
        res.json({
            total,
            limit   : parseInt(limit),
            offset  : parseInt(offset),
            pages   : Math.ceil(total / parseInt(limit)),
            tickets : rows,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get("/tickets/:id", (req, res) => {
    try {
        const ticket = db.prepare("SELECT * FROM tickets WHERE ticket_id = ?").get(req.params.id.toUpperCase());
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });
        const updates    = db.prepare("SELECT * FROM ticket_updates WHERE ticket_id = ? ORDER BY updated_at DESC").all(req.params.id.toUpperCase());
        const votes      = db.prepare("SELECT * FROM language_votes WHERE ticket_id = ?").all(req.params.id.toUpperCase());
        const wordDets   = db.prepare("SELECT * FROM word_detections WHERE ticket_id = ? LIMIT 40").all(req.params.id.toUpperCase());
        ticket.language_scores  = safeJSON(ticket.language_scores  || "{}");
        ticket.escalation_chain = safeJSON(ticket.escalation_chain || "[]");
        ticket.word_analysis    = safeJSON(ticket.word_analysis    || "{}");
        res.json({ ...ticket, statusHistory: updates, languageVotes: votes, wordDetections: wordDets });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.patch("/tickets/:id/status", (req, res) => {
    const { id } = req.params;
    const { status, note, updated_by, is_public = true } = req.body;
    const VALID_STATUSES = ["OPEN","IN_PROGRESS","RESOLVED","ESCALATED","CLOSED","ON_HOLD","REOPENED"];
    if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
            error          : `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
            validStatuses  : VALID_STATUSES,
        });
    }
    try {
        const ticket = db.prepare("SELECT ticket_id, sla_status FROM tickets WHERE ticket_id = ?").get(id.toUpperCase());
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });
        const prevStatus = ticket.sla_status;
        const nowIST     = getIST();
        const updater    = updated_by || "developer";
        db.prepare(`
            UPDATE tickets
            SET sla_status = ?, last_updated_at = ?, last_updated_by = ?
            WHERE ticket_id = ?
        `).run(status, nowIST, updater, id.toUpperCase());
        insertUpdate.run({
            ticket_id  : id.toUpperCase(),
            status,
            note       : note || `Status changed from ${prevStatus} to ${status}`,
            updated_by : updater,
            is_public  : is_public ? 1 : 0,
        });
        console.log(`🔄 [${id.toUpperCase()}] ${prevStatus} → ${status} by ${updater}`);
        res.json({
            success     : true,
            ticketId    : id.toUpperCase(),
            prevStatus,
            newStatus   : status,
            updatedAt   : nowIST,
            updatedBy   : updater,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.post("/tickets/:id/notes", (req, res) => {
    const { id } = req.params;
    const { note, updated_by, is_public = false } = req.body;
    if (!note?.trim()) return res.status(400).json({ error: "Note text is required." });
    try {
        const ticket = db.prepare("SELECT ticket_id, sla_status FROM tickets WHERE ticket_id = ?").get(id.toUpperCase());
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });
        insertUpdate.run({
            ticket_id  : id.toUpperCase(),
            status     : ticket.sla_status,
            note       : note.trim(),
            updated_by : updated_by || "developer",
            is_public  : is_public ? 1 : 0,
        });
        res.json({ success: true, ticketId: id.toUpperCase(), note: note.trim() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get("/stats", (req, res) => {
    try {
        const total        = db.prepare("SELECT COUNT(*) as c FROM tickets").get().c;
        const today        = db.prepare("SELECT COUNT(*) as c FROM tickets WHERE date(created_at) = date('now')").get().c;
        const thisWeek     = db.prepare("SELECT COUNT(*) as c FROM tickets WHERE created_at >= datetime('now', '-7 days')").get().c;
        const bySeverity   = db.prepare("SELECT severity, COUNT(*) as count FROM tickets GROUP BY severity ORDER BY count DESC").all();
        const byDept       = db.prepare("SELECT department, COUNT(*) as count FROM tickets GROUP BY department ORDER BY count DESC").all();
        const byLang       = db.prepare("SELECT detected_language, COUNT(*) as count FROM tickets GROUP BY detected_language ORDER BY count DESC").all();
        const byStatus     = db.prepare("SELECT sla_status, COUNT(*) as count FROM tickets GROUP BY sla_status").all();
        const byState      = db.prepare("SELECT state, COUNT(*) as count FROM tickets WHERE state != '' GROUP BY state ORDER BY count DESC LIMIT 10").all();
        const avgTime      = db.prepare("SELECT ROUND(AVG(processing_seconds), 2) as avg FROM tickets").get().avg;
        const recent10     = db.prepare(`
            SELECT ticket_id, created_at_ist, department, severity,
                   detected_language, city, sla_status, citizen_name
            FROM tickets ORDER BY created_at DESC LIMIT 10
        `).all();
        const criticalOpen = db.prepare("SELECT COUNT(*) as c FROM tickets WHERE severity = 'CRITICAL' AND sla_status NOT IN ('RESOLVED','CLOSED')").get().c;
        const overdueCount = db.prepare(`
            SELECT COUNT(*) as c FROM tickets
            WHERE sla_status NOT IN ('RESOLVED','CLOSED')
            AND sla_deadline IS NOT NULL
        `).get().c;
        const langAccuracy = db.prepare("SELECT AVG(language_confidence) as avg FROM tickets WHERE language_confidence > 0").get().avg;
        res.json({
            summary: {
                total, today, thisWeek,
                criticalOpen, overdueCount,
                avgProcessingSeconds : avgTime,
                avgLanguageConfidence: Math.round(langAccuracy || 0),
            },
            bySeverity, byDepartment: byDept, byLanguage: byLang,
            byStatus, byState, recentTickets: recent10,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get("/tickets/:id/word-analysis", (req, res) => {
    try {
        const ticket = db.prepare(
            "SELECT ticket_id, raw_text, detected_language, word_analysis FROM tickets WHERE ticket_id = ?"
        ).get(req.params.id.toUpperCase());
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });
        const wordDets   = db.prepare("SELECT * FROM word_detections WHERE ticket_id = ?").all(req.params.id.toUpperCase());
        const wordByLang = {};
        const wordByType = {};
        for (const w of wordDets) {
            wordByLang[w.matched_lang] = (wordByLang[w.matched_lang] || []).concat(w.word);
            wordByType[w.match_type]   = (wordByType[w.match_type]   || 0) + 1;
        }
        const liveAnalysis = analyzeWordsDeep(ticket.raw_text || "");
        res.json({
            ticketId         : ticket.ticket_id,
            detectedLanguage : ticket.detected_language,
            storedAnalysis   : safeJSON(ticket.word_analysis || "{}"),
            wordsByLanguage  : wordByLang,
            wordsByMatchType : wordByType,
            totalWordDets    : wordDets.length,
            liveAnalysis     : {
                totalWords   : liveAnalysis.totalWords,
                coveredWords : liveAnalysis.coveredWords,
                topLanguage  : liveAnalysis.language,
                langScores   : liveAnalysis.langScores,
                sampleMatches: (liveAnalysis.wordMatches || []).slice(0, 25),
            },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.post("/detect-language", async (req, res) => {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: "text is required" });
    try {
        const wordAnalysis = analyzeWordsDeep(text);
        const l1  = detectUnicode(text);
        const l3  = detectNgram(text);
        const l4  = detectFranc(text);
        const codeMix = detectCodeMixing(text);
        res.json({
            wordAnalysis : {
                totalWords   : wordAnalysis.totalWords,
                coveredWords : wordAnalysis.coveredWords,
                topLanguage  : wordAnalysis.language,
                confidence   : wordAnalysis.confidence,
                langScores   : wordAnalysis.langScores,
                matches      : (wordAnalysis.wordMatches || []).slice(0, 20),
            },
            codeMixing: {
                isCodeMixed      : codeMix.isCodeMixed,
                mixPattern       : codeMix.mixPattern,
                languages        : codeMix.languages,
                dominantLanguage : codeMix.dominantLanguage,
                segments         : codeMix.segments,
            },
            layers: {
                L1_unicode   : l1,
                L3_ngram     : l3,
                L4_franc     : l4,
                L5_wordLevel : { language: wordAnalysis.language, confidence: wordAnalysis.confidence },
            },
            supportedLanguages: Object.keys(WORD_DICT).length,
            supportedScripts: UNICODE_RANGES.length,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get("/developer/dashboard", (req, res) => {
    try {
        const tickets = db.prepare(`
            SELECT ticket_id, created_at_ist, citizen_name, citizen_phone,
                   city, state, detected_language, language_confidence,
                   department, severity, sla_status, sla_deadline,
                   processing_seconds, last_updated_at, last_updated_by,
                   raw_text
            FROM tickets ORDER BY created_at DESC LIMIT 100
        `).all();
        const statusCounts   = db.prepare("SELECT sla_status, COUNT(*) as c FROM tickets GROUP BY sla_status").all();
        const langCounts     = db.prepare("SELECT detected_language, COUNT(*) as c FROM tickets GROUP BY detected_language ORDER BY c DESC").all();
        const severityCounts = db.prepare("SELECT severity, COUNT(*) as c FROM tickets GROUP BY severity").all();
        const total          = db.prepare("SELECT COUNT(*) as c FROM tickets").get().c;
        const avgConf        = db.prepare("SELECT ROUND(AVG(language_confidence),1) as a FROM tickets").get().a;
        res.json({
            meta: {
                total, avgLanguageConfidence: avgConf,
                generatedAt: getIST(),
            },
            statusCounts, langCounts, severityCounts, tickets,
            validStatuses: ["OPEN","IN_PROGRESS","RESOLVED","ESCALATED","CLOSED","ON_HOLD","REOPENED"],
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.delete("/tickets/:id", (req, res) => {
    const { reason, deleted_by } = req.body || {};
    const id = req.params.id.toUpperCase();
    try {
        const ticket = db.prepare("SELECT ticket_id FROM tickets WHERE ticket_id = ?").get(id);
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });
        const nowIST = getIST();
        db.prepare("UPDATE tickets SET sla_status = ?, last_updated_at = ?, last_updated_by = ? WHERE ticket_id = ?")
          .run("CLOSED", nowIST, deleted_by || "developer", id);
        insertUpdate.run({
            ticket_id  : id,
            status     : "CLOSED",
            note       : reason || "Ticket closed by developer.",
            updated_by : deleted_by || "developer",
            is_public  : 0,
        });
        res.json({ success: true, ticketId: id, status: "CLOSED" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get("/health", (req, res) => {
    const dbStats = db.prepare("SELECT COUNT(*) as total FROM tickets").get();
    const dbSize  = (() => { try { return require("fs").statSync(DB_PATH).size; } catch { return 0; } })();
    res.json({
        status      : "ok",
        service     : "JanVaani Operator Engine v13 — LLM-First Universal",
        database    : { path: DB_PATH, totalTickets: dbStats.total, sizeBytes: dbSize },
        llmApis     : {
            groq    : { active: true,  models: [...GROQ_MODELS.map(m => m.id), "moonshotai/kimi-k2-instruct", "qwen/qwen3-32b"] },
            mistral : { active: !!MISTRAL_API_KEY, model: "mistral-large-latest" },
            huggingFace: { active: true, model: "papluca/xlm-roberta-base-language-detection" },
        },
        synthesisModel: "kimi-k2-instruct → qwen3-32b → llama-4-scout (all free via Groq)",
        departments : Object.keys(DEPARTMENT_REGISTRY).length,
        langLayers  : [
            "L1-unicode", "L3-ngram(hint)", "L4-franc(hint)", "L5-word-analysis(hint)",
            "L6-groq-llama4-scout", "L7-groq-llama3.3-70b", "L8-groq-llama3.1-8b",
            "L11-hf-xlm-roberta",
            "L12-kimi-k2-instruct",
            "L13-qwen3-32b",
            ...(MISTRAL_API_KEY ? ["L14-mistral-large"] : []),
            "code-mix-detector",
        ],
        weightHierarchy: "LLMs (6-9) >> Word Analysis (2) >> N-gram/Franc (1)",
        wordDictLanguages: Object.keys(WORD_DICT),
        unicodeScripts: UNICODE_RANGES.length,
        codeMixingSupport: true,
        francStatus : typeof franc === "function" ? "loaded" : "disabled-fallback",
        timestamp   : new Date().toISOString(),
    });
});
app.get("/admin/analytics", (req, res) => {
    try {
        const dailyCounts = db.prepare(`
            SELECT date(created_at) as day, COUNT(*) as count
            FROM tickets
            WHERE created_at >= datetime('now', '-30 days')
            GROUP BY date(created_at)
            ORDER BY day ASC
        `).all();
        const deptBreakdown = db.prepare(`
            SELECT department,
                   COUNT(*) as total,
                   SUM(CASE WHEN sla_status = 'OPEN' THEN 1 ELSE 0 END) as open,
                   SUM(CASE WHEN sla_status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress,
                   SUM(CASE WHEN sla_status = 'RESOLVED' THEN 1 ELSE 0 END) as resolved,
                   SUM(CASE WHEN sla_status = 'ESCALATED' THEN 1 ELSE 0 END) as escalated,
                   SUM(CASE WHEN sla_status = 'CLOSED' THEN 1 ELSE 0 END) as closed,
                   SUM(CASE WHEN severity = 'CRITICAL' THEN 1 ELSE 0 END) as critical,
                   SUM(CASE WHEN severity = 'HIGH' THEN 1 ELSE 0 END) as high,
                   ROUND(AVG(processing_seconds), 2) as avg_processing
            FROM tickets
            GROUP BY department
            ORDER BY total DESC
        `).all();
        const severityDist = db.prepare(`
            SELECT severity, sla_status, COUNT(*) as count
            FROM tickets
            GROUP BY severity, sla_status
            ORDER BY severity, sla_status
        `).all();
        const langDist = db.prepare(`
            SELECT detected_language, COUNT(*) as count,
                   ROUND(AVG(language_confidence), 1) as avg_confidence
            FROM tickets
            GROUP BY detected_language
            ORDER BY count DESC
        `).all();
        const stateDist = db.prepare(`
            SELECT state, COUNT(*) as count
            FROM tickets
            WHERE state IS NOT NULL AND state != ''
            GROUP BY state
            ORDER BY count DESC
            LIMIT 15
        `).all();
        const hourlyToday = db.prepare(`
            SELECT strftime('%H', created_at) as hour, COUNT(*) as count
            FROM tickets
            WHERE date(created_at) = date('now')
            GROUP BY hour
            ORDER BY hour
        `).all();
        const resolutionMetrics = db.prepare(`
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN sla_status IN ('RESOLVED','CLOSED') THEN 1 ELSE 0 END) as resolved_closed,
                SUM(CASE WHEN sla_status = 'ESCALATED' THEN 1 ELSE 0 END) as escalated,
                ROUND(AVG(CASE WHEN sla_status IN ('RESOLVED','CLOSED') THEN processing_seconds END), 2) as avg_resolution_time
            FROM tickets
        `).get();
        const recentActivity = db.prepare(`
            SELECT tu.ticket_id, tu.status, tu.note, tu.updated_by, tu.updated_at,
                   t.citizen_name, t.department, t.severity
            FROM ticket_updates tu
            JOIN tickets t ON t.ticket_id = tu.ticket_id
            ORDER BY tu.updated_at DESC
            LIMIT 20
        `).all();
        res.json({
            dailyCounts,
            deptBreakdown,
            severityDist,
            langDist,
            stateDist,
            hourlyToday,
            resolutionMetrics,
            recentActivity,
            generatedAt: getIST(),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get("/admin/departments/:dept", (req, res) => {
    try {
        const dept = decodeURIComponent(req.params.dept);
        const tickets = db.prepare(`
            SELECT ticket_id, created_at_ist, citizen_name, citizen_phone,
                   city, state, detected_language, severity, sla_status,
                   sla_deadline, processing_seconds, nodal_officer, raw_text
            FROM tickets
            WHERE department = ?
            ORDER BY created_at DESC
        `).all(dept);
        const stats = db.prepare(`
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN sla_status = 'OPEN' THEN 1 ELSE 0 END) as open,
                SUM(CASE WHEN sla_status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN sla_status = 'RESOLVED' THEN 1 ELSE 0 END) as resolved,
                SUM(CASE WHEN sla_status = 'ESCALATED' THEN 1 ELSE 0 END) as escalated,
                SUM(CASE WHEN severity = 'CRITICAL' THEN 1 ELSE 0 END) as critical,
                ROUND(AVG(processing_seconds), 2) as avg_processing
            FROM tickets
            WHERE department = ?
        `).get(dept);
        const deptInfo = DEPARTMENT_REGISTRY[dept] || {};
        res.json({ department: dept, info: deptInfo, stats, tickets });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.patch("/admin/tickets/bulk-status", (req, res) => {
    const { ticket_ids, status, note, updated_by = "admin" } = req.body;
    const VALID_STATUSES = ["OPEN","IN_PROGRESS","RESOLVED","ESCALATED","CLOSED","ON_HOLD","REOPENED"];
    if (!Array.isArray(ticket_ids) || !ticket_ids.length) {
        return res.status(400).json({ error: "ticket_ids array is required." });
    }
    if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });
    }
    try {
        const nowIST = getIST();
        const results = [];
        const bulkTransaction = db.transaction(() => {
            for (const tid of ticket_ids) {
                const ticket = db.prepare("SELECT ticket_id, sla_status FROM tickets WHERE ticket_id = ?").get(tid.toUpperCase());
                if (!ticket) { results.push({ ticket_id: tid, success: false, error: "Not found" }); continue; }
                db.prepare("UPDATE tickets SET sla_status = ?, last_updated_at = ?, last_updated_by = ? WHERE ticket_id = ?")
                  .run(status, nowIST, updated_by, tid.toUpperCase());
                insertUpdate.run({
                    ticket_id: tid.toUpperCase(),
                    status,
                    note: note || `Bulk status update to ${status}`,
                    updated_by,
                    is_public: 1,
                });
                results.push({ ticket_id: tid, success: true, prevStatus: ticket.sla_status, newStatus: status });
            }
        });
        bulkTransaction();
        res.json({ success: true, updated: results.filter(r => r.success).length, results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
const PORT = process.env.PORT || 4000;
const fs = require("fs");
const FRONTEND_BUILD = path.join(__dirname, "..", "frontend", "build");
if (fs.existsSync(FRONTEND_BUILD)) {
    app.use(express.static(FRONTEND_BUILD));
}
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "janvaani_admin_dashboard.html"));
});
if (fs.existsSync(FRONTEND_BUILD)) {
    app.get("/{*splat}", (req, res) => {
        if (req.path.startsWith("/tickets") || req.path.startsWith("/stats") ||
            req.path.startsWith("/admin") || req.path.startsWith("/health") ||
            req.path.startsWith("/analyze") || req.path.startsWith("/detect") ||
            req.path.startsWith("/developer")) {
            return res.status(404).json({ error: "Not found" });
        }
        res.sendFile(path.join(FRONTEND_BUILD, "index.html"));
    });
}
app.listen(PORT, "0.0.0.0", () => {
    const count = db.prepare("SELECT COUNT(*) as c FROM tickets").get().c;
    const langCount = Object.keys(WORD_DICT).length;
    const scriptCount = UNICODE_RANGES.length;
    const mistral = process.env.MISTRAL_API_KEY ? "active" : "no key";
    console.log(`
  JanVaani v14
  ─────────────────────────────────────────
  http://localhost:${PORT}  │  ${count} tickets  │  ${langCount} langs  │  ${scriptCount} scripts
  LLMs                               Weight
   Kimi-K2-Instruct   Groq FREE        9
   Qwen3-32B          Groq FREE        8
   Mistral Large      ${mistral.padEnd(14)}   7
   Llama-4-Scout      Groq FREE        6
   Llama-3.3-70B      Groq FREE        6
   Llama-3.1-8B       Groq FREE        4
   XLM-RoBERTa        HuggingFace      3
  Heuristics           Unicode w:10 │ Words w:2-6 │ N-gram w:1 │ Franc w:1
  Synthesis            Kimi-K2 → Qwen3 → Llama-4 (free cascade)
  Disambiguation       Devanagari(7) · Bengali(2) · Arabic(2)
  Code-mixing          enabled
  ─────────────────────────────────────────
    `);
});
