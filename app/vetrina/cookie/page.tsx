import type { Metadata } from "next";
import LegalPage from "@/components/vetrina/LegalPage";
import { formatLegalContact, getLegalSettings } from "@/lib/legal";
import { buildVetrinaMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getLegalSettings();
  return buildVetrinaMetadata({
    title: "Cookie Policy",
    description: `Informazioni sui cookie utilizzati dal sito di ${settings.companyName}.`,
    path: "/cookie",
  });
}

export default async function CookiePolicyPage() {
  const settings = await getLegalSettings();
  const contact = formatLegalContact(settings);
  const updated = new Date().toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <LegalPage title="Cookie Policy">
      <p className="lead">
        Ultimo aggiornamento: {updated}. Questa pagina spiega come{" "}
        <strong>{settings.companyName}</strong> utilizza cookie e tecnologie simili sul sito vetrina.
      </p>

      <h2>1. Cosa sono i cookie</h2>
      <p>
        I cookie sono piccoli file di testo salvati sul tuo dispositivo quando visiti un sito web. Servono
        a far funzionare il sito, ricordare preferenze o raccogliere informazioni statistiche aggregate.
      </p>

      <h2>2. Cookie che utilizziamo</h2>

      <h3>Cookie tecnici (necessari)</h3>
      <p>
        Sono indispensabili per il funzionamento del sito. Senza di essi alcune funzionalità non sarebbero
        disponibili. Non richiedono consenso ai sensi della normativa vigente.
      </p>
      <table>
        <thead>
          <tr>
            <th>Nome / chiave</th>
            <th>Finalità</th>
            <th>Durata</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>3dprintsw-cookie-consent</code></td>
            <td>Memorizza l&apos;accettazione del banner cookie</td>
            <td>Persistente (localStorage)</td>
          </tr>
          <tr>
            <td><code>session</code> (solo area Dashboard)</td>
            <td>Autenticazione utenti admin/negozio sul sottodominio app.</td>
            <td>Sessione / scadenza configurata</td>
          </tr>
          <tr>
            <td>Preferenza tema (chiaro/scuro)</td>
            <td>Ricorda la scelta del tema grafico</td>
            <td>Persistente</td>
          </tr>
        </tbody>
      </table>

      <h3>Cookie analitici</h3>
      <p>
        Al momento <strong>non utilizziamo</strong> cookie di profilazione o analytics di terze parti (es.
        Google Analytics) sul sito vetrina. Qualora venissero introdotti, questa pagina sarà aggiornata e
        verrà richiesto il consenso ove necessario.
      </p>

      <h3>Cookie di terze parti</h3>
      <p>
        I link ai social network (Instagram, Facebook, ecc.) presenti nel sito portano a piattaforme esterne
        che possono impostare propri cookie quando vi accedi. Consulta le rispettive informative privacy.
      </p>

      <h2>3. Come gestire i cookie</h2>
      <p>
        Puoi disabilitare i cookie dalle impostazioni del browser. La disabilitazione dei cookie tecnici può
        limitare alcune funzionalità del sito. Per eliminare i cookie già salvati, usa le funzioni del tuo
        browser (Chrome, Firefox, Safari, Edge).
      </p>

      <h2>4. Titolare del trattamento</h2>
      <ul>
        {contact.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <h2>5. Contatti</h2>
      <p>
        Per domande sui cookie o sul trattamento dei dati:{" "}
        {settings.privacyEmail ? (
          <a href={`mailto:${settings.privacyEmail}`}>{settings.privacyEmail}</a>
        ) : (
          "configura l&apos;email in Impostazioni admin"
        )}
        . Per maggiori dettagli consulta la{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>
    </LegalPage>
  );
}
