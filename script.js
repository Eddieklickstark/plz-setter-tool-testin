(function() {
    var SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR8BRATZeyiaD0NMh00CWU1bJYZA2XRYA3jrd_XRLg-wWV9UEh9hD___JLuiFZT8nalLamjKMJyc3MJ/pub?gid=0&single=true&output=csv';
    var WEBHOOK_URL = 'https://hook.eu2.make.com/t9xvbefzv5i8sjcr7u8tiyvau7t1wnlw';
    var aeMapping = {};
    var bundeslaender = [];
    var MAX_RETRIES = 3;

    // ... (kompletter Code unverändert bis updateUI)

    function updateUI(ae, bundesland) {
        var resultDiv = document.getElementById('ae-result');
        var calendlyDiv = document.getElementById('calendly-container');
        if (!resultDiv || !calendlyDiv) return;

        if (ae) {
            resultDiv.innerHTML = '<div class="ae-info">' +
                '<div class="ae-title"><p>Zuständiger Account Executive für ' + bundesland + '</p></div>' +
                '<div class="ae-details"><p><strong>Name:</strong> ' + ae.name + '</p></div>' +
            '</div>';

            calendlyDiv.innerHTML = '<div class="calendly-inline-widget" ' +
                'data-url="' + ae.calendlyLink + '?hide_event_type_details=1&hide_landing_page_details=1&background_color=ffffff&hide_title=1" ' +
                'style="min-width:320px;height:700px;"></div>';

            if (window.Calendly) {
                window.Calendly.initInlineWidget({
                    url: ae.calendlyLink + '?hide_event_type_details=1&hide_landing_page_details=1&background_color=ffffff&hide_title=1',
                    parentElement: calendlyDiv.querySelector('.calendly-inline-widget')
                });
            }
        } else {
            calendlyDiv.innerHTML = '<div class="calendly-placeholder">Bitte wählen Sie zuerst ein Bundesland aus, um den Kalender zu laden.</div>';
        }
    }

    // Event-Listener für calendly.event_scheduled
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

    // ... (Rest bleibt exakt gleich wie dein Code inkl. init, loadAEData, sendFormData, etc.)

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
