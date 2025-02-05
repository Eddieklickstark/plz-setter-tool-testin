(function() {
    var SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR8BRATZeyiaD0NMh00CWU1bJYZA2XRYA3jrd_XRLg-wWV9UEh9hD___JLuiFZT8nalLamjKMJyc3MJ/pub?gid=0&single=true&output=csv';
    var WEBHOOK_URL = 'https://hook.eu2.make.com/t9xvbefzv5i8sjcr7u8tiyvau7t1wnlw';
    var aeMapping = {};
    var bundeslaender = [];

    // Fügt CSS-Styles hinzu
    function addStyles() {
        var css = document.createElement('style');
        css.type = 'text/css';
        css.innerHTML = [
            '.setter-tool { max-width: 800px; margin: 0 auto; padding: 20px; font-family: figtree, sans-serif; }',
            '.section-header { font-size: 22px; color: #111827; margin-bottom: 16px; font-weight: 600; padding-bottom: 8px; border-bottom: 1px solid #E5E7EB; }',
            '.subsection-header { font-size: 18px; color: #374151; margin: 16px 0; font-weight: 500; }',
            '.bundesland-section { margin-bottom: 40px; }',
            '.bundesland-input-container { position: relative; margin-bottom: 20px; }',
            '.ios-input { width: 100%; padding: 12px; border: 1px solid #E5E7EB; border-radius: 10px; font-size: 16px; background: #FAFAFA; }',
            '.ios-input:focus { outline: none; border-color: #046C4E; background: #FFFFFF; box-shadow: 0 0 0 3px rgba(4, 108, 78, 0.1); }',
            '.calendly-placeholder { background: #F9FAFB; border: 2px dashed #E5E7EB; border-radius: 12px; padding: 40px; text-align: center; color: #6B7280; min-height: 400px; display: flex; align-items: center; justify-content: center; margin: 20px 0; }',
            '#calendly-container { margin: 20px 0; border-radius: 12px; overflow: hidden; background: white; min-height: 400px; }',
            '.form-section { margin-top: 40px; }',
            '.form-group { margin-bottom: 32px; }',
            '.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }',
            '@media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }',
            '.ios-textarea { min-height: 120px; resize: vertical; width: 100%; }',
            '.ios-submit { background: #046C4E; color: white; padding: 16px 32px; border: none; border-radius: 10px; font-size: 16px; cursor: pointer; width: 100%; margin-top: 24px; transition: all 0.3s ease; }',
            '.ios-submit:hover { background: #065F46; }',
            '.ae-info { background: #f7fafc; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; font-size: 18px; }'
        ].join('\n');
        document.head.appendChild(css);
    }

    // Baut die HTML-Struktur auf:
    // 1. Oben: Bundesland-Dropdown und AE-Info
    // 2. Calendly-Bereich
    // 3. Das Kontaktformular mit den statischen Optionen und dem unsichtbaren Bundesland-Feld
    function createStructure() {
        var container = document.querySelector('.setter-tool');
        if (!container) return;
        var html = `
            <div class="bundesland-section">
                <h2 class="section-header">Terminbuchung</h2>
                <h3 class="subsection-header">Unternehmensinformationen</h3>
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
            <form id="contact-form" class="form-section">
                <h2 class="section-header">Kontaktinformationen</h2>
                <!-- Unsichtbares Feld für Bundesland -->
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
                            <option value="Weniger als 2.000 Quadratmeter">Weniger als 2.000 Quadratmeter</option>
                            <option value="2.000 bis 4.000 Quadratmeter">2.000 bis 4.000 Quadratmeter</option>
                            <option value="Mehr als 4.000 Quadratmeter">Mehr als 4.000 Quadratmeter</option>
                        </select>
                        
                        <select class="ios-input required" name="stromverbrauch" required>
                            <option value="">Stromverbrauch wählen*</option>
                            <option value="Unter 100.000 kWh">Unter 100.000 kWh</option>
                            <option value="100.000 bis 500.000 kWh">100.000 bis 500.000 kWh</option>
                            <option value="500.000 bis 1.000.000 kWh">500.000 bis 1.000.000 kWh</option>
                            <option value="Über 1.000.000 kWh">Über 1.000.000 kWh</option>
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
                            <option value="MSP">MSP (Management-Dienstleistungsanbieter)</option>
                            <option value="another">Another option</option>
                            <option value="URP">URP (Unternehmensressourcenplanung)</option>
                            <option value="Regierung">Regierung/Militär</option>
                            <option value="Speicherungs-Dienstleistungsanbieter">Speicherungs-Dienstleistungsanbieter</option>
                            <option value="Dienstleistungsanbieter">Dienstleistungsanbieter</option>
                            <option value="Netzwerkausrüstungsunternehmen">Netzwerkausrüstungsunternehmen</option>
                            <option value="Grossunternehmen">Großunternehmen</option>
                            <option value="ASA">ASA (Applikationsserviceanbieter)</option>
                            <option value="Systemintegrator">Systemintegrator</option>
                            <option value="Klein_Mittelstaendige">Klein/Mittelständige Unternehmen</option>
                            <option value="Nicht_Management_ISV">Nicht-Management-ISV</option>
                            <option value="Management_ISV">Management ISV</option>
                            <option value="Daten_Telekom_OEM">Daten/Telekom-OEM</option>
                            <option value="Glashersteller">Glashersteller</option>
                            <option value="Investmentfirma">Investmentfirma</option>
                            <option value="Sporthalle">Sporthalle</option>
                            <option value="Privatperson">Privatperson</option>
                            <option value="Stadien">Stadien</option>
                            <option value="Brauerei">Brauerei</option>
                            <option value="Isoliertechnik">Isoliertechnik</option>
                            <option value="Vermoegensverwaltung">Vermögensverwaltung</option>
                            <option value="Spedition">Spedition</option>
                            <option value="Bauprojektentwickler">Bauprojektentwickler</option>
                            <option value="Textilindustrie">Textilindustrie</option>
                            <option value="Maschinenbauunternehmen">Maschinenbauunternehmen</option>
                            <option value="Metallindustrie">Metallindustrie</option>
                            <option value="Immobilien">Immobilien</option>
                            <option value="Elektroindustrie">Elektroindustrie</option>
                            <option value="Dienstleistungen">Dienstleistungen</option>
                            <option value="Lebensmittelindustrie">Lebensmittelindustrie</option>
                            <option value="Logistik_Fulfillment">Logistik/Fulfillment</option>
                            <option value="Rechenzentren">Rechenzentren</option>
                            <option value="MedTech">MedTech</option>
                            <option value="Entsorger">Entsorger</option>
                            <option value="Automobilindustrie">Automobilindustrie</option>
                            <option value="Moebelindustrie">Möbelindustrie</option>
                            <option value="Gewerbeflaechen">Gewerbeflächen</option>
                            <option value="Elektroinstallation">Elektroinstallation</option>
                            <option value="Verpackungstechnik">Verpackungstechnik</option>
                            <option value="Recyclingtechnik">Recyclingtechnik</option>
                            <option value="Farben_Lackbranche">Farben- und Lackbranche</option>
                            <option value="Hersteller_von_Batterien">Hersteller von Batterien</option>
                            <option value="Landwirtschaft">Landwirtschaft</option>
                            <option value="Kunststoffindustrie">Kunststoffindustrie</option>
                            <option value="Papierindustrie">Papierindustrie</option>
                            <option value="Grosshandel">Großhandel</option>
                            <option value="Druckerei">Druckerei</option>
                            <option value="Behoerde">Behörde</option>
                            <option value="Frachtspeditionsdienst">Frachtspeditionsdienst</option>
                            <option value="Lackindustrie">Lackindustrie</option>
                            <option value="Elektrogeraete_Hersteller">Elektrogeräte Hersteller</option>
                            <option value="Speicheraufruestung">Speicheraufrüstung</option>
                            <option value="Optische_Netze">Optische Netze</option>
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
                        <input type="email" class="ios-input required" name="email" placeholder="E-Mail*" required>
                        <input type="tel" class="ios-input required" name="festnetz" placeholder="Festnetznummer* - Nur Zahlen!" required>
                        <input type="tel" class="ios-input" name="mobil" placeholder="Mobil - Nur Zahlen!">
                        <input type="url" class="ios-input" name="linkedin" placeholder="LinkedIn Profil: https://www.linkedin.com/in/beispiel" style="grid-column: span 2;">
                    </div>
                </div>
                <div class="form-group">
                    <h3 class="subsection-header">Gesprächsnotiz*</h3>
                    <textarea class="ios-input ios-textarea required" name="gespraechsnotiz" 
                        placeholder="Gesprächsnotiz - Bitte ausführlich den Verlauf des Telefonats protokollieren (mind. 3 Sätze/Zeilen). Jede zusätzliche Information hilft unseren Kollegen im Termin.*" required></textarea>
                </div>
                <button type="submit" class="ios-submit">Informationen senden</button>
            </form>
        `;
        container.innerHTML = html;
    }

    // Füllt das Bundesland-Dropdown mit den Werten aus der Spalte "Bundesland" des Google Sheets
    function updateBundeslandSelect() {
        var select = document.getElementById('bundesland-select');
        if (!select) return;
        select.innerHTML = '<option value="">Bundesland wählen...</option>';
        bundeslaender.forEach(function(bundesland) {
            select.innerHTML += '<option value="' + bundesland + '">' + bundesland + '</option>';
        });
    }

    // Lädt die Daten aus dem Google Sheet, erstellt die Zuordnung Bundesland -> Account Executive und füllt das Dropdown
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
                                    calendlyLink: row.calendly_link ? row.calendly_link.trim() : ''
                                };
                                if (bundeslaender.indexOf(bl) === -1) {
                                    bundeslaender.push(bl);
                                }
                            }
                        });
                        updateBundeslandSelect();
                    }
                });
            }
        };
        xhr.send();
    }

    // Aktualisiert den Bereich mit der Account Executive-Info und lädt den entsprechenden Calendly-Widget
    function updateUI(ae, bundesland) {
        var resultDiv = document.getElementById('ae-result');
        var calendlyDiv = document.getElementById('calendly-container');
        if (!resultDiv || !calendlyDiv) return;
        if (ae) {
            resultDiv.innerHTML = '<div class="ae-info">' +
                '<h3 class="ae-title">Zuständiger Account Executive für ' + bundesland + ':</h3>' +
                '<div class="ae-details"><p><strong>Name:</strong> ' + ae.name + '</p></div>' +
                '</div>';
            if (ae.calendlyLink) {
                calendlyDiv.innerHTML = '<div class="calendly-inline-widget" ' +
                    'data-url="' + ae.calendlyLink + '?hide_gdpr_banner=1&hide_event_type_details=1&hide_landing_page_details=1&background_color=ffffff&hide_title=1" ' +
                    'style="min-width:320px;height:700px;">' +
                    '</div>';
                if (window.Calendly) {
                    window.Calendly.initInlineWidget({
                        url: ae.calendlyLink + '?hide_gdpr_banner=1&hide_event_type_details=1&hide_landing_page_details=1&background_color=ffffff&hide_title=1',
                        parentElement: calendlyDiv.querySelector('.calendly-inline-widget')
                    });
                }
            }
        }
    }

    // Initialisiert das Script: Fügt Styles hinzu, baut die Struktur auf, lädt die Daten und setzt die Event-Listener
    function init() {
        addStyles();
        createStructure();
        loadAEData();
        var bundeslandSelect = document.getElementById('bundesland-select');
        if (bundeslandSelect) {
            bundeslandSelect.addEventListener('change', function() {
                var selectedBundesland = this.value;
                // Aktualisiere auch das unsichtbare Feld im Formular
                document.getElementById('bundesland-hidden').value = selectedBundesland;
                if (selectedBundesland) {
                    updateUI(aeMapping[selectedBundesland], selectedBundesland);
                }
            });
        }
        var form = document.getElementById('contact-form');
        if (form) {
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData);
                try {
                    const response = await fetch(WEBHOOK_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    if (response.ok) {
                        alert('Daten wurden erfolgreich gespeichert!');
                        form.reset();
                    } else {
                        throw new Error('Netzwerk-Antwort war nicht ok');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Fehler beim Speichern der Daten. Bitte versuchen Sie es erneut.');
                }
            });
        }
    }

    function loadDependencies() {
        var papaScript = document.createElement('script');
        papaScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js';
        papaScript.onload = function() {
            var calendlyScript = document.createElement('script');
            calendlyScript.src = 'https://assets.calendly.com/assets/external/widget.js';
            calendlyScript.async = true;
            calendlyScript.onload = init;
            document.head.appendChild(calendlyScript);
        };
        document.head.appendChild(papaScript);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadDependencies);
    } else {
        loadDependencies();
    }
})();
