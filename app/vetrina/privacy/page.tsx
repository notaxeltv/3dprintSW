import type { Metadata } from "next";
import LegalPage from "@/components/vetrina/LegalPage";
import { formatLegalContact, getLegalSettings } from "@/lib/legal";
import { buildVetrinaMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getLegalSettings();
  return buildVetrinaMetadata({
    title: "Privacy Policy",
    description: `Informativa privacy di ${settings.companyName} sul trattamento dei dati personali.`,
    path: "/privacy",
    noIndex: false,
  });
}

export default async function PrivacyPolicyPage() {
  const settings = await getLegalSettings();
  const contact = formatLegalContact(settings);
  const updated = new Date().toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <LegalPage title="Privacy Policy">
      <p className="lead">
        Ultimo aggiornamento: {updated}. La presente informativa descrive come{" "}
        <strong>{settings.companyName}</strong> tratta i dati personali in conformità al Regolamento UE
        2016/679 (GDPR) e al D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018.
      </p>

      <h2>1. Titolare del trattamento</h2>
      <ul>
        {contact.map((line) => (
          <li key={line}>{line}</li>
        ))}
        {!settings.privacyEmail && (
          <li>
            Email: configura un indirizzo in Impostazioni → Link social → Email
          </li>
        )}
      </ul>

      <h2>2. Tipologie di dati trattati</h2>
      <p>Possiamo trattare le seguenti categorie di dati:</p>
      <ul>
        <li>
          <strong>Dati di navigazione</strong> — indirizzo IP, tipo di browser, pagine visitate, cookie
          tecnici (vedi Cookie Policy).
        </li>
        <li>
          <strong>Dati di contatto</strong> — se ci contatti via email o social, trattiamo i dati che
          ci fornisci volontariamente.
        </li>
        <li>
          <strong>Dati degli account negozio/admin</strong> — username e attività gestionale riservati
          all&apos;area Dashboard autenticata (sottodominio app.).
        </li>
      </ul>

      <h2>3. Finalità e base giuridica</h2>
      <ul>
        <li>
          <strong>Erogazione del sito vetrina e del catalogo</strong> — legittimo interesse / esecuzione
          di misure precontrattuali (art. 6.1.b e 6.1.f GDPR).
        </li>
        <li>
          <strong>Gestione ordini e rapporti con negozi partner</strong> — esecuzione del contratto
          (art. 6.1.b GDPR).
        </li>
        <li>
          <strong>Adempimenti legali</strong> — obbligo di legge (art. 6.1.c GDPR).
        </li>
        <li>
          <strong>Sicurezza e prevenzione abusi</strong> — legittimo interesse (art. 6.1.f GDPR).
        </li>
      </ul>

      <h2>4. Conservazione</h2>
      <p>
        I dati sono conservati per il tempo necessario alle finalità indicate e, in ogni caso, nei limiti
        previsti dalla legge. I log tecnici di navigazione sono conservati per un periodo limitato salvo
        obblighi diversi.
      </p>

      <h2>5. Destinatari e trasferimenti</h2>
      <p>
        I dati possono essere trattati da fornitori che supportano l&apos;hosting del sito (es. provider
        VPS, servizi email) nominati responsabili del trattamento. Non vendiamo dati personali a terzi.
        Eventuali trasferimenti extra-UE avvengono solo con garanzie adeguate (clausole contrattuali
        standard o decisioni di adeguatezza).
      </p>

      <h2>6. Diritti dell&apos;interessato</h2>
      <p>Hai diritto di:</p>
      <ul>
        <li>accedere ai tuoi dati e ottenerne copia;</li>
        <li>chiedere rettifica, cancellazione o limitazione del trattamento;</li>
        <li>opporti al trattamento e revocare il consenso ove applicabile;</li>
        <li>proporre reclamo al Garante per la Protezione dei Dati Personali (www.garanteprivacy.it).</li>
      </ul>
      <p>
        Per esercitare i tuoi diritti scrivi a:{" "}
        {settings.privacyEmail ? (
          <a href={`mailto:${settings.privacyEmail}`}>{settings.privacyEmail}</a>
        ) : (
          "l&apos;indirizzo email indicato in Impostazioni"
        )}
        .
      </p>

      <h2>7. Minori</h2>
      <p>
        Il sito non è destinato a minori di 16 anni. Non raccogliamo consapevolmente dati di minori senza
        consenso dei genitori o tutori.
      </p>

      <h2>8. Modifiche</h2>
      <p>
        Possiamo aggiornare questa informativa. La data di ultimo aggiornamento è indicata in alto. Ti
        invitiamo a consultarla periodicamente.
      </p>
    </LegalPage>
  );
}
