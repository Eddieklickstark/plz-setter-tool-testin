// PLZ-Input Handler anpassen
function handlePLZInput(event) {
    var plz = event.target.value.replace(/[^0-9]/g, '').slice(0, 5);
    event.target.value = plz;
    
    if (plz.length >= 3) {
        var plzPrefix = plz.substring(0, 3); // Nur die ersten 3 Stellen verwenden
        var foundAE = null;
        
        console.log('Suche AE für PLZ-Prefix:', plzPrefix);
        
        Object.keys(aeMapping).forEach(function(range) {
            var bounds = range.split('-');
            var start = parseInt(bounds[0], 10);
            var end = parseInt(bounds[1], 10);
            
            // PLZ-Prefix als Nummer konvertieren
            var prefixNum = parseInt(plzPrefix, 10);
            console.log('Vergleiche', prefixNum, 'mit Range', start, '-', end);
            
            if (prefixNum >= start && prefixNum <= end) {
                foundAE = aeMapping[range];
                console.log('AE gefunden:', foundAE);
            }
        });
        
        updateUI(foundAE, plz);
    } else {
        clearUI();
    }
}

// Daten aus Google Sheets laden verbessern
function loadAEData() {
    console.log('Starte Laden der AE Daten...');
    var xhr = new XMLHttpRequest();
    xhr.open('GET', SHEET_URL, true);
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            console.log('XHR Status:', xhr.status);
            if (xhr.status === 200) {
                console.log('Rohdaten erhalten:', xhr.responseText);
                
                Papa.parse(xhr.responseText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: function(results) {
                        console.log('Parse Ergebnis:', results);
                        
                        aeMapping = results.data.reduce(function(acc, row) {
                            if (row.plz_range && row.name) {
                                // Sicherstellen dass die PLZ-Range sauber ist
                                var range = row.plz_range.trim();
                                console.log('Verarbeite Range:', range);
                                
                                acc[range] = {
                                    name: row.name.trim(),
                                    region: row.region ? row.region.trim() : '',
                                    calendlyLink: row.calendly_link ? row.calendly_link.trim() : ''
                                };
                            }
                            return acc;
                        }, {});
                        
                        console.log('Finales AE Mapping:', aeMapping);
                    },
                    error: function(error) {
                        console.error('Papa Parse Fehler:', error);
                    }
                });
            } else {
                console.error('Fehler beim Laden der Daten. Status:', xhr.status);
            }
        }
    };
    
    xhr.onerror = function() {
        console.error('XHR Fehler beim Laden der Daten');
    };
    
    xhr.send();
}
