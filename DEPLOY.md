# Deploy in produzione — 3DPrintSW

Guida per mettere online l'app con **dominio personalizzato** e **VPS Linux**, soluzione consigliata per uso definitivo con negozi clienti, ordini e catalogo sempre raggiungibile.

---

## Panoramica

```
Internet → https://catalogo.tuodominio.it
              ↓
         Caddy (HTTPS)
              ↓
         Next.js :3000 (PM2)
              ↓
    dev.db + public/uploads/
```

L'app usa **SQLite** e file locali: un VPS con disco persistente è la scelta ideale **senza modificare il codice**.

---

## Costi da sostenere

Prezzi indicativi **Italia, 2026** (IVA inclusa dove applicabile).

| Voce | Costo | Frequenza | Note |
|------|-------|-----------|------|
| **VPS** | 7 – 12 € | /mese | Cuore del servizio |
| **Dominio** (.it / .com) | 10 – 15 € | /anno | ~1 €/mese |
| **SSL (HTTPS)** | 0 € | — | Let's Encrypt via Caddy |
| **DNS** | 0 € | — | Cloudflare Free |
| **Email (opzionale)** | 0 – 4 € | /mese | Non obbligatoria per l'app |
| **Backup cloud (opzionale)** | 0 – 2 € | /mese | Consigliato |

### Totale realistico

| Profilo | Costo mensile |
|---------|----------------|
| **Minimo** (VPS + dominio) | **~8 – 10 €/mese** |
| **Consigliato** (+ backup cloud) | **~10 – 12 €/mese** |
| **Annuale** | **~100 – 140 €/anno** |

Nessun costo per: Node.js, PM2, Caddy, certificati SSL, Let's Encrypt.

---

## Soluzioni migliori qualità/prezzo

### VPS (hosting)

| Provider | Piano | Prezzo/mese | Perché |
|----------|-------|-------------|--------|
| **[Hetzner](https://www.hetzner.com/cloud)** CX23 | 2 vCPU, 4 GB RAM, 40 GB SSD | **~7 €** | Miglior rapporto Q/P in EU, affidabile |
| **[Contabo](https://contabo.com)** VPS S | 4 vCPU, 8 GB RAM | **~7 €** | Più RAM a parità di prezzo |
| **[OVH](https://www.ovhcloud.com/it/vps/)** VPS-1 | 4 vCPU, 8 GB RAM | **~10 €** | Datacenter IT/FR, supporto in italiano |

**Scelta consigliata:** Hetzner CX23 (Germania o Finlandia) per pochi negozi e catalogo medio.

### Dominio

| Provider | .it | .com | Note |
|----------|-----|------|------|
| **[Cloudflare Registrar](https://www.cloudflare.com/products/registrar/)** | — | ~10 €/anno | Prezzo al costo, DNS gratis integrato |
| **[Aruba](https://www.aruba.it)** | ~12 €/anno | ~10 €/anno | Supporto IT, interfaccia semplice |
| **[Register.it](https://www.register.it)** | ~15 €/anno | ~12 €/anno | Molto diffuso in Italia |

**Scelta consigliata:** dominio `.it` su **Aruba** o `.com` su **Cloudflare** se usi già Cloudflare per DNS.

### DNS

| Servizio | Costo | Note |
|----------|-------|------|
| **[Cloudflare](https://www.cloudflare.com)** | Gratis | CDN leggero, protezione base, facile |

### HTTPS

| Soluzione | Costo |
|-----------|-------|
| **Caddy** (auto Let's Encrypt) | Gratis |
| Nginx + Certbot | Gratis |

**Scelta consigliata:** **Caddy** — configurazione minima, rinnovo certificati automatico.

### Backup

| Soluzione | Costo | Note |
|-----------|-------|------|
| Script locale + cron (`scripts/backup.sh`) | Gratis | Copia su disco VPS |
| **[Backblaze B2](https://www.backblaze.com/cloud-storage)** | ~1 €/mese | ~10 GB, consigliato off-site |
| **Hetzner Storage Box** | ~4 €/mese | 1 TB, se già usi Hetzner |

**Scelta consigliata:** script giornaliero + copia settimanale su Backblaze B2 o Storage Box.

---

## Requisiti VPS

- **OS:** Ubuntu 24.04 LTS (64 bit)
- **RAM:** minimo 2 GB, consigliati **4 GB**
- **Disco:** minimo 20 GB, consigliati **40 GB**
- **Porte aperte:** 22 (SSH), 80 (HTTP), 443 (HTTPS)

---

## 1. Crea il VPS

1. Registrati su [Hetzner Cloud](https://console.hetzner.cloud) (o provider scelto).
2. Crea un progetto → **Add Server**.
3. Location: **Nuremberg** o **Helsinki**.
4. Image: **Ubuntu 24.04**.
5. Type: **CX23** (o equivalente).
6. Aggiungi la tua chiave SSH (consigliato) o password root.
7. Annota l'**IP pubblico** del server.

---

## 2. Registra il dominio e punta al VPS

Esempio: `catalogo.tuaazienda.it`

Nel pannello DNS del registrar (o Cloudflare):

| Tipo | Nome | Valore | TTL |
|------|------|--------|-----|
| **A** | `@` | `IP_DEL_VPS` | Auto |
| **A** | `www` | `IP_DEL_VPS` | Auto |

Propagazione DNS: da pochi minuti a 24 ore (di solito < 1 ora).

Verifica:

```bash
dig +short catalogo.tuaazienda.it
```

---

## 3. Configura il server

Connettiti via SSH:

```bash
ssh root@IP_DEL_VPS
```

### Utente dedicato (consigliato)

```bash
adduser deploy
usermod -aG sudo deploy
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
```

Poi accedi come `deploy@IP_DEL_VPS`.

### Pacchetti base

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential
```

### Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # deve essere v20.x
```

### Caddy (HTTPS automatico)

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

### Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 4. Installa l'applicazione

```bash
cd /home/deploy
git clone https://github.com/notaxeltv/3dprintSW.git
cd 3dprintSW
```

> Usa il branch `main` dopo il merge, oppure il branch feature finché non è mergiato.

### File `.env`

```bash
cp .env.example .env
nano .env
```

Contenuto **produzione** (esempio):

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="sostituisci-con-stringa-casuale-lunga-almeno-32-caratteri"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="password-sicura-di-tua-scelta"
NODE_ENV="production"
```

Genera un segreto casuale:

```bash
openssl rand -base64 32
```

### Build e database

```bash
npm install
npm run db:deploy
npm run build
```

---

## 5. Avvio con PM2 (sempre attivo)

```bash
sudo npm install -g pm2
pm2 start npm --name 3dprintsw -- start
pm2 save
pm2 startup
# Esegui il comando che PM2 stampa (sudo env PATH=...)
```

Comandi utili:

```bash
pm2 status
pm2 logs 3dprintsw
pm2 restart 3dprintsw
```

---

## 6. Configura Caddy

```bash
sudo nano /etc/caddy/Caddyfile
```

Sostituisci con il tuo dominio:

```
catalogo.tuaazienda.it {
    reverse_proxy localhost:3000
}
```

Riavvia Caddy:

```bash
sudo systemctl reload caddy
```

Apri `https://catalogo.tuaazienda.it/login` — dovresti vedere la pagina di accesso con lucchetto verde.

---

## 7. Primo accesso

1. Vai su `https://catalogo.tuaazienda.it/login`
2. Accedi con `ADMIN_USERNAME` / `ADMIN_PASSWORD` del `.env`
3. Cambia subito la password se hai usato quella di default
4. Da **Impostazioni** configura nome azienda e logo
5. Da **Negozi** crea il primo account negozio e condividi link + credenziali

Link per i negozi:

```
https://catalogo.tuaazienda.it/login
```

---

## 8. Backup

### Script incluso

```bash
chmod +x scripts/backup.sh
./scripts/backup.sh
```

I file vengono salvati in `backups/3dprintsw-YYYYMMDD-HHMMSS.tar.gz`.

### Backup automatico (ogni notte alle 3:00)

```bash
crontab -e
```

Aggiungi:

```cron
0 3 * * * APP_DIR=/home/deploy/3dprintSW /home/deploy/3dprintSW/scripts/backup.sh >> /home/deploy/backup.log 2>&1
```

### Cosa salvare

- `dev.db` — tutti i dati (catalogo, negozi, ordini, vendite)
- `public/uploads/` — foto modelli e logo

### Ripristino

```bash
cd /home/deploy/3dprintSW
pm2 stop 3dprintsw
tar -xzf backups/3dprintsw-YYYYMMDD-HHMMSS.tar.gz
pm2 start 3dprintsw
```

---

## 9. Aggiornamenti app

Dopo ogni nuova versione su GitHub:

```bash
cd /home/deploy/3dprintSW
pm2 stop 3dprintsw
git pull
npm install
npm run db:deploy
npm run build
pm2 start 3dprintsw
```

---

## 10. Checklist go-live

- [ ] VPS attivo e aggiornato
- [ ] Dominio puntato all'IP del VPS
- [ ] HTTPS funzionante (lucchetto verde)
- [ ] `.env` con `AUTH_SECRET` e password admin sicure
- [ ] `npm run db:deploy` eseguito
- [ ] PM2 avviato e `pm2 startup` configurato
- [ ] Backup automatico in cron
- [ ] Primo negozio di test creato
- [ ] Ordine di test inviato e ricevuto in **Ordini negozi**

---

## Risoluzione problemi

### L'app non risponde

```bash
pm2 logs 3dprintsw --lines 50
curl -I http://localhost:3000/login
```

### Errore certificato SSL

- Verifica che il DNS punti al VPS: `dig +short tuodominio.it`
- Porte 80 e 443 aperte: `sudo ufw status`
- Log Caddy: `sudo journalctl -u caddy -n 50`

### Errore database / migrazioni

```bash
cd /home/deploy/3dprintSW
npm run db:deploy
pm2 restart 3dprintsw
```

### Foto non visibili dopo deploy

Controlla che esista `public/uploads/` e che i permessi siano corretti:

```bash
ls -la public/uploads/
chmod -R u+rwX public/uploads/
```

---

## Migrazione da PC Windows

Se hai già dati in locale:

1. Ferma l'app sul PC
2. Copia `dev.db` e la cartella `public/uploads/` sul VPS (SCP, SFTP, WinSCP)
3. Mettili nella cartella del progetto sul VPS
4. Riavvia con PM2

Esempio da Windows (PowerShell con OpenSSH):

```powershell
scp dev.db deploy@IP_DEL_VPS:/home/deploy/3dprintSW/
scp -r public/uploads deploy@IP_DEL_VPS:/home/deploy/3dprintSW/public/
```

---

## Riepilogo costi annui (setup consigliato)

| Voce | Provider | Costo/anno |
|------|----------|------------|
| VPS CX23 | Hetzner | ~84 € |
| Dominio .it | Aruba | ~12 € |
| DNS + SSL | Cloudflare + Caddy | 0 € |
| Backup B2 (opz.) | Backblaze | ~12 € |
| **Totale** | | **~96 – 108 €/anno** |

Circa **8–9 € al mese** per un servizio completo, stabile e professionale.
