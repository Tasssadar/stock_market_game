const positiveReasons = [
  'Chuck Norris veřejně prohlásil, že bez produktu téhle firmy nezačne den.',
  'v kuchyňce firmy se našla poslední sušenka a tým to oslavil vydáním povedené novinky.',
  'firemní maskot lama prý trefil v interní tipovačce všechna čísla přesně.',
  'někdo omylem zapnul karaoke reproduktory a celá kancelář pak pracovala o 200 % rychleji.',
  'virální video ukázalo šéfa firmy, jak vyhrál školní turnaj v piškvorkách proti robotu.',
  'produkty firmy se objevily v oblíbeném seriálu hned vedle hlavního hrdiny.',
  'interní AI asistent poslal motivační citát a internet to vzal jako znamení velké jízdy.',
  'na střeše centrály přistál dron s nápisem "tohle je top firma týdne".',
  'firma oznámila režim "jedním klikem a je klid", což lidem znělo jako splněný sen.',
  'fanoušci vytvořili meme, které během hodiny obletělo internet.',
  'na recepci se objevil kouzelník a předvedl trik s mizejícími chybami.',
  'testovací tým našel velikonoční vajíčko, které všem zlepšilo náladu i výkon aplikace.',
  'školní klub programátorů udělil firmě cenu "nejvíc cool nápad měsíce".',
  'do kanclu dorazila pizza zdarma pro všechny a záhadně s tím vyrostla produktivita.',
  'známý streamer řekl, že aplikaci používá mezi každým zápasem.',
  'firemní kočka stiskla Enter ve správný moment a vydání proběhlo překvapivě hladce.',
  'nová funkce údajně šetří tolik času, že lidé stíhají i odpolední zmrzlinu.',
  'v kanceláři proběhl den bez porad a vývoj šel najednou jako po másle.',
  'společnost spustila soutěž o nejlepší gif a komunita se do ní zamilovala.',
  'legendární školník z vedlejší budovy firmě popřál štěstí a internet to přijal jako proroctví.'
]

const positiveClosers = [
  'Otázka dne: pokračování hitu, nebo jen trailer?',
  'Kdo šel pro pití, vrátil se a nevěřil vlastním očím.',
  'Internet tleská a obnovuje stránku každých pět sekund.',
  'Komentáře jedou naplno a všude je samá radost.',
  'Dneska to vypadá, že i pondělí má dobrou náladu.',
  'Skeptici mlčí, optimisti už vybírají vítězný soundtrack.',
  'Jestli tohle byl level 1, nikdo nechce propásnout level 2.',
  'Fanoušci hlásí: víc takových dnů a kupujeme konfety po kilech.',
  'Nálada je tak dobrá, že by ji záviděl i školní výlet.',
  'Teď už jen zjistit, jestli tohle byl kouzelný trik, nebo nová realita.'
]

const positiveIntros = [
  '{ticker} dneska jede tak dobře, že chat nestíhá psát vykřičníky',
  '{ticker} rozjel párty a čísla skáčou jak na trampolíně',
  '{ticker} dnes vystřelil nahoru a všichni hledají důvod v memech',
  '{ticker} je dnes hvězda dne a internet mu posílá srdíčka',
  '{ticker} překvapil úplně všechny a tabulka se rozzářila',
  '{ticker} má dnes turbo den a fanoušci jedou vítězné kolečko',
  '{ticker} nabral rychlost jak koloběžka z prudkého kopce',
  '{ticker} dneska sbírá body rychleji než tým ve školním kvízu',
  '{ticker} jako by zapnul tajný kód a nálada vystřelila nahoru',
  '{ticker} dnes válí tak moc, že i kalkulačka se usmívá'
]

const negativeReasons = [
  'v centrále celé odpoledne hledali ztracené kotě a nikdo nestihl dokončit důležitý report.',
  'firemní robot-vysavač omylem odvezl modem do skladu a internet se vypařil.',
  'šéf firmy při prezentaci omylem pustil playlist "smutné pondělí" místo výsledků.',
  'na poradu dorazil kouzelník, ale zmizela jen nálada a ne chyby.',
  'krize u kancelářského kávovaru dosáhla kritického bodu.',
  'meme oddělení vyhlásilo stávku, protože jim došly samolepky.',
  'nová verze spustila režim "všechno je komiks", což nikdo nečekal.',
  'firemní papoušek naučený na hesla je vykřičel při streamu.',
  'kurýr doručil důležité balíky omylem do zverimexu.',
  'v serverovně někdo zapnul disco kouli a světla blikala víc než hlavní přehled.',
  'v interní soutěži o nejlepší kostým vyhrál člověk převlečený za chybu 404.',
  'na recepci se ztratily klíče od zasedačky a plán dne šel stranou.',
  'firemní chatbot začal odpovídat jen citáty z fantasy filmů.',
  'všichni řešili, kdo snědl poslední jogurt z firemní lednice, a práce stála.',
  'hlavní tabule v kanceláři zobrazila místo čísel recept na palačinky.',
  'hasičský poplach spustil někdo při pokusu opéct marshmallow nad nabíječkou.',
  'do zasedačky vlétlo hejno balónků a meeting se změnil v honičku.',
  'firemní pes utekl s USB diskem a pronásledování trvalo dvě hodiny.',
  'streamer omylem přečetl název firmy obráceně a internet si z toho udělal vtip dne.',
  'výprava za ztraceným kocourkem po budově skončila bez úspěchu i bez plánu B.'
]

const negativeClosers = [
  'Dnešní epizoda byla drsná, ale seriál ještě nekončí.',
  'Nálada je dole, ale materiálu na memy je na rozdávání.',
  'Zítřek může být lepší, dnes to chce hlavně klid a čaj.',
  'Tahle jízda bolela, ale velké návraty bývají nejzábavnější.',
  'Chat píše "au", ale nikdo neodchází z kina před koncem.',
  'Dneska to nevyšlo, zítra se hraje další kolo.',
  'Špatný den, dobrý příběh na večerní vyprávění.',
  'I tahle bouřka jednou přejde a zase vykoukne slunce.',
  'Planeta chaosu je aktivní, ale jedeme dál.',
  'Dneska mínus, ale hra ještě rozhodně nekončí.'
]

const negativeIntros = [
  '{ticker} dneska zakopl o vlastní tkaničku a čísla šla dolů',
  '{ticker} má dnes den blbec a internet jen nevěřícně mrká',
  '{ticker} to dnes nevyšlo a tabulka je plná smutných čísel',
  '{ticker} schytal nepříjemný pád a chat zaplavily zprávy typu "co se to děje?"',
  '{ticker} dnes narazil do zdi a nálada rychle ochladla',
  '{ticker} ztratil tempo a fanoušci napjatě obnovují stránku',
  '{ticker} chytil červenou kartu a skóre se sesunulo',
  '{ticker} spadl z vítězné vlny a přistál tvrdě na zemi',
  '{ticker} dnes přepnul na těžký režim a body jen mizí',
  '{ticker} dostal tvrdý zásek a tabule se zbarvila do červena'
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
  return `<p>${intro}, protože <span {polarityTextStyle}>${reason}</span></p>
<p>${playerLine}
<i>${closer}</i></p>`
}

export const positiveTemplates: string[] = positiveReasons.map((reason, index) =>
  buildTemplate(
    pickRandom(positiveIntros),
    `<b>{playerNames}</b> na tom dneska získal <b {polarityTextStyle}>{amount} ({percent})</b>!`,
    reason,
    positiveClosers[index % positiveClosers.length]!
  )
)

export const negativeTemplates: string[] = negativeReasons.map((reason, index) =>
  buildTemplate(
    pickRandom(negativeIntros),
    `Nejvíc to dnes zasáhlo <b>{playerNames}</b>, který se slzami v očích sledoval, jak mizí <b {polarityTextStyle}>{amount} ({percent})</b>.`,
    reason,
    negativeClosers[index % negativeClosers.length]!
  )
)
