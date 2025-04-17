(function() {
    var SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR8BRATZeyiaD0NMh00CWU1bJYZA2XRYA3jrd_XRLg-wWV9UEh9hD___JLuiFZT8nalLamjKMJyc3MJ/pub?gid=0&single=true&output=csv';
    var WEBHOOK_URL = 'https://hook.eu2.make.com/t9xvbefzv5i8sjcr7u8tiyvau7t1wnlw';
    var aeMapping = {};
    var bundeslaender = [];
    var MAX_RETRIES = 3;

    function updateUI(ae, bundesland) {
        var resultDiv = document.getElementById('ae-result');
        var calendlyDiv = document.getElementById('calendly-container');
        if (!resultDiv || !calendlyDiv) return;

        if (ae) {
            resultDiv.innerHTML = `
                <div class="ae-info">
                    <div class="ae-title"><p>Zuständiger Account Executive für ${bundesland}</p></div>
                    <div class="ae-details"><p><strong>Name:</strong> ${ae.name}</p></div>
                </div>
            `;

            calendlyDiv.innerHTML = '';
            if (window.Calendly) {
                Calendly.initInlineWidget({
                    url: ae.calendlyLink + '?hide_event_type_details=1&hide_landing_page_details=1&background_color=ffffff&hide_title=1',
                    parentElement: calendlyDiv
                });
            }
        } else {
            calendlyDiv.innerHTML = '<div class="calendly-placeholder">Bitte wählen Sie zuerst ein Bundesland aus, um den Kalender zu laden.</div>';
        }
    }

    window.addEventListener('message', function(e) {
        if (e.origin !== 'https://calendly.com') return;
        if (e.data.event === 'calendly.event_scheduled') {
            console.log('✅ Termin gebucht – Formular wird sichtbar.');
            console.log('🎯 Full Payload:', e.data.payload);

            var email = e.data.payload?.invitee?.email;
            if (email) {
                var emailInput = document.getElementById('email-field');
                if (emailInput) {
                    emailInput.value = email;
                    console.log('📧 E-Mail übertragen:', email);
                } else {
                    console.warn('⚠️ E-Mail-Feld (#email-field) nicht gefunden!');
                }
            } else {
                console.warn('⚠️ Keine E-Mail im Event Payload enthalten!');
            }

            const form = document.getElementById('contact-form');
            const hint = document.getElementById('form-hint');
            if (form) {
                form.style.display = 'block';
                setTimeout(() => form.style.opacity = '1', 10);
            }
            if (hint) hint.style.display = 'none';
        }
    });

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
                                if (!bundeslaender.includes(bl)) {
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

    function updateBundeslandSelect() {
        var select = document.getElementById('bundesland-select');
        if (!select) return;
        select.innerHTML = '<option value="">Bundesland wählen...</option>';
        bundeslaender.forEach(function(bundesland) {
            select.innerHTML += '<option value="' + bundesland + '">' + bundesland + '</option>';
        });
    }

    async function sendFormData(data, attempt = 1) {
        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) return true;
            else throw new Error('Nicht ok: ' + response.statusText);
        } catch (error) {
            console.error('Fehler beim Senden (Versuch ' + attempt + '):', error);
            if (attempt < MAX_RETRIES) {
                await new Promise(res => setTimeout(res, 1500));
                return sendFormData(data, attempt + 1);
            } else {
                return false;
            }
        }
    }

    function showLoadingOverlay() {
        var overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.classList.add('show');
    }

    function hideLoadingOverlay() {
        var overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.classList.remove('show');
    }

    function init() {
        loadAEData();

        const waitForElements = setInterval(() => {
            const form = document.getElementById('contact-form');
            const select = document.getElementById('bundesland-select');
            if (form && select) {
                clearInterval(waitForElements);

                select.addEventListener('change', function() {
                    const selected = this.value;
                    document.getElementById('bundesland-hidden').value = selected;
                    if (selected) updateUI(aeMapping[selected], selected);
                });

                form.addEventListener('submit', async function(e) {
                    e.preventDefault();
                    const submitBtn = form.querySelector('.ios-submit');
                    if (submitBtn) submitBtn.disabled = true;
                    showLoadingOverlay();

                    const formData = new FormData(form);
                    const data = Object.fromEntries(formData.entries());

                    const success = await sendFormData(data);
                    hideLoadingOverlay();

                    if (success) {
                        var msg = document.getElementById('success-message');
                        if (msg) msg.classList.add('show');
                        setTimeout(() => window.location.reload(), 3000);
                    } else {
                        alert('Fehler beim Speichern der Daten.');
                        if (submitBtn) submitBtn.disabled = false;
                    }
                });
            }
        }, 100);
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
