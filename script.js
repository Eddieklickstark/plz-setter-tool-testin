// Aktualisierte createStructure Funktion - der Rest des Codes bleibt größtenteils gleich
function createStructure() {
    var container = document.createElement('div');
    container.className = 'setter-tool';
    container.innerHTML = `
        <!-- Bundesland & Calendly Section -->
        <div class="section top-section">
            <h2 class="section-header">Termin vereinbaren</h2>
            <div class="bundesland-input-container">
                <input type="text" id="bundesland-input" placeholder="Bundesland eingeben..." autocomplete="off">
                <div class="bundesland-dropdown"></div>
            </div>
            <div id="calendly-container" class="calendly-section"></div>
        </div>

        <!-- Formular Section -->
        <form class="section form-section" id="contact-form">
            <h2 class="section-header">Kontaktdaten erfassen</h2>
            
            <!-- Firmeninformationen -->
            <div class="form-group">
                <h3 class="subsection-header">Flächeninformationen</h3>
                <div class="form-grid">
                    <select class="ios-select required" name="flaechenart" required>
                        <option value="">Flächenart wählen*</option>
                        <option value="option1">Option 1</option>
                        <option value="option2">Option 2</option>
                    </select>

                    <select class="ios-select required" name="flaechengroesse" required>
                        <option value="">Flächengröße wählen*</option>
                        <option value="size1">Size 1</option>
                        <option value="size2">Size 2</option>
                    </select>

                    <select class="ios-select required" name="stromverbrauch" required>
                        <option value="">Stromverbrauch wählen*</option>
                        <option value="usage1">Usage 1</option>
                        <option value="usage2">Usage 2</option>
                    </select>

                    <input type="number" class="ios-input required" name="standorte" placeholder="Anzahl der Standorte*" required>
                </div>
            </div>

            <!-- Adressinformationen -->
            <div class="form-group">
                <h3 class="subsection-header">Standortinformationen</h3>
                <div class="form-grid">
                    <input type="text" class="ios-input required" name="strasse" placeholder="Standort Straße*" required>
                    <input type="text" class="ios-input required" name="hausnummer" placeholder="Standort Hausnummer*" required>
                    <input type="text" class="ios-input required" name="plz" placeholder="Standort Postleitzahl*" required>
                    <input type="text" class="ios-input required" name="stadt" placeholder="Standort Stadt*" required>
                </div>
            </div>

            <!-- Firmendaten -->
            <div class="form-group">
                <h3 class="subsection-header">Unternehmensinformationen</h3>
                <div class="form-grid">
                    <input type="text" class="ios-input required" name="firma" placeholder="Firma*" required>
                    <select class="ios-select required" name="branche" required>
                        <option value="">Branche wählen*</option>
                        <option value="branche1">Branche 1</option>
                        <option value="branche2">Branche 2</option>
                    </select>
                </div>
            </div>

            <!-- Kontaktinformationen -->
            <div class="form-group">
                <h3 class="subsection-header">Kontaktperson</h3>
                <div class="form-grid">
                    <select class="ios-select required" name="anrede" required>
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

            <!-- Gesprächsnotiz -->
            <div class="form-group">
                <h3 class="subsection-header">Gesprächsnotiz</h3>
                <textarea class="ios-input ios-textarea required" name="gespraechsnotiz" 
                    placeholder="Gesprächsnotiz - Bitte ausführlich den Verlauf des Telefonats protokollieren (mind. 3 Sätze/Zeilen). Jede zusätzliche Information hilft unseren Kollegen im Termin.*" required></textarea>
            </div>

            <button type="submit" class="ios-submit">Daten speichern</button>
        </form>
    `;
    
    var targetElement = document.querySelector('[data-setter-tool]') || document.querySelector('.setter-tool');
    if (targetElement) {
        targetElement.appendChild(container);
    }
}

// Zusätzliche Styles
function addStyles() {
    var css = document.createElement('style');
    css.type = 'text/css';
    css.innerHTML = [
        '.setter-tool { max-width: 800px; margin: 0 auto; padding: 20px; font-family: figtree, sans-serif; }',
        '.section { margin-bottom: 40px; background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }',
        '.section-header { font-size: 24px; color: #111827; margin-bottom: 20px; font-weight: 600; }',
        '.subsection-header { font-size: 18px; color: #374151; margin: 24px 0 16px; font-weight: 500; }',
        '.form-group { margin-bottom: 32px; }',
        '.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }',
        '@media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }',
        '.ios-input, .ios-select { width: 100%; padding: 12px; font-size: 16px; border: 1px solid #E5E7EB; border-radius: 10px; background: #FAFAFA; }',
        '.ios-input:focus, .ios-select:focus { outline: none; border-color: #046C4E; background: #FFFFFF; box-shadow: 0 0 0 3px rgba(4, 108, 78, 0.1); }',
        '.ios-textarea { min-height: 120px; resize: vertical; }',
        '.ios-submit { background: #046C4E; color: white; padding: 16px 32px; border: none; border-radius: 10px; font-size: 16px; cursor: pointer; width: 100%; margin-top: 24px; }',
        '.ios-submit:hover { background: #065F46; }',
        '.required { border-left: 3px solid #046C4E; }',
        '#bundesland-input { width: 100%; padding: 16px; font-size: 16px; border: 1px solid #E5E7EB; border-radius: 10px; margin-bottom: 16px; }',
        '.calendly-section { margin-top: 24px; }'
    ].join('\n');
    document.head.appendChild(css);
}
