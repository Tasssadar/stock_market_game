const positiveReasons = [
  'algoritmus odhalil, že firma testuje turbo produkt, který prý vynalezl student na brigádnické směně.',
  'influencer s milionem sledujících omylem řekl, že bez této značky nevstane z postele.',
  'uniklé interní slajdy tvrdí, že další čtvrtletí bude jak raketa po energetáku.',
  'trh vzal vážně mem o této firmě a objemy vystřelily rychleji než školní zvonění.',
  'analytik v televizi třikrát mrknul a internet to přečetl jako jasný signál k nákupu.',
  'firma oznámila novou funkci, která umí "ušetřit čas i nervy", a to zní investorům jako hudba.',
  'spekuluje se o partnerství, které by spojilo technologii, styl a porci chaosu v dobrém slova smyslu.',
  'v diskuzích se šíří historka o překvapivě silných prodejích během víkendu.',
  'investoři chytli FOMO po tom, co konkurence přiznala skluz ve vývoji.',
  'market makeři hlásí, že "tohle jméno je dnes magnet na kapitál".',
  'firma údajně našla způsob, jak zefektivnit výrobu bez velkého dramatu.',
  'v sociálních sítích se z trendu stal hype a hype se překlopil do grafu.',
  'pozitivní recenze produktu rozjela lavinu, kterou už nikdo nebrzdí.',
  'první čísla z pilotu jsou tak silná, že i skeptici hledají vstup.',
  'velcí hráči začali přikupovat a drobní investoři nechtějí zůstat pozadu.',
  'firma vyhrála výběrko, o kterém se myslelo, že je už předem rozhodnuté.',
  'předobjednávky překonaly čekání a trh to odměnil instantním optimismem.',
  'konkurence zvedla ceny, tahle firma zůstala dostupná a trh to miluje.',
  'nový manažer nastoupil s plánem "rychleji, chytřeji, větší marže".',
  'výsledky testů ukázaly stabilitu, kterou trh hledal už celé měsíce.',
  'firma otevřela nový kanál prodeje a objednávky přichází po stovkách.',
  'po dlouhém tichu přišla konkrétní roadmapa a investorům spadla brada.',
  'rozšíření do další země vypadá překvapivě hladce a bez velkých ztrát.',
  'společnost zrychlila dodávky a zkrácení čekací doby rozhýbalo poptávku.',
  'zákazníci sdílí virální videa s produktem a reklama je najednou skoro zdarma.',
  'řízení nákladů vypadá lépe než predikce, marže se drží nad plánem.',
  'firma trefila timing a uvedla novinku ve chvíli, kdy trh hladoví po změně.',
  'debaty o odkupu akcií znovu rozohnily optimisty.',
  'investoři věří, že slabší dolar firmě pomůže při exportu.',
  'zpráva o navýšení kapacit uklidnila obavy z vyprodání skladů.',
  'startup duch uvnitř korporátu překvapil i staré mazáky na burze.',
  'firma nabrala vývojáře, kteří dřív stavěli produkty s kultovním fanclubem.',
  'hospodářské zprávy ji vybraly jako "černý kůň" sezóny a trh to chytil.',
  'odvážná kampaň na sociálních sítích zafungovala lépe, než čekal i marketing.',
  'technické indikátory blikly zeleně a tradeři to vzali jako pozvánku.',
  'zahraniční fond navýšil podíl a poslal jasný signál důvěry.',
  'vyšla série článků o podhodnocení firmy, která rozjela novou vlnu nákupů.',
  'provozní data unikla dřív a vypadají jako soundtrack k rally.',
  'zlepšení cashflow snížilo nervozitu kolem dalšího financování.',
  'komunita uživatelů navrhla feature, firma ji hned zapracovala a body letěly nahoru.',
  'po update aplikace stoupla aktivita uživatelů skokově nahoru.',
  'firma získala významného partnera pro distribuci v regionu.',
  'získala patent, který může ztížit život konkurenci na dlouho.',
  'report ukázal menší odliv zákazníků než se čekalo.',
  'vysoké retence a nízké reklamace vypadají jako skrytý jackpot.',
  'trh překvapila disciplína managementu při utrácení.',
  'zákazníci začali produkt používat i mimo původní use case.',
  'firma trefila komunitu gamerů a teen publikum spustilo lavinu objednávek.',
  'návrat do zisku přišel dřív, než předpokládaly modely.',
  'po měsících nejistoty přišel jasný signál: tenhle příběh ještě neskončil.'
]

const positiveClosers = [
  'Poroste to dál, nebo si trh potřebuje jen protáhnout nohy?',
  'V redakci se ptá každý: "will this growh continue?"',
  'Starý parketový vtip říká, že trh jde vždy nahoru... eventually!',
  'Optimisté slaví, skeptici hledají kde je hack v matrixu.',
  'Zelený semafor svítí, ale nikdo neví jak dlouho.',
  'Každý dip se kupuje rychleji, než stihne dorazit oběd.',
  'Kdo mrknul, už nestihl naskočit do vlaku.',
  'Burza dnes připomíná koncert, kde všichni zpívají refrén o růstu.',
  'Investoři věří, že tenhle motor má ještě pár stupňů navíc.',
  'Otázka dne: hype, nebo nový normál?'
]

const positiveIntros = [
  '{ticker} dnes válcuje tabulky a chaty jedou na plný výkon',
  '{ticker} dnes rozsvítil zelenou a burzovní chat hučí jak stadion',
  '{ticker} šlape jako turbo a trh nestíhá doplňovat konfety',
  '{ticker} dnes jede rally a skeptici jen tiše přepočítávají',
  '{ticker} rozjel byčí párty a order book sotva dýchá',
  '{ticker} dnes přebral mikrofon a diktuje tempo celé seanci',
  '{ticker} vystřelil vzhůru a i opoždění naskakují do vlaku',
  '{ticker} předvádí zelený sprint a komentátoři loví superlativy',
  '{ticker} dneska pálí jak raketa a parket má euforii v očích',
  '{ticker} rozdává body jak na školním turnaji a trh tleská'
]

const negativeReasons = [
  'unikla zpráva o odložení projektu a trh okamžitě přepnul do režimu panika.',
  'vlna výběru zisku sestřelila cenu dřív, než moderátor stihl dokončit větu.',
  'konkurence představila agresivní novinku a investoři znejistěli.',
  'vysoké náklady na provoz přepsaly optimismu scénář na červený.',
  'nevýrazná čísla z reportu rozjela dominový efekt prodejů.',
  'po virálním hypu přišlo vystřízlivění a trh to vzal bez slitování.',
  'slabá marže rozjela debatu, jestli je růst udržitelný.',
  'komunita začala hromadně spekulovat o "překoupeném" grafu.',
  'několik velkých účtů vyhodilo pozice naráz a order book to neustál.',
  'technická korekce přišla přesně ve chvíli největší euforie.',
  'zvýšené shorty přilily olej do ohně a medvědi převzali mikrofon.',
  'management mluvil opatrněji než trh čekal, a to stačilo.',
  'vysoký benchmark konkurence odhalil slabší tempo.',
  'zprávy o zpoždění dodávek překvapily i optimisty.',
  'investoři se lekli kombinace drahé valuace a slabých nervů.',
  'spekulanti zavřeli rychlé zisky a stáhli likviditu.',
  'po sérii zelených dnů přišla studená sprcha reality.',
  'jedna nepřesná věta ve výsledkovém callu spustila lavinu otazníků.',
  'trh přestal odpouštět chyby a každá malá trhlina je teď vidět.',
  'nižší aktivita uživatelů přepisuje rychle býčí narativ.',
  'zvýšené reklamace vyvolaly obavy z dalších nákladů.',
  'chladnější makrodata zchladila i tenhle donedávna rozpálený ticker.',
  'v diskuzích převládly memy o "to the basement".',
  'po přehnaném růstu přišel klasický reality check.',
  'větší hráči přeskládali portfolio a tahle pozice to odnesla.',
  'nervozita kolem dalšího financování znovu vytáhla medvědí argumenty.',
  'slabší guidance poslala trh do obranného postoje.',
  'chyběla nová pozitivní zpráva a trh si to vysvětlil po svém.',
  'vyšší sazby snížily chuť riskovat v růstových jménech.',
  'náklady na expanzi rostou rychleji, než by se investorům líbilo.',
  'ticho ze strany vedení trh neuklidnilo, spíš naopak.',
  'na sociálních sítích se otočil sentiment a prodeje naskočily.',
  'zpomalený onboarding zákazníků rozhoupal pochybnosti.',
  'nervózní open vytvořil tlak, který pak už jen nabíral směr dolů.',
  'po ostrých targetech analytiků přišla bolestivá srážka s realitou.',
  'příliš mnoho rychlých rukou chtělo najednou ven.',
  'výkon sektoru byl slabý a tahle firma to schytala dvojnásob.',
  'malá chyba v komunikaci zbytečně zvedla teplotu celého trhu.',
  'cashflow nezazpívalo tak hlasitě, jak si trh vysnil.',
  'otevřené otázky kolem dalšího kvartálu zůstaly bez odpovědi.',
  'po hype vlně přišel klasický "sell the news" moment.',
  'spadla důvěra v krátkodobý plán a graf to řekl za všechny.',
  'některé fondy zvolily konzervativnější strategii a ubírají riziko.',
  'agresivní spekulace se rozplynuly a cena hledala pevnou zem.',
  'buyeři se stáhli a medvědi zatím hlídají parket.',
  'produktový update nepřesvědčil tak, jak se čekalo.',
  'trh přísně trestal každé zaváhání a tohle zaváhání bylo vidět.',
  'rychlý růst posledních týdnů se ukázal jako moc natažená guma.',
  'odliv krátkodobého kapitálu spustil dominový efekt prodejů.',
  'ani nejhlasitější býčí slogan dnes nedokázal zastavit propad.'
]

const negativeClosers = [
  'Sucho jednou musí skončit, ale dnes to ještě není.',
  'Veteráni opakují: po každé bouřce se trh stejně někdy zvedne.',
  'Dnes medvědi tančí, zítra se uvidí kdo vydrží dýl.',
  'Otázka večera: dno, nebo jen první schod?',
  'Graf vypadá drsně, ale kapitoly na burze se píšou dlouho.',
  'Kdo má nervy z oceli, ten čte tenhle den jako lekci.',
  'Dav zmateně hlásí alarm, racionální hlavy hledají hodnotu.',
  'Trh má špatnou náladu, ale nálady se mění rychle.',
  'Korekce bolí, plán a disciplína bolí míň.',
  'Starý slogan připomíná, že market goes up... eventually.'
]

const negativeIntros = [
  '{ticker} dostal smyk a parket na chvíli ztichl',
  '{ticker} dnes chytil červenou vlnu a burza na moment zadržela dech',
  '{ticker} uklouzl po grafu dolů a nálada na trhu ztěžkla',
  '{ticker} šel do kolen a komentátoři hledají nouzové vysvětlení',
  '{ticker} dnes narazil na medvědí zeď a objemy zčervenaly',
  '{ticker} ztratil půdu pod nohama a parket přepnul do tichého režimu',
  '{ticker} schytal studenou sprchu a byci rychle stáhli hlasitost',
  '{ticker} dnes padá po schodech a trh počítá škody',
  '{ticker} se propadl do červeného pásma a nervozita vystřelila',
  '{ticker} dostal tvrdý reality check a tabule zrudla během minut'
]

function pickRandom(items: string[]): string {
  return items[Math.floor(Math.random() * items.length)]!
}

function buildTemplate(
  intro: string,
  playerLine: string,
  reason: string,
  closer: string
) {
  return `${intro}, protože ${reason}
${playerLine}
<i>${closer}</i>`
}

export const positiveTemplates: string[] = positiveReasons.map((reason, index) =>
  buildTemplate(
    pickRandom(positiveIntros),
    `<b>{playerNames}</b> na tom dneska získal <b {polarityTextStyle}>{amount} ({percent}) při {shares} ks</b>!`,
    reason,
    positiveClosers[index % positiveClosers.length]!
  )
)

export const negativeTemplates: string[] = negativeReasons.map((reason, index) =>
  buildTemplate(
    pickRandom(negativeIntros),
    `Nejvíc to dnes zasáhlo <b>{playerNames}</b>, který se slzami v očích sledoval, jak mizí <b {polarityTextStyle}>{amount} ({percent}) při {shares} ks</b>.`,
    reason,
    negativeClosers[index % negativeClosers.length]!
  )
)
