// A Magyar Jósda — Hungarian proverb oracle
// Loads proverbs from data/proverbs.json, displays random proverb + meaning

const proverbs = [];
let lastIdx = -1;

const introsWithQ = [
  'A jósda így válaszol:',
  'Így szól a jóslat:',
  'A bölcsesség szava:',
  'A sors könyve ezt mondja:',
  'Az ősök szelleme üzeni:'
];
const introsNoQ = [
  'A jósda szól:',
  'Így szól a mondás:',
  'A bölcsesség:',
  'A sors:',
  'Ezt tartja a nép:'
];

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function ask() {
  if (proverbs.length === 0) return;

  const orb = document.getElementById('orb');
  const answerContainer = document.getElementById('answerContainer');
  const answer = document.getElementById('answer');
  const interactionArea = document.querySelector('.interaction-area');
  const btn = document.getElementById('askBtn');
  const q = document.getElementById('question');

  btn.disabled = true;
  answerContainer.classList.remove('visible');
  orb.classList.remove('glowing');
  orb.classList.add('shaking');
  
  // Hide interaction area smoothly
  interactionArea.style.opacity = '0';
  interactionArea.style.pointerEvents = 'none';

  setTimeout(() => {
    orb.classList.remove('shaking');
    interactionArea.style.display = 'none';

    let idx;
    do {
      idx = Math.floor(Math.random() * proverbs.length);
    } while (idx === lastIdx && proverbs.length > 1);
    lastIdx = idx;

    const entry = proverbs[idx];
    const hasQ = q.value.trim().length > 0;
    const intros = hasQ ? introsWithQ : introsNoQ;
    const intro = intros[Math.floor(Math.random() * intros.length)];

    const safeProverb = escapeHtml(entry.proverb);
    const safeMeaning = escapeHtml(entry.meaning);

    answer.innerHTML = `
      <div class="answer-intro">${intro}</div>
      <div class="answer-text">&bdquo;${safeProverb}&rdquo;</div>
      <div class="motif-divider"></div>
      <div class="answer-meaning">${safeMeaning}</div>
    `;

    // Show answer
    answerContainer.style.display = 'flex';
    // Small delay to allow display:flex to apply before adding opacity class for transition
    setTimeout(() => {
      answerContainer.classList.add('visible');
      orb.classList.add('glowing');
      btn.disabled = false;
    }, 50);
    
  }, 1600);
}

function reset() {
  const answerContainer = document.getElementById('answerContainer');
  const interactionArea = document.querySelector('.interaction-area');
  const orb = document.getElementById('orb');

  answerContainer.classList.remove('visible');
  orb.classList.remove('glowing');
  
  setTimeout(() => {
    answerContainer.style.display = 'none';
    interactionArea.style.display = 'block';
    
    setTimeout(() => {
      interactionArea.style.opacity = '1';
      interactionArea.style.pointerEvents = 'auto';
      document.getElementById('question').value = '';
      document.getElementById('question').focus();
    }, 50);
  }, 500); // Wait for fade out
}

// Init: load proverbs, wire up events
async function init() {
  const footer = document.getElementById('footer');
  const btn = document.getElementById('askBtn');

  try {
    const res = await fetch('data/proverbs.json');
    const data = await res.json();
    proverbs.push(...data);
    footer.innerHTML = `<p>oracle.gyoma.org &middot; ${proverbs.length} szólás a birtokunkban</p>`;
    btn.disabled = false;
  } catch (e) {
    footer.innerHTML = `<p>oracle.gyoma.org &middot; a szólások nem töltődtek be</p>`;
    btn.querySelector('.btn-text').textContent = 'Hiba: ' + e.message;
    btn.disabled = true;
    return;
  }

  btn.addEventListener('click', ask);
  document.getElementById('againBtn').addEventListener('click', reset);
  document.getElementById('question').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') ask();
  });
  
  // Allow clicking the orb to ask
  document.getElementById('orb').addEventListener('click', () => {
    if (!btn.disabled && document.querySelector('.interaction-area').style.opacity !== '0') {
      ask();
    }
  });
}

init();
