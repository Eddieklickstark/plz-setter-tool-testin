(function() {
    var SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR8BRATZeyiaD0NMh00CWU1bJYZA2XRYA3jrd_XRLg-wWV9UEh9hD___JLuiFZT8nalLamjKMJyc3MJ/pub?gid=0&single=true&output=csv';
    var WEBHOOK_URL = 'https://hook.eu2.make.com/t9xvbefzv5i8sjcr7u8tiyvau7t1wnlw';
    var aeMapping = {};
    var bundeslaender = [];

    function addStyles() {
        var css = document.createElement('style');
        css.type = 'text/css';
        css.innerHTML = [
            // Container Styles
            '.setter-tool { max-width: 800px; margin: 0 auto; padding: 20px; font-family: figtree, sans-serif; }',
            '.section { margin-bottom: 40px; background: white; padding: 24px; border-radius: 12px; }',
            
            // Bundesland Input Styles
            '.bundesland-section { margin-bottom: 24px; }',
            '.bundesland-input-container { position: relative; }',
            '#bundesland-input { width: 100%; padding: 16px; font-size: 16px; border: 1px solid #E5E7EB; border-radius: 10px; }',
            '#bundesland-input:focus { outline: none; border-color: #046C4E; box-shadow: 0 0 0 3px rgba(4, 108, 78, 0.1); }',
            '.bundesland-dropdown { position: absolute; width: 100%; max-height: 300px; overflow-y: auto; background: white; border: 1px solid #E5E7EB; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 1000; display: none; }',
            '.bundesland-option { padding: 12px 16px; cursor: pointer; }',
            '.bundesland-option:hover { background: #F3F4F6; }',
            
            // Form Styles
            '.form-section { margin-top: 32px; }',
            '.section-header { font-size: 24px; color: #111827; margin-bottom: 24px; font-weight: 600; padding-bottom: 8px; border-bottom: 1px solid #E5E7EB; }',
            '.form-group { margin-bottom: 24px; }',
            '.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }',
            '@media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }',
            
            // Input Styles
            '.ios-input, .ios-select { width: 100%; padding: 12px; border: 1px solid #E5E7EB; border-radius: 10px; font-size: 16px; background: #FAFAFA; }',
            '.ios-input:focus, .ios-select:focus { outline: none; border-color: #046C4E; background: #FFFFFF; box-shadow: 0 0 0 3px rgba(4, 108, 78, 0.1); }',
            '.ios-input.required { border-left: 3px solid #046C4E; }',
            '.ios-textarea { min-height: 120px; resize: vertical; width: 100%; }',
            
            // Button Styles
            '.ios-submit { background: #046C4E; color: white; padding: 16px 32px; border: none; border-radius: 10px; font-size: 16px; cursor: pointer; width: 100%; margin-top: 24px; transition: all 0.3s ease; }',
            '.ios-submit:hover { background: #065F46; }',
            
            // Calendly Container
            '#calendly-container { margin: 24px 0; border-radius: 12px; overflow: hidden; }'
        ].join('\n');
        document.head.appendChild(css);
    }

    function createFormStructure() {
        var formHtml = `
            <form id="contact-form" class="form-section">
                <h2 class="section-header">Kontaktinformationen</h2>
                
                <div class="form-group">
                    <h3 class="section-header">Flächeninformationen</h3>
                    <div class="form-grid">
                        <select class="ios-input required" name="flaechenart" required>
                            <option value="">Flächenart wählen*</option>
                            <option value="option1">Option 1</option>
                            <option value="option2">Option 2</option>
                        </select>
                        
                        <select class="ios-input required" name="flaechengroesse" required>
                            <option value="">Flächengröße wählen*</option>
                            <option value="size1">Size 1</option>
                            <option value="size2">Size 2</option>
                        </select>

                        <select class="ios-input required" name="stromverbrauch" required>
                            <option value="">Stromverbrauch wählen*</option>
                            <option value="usage1">Usage 1</option>
                            <option value="usage2">Usage 2</option>
                        </select>

                        <input type="number" class="ios-input required" name="standorte" placeholder="Anzahl der Standorte*" required>
                    </div>
                </div>

                <div class="form-group">
                    <h3 class="section-header">Standortinformationen</h3>
                    <div class="form-grid">
                        <input type="text" class="ios-input required" name="strasse" placeholder="Standort Straße*" required>
                        <input type="text" class="ios-input required" name="hausnummer" placeholder="Standort Hausnummer*" required>
                        <input type="text" class="ios-input required" name="plz" placeholder="Standort Postleitzahl*" required>
                        <input type="text" class="ios-input required" name="stadt" placeholder="Standort Stadt*" required>
                    </div>
                </div>

                <div class="form-group">
                    <h3 class="section-header">Unternehmensinformationen</h3>
                    <div class="form-grid">
                        <input type="text" class="ios-input required" name="firma" placeholder="Firma*" required>
                        <select class="ios-input required" name="branche" required>
                            <option value="">Branche wählen*</option>
                            <option value="branche1">Branche 1</option>
                            <option value="branche2">Branche 2</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <h3 class="section-header">Kontaktperson</h3>
                    <div class="form-grid">
                        <select class="ios-input required" name="anrede" required>
                            <option value="">Anrede wählen*</option>
                            <option value="herr">Herr</option>
                            <option value="frau">Frau</option>
                            <option value="divers">Divers</option>
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
                    <h3 class="section-header">Gesprächsnotiz</h3>
                    <textarea class="ios-input ios-textarea required" name="gespraechsnotiz" 
                        placeholder="Gesprächsnotiz - Bitte ausführlich den Verlauf des Telefonats protokollieren (mind. 3 Sätze/Zeilen). Jede zusätzliche Information hilft unseren Kollegen im Termin.*" required></textarea>
                </div>

                <button type="submit" class="ios-submit">Daten speichern</button>
            </form>
        `;

        var formContainer = document.createElement('div');
        formContainer.innerHTML = formHtml;
        document.querySelector('.setter-tool').appendChild(formContainer);
    }

    // ... [Bestehende Funktionen für Bundesland und Calendly bleiben gleich] ...

    function init() {
        addStyles();
        loadAEData();
        createFormStructure();
        
        // Event Listener für das Formular
        document.getElementById('contact-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            try {
                const response = await fetch(WEBHOOK_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    alert('Daten wurden erfolgreich gespeichert!');
                } else {
                    throw new Error('Netzwerk-Antwort war nicht ok');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Fehler beim Speichern der Daten. Bitte versuchen Sie es erneut.');
            }
        });
        
        // ... [Rest der Initialisierung bleibt gleich] ...
    }

    // ... [Rest des Codes bleibt gleich] ...
})();
