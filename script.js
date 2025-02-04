(function() {
    var SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR8BRATZeyiaD0NMh00CWU1bJYZA2XRYA3jrd_XRLg-wWV9UEh9hD___JLuiFZT8nalLamjKMJyc3MJ/pub?gid=0&single=true&output=csv';
    var aeMapping = {};
    var bundeslaender = [];

    function addStyles() {
        var css = document.createElement('style');
        css.type = 'text/css';
        css.innerHTML = [
            '.setter-tool { max-width: 800px; margin: 0 auto; padding: 20px; font-family: figtree, sans-serif; }',
            '.section { margin-bottom: 40px; background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }',
            '.section-header { font-size: 24px; color: #111827; margin-bottom: 20px; font-weight: 600; }',
            '.section-hidden { display: none; }',
            '#bundesland-input { width: 100%; padding: 16px; font-size: 16px; border: 1px solid #E5E7EB; border-radius: 10px; }',
            '#bundesland-input:focus { outline: none; border-color: #046C4E; box-shadow: 0 0 0 3px rgba(4, 108, 78, 0.1); }',
            '.bundesland-dropdown { position: absolute; width: 100%; max-height: 300px; overflow-y: auto; background: white; border: 1px solid #E5E7EB; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 1000; }',
            '.bundesland-option { padding: 12px 16px; cursor: pointer; }',
            '.bundesland-option:hover { background: #F3F4F6; }',
            '.test-form { margin-top: 20px; }'
        ].join('\n');
        document.head.appendChild(css);
    }

    function createStructure() {
        var container = document.createElement('div');
        container.className = 'setter-tool';
        container.innerHTML = `
            <div class="section bundesland-section">
                <h2 class="section-header">1. Bundesland auswählen</h2>
                <div class="bundesland-input-container">
                    <input type="text" id="bundesland-input" placeholder="Bundesland eingeben..." autocomplete="off">
                    <div class="bundesland-dropdown"></div>
                </div>
            </div>

            <div class="section calendly-section section-hidden" id="calendly-container">
                <h2 class="section-header">2. Termin vereinbaren</h2>
                <!-- Calendly wird hier eingefügt -->
            </div>

            <div class="section form-section section-hidden" id="form-section">
                <h2 class="section-header">3. Daten erfassen</h2>
                <div class="test-form">
                    <p>Formular erscheint hier nach Terminvereinbarung</p>
                </div>
            </div>
        `;
        
        var targetElement = document.querySelector('[data-setter-tool]') || document.querySelector('.setter-tool');
        if (targetElement) {
            targetElement.appendChild(container);
        }
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
                                aeMapping[row.Bundesland.trim()] = {
                                    name: row.name.trim(),
                                    calendlyLink: row.calendly_link ? row.calendly_link.trim() : ''
                                };
                                bundeslaender.push(row.Bundesland.trim());
                            }
                        });
                        console.log('Daten geladen:', aeMapping);
                    }
                });
            }
        };
        xhr.send();
    }

    function updateDropdown(searchTerm) {
        var dropdown = document.querySelector('.bundesland-dropdown');
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

    function showSection(sectionId) {
        var section = document.getElementById(sectionId);
        if (section) {
            section.classList.remove('section-hidden');
        }
    }

    function updateUI(ae, bundesland) {
        var calendlyDiv = document.getElementById('calendly-container');
        
        if (ae && ae.calendlyLink) {
            // Zeige Calendly
            calendlyDiv.classList.remove('section-hidden');
            calendlyDiv.querySelector('h2').textContent = `2. Termin für ${bundesland} vereinbaren`;
            
            var widgetContainer = document.createElement('div');
            widgetContainer.className = 'calendly-inline-widget';
            widgetContainer.style = 'min-width:320px;height:700px;';
            widgetContainer.setAttribute('data-url', 
                ae.calendlyLink + '?hide_gdpr_banner=1&hide_event_type_details=1&hide_landing_page_details=1&background_color=ffffff&hide_title=1'
            );
            
            // Lösche vorhandenen Inhalt und füge Widget ein
            while (calendlyDiv.childNodes.length > 1) {
                calendlyDiv.removeChild(calendlyDiv.lastChild);
            }
            calendlyDiv.appendChild(widgetContainer);

            if (window.Calendly) {
                window.Calendly.initInlineWidget({
                    url: ae.calendlyLink + '?hide_gdpr_banner=1&hide_event_type_details=1&hide_landing_page_details=1&background_color=ffffff&hide_title=1',
                    parentElement: widgetContainer
                });
            }
            
            // Zeige Formular-Sektion
            showSection('form-section');
        }
    }

    function init() {
        addStyles();
        createStructure();
        loadAEData();
        
        var input = document.getElementById('bundesland-input');
        var dropdown = document.querySelector('.bundesland-dropdown');
        
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
