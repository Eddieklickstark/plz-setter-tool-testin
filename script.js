(function() {
    var SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR8BRATZeyiaD0NMh00CWU1bJYZA2XRYA3jrd_XRLg-wWV9UEh9hD___JLuiFZT8nalLamjKMJyc3MJ/pub?gid=0&single=true&output=csv';
    var WEBHOOK_URL = 'https://hook.eu2.make.com/t9xvbefzv5i8sjcr7u8tiyvau7t1wnlw';
    var aeMapping = {};
    var bundeslaender = [];

    function addStyles() {
        var css = document.createElement('style');
        css.type = 'text/css';
        css.innerHTML = [
            '.setter-tool { max-width: 800px; margin: 0 auto; padding: 2rem; border-radius: 2rem; font-family: figtree, sans-serif; }',
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

    function createStructure() {
        var container = document.querySelector('.setter-tool');
        if (!container) return;
        var html = `
            <div class="bundesland-section">
                <h2 class="section-header">Schritt 1: Terminbuchung</h2>
                <h3 class="subsection-header">Bundesland</h3>
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
                <h2 class="section-header">Schritt 2: Kontaktinformationen</h2>
                <input type="hidden" id="bundesland-hidden" name="bundesland" value="">
<div class="form-group">
                    <h3 class="subsection-header">Flächeninformationen</h3>
                    <div class="form-grid">
                        <!-- Formularfelder wie gehabt -->
                    </div>
                </div>
            </form>
        `;
        container.innerHTML = html;
    }

    function updateBundeslandSelect() {
        var select = document.getElementById('bundesland-select');
        if (!select) return;
        select.innerHTML = '<option value="">Bundesland wählen...</option>';
        bundeslaender.forEach(function(bundesland) {
            select.innerHTML += '<option value="' + bundesland + '">' + bundesland + '</option>';
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

    function updateUI(ae, bundesland) {
        var resultDiv = document.getElementById('ae-result');
        var calendlyDiv = document.getElementById('calendly-container');
        if (!resultDiv || !calendlyDiv) return;
        if (ae) {
            resultDiv.innerHTML = '<div class="ae-info">' +
                '<div class="ae-title"><p>Zuständiger Account Executive für ' + bundesland + ':</p></div>' +
                '<div class="ae-details"><p> ' + ae.name + '</p></div>' +
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

    function init() {
        addStyles();
        createStructure();
        loadAEData();
        var bundeslandSelect = document.getElementById('bundesland-select');
        if (bundeslandSelect) {
            bundeslandSelect.addEventListener('change', function() {
                var selectedBundesland = this.value;
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
                        // Scroll zum Anfang des Formulars
                        form.scrollIntoView({ behavior: 'smooth' });

                        // Erstelle Erfolgsmeldung
                        var successMessage = document.createElement('div');
                        successMessage.innerHTML = `
                            <div style="
                                background-color: #dcfce7;
                                border: 1px solid #22c55e;
                                color: #166534;
                                padding: 16px;
                                border-radius: 8px;
                                margin-bottom: 20px;
                                font-size: 16px;
                                font-weight: 500;
                                text-align: center;
                                position: relative;
                                z-index: 1000;
                            ">
                                ✓ Daten wurden erfolgreich gespeichert!
                            </div>
                        `;
                        
                        // Füge die Nachricht am Anfang des Formulars ein
                        form.insertBefore(successMessage, form.firstChild);

                        // Entferne die Nachricht nach 3 Sekunden
                        setTimeout(function() {
                            if (successMessage && successMessage.parentNode) {
                                successMessage.remove();
                            }
                        }, 3000);

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
