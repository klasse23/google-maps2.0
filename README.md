
## Work process
Fordi det eksisterer over 1 million registrerte bedrifter i Norge, men de fleste har enten gått konkurs eller har mindre enn 1 ansatte vil behandling ikke konstant fungere så bra. Derfor kjører vi denne prosessen en gang.

Vi tar deretter denne nye dataen inn i mysql og bruker kun https://data.brreg.no/enhetsregisteret/api/oppdateringer/enheter?dato=
For videre endringer i registeret. Dette behandles på server.

Etter dette trenger vi en basic API med express som kan sende data til frontend. 
Frontend vil starte med et simpelt kart som vi kan legge til markers på. Til å starte med vil det være ingen filter. 
Etter vi har en basic funksjonalitet vil det neste stege være å utvide nettsiden med basic filtrering. Her vil det også være nødvendig å legge til liste view.

Fordi distance api er ukjent er det viktig å se hvordan betalingsmåten fungerer på den. INGEN API BRUK SKAL SKJE UTEN LIMITS.
Dette er punktet vi kan starte med filtrering basert på avstand. Det er mulig vi finner noe bedre.

Når alt dette er gjort må det kjøres optimalisering. 


## Stack
- Bun (når mulig, node til da)
- Express
- Angular


## Hva er målet
Målet er å finne bedrifter som ser etter utplassering. Med denne vil jeg gi noen former for filtrering og søk blant annet
Avstand
Fag

## Det løser
Det løser et problem hvor det er vanskelig for nye elever å vite hvilke bedrifter dem har mulighet for å være hos. 
Det gir også en bedre mulighet for bedrifter å vise seg frem. 

## Dette er hvordan bruk burde føles
Det burde være som en demo for jobbsøking. Du kan se flere bedrifter, hva dem ser etter og om du er interessert tar du kontakt. 

## Det kan utvides
Om mulig vil jeg koble inn ikke bare arbeidsplasser som har direkte sagt at de har plass, men også alle andre bedrifter. Det burde være mulig og filtrere mellom disse.


## Hvordan blir mediene delt.
Til å starte med er en nettside lettest. Denne nettsiden burde ha et par sider.
Maps. Denne siden brukes for å vise plassering til bedrifter
Liste. Dette vil fungere som en listet side hvor du kan lett sortere på en mer konsis måte.
Telefonen er vanskeligere å styre med. En nettside kan fungere, men det er fint om det også kan bygges om til en app. For lettere tilgang på mobil.

## Fil system regler

IKKE MIX FRONTEND OG BACKEND DEPENDENCIES

Det vil bli lagt til en .eslint fil. Denne SKAL brukes for at basic layout er likt. Dette gjelder ting som spacing, bruk av “ eller ‘ etc.
Filer skal legges sortert i mapper. For eksempel. 
backend 
      | --src
           	| --components
            |          |--headerComponent
            |          |--buttonComponent 
            |
| --assets
| -- functions
          |--logFunction
          |--clustering

Classes skal ha egen fil.
Uten class kan det fortsatt være flere funksjoner, men det må være en naturlig plassering.

### Når skal det være en funksjon?
Om du gjør noe mer enn en gang, lag en funksjon. For eksempel. 

```js
const a = await function1().catch((err => handle(err)))
const b = await function2(a).catch((err => handle(err)))
const c = await function3(b).catch(err => handle(err))
```
Dette fungerer. MEN om du lager en handlerFunction som en wrapper for error handling kan du få samme output type til all error.







```js
async function errorWrapper() { // her blir alt behandlet likt
  try {
     const data = await promise
     return [data, null]
   } catch (error) {
     console.error(error)
     return [null, error]
   }
}

const [data, error] = await errorWrapper()
if (error) {} // Du kan fortsatt gjøre andre ting på error
const [data2, error2] = await errorWrapper()
const [data3, error3] = await errorWrapper()
```

På denne måten vil all kode behandles likt og det er lettere å finne frem til der du skal.


## TODO bruk og github issues
TODO skal brukes alle steder det er noe du vet noe annet må gjøres. Disse skal skrives MED EN GANG så du ikke glemmer det. Fjern TODO når oppgaven er etter.
For større problemer, bruk issues. Hele teamet kan da se problemet og raskt fikse det.
TODO brukes ved å skrive:
`TODO: Beskrivelse av problemet`
Extensions som lager issues ved automatisk eller som highlighter TODO er anbefalt, men ikke nødvendig.














## Git og branches
ALDRI JOBB PÅ MAIN. Main vil bli låst. Dette er hvordan jeg forventer at branches fungerer.
For endringer lager du en branch. Dette blir en “dev” type branch. Du brancher ut igjen fra denne branchen for endringene dine. Når disse er ferdige merger du branchene sammen igjen. Dette gjør så det ikke blir merge conflicts


Main
   |
    \
     Dev---------\
      \                  \
        \                 \  
       fileChange  fileChange2



