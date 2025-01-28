// PLZ Setter Tool für GIGA.GREEN
(function() {
    var SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR8BRATZeyiaD0NMh00CWU1bJYZA2XRYA3jrd_XRLg-wWV9UEh9hD___JLuiFZT8nalLamjKMJyc3MJ/pub?gid=0&single=true&output=csv';
    var aeMapping = {};

    // Styles einfügen
    function addStyles() {
        var css = document.createElement('style');
        css.type = 'text/css';
        css.innerHTML = [
            '.setter-tool-container {',
            '    max-width: 800px;',
            '    margin: 0 auto;',
            '    padding: 20px;',
            '}',
            
            '#plz-input {',
            '    width: 100%;',
            '    padding: 16px;',
            '    font-size: 16px;',
            '    border: 1px solid #E5E7EB;',
            '    border-radius: 8px;',
            '    margin-bottom: 20px;',
            '    background: #FFFFFF;',
            '    transition: all 0.3s ease;',
            '}',
            
            '#plz-input:focus {',
            '    outline: none;',
            '    border-color: #046C4E;',
            '    box-shadow: 0 0 0 3px rgba(4, 108, 78, 0.1);',
            '}',
            
            '.ae-info {',
            '    background: #FFFFFF;',
            '    border: 1px solid #E5E7EB;',
            '    border-radius: 8px;',
            '    padding: 24px;',
            '    margin-bottom: 24px;',
            '    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);',
            '}',
            
            '.ae-title {',
            '    color: #111827;',
            '    font-size: 1.25rem;',
            '    font-weight: 600;',
            '    margin-bottom: 16px;',
            '}',
            
            '.ae-details p {',
            '    margin: 12px 0;',
            '    color: #374151;',
            '    font-size: 1rem;',
            '    line-height: 1.5;',
            '}',
            
            '.ae-details strong {',
            '    color: #111827;',
            '    font-weight: 600;',
            '}',
            
            '.no-ae-found {',
            '    background: #FEF2F2;',
            '    border: 1px solid #FCA5A5;',
            '    color: #991B1B;',
            '    padding: 16px;',
            '    border-radius: 8px;',
            '    font-size: 0.95rem;',
            '}',
            
            '.calendly-inline-widget {',
            '    border-radius: 8px;',
            '    overflow: hidden;',
            '    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);',
            '    background: #FFFFFF;',
            '    margin-top: 20px;',
            '}',
            
            '#plz-input::placeholder {',
            '    color: #9CA3AF;',
            '}'
        ].join('\n');
        document.head.appendChild(css);
    }

    // HTML Struktur erstellen
    function createStructure() {
        var container = document.createElement('div');
        container.className = 'setter-tool-container';
        container.innerHTML = [
            '<input type="text" id="plz-input" placeholder="PLZ des Interessenten eingeben..." maxlength="5">',
            '<div id="ae-result"></div>',
            '<div id="calendly-container"></div>'
        ].join('');
        
        var targetElement = document.querySelector('[data-setter-tool]') || document.querySelector('.setter-tool');
        if (targetElement) {
            targetElement.appendChild(container);
        }
    }

    // Daten aus Google Sheets laden
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
                        results.data.forEach(function(row) {
                            if (row.plz_range && row.name) {
                                aeMapping[row.plz_range.trim()] = {
                                    name: row.name.trim(),
                                    region: row.region ? row.region.trim() : '',
                                    calendlyLink: row.calendly_link ? row.calendly_link.trim() : ''
                                };
                            }
                        });
                        console.log('AE Mapping geladen:', aeMapping);
                    }
                });
            }
        };
        xhr.send();
    }

    // PLZ-Range Check verbessert
    function isInRange(plz, range) {
        var bounds = range.split('-');
        var start = bounds[0];
        var end = bounds[1];
        
        // Extrahiere die relevanten Stellen für den Vergleich
        var plzPrefix = plz.substring(0, 3);
        var startPrefix = start.substring(0, 3);
        var endPrefix = end.substring(0, 3);
        
        // Vergleiche als Zahlen
        var plzNum = parseInt(plzPrefix, 10);
        var startNum = parseInt(startPrefix, 10);
        var endNum = parseInt(endPrefix, 10);
        
        return plzNum >= startNum && plzNum <= endNum;
    }

    // PLZ-Input Handler
    function handlePLZInput(event) {
        var plz = event.target.value.replace(/[^0-9]/g, '').slice(0, 5);
        event.target.value = plz;
        
        if (plz.length >= 3) {
            var foundAE = null;
            
            Object.keys(aeMapping).forEach(function(range) {
                if (isInRange(plz, range)) {
                    foundAE = aeMapping[range];
                }
            });
            
            updateUI(foundAE, plz);
        } else {
            clearUI();
        }
    }

    // UI Update
    function updateUI(ae, plz) {
        var resultDiv = document.getElementById('ae-result');
        var calendlyDiv = document.getElementById('calendly-container');
        
        if (!resultDiv || !calendlyDiv) return;
        
        if (ae) {
            resultDiv.innerHTML = [
                '<div class="ae-info">',
                '    <h3 class="ae-title">Zuständiger Closer für PLZ ' + plz + ':</h3>',
                '    <div class="ae-details">',
                '        <p><strong>Name:</strong> ' + ae.name + '</p>',
                '        <p><strong>Region:</strong> ' + ae.region + '</p>',
                '    </div>',
                '</div>'
            ].join('');
            
            if (ae.calendlyLink) {
                calendlyDiv.innerHTML = [
                    '<div class="calendly-inline-widget" ',
                    'data-url="' + ae.calendlyLink + '?hide_gdpr_banner=1" ',
                    'style="min-width:320px;height:700px;">',
                    '</div>'
                ].join('');
                
                if (window.Calendly) {
                    window.Calendly.initInlineWidget({
                        url: ae.calendlyLink,
                        parentElement: calendlyDiv.querySelector('.calendly-inline-widget')
                    });
                }
            }
        } else {
            resultDiv.innerHTML = '<div class="no-ae-found"><p>Kein zuständiger Closer für PLZ ' + plz + ' gefunden.</p></div>';
            calendlyDiv.innerHTML = '';
        }
    }

    // UI leeren
    function clearUI() {
        var resultDiv = document.getElementById('ae-result');
        var calendlyDiv = document.getElementById('calendly-container');
        if (resultDiv) resultDiv.innerHTML = '';
        if (calendlyDiv) calendlyDiv.innerHTML = '';
    }

    // Alles initialisieren
    function init() {
        addStyles();
        createStructure();
        loadAEData();
        
        var plzInput = document.getElementById('plz-input');
        if (plzInput) {
            plzInput.addEventListener('input', handlePLZInput);
        }
        
        setInterval(loadAEData, 5 * 60 * 1000);
    }

    // Dependencies laden
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

    // Starten
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadDependencies);
    } else {
        loadDependencies();
    }
})();
