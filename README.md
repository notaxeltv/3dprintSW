# 3DPrintSW

Applicazione web per gestire il **catalogo dei modelli 3D**, registrare le **stampe** e le **vendite**, e monitorare in automatico **magazzino, costi, ricavi e profitto**. Sostituisce il classico foglio Excel con un'app sempre aggiornata, utilizzabile dal PC Windows e anche dallo smartphone Android sulla stessa rete.

## Funzionalità

- **Catalogo modelli**: crea, modifica ed elimina i modelli 3D (nome, categoria, materiale, ore di stampa, costo unitario, prezzo di vendita, immagine, scorta minima).
- **Registro stampe**: registra ogni stampa completata (quantità, costo unitario, data, note) → aggiorna automaticamente il magazzino disponibile.
- **Registro vendite**: registra ogni vendita (quantità, prezzo, acquirente, data) → blocca vendite superiori alla disponibilità in magazzino.
- **Dashboard**: totali di pezzi stampati/venduti/in magazzino, ricavi, costi, profitto netto, valore del magazzino, grafico degli ultimi 6 mesi, modelli più profittevoli, avviso scorte sotto la soglia minima.
- **Scheda modello**: storico completo di stampe e vendite per ogni singolo modello, con calcolo del profitto specifico.
- **Installabile come app (PWA)**: da smartphone Android puoi "Aggiungere alla schermata Home" per usarla come una vera app, senza passare dal browser ogni volta.

## Stack tecnico

- [Next.js](https://nextjs.org/) (App Router, TypeScript) — sia frontend che API in un unico progetto
- [Prisma ORM](https://www.prisma.io/) + SQLite (`better-sqlite3`) — database locale su file, nessun server esterno da configurare
- Tailwind CSS — interfaccia
- Recharts — grafici della dashboard

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

- **Product** (modello del catalogo): nome, descrizione, categoria, materiale, ore di stampa, costo unitario, prezzo, scorta minima.
- **PrintLog** (registro stampe): modello collegato, quantità stampata, costo unitario al momento della stampa, data, note.
- **SaleLog** (registro vendite): modello collegato, quantità venduta, prezzo unitario al momento della vendita, data, acquirente, note.

Da questi dati l'app calcola in automatico, per ogni modello e in totale: pezzi stampati, pezzi venduti, giacenza a magazzino, ricavi, costo di produzione, costo del venduto (COGS) e profitto netto.

## Backup dei dati

Tutti i dati sono salvati nel file `dev.db` nella cartella del progetto. Per fare un backup basta copiare questo file altrove; per ripristinarlo, sostituiscilo nella cartella del progetto (ad app spenta).

## Possibili estensioni future

- Pacchettizzare l'app come eseguibile Windows standalone (es. con Electron) per avere un'icona sul desktop senza aprire il terminale.
- Esportazione dati in Excel/CSV.
- App Android nativa dedicata (oggi la PWA copre già l'uso da smartphone tramite browser/installazione alla schermata Home).
