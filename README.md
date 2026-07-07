# 3DPrintSW

Applicazione web per gestire il **catalogo dei modelli 3D**, registrare le **stampe** e le **vendite**, e monitorare in automatico **magazzino, costi, ricavi e profitto**. Sostituisce il classico foglio Excel con un'app sempre aggiornata, utilizzabile dal PC Windows e anche dallo smartphone Android sulla stessa rete.

## Funzionalità

- **Catalogo modelli**: crea, modifica ed elimina i modelli 3D (nome, categoria, sottocategoria, materiale, ore di stampa, costo unitario, prezzo di vendita, foto, scorta minima).
- **Misure e prezzi per taglia**: ad ogni modello puoi associare più combinazioni di altezza × larghezza × profondità, ciascuna con il proprio prezzo (es. S 10×4×3 cm → 10€, M 15×9×8 cm → 15€...).
- **Foto dei modelli**: carica una foto direttamente dal PC/telefono (salvata in locale in `public/uploads`) oppure incolla un URL esterno.
- **Registro stampe**: registra ogni stampa completata (quantità, costo unitario, data, note) → aggiorna automaticamente il magazzino disponibile.
- **Registro vendite**: registra ogni vendita (quantità, prezzo, acquirente, data) → blocca vendite superiori alla disponibilità in magazzino.
- **Dashboard**: totali di pezzi stampati/venduti/in magazzino, ricavi, costi, profitto netto, valore del magazzino, grafico degli ultimi 6 mesi, modelli più profittevoli, avviso scorte sotto la soglia minima.
- **Scheda modello**: storico completo di stampe e vendite per ogni singolo modello, con calcolo del profitto specifico e riepilogo delle misure/prezzi disponibili.
- **Dark mode**: tema chiaro, scuro o automatico (in base al sistema), con selettore rapido nella barra laterale (o nelle Impostazioni da smartphone).
- **Esportazione catalogo in PDF**: genera un PDF pronto per la stampa o l'invio ai clienti, così strutturato:
  1. Copertina con logo e nome dell'azienda.
  2. Pagina bianca.
  3. Indice con categorie e sottocategorie e relativo numero di pagina.
  4. Dalla quarta pagina, tabella a 3 colonne con nome dell'articolo, foto e misure disponibili con il prezzo per ciascuna taglia.
- **Impostazioni azienda**: nome e logo dell'azienda usati nella copertina del PDF, configurabili dalla pagina *Impostazioni*.
- **Installabile come app (PWA)**: da smartphone Android puoi "Aggiungere alla schermata Home" per usarla come una vera app, senza passare dal browser ogni volta.

## Stack tecnico

- [Next.js](https://nextjs.org/) (App Router, TypeScript) — sia frontend che API in un unico progetto
- [Prisma ORM](https://www.prisma.io/) + SQLite (`better-sqlite3`) — database locale su file, nessun server esterno da configurare
- Tailwind CSS — interfaccia, con supporto dark mode via `next-themes`
- Recharts — grafici della dashboard
- [PDFKit](https://pdfkit.org/) — generazione del catalogo in PDF lato server

Essendo un'app Node.js, **gira nativamente su Windows, macOS e Linux**. Il database è un singolo file SQLite (`dev.db`), non serve installare MySQL/Postgres.

## Requisiti

- [Node.js](https://nodejs.org/) 20 o superiore (consigliata la versione LTS) installato su Windows

## Avvio su Windows

1. Installa Node.js LTS da [nodejs.org](https://nodejs.org/) (installer `.msi`, next-next-finish).
2. Apri **PowerShell** (o Prompt dei comandi) nella cartella del progetto.
3. Installa le dipendenze (genera anche automaticamente il client del database):

   ```bash
   npm install
   ```

4. Copia il file d'esempio delle variabili d'ambiente:

   ```bash
   copy .env.example .env
   ```

5. Crea il database locale (solo la prima volta):

   ```bash
   npm run db:deploy
   ```

6. Avvia l'app in modalità sviluppo:

   ```bash
   npm run dev
   ```

   Oppure, per un utilizzo "in produzione" più stabile e performante:

   ```bash
   npm run build
   npm run start
   ```

7. Apri il browser su [http://localhost:3000](http://localhost:3000).

L'app resterà attiva finché la finestra del terminale rimane aperta. Per fermarla premi `Ctrl+C`.

## Controllo da smartphone Android (sulla stessa rete Wi-Fi)

L'app espone automaticamente un indirizzo di rete locale (visibile nel terminale accanto a `Local:`, es. `Network: http://192.168.1.23:3000`).

1. Assicurati che il PC Windows e il telefono Android siano collegati alla **stessa rete Wi-Fi**.
2. Se Windows lo richiede, consenti l'accesso a Node.js/Next.js nel firewall quando appare la finestra di richiesta permessi (o apri manualmente la porta 3000 nel Firewall di Windows Defender per reti private).
3. Sul telefono, apri il browser (Chrome) e vai all'indirizzo di rete mostrato dal terminale (es. `http://192.168.1.23:3000`).
4. Da Chrome, apri il menu (⋮) e scegli **"Aggiungi a schermata Home"**: l'app verrà installata come una vera app Android (icona, schermo intero, nessuna barra del browser), pur continuando a usare il PC Windows come server.

> Nota: il PC con `npm run start` (o `npm run dev`) attivo deve rimanere acceso e in rete perché l'app sia raggiungibile dal telefono. Per un utilizzo continuativo conviene lasciare il PC/server sempre acceso, oppure in futuro pubblicare l'app su un piccolo server sempre attivo (es. una mini-PC, un NAS o un hosting cloud).

## Script disponibili

| Comando               | Descrizione                                              |
| ---------------------- | --------------------------------------------------------- |
| `npm run dev`          | Avvia l'app in modalità sviluppo con ricaricamento live   |
| `npm run build`        | Crea la build di produzione                                |
| `npm run start`        | Avvia la build di produzione                               |
| `npm run lint`         | Controlla la qualità del codice                            |
| `npm run db:migrate`   | Crea/aggiorna il database in sviluppo (con migrazioni)     |
| `npm run db:deploy`    | Applica le migrazioni esistenti (uso consigliato al primo avvio) |
| `npm run db:studio`    | Apre un'interfaccia grafica per esplorare il database      |

## Struttura dei dati

- **Product** (modello del catalogo): nome, descrizione, categoria, sottocategoria, materiale, ore di stampa, costo unitario, prezzo, foto, scorta minima.
- **ProductVariant** (misure/prezzi): altezza, larghezza, profondità e prezzo per ogni taglia disponibile di un modello (es. S/M/L).
- **PrintLog** (registro stampe): modello collegato, quantità stampata, costo unitario al momento della stampa, data, note.
- **SaleLog** (registro vendite): modello collegato, quantità venduta, prezzo unitario al momento della vendita, data, acquirente, note.
- **Settings** (impostazioni azienda): nome azienda e logo, usati nella copertina del catalogo PDF.

Da questi dati l'app calcola in automatico, per ogni modello e in totale: pezzi stampati, pezzi venduti, giacenza a magazzino, ricavi, costo di produzione, costo del venduto (COGS) e profitto netto.

## Esportazione del catalogo in PDF

Dalla pagina **Catalogo**, il pulsante **"Esporta PDF"** genera e scarica un PDF con questa struttura:

1. **Copertina**: logo e nome dell'azienda (configurabili in **Impostazioni**).
2. **Pagina bianca**.
3. **Indice**: elenco di categorie e sottocategorie con il relativo numero di pagina.
4. **Tabella articoli** (dalla quarta pagina): 3 colonne con nome dell'articolo, foto e misure disponibili con il prezzo per ciascuna (es. `10×4×3 cm – 10€`, `15×9×8 cm – 15€`).

Le foto vengono incorporate nel PDF solo se in formato PNG o JPG (caricate tramite l'app o con URL diretto a un file `.png`/`.jpg`); altri formati mostrano un segnaposto "N/D".

## Backup dei dati

Tutti i dati sono salvati nel file `dev.db` nella cartella del progetto, e le foto caricate nella cartella `public/uploads`. Per fare un backup basta copiare questi elementi altrove; per ripristinarli, sostituiscili nella cartella del progetto (ad app spenta).

## Possibili estensioni future

- Pacchettizzare l'app come eseguibile Windows standalone (es. con Electron) per avere un'icona sul desktop senza aprire il terminale.
- Esportazione dati in Excel/CSV.
- App Android nativa dedicata (oggi la PWA copre già l'uso da smartphone tramite browser/installazione alla schermata Home).
