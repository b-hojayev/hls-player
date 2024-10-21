import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
import Controls from "./components/Controls";

type playerStateType = {
  playing: boolean;
  currentTime: number;
  totalTime: number;
  bufferedPercent: number;
  availableQualities: null | number[];
  muted: boolean;
  volume: number;
  fullscreen: boolean;
  settingsModal: boolean;
  menus: undefined | "quality" | "playbackRate" | "audio" | "subtitles";
  currentQualityIndex: number;
  currentPlaybackRate: number;
  availableAudioNames:
    | {
        id: number;
        name: string;
      }[]
    | undefined;
  currentAudioId: undefined | number;
  isPreviewImgVisible: boolean;
  availableSubtitles: undefined | string[];
  selectedSubtitleIndex: number;
  isSubtitleShown: boolean;
};

var videoSrc =
  "http://sample.vodobox.com/planete_interdite/planete_interdite_alternate.m3u8";

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const videoContainer = useRef<HTMLDivElement | null>(null);
  const timelineContainer = useRef<HTMLDivElement | null>(null);

  const isScrubbing = useRef<boolean>(false);

  const hlsRef = useRef<Hls | null>(null);
  const previewHlsRef = useRef<Hls | null>(null);

  const [playerState, setPlayerState] = useState<playerStateType>({
    playing: false,
    currentTime: 0,
    totalTime: 0,
    bufferedPercent: 0,
    availableQualities: null,
    currentQualityIndex: -1,
    muted: false,
    volume: 1,
    fullscreen: false,
    settingsModal: false,
    menus: undefined,
    currentPlaybackRate: 1,
    availableAudioNames: undefined,
    currentAudioId: undefined,
    isPreviewImgVisible: false,
    availableSubtitles: undefined,
    selectedSubtitleIndex: -1,
    isSubtitleShown: false,
  });

  useEffect(() => {
    if (videoRef.current) {
      const hls = new Hls();
      const previewHls = new Hls();

      hlsRef.current = hls;
      previewHlsRef.current = previewHls;

      if (Hls.isSupported()) {
        hls.on(Hls.Events.MEDIA_ATTACHED, function (_, data) {
          setPlayerState((prev) => ({
            ...prev,
            totalTime: data.media.duration,
          }));
        });

        previewHls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          previewHls.currentLevel = data.levels[0].id;
        });

        hls.on(Hls.Events.MANIFEST_PARSED, function (_, data) {
          let audioIds: number[] = [];
          let audioNames: string[] = [];
          const subtitleNames: string[] = data.subtitleTracks.map(
            (sub) => sub.name
          );

          const filteredAudios = data.audioTracks.filter((audio) => {
            if (!audioIds.includes(audio.id)) {
              audioIds.push(audio.id);
              audioNames.push(audio.name);
              return audio;
            }
          });

          filteredAudios.map((audio) => {
            if (audio.default) {
              setPlayerState((prev) => ({ ...prev, currentAudioId: audio.id }));
            }
          });

          const levelHeights = data.levels.map((level) => level.height);
          setPlayerState((prev) => ({
            ...prev,
            availableQualities: levelHeights,
            availableAudioNames: filteredAudios,
            availableSubtitles: subtitleNames,
            selectedSubtitleIndex: data.subtitleTracks[0]?.id,
          }));
        });

        hls.on(Hls.Events.AUDIO_TRACK_SWITCHING, (_, data) => {
          if (data.id !== playerState.currentAudioId) {
            setPlayerState((prev) => ({ ...prev, currentAudioId: data.id }));
          }
        });

        hls.on(Hls.Events.BUFFER_APPENDED, () => {
          if (videoRef.current) {
            const bufferedRanges = videoRef.current.buffered;
            const duration = videoRef.current.duration;

            if (duration > 0) {
              let buffered = 0;

              for (let i = 0; i < bufferedRanges.length; i++) {
                buffered += bufferedRanges.end(i) - bufferedRanges.start(i);
              }

              const bufferedPercentage = (buffered / duration) * 100;

              setPlayerState((prev) => ({
                ...prev,
                bufferedPercent: bufferedPercentage,
              }));
            }
          }
        });

        hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, (_, data) => {
          if (data.id !== -1) {
            setPlayerState((prev) => ({
              ...prev,
              selectedSubtitleIndex: data.id,
            }));
          }
        });

        hls.loadSource(videoSrc);
        hls.attachMedia(videoRef.current);

        previewHls.loadSource(videoSrc);
        if (previewVideoRef.current)
          previewHls.attachMedia(previewVideoRef.current);
      } else if (
        videoRef.current.canPlayType("application/vnd.apple.mpegurl")
      ) {
        videoRef.current.src = videoSrc;
      }

      return () => {
        hls.destroy();
        previewHls.destroy();
      };
    }
  }, []);

  useEffect(() => {
    const handlePlay = () => {
      setPlayerState((prev) => ({ ...prev, playing: true }));
    };
    const handlePause = () => {
      setPlayerState((prev) => ({ ...prev, playing: false }));
    };

    if (videoRef.current) {
      videoRef.current.addEventListener("play", handlePlay);
      videoRef.current.addEventListener("pause", handlePause);
    }

    return () => {
      videoRef.current?.removeEventListener("play", handlePlay);
      videoRef.current?.removeEventListener("pause", handlePause);
    };
  }, []);

  useEffect(() => {
    const timeUpdate = (timeInSeconds: number) => {
      setPlayerState((prev) => ({
        ...prev,
        currentTime: timeInSeconds,
      }));
    };

    const videoEl = videoRef.current;

    if (videoEl) {
      videoEl.addEventListener("timeupdate", () =>
        timeUpdate(videoEl.currentTime)
      );
    }

    return () => {
      videoEl?.removeEventListener("timeupdate", () =>
        timeUpdate(videoEl.currentTime)
      );
    };
  }, []);

  useEffect(() => {
    const videoEl = videoRef.current;

    if (videoEl) {
      const changeVolume = () => {
        if (videoEl.muted || videoEl.volume === 0) {
          setPlayerState((prev) => ({
            ...prev,
            volume: 0,
            muted: true,
          }));
        } else {
          setPlayerState((prev) => ({
            ...prev,
            muted: false,
            volume: videoEl.volume,
          }));
        }
      };

      videoEl.addEventListener("volumechange", changeVolume);

      return () => {
        videoEl.removeEventListener("volumechange", changeVolume);
      };
    }
  }, []);

  useEffect(() => {
    const changeFullscreen = () => {
      setPlayerState((prev) => ({
        ...prev,
        fullscreen: document.fullscreenElement !== null,
      }));
    };

    document.addEventListener("fullscreenchange", changeFullscreen);

    return () => {
      document.removeEventListener("fullscreenchange", changeFullscreen);
    };
  }, []);

  useEffect(() => {
    const mouseUpMove = (e: any) => {
      if (isScrubbing.current) {
        handleTimeUpdate(e);
      }
    };

    const mouseMove = (e: any) => {
      if (isScrubbing.current) {
        handleTimeUpdate(e);
        getPreviewImage(e);
      }

      getPreviewImage(e);
    };

    if (timelineContainer.current) {
      timelineContainer.current.addEventListener("mousemove", mouseMove);
    }

    document.addEventListener("mousemove", mouseUpMove);
    document.addEventListener("mouseup", mouseUpMove);

    return () => {
      document.removeEventListener("mousemove", mouseUpMove);
      document.removeEventListener("mouseup", mouseUpMove);

      if (timelineContainer.current) {
        timelineContainer.current.removeEventListener("mousemove", mouseMove);
      }
    };
  }, []);

  useEffect(() => {
    const keyDown = (e: any) => {
      const tagName = document.activeElement?.tagName.toLowerCase();

      switch (e.key.toLowerCase()) {
        case " ":
          if (tagName === "button") return;
          handlePlayPause();
          break;
        case "k":
          handlePlayPause();
          break;
        case "f":
          handleFullscreenChange();
          break;
        case "m":
          toggleMute();
          break;
        case "arrowleft":
        case "j":
          handleRewind();
          break;
        case "arrowright":
        case "l":
          handleFastForward();
          break;
        case "c":
          toggleSubtitle();
          break;
      }
    };

    document.addEventListener("keydown", keyDown);

    return () => {
      document.removeEventListener("keydown", keyDown);
    };
  }, []);

  const handlePlayPause = () => {
    const videoEl = videoRef.current;

    if (videoEl) {
      videoEl.paused ? videoEl.play() : videoEl.pause();
    }
  };

  const handleTimeUpdate = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (videoRef.current && timelineContainer.current) {
      isScrubbing.current = e.buttons === 1;

      const rect = timelineContainer.current.getBoundingClientRect();
      const percent =
        Math.min(Math.max(0, e.clientX - rect.x), rect.width) / rect.width;
      const nextCurrentTime = percent * videoRef.current.duration;

      getPreviewImage(e);

      if (isScrubbing.current) {
        e.preventDefault();
        !videoRef.current.paused && videoRef.current.pause();

        setPlayerState((prev) => ({
          ...prev,
          currentTime: nextCurrentTime,
        }));
      }

      if (!isScrubbing.current) {
        videoRef.current.play();
        videoRef.current.currentTime = nextCurrentTime;
      }
    }
  };

  const getPreviewImage = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (timelineContainer.current && videoRef.current) {
      const rect = timelineContainer.current.getBoundingClientRect();
      const percent =
        Math.min(Math.max(0, e.clientX - rect.x), rect.width) / rect.width;
      const nextCurrentTime = percent * videoRef.current.duration;

      const previewVideo = previewVideoRef.current;
      const canvas = canvasRef.current;

      if (previewVideo && canvas) {
        previewVideo.currentTime = nextCurrentTime;
        canvas.style.left = `calc(${
          nextCurrentTime / videoRef.current.duration
        } * 100%)`;

        previewVideo.onseeked = () => {
          canvas.width = previewVideo.videoWidth;
          canvas.height = previewVideo.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx && ctx.drawImage(previewVideo, 0, 0, canvas.width, canvas.height);
        };
      }
    }
  };

  const handleRewind = () => {
    if (videoRef.current) {
      videoRef.current.currentTime -= 10;
    }
  };

  const handleFastForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime += 10;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (videoRef.current.muted) videoRef.current.volume = 1;

      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  const handleVolumeChange = (e: React.FormEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      videoRef.current.volume = +e.currentTarget.value;
      videoRef.current.muted = +e.currentTarget.value === 0;
    }
  };

  const handleFullscreenChange = () => {
    if (document.fullscreenElement === null) {
      videoContainer?.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const toggleSettingsMenu = () => {
    setPlayerState((prev) => ({
      ...prev,
      settingsModal: !prev.settingsModal,
      menus: undefined,
    }));
  };

  const handleChangeMenu = (
    value: "quality" | undefined | "playbackRate" | "audio" | "subtitles"
  ) => {
    setPlayerState((prev) => ({ ...prev, menus: value, settingsModal: false }));
  };

  const handleChangeQuality = (qualityIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.nextLevel = qualityIndex;

      setPlayerState((prev) => ({
        ...prev,
        currentQualityIndex: qualityIndex,
      }));
    }
  };

  const handleChangePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlayerState((prev) => ({ ...prev, currentPlaybackRate: rate }));
    }
  };

  const handleAudioChange = (audioId: number) => {
    if (hlsRef.current) {
      hlsRef.current.audioTrack = audioId;
    }
  };

  const handleMouseEnterPreview = () => {
    setPlayerState((prev) => ({ ...prev, isPreviewImgVisible: true }));
  };

  const handleMouseLeavePreview = () => {
    setPlayerState((prev) => ({ ...prev, isPreviewImgVisible: false }));
  };

  const handleSubtitleChange = (subtitleIndex: number) => {
    if (hlsRef.current) {
      if (playerState.isSubtitleShown) {
        hlsRef.current.subtitleTrack = subtitleIndex;
      } else {
        setPlayerState((prev) => ({
          ...prev,
          selectedSubtitleIndex: subtitleIndex,
        }));
      }
    }
  };

  const toggleSubtitle = () => {
    if (hlsRef.current) {
      hlsRef.current.subtitleTrack = playerState.isSubtitleShown
        ? -1
        : playerState.selectedSubtitleIndex;
      setPlayerState((prev) => ({
        ...prev,
        isSubtitleShown: !prev.isSubtitleShown,
      }));
    }
  };

  return (
    <main className="w-full min-h-screen flex items-center justify-center">
      <div
        ref={videoContainer}
        className="relative w-full h-full max-w-[1000px] max-h-[700px] group/controls"
      >
        <Controls
          playing={playerState.playing}
          currentTime={playerState.currentTime}
          totalTime={playerState.totalTime}
          bufferedPercent={playerState.bufferedPercent}
          muted={playerState.muted}
          volume={playerState.volume}
          fullscreen={playerState.fullscreen}
          settingsModal={playerState.settingsModal}
          menus={playerState.menus}
          availableQualities={playerState.availableQualities}
          currentQualityIndex={playerState.currentQualityIndex}
          currentPlaybackRate={playerState.currentPlaybackRate}
          availableAudioNames={playerState.availableAudioNames}
          currentAudioId={playerState.currentAudioId}
          timelineContainer={timelineContainer}
          availableSubtitles={playerState.availableSubtitles}
          selectedSubtitleIndex={playerState.selectedSubtitleIndex}
          isSubtitleShown={playerState.isSubtitleShown}
          canvasRef={canvasRef}
          isPreviewImgVisible={playerState.isPreviewImgVisible}
          handlePlayPause={handlePlayPause}
          handleTimeUpdate={handleTimeUpdate}
          handleRewind={handleRewind}
          handleFastForward={handleFastForward}
          toggleMute={toggleMute}
          handleVolumeChange={handleVolumeChange}
          handleFullscreenChange={handleFullscreenChange}
          toggleSettingsMenu={toggleSettingsMenu}
          handleChangeMenu={handleChangeMenu}
          handleChangeQuality={handleChangeQuality}
          handleChangePlaybackRate={handleChangePlaybackRate}
          handleAudioChange={handleAudioChange}
          handleMouseEnterPreview={handleMouseEnterPreview}
          handleMouseLeavePreview={handleMouseLeavePreview}
          handleSubtitleChange={handleSubtitleChange}
          toggleSubtitle={toggleSubtitle}
        />

        <video
          className="hidden"
          ref={previewVideoRef}
          controls={false}
        ></video>

        <video
          className="w-full h-full"
          ref={videoRef}
          controls={false}
        ></video>
      </div>
    </main>
  );
}

export default App;
