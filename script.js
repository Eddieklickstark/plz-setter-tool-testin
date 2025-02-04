(function() {
    var SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR8BRATZeyiaD0NMh00CWU1bJYZA2XRYA3jrd_XRLg-wWV9UEh9hD___JLuiFZT8nalLamjKMJyc3MJ/pub?gid=0&single=true&output=csv';
    var WEBHOOK_URL = 'https://hook.eu2.make.com/t9xvbefzv5i8sjcr7u8tiyvau7t1wnlw';
    var aeMapping = {};
    var bundeslaender = [];

    function addStyles() {
        var css = document.createElement('style');
        css.type = 'text/css';
        css.innerHTML = [
            // Vollständige CSS-Konfiguration wie im Originalcode
            '.setter-tool { max-width: 800px; margin: 0 auto; padding: 20px; font-family: figtree, sans-serif; }',
            // ... (restliche Styles aus dem Originalcode)
        ].join('\n');
        document.head.appendChild(css);
    }

    function createStructure() {
        var container = document.querySelector('.setter-tool');
        if (!container) {
            console.warn('Setter tool container nicht gefunden. Struktur wird nicht erstellt.');
            return;
        }

        // Calendly-Platzhalter und Formular-HTML wie im Originalcode
        var calendlyDiv = document.getElementById('calendly-container');
        if (calendlyDiv) {
            calendlyDiv.innerHTML = '<div class="calendly-placeholder">Bitte wählen Sie zuerst ein Bundesland aus, um den Kalender zu laden.</div>';
        }

        // Formular-HTML-Erstellung
        var formHtml = `
            <form id="contact-form" class="form-section">
                <!-- Vollständiges Formular-HTML wie im Originalcode -->
            </form>
        `;

        container.insertAdjacentHTML('beforeend', formHtml);
    }

    function loadAEData() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', SHEET_URL, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    Papa.parse(xhr.responseText, {
                        header: true,
                        skipEmptyLines: true,
                        complete: function(results) {
                            aeMapping = {};
                            bundeslaender = [];
                            results.data.forEach(function(row) {
                                if (row.Bundesland && row.name) {
                                    aeMapping[row.Bundesland.trim()] = {
                                        name: row.name.trim(),
                                        calendlyLink: row.calendly_link ? row.calendly_link.trim() : ''
                                    };
                                    bundeslaender.push(row.Bundesland.trim());
                                }
                            });
                            console.log('AE-Daten geladen:', aeMapping);
                        },
                        error: function(error) {
                            console.error('Fehler beim Parsen der AE-Daten:', error);
                        }
                    });
                } else {
                    console.error('Fehler beim Laden der AE-Daten. Status:', xhr.status);
                }
            }
        };
        xhr.onerror = function() {
            console.error('Netzwerkfehler beim Laden der AE-Daten');
        };
        xhr.send();
    }

    function updateDropdown(searchTerm) {
        var dropdown = document.querySelector('.bundesland-dropdown');
        if (!dropdown) {
            console.warn('Dropdown-Element nicht gefunden');
            return;
        }

        var filteredBundeslaender = bundeslaender.filter(function(bundesland) {
            return bundesland.toLowerCase().includes(searchTerm.toLowerCase());
        });

        if (filteredBundeslaender.length > 0 && searchTerm) {
            dropdown.style.display = 'block';
            dropdown.innerHTML = filteredBundeslaender.map(function(bundesland) {
                return '<div class="bundesland-option">' + bundesland + '</div>';
            }).join('');
        } else {
            dropdown.style.display = 'none';
        }
    }

    function updateUI(ae, bundesland) {
        var resultDiv = document.getElementById('ae-result');
        var calendlyDiv = document.getElementById('calendly-container');
        
        if (!resultDiv || !calendlyDiv) {
            console.warn('Ergebnis- oder Calendly-Container nicht gefunden');
            return;
        }
        
        if (ae) {
            resultDiv.innerHTML = '<div class="ae-info">' +
                '<h3 class="ae-title">Zuständiger Closer für ' + bundesland + ':</h3>' +
                '<div class="ae-details"><p><strong>Name:</strong> ' + ae.name + '</p></div>' +
                '</div>';
            
            if (ae.calendlyLink) {
                calendlyDiv.innerHTML = '<div class="calendly-inline-widget" ' +
                    'data-url="' + ae.calendlyLink + '?hide_gdpr_banner=1&hide_event_type_details=1&hide_landing_page_details=1&background_color=ffffff&hide_title=1" ' +
                    'style="min-width:320px;height:700px;">' +
                    '</div>';
                
                if (window.Calendly) {
                    try {
                        window.Calendly.initInlineWidget({
                            url: ae.calendlyLink + '?hide_gdpr_banner=1&hide_event_type_details=1&hide_landing_page_details=1&background_color=ffffff&hide_title=1',
                            parentElement: calendlyDiv.querySelector('.calendly-inline-widget')
                        });
                    } catch (error) {
                        console.error('Fehler beim Initialisieren von Calendly:', error);
                    }
                } else {
                    console.warn('Calendly-Bibliothek nicht geladen');
                }
            }
        }
    }

    function init() {
        // Debugging-Ausgaben hinzugefügt
        console.log('Initialisierung gestartet');
        
        addStyles();
        loadAEData();
        
        // Flexiblere Elementsuche
        var input = document.querySelector('[name="bundesland"]') || 
                    document.getElementById('bundesland-input');
        var dropdown = document.querySelector('.bundesland-dropdown');
        
        if (input && dropdown) {
            console.log('Dropdown-Ereignisse werden hinzugefügt');
            
            input.addEventListener('input', function() {
                updateDropdown(this.value);
            });
            
            document.addEventListener('click', function(e) {
                if (e.target.classList.contains('bundesland-option')) {
                    var selectedBundesland = e.target.textContent;
                    input.value = selectedBundesland;
                    dropdown.style.display = 'none';
                    updateUI(aeMapping[selectedBundesland], selectedBundesland);
                } else if (!e.target.classList.contains('bundesland-input')) {
                    dropdown.style.display = 'none';
                }
            });
            
            input.addEventListener('focus', function() {
                if (this.value) {
                    updateDropdown(this.value);
                }
            });
        } else {
            console.warn('Eingabe- oder Dropdown-Element nicht gefunden', input, dropdown);
        }

        var form = document.getElementById('contact-form');
        if (form) {
            console.log('Formular-Ereignisse werden hinzugefügt');
            
            form.addEventListener('submit', async function(e) {
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
                        form.reset();
                    } else {
                        throw new Error('Netzwerk-Antwort war nicht ok');
                    }
                } catch (error) {
                    console.error('Fehler beim Speichern:', error);
                    alert('Fehler beim Speichern der Daten. Bitte versuchen Sie es erneut.');
                }
            });
        } else {
            console.warn('Kontaktformular nicht gefunden');
        }
    }

    function loadDependencies() {
        console.log('Lade Abhängigkeiten');
        
        var papaScript = document.createElement('script');
        papaScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js';
        papaScript.onload = function() {
            console.log('PapaParse geladen');
            
            var calendlyScript = document.createElement('script');
            calendlyScript.src = 'https://assets.calendly.com/assets/external/widget.js';
            calendlyScript.async = true;
            calendlyScript.onload = function() {
                console.log('Calendly-Skript geladen');
                init();
            };
            calendlyScript.onerror = function() {
                console.error('Fehler beim Laden des Calendly-Skripts');
            };
            document.head.appendChild(calendlyScript);
        };
        papaScript.onerror = function() {
            console.error('Fehler beim Laden von PapaParse');
        };
        document.head.appendChild(papaScript);
    }

    // Initialisierung der Abhängigkeiten
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadDependencies);
    } else {
        loadDependencies();
    }
})();
