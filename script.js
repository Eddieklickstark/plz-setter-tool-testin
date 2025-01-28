// PLZ Setter Tool für GIGA.GREEN
(function() {
  var SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR8BRATZeyiaD0NMh00CWU1bJYZA2XRYA3jrd_XRLg-wWV9UEh9hD___JLuiFZT8nalLamjKMJyc3MJ/pub?gid=0&single=true&output=csv';
  var aeMapping = {};

  // Styles einfügen
  function addStyles() {
    var css = document.createElement('style');
    css.type = 'text/css';
    css.innerHTML = [
      '.setter-tool-container { max-width: 800px; margin: 0 auto; padding: 20px; }',
      '#plz-input { width: 100%; padding: 12px; font-size: 16px; border: 2px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px; }',
      '#plz-input:focus { outline: none; border-color: #4299e1; }',
      '.ae-info { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px; }',
      '.ae-title { color: #2d3748; font-size: 1.25rem; margin-bottom: 15px; }',
      '.ae-details p { margin: 8px 0; color: #4a5568; }',
      '.no-ae-found { background: #fff5f5; border: 1px solid #feb2b2; color: #c53030; padding: 15px; border-radius: 8px; }',
      '.no-calendly { color: #718096; padding: 15px; text-align: center; }'
    ].join('\n');
    document.head.appendChild(css);
  }

  // HTML Struktur einfügen
  function createStructure() {
    var container = document.createElement('div');
    container.className = 'setter-tool-container';
    container.innerHTML = [
      '<input type="text" id="plz-input" placeholder="PLZ des Interessenten eingeben..." maxlength="5">',
      '<div id="ae-result"></div>',
      '<div id="calendly-container"></div>'
    ].join('');
    
    // Container an der richtigen Stelle einfügen
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
            aeMapping = results.data.reduce(function(acc, row) {
              if (row.plz_range && row.name) {
                acc[row.plz_range.trim()] = {
                  name: row.name.trim(),
                  region: row.region ? row.region.trim() : '',
                  calendlyLink: row.calendly_link ? row.calendly_link.trim() : ''
                };
              }
              return acc;
            }, {});
          }
        });
      }
    };
    xhr.send();
  }

  // PLZ-Input Handler
  function handlePLZInput(event) {
    var plz = event.target.value.replace(/[^0-9]/g, '').slice(0, 5);
    event.target.value = plz;
    
    if (plz.length >= 3) {
      var plzNum = parseInt(plz, 10);
      var foundAE = null;
      
      Object.keys(aeMapping).forEach(function(range) {
        var bounds = range.split('-');
        var start = parseInt(bounds[0], 10);
        var end = parseInt(bounds[1], 10);
        
        if (plzNum >= start && plzNum <= end) {
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
          '<h3 class="ae-title">Zuständiger Closer für PLZ ' + plz + ':</h3>',
          '<div class="ae-details">',
            '<p><strong>Name:</strong> ' + ae.name + '</p>',
            '<p><strong>Region:</strong> ' + ae.region + '</p>',
          '</div>',
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

  // Alles initialisieren wenn DOM geladen ist
  function init() {
    // Styles hinzufügen
    addStyles();
    
    // HTML Struktur erstellen
    createStructure();
    
    // Daten laden
    loadAEData();
    
    // Event Listener hinzufügen
    var plzInput = document.getElementById('plz-input');
    if (plzInput) {
      plzInput.addEventListener('input', handlePLZInput);
    }
    
    // Periodische Aktualisierung
    setInterval(loadAEData, 5 * 60 * 1000);
  }

  // Papaparse laden und dann init ausführen
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

  // Starten wenn DOM bereit ist
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadDependencies);
  } else {
    loadDependencies();
  }
})();
