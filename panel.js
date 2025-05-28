function renderPanel() {}

function renderBotTools() {
  const botTools = document.getElementById('bot-tools');
  if (!botTools) return;
  botTools.innerHTML = '';
  const btnSpawn = document.createElement('button');
  btnSpawn.textContent = 'Spawn Human';
  btnSpawn.onclick = () => {
    if (window.currentTool) window.currentTool = 'spawn';
    document.getElementById('tool-spawn')?.click();
  };
  botTools.appendChild(btnSpawn);
}

document.addEventListener('DOMContentLoaded', () => {
  renderBotTools();
  renderPanel();
});
