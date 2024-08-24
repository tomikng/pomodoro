// public/timerWorker.js

let timer = null;
let timeLeft = 0;

self.onmessage = function(e) {
  console.log('Worker received message:', e.data);
  switch (e.data.type) {
    case 'START':
      console.log('Worker starting timer');
      if (timer === null) {
        timer = self.setInterval(() => {
          timeLeft--;
          console.log('Worker ticking, time left:', timeLeft);
          self.postMessage({ type: 'TICK' });
          if (timeLeft <= 0) {
            console.log('Timer finished');
            clearInterval(timer);
            timer = null;
          }
        }, 1000);
      }
      break;
    case 'PAUSE':
      console.log('Worker pausing timer');
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
      break;
    case 'RESET':
      console.log('Worker resetting timer');
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
      timeLeft = 0;
      break;
    case 'SET_TIME':
      console.log('Worker setting time to:', e.data.payload);
      timeLeft = e.data.payload || 0;
      break;
  }
};

console.log('Worker initialized');