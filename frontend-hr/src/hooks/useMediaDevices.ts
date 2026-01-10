import { useState, useEffect, useCallback } from 'react';

interface MediaDeviceState {
  audioDevices: MediaDeviceInfo[];
  videoDevices: MediaDeviceInfo[];
  selectedAudio: string | null;
  selectedVideo: string | null;
  audioEnabled: boolean;
  videoEnabled: boolean;
  stream: MediaStream | null;
  error: string | null;
}

export function useMediaDevices() {
  const [state, setState] = useState<MediaDeviceState>({
    audioDevices: [],
    videoDevices: [],
    selectedAudio: null,
    selectedVideo: null,
    audioEnabled: true,
    videoEnabled: true,
    stream: null,
    error: null,
  });

  const enumerateDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter(d => d.kind === 'audioinput');
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      
      setState(prev => ({
        ...prev,
        audioDevices,
        videoDevices,
        selectedAudio: prev.selectedAudio || audioDevices[0]?.deviceId || null,
        selectedVideo: prev.selectedVideo || videoDevices[0]?.deviceId || null,
      }));
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Failed to enumerate devices' }));
    }
  }, []);

  const startStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: state.selectedAudio ? { deviceId: state.selectedAudio } : true,
        video: state.selectedVideo ? { deviceId: state.selectedVideo } : true,
      });
      setState(prev => ({ ...prev, stream, error: null }));
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Failed to access media devices' }));
    }
  }, [state.selectedAudio, state.selectedVideo]);

  const stopStream = useCallback(() => {
    state.stream?.getTracks().forEach(track => track.stop());
    setState(prev => ({ ...prev, stream: null }));
  }, [state.stream]);

  const toggleAudio = useCallback(() => {
    state.stream?.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    setState(prev => ({ ...prev, audioEnabled: !prev.audioEnabled }));
  }, [state.stream]);

  const toggleVideo = useCallback(() => {
    state.stream?.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    setState(prev => ({ ...prev, videoEnabled: !prev.videoEnabled }));
  }, [state.stream]);

  useEffect(() => {
    enumerateDevices();
    navigator.mediaDevices.addEventListener('devicechange', enumerateDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', enumerateDevices);
    };
  }, [enumerateDevices]);

  return {
    ...state,
    startStream,
    stopStream,
    toggleAudio,
    toggleVideo,
    enumerateDevices,
  };
}
