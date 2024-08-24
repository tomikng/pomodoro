let timer = null;
let timeLeft = 0;
let isRunning = false;
let currentSession = 1;
let isBreak = false;
let isLongBreak = false;

let focusTime = 25 * 60; // 25 minutes
let shortBreakTime = 5 * 60; // 5 minutes
let longBreakTime = 15 * 60; // 15 minutes

self.onmessage = function(e) {
  switch (e.data.type) {
    case 'START':
      if (!isRunning) {
        isRunning = true;
        startTimer();
      }
      break;
    case 'PAUSE':
      if (isRunning) {
        clearInterval(timer);
        isRunning = false;
      }
      break;
    case 'RESET':
      resetTimer();
      break;
    case 'SET_TIME':
      if (e.data.payload.timeLeft !== undefined) {
        timeLeft = e.data.payload.timeLeft;
      } else {
        setTimerDurations(e.data.payload);
      }
      self.postMessage({ type: 'TICK', payload: { timeLeft, currentSession, isBreak, isLongBreak } });
      break;
    case 'SKIP':
      skipCurrentSession();
      break;
  }
};

function startTimer() {
  timer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      self.postMessage({ type: 'TICK', payload: { timeLeft, currentSession, isBreak, isLongBreak } });
    } else {
      clearInterval(timer);
      isRunning = false;
      self.postMessage({ type: 'FINISHED', payload: { currentSession, isBreak, isLongBreak } });
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  currentSession = 1;
  isBreak = false;
  isLongBreak = false;
  timeLeft = focusTime;
  self.postMessage({ type: 'TICK', payload: { timeLeft, currentSession, isBreak, isLongBreak } });
}

function setTimerDurations({ focus, shortBreak, longBreak }) {
  focusTime = focus * 60;
  shortBreakTime = shortBreak * 60;
  longBreakTime = longBreak * 60;

  if (!isRunning) {
    timeLeft = isBreak ? (isLongBreak ? longBreakTime : shortBreakTime) : focusTime;
  }
}

function moveToNextSession() {
  if (isBreak) {
    if (isLongBreak) {
      currentSession = 1;
      isLongBreak = false;
    } else {
      currentSession++;
    }
    isBreak = false;
    timeLeft = focusTime;
  } else {
    isBreak = true;
    if (currentSession === 4) {
      isLongBreak = true;
      timeLeft = longBreakTime;
    } else {
      timeLeft = shortBreakTime;
    }
  }
  self.postMessage({ type: 'TICK', payload: { timeLeft, currentSession, isBreak, isLongBreak } });
}

function skipCurrentSession() {
  clearInterval(timer);
  isRunning = false;
  moveToNextSession();
  self.postMessage({ type: 'SKIPPED', payload: { timeLeft, currentSession, isBreak, isLongBreak } });
}
