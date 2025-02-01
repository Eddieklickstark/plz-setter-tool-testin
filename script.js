(function() {
    var SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR8BRATZeyiaD0NMh00CWU1bJYZA2XRYA3jrd_XRLg-wWV9UEh9hD___JLuiFZT8nalLamjKMJyc3MJ/pub?gid=0&single=true&output=csv';
    var aeMapping = {};
    var bundeslaender = [];

    function addStyles() {
        var css = document.createElement('style');
        css.type = 'text/css';
        css.innerHTML = [
            '.setter-tool-container { max-width: 800px; margin: 0 auto; padding: 20px; }',
            '.setter-tool-heading { font-family: figtree, sans-serif; font-size: 35px; margin-bottom: 20px; color: #111827; line-height: 1.2; }',
            '.bundesland-input-container { position: relative; }',
            '#bundesland-input { width: 100%; padding: 16px; font-size: 16px; border: 1px solid #E5E7EB; border-radius: 8px; margin-bottom: 4px; font-family: figtree, sans-serif; }',
            '#bundesland-input:focus { outline: none; border-color: #046C4E; box-shadow: 0 0 0 3px rgba(4, 108, 78, 0.1); }',
            '.bundesland-dropdown { position: absolute; width: 100%; max-height: 300px; overflow-y: auto; background: white; border: 1px solid #E5E7EB; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); display: none; z-index: 1000; font-family: figtree, sans-serif; }',
            '.bundesland-option { padding: 12px 16px; cursor: pointer; font-family: figtree, sans-serif; }',
            '.bundesland-option:hover { background: #F3F4F6; }',
            '.ae-info { background: white; border: 1px solid #E5E7EB; border-radius: 8px; padding: 24px; margin: 20px 0; font-family: figtree, sans-serif; }',
            '.ae-title { color: #111827; font-size: 1.25rem; font-weight: 600; margin-bottom: 16px; font-family: figtree, sans-serif; }',
            '.ae-details { font-family: figtree, sans-serif; }',
            '.calendly-inline-widget { border-radius: 8px; overflow: hidden; margin-top: 20px; }'
        ].join('\n');
        document.head.appendChild(css);
    }

    function createStructure() {
        var container = document.createElement('div');
        container.className = 'setter-tool-container';
        container.innerHTML = [
            '<h2 class="setter-tool-heading">Bitte Bundesland angeben um Calendly zu laden.</h2>',
            '<div class="bundesland-input-container">',
            '   <input type="text" id="bundesland-input" placeholder="Bundesland eingeben..." autocomplete="off">',
            '   <div class="bundesland-dropdown"></div>',
            '</div>',
            '<div id="ae-result"></div>',
            '<div id="calendly-container"></div>'
        ].join('');
        
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

    function updateUI(ae, bundesland) {
        var resultDiv = document.getElementById('ae-result');
        var calendlyDiv = document.getElementById('calendly-container');
        
        if (!resultDiv || !calendlyDiv) return;
        
        if (ae) {
            resultDiv.innerHTML = [
                '<div class="ae-info">',
                '    <h3 class="ae-title">Zuständiger Closer für ' + bundesland + ':</h3>',
                '    <div class="ae-details">',
                '        <p><strong>Name:</strong> ' + ae.name + '</p>',
                '    </div>',
                '</div>'
            ].join('');
            
            if (ae.calendlyLink) {
                calendlyDiv.innerHTML = [
                    '<div class="calendly-inline-widget" ',
                    'data-url="' + ae.calendlyLink + '?hide_gdpr_banner=1&hide_event_type_details=1&hide_landing_page_details=1&background_color=ffffff&hide_title=1" ',
                    'style="min-width:320px;height:700px;">',
                    '</div>'
                ].join('');
                
                if (window.Calendly) {
                    window.Calendly.initInlineWidget({
                        url: ae.calendlyLink + '?hide_gdpr_banner=1&hide_event_type_details=1&hide_landing_page_details=1&background_color=ffffff&hide_title=1',
                        parentElement: calendlyDiv.querySelector('.calendly-inline-widget')
                    });
                }
            }
        } else {
            resultDiv.innerHTML = '';
            calendlyDiv.innerHTML = '';
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
        
        setInterval(loadAEData, 5 * 60 * 1000);
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
