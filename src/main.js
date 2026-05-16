const propertyOptions = {
  flexDirection: ['row', 'row-reverse', 'column', 'column-reverse'],
  justifyContent: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'],
  alignItems: ['flex-start', 'center', 'flex-end', 'stretch'],
  flexWrap: ['nowrap', 'wrap', 'wrap-reverse'],
  gap: ['0px', '8px', '16px', '24px']
};

const levels = [
  {
    title: '第一關：升空前排隊',
    shortTitle: '升空前排隊',
    story: '三艘補給艇要停在發射台右側，練習主軸上的 justify-content。',
    hint: '保持 row，將主軸內容推到終點。',
    cargo: ['燃料', '水', '工具'],
    target: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      flexWrap: 'nowrap',
      gap: '8px'
    }
  },
  {
    title: '第二關：垂直補給梯',
    shortTitle: '垂直補給梯',
    story: '補給艇要改成垂直升降，並全部貼近下方維修區。',
    hint: 'column 會把主軸轉成垂直方向；justify-content 也會跟著改變作用方向。',
    cargo: ['零件', '醫療箱', '電池'],
    target: {
      flexDirection: 'column',
      justifyContent: 'flex-end',
      alignItems: 'center',
      flexWrap: 'nowrap',
      gap: '8px'
    }
  },
  {
    title: '第三關：平均分配軌道',
    shortTitle: '平均分配軌道',
    story: '太空站要讓四個貨櫃平均分散在整條軌道上，避免碰撞。',
    hint: '比較 space-between、space-around 與 space-evenly 的差異。',
    cargo: ['A1', 'B2', 'C3', 'D4'],
    target: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexWrap: 'nowrap',
      gap: '0px'
    }
  },
  {
    title: '第四關：反向降落序列',
    shortTitle: '反向降落序列',
    story: '指揮官要求貨櫃從右到左排，並停在中央線上。',
    hint: 'row-reverse 會反轉排列順序；align-items 控制交叉軸對齊。',
    cargo: ['一號', '二號', '三號'],
    target: {
      flexDirection: 'row-reverse',
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'nowrap',
      gap: '16px'
    }
  },
  {
    title: '第五關：擁擠貨艙換行',
    shortTitle: '擁擠貨艙換行',
    story: '六件貨物塞不進同一排，請開啟換行並保留安全間距。',
    hint: 'flex-wrap 允許內容換行；gap 讓每個盒子保持距離。',
    cargo: ['氧氣', '糧食', '晶片', '雷達', '種子', '電纜'],
    target: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '24px'
    }
  }
];

const initialSettings = {
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  flexWrap: 'nowrap',
  gap: '0px'
};

let levelIndex = 0;
let settings = { ...initialSettings };
let completed = new Set();
let showTarget = true;

const nodes = {
  score: document.querySelector('#score'),
  levels: document.querySelector('#levels'),
  missionLabel: document.querySelector('#mission-label'),
  missionTitle: document.querySelector('#mission-title'),
  missionStory: document.querySelector('#mission-story'),
  missionHint: document.querySelector('#mission-hint'),
  playerBay: document.querySelector('#player-bay'),
  targetBay: document.querySelector('#target-bay'),
  targetPanel: document.querySelector('#target-panel'),
  controls: document.querySelector('#controls'),
  codePreview: document.querySelector('#code-preview'),
  status: document.querySelector('#status'),
  resetButton: document.querySelector('#reset-button'),
  targetButton: document.querySelector('#target-button'),
  nextButton: document.querySelector('#next-button')
};

function applyFlexStyles(element, source) {
  Object.assign(element.style, source);
}

function renderCargo(element, cargo) {
  element.replaceChildren(
    ...cargo.map((item) => {
      const cargoBox = document.createElement('div');
      cargoBox.className = 'cargo';
      cargoBox.innerHTML = `<span>${item}</span>`;
      return cargoBox;
    })
  );
}

function isSolved() {
  return Object.entries(levels[levelIndex].target).every(([property, value]) => settings[property] === value);
}

function renderLevels() {
  nodes.levels.replaceChildren(
    ...levels.map((level, index) => {
      const button = document.createElement('button');
      button.className = `level-button ${index === levelIndex ? 'is-active' : ''}`;
      button.innerHTML = `<span>${index + 1}. ${level.shortTitle}</span>${completed.has(index) ? '<span aria-label="已完成">✓</span>' : ''}`;
      button.addEventListener('click', () => goToLevel(index));
      return button;
    })
  );
}

function renderControls() {
  nodes.controls.replaceChildren(
    ...Object.keys(propertyOptions).map((property) => {
      const label = document.createElement('label');
      label.className = 'control';
      label.innerHTML = `<span>${toCssName(property)}</span>`;

      const select = document.createElement('select');
      select.value = settings[property];
      propertyOptions[property].forEach((option) => {
        const optionNode = document.createElement('option');
        optionNode.value = option;
        optionNode.textContent = option;
        select.append(optionNode);
      });
      select.addEventListener('change', (event) => {
        settings[property] = event.target.value;
        render();
      });
      label.append(select);
      return label;
    })
  );
}

function toCssName(property) {
  return property.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function renderCode() {
  nodes.codePreview.textContent = `.cargo-bay {\n  display: flex;\n  flex-direction: ${settings.flexDirection};\n  justify-content: ${settings.justifyContent};\n  align-items: ${settings.alignItems};\n  flex-wrap: ${settings.flexWrap};\n  gap: ${settings.gap};\n}`;
}

function renderMission() {
  const level = levels[levelIndex];
  const solved = isSolved();

  nodes.score.textContent = `${completed.size}/${levels.length}`;
  nodes.missionLabel.textContent = `Mission ${levelIndex + 1}`;
  nodes.missionTitle.textContent = level.title;
  nodes.missionStory.textContent = level.story;
  nodes.missionHint.textContent = `提示：${level.hint}`;
  nodes.targetPanel.hidden = !showTarget;
  nodes.targetButton.textContent = showTarget ? '隱藏目標' : '顯示目標';
  nodes.nextButton.disabled = !solved;
  nodes.nextButton.textContent = levelIndex === levels.length - 1 ? '完成遊戲' : '下一關';
  nodes.status.textContent = solved ? '隊形正確！可以送出補給。' : '還差一點，調整控制面板讓左側隊形符合目標。';
  nodes.status.classList.toggle('status--success', solved);

  renderCargo(nodes.playerBay, level.cargo);
  renderCargo(nodes.targetBay, level.cargo);
  applyFlexStyles(nodes.playerBay, settings);
  applyFlexStyles(nodes.targetBay, level.target);
}

function goToLevel(index) {
  levelIndex = index;
  settings = { ...initialSettings };
  render();
}

function resetLevel() {
  settings = { ...initialSettings };
  render();
}

function completeLevel() {
  if (!isSolved()) return;
  completed.add(levelIndex);
  if (levelIndex < levels.length - 1) {
    goToLevel(levelIndex + 1);
  } else {
    render();
    nodes.status.textContent = '全任務完成！你已經掌握 Flexbox 補給站的核心技巧。';
  }
}

function render() {
  renderLevels();
  renderControls();
  renderCode();
  renderMission();
}

nodes.resetButton.addEventListener('click', resetLevel);
nodes.targetButton.addEventListener('click', () => {
  showTarget = !showTarget;
  render();
});
nodes.nextButton.addEventListener('click', completeLevel);

render();
