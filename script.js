(function() {
    var SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR8BRATZeyiaD0NMh00CWU1bJYZA2XRYA3jrd_XRLg-wWV9UEh9hD___JLuiFZT8nalLamjKMJyc3MJ/pub?gid=0&single=true&output=csv';
    var WEBHOOK_URL = 'https://hook.eu2.make.com/t9xvbefzv5i8sjcr7u8tiyvau7t1wnlw';
    var aeMapping = {};
    var bundeslaender = [];
    var MAX_RETRIES = 3;

    function addStyles() {
        var css = document.createElement('style');
        css.type = 'text/css';
        css.innerHTML = `
.setter-tool { max-width: 800px; margin: 0 auto; padding: 2rem; border-radius: 2rem; font-family: figtree, sans-serif; }
.section-header { font-size: 22px; color: #111827; margin-bottom: 16px; font-weight: 600; padding-bottom: 8px; border-bottom: 1px solid #E5E7EB; }
.subsection-header { font-size: 18px; color: #374151; margin: 16px 0; font-weight: 500; }
.bundesland-section { margin-bottom: 40px; }
.bundesland-input-container { position: relative; margin-bottom: 20px; }
.ios-input { width: 100%; padding: 12px; border: 1px solid #E5E7EB; border-radius: 10px; font-size: 16px; background: #FAFAFA; }
.ios-input:focus { outline: none; border-color: #046C4E; background: #FFFFFF; box-shadow: 0 0 0 3px rgba(4,108,78,0.1); }
.calendly-placeholder { background: #F9FAFB; border: 2px dashed #E5E7EB; border-radius: 12px; padding: 40px; text-align: center; color: #6B7280; min-height: 400px; display: flex; align-items: center; justify-content: center; }
#calendly-container { margin: 20px 0; border-radius: 12px; overflow: hidden; background: white; min-height: 400px; }
.form-section { margin-top: 40px; }
.form-group { margin-bottom: 32px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
@media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
.ios-textarea { min-height: 120px; resize: vertical; width: 100%; }
.ios-submit { background: #046C4E; color: white; padding: 16px 32px; border: none; border-radius: 10px; font-size: 16px; cursor: pointer; width: 100%; margin-top: 24px; transition: all 0.3s ease; }
.ios-submit:hover { background: #065F46; }
.ios-submit:disabled { background: #ccc; cursor: not-allowed; }
.ae-info { background: #f7fafc; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; font-size: 18px; }
.success-message { background-color: #28a745; color: #fff; text-align: center; border-radius: 12px; padding: 15px; margin-top: 10px; display: none; }
.success-message.show { display: block !important; }
.overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); display: none; align-items: center; justify-content: center; z-index: 9999; }
.overlay.show { display: flex !important; }
.spinner { width: 50px; height: 50px; border: 6px solid #f3f3f3; border-top: 6px solid #046C4E; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;
        document.head.appendChild(css);
    }

    function createStructure() {
        var container = document.querySelector('.setter-tool');
        if (!container) return;
        container.innerHTML = `
<div class="bundesland-section">
  <h2 class="section-header">Terminbuchung</h2>
  <h3 class="subsection-header">Schritt 1 - Calendly Termin buchen</h3>
  <div class="bundesland-input-container">
    <select id="bundesland-select" class="ios-input required">
      <option value="">Bundesland wählen...</option>
    </select>
  </div>
  <div id="ae-result"></div>
</div>
<div id="calendly-container">
  <div class="calendly-placeholder">Bitte wählen Sie zuerst ein Bundesland aus, um den Kalender zu laden.</div>
</div>
<h3 class="subsection-header">Schritt 2 - Daten eintragen</h3>
<p id="form-hint" style="background:#fff8db;border:1px solid #fcd34d;padding:12px;border-radius:8px;color:#92400e;font-size:14px;margin-bottom:24px;">
  Das Formular wird sichtbar, sobald ein Termin über Calendly gebucht wurde.
</p>
<form id="contact-form" class="form-section">
  <h2 class="section-header">Kontaktinformationen</h2>
  <input type="hidden" id="bundesland-hidden" name="bundesland" value="">
  <div class="form-group">
    <h3 class="subsection-header">Flächeninformationen</h3>
    <div class="form-grid">
      <select class="ios-input required" name="flaechenart" required>
        <option value="">Flächenart wählen*</option>
        <option value="Freifläche">Freifläche</option>
        <option value="Dachfläche">Dachfläche</option>
      </select>
      <select class="ios-input required" name="flaechengroesse" required>
        <option value="">Flächengröße wählen*</option>
        <option value="Weniger als 2.000qm">Weniger als 2.000qm</option>
        <option value="2.000 bis 4.000qm">2.000 bis 4.000qm</option>
        <option value="Mehr als 4.000qm">Mehr als 4.000qm</option>
      </select>
      <select class="ios-input required" name="stromverbrauch" required>
        <option value="">Stromverbrauch wählen*</option>
        <option value="unter 100.000 kWh">unter 100.000 kWh</option>
        <option value="100.000 - 500.000 kWh">100.000 - 500.000 kWh</option>
        <option value="500.000 - 1 Mio kWh">500.000 - 1 Mio kWh</option>
        <option value="über 1 Mio kWh">über 1 Mio kWh</option>
      </select>
      <input type="number" class="ios-input required" name="standorte" placeholder="Anzahl der Standorte*" required>
    </div>
  </div>
  <div class="form-group">
    <h3 class="subsection-header">Standortinformationen</h3>
    <div class="form-grid">
      <input type="text" class="ios-input required" name="strasse" placeholder="Standort Straße*" required>
      <input type="text" class="ios-input required" name="hausnummer" placeholder="Standort Hausnummer*" required>
      <input type="text" class="ios-input required" name="plz" placeholder="Standort Postleitzahl*" required>
      <input type="text" class="ios-input required" name="stadt" placeholder="Standort Stadt*" required>
    </div>
  </div>
  <div class="form-group">
    <h3 class="subsection-header">Unternehmensinformationen</h3>
    <div class="form-grid">
      <input type="text" class="ios-input required" name="firma" placeholder="Firma*" required>
      <select class="ios-input required" name="branche" required>
        <option value="">Branche wählen*</option>
        <option value="Glashersteller">Glashersteller</option>
        <option value="Investmentfirma">Investmentfirma</option>
        <option value="Sporthalle">Sporthalle</option>
        <option value="Privatperson">Privatperson</option>
        <option value="Stadien">Stadien</option>
        <option value="Brauerei">Brauerei</option>
        <option value="Isoliertechnik">Isoliertechnik</option>
        <option value="Vermögensverwaltung">Vermögensverwaltung</option>
        <option value="Spedition">Spedition</option>
        <option value="Bauprojektentwickler">Bauprojektentwickler</option>
        <option value="Textilindustrie">Textilindustrie</option>
        <option value="Maschinenbauunternehmen">Maschinenbauunternehmen</option>
        <option value="Metallindustrie">Metallindustrie</option>
        <option value="Immobilien">Immobilien</option>
        <option value="Elektroindustrie">Elektroindustrie</option>
        <option value="Dienstleistungen">Dienstleistungen</option>
        <option value="Lebensmittelindustrie">Lebensmittelindustrie</option>
        <option value="Logistik/Fulfillment">Logistik/Fulfillment</option>
        <option value="Rechenzentren">Rechenzentren</option>
        <option value="MedTech">MedTech</option>
        <option value="Entsorger">Entsorger</option>
        <option value="Automobilindustrie">Automobilindustrie</option>
        <option value="Möbelindustrie">Möbelindustrie</option>
        <option value="Gewerbeflächen">Gewerbeflächen</option>
        <option value="Elektroinstallation">Elektroinstallation</option>
        <option value="Verpackungstechnik">Verpackungstechnik</option>
        <option value="Recyclingtechnik">Recyclingtechnik</option>
        <option value="Farben- und Lackbranche">Farben- und Lackbranche</option>
        <option value="Hersteller von Batterien">Hersteller von Batterien</option>
        <option value="Landwirtschaft">Landwirtschaft</option>
        <option value="Kunststoffindustrie">Kunststoffindustrie</option>
        <option value="Papierindustrie">Papierindustrie</option>
        <option value="Großhandel">Großhandel</option>
        <option value="Druckerei">Druckerei</option>
        <option value="Behörde">Behörde</option>
        <option value="Geschlossen">Geschlossen</option>
        <option value="Frachtspeditionsdienst">Frachtspeditionsdienst</option>
        <option value="Lackindustrie">Lackindustrie</option>
        <option value="Elektrogeräte Hersteller">Elektrogeräte Hersteller</option>
      </select>
    </div>
  </div>
  <div class="form-group">
    <h3 class="subsection-header">Kontaktperson</h3>
    <div class="form-grid">
      <select class="ios-input required" name="anrede" required>
        <option value="">Anrede wählen*</option>
        <option value="herr">Herr</option>
        <option value="frau">Frau</option>
      </select>
      <div></div>
      <input type="text" class="ios-input required" name="vorname" placeholder="Vorname*" required>
      <input type="text" class="ios-input required" name="nachname" placeholder="Nachname*" required>
      <input type="text" class="ios-input required" name="position" placeholder="Position*" required>
      <input type="email" id="email-field" class="ios-input required" name="email" placeholder="E-Mail*" required>
      <input type="tel" class="ios-input required" name="festnetz" placeholder="Festnetznummer* – Nur Zahlen!" required>
      <input type="tel" class="ios-input" name="mobil" placeholder="Mobil – Nur Zahlen!">
      <input type="url" class="ios-input" name="linkedin" placeholder="LinkedIn Profil: https://www.linkedin.com/in/beispiel" style="grid-column: span 2;">
    </div>
  </div>
  <div class="form-group">
    <h3 class="subsection-header">Gesprächsnotiz*</h3>
    <textarea class="ios-input ios-textarea required" name="gespraechsnotiz" placeholder="Gesprächsnotiz – Bitte ausführlich protokollieren (mind. 3 Sätze).*" required></textarea>
  </div>
  <button type="submit" class="ios-submit">Informationen senden</button>
  <div class="success-message" id="success-message"><p>Daten wurden erfolgreich gespeichert!</p><p>Die Seite wird jetzt neu geladen</p></div>
</form>
<div class="overlay" id="loading-overlay"><div class="spinner"></div></div>
        `;
        var form = document.getElementById('contact-form');
        if (form) {
            form.style.display = 'none';
            form.style.opacity = '0';
        }
    }

    function updateBundeslandSelect() {
        var select = document.getElementById('bundesland-select');
        if (!select) return;
        select.innerHTML = '<option value="">Bundesland wählen...</option>';
        bundeslaender.forEach(function(bl) {
            select.innerHTML += '<option value="' + bl + '">' + bl + '</option>';
        });
    }

    function loadAEData() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', SHEET_URL, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                Papa.parse(xhr.responseText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: function(results) {
                        aeMapping = {};
                        bundeslaender = [];
                        results.data.forEach(function(row) {
                            if (row.Bundesland && row.name) {
                                var bl = row.Bundesland.trim();
                                aeMapping[bl] = {
                                    name: row.name.trim(),
                                    calendlyLink: (row.calendly_link || '').trim()
                                };
                                if (bundeslaender.indexOf(bl) === -1) bundeslaender.push(bl);
                            }
                        });
                        updateBundeslandSelect();
                    }
                });
            }
        };
        xhr.send();
    }

    function updateUI(ae, bl) {
        var res = document.getElementById('ae-result'),
            cal = document.getElementById('calendly-container');
        if (!res || !cal) return;
        if (ae && ae.calendlyLink) {
            res.innerHTML = '<div class="ae-info"><p><strong>Zuständig für ' + bl + ':</strong> ' + ae.name + '</p></div>';
            cal.innerHTML = '<div class="calendly-inline-widget" data-url="' + ae.calendlyLink + '?hide_gdpr_banner=1&hide_event_type_details=1&hide_landing_page_details=1&background_color=ffffff&hide_title=1" style="min-width:320px;height:700px;"></div>';
            if (window.Calendly) {
                window.Calendly.initInlineWidget({
                    url: ae.calendlyLink + '?hide_gdpr_banner=1&hide_event_type_details=1&hide_landing_page_details=1&background_color=ffffff&hide_title=1',
                    parentElement: cal.querySelector('.calendly-inline-widget')
                });
            }
        } else {
            cal.innerHTML = '<div class="calendly-placeholder">Bitte zuerst ein Bundesland wählen.</div>';
        }
    }

    async function sendFormData(data, attempt) {
        attempt = attempt || 1;
        try {
            var resp = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return resp.ok;
        } catch (err) {
            if (attempt < MAX_RETRIES) {
                await new Promise(r => setTimeout(r, 1500));
                return sendFormData(data, attempt + 1);
            }
            return false;
        }
    }

    function showLoadingOverlay() {
        document.getElementById('loading-overlay').classList.add('show');
    }

    function hideLoadingOverlay() {
        document.getElementById('loading-overlay').classList.remove('show');
    }

    function init() {
        addStyles();
        createStructure();
        loadAEData();

        var select = document.getElementById('bundesland-select');
        if (select) {
            select.addEventListener('change', function() {
                var v = this.value;
                document.getElementById('bundesland-hidden').value = v;
                if (v) updateUI(aeMapping[v], v);
            });
        }

        var form = document.getElementById('contact-form');
        if (form) {
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                var btn = form.querySelector('.ios-submit');
                if (btn) btn.disabled = true;
                showLoadingOverlay();
                var data = Object.fromEntries(new FormData(form).entries());
                var ok = await sendFormData(data);
                hideLoadingOverlay();
                if (ok) {
                    var msg = document.getElementById('success-message');
                    if (msg) msg.classList.add('show');
                    setTimeout(function() {
                        msg.classList.remove('show');
                        setTimeout(function() {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            window.location.reload();
                        }, 1000);
                    }, 2000);
                } else {
                    alert('Fehler beim Speichern. Bitte erneut versuchen.');
                    if (btn) btn.disabled = false;
                }
            });
        }

        window.addEventListener('message', function(e) {
            if (e.data.event === 'calendly.event_scheduled') {
                var email = e.data.payload?.invitee?.email;
                if (email) {
                    var inp = document.getElementById('email-field');
                    if (inp) inp.value = email;
                }
                var f = document.getElementById('contact-form'),
                    h = document.getElementById('form-hint');
                if (f) { f.style.display = 'block'; setTimeout(() => f.style.opacity = '1', 10); }
                if (h) h.style.display = 'none';
            }
        });
    }

    function loadDependencies() {
        var p = document.createElement('script');
        p.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js';
        p.onload = function() {
            var c = document.createElement('script');
            c.src = 'https://assets.calendly.com/assets/external/widget.js';
            c.async = true;
            c.onload = init;
            document.head.appendChild(c);
        };
        document.head.appendChild(p);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadDependencies);
    } else {
        loadDependencies();
    }

})();
