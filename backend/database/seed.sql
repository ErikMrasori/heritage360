BEGIN;

INSERT INTO roles (name)
VALUES ('admin'), ('user')
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name)
VALUES ('Historical'), ('Cultural'), ('Natural'), ('Museum')
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (full_name, email, password_hash, role_id)
SELECT
  'Heritage360 Admin',
  'admin@heritage360.local',
  '$2a$12$OJOc0RgITsyaB72ladynFeSqghWQndGGEdeyE0InJiWCbFueHYKvG',
  r.id
FROM roles r
WHERE r.name = 'admin'
  AND NOT EXISTS (
    SELECT 1
    FROM users u
    WHERE u.email = 'admin@heritage360.local'
  );

INSERT INTO locations (title, description, city, address, latitude, longitude, category_id, created_by)
SELECT
  'Kosovo Museum',
  'The national museum of Kosovo in Pristina, known for archaeology, ethnography, and history collections in a late 19th-century building.',
  'Pristina',
  'Ibrahim Lutfiu, Pristina',
  42.6656860,
  21.1662610,
  c.id,
  u.id
FROM categories c
CROSS JOIN users u
WHERE c.name = 'Museum'
  AND u.email = 'admin@heritage360.local'
  AND NOT EXISTS (
    SELECT 1
    FROM locations l
    WHERE l.title = 'Kosovo Museum'
  );

INSERT INTO locations (title, description, city, address, latitude, longitude, category_id, created_by)
SELECT
  'Prizren Fortress',
  'A hilltop fortress above the old town of Prizren, with archaeological layers spanning from prehistory through Roman, medieval, and Ottoman periods.',
  'Prizren',
  'Kalaja e Prizrenit, above the old town, Prizren',
  42.2094020,
  20.7456020,
  c.id,
  u.id
FROM categories c
CROSS JOIN users u
WHERE c.name = 'Historical'
  AND u.email = 'admin@heritage360.local'
  AND NOT EXISTS (
    SELECT 1
    FROM locations l
    WHERE l.title = 'Prizren Fortress'
  );

INSERT INTO locations (title, description, city, address, latitude, longitude, category_id, created_by)
SELECT
  'League of Prizren Complex',
  'A landmark memorial and museum complex tied to the 1878 League of Prizren, blending political history with ethnographic interpretation in the old city.',
  'Prizren',
  'Sheshi i Lidhjes, Prizren',
  42.2114670,
  20.7438250,
  c.id,
  u.id
FROM categories c
CROSS JOIN users u
WHERE c.name = 'Museum'
  AND u.email = 'admin@heritage360.local'
  AND NOT EXISTS (
    SELECT 1
    FROM locations l
    WHERE l.title = 'League of Prizren Complex'
  );

INSERT INTO locations (title, description, city, address, latitude, longitude, category_id, created_by)
SELECT
  'Ulpiana Archaeological Park',
  'One of Kosovo''s most important archaeological sites, preserving the remains of the ancient Roman and Byzantine city of Ulpiana near Gracanica.',
  'Gracanica',
  'Ulpiana Archaeological Park, near Lipjan and Gracanica',
  42.5918500,
  21.1860360,
  c.id,
  u.id
FROM categories c
CROSS JOIN users u
WHERE c.name = 'Historical'
  AND u.email = 'admin@heritage360.local'
  AND NOT EXISTS (
    SELECT 1
    FROM locations l
    WHERE l.title = 'Ulpiana Archaeological Park'
  );

INSERT INTO locations (title, description, city, address, latitude, longitude, category_id, created_by)
SELECT
  'Gracanica Monastery',
  'An early 14th-century monastery near Pristina, recognized as part of the UNESCO-listed Medieval Monuments in Kosovo.',
  'Gracanica',
  'Gracanica, near Pristina',
  42.5983330,
  21.1933330,
  c.id,
  u.id
FROM categories c
CROSS JOIN users u
WHERE c.name = 'Historical'
  AND u.email = 'admin@heritage360.local'
  AND NOT EXISTS (
    SELECT 1
    FROM locations l
    WHERE l.title = 'Gracanica Monastery'
  );

INSERT INTO locations (title, description, city, address, latitude, longitude, category_id, created_by)
SELECT
  'Decani Monastery',
  'A 14th-century monastery with renowned medieval frescoes, also part of the UNESCO-listed Medieval Monuments in Kosovo.',
  'Decan',
  'Lumbardhi i Decanit, Decan',
  42.5333330,
  20.2666670,
  c.id,
  u.id
FROM categories c
CROSS JOIN users u
WHERE c.name = 'Historical'
  AND u.email = 'admin@heritage360.local'
  AND NOT EXISTS (
    SELECT 1
    FROM locations l
    WHERE l.title = 'Decani Monastery'
  );

INSERT INTO locations (title, description, city, address, latitude, longitude, category_id, created_by)
SELECT
  'Patriarchate of Pec',
  'A historic Serbian Orthodox monastery complex near Peja, known for medieval churches, frescoes, and its setting at the entrance to Rugova Gorge.',
  'Peja',
  'Patriarchate of Pec, Peja',
  42.6611110,
  20.2655560,
  c.id,
  u.id
FROM categories c
CROSS JOIN users u
WHERE c.name = 'Historical'
  AND u.email = 'admin@heritage360.local'
  AND NOT EXISTS (
    SELECT 1
    FROM locations l
    WHERE l.title = 'Patriarchate of Pec'
  );

INSERT INTO locations (title, description, city, address, latitude, longitude, category_id, created_by)
SELECT
  'Mirusha Waterfalls',
  'A protected natural area with a chain of waterfalls, lakes, and limestone canyons between Klina and Malisheva.',
  'Klina',
  'Mirusha Waterfalls, near Klina',
  42.5247220,
  20.5930560,
  c.id,
  u.id
FROM categories c
CROSS JOIN users u
WHERE c.name = 'Natural'
  AND u.email = 'admin@heritage360.local'
  AND NOT EXISTS (
    SELECT 1
    FROM locations l
    WHERE l.title = 'Mirusha Waterfalls'
  );

INSERT INTO locations (title, description, city, address, latitude, longitude, category_id, created_by)
SELECT
  'Rugova Canyon',
  'A dramatic canyon near Peja with steep limestone walls, mountain scenery, hiking routes, and access toward the Accursed Mountains.',
  'Peja',
  'Rugova Canyon, Peja',
  42.6769440,
  20.2388890,
  c.id,
  u.id
FROM categories c
CROSS JOIN users u
WHERE c.name = 'Natural'
  AND u.email = 'admin@heritage360.local'
  AND NOT EXISTS (
    SELECT 1
    FROM locations l
    WHERE l.title = 'Rugova Canyon'
  );

INSERT INTO locations (title, description, city, address, latitude, longitude, category_id, created_by)
SELECT
  'Gadime Cave',
  'A marble cave near Lipjan, known for stalactites, stalagmites, and unusual crystal formations open to visitors.',
  'Lipjan',
  'Gadime e Ulet, Lipjan',
  42.4786110,
  21.2044440,
  c.id,
  u.id
FROM categories c
CROSS JOIN users u
WHERE c.name = 'Natural'
  AND u.email = 'admin@heritage360.local'
  AND NOT EXISTS (
    SELECT 1
    FROM locations l
    WHERE l.title = 'Gadime Cave'
  );

INSERT INTO locations (title, description, city, address, latitude, longitude, category_id, created_by)
SELECT
  'Ethnological Museum Emin Gjiku',
  'A museum in Pristina set in an Ottoman-era residential complex, presenting traditional life, clothing, tools, and domestic culture.',
  'Pristina',
  'Emin Gjiku Complex, Pristina',
  42.6669440,
  21.1688890,
  c.id,
  u.id
FROM categories c
CROSS JOIN users u
WHERE c.name = 'Museum'
  AND u.email = 'admin@heritage360.local'
  AND NOT EXISTS (
    SELECT 1
    FROM locations l
    WHERE l.title = 'Ethnological Museum Emin Gjiku'
  );

INSERT INTO locations (title, description, city, address, latitude, longitude, category_id, created_by)
SELECT
  'Stone Bridge of Vushtrri',
  'One of Kosovo''s notable historic stone bridges, associated with Vushtrri''s old trade routes and urban heritage.',
  'Vushtrri',
  'Old Stone Bridge, Vushtrri',
  42.8236110,
  20.9672220,
  c.id,
  u.id
FROM categories c
CROSS JOIN users u
WHERE c.name = 'Cultural'
  AND u.email = 'admin@heritage360.local'
  AND NOT EXISTS (
    SELECT 1
    FROM locations l
    WHERE l.title = 'Stone Bridge of Vushtrri'
  );

UPDATE locations
SET
  title_sq = 'Muzeu i Kosoves',
  description_sq = 'Muzeu kombetar i Kosoves ne Prishtine, i njohur per koleksionet e arkeologjise, etnografise dhe historise ne nje ndertese te shekullit te 19-te.',
  city_sq = 'Prishtine',
  address_sq = 'Ibrahim Lutfiu, Prishtine'
WHERE title = 'Kosovo Museum';

UPDATE locations
SET
  title_sq = 'Kalaja e Prizrenit',
  description_sq = 'Kala mbi qytetin e vjeter te Prizrenit, me shtresa arkeologjike nga parahistoria, periudha romake, mesjetare dhe osmane.',
  city_sq = 'Prizren',
  address_sq = 'Kalaja e Prizrenit, mbi qytetin e vjeter, Prizren'
WHERE title = 'Prizren Fortress';

UPDATE locations
SET
  title_sq = 'Kompleksi i Lidhjes se Prizrenit',
  description_sq = 'Kompleks memorial dhe muzeal i lidhur me Lidhjen e Prizrenit te vitit 1878, qe bashkon historine politike me interpretimin etnografik ne qytetin e vjeter.',
  city_sq = 'Prizren',
  address_sq = 'Sheshi i Lidhjes, Prizren'
WHERE title = 'League of Prizren Complex';

UPDATE locations
SET
  title_sq = 'Parku Arkeologjik Ulpiana',
  description_sq = 'Nje nga sitet me te rendesishme arkeologjike te Kosoves, ku ruhen mbetjet e qytetit te lashte romak dhe bizantin Ulpiana prane Gracanices.',
  city_sq = 'Gracanice',
  address_sq = 'Parku Arkeologjik Ulpiana, prane Lipjanit dhe Gracanices'
WHERE title = 'Ulpiana Archaeological Park';

UPDATE locations
SET
  title_sq = 'Manastiri i Gracanices',
  description_sq = 'Manastir i hershem i shekullit te 14-te prane Prishtines, i njohur si pjese e monumenteve mesjetare te Kosoves ne listen e UNESCO-s.',
  city_sq = 'Gracanice',
  address_sq = 'Gracanice, prane Prishtines'
WHERE title = 'Gracanica Monastery';

UPDATE locations
SET
  title_sq = 'Manastiri i Decanit',
  description_sq = 'Manastir i shekullit te 14-te me afreske te njohura mesjetare, gjithashtu pjese e monumenteve mesjetare te Kosoves ne listen e UNESCO-s.',
  city_sq = 'Decan',
  address_sq = 'Lumbardhi i Decanit, Decan'
WHERE title = 'Decani Monastery';

UPDATE locations
SET
  title_sq = 'Patriarkana e Pejes',
  description_sq = 'Kompleks historik manastiri prane Pejes, i njohur per kishat mesjetare, afresket dhe vendndodhjen ne hyrje te Grykes se Rugoves.',
  city_sq = 'Peje',
  address_sq = 'Patriarkana e Pejes, Peje'
WHERE title = 'Patriarchate of Pec';

UPDATE locations
SET
  title_sq = 'Ujevarat e Mirushes',
  description_sq = 'Zone natyrore e mbrojtur me zinxhir ujevarash, liqene dhe kanione gelqerore midis Klines dhe Malisheves.',
  city_sq = 'Kline',
  address_sq = 'Ujevarat e Mirushes, prane Klines'
WHERE title = 'Mirusha Waterfalls';

UPDATE locations
SET
  title_sq = 'Gryka e Rugoves',
  description_sq = 'Kanion madheshtor prane Pejes me mure gelqerore, peizazh malor, shtigje ecjeje dhe qasje drejt Bjeshkeve te Nemuna.',
  city_sq = 'Peje',
  address_sq = 'Gryka e Rugoves, Peje'
WHERE title = 'Rugova Canyon';

UPDATE locations
SET
  title_sq = 'Shpella e Gadimes',
  description_sq = 'Shpelle mermeri prane Lipjanit, e njohur per stalaktite, stalagmite dhe formacione kristalore te vecanta.',
  city_sq = 'Lipjan',
  address_sq = 'Gadime e Ulet, Lipjan'
WHERE title = 'Gadime Cave';

UPDATE locations
SET
  title_sq = 'Muzeu Etnologjik Emin Gjiku',
  description_sq = 'Muze ne Prishtine i vendosur ne nje kompleks banimi te periudhes osmane, qe paraqet jeten tradicionale, veshjet, veglat dhe kulturen shtepiake.',
  city_sq = 'Prishtine',
  address_sq = 'Kompleksi Emin Gjiku, Prishtine'
WHERE title = 'Ethnological Museum Emin Gjiku';

UPDATE locations
SET
  title_sq = 'Ura e Gurit ne Vushtrri',
  description_sq = 'Nje nga urat historike te gurit me te njohura ne Kosove, e lidhur me rruget e vjetra tregtare dhe trashegimine urbane te Vushtrrise.',
  city_sq = 'Vushtrri',
  address_sq = 'Ura e Vjeter e Gurit, Vushtrri'
WHERE title = 'Stone Bridge of Vushtrri';

INSERT INTO locations (
  title, title_sq, description, description_sq, city, city_sq, address, address_sq,
  latitude, longitude, category_id, created_by
)
SELECT
  v.title,
  v.title_sq,
  v.description,
  v.description_sq,
  v.city,
  v.city_sq,
  v.address,
  v.address_sq,
  v.latitude,
  v.longitude,
  c.id,
  u.id
FROM (
  VALUES
    (
      'Newborn Monument',
      'Monumenti Newborn',
      'A contemporary landmark in central Pristina, unveiled for Kosovo''s declaration of independence and repainted regularly with civic and cultural themes.',
      'Pike moderne ne qender te Prishtines, e zbuluar me rastin e shpalljes se pavaresise se Kosoves dhe e rilyer rregullisht me tema qytetare e kulturore.',
      'Pristina',
      'Prishtine',
      'Luan Haradinaj Street, Pristina',
      'Rruga Luan Haradinaj, Prishtine',
      42.6627780,
      21.1583330,
      'Cultural'
    ),
    (
      'National Library of Kosovo',
      'Biblioteka Kombetare e Kosoves',
      'An iconic Pristina building known for its distinctive domes and metal lattice exterior, serving as Kosovo''s central library and cultural venue.',
      'Ndertese ikonike ne Prishtine, e njohur per kupolat dhe fasaden me rrjete metalike, qe sherben si biblioteke qendrore dhe hapesire kulturore.',
      'Pristina',
      'Prishtine',
      'Mother Teresa Square area, Pristina',
      'Zona e Sheshit Nena Tereze, Prishtine',
      42.6550000,
      21.1620000,
      'Cultural'
    ),
    (
      'Cathedral of Saint Mother Teresa',
      'Katedralja Shen Nena Tereze',
      'A prominent Roman Catholic cathedral in Pristina with a tall bell tower and broad views across the city center.',
      'Katedrale e rendesishme katolike ne Prishtine, me kambanore te larte dhe pamje te gjere mbi qendren e qytetit.',
      'Pristina',
      'Prishtine',
      'Bill Clinton Boulevard, Pristina',
      'Bulevardi Bill Clinton, Prishtine',
      42.6575000,
      21.1578000,
      'Cultural'
    ),
    (
      'Great Hamam of Pristina',
      'Hamami i Madh i Prishtines',
      'An Ottoman-era bathhouse near the old city core, valued for its historic architecture and role in Pristina''s urban heritage.',
      'Hamam i periudhes osmane prane berthames se vjeter te qytetit, i cmuar per arkitekturen historike dhe rolin ne trashegimine urbane te Prishtines.',
      'Pristina',
      'Prishtine',
      'Old Pristina, near the Imperial Mosque',
      'Prishtina e Vjeter, prane Xhamise se Mbretit',
      42.6672000,
      21.1663000,
      'Historical'
    ),
    (
      'Germia Park',
      'Parku i Germise',
      'A forested recreation area on the edge of Pristina with walking paths, picnic areas, outdoor pools, and access to hilly terrain.',
      'Zone rekreative pyjore ne skaj te Prishtines me shtigje ecjeje, vende pikniku, pishina te hapura dhe qasje ne terren kodrinor.',
      'Pristina',
      'Prishtine',
      'Germia Regional Park, Pristina',
      'Parku Rajonal i Germise, Prishtine',
      42.6745000,
      21.1952000,
      'Natural'
    ),
    (
      'Bear Sanctuary Prishtina',
      'Streha e Arinjve Prishtina',
      'A wildlife sanctuary near Mramor that cares for rescued brown bears and offers educational walking routes in a natural setting.',
      'Strehe per kafshe te egra prane Mramorit qe kujdeset per arinj te shpetuar dhe ofron shtigje edukative ne mjedis natyror.',
      'Pristina',
      'Prishtine',
      'Mramor, near Pristina',
      'Mramor, prane Prishtines',
      42.6234000,
      21.3025000,
      'Natural'
    ),
    (
      'Batlava Lake',
      'Liqeni i Batllaves',
      'A reservoir near Podujeva used for water supply and recreation, surrounded by rolling hills and lakeside villages.',
      'Liqen akumulues prane Podujeves qe perdoret per furnizim me uje dhe rekreacion, i rrethuar nga kodra dhe fshatra buze liqenit.',
      'Podujeva',
      'Podujeve',
      'Batlava Lake, near Orllan',
      'Liqeni i Batllaves, prane Orllanit',
      42.8250000,
      21.3270000,
      'Natural'
    ),
    (
      'Brezovica Ski Center',
      'Qendra e Skijimit Brezovice',
      'A mountain resort in the Sharr range, known for winter sports, alpine scenery, and access to high-altitude trails.',
      'Qender malore ne Bjeshket e Sharrit, e njohur per sportet dimerore, peizazhin alpin dhe qasjen ne shtigje me lartesi te madhe.',
      'Shterpce',
      'Shterpce',
      'Brezovica, Sharr Mountains',
      'Brezovice, Bjeshket e Sharrit',
      42.2208000,
      21.0003000,
      'Natural'
    ),
    (
      'Sharr Mountains National Park',
      'Parku Kombetar Malet e Sharrit',
      'A protected mountain landscape with high pastures, glacial lakes, biodiversity, and traditional villages across southern Kosovo.',
      'Peizazh malor i mbrojtur me kullota alpine, liqene akullnajore, biodiversitet dhe fshatra tradicionale ne jug te Kosoves.',
      'Prizren',
      'Prizren',
      'Sharr Mountains National Park, southern Kosovo',
      'Parku Kombetar Malet e Sharrit, Kosova jugore',
      42.1533000,
      20.9722000,
      'Natural'
    ),
    (
      'White Drin Waterfall',
      'Ujevara e Drinit te Bardhe',
      'A scenic waterfall near Radac where the White Drin emerges from a spring area below the mountains west of Peja.',
      'Ujevarre piktoreske prane Radacit, ku Drini i Bardhe del nga zona e burimit poshte maleve ne perendim te Pejes.',
      'Peja',
      'Peje',
      'Radac, near Peja',
      'Radac, prane Pejes',
      42.7380000,
      20.3046000,
      'Natural'
    ),
    (
      'Istog Spring',
      'Burimi i Istogut',
      'A clear karst spring at the foot of the mountains, known for cold water, riverside restaurants, and a calm natural setting.',
      'Burim karstik i kthjellet ne rreze te maleve, i njohur per ujin e ftohte, restoranet buze lumit dhe ambientin e qete natyror.',
      'Istog',
      'Istog',
      'Istog Spring, Istog',
      'Burimi i Istogut, Istog',
      42.7802000,
      20.4872000,
      'Natural'
    ),
    (
      'Gazivoda Lake',
      'Liqeni i Gazivodes',
      'A large artificial lake in northern Kosovo with dramatic water views, bridges, and mountain roads around Zubin Potok.',
      'Liqen i madh artificial ne veri te Kosoves me pamje te fuqishme ujore, ura dhe rruge malore rreth Zubin Potokut.',
      'Zubin Potok',
      'Zubin Potok',
      'Gazivoda Lake, Zubin Potok',
      'Liqeni i Gazivodes, Zubin Potok',
      42.9340000,
      20.6280000,
      'Natural'
    ),
    (
      'Sinan Pasha Mosque',
      'Xhamia e Sinan Pashes',
      'A landmark Ottoman mosque in Prizren, recognized by its elegant minaret, painted interior, and central position above the old stone bridge.',
      'Xhami e njohur osmane ne Prizren, e dalluar per minaren elegante, brendesine e pikturuar dhe poziten qendrore mbi uren e vjeter te gurit.',
      'Prizren',
      'Prizren',
      'Shadervan, Prizren',
      'Shadervan, Prizren',
      42.2094000,
      20.7406000,
      'Cultural'
    ),
    (
      'Gazi Mehmet Pasha Hamam',
      'Hamami i Gazi Mehmet Pashes',
      'A 16th-century Ottoman bathhouse in Prizren, often used as a heritage venue for exhibitions and cultural events.',
      'Hamam osman i shekullit te 16-te ne Prizren, qe perdoret shpesh si hapesire trashegimie per ekspozita dhe ngjarje kulturore.',
      'Prizren',
      'Prizren',
      'Old town, Prizren',
      'Qyteti i vjeter, Prizren',
      42.2111000,
      20.7429000,
      'Historical'
    ),
    (
      'Shadervan Square',
      'Sheshi Shadervan',
      'The lively heart of Prizren''s old town, surrounded by cafes, mosques, stone lanes, and views toward the fortress.',
      'Zemra e gjalle e qytetit te vjeter te Prizrenit, e rrethuar nga kafene, xhami, rrugica guri dhe pamje drejt kalase.',
      'Prizren',
      'Prizren',
      'Shadervan, Prizren',
      'Shadervan, Prizren',
      42.2089000,
      20.7402000,
      'Cultural'
    ),
    (
      'Hadum Mosque',
      'Xhamia e Hadumit',
      'A historic mosque in Gjakova''s old bazaar area, known for Ottoman architecture, wall paintings, and its role in city life.',
      'Xhami historike ne zonen e carshise se vjeter te Gjakoves, e njohur per arkitekturen osmane, pikturat murale dhe rolin ne jeten e qytetit.',
      'Gjakova',
      'Gjakove',
      'Old Bazaar, Gjakova',
      'Carshia e Vjeter, Gjakove',
      42.3801000,
      20.4307000,
      'Historical'
    ),
    (
      'Grand Bazaar of Gjakova',
      'Carshia e Madhe e Gjakoves',
      'One of Kosovo''s most atmospheric old bazaars, rebuilt after wartime destruction and lined with artisan shops, cafes, and historic lanes.',
      'Nje nga carshite e vjetra me atmosferike ne Kosove, e rindertuar pas shkaterrimeve te luftes dhe e mbushur me dyqane artizanale, kafene e rrugica historike.',
      'Gjakova',
      'Gjakove',
      'Grand Bazaar, Gjakova',
      'Carshia e Madhe, Gjakove',
      42.3805000,
      20.4319000,
      'Cultural'
    ),
    (
      'Museum of Gjakova',
      'Muzeu i Gjakoves',
      'A city museum presenting Gjakova''s archaeological, ethnographic, and historical collections near the old bazaar.',
      'Muze qyteti qe paraqet koleksione arkeologjike, etnografike dhe historike te Gjakoves prane carshise se vjeter.',
      'Gjakova',
      'Gjakove',
      'Old city center, Gjakova',
      'Qendra e vjeter e qytetit, Gjakove',
      42.3809000,
      20.4314000,
      'Museum'
    ),
    (
      'Novo Brdo Fortress',
      'Kalaja e Novoberdes',
      'The ruins of a major medieval mining town and fortress, once important for silver production and regional trade.',
      'Rrenojat e nje qyteti dhe kalaje te rendesishme mesjetare minerare, dikur e njohur per prodhimin e argjendit dhe tregtine rajonale.',
      'Novo Brdo',
      'Novoberde',
      'Novo Brdo Fortress, Novo Brdo',
      'Kalaja e Novoberdes, Novoberde',
      42.6167000,
      21.4367000,
      'Historical'
    ),
    (
      'Zvecan Fortress',
      'Kalaja e Zvecanit',
      'A medieval hill fortress above Mitrovica and Zvecan, offering wide views over the Ibar valley and northern Kosovo.',
      'Kala mesjetare mbi Mitrovicen dhe Zvecanin, me pamje te gjera mbi luginen e Ibrit dhe veriun e Kosoves.',
      'Zvecan',
      'Zvecan',
      'Zvecan hill, near Mitrovica',
      'Kodra e Zvecanit, prane Mitrovices',
      42.9077000,
      20.8407000,
      'Historical'
    ),
    (
      'Gazimestan Memorial',
      'Memoriali i Gazimestanit',
      'A memorial tower on the Kosovo Field plain, associated with the 1389 Battle of Kosovo and later commemorative traditions.',
      'Kulle memoriale ne Fushe Kosove, e lidhur me Betejen e Kosoves te vitit 1389 dhe traditat e mevonshme perkujtimore.',
      'Pristina',
      'Prishtine',
      'Gazimestan, near Pristina',
      'Gazimestan, prane Prishtines',
      42.6404000,
      21.0961000,
      'Historical'
    ),
    (
      'Jashari Memorial Complex',
      'Kompleksi Memorial Jashari',
      'A major memorial complex in Prekaz dedicated to the Jashari family and the Kosovo Liberation Army resistance.',
      'Kompleks i rendesishem memorial ne Prekaz kushtuar familjes Jashari dhe rezistences se Ushtrise Clirimtare te Kosoves.',
      'Skenderaj',
      'Skenderaj',
      'Prekaz, Skenderaj',
      'Prekaz, Skenderaj',
      42.7469000,
      20.7894000,
      'Historical'
    ),
    (
      'Museum of Mitrovica',
      'Muzeu i Mitrovices',
      'A regional museum with archaeological, ethnographic, geological, and historical material connected to Mitrovica and its mining heritage.',
      'Muze rajonal me materiale arkeologjike, etnografike, gjeologjike dhe historike te lidhura me Mitrovicen dhe trashegimine minerare.',
      'Mitrovica',
      'Mitrovice',
      'Mitrovica city center',
      'Qendra e Mitrovices',
      42.8916000,
      20.8657000,
      'Museum'
    ),
    (
      'Prizren Archaeological Museum',
      'Muzeu Arkeologjik i Prizrenit',
      'A museum housed in the former Ottoman clock tower complex, presenting archaeological finds from Prizren and the wider region.',
      'Muze i vendosur ne kompleksin e ish-kulles osmane te sahatit, qe paraqet gjetje arkeologjike nga Prizreni dhe rajoni me i gjere.',
      'Prizren',
      'Prizren',
      'Sahat Kulla area, Prizren',
      'Zona e Sahat Kulles, Prizren',
      42.2140000,
      20.7378000,
      'Museum'
    ),
    (
      'Traditional Kulla of Isniq',
      'Kulla Tradicionale e Isniqit',
      'A preserved stone tower-house in the Dukagjin region, representing local family architecture, hospitality, and defensive tradition.',
      'Kulle guri e ruajtur ne rajonin e Dukagjinit, qe perfaqeson arkitekturen familjare, mikpritjen dhe traditen mbrojtese vendore.',
      'Decan',
      'Decan',
      'Isniq, Decan',
      'Isniq, Decan',
      42.5570000,
      20.3030000,
      'Cultural'
    )
) AS v(
  title, title_sq, description, description_sq, city, city_sq, address, address_sq,
  latitude, longitude, category_name
)
JOIN categories c ON c.name = v.category_name
CROSS JOIN users u
WHERE u.email = 'admin@heritage360.local'
  AND NOT EXISTS (
    SELECT 1
    FROM locations l
    WHERE l.title = v.title
  );

COMMIT;
