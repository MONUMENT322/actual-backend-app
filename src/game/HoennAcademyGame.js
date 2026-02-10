import React, { useMemo, useState } from 'react';

const STARTING_STATE = {
  day: 1,
  energy: 3,
  maxEnergy: 3,
  attack: 1,
  bond: 0,
  exp: 0,
  level: 1,
  badges: 0,
  hp: 24,
  maxHp: 24,
  endingUnlocked: null,
  log: ['Welcome to Hoenn Academy. Build your squad and survive the Rift season.']
};

const WEEKLY_BOSSES = [
  { name: 'Rustboro Colossus', hp: 14, damage: 3, badge: 'Stone' },
  { name: 'Mauville Surge Beast', hp: 18, damage: 4, badge: 'Dynamo' },
  { name: 'Fortree Sky Tyrant', hp: 22, damage: 5, badge: 'Feather' },
  { name: 'Sootopolis Rift Core', hp: 30, damage: 6, badge: 'Rain' }
];

const ACTIVITY_CARD = [
  { key: 'train', title: 'Train Squad', text: '+1 Attack, +2 EXP. Better damage for dungeon runs.' },
  { key: 'social', title: 'Hang with Teammates', text: '+2 Bond. Bond gives healing and true-ending potential.' },
  { key: 'job', title: 'Part-time Job', text: '+1 Max HP and full heal. Keeps late game stable.' },
  { key: 'dungeon', title: 'Rift Dive', text: 'Fight enemies for EXP and badges. Risky but required to win.' }
];

const styles = {
  root: {
    color: '#ecf4ff',
    minHeight: '100vh',
    padding: '2rem 1rem 3rem',
    maxWidth: '1000px',
    margin: '0 auto',
    textAlign: 'left'
  },
  card: {
    border: '1px solid #2f4168',
    background: '#162238',
    borderRadius: '12px',
    padding: '0.8rem'
  },
  statusGrid: {
    marginTop: '1rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0.75rem'
  },
  actionGrid: {
    marginTop: '1.2rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '0.8rem'
  },
  button: {
    color: 'inherit',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'block',
    width: '100%'
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  logList: {
    margin: 0,
    paddingLeft: '1rem'
  }
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function HoennAcademyGame() {
  const [game, setGame] = useState(STARTING_STATE);
  const weekIndex = Math.min(Math.floor((game.day - 1) / 25), WEEKLY_BOSSES.length - 1);
  const currentBoss = WEEKLY_BOSSES[weekIndex];

  const progress = useMemo(
    () => ({ day: `${game.day}/100`, boss: `${currentBoss.name} (${currentBoss.badge} Badge)` }),
    [game.day, currentBoss]
  );

  const addLog = (logs, message) => [message, ...logs].slice(0, 10);

  const levelUpIfNeeded = (draft) => {
    while (draft.exp >= draft.level * 8) {
      draft.exp -= draft.level * 8;
      draft.level += 1;
      draft.attack += 1;
      draft.maxHp += 2;
      draft.hp = draft.maxHp;
      draft.log = addLog(draft.log, `Level up! You reached level ${draft.level}. HP fully restored.`);
    }
  };

  const checkEndings = (draft) => {
    if (draft.hp <= 0) {
      draft.endingUnlocked = 'bad';
      draft.log = addLog(draft.log, 'Bad ending: your team collapsed in the Rift. Restart and plan your days better.');
      return;
    }

    if (draft.day > 100) {
      if (draft.badges >= 8 && draft.bond >= 20) {
        draft.endingUnlocked = 'true';
        draft.log = addLog(draft.log, 'True ending unlocked! You prevented the apocalypse and kept your whole squad together.');
      } else if (draft.badges >= 6) {
        draft.endingUnlocked = 'good';
        draft.log = addLog(draft.log, 'Good ending unlocked! Crisis stopped, but some relationships were left unresolved.');
      } else {
        draft.endingUnlocked = 'normal';
        draft.log = addLog(draft.log, 'Normal ending: you reached the final day without enough badges to fully stop the Rift.');
      }
    }
  };

  const onAction = (type) => {
    if (game.energy <= 0 || game.endingUnlocked) return;

    setGame((prev) => {
      const next = { ...prev, log: [...prev.log], energy: prev.energy - 1 };

      if (type === 'train') {
        next.attack += 1;
        next.exp += 2;
        next.log = addLog(next.log, 'Training complete: Attack increased and technique improved.');
      }
      if (type === 'social') {
        next.bond += 2;
        next.hp = clamp(next.hp + 3, 0, next.maxHp);
        next.log = addLog(next.log, 'You spent time with teammates. Bond increased and morale restored HP.');
      }
      if (type === 'job') {
        next.maxHp += 1;
        next.hp = next.maxHp;
        next.log = addLog(next.log, 'You worked an evening shift. Max HP rose and supplies restored your squad.');
      }
      if (type === 'dungeon') {
        const enemyHit = Math.floor(Math.random() * (currentBoss.damage + 1));
        const playerHit = next.attack + Math.floor(Math.random() * 4);
        next.hp = clamp(next.hp - enemyHit, 0, next.maxHp);
        next.exp += 4;
        if (playerHit >= currentBoss.hp / 3) {
          next.badges += 1;
          next.log = addLog(next.log, `Rift victory! You defeated an elite echo of ${currentBoss.name} and earned a badge fragment.`);
        } else {
          next.log = addLog(next.log, `Rift run cleared. You dealt ${playerHit} damage and took ${enemyHit}. Train more for boss-tier clears.`);
        }
      }

      levelUpIfNeeded(next);
      if (next.energy === 0) {
        next.day += 1;
        next.energy = next.maxEnergy;
        next.log = addLog(next.log, `Day ${next.day} begins. Choose wisely: only ${next.maxEnergy} actions today.`);
      }
      checkEndings(next);
      return next;
    });
  };

  const resetGame = () => setGame(STARTING_STATE);
  const h = React.createElement;

  return h(
    'div',
    { style: styles.root, className: 'rift-game' },
    h('header', null,
      h('h1', { style: { marginBottom: '0.25rem' } }, 'Hoenn Rift: 100-Day Protocol'),
      h('p', null, 'Build power, strengthen bonds, and clear badges before day 100.')
    ),
    h('section', { style: styles.statusGrid },
      ...[
        ['Day:', progress.day], ['Energy:', `${game.energy}/${game.maxEnergy}`], ['Level:', game.level],
        ['HP:', `${game.hp}/${game.maxHp}`], ['Attack:', game.attack], ['Bond:', game.bond],
        ['Badges:', game.badges], ['Current threat:', progress.boss]
      ].map(([k, v]) => h('div', { key: k, style: styles.card }, h('strong', null, `${k} `), String(v)))
    ),
    h('section', { style: styles.actionGrid },
      ...ACTIVITY_CARD.map((activity) => {
        const disabled = Boolean(game.endingUnlocked) || game.energy <= 0;
        return h(
          'button',
          {
            key: activity.key,
            type: 'button',
            onClick: () => onAction(activity.key),
            disabled,
            style: { ...styles.card, ...styles.button, ...(disabled ? styles.buttonDisabled : {}) }
          },
          h('span', { style: { display: 'block', fontWeight: 700, marginBottom: '0.35rem' } }, activity.title),
          h('small', { style: { opacity: 0.92 } }, activity.text)
        );
      })
    ),
    game.endingUnlocked && h('section', { style: { ...styles.card, marginTop: '1rem' } },
      h('h2', null, `Run complete: ${game.endingUnlocked.toUpperCase()} ENDING`),
      h('button', {
        type: 'button',
        onClick: resetGame,
        style: { marginTop: '0.5rem', padding: '0.55rem 0.8rem', borderRadius: '8px', border: 0, cursor: 'pointer' }
      }, 'Start New Run')
    ),
    h('section', { style: { ...styles.card, marginTop: '1rem' } },
      h('h3', null, 'Action Log'),
      h('ul', { style: styles.logList }, ...game.log.map((line, i) => h('li', { key: `${i}-${line}` }, line)))
    )
  );
}

export default HoennAcademyGame;
