import type { ConsonantClass, Leader, Liveness, Tone, ToneMark, VowelLength, Word } from './types'

// One-syllable everyday words grouped by tone-rule branch.
// Every field is cross-checked by tests/data.test.ts against (1) the Thai spelling,
// (2) the romanization and (3) the tone engine, so a typo in any column fails the build.
// Words whose everyday pronunciation breaks the written rule (ฉัน, เขา, ก็ …) are left out on purpose.
// All entries start as "tarkistamaton"; the user ticks them verified in the app.

type Row = [thai: string, rom: string, fi: string, cls: ConsonantClass, live: Liveness, len: VowelLength, mark: ToneMark, tone: Tone, leader?: Leader]

const ROWS: Row[] = [
  // ── Keskiluokka · elävä · ei merkkiä → keski
  ['ตา', 'dtaa', 'silmä', 'mid', 'live', 'long', '', 'mid'],
  ['ดี', 'dii', 'hyvä', 'mid', 'live', 'long', '', 'mid'],
  ['ปี', 'bpii', 'vuosi', 'mid', 'live', 'long', '', 'mid'],
  ['ดู', 'duu', 'katsoa', 'mid', 'live', 'long', '', 'mid'],
  ['กิน', 'gin', 'syödä', 'mid', 'live', 'short', '', 'mid'],
  ['จาน', 'jaan', 'lautanen', 'mid', 'live', 'long', '', 'mid'],
  ['ใจ', 'jai', 'sydän, mieli', 'mid', 'live', 'short', '', 'mid'],
  ['ไป', 'bpai', 'mennä', 'mid', 'live', 'short', '', 'mid'],
  ['เอา', 'ao', 'ottaa', 'mid', 'live', 'short', '', 'mid'],
  ['ตัว', 'dtuua', 'keho; luokitin (eläimet, vaatteet)', 'mid', 'live', 'long', '', 'mid'],
  ['ปลา', 'bplaa', 'kala', 'mid', 'live', 'long', '', 'mid'],
  ['ดำ', 'dam', 'musta', 'mid', 'live', 'short', '', 'mid'],
  ['เดิน', 'dəən', 'kävellä', 'mid', 'live', 'long', '', 'mid'],

  // ── Keskiluokka · kuollut · ei merkkiä → matala
  ['ปาก', 'bpàak', 'suu', 'mid', 'dead', 'long', '', 'low'],
  ['จับ', 'jàp', 'ottaa kiinni', 'mid', 'dead', 'short', '', 'low'],
  ['ตก', 'dtòk', 'pudota', 'mid', 'dead', 'short', '', 'low'],
  ['เปิด', 'bpə̀ət', 'avata', 'mid', 'dead', 'long', '', 'low'],
  ['ออก', 'ɔ̀ɔk', 'lähteä ulos', 'mid', 'dead', 'long', '', 'low'],
  ['บอก', 'bɔ̀ɔk', 'kertoa', 'mid', 'dead', 'long', '', 'low'],
  ['เด็ก', 'dèk', 'lapsi', 'mid', 'dead', 'short', '', 'low'],
  ['จะ', 'jà', 'tulevan ajan sana (aikoa)', 'mid', 'dead', 'short', '', 'low'],
  ['แปด', 'bpɛ̀ɛt', 'kahdeksan', 'mid', 'dead', 'long', '', 'low'],
  ['เจ็ด', 'jèt', 'seitsemän', 'mid', 'dead', 'short', '', 'low'],
  ['เกาะ', 'gɔ̀', 'saari', 'mid', 'dead', 'short', '', 'low'],
  ['บาท', 'bàat', 'baht (rahayksikkö)', 'mid', 'dead', 'long', '', 'low'],
  ['กฎ', 'gòt', 'sääntö', 'mid', 'dead', 'short', '', 'low'],

  // ── Keskiluokka · ไม้เอก → matala
  ['ไก่', 'gài', 'kana', 'mid', 'live', 'short', '่', 'low'],
  ['ก่อน', 'gɔ̀ɔn', 'ennen; ensin', 'mid', 'live', 'long', '่', 'low'],
  ['แต่', 'dtɛ̀ɛ', 'mutta', 'mid', 'live', 'long', '่', 'low'],
  ['ป่า', 'bpàa', 'metsä, viidakko', 'mid', 'live', 'long', '่', 'low'],
  ['บ่าย', 'bàai', 'iltapäivä', 'mid', 'live', 'long', '่', 'low'],
  ['เก่า', 'gào', 'vanha (esine)', 'mid', 'live', 'short', '่', 'low'],
  ['เก่ง', 'gèng', 'taitava', 'mid', 'live', 'short', '่', 'low'],
  ['อ่าน', 'àan', 'lukea', 'mid', 'live', 'long', '่', 'low'],
  ['ดื่ม', 'dʉ̀ʉm', 'juoda', 'mid', 'live', 'long', '่', 'low'],
  ['กี่', 'gìi', 'kuinka monta', 'mid', 'live', 'long', '่', 'low'],

  // ── Keskiluokka · ไม้โท → laskeva
  ['ได้', 'dâai', 'voida; saada', 'mid', 'live', 'long', '้', 'falling'],
  ['บ้าน', 'bâan', 'talo, koti', 'mid', 'live', 'long', '้', 'falling'],
  ['ต้อง', 'dtɔ̂ng', 'täytyä', 'mid', 'live', 'short', '้', 'falling'],
  ['เก้า', 'gâao', 'yhdeksän', 'mid', 'live', 'long', '้', 'falling'],
  ['ป้า', 'bpâa', 'täti (vanhempaa vanhempi)', 'mid', 'live', 'long', '้', 'falling'],
  ['อ้วน', 'ûuan', 'lihava', 'mid', 'live', 'long', '้', 'falling'],
  ['ด้วย', 'dûuai', 'myös; kanssa', 'mid', 'live', 'long', '้', 'falling'],
  ['กุ้ง', 'gûng', 'katkarapu', 'mid', 'live', 'short', '้', 'falling'],
  ['แก้ว', 'gɛ̂ɛo', 'juomalasi', 'mid', 'live', 'long', '้', 'falling'],
  ['ใกล้', 'glâi', 'lähellä', 'mid', 'live', 'short', '้', 'falling'],

  // ── Keskiluokka · ไม้ตรี → korkea
  ['โต๊ะ', 'dtó', 'pöytä', 'mid', 'dead', 'short', '๊', 'high'],
  ['ก๊าซ', 'gáat', 'kaasu', 'mid', 'dead', 'long', '๊', 'high'],
  ['จ๊ะ', 'já', 'tuttavallinen partikkeli', 'mid', 'dead', 'short', '๊', 'high'],
  ['ป๊า', 'bpáa', 'isi', 'mid', 'live', 'long', '๊', 'high'],
  ['เจ๊', 'jée', 'isosisko (kiinalais-thai)', 'mid', 'live', 'long', '๊', 'high'],
  ['อุ๊ย', 'úi', 'hups!', 'mid', 'live', 'short', '๊', 'high'],

  // ── Keskiluokka · ไม้จัตวา → nouseva
  ['จ๋า', 'jǎa', 'hellä vastauspartikkeli', 'mid', 'live', 'long', '๋', 'rising'],
  ['เดี๋ยว', 'dǐiao', 'hetkinen; kohta', 'mid', 'live', 'long', '๋', 'rising'],
  ['ตั๋ว', 'dtǔua', 'lippu (matka-)', 'mid', 'live', 'long', '๋', 'rising'],
  ['เก๋', 'gěe', 'tyylikäs', 'mid', 'live', 'long', '๋', 'rising'],
  ['อ๋อ', 'ɔ̌ɔ', 'ai niin!', 'mid', 'live', 'long', '๋', 'rising'],
  ['เจ๋ง', 'jěng', 'mahtava', 'mid', 'live', 'short', '๋', 'rising'],

  // ── Korkea luokka · elävä · ei merkkiä → nouseva
  ['ขา', 'kǎa', 'jalka', 'high', 'live', 'long', '', 'rising'],
  ['สี', 'sǐi', 'väri', 'high', 'live', 'long', '', 'rising'],
  ['สาม', 'sǎam', 'kolme', 'high', 'live', 'long', '', 'rising'],
  ['สอง', 'sɔ̌ɔng', 'kaksi', 'high', 'live', 'long', '', 'rising'],
  ['ขาว', 'kǎao', 'valkoinen', 'high', 'live', 'long', '', 'rising'],
  ['ฝน', 'fǒn', 'sade', 'high', 'live', 'short', '', 'rising'],
  ['ผม', 'pǒm', 'minä (mies); hiukset', 'high', 'live', 'short', '', 'rising'],
  ['ขวา', 'kwǎa', 'oikea (suunta)', 'high', 'live', 'long', '', 'rising'],
  ['เสือ', 'sʉ̌ʉa', 'tiikeri', 'high', 'live', 'long', '', 'rising'],
  ['หัว', 'hǔua', 'pää', 'high', 'live', 'long', '', 'rising'],
  ['สวย', 'sǔuai', 'kaunis', 'high', 'live', 'long', '', 'rising'],
  ['หิว', 'hǐu', 'nälkäinen', 'high', 'live', 'short', '', 'rising'],
  ['ขอ', 'kɔ̌ɔ', 'pyytää', 'high', 'live', 'long', '', 'rising'],

  // ── Korkea luokka · kuollut · ei merkkiä → matala
  ['ผัก', 'pàk', 'vihannes', 'high', 'dead', 'short', '', 'low'],
  ['สิบ', 'sìp', 'kymmenen', 'high', 'dead', 'short', '', 'low'],
  ['ขับ', 'kàp', 'ajaa (autoa)', 'high', 'dead', 'short', '', 'low'],
  ['หก', 'hòk', 'kuusi (6)', 'high', 'dead', 'short', '', 'low'],
  ['ถูก', 'tùuk', 'halpa; oikein', 'high', 'dead', 'long', '', 'low'],
  ['สุข', 'sùk', 'onnellinen', 'high', 'dead', 'short', '', 'low'],
  ['ฝาก', 'fàak', 'jättää säilöön; tallettaa', 'high', 'dead', 'long', '', 'low'],
  ['ผิด', 'pìt', 'väärin', 'high', 'dead', 'short', '', 'low'],
  ['เผ็ด', 'pèt', 'tulinen (maku)', 'high', 'dead', 'short', '', 'low'],
  ['แขก', 'kɛ̀ɛk', 'vieras', 'high', 'dead', 'long', '', 'low'],
  ['ฉีด', 'chìit', 'ruiskuttaa, pistää', 'high', 'dead', 'long', '', 'low'],
  ['สัตว์', 'sàt', 'eläin', 'high', 'dead', 'short', '', 'low'],

  // ── Korkea luokka · ไม้เอก → matala
  ['ไข่', 'kài', 'muna', 'high', 'live', 'short', '่', 'low'],
  ['ข่าว', 'kàao', 'uutinen', 'high', 'live', 'long', '่', 'low'],
  ['ส่ง', 'sòng', 'lähettää', 'high', 'live', 'short', '่', 'low'],
  ['สี่', 'sìi', 'neljä', 'high', 'live', 'long', '่', 'low'],
  ['ใส่', 'sài', 'laittaa (päälle, sisään)', 'high', 'live', 'short', '่', 'low'],
  ['ถ่าย', 'tàai', 'ottaa (kuva)', 'high', 'live', 'long', '่', 'low'],
  ['ผ่าน', 'pàan', 'kulkea ohi', 'high', 'live', 'long', '่', 'low'],
  ['ขี่', 'kìi', 'ratsastaa, ajaa (pyörää)', 'high', 'live', 'long', '่', 'low'],
  ['ถั่ว', 'tùua', 'papu, pähkinä', 'high', 'live', 'long', '่', 'low'],

  // ── Korkea luokka · ไม้โท → laskeva
  ['ข้าว', 'kâao', 'riisi', 'high', 'live', 'long', '้', 'falling'],
  ['ห้า', 'hâa', 'viisi', 'high', 'live', 'long', '้', 'falling'],
  ['ห้อง', 'hɔ̂ng', 'huone', 'high', 'live', 'short', '้', 'falling'],
  ['ขึ้น', 'kʉ̂n', 'nousta', 'high', 'live', 'short', '้', 'falling'],
  ['ถ้า', 'tâa', 'jos', 'high', 'live', 'long', '้', 'falling'],
  ['ส้ม', 'sôm', 'appelsiini', 'high', 'live', 'short', '้', 'falling'],
  ['ผ้า', 'pâa', 'kangas', 'high', 'live', 'long', '้', 'falling'],
  ['เสื้อ', 'sʉ̂ʉa', 'paita', 'high', 'live', 'long', '้', 'falling'],
  ['สร้าง', 'sâang', 'rakentaa', 'high', 'live', 'long', '้', 'falling'],
  ['ผู้', 'pûu', 'henkilö', 'high', 'live', 'long', '้', 'falling'],

  // ── Matala luokka (pari) · elävä · ei merkkiä → keski
  ['คน', 'kon', 'ihminen', 'low', 'live', 'short', '', 'mid'],
  ['ชา', 'chaa', 'tee', 'low', 'live', 'long', '', 'mid'],
  ['ทาง', 'taang', 'tie, reitti', 'low', 'live', 'long', '', 'mid'],
  ['ฟัง', 'fang', 'kuunnella', 'low', 'live', 'short', '', 'mid'],
  ['คำ', 'kam', 'sana', 'low', 'live', 'short', '', 'mid'],
  ['ทำ', 'tam', 'tehdä', 'low', 'live', 'short', '', 'mid'],
  ['ครู', 'kruu', 'opettaja', 'low', 'live', 'long', '', 'mid'],
  ['ไฟ', 'fai', 'tuli; valo', 'low', 'live', 'short', '', 'mid'],
  ['เธอ', 'təə', 'sinä; hän (nainen)', 'low', 'live', 'long', '', 'mid'],
  ['ซอย', 'sɔɔi', 'sivukuja (soi)', 'low', 'live', 'long', '', 'mid'],
  ['ใคร', 'krai', 'kuka', 'low', 'live', 'short', '', 'mid'],
  ['ทราย', 'saai', 'hiekka', 'low', 'live', 'long', '', 'mid'],
  ['เชิญ', 'chəən', 'olkaa hyvä (kutsu)', 'low', 'live', 'long', '', 'mid'],

  // ── Matala luokka (pari) · kuollut, lyhyt → korkea
  ['คิด', 'kít', 'ajatella', 'low', 'dead', 'short', '', 'high'],
  ['ทุก', 'túk', 'jokainen', 'low', 'dead', 'short', '', 'high'],
  ['พบ', 'póp', 'tavata', 'low', 'dead', 'short', '', 'high'],
  ['ครับ', 'kráp', 'kohteliaisuussana (mies)', 'low', 'dead', 'short', '', 'high'],
  ['คะ', 'ká', 'kysymyspartikkeli (nainen)', 'low', 'dead', 'short', '', 'high'],
  ['พัก', 'pák', 'levätä', 'low', 'dead', 'short', '', 'high'],
  ['ทิศ', 'tít', 'ilmansuunta', 'low', 'dead', 'short', '', 'high'],
  ['พริก', 'prík', 'chili', 'low', 'dead', 'short', '', 'high'],
  ['เพราะ', 'prɔ́', 'koska', 'low', 'dead', 'short', '', 'high'],
  ['แพะ', 'pɛ́', 'vuohi', 'low', 'dead', 'short', '', 'high'],

  // ── Matala luokka (pari) · kuollut, pitkä → laskeva
  ['ชอบ', 'chɔ̂ɔp', 'pitää jostakin', 'low', 'dead', 'long', '', 'falling'],
  ['พูด', 'pûut', 'puhua', 'low', 'dead', 'long', '', 'falling'],
  ['ภาพ', 'pâap', 'kuva', 'low', 'dead', 'long', '', 'falling'],
  ['โชค', 'chôok', 'onni', 'low', 'dead', 'long', '', 'falling'],
  ['พืช', 'pʉ̂ʉt', 'kasvi', 'low', 'dead', 'long', '', 'falling'],
  ['เพศ', 'pêet', 'sukupuoli', 'low', 'dead', 'long', '', 'falling'],
  ['ทอด', 'tɔ̂ɔt', 'friteerata', 'low', 'dead', 'long', '', 'falling'],
  ['เชือก', 'chʉ̂ʉak', 'köysi', 'low', 'dead', 'long', '', 'falling'],
  ['เทพ', 'têep', 'jumala', 'low', 'dead', 'long', '', 'falling'],

  // ── Matala luokka (pari) · ไม้เอก → laskeva
  ['พี่', 'pîi', 'vanhempi sisarus', 'low', 'live', 'long', '่', 'falling'],
  ['ที่', 'tîi', 'paikka; -ssa', 'low', 'live', 'long', '่', 'falling'],
  ['คู่', 'kûu', 'pari', 'low', 'live', 'long', '่', 'falling'],
  ['พ่อ', 'pɔ̂ɔ', 'isä', 'low', 'live', 'long', '่', 'falling'],
  ['ช่วย', 'chûuai', 'auttaa', 'low', 'live', 'long', '่', 'falling'],
  ['ซ่อม', 'sɔ̂ɔm', 'korjata', 'low', 'live', 'long', '่', 'falling'],
  ['ค่ะ', 'kâ', 'kohteliaisuussana (nainen)', 'low', 'dead', 'short', '่', 'falling'],
  ['เที่ยว', 'tîiao', 'matkustella, huvitella', 'low', 'live', 'long', '่', 'falling'],
  ['ค่า', 'kâa', 'hinta, maksu', 'low', 'live', 'long', '่', 'falling'],
  ['ชื่อ', 'chʉ̂ʉ', 'nimi', 'low', 'live', 'long', '่', 'falling'],

  // ── Matala luokka (pari) · ไม้โท → korkea
  ['ช้าง', 'cháang', 'norsu', 'low', 'live', 'long', '้', 'high'],
  ['ซื้อ', 'sʉ́ʉ', 'ostaa', 'low', 'live', 'long', '้', 'high'],
  ['ฟ้า', 'fáa', 'taivas', 'low', 'live', 'long', '้', 'high'],
  ['ท้อง', 'tɔ́ɔng', 'vatsa', 'low', 'live', 'long', '้', 'high'],
  ['ช้า', 'cháa', 'hidas', 'low', 'live', 'long', '้', 'high'],
  ['ใช้', 'chái', 'käyttää', 'low', 'live', 'short', '้', 'high'],
  ['ทิ้ง', 'tíng', 'heittää pois', 'low', 'live', 'short', '้', 'high'],
  ['เช้า', 'cháao', 'aamu', 'low', 'live', 'long', '้', 'high'],
  ['เท้า', 'táao', 'jalkaterä', 'low', 'live', 'long', '้', 'high'],
  ['แพ้', 'pɛ́ɛ', 'hävitä; olla allerginen', 'low', 'live', 'long', '้', 'high'],

  // ── Matala luokka (yksinäinen) · elävä · ei merkkiä → keski
  ['มา', 'maa', 'tulla', 'low', 'live', 'long', '', 'mid'],
  ['งาน', 'ngaan', 'työ; juhla', 'low', 'live', 'long', '', 'mid'],
  ['ลม', 'lom', 'tuuli', 'low', 'live', 'short', '', 'mid'],
  ['เรา', 'rao', 'me', 'low', 'live', 'short', '', 'mid'],
  ['นอน', 'nɔɔn', 'nukkua', 'low', 'live', 'long', '', 'mid'],
  ['มือ', 'mʉʉ', 'käsi', 'low', 'live', 'long', '', 'mid'],
  ['วัน', 'wan', 'päivä', 'low', 'live', 'short', '', 'mid'],
  ['ยาว', 'yaao', 'pitkä', 'low', 'live', 'long', '', 'mid'],
  ['แมว', 'mɛɛo', 'kissa', 'low', 'live', 'long', '', 'mid'],
  ['เงิน', 'ngən', 'raha', 'low', 'live', 'short', '', 'mid'],
  ['ใน', 'nai', 'sisällä', 'low', 'live', 'short', '', 'mid'],
  ['เมือง', 'mʉʉang', 'kaupunki', 'low', 'live', 'long', '', 'mid'],
  ['เลย', 'ləəi', 'painotussana; siis', 'low', 'live', 'long', '', 'mid'],

  // ── Matala luokka (yksinäinen) · kuollut, lyhyt → korkea
  ['นก', 'nók', 'lintu', 'low', 'dead', 'short', '', 'high'],
  ['รถ', 'rót', 'auto', 'low', 'dead', 'short', '', 'high'],
  ['ยักษ์', 'yák', 'jättiläinen', 'low', 'dead', 'short', '', 'high'],
  ['มด', 'mót', 'muurahainen', 'low', 'dead', 'short', '', 'high'],
  ['นะ', 'ná', 'pehmentävä partikkeli', 'low', 'dead', 'short', '', 'high'],
  ['รัก', 'rák', 'rakastaa', 'low', 'dead', 'short', '', 'high'],
  ['เล็ก', 'lék', 'pieni', 'low', 'dead', 'short', '', 'high'],
  ['เงาะ', 'ngɔ́', 'rambutan', 'low', 'dead', 'short', '', 'high'],
  ['นัด', 'nát', 'sovittu tapaaminen', 'low', 'dead', 'short', '', 'high'],
  ['วัด', 'wát', 'temppeli', 'low', 'dead', 'short', '', 'high'],

  // ── Matala luokka (yksinäinen) · kuollut, pitkä → laskeva
  ['ลูก', 'lûuk', 'oma lapsi; pallo', 'low', 'dead', 'long', '', 'falling'],
  ['มาก', 'mâak', 'paljon', 'low', 'dead', 'long', '', 'falling'],
  ['โรค', 'rôok', 'sairaus', 'low', 'dead', 'long', '', 'falling'],
  ['เลข', 'lêek', 'numero', 'low', 'dead', 'long', '', 'falling'],
  ['ยาก', 'yâak', 'vaikea', 'low', 'dead', 'long', '', 'falling'],
  ['นอก', 'nɔ̂ɔk', 'ulkona', 'low', 'dead', 'long', '', 'falling'],
  ['มีด', 'mîit', 'veitsi', 'low', 'dead', 'long', '', 'falling'],
  ['เลือด', 'lʉ̂ʉat', 'veri', 'low', 'dead', 'long', '', 'falling'],
  ['โลก', 'lôok', 'maailma', 'low', 'dead', 'long', '', 'falling'],
  ['เมฆ', 'mêek', 'pilvi', 'low', 'dead', 'long', '', 'falling'],

  // ── Matala luokka (yksinäinen) · ไม้เอก → laskeva
  ['ไม่', 'mâi', 'ei', 'low', 'live', 'short', '่', 'falling'],
  ['แม่', 'mɛ̂ɛ', 'äiti', 'low', 'live', 'long', '่', 'falling'],
  ['ย่า', 'yâa', 'isän äiti', 'low', 'live', 'long', '่', 'falling'],
  ['ร่ม', 'rôm', 'sateenvarjo', 'low', 'live', 'short', '่', 'falling'],
  ['ว่า', 'wâa', 'että; sanoa', 'low', 'live', 'long', '่', 'falling'],
  ['ง่าย', 'ngâai', 'helppo', 'low', 'live', 'long', '่', 'falling'],
  ['วิ่ง', 'wîng', 'juosta', 'low', 'live', 'short', '่', 'falling'],
  ['เล่น', 'lên', 'leikkiä, pelata', 'low', 'live', 'short', '่', 'falling'],
  ['ล่ะ', 'lâ', 'entä? (partikkeli)', 'low', 'dead', 'short', '่', 'falling'],
  ['นั่ง', 'nâng', 'istua', 'low', 'live', 'short', '่', 'falling'],

  // ── Matala luokka (yksinäinen) · ไม้โท → korkea
  ['ม้า', 'máa', 'hevonen', 'low', 'live', 'long', '้', 'high'],
  ['น้ำ', 'náam', 'vesi', 'low', 'live', 'long', '้', 'high'],
  ['ไม้', 'máai', 'puu (materiaali)', 'low', 'live', 'long', '้', 'high'],
  ['น้อง', 'nɔ́ɔng', 'nuorempi sisarus', 'low', 'live', 'long', '้', 'high'],
  ['ร้อน', 'rɔ́ɔn', 'kuuma', 'low', 'live', 'long', '้', 'high'],
  ['ร้าน', 'ráan', 'kauppa, liike', 'low', 'live', 'long', '้', 'high'],
  ['เลี้ยง', 'líiang', 'kasvattaa; tarjota', 'low', 'live', 'long', '้', 'high'],
  ['รู้', 'rúu', 'tietää', 'low', 'live', 'long', '้', 'high'],
  ['แล้ว', 'lɛ́ɛo', 'jo; sitten', 'low', 'live', 'long', '้', 'high'],
  ['น้อย', 'nɔ́ɔi', 'vähän', 'low', 'live', 'long', '้', 'high'],

  // ── ห นำ · elävä · ei merkkiä → nouseva
  ['หมา', 'mǎa', 'koira', 'high', 'live', 'long', '', 'rising', 'ห'],
  ['หนู', 'nǔu', 'hiiri', 'high', 'live', 'long', '', 'rising', 'ห'],
  ['หญิง', 'yǐng', 'nainen', 'high', 'live', 'short', '', 'rising', 'ห'],
  ['ไหน', 'nǎi', 'missä; mikä', 'high', 'live', 'short', '', 'rising', 'ห'],
  ['หลาย', 'lǎai', 'monta', 'high', 'live', 'long', '', 'rising', 'ห'],
  ['หวาน', 'wǎan', 'makea', 'high', 'live', 'long', '', 'rising', 'ห'],
  ['หนาว', 'nǎao', 'kylmä (sää)', 'high', 'live', 'long', '', 'rising', 'ห'],
  ['หมอ', 'mɔ̌ɔ', 'lääkäri', 'high', 'live', 'long', '', 'rising', 'ห'],
  ['หรือ', 'rʉ̌ʉ', 'tai', 'high', 'live', 'long', '', 'rising', 'ห'],
  ['หมู', 'mǔu', 'sika, porsas', 'high', 'live', 'long', '', 'rising', 'ห'],
  ['เหนือ', 'nʉ̌ʉa', 'pohjoinen', 'high', 'live', 'long', '', 'rising', 'ห'],

  // ── ห นำ · kuollut → matala
  ['หมด', 'mòt', 'loppua', 'high', 'dead', 'short', '', 'low', 'ห'],
  ['หยุด', 'yùt', 'pysähtyä', 'high', 'dead', 'short', '', 'low', 'ห'],
  ['หมวก', 'mùuak', 'hattu', 'high', 'dead', 'long', '', 'low', 'ห'],
  ['หลับ', 'làp', 'nukahtaa', 'high', 'dead', 'short', '', 'low', 'ห'],
  ['หนัก', 'nàk', 'painava', 'high', 'dead', 'short', '', 'low', 'ห'],
  ['หยิบ', 'yìp', 'ottaa käteen', 'high', 'dead', 'short', '', 'low', 'ห'],

  // ── ห นำ · ไม้เอก → matala
  ['ใหญ่', 'yài', 'iso', 'high', 'live', 'short', '่', 'low', 'ห'],
  ['หน่อย', 'nɔ̀i', 'vähän (pyynnöissä)', 'high', 'live', 'short', '่', 'low', 'ห'],
  ['ใหม่', 'mài', 'uusi', 'high', 'live', 'short', '่', 'low', 'ห'],
  ['หนึ่ง', 'nʉ̀ng', 'yksi', 'high', 'live', 'short', '่', 'low', 'ห'],
  ['เหนื่อย', 'nʉ̀ʉai', 'väsynyt', 'high', 'live', 'long', '่', 'low', 'ห'],
  ['หนุ่ม', 'nùm', 'nuori mies', 'high', 'live', 'short', '่', 'low', 'ห'],

  // ── ห นำ · ไม้โท → laskeva
  ['หน้า', 'nâa', 'kasvot; etu-', 'high', 'live', 'long', '้', 'falling', 'ห'],
  ['ไหว้', 'wâi', 'wai-tervehdys', 'high', 'live', 'short', '้', 'falling', 'ห'],
  ['หม้อ', 'mɔ̂ɔ', 'kattila', 'high', 'live', 'long', '้', 'falling', 'ห'],
  ['หญ้า', 'yâa', 'ruoho', 'high', 'live', 'long', '้', 'falling', 'ห'],
  ['เหล้า', 'lâo', 'viina', 'high', 'live', 'short', '้', 'falling', 'ห'],

  // ── อ นำ (vain nämä neljä sanaa) → matala
  ['อย่า', 'yàa', 'älä', 'mid', 'live', 'long', '่', 'low', 'อ'],
  ['อยู่', 'yùu', 'olla jossakin; asua', 'mid', 'live', 'long', '่', 'low', 'อ'],
  ['อย่าง', 'yàang', 'laji; tavalla', 'mid', 'live', 'long', '่', 'low', 'อ'],
  ['อยาก', 'yàak', 'haluta', 'mid', 'dead', 'long', '', 'low', 'อ'],
]

export const WORDS: Word[] = ROWS.map(([thai, rom, fi, cls, live, len, mark, tone, leader]) => ({
  thai,
  rom,
  fi,
  cls,
  live,
  len,
  mark,
  tone,
  ...(leader ? { leader } : {}),
}))
