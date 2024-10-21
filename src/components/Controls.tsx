import { playbackRates } from "../constants/data";
import { formatDuration } from "../utils/formatDuration";
import ModalLayout from "./ModalLayout";
import BackIcon from "./icons/BackIcon";
import MaximizeIcon from "./icons/MaximizeIcon";
import MinimizeIcon from "./icons/MinimizeIcon";
import MuteIcon from "./icons/MuteIcon";
import NextIcon from "./icons/NextIcon";
import PauseIcon from "./icons/PauseIcon";
import PlayIcon from "./icons/PlayIcon";
import SettingsIcon from "./icons/SettingsIcon";
import SpeakerIcon from "./icons/SpeakerIcon";
import SubtitleIcon from "./icons/SubtitleIcon";

const Controls = ({
  playing,
  currentTime,
  totalTime,
  bufferedPercent,
  muted,
  volume,
  fullscreen,
  settingsModal,
  menus,
  availableQualities,
  currentQualityIndex,
  currentPlaybackRate,
  availableAudioNames,
  currentAudioId,
  timelineContainer,
  availableSubtitles,
  selectedSubtitleIndex,
  isSubtitleShown,
  canvasRef,
  isPreviewImgVisible,
  handlePlayPause,
  handleTimeUpdate,
  handleRewind,
  handleFastForward,
  toggleMute,
  handleVolumeChange,
  handleFullscreenChange,
  toggleSettingsMenu,
  handleChangeMenu,
  handleChangeQuality,
  handleChangePlaybackRate,
  handleAudioChange,
  handleMouseEnterPreview,
  handleMouseLeavePreview,
  handleSubtitleChange,
  toggleSubtitle,
}: {
  playing: boolean;
  currentTime: number;
  totalTime: number;
  bufferedPercent: number;
  muted: boolean;
  volume: number;
  fullscreen: boolean;
  settingsModal: boolean;
  menus: undefined | "quality" | "playbackRate" | "audio" | "subtitles";
  availableQualities: null | number[];
  currentQualityIndex: number;
  currentPlaybackRate: number;
  availableAudioNames:
    | {
        id: number;
        name: string;
      }[]
    | undefined;
  currentAudioId: number | undefined;
  timelineContainer: React.MutableRefObject<HTMLDivElement | null>;
  selectedSubtitleIndex: number;
  isSubtitleShown: boolean;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  isPreviewImgVisible: boolean;
  handlePlayPause: () => void;
  handleTimeUpdate: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  handleRewind: () => void;
  handleFastForward: () => void;
  toggleMute: () => void;
  handleVolumeChange: (e: React.FormEvent<HTMLInputElement>) => void;
  handleFullscreenChange: () => void;
  toggleSettingsMenu: () => void;
  handleChangeMenu: (
    value: "quality" | undefined | "playbackRate" | "audio" | "subtitles"
  ) => void;
  handleChangeQuality: (qualityIndex: number) => void;
  handleChangePlaybackRate: (rate: number) => void;
  handleAudioChange: (audioId: number) => void;
  handleMouseEnterPreview: () => void;
  handleMouseLeavePreview: () => void;
  handleSubtitleChange: (subtitleIndex: number) => void;
  availableSubtitles: string[] | undefined;
  toggleSubtitle: () => void;
}) => {
  const timelinePercent = currentTime / totalTime;

  return (
    <div className="group-hover/controls:opacity-100 opacity-0 transition-opacity ease-in-out">
      <div className="absolute top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center">
        <div className="flex items-center gap-[25px]">
          <button onClick={handleRewind}>
            <BackIcon />
          </button>

          <button onClick={handlePlayPause}>
            {playing ? (
              <PauseIcon width="40" height="40" />
            ) : (
              <PlayIcon width="40" height="40" />
            )}
          </button>

          <button onClick={handleFastForward}>
            <NextIcon />
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-50 flex flex-col gap-2 w-full p-3 text-white">
        <div className="flex items-center gap-2">
          <span className="text-[14px] block w-[40px] font-semibold">
            {currentTime === 0 ? "0:00" : formatDuration(currentTime)}
          </span>

          <div
            ref={timelineContainer}
            onMouseEnter={handleMouseEnterPreview}
            onMouseLeave={handleMouseLeavePreview}
            onMouseDown={(e) => handleTimeUpdate(e)}
            onMouseUp={(e) => handleTimeUpdate(e)}
            className="w-full relative h-[5px] bg-[#808080] rounded cursor-pointer group/preview"
          >
            <canvas
              ref={canvasRef}
              className={`h-[80px] aspect-video absolute bottom-[20px] -translate-x-[50%] ${
                isPreviewImgVisible ? "visible" : "invisible"
              }`}
            />

            <div
              className="bg-[#DEDEDE] h-full rounded absolute left-0"
              style={{
                width: `${bufferedPercent}%`,
              }}
            />

            <div
              className={`bg-red-600 h-full z-10 absolute left-0 rounded `}
              style={{
                width: `calc(${timelinePercent} * 100%)`,
              }}
            />

            <div
              className="-translate-x-[50%] w-[10px] h-[10px] rounded-full  bg-red-600 absolute -top-[50%] bottom-0 z-20"
              style={{
                left: `calc(${timelinePercent} * 100%)`,
              }}
            />
          </div>

          <span className="text-[14px] block font-semibold">
            {totalTime === 0 ? "0:00" : formatDuration(totalTime)}
          </span>
        </div>

        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={handlePlayPause}>
              {playing ? (
                <PauseIcon width="20" height="20" />
              ) : (
                <PlayIcon width="20" height="20" />
              )}
            </button>

            <div className="flex items-center justify-center gap-1 cursor-pointer rounded group/volume">
              <button onClick={toggleMute}>
                {muted ? <MuteIcon /> : <SpeakerIcon />}
              </button>

              <input
                type="range"
                className="w-0 h-[6px] origin-left scale-x-0 transition-all group-hover/volume:w-[100px] group-hover/volume:scale-x-100 cursor-pointer accent-red-600"
                value={volume}
                max={1}
                step="any"
                min={0}
                onInput={(e) => {
                  handleVolumeChange(e);
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleSubtitle}>
              <SubtitleIcon fillColor={isSubtitleShown ? "red" : undefined} />
            </button>

            <div className="relative">
              <button
                onClick={toggleSettingsMenu}
                className="flex items-center justify-center"
              >
                <SettingsIcon />
              </button>
            </div>

            <button onClick={handleFullscreenChange}>
              {fullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
            </button>
          </div>
        </div>
      </div>

      {settingsModal && (
        <ModalLayout>
          <div
            onClick={() => handleChangeMenu("quality")}
            className="border-[#797979] border-b-[0.3px] border-solid py-[17px] cursor-pointer"
          >
            <span className="text-[14px] font-normal">Качество</span>
          </div>

          <div
            onClick={() => handleChangeMenu("audio")}
            className="border-[#797979] border-b-[0.3px] border-solid py-[17px] cursor-pointer"
          >
            <span className="text-[14px] font-normal">Озвучка</span>
          </div>

          <div
            onClick={() => handleChangeMenu("playbackRate")}
            className="border-[#797979] border-b-[0.3px] border-solid py-[17px] cursor-pointer"
          >
            <span className="text-[14px] font-normal">
              Скорость воспроизведение
            </span>
          </div>

          <div
            onClick={() => handleChangeMenu("subtitles")}
            className="border-[#797979] border-b-[0.3px] border-solid py-[17px] cursor-pointer"
          >
            <span className="text-[14px] font-normal">Субтитры</span>
          </div>
        </ModalLayout>
      )}

      {menus && (
        <ModalLayout>
          {menus === "quality" && (
            <>
              {availableQualities?.map((quality, index) => (
                <div
                  key={quality + index}
                  onClick={() => handleChangeQuality(index)}
                  className={`border-[#797979] border-b-[0.3px] border-solid py-[17px] cursor-pointer ${
                    currentQualityIndex === index && "text-red-500"
                  }`}
                >
                  <span className="text-[14px] font-normal">{quality}p</span>
                </div>
              ))}

              <div
                onClick={() => handleChangeQuality(-1)}
                className={`border-[#797979] border-b-[0.3px] border-solid py-[17px] cursor-pointer ${
                  currentQualityIndex === -1 && "text-red-500"
                }`}
              >
                <span className="text-[14px] font-normal">Авто</span>
              </div>
            </>
          )}

          {menus === "playbackRate" && (
            <>
              {playbackRates.map((rate, index) => (
                <div
                  key={rate + index}
                  onClick={() => handleChangePlaybackRate(rate)}
                  className={`border-[#797979] border-b-[0.3px] border-solid py-[17px] cursor-pointer ${
                    currentPlaybackRate === rate && "text-red-500"
                  }`}
                >
                  <span className="text-[14px] font-normal">{rate}x</span>
                </div>
              ))}
            </>
          )}

          {menus === "audio" && (
            <>
              {availableAudioNames?.map((audio) => (
                <div
                  key={audio.id}
                  onClick={() => handleAudioChange(audio.id)}
                  className={`border-[#797979] border-b-[0.3px] border-solid py-[17px] cursor-pointer ${
                    currentAudioId === audio.id && "text-red-500"
                  }`}
                >
                  <span className="text-[14px] font-normal">{audio.name}</span>
                </div>
              ))}
            </>
          )}

          {menus === "subtitles" && (
            <>
              {availableSubtitles?.map((sub, index) => (
                <div
                  key={sub + index}
                  onClick={() => handleSubtitleChange(index)}
                  className={`border-[#797979] border-b-[0.3px] border-solid py-[17px] cursor-pointer ${
                    selectedSubtitleIndex === index && "text-red-500"
                  }`}
                >
                  <span className="text-[14px] font-normal">{sub}</span>
                </div>
              ))}
            </>
          )}
        </ModalLayout>
      )}
    </div>
  );
};

export default Controls;
