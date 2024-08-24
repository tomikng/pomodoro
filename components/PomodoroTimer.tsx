'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { gsap } from 'gsap'

type WorkerMessage = {
  type: 'START' | 'PAUSE' | 'RESET' | 'SET_TIME' | 'SKIP'
  payload?: {
    focus?: number
    shortBreak?: number
    longBreak?: number
    timeLeft?: number
  }
}

type WorkerResponse = {
  type: 'TICK' | 'FINISHED' | 'SKIPPED'
  payload: {
    timeLeft: number
    currentSession: number
    isBreak: boolean
    isLongBreak: boolean
  }
}

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [sessionTime, setSessionTime] = useState(25)
  const [breakTime, setBreakTime] = useState(5)
  const [longBreakTime, setLongBreakTime] = useState(15)
  const [currentSession, setCurrentSession] = useState(1)
  const [isBreak, setIsBreak] = useState(false)
  const [isLongBreak, setIsLongBreak] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [showSkipSessionConfirmation, setShowSkipSessionConfirmation] =
    useState(false)
  const [trackProgress, setTrackProgress] = useState(false)
  const [notificationsPermission, setNotificationsPermission] = useState(false)

  const workerRef = useRef<Worker | null>(null)
  const timerRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<HTMLDivElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const playNotificationSound = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)()
    }

    const context = audioContextRef.current
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(context.destination)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(330, context.currentTime) // E4 note
    gainNode.gain.setValueAtTime(0, context.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.1)
    gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 1.5)

    oscillator.start(context.currentTime)
    oscillator.stop(context.currentTime + 1.5)
  }, [])

  const handleWorkerMessage = useCallback(
    (event: MessageEvent<WorkerResponse>) => {
      const { type, payload } = event.data
      switch (type) {
        case 'TICK':
          setTimeLeft(payload.timeLeft)
          setCurrentSession(payload.currentSession)
          setIsBreak(payload.isBreak)
          setIsLongBreak(payload.isLongBreak)
          break
        case 'FINISHED':
          setIsRunning(false)
          setIsPaused(false)
          setShowAlert(true)
          playNotificationSound()
          break
        case 'SKIPPED':
          setTimeLeft(payload.timeLeft)
          setCurrentSession(payload.currentSession)
          setIsBreak(payload.isBreak)
          setIsLongBreak(payload.isLongBreak)
          setIsRunning(false)
          setIsPaused(false)
          break
      }
    },
    [playNotificationSound]
  )

  useEffect(() => {
    workerRef.current = new Worker('/timerWorker.js')
    workerRef.current.onmessage = handleWorkerMessage as (
      event: MessageEvent<WorkerResponse>
    ) => void

    return () => {
      workerRef.current?.terminate()
    }
  }, [handleWorkerMessage])

  useEffect(() => {
    if (workerRef.current) {
      const message: WorkerMessage = {
        type: 'SET_TIME',
        payload: {
          focus: sessionTime,
          shortBreak: breakTime,
          longBreak: longBreakTime,
        },
      }
      workerRef.current.postMessage(message)
    }
  }, [sessionTime, breakTime, longBreakTime])

  const toggleTimer = () => {
    if (isRunning && !isPaused) {
      workerRef.current?.postMessage({ type: 'PAUSE' } as WorkerMessage)
      setIsPaused(true)
    } else {
      workerRef.current?.postMessage({ type: 'START' } as WorkerMessage)
      setIsRunning(true)
      setIsPaused(false)
    }
  }

  const resetTimer = () => {
    workerRef.current?.postMessage({ type: 'RESET' } as WorkerMessage)
    setIsRunning(false)
    setIsPaused(false)
  }

  const handleSkipSession = () => {
    if (isBreak) {
      confirmSkipSession()
    } else {
      setShowSkipSessionConfirmation(true)
    }
  }

  const confirmSkipSession = () => {
    workerRef.current?.postMessage({ type: 'SKIP' } as WorkerMessage)
    setShowSkipSessionConfirmation(false)
  }

  const handleSessionTimeChange = (value: number | string) => {
    setSessionTime(Number(value))
  }

  const handleBreakTimeChange = (value: number | string) => {
    setBreakTime(Number(value))
  }

  const handleLongBreakTimeChange = (value: number | string) => {
    setLongBreakTime(Number(value))
  }

  const calculateProgress = (): number => {
    const totalTime = isBreak
      ? isLongBreak
        ? longBreakTime
        : breakTime
      : sessionTime
    return ((totalTime * 60 - timeLeft) / (totalTime * 60)) * 100
  }

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const getDotColor = (index: number): string => {
    if (index > currentSession - 1) {
      return 'bg-gray-300'
    } else if (index === currentSession - 1) {
      return isBreak ? 'bg-gray-400' : 'bg-gray-500'
    }
    return 'bg-gray-600'
  }

  const handleFinishSession = () => {
    setShowAlert(false)
    toggleTimer()
  }

  const handleAddFiveMinutes = () => {
    const additionalTime = 5 * 60

    if (isBreak) {
      const newBreakTime = timeLeft + additionalTime
      workerRef.current?.postMessage({
        type: 'SET_TIME',
        payload: { timeLeft: newBreakTime },
      } as WorkerMessage)
      setTimeLeft(newBreakTime)
    } else {
      const newFocusTime = timeLeft + additionalTime
      workerRef.current?.postMessage({
        type: 'SET_TIME',
        payload: { timeLeft: newFocusTime },
      } as WorkerMessage)
      setTimeLeft(newFocusTime)
    }

    setIsRunning(true)
    setShowAlert(false)
    workerRef.current?.postMessage({
      type: 'START',
    } as WorkerMessage)
  }

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsPermission(Notification.permission === 'granted')
    }
  }, [])

  useEffect(() => {
    if (showAlert && notificationsPermission) {
      new Notification(isBreak ? 'Break Finished' : 'Session Finished', {
        body: isBreak ? 'Time to focus!' : 'Time for a break!',
      })
    }
  }, [showAlert, isBreak, notificationsPermission])

  useEffect(() => {
    if (timerRef.current) {
      gsap.to(timerRef.current, {
        duration: 0.5,
        scale: isRunning ? 1.1 : 1,
        ease: 'power2.out',
      })
    }
  }, [isRunning])

  useEffect(() => {
    if (dotsRef.current) {
      gsap.to(dotsRef.current.children, {
        duration: 0.5,
        scale: 1.2,
        stagger: 0.1,
        repeat: 1,
        yoyo: true,
        ease: 'power2.out',
      })
    }
  }, [currentSession])

  // New useEffect for updating the document title
  useEffect(() => {
    document.title = `${formatTime(timeLeft)} - ${isBreak ? 'Break' : 'Focus'}`
  }, [timeLeft, isBreak])

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8 bg-white rounded-xl shadow-lg">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {isBreak ? 'Break Time' : 'Focus Time'}
        </h2>
        <div
          ref={timerRef}
          className="text-5xl md:text-6xl font-bold mb-4 md:mb-6"
        >
          {formatTime(timeLeft)}
        </div>
        <Progress
          value={calculateProgress()}
          className="w-full h-3 md:h-4 mb-4 md:mb-6"
        />
        <div ref={dotsRef} className="flex justify-center space-x-2 mb-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 md:w-5 md:h-5 rounded-full ${getDotColor(i)}`}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <Button
          onClick={toggleTimer}
          className="px-6 py-2 md:px-8 md:py-3 text-base md:text-lg"
        >
          {isRunning && !isPaused ? 'Pause' : 'Start'}
        </Button>
        <Button
          onClick={resetTimer}
          className="px-6 py-2 md:px-8 md:py-3 text-base md:text-lg"
        >
          Reset
        </Button>
        <Button
          onClick={handleSkipSession}
          className="px-6 py-2 md:px-8 md:py-3 text-base md:text-lg"
        >
          {isBreak ? 'Skip Break' : 'Skip Session'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div>
          <Label htmlFor="sessionTime" className="mb-2 block">
            Focus Time (minutes)
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              id="sessionTime"
              type="number"
              value={sessionTime}
              onChange={(e) => handleSessionTimeChange(e.target.value)}
              onBlur={(e) => handleSessionTimeChange(e.target.value)}
              min={1}
              max={60}
              className="w-16 md:w-20"
              disabled={isRunning}
            />
            <Slider
              min={1}
              max={60}
              step={1}
              value={[sessionTime]}
              onValueChange={(value) => handleSessionTimeChange(value[0])}
              className="flex-grow"
              disabled={isRunning}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="breakTime" className="mb-2 block">
            Break Time (minutes)
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              id="breakTime"
              type="number"
              value={breakTime}
              onChange={(e) => handleBreakTimeChange(e.target.value)}
              onBlur={(e) => handleBreakTimeChange(e.target.value)}
              min={1}
              max={30}
              className="w-16 md:w-20"
              disabled={isRunning}
            />
            <Slider
              min={1}
              max={30}
              step={1}
              value={[breakTime]}
              onValueChange={(value) => handleBreakTimeChange(value[0])}
              className="flex-grow"
              disabled={isRunning}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="longBreakTime" className="mb-2 block">
            Long Break Time (minutes)
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              id="longBreakTime"
              type="number"
              value={longBreakTime}
              onChange={(e) => handleLongBreakTimeChange(e.target.value)}
              onBlur={(e) => handleLongBreakTimeChange(e.target.value)}
              min={1}
              max={60}
              className="w-16 md:w-20"
              disabled={isRunning}
            />
            <Slider
              min={1}
              max={60}
              step={1}
              value={[longBreakTime]}
              onValueChange={(value) => handleLongBreakTimeChange(value[0])}
              className="flex-grow"
              disabled={isRunning}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="track-progress"
          checked={trackProgress}
          disabled={true}
          onCheckedChange={setTrackProgress}
        />
        <Label htmlFor="track-progress" className="text-sm md:text-base">
          Track Progress (In development)
        </Label>
      </div>

      {/*<Alert>*/}
      {/*  <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />*/}
      {/*  <AlertTitle className="text-sm md:text-base">*/}
      {/*    Local Storage Only*/}
      {/*  </AlertTitle>*/}
      {/*  <AlertDescription className="text-xs md:text-sm">*/}
      {/*    Currently, all progress is stored locally in your browser. Your data*/}
      {/*    will be lost if you clear your browser data.*/}
      {/*  </AlertDescription>*/}
      {/*</Alert>*/}

      {/*<ImprovedStatistics*/}
      {/*  totalFocusTime={formatTime(totalFocusTime)}*/}
      {/*  totalBreakTime={formatTime(totalBreakTime)}*/}
      {/*  totalLongBreakTime={formatTime(totalLongBreakTime)}*/}
      {/*/>*/}

      {/*<div className="text-center text-lg md:text-xl font-semibold">*/}
      {/*  Sessions completed: {sessionCount}*/}
      {/*</div>*/}

      <Dialog open={showAlert} onOpenChange={setShowAlert}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isBreak ? 'Break Finished' : 'Session Finished'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {isBreak
              ? 'Your break time is over. Ready to focus again?'
              : "Great job! You've completed a focus session. Time for a break?"}
          </div>
          <DialogFooter className="sm:justify-start">
            <Button onClick={handleAddFiveMinutes}>Add 5 Minutes</Button>
            <Button onClick={handleFinishSession}>
              {isBreak ? 'Start Focus Session' : 'Start Break'}
            </Button>
            <Button onClick={handleSkipSession}>
              {isBreak ? 'Skip Break' : 'Skip Session'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showSkipSessionConfirmation}
        onOpenChange={setShowSkipSessionConfirmation}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Skip Session Confirmation</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to skip this focus session? Or are you just
            feeling lazy?
          </div>
          <DialogFooter className="sm:justify-start">
            <Button onClick={() => setShowSkipSessionConfirmation(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSkipSession}>Yes, Skip Session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
