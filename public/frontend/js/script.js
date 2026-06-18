/**
 * Simulador de Autómatas Finitos - script.js
 * Gestiona el canvas interactivo y la comunicación con el backend.
 */

// Configuración dinámica del endpoint del backend (local vs. producción)
const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:5005'
    : 'https://simulador-de-automatas.onrender.com'; // Render backend URL

let cy = null;
let transitions = [];
let simulationHistory = [];
let currentStepIndex = -1;
let isPlaying = false;
let playInterval = null;

// Configuración inicial de Cytoscape
document.addEventListener('DOMContentLoaded', () => {
    initCytoscape();
    setupEventListeners();
    
    // Ejemplo inicial: Reconocedor de cadenas que terminan en '1'
    transitions = [
        { from: 'q0', symbol: '0', to: 'q0' },
        { from: 'q0', symbol: '1', to: 'q1' },
        { from: 'q1', symbol: '0', to: 'q0' },
        { from: 'q1', symbol: '1', to: 'q1' }
    ];
    renderTransitionsList();
    applyConfiguration();
});

function initCytoscape() {
    cy = cytoscape({
        container: document.getElementById('cy'),
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': '#1e293b',
                    'label': 'data(id)',
                    'color': '#fff',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'width': function(node) {
                        const label = node.data('id') || '';
                        return Math.max(50, label.length * 9 + 24);
                    },
                    'height': '50px',
                    'border-width': 2,
                    'border-color': '#4f46e5'
                }
            },
            {
                selector: 'node.final',
                style: {
                    'border-width': 5,
                    'border-style': 'double',
                    'border-color': '#fff'
                }
            },
            {
                selector: 'node.initial',
                style: {
                    'background-color': '#4f46e5'
                }
            },
            {
                selector: 'node.active',
                style: {
                    'background-color': '#3b82f6',
                    'transition-property': 'background-color',
                    'transition-duration': '0.3s',
                    'scale': 1.2
                }
            },
            {
                selector: 'node.active-accepted',
                style: {
                    'background-color': '#10b981',
                    'border-color': '#10b981',
                    'scale': 1.25
                }
            },
            {
                selector: 'node.active-rejected',
                style: {
                    'background-color': '#ef4444',
                    'border-color': '#ef4444',
                    'scale': 1.25
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': '#4b5563',
                    'target-arrow-color': '#4b5563',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'label': 'data(symbol)',
                    'color': '#94a3b8',
                    'font-size': '14px',
                    'text-margin-y': -10
                }
            },
            {
                selector: 'edge.active-edge',
                style: {
                    'width': 4,
                    'line-color': '#3b82f6',
                    'target-arrow-color': '#3b82f6',
                    'color': '#3b82f6',
                    'font-weight': 'bold',
                    'transition-property': 'line-color, width',
                    'transition-duration': '0.2s'
                }
            }
        ],
        layout: { name: 'grid', padding: 50 }
    });
}

function setupEventListeners() {
    // Añadir transición
    document.getElementById('add-transition').addEventListener('click', () => {
        const from = document.getElementById('trans-from').value.trim();
        const symbol = document.getElementById('trans-symbol').value.trim(); // ε es vacio
        const to = document.getElementById('trans-to').value.trim();

        if (from && to) {
            transitions.push({ from, symbol, to });
            renderTransitionsList();
            document.getElementById('trans-from').value = '';
            document.getElementById('trans-symbol').value = '';
            document.getElementById('trans-to').value = '';
        }
    });

    // Aplicar configuración
    document.getElementById('apply-config').addEventListener('click', applyConfiguration);

    // Controles de simulación
    document.getElementById('btn-play').addEventListener('click', startSimulation);
    document.getElementById('btn-pause').addEventListener('click', pauseSimulation);
    document.getElementById('btn-next').addEventListener('click', nextStep);
    document.getElementById('btn-reset').addEventListener('click', resetSimulation);
    document.getElementById('btn-fit').addEventListener('click', () => {
        if (cy) {
            cy.fit();
            cy.center();
        }
    });

    // Validación en tiempo real del input de cadena
    document.getElementById('input-string').addEventListener('input', (e) => {
        const value = e.target.value;
        if (value === '') {
            resetSimulation();
            return;
        }
        const validation = validateInputString(value);
        const status = document.getElementById('status-display');
        if (!validation.isValid) {
            status.innerHTML = `<i class="nf nf-fa-exclamation_triangle" style="color:var(--accent-red)"></i> Alfabeto no válido o símbolo no válido`;
            status.className = 'status-box rejected';
        } else {
            if (status.classList.contains('rejected') && (status.innerHTML.includes('válido') || status.innerHTML.includes('definido'))) {
                status.innerHTML = '<i class="nf nf-fa-ellipsis_h"></i> Esperando cadena...';
                status.className = 'status-box';
            }
        }
    });

    // Control del modal de confirmación para Limpiar Todo
    const confirmModal = document.getElementById('confirm-modal');
    const btnClearAll = document.getElementById('btn-clear-all');
    const modalBtnConfirm = document.getElementById('modal-btn-confirm');
    const modalBtnCancel = document.getElementById('modal-btn-cancel');

    if (btnClearAll) {
        btnClearAll.addEventListener('click', () => {
            confirmModal.classList.remove('hidden');
        });
    }

    const closeModal = () => {
        confirmModal.classList.add('hidden');
    };

    if (modalBtnCancel) {
        modalBtnCancel.addEventListener('click', closeModal);
    }
    if (confirmModal) {
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) {
                closeModal();
            }
        });
    }

    if (modalBtnConfirm) {
        modalBtnConfirm.addEventListener('click', () => {
            // Limpiar inputs
            document.getElementById('states-input').value = '';
            document.getElementById('alphabet-input').value = '';
            document.getElementById('initial-state-input').value = '';
            document.getElementById('final-states-input').value = '';
            document.getElementById('trans-from').value = '';
            document.getElementById('trans-symbol').value = '';
            document.getElementById('trans-to').value = '';
            
            // Limpiar transiciones internas
            transitions = [];
            renderTransitionsList();
            
            // Resetear simulación
            resetSimulation();
            
            // Limpiar cytoscape canvas
            if (cy) {
                cy.elements().remove();
            }
            
            closeModal();
        });
    }
}

function renderTransitionsList() {
    const list = document.getElementById('transitions-list');
    list.innerHTML = '';
    transitions.forEach((t, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>δ(${t.from}, ${t.symbol || 'ε'}) → ${t.to}</span>
            <button onclick="removeTransition(${index})" style="background:none; border:none; color:red; cursor:pointer;">×</button>
        `;
        list.appendChild(li);
    });
}

function removeTransition(index) {
    transitions.splice(index, 1);
    renderTransitionsList();
}

function applyConfiguration() {
    const statesStr = document.getElementById('states-input').value;
    const states = statesStr.split(',').map(s => s.trim());
    const finalStates = document.getElementById('final-states-input').value.split(',').map(s => s.trim());
    const initialState = document.getElementById('initial-state-input').value.trim();

    cy.elements().remove();

    states.forEach(id => {
        if (!id) return;
        let classes = '';
        if (id === initialState) classes += 'initial ';
        if (finalStates.includes(id)) classes += 'final';
        
        cy.add({
            group: 'nodes',
            data: { id: id },
            classes: classes,
            position: { x: Math.random() * 400, y: Math.random() * 400 }
        });
    });

    transitions.forEach((t, i) => {
        if (states.includes(t.from) && states.includes(t.to)) {
            cy.add({
                group: 'edges',
                data: { 
                    id: `e${i}`, 
                    source: t.from, 
                    target: t.to, 
                    symbol: t.symbol || 'ε' 
                }
            });
        }
    });

    cy.layout({ name: 'circle' }).run();
}

async function startSimulation() {
    if (currentStepIndex === -1) {
        // Nueva simulación
        const inputString = document.getElementById('input-string').value;

        // Validar si los caracteres de la cadena pertenecen al alfabeto
        const validation = validateInputString(inputString);
        if (!validation.isValid) {
            const status = document.getElementById('status-display');
            status.innerHTML = `<i class="nf nf-fa-exclamation_triangle" style="color:var(--accent-red)"></i> Símbolo del alfabeto no '${validation.invalidChar}' no está definido`;
            status.className = 'status-box rejected';
            isPlaying = false;
            clearInterval(playInterval);
            return;
        }

        const config = {
            states: document.getElementById('states-input').value.split(',').map(s => s.trim()),
            alphabet: document.getElementById('alphabet-input').value.split(',').map(s => s.trim()),
            transitions: transitions,
            initial_state: document.getElementById('initial-state-input').value.trim(),
            final_states: document.getElementById('final-states-input').value.split(',').map(s => s.trim()),
            input_string: inputString
        };

        try {
            const response = await fetch(`${BACKEND_URL}/simulate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            const data = await response.json();
            
            if (data.status === 'success') {
                simulationHistory = data.history;
                currentStepIndex = 0;
                displayStep();
            } else {
                alert("Error: " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert("No se pudo conectar con el backend (asegúrate de que app.py esté corriendo)");
        }
    }

    if (!isPlaying) {
        isPlaying = true;
        playInterval = setInterval(() => {
            if (currentStepIndex < simulationHistory.length - 1) {
                nextStep();
            } else {
                pauseSimulation();
            }
        }, 1000);
    }
}

function pauseSimulation() {
    isPlaying = false;
    clearInterval(playInterval);
}

function nextStep() {
    if (currentStepIndex < simulationHistory.length - 1) {
        currentStepIndex++;
        displayStep();
    }
}

function resetSimulation() {
    pauseSimulation();
    currentStepIndex = -1;
    simulationHistory = [];
    cy.nodes().removeClass('active');
    cy.nodes().removeClass('active-accepted');
    cy.nodes().removeClass('active-rejected');
    cy.edges().removeClass('active-edge');
    
    // Limpiar input de la cadena
    document.getElementById('input-string').value = '';
    
    const status = document.getElementById('status-display');
    status.innerHTML = '<i class="nf nf-fa-ellipsis_h"></i> Esperando cadena...';
    status.className = 'status-box';
}

function displayStep() {
    const step = simulationHistory[currentStepIndex];
    const status = document.getElementById('status-display');
    const inputString = document.getElementById('input-string').value;
    
    // Actualizar visualización en el canvas
    cy.nodes().removeClass('active');
    cy.nodes().removeClass('active-accepted');
    cy.nodes().removeClass('active-rejected');
    cy.edges().removeClass('active-edge');

    const isLastStep = currentStepIndex === simulationHistory.length - 1;

    step.active_states.forEach(stateId => {
        const node = cy.$id(stateId);
        node.addClass('active');
        if (isLastStep) {
            if (step.accepted) {
                node.addClass('active-accepted');
            } else {
                node.addClass('active-rejected');
            }
        }
    });

    // Iluminar transiciones activas
    if (currentStepIndex > 0) {
        const prevStep = simulationHistory[currentStepIndex - 1];
        const prevStates = prevStep.active_states;
        const currentSymbol = step.symbol;

        cy.edges().forEach(edge => {
            const src = edge.data('source');
            const tgt = edge.data('target');
            const sym = edge.data('symbol');

            const isSymbolTransition = prevStates.includes(src) && sym === currentSymbol && step.active_states.includes(tgt);
            const isEpsilonTransition = sym === 'ε' && step.active_states.includes(tgt) && (prevStates.includes(src) || step.active_states.includes(src));

            if (isSymbolTransition || isEpsilonTransition) {
                edge.addClass('active-edge');
            }
        });
    }

    // Actualizar panel de estado
    if (step.error) {
        status.innerHTML = `<i class="nf nf-fa-exclamation_triangle" style="color:var(--accent-red)"></i> Error: ${step.error}`;
        status.className = 'status-box rejected';
        pauseSimulation();
        return;
    }

    let description = "";
    if (step.symbol === null) {
        description = "Clausura inicial-ε";
    } else {
        description = `Leyendo '${step.symbol}'`;
    }

    let msg = `<div style="font-weight:600; margin-bottom:0.3rem;">Paso ${currentStepIndex}: ${description}</div>`;

    if (inputString) {
        let stringHtml = '<div class="string-visualization">';
        const tokens = tokenizeInputString(inputString);
        for (let i = 0; i < tokens.length; i++) {
            const isCurrentToken = (i === currentStepIndex - 1 && step.symbol !== null);
            if (isCurrentToken) {
                stringHtml += `<span class="char active">${tokens[i]}</span>`;
            } else {
                stringHtml += `<span class="char">${tokens[i]}</span>`;
            }
        }
        stringHtml += '</div>';
        msg += stringHtml;
    }
    
    if (isLastStep) {
        if (step.accepted) {
            msg += `<div style="margin-top:0.6rem; color:var(--accent-green); font-weight:bold; display:flex; align-items:center; gap:0.4rem;">
                <i class="nf nf-fa-check_circle"></i> CADENA ACEPTADA
            </div>`;
            status.className = 'status-box accepted';
        } else {
            msg += `<div style="margin-top:0.6rem; color:var(--accent-red); font-weight:bold; display:flex; align-items:center; gap:0.4rem;">
                <i class="nf nf-fa-times_circle"></i> CADENA RECHAZADA
            </div>`;
            status.className = 'status-box rejected';
        }
    } else {
        status.className = 'status-box';
    }
    
    status.innerHTML = msg;
}

// Funciones de validación de alfabeto
function getAlphabet() {
    const input = document.getElementById('alphabet-input').value.trim();
    if (!input) return [];
    return input.split(',').map(s => s.trim()).filter(s => s.length > 0);
}

function tokenizeInputString(inputStr) {
    const alphabet = getAlphabet();
    const sortedAlphabet = [...alphabet].sort((a, b) => b.length - a.length);
    const tokens = [];
    let i = 0;
    while (i < inputStr.length) {
        let matched = false;
        for (let sym of sortedAlphabet) {
            if (sym && inputStr.startsWith(sym, i)) {
                tokens.push(sym);
                i += sym.length;
                matched = true;
                break;
            }
        }
        if (!matched) {
            tokens.push(inputStr[i]);
            i++;
        }
    }
    return tokens;
}

function validateInputString(inputStr) {
    const alphabet = getAlphabet();
    const sortedAlphabet = [...alphabet].sort((a, b) => b.length - a.length);
    let i = 0;
    while (i < inputStr.length) {
        let matched = false;
        for (let sym of sortedAlphabet) {
            if (sym && inputStr.startsWith(sym, i)) {
                i += sym.length;
                matched = true;
                break;
            }
        }
        if (!matched) {
            return { isValid: false, invalidChar: inputStr[i] };
        }
    }
    return { isValid: true };
}
