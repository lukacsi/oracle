// A Magyar Jósda — Hungarian proverb oracle
// Loads proverbs from data/proverbs.json, displays random proverb + meaning

const proverbs = [];
let lastIdx = -1;

const introsWithQ = [
  'A jósda így válaszol:',
  'Így szól a jóslat:',
  'A bölcsesség szava:',
  'A jóslat erre utal:',
  'A sors könyve ezt mondja:',
];
const introsNoQ = [
  'A jósda szól:',
  'Így szól a mondás:',
  'A bölcsesség:',
  'A sors:',
  'Ezt tartja a nép:',
];

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function ask() {
  if (proverbs.length === 0) return;

  const orb = document.getElementById('orb');
  const answer = document.getElementById('answer');
  const btn = document.getElementById('askBtn');
  const again = document.getElementById('againBtn');
  const q = document.getElementById('question');

  btn.disabled = true;
  answer.classList.remove('visible');
  again.classList.remove('visible');
  orb.classList.remove('glowing');
  orb.classList.add('shaking');

  setTimeout(() => {
    orb.classList.remove('shaking');

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

    answer.innerHTML =
      '<p class="answer-text">' +
      intro +
      '<span class="divider"></span>' +
      '\u201E' + safeProverb + '\u201D' +
      '</p>' +
      '<p class="answer-meaning">' + safeMeaning + '</p>';

    answer.classList.add('visible');
    orb.classList.add('glowing');
    btn.disabled = false;
    again.classList.add('visible');
  }, 1600);
}

function reset() {
  const answer = document.getElementById('answer');
  const again = document.getElementById('againBtn');
  const orb = document.getElementById('orb');

  answer.classList.remove('visible');
  again.classList.remove('visible');
  orb.classList.remove('glowing');
  document.getElementById('question').value = '';
  document.getElementById('question').focus();
}

// Init: load proverbs, wire up events
async function init() {
  const footer = document.getElementById('footer');
  const btn = document.getElementById('askBtn');

  try {
    const res = await fetch('data/proverbs.json');
    const data = await res.json();
    proverbs.push(...data);
    footer.textContent = 'oracle.gyoma.org \u00B7 ' + proverbs.length + ' szólás a birtokunkban';
    btn.disabled = false;
  } catch (e) {
    footer.textContent = 'oracle.gyoma.org \u00B7 a szólások nem töltődtek be';
    btn.textContent = 'Hiba: ' + e.message;
    btn.disabled = true;
    return;
  }

  btn.addEventListener('click', ask);
  document.getElementById('againBtn').addEventListener('click', reset);
  document.getElementById('question').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') ask();
  });
}

init();
